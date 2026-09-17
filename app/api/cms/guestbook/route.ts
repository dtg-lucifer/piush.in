import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/cms/auth";
import {
	fetchGuestbookEntries,
	updateGuestbookEntryStatus,
	deleteGuestbookEntry,
	getGuestbookCounts,
} from "@/lib/cms/guestbook";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const session = await getCurrentSession();
	if (!session || !session.authenticated) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { searchParams } = new URL(request.url);
		const statusParam = searchParams.get("status") as "approved" | "pending" | "rejected" | "all" | null;
		const filter = statusParam || "all";

		const [entries, counts] = await Promise.all([
			fetchGuestbookEntries(filter),
			getGuestbookCounts(),
		]);

		return NextResponse.json({
			entries,
			counts,
		});
	} catch (error) {
		console.error("Error fetching guestbook for CMS:", error);
		return NextResponse.json({ error: "Failed to fetch guestbook entries" }, { status: 500 });
	}
}

export async function PATCH(request: Request) {
	const session = await getCurrentSession();
	if (!session || !session.authenticated) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { id, status } = body;

		if (!id || typeof id !== "string") {
			return NextResponse.json({ error: "Missing entry ID" }, { status: 400 });
		}

		if (!["approved", "rejected", "pending"].includes(status)) {
			return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
		}

		const success = await updateGuestbookEntryStatus(id, status);
		const counts = await getGuestbookCounts();

		return NextResponse.json({
			success,
			id,
			status,
			counts,
		});
	} catch (error) {
		console.error("Error updating guestbook status:", error);
		return NextResponse.json({ error: "Failed to update guestbook entry" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	const session = await getCurrentSession();
	if (!session || !session.authenticated) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { searchParams } = new URL(request.url);
		let id = searchParams.get("id");

		if (!id) {
			const body = await request.json().catch(() => ({}));
			id = body.id;
		}

		if (!id || typeof id !== "string") {
			return NextResponse.json({ error: "Missing entry ID to delete" }, { status: 400 });
		}

		const success = await deleteGuestbookEntry(id);
		const counts = await getGuestbookCounts();

		return NextResponse.json({
			success,
			deletedId: id,
			counts,
		});
	} catch (error) {
		console.error("Error deleting guestbook entry:", error);
		return NextResponse.json({ error: "Failed to delete guestbook entry" }, { status: 500 });
	}
}
