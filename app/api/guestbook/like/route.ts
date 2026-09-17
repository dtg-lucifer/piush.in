import { NextResponse } from "next/server";
import { toggleGuestbookLike } from "@/lib/cms/guestbook";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { entryId, userId } = body;

		if (!entryId || typeof entryId !== "string") {
			return NextResponse.json({ error: "entryId is required." }, { status: 400 });
		}

		if (!userId || typeof userId !== "string") {
			return NextResponse.json(
				{ error: "You must be signed in with GitHub to like an entry." },
				{ status: 401 },
			);
		}

		const result = await toggleGuestbookLike(entryId, userId);

		return NextResponse.json({ success: true, ...result });
	} catch (error: unknown) {
		console.error("Error toggling guestbook like:", error);
		const err = error as { message?: string };
		return NextResponse.json(
			{ error: err?.message || "Failed to toggle like" },
			{ status: 500 },
		);
	}
}
