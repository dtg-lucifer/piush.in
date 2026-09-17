import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/cms/auth";
import { getSyncStatus, syncLocalToFirestore } from "@/lib/cms/sync";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const status = await getSyncStatus();
		return NextResponse.json(status);
	} catch (error) {
		console.error("Error getting sync status:", error);
		return NextResponse.json({ error: "Failed to get sync status" }, { status: 500 });
	}
}

export async function POST() {
	const session = await getCurrentSession();
	if (!session || !session.authenticated) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const result = await syncLocalToFirestore();
		const updatedStatus = await getSyncStatus();
		return NextResponse.json({
			success: result.success,
			status: updatedStatus,
			error: result.error,
		});
	} catch (error) {
		console.error("Error executing sync:", error);
		return NextResponse.json({ error: "Sync failed" }, { status: 500 });
	}
}
