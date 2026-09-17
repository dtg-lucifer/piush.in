import { NextResponse } from "next/server";
import { fetchGuestbookEntries } from "@/lib/cms/guestbook";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		// Fetch all current guestbook entries (Firestore prioritized + local fallback)
		const entries = await fetchGuestbookEntries("all");

		const jsonContent = JSON.stringify(entries, null, "\t");

		return new Response(jsonContent, {
			status: 200,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Content-Disposition": 'attachment; filename="guestbook.json"',
				"Cache-Control": "no-store, max-age=0",
			},
		});
	} catch (err) {
		console.error("Error generating guestbook JSON download:", err);
		return NextResponse.json(
			{ error: "Failed to generate guestbook JSON export" },
			{ status: 500 },
		);
	}
}
