import { NextResponse } from "next/server";
import { fetchGuestbookEntries, createGuestbookEntry } from "@/lib/cms/guestbook";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const entries = await fetchGuestbookEntries("approved");
		return NextResponse.json({ entries });
	} catch (error) {
		console.error("Error fetching guestbook:", error);
		return NextResponse.json({ error: "Failed to fetch guestbook entries" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { message, userId, userName, userHandle, userAvatar, userEmail } = body;

		if (!message || typeof message !== "string" || message.trim().length === 0) {
			return NextResponse.json({ error: "Message is required." }, { status: 400 });
		}

		if (message.trim().length > 500) {
			return NextResponse.json(
				{ error: "Message exceeds maximum limit of 500 characters." },
				{ status: 400 },
			);
		}

		if (!userId || typeof userId !== "string") {
			return NextResponse.json(
				{ error: "You must be signed in with GitHub to sign the guestbook." },
				{ status: 401 },
			);
		}

		const entry = await createGuestbookEntry({
			userId,
			userName: userName || "GitHub User",
			userHandle: userHandle || "",
			userAvatar: userAvatar || "",
			userEmail: userEmail || "",
			message: message.trim(),
		});

		return NextResponse.json({
			success: true,
			entry,
			notice: "Your message has been posted to the guestbook! Thank you for signing.",
		});
	} catch (error: unknown) {
		console.error("Error submitting guestbook entry:", error);
		const err = error as { message?: string };
		return NextResponse.json(
			{ error: err?.message || "Failed to submit guestbook entry" },
			{ status: 500 },
		);
	}
}
