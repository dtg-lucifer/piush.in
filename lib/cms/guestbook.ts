import fs from "node:fs";
import path from "node:path";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
	deleteDoc,
	writeBatch,
	query,
	orderBy,
	where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/app/firebase";
import type { GuestbookEntry } from "./types";

const GUESTBOOK_FILE = path.join(process.cwd(), "public/guestbook/__data.json");

// Read local guestbook entries from disk
export function getLocalGuestbook(): GuestbookEntry[] {
	try {
		if (!fs.existsSync(GUESTBOOK_FILE)) {
			// Initialize with empty array if missing
			return [];
		}
		const raw = fs.readFileSync(GUESTBOOK_FILE, "utf8");
		const data = JSON.parse(raw);
		return Array.isArray(data) ? data : [];
	} catch (err) {
		console.error("Error reading local guestbook file:", err);
		return [];
	}
}

// Write local guestbook entries to disk
export function writeLocalGuestbook(entries: GuestbookEntry[]): void {
	try {
		const dir = path.dirname(GUESTBOOK_FILE);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(GUESTBOOK_FILE, JSON.stringify(entries, null, "\t"), "utf8");
	} catch (err) {
		console.warn("Could not write to local guestbook file (e.g. read-only filesystem):", err);
	}
}

// Sync guestbook array to Firestore (both portfolio/guestbook and individual documents)
export async function syncGuestbookToFirestore(entries: GuestbookEntry[]): Promise<boolean> {
	if (!isFirebaseConfigured() || !db) return false;
	try {
		// 1. Sync full guestbook array document to portfolio/guestbook
		await setDoc(
			doc(db, "portfolio", "guestbook"),
			{
				items: entries,
				updatedAt: new Date().toISOString(),
				source: "guestbook-sync",
			},
			{ merge: true },
		);

		// 2. Sync individual collection documents in batch (optional/best-effort based on security rules)
		try {
			const batch = writeBatch(db);
			entries.forEach((entry) => {
				if (entry.id) {
					batch.set(doc(db!, "guestbook", entry.id), entry, { merge: true });
				}
			});
			await batch.commit();
		} catch (bErr: unknown) {
			const err = bErr as { code?: string; message?: string };
			if (err?.code !== "permission-denied") {
				console.warn("Batch guestbook update warning:", bErr);
			}
		}

		console.log(`[Firestore] Successfully synchronized ${entries.length} guestbook entries in Firestore.`);
		return true;
	} catch (err) {
		console.warn("[Firestore] Failed to sync guestbook entries to Firestore:", err);
		return false;
	}
}

