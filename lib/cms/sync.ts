import fs from "node:fs";
import path from "node:path";
import { doc, getDoc, setDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/app/firebase";
import type { ArticleMeta, Project, SyncStatus } from "./types";

import { getLocalGuestbook, syncGuestbookToFirestore } from "./guestbook";

const PROJECTS_FILE = path.join(process.cwd(), "public/projects/__data.json");
const ARTICLES_FILE = path.join(process.cwd(), "public/articles/__data.json");

export function getLocalProjects(): Project[] {
	try {
		if (!fs.existsSync(PROJECTS_FILE)) return [];
		const raw = fs.readFileSync(PROJECTS_FILE, "utf8");
		const data = JSON.parse(raw);
		return Array.isArray(data) ? data : [];
	} catch (err) {
		console.error("Error reading local projects file:", err);
		return [];
	}
}

export function writeLocalProjects(projects: Project[]): void {
	try {
		// Clean up projects before writing to public/projects/__data.json
		// ensure standard shape matching current __data.json
		const formatted = projects.map((p) => {
			const item: Record<string, unknown> = {
				name: p.name || "",
				description: p.description || "",
			};
			if (p.image) item.image = p.image;
			if (p.repoUrl) item.repoUrl = p.repoUrl;
			if (p.demoUrl) item.demoUrl = p.demoUrl;
			item.tags = Array.isArray(p.tags) ? p.tags : [];
			if (p.languages) item.languages = p.languages;
			item.wip = Boolean(p.wip);
			item.featured = Boolean(p.featured);
			return item;
		});

		fs.writeFileSync(PROJECTS_FILE, JSON.stringify(formatted, null, "\t"), "utf8");
	} catch (err) {
		console.error("Error writing local projects file:", err);
		throw err;
	}
}

export function getLocalArticles(): ArticleMeta[] {
	try {
		if (!fs.existsSync(ARTICLES_FILE)) return [];
		const raw = fs.readFileSync(ARTICLES_FILE, "utf8");
		const data = JSON.parse(raw);
		return Array.isArray(data) ? data : [];
	} catch (err) {
		console.error("Error reading local articles file:", err);
		return [];
	}
}

export function writeLocalArticles(articles: ArticleMeta[]): void {
	try {
		const formatted = articles.map((a) => {
			const item: Record<string, unknown> = {
				title: a.title || "",
				seoTitle: a.seoTitle || a.title || "",
				seoDescription: a.seoDescription || "",
				datePublished: a.datePublished || new Date().toISOString(),
				cuid: a.cuid || `cm${Date.now()}`,
				slug: a.slug || "",
				cover: a.cover || "",
				ogImage: a.ogImage || a.cover || "",
				tags: Array.isArray(a.tags) ? a.tags : [],
				content: a.content || "",
				featured: Boolean(a.featured),
			};
			return item;
		});

		fs.writeFileSync(ARTICLES_FILE, JSON.stringify(formatted, null, "\t"), "utf8");
	} catch (err) {
		console.error("Error writing local articles file:", err);
		throw err;
	}
}

let syncInProgress = false;

export async function syncLocalToFirestore(): Promise<{
	success: boolean;
	error?: string;
	syncedProjects?: number;
	syncedArticles?: number;
	syncedGuestbook?: number;
}> {
	if (syncInProgress) {
		return { success: true };
	}
	syncInProgress = true;

	try {
		const projects = getLocalProjects();
		const articles = getLocalArticles();
		const guestbook = getLocalGuestbook();

		if (isFirebaseConfigured() && db) {
			try {
				// 1. Sync whole projects array document
				await setDoc(
					doc(db, "portfolio", "projects"),
					{
						items: projects.map((p, idx) => ({ ...p, order: idx })),
						updatedAt: new Date().toISOString(),
						source: "local-sync",
					},
					{ merge: true },
				);

				// 2. Sync whole articles array document
				await setDoc(
					doc(db, "portfolio", "articles"),
					{
						items: articles.map((a, idx) => ({ ...a, order: idx })),
						updatedAt: new Date().toISOString(),
						source: "local-sync",
					},
					{ merge: true },
				);

				// 3. Sync whole guestbook array document & individual docs
				if (guestbook.length > 0) {
					await syncGuestbookToFirestore(guestbook);
				}

				// 4. Sync individual collection documents for fine-grained querying
				try {
					const batch = writeBatch(db);
					projects.forEach((proj, idx) => {
						const docId = (proj.name || `proj-${idx}`)
							.toLowerCase()
							.replace(/[^a-z0-9_-]/g, "_")
							.slice(0, 60);
						batch.set(
							doc(db!, "projects", docId),
							{
								...proj,
								order: idx,
								updatedAt: new Date().toISOString(),
							},
							{ merge: true },
						);
					});

					articles.forEach((art, idx) => {
						const docId = (art.slug || art.cuid || `art-${idx}`)
							.toLowerCase()
							.replace(/[^a-z0-9_-]/g, "_")
							.slice(0, 60);
						batch.set(
							doc(db!, "articles", docId),
							{
								...art,
								order: idx,
								updatedAt: new Date().toISOString(),
							},
							{ merge: true },
						);
					});

					guestbook.forEach((entry) => {
						if (entry.id) {
							batch.set(doc(db!, "guestbook", entry.id), entry, { merge: true });
						}
					});

					await batch.commit();
				} catch (batchErr) {
					console.warn("Firestore batch collection write skipped/fallback:", batchErr);
				}

				// 5. Update sync status tracker
				await setDoc(
					doc(db, "portfolio", "sync"),
					{
						lastSync: new Date().toISOString(),
						projectsCount: projects.length,
						articlesCount: articles.length,
						guestbookCount: guestbook.length,
					},
					{ merge: true },
				);

				return {
					success: true,
					syncedProjects: projects.length,
					syncedArticles: articles.length,
					syncedGuestbook: guestbook.length,
				};
			} catch (firestoreErr: unknown) {
				const msg = firestoreErr instanceof Error ? firestoreErr.message : String(firestoreErr);
				console.warn("Firestore sync error (proceeding with local files):", msg);
				return { success: false, error: msg };
			}
		}

		return {
			success: true,
			syncedProjects: projects.length,
			syncedArticles: articles.length,
			syncedGuestbook: guestbook.length,
		};
	} finally {
		syncInProgress = false;
	}
}

export async function fetchProjectsData(): Promise<Project[]> {
	if (isFirebaseConfigured() && db) {
		try {
			const snap = await getDoc(doc(db, "portfolio", "projects"));
			if (snap.exists()) {
				const data = snap.data();
				if (Array.isArray(data.items) && data.items.length > 0) {
					// Mirror Firestore data into local __data.json
					try {
						writeLocalProjects(data.items as Project[]);
						console.log(
							`[Mirror Sync] Successfully mirrored ${data.items.length} projects from Firestore into public/projects/__data.json`,
						);
					} catch (writeErr) {
						console.error(
							"[Mirror Sync] Failed to mirror Firestore projects into public/projects/__data.json:",
							writeErr,
						);
					}
					return data.items as Project[];
				}
			}
		} catch (err) {
			console.warn("Could not fetch projects from Firestore, falling back to local file:", err);
		}
	}
	return getLocalProjects();
}

export async function saveProjectsData(projects: Project[]): Promise<{
	success: boolean;
	firestoreUpdated: boolean;
	localUpdated: boolean;
	error?: string;
}> {
	let firestoreUpdated = false;
	let localUpdated = false;

	// 1. Update Firestore
	if (isFirebaseConfigured() && db) {
		try {
			await setDoc(
				doc(db, "portfolio", "projects"),
				{
					items: projects.map((p, idx) => ({ ...p, order: idx })),
					updatedAt: new Date().toISOString(),
					source: "cms-editor",
				},
				{ merge: true },
			);

			// Also update individual documents in projects collection
			try {
				const batch = writeBatch(db);
				projects.forEach((proj, idx) => {
					const docId = (proj.name || `proj-${idx}`)
						.toLowerCase()
						.replace(/[^a-z0-9_-]/g, "_")
						.slice(0, 60);
					batch.set(
						doc(db!, "projects", docId),
						{
							...proj,
							order: idx,
							updatedAt: new Date().toISOString(),
						},
						{ merge: true },
					);
				});
				await batch.commit();
			} catch (bErr) {
				console.warn("Batch project update warning:", bErr);
			}

			firestoreUpdated = true;
			console.log(`[Firestore] Successfully updated ${projects.length} projects in Firestore.`);
		} catch (fErr: unknown) {
			console.warn("[Firestore] Firestore project update failed:", fErr);
		}
	}

	// 2. Mirror update to local __data.json file
	try {
		writeLocalProjects(projects);
		localUpdated = true;
		console.log(
			`[Mirror Sync] Successfully mirrored ${projects.length} projects into public/projects/__data.json`,
		);
	} catch (lErr) {
		console.error("[Mirror Sync] Failed to mirror projects into public/projects/__data.json:", lErr);
	}

	return {
		success: firestoreUpdated || localUpdated,
		firestoreUpdated,
		localUpdated,
	};
}

export async function fetchArticlesData(): Promise<ArticleMeta[]> {
	if (isFirebaseConfigured() && db) {
		try {
			const snap = await getDoc(doc(db, "portfolio", "articles"));
			if (snap.exists()) {
				const data = snap.data();
				if (Array.isArray(data.items) && data.items.length > 0) {
					// Mirror Firestore data into local __data.json
					try {
						writeLocalArticles(data.items as ArticleMeta[]);
						console.log(
							`[Mirror Sync] Successfully mirrored ${data.items.length} articles from Firestore into public/articles/__data.json`,
						);
					} catch (writeErr) {
						console.error(
							"[Mirror Sync] Failed to mirror Firestore articles into public/articles/__data.json:",
							writeErr,
						);
					}
					return data.items as ArticleMeta[];
				}
			}
		} catch (err) {
			console.warn("Could not fetch articles from Firestore, falling back to local file:", err);
		}
	}
	return getLocalArticles();
}

export async function saveArticlesData(articles: ArticleMeta[]): Promise<{
	success: boolean;
	firestoreUpdated: boolean;
	localUpdated: boolean;
	error?: string;
}> {
	let firestoreUpdated = false;
	let localUpdated = false;

	// 1. Update Firestore
	if (isFirebaseConfigured() && db) {
		try {
			await setDoc(
				doc(db, "portfolio", "articles"),
				{
					items: articles.map((a, idx) => ({ ...a, order: idx })),
					updatedAt: new Date().toISOString(),
					source: "cms-editor",
				},
				{ merge: true },
			);

			try {
				const batch = writeBatch(db);
				articles.forEach((art, idx) => {
					const docId = (art.slug || art.cuid || `art-${idx}`)
						.toLowerCase()
						.replace(/[^a-z0-9_-]/g, "_")
						.slice(0, 60);
					batch.set(
						doc(db!, "articles", docId),
						{
							...art,
							order: idx,
							updatedAt: new Date().toISOString(),
						},
						{ merge: true },
					);
				});
				await batch.commit();
			} catch (bErr) {
				console.warn("Batch articles update warning:", bErr);
			}

			firestoreUpdated = true;
			console.log(`[Firestore] Successfully updated ${articles.length} articles in Firestore.`);
		} catch (fErr: unknown) {
			console.warn("[Firestore] Firestore article update failed:", fErr);
		}
	}

	// 2. Mirror update to local __data.json file
	try {
		writeLocalArticles(articles);
		localUpdated = true;
		console.log(
			`[Mirror Sync] Successfully mirrored ${articles.length} articles into public/articles/__data.json`,
		);
	} catch (lErr) {
		console.error("[Mirror Sync] Failed to mirror articles into public/articles/__data.json:", lErr);
	}

	return {
		success: firestoreUpdated || localUpdated,
		firestoreUpdated,
		localUpdated,
	};
}

export async function getSyncStatus(): Promise<SyncStatus> {
	const projects = getLocalProjects();
	const articles = getLocalArticles();
	const guestbook = getLocalGuestbook();
	let lastSync: string | null = null;
	let firestoreConnected = false;
	let error: string | null = null;

	if (isFirebaseConfigured() && db) {
		try {
			const snap = await getDoc(doc(db, "portfolio", "sync"));
			if (snap.exists()) {
				lastSync = snap.data().lastSync || null;
				firestoreConnected = true;
			} else {
				firestoreConnected = true;
			}
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : String(err);
		}
	}

	return {
		lastSync: lastSync || new Date().toISOString(),
		firestoreConnected,
		projectsCount: projects.length,
		articlesCount: articles.length,
		guestbookCount: guestbook.length,
		error,
	};
}