// Fetch guestbook entries from Firestore (with local fallback)
export async function fetchGuestbookEntries(
	filterStatus: "approved" | "pending" | "rejected" | "all" = "approved",
): Promise<GuestbookEntry[]> {
	let firestoreEntries: GuestbookEntry[] | null = null;

	if (isFirebaseConfigured() && db) {
		try {
			// 1. Primary: Query the guestbook collection directly (no composite index required)
			const guestbookCol = collection(db, "guestbook");
			const snapshot = await getDocs(guestbookCol);

			if (!snapshot.empty) {
				const loaded: GuestbookEntry[] = [];
				snapshot.forEach((docSnap) => {
					const data = docSnap.data();
					loaded.push({
						id: docSnap.id,
						userId: data.userId || "",
						userName: data.userName || "Anonymous",
						userHandle: data.userHandle || "",
						userAvatar: data.userAvatar || "",
						userEmail: data.userEmail || "",
						message: data.message || "",
						status: data.status || "pending",
						createdAt: data.createdAt || Date.now(),
						approvedAt: data.approvedAt,
						likes: Array.isArray(data.likes) ? data.likes : [],
					});
				});
				firestoreEntries = loaded;
			} else {
				// 2. Fallback: check portfolio/guestbook aggregated document if collection is empty
				const snap = await getDoc(doc(db, "portfolio", "guestbook"));
				if (snap.exists()) {
					const data = snap.data();
					if (Array.isArray(data.items) && data.items.length > 0) {
						firestoreEntries = data.items as GuestbookEntry[];
					}
				}
			}
		} catch (err) {
			console.warn("[Firestore] fetchGuestbookEntries error:", err);
		}

		// 3. Mirror Firestore entries into local public/guestbook/__data.json if writable
		if (firestoreEntries && firestoreEntries.length > 0) {
			try {
				writeLocalGuestbook(firestoreEntries);
			} catch (wErr) {
				console.warn("Could not mirror guestbook to local disk:", wErr);
			}
		}
	}

	// Fallback to local file if Firestore returned null or was unreachable
	const localEntries = getLocalGuestbook();
	const allEntries = firestoreEntries && firestoreEntries.length > 0 ? firestoreEntries : localEntries;

	// If Firestore is connected and collection was completely empty, seed it with local file entries
	if ((!firestoreEntries || firestoreEntries.length === 0) && localEntries.length > 0 && isFirebaseConfigured() && db) {
		syncGuestbookToFirestore(localEntries).catch((e) => console.warn("Background guestbook sync warning:", e));
	}

	const filtered =
		filterStatus === "all"
			? allEntries
			: allEntries.filter((e) => e.status === filterStatus);

	return filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

// Add a new guestbook entry (auto-approved by default for authenticated visitors)
export async function createGuestbookEntry(
	data: Omit<GuestbookEntry, "id" | "status" | "createdAt">,
): Promise<GuestbookEntry> {
	const id = `gb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
	const newEntry: GuestbookEntry = {
		id,
		userId: data.userId,
		userName: data.userName.trim() || "Anonymous",
		userHandle: data.userHandle?.trim() || "",
		userAvatar: data.userAvatar || "",
		userEmail: data.userEmail || "",
		message: data.message.trim(),
		status: "pending", // Always pending until manual approval by Piush in CMS
		createdAt: Date.now(),
	};

	// Save to local file if possible
	let updatedLocal: GuestbookEntry[] = [];
	try {
		const local = getLocalGuestbook();
		local.unshift(newEntry);
		writeLocalGuestbook(local);
		updatedLocal = local;
	} catch (err) {
		console.warn("Could not save to local guestbook file:", err);
		updatedLocal = [newEntry];
	}

	// Save to Firestore (both individual doc and aggregate collection)
	if (isFirebaseConfigured() && db) {
		try {
			const docRef = doc(db, "guestbook", id);
			await setDoc(docRef, newEntry);
			console.log(`[GuestBook] Saved new entry ${id} to Firestore (pending)`);

			// Also update aggregated portfolio/guestbook document
			const snap = await getDoc(doc(db, "portfolio", "guestbook")).catch(() => null);
			let currentItems: GuestbookEntry[] = [];
			if (snap && snap.exists() && Array.isArray(snap.data().items)) {
				currentItems = snap.data().items;
			}
			await setDoc(
				doc(db, "portfolio", "guestbook"),
				{
					items: [newEntry, ...currentItems.filter((item) => item.id !== id)],
					updatedAt: new Date().toISOString(),
				},
				{ merge: true },
			).catch((e) => console.warn("Could not update portfolio/guestbook doc:", e));
		} catch (err: unknown) {
			console.error("Firestore createGuestbookEntry error:", err);
			const fErr = err as { code?: string; message?: string };
			throw new Error(`Firestore save failed: ${fErr.code || fErr.message || "Unknown error"}`);
		}
	} else {
		console.warn("[GuestBook] Firebase not configured; entry saved only locally.");
	}

	return newEntry;
}

// Update status (e.g. approve or reject)
export async function updateGuestbookEntryStatus(
	id: string,
	status: "approved" | "rejected" | "pending",
): Promise<boolean> {
	let success = false;
	const updates: Partial<GuestbookEntry> = {
		status,
		...(status === "approved" ? { approvedAt: Date.now() } : {}),
	};

	// Update local file
	let updatedLocal: GuestbookEntry[] = [];
	try {
		const local = getLocalGuestbook();
		const idx = local.findIndex((e) => e.id === id);
		if (idx !== -1) {
			local[idx] = { ...local[idx], ...updates };
			writeLocalGuestbook(local);
			updatedLocal = local;
			success = true;
		}
	} catch (err) {
		console.warn("Could not update local guestbook file:", err);
	}

	// Update Firestore (individual doc and portfolio/guestbook)
	if (isFirebaseConfigured() && db) {
		try {
			const docRef = doc(db, "guestbook", id);
			await updateDoc(docRef, updates);
			success = true;
			console.log(`[GuestBook] Updated status of entry ${id} to "${status}" in Firestore`);
			if (updatedLocal.length > 0) {
				await syncGuestbookToFirestore(updatedLocal);
			}
		} catch (err) {
			console.warn("Firestore updateGuestbookEntryStatus error:", err);
		}
	}

	return success;
}

// Delete entry
export async function deleteGuestbookEntry(id: string): Promise<boolean> {
	let success = false;

	// Update local file
	let updatedLocal: GuestbookEntry[] = [];
	try {
		const local = getLocalGuestbook();
		const filtered = local.filter((e) => e.id !== id);
		writeLocalGuestbook(filtered);
		updatedLocal = filtered;
		success = true;
	} catch (err) {
		console.warn("Could not delete from local guestbook file:", err);
	}

	// Delete from Firestore
	if (isFirebaseConfigured() && db) {
		try {
			const docRef = doc(db, "guestbook", id);
			await deleteDoc(docRef);
			success = true;
			console.log(`[GuestBook] Deleted entry ${id} from Firestore`);
			if (updatedLocal.length > 0) {
				await syncGuestbookToFirestore(updatedLocal);
			}
		} catch (err) {
			console.warn("Firestore deleteGuestbookEntry error:", err);
		}
	}

	return success;
}

// Toggle like for a guestbook entry (add if not present, remove if present)
export async function toggleGuestbookLike(
	entryId: string,
	userId: string,
): Promise<{ likes: string[]; liked: boolean }> {
	// Read current state
	const local = getLocalGuestbook();
	const idx = local.findIndex((e) => e.id === entryId);

	let currentLikes: string[] = [];
	if (idx !== -1) {
		currentLikes = local[idx].likes || [];
	}

	const alreadyLiked = currentLikes.includes(userId);
	const updatedLikes = alreadyLiked
		? currentLikes.filter((id) => id !== userId)
		: [...currentLikes, userId];

	// Update local file
	if (idx !== -1) {
		local[idx] = { ...local[idx], likes: updatedLikes };
		try {
			writeLocalGuestbook(local);
		} catch (err) {
			console.warn("Could not update local guestbook likes:", err);
		}
	}

	// Update Firestore
	if (isFirebaseConfigured() && db) {
		try {
			const docRef = doc(db, "guestbook", entryId);
			await updateDoc(docRef, { likes: updatedLikes });
			console.log(`[GuestBook] Updated likes for entry ${entryId}: ${updatedLikes.length} likes`);
		} catch (err) {
			console.warn("Firestore toggleGuestbookLike error:", err);
		}
	}

	return { likes: updatedLikes, liked: !alreadyLiked };
}

// Get metrics / counts
export async function getGuestbookCounts(): Promise<{
	total: number;
	pending: number;
	approved: number;
	rejected: number;
}> {
	const all = await fetchGuestbookEntries("all");
	let pending = 0;
	let approved = 0;
	let rejected = 0;

	for (const e of all) {
		if (e.status === "pending") pending++;
		else if (e.status === "approved") approved++;
		else if (e.status === "rejected") rejected++;
	}

	return {
		total: all.length,
		pending,
		approved,
		rejected,
	};
}
