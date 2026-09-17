import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/cms/auth";
import { fetchProjectsData, saveProjectsData } from "@/lib/cms/sync";
import type { Project } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const projects = await fetchProjectsData();
		return NextResponse.json({ projects });
	} catch (error) {
		console.error("Error fetching projects:", error);
		return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	const session = await getCurrentSession();
	if (!session || !session.authenticated) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { projects } = body as { projects: Project[] };

		if (!Array.isArray(projects)) {
			return NextResponse.json({ error: "Invalid projects payload. Array expected." }, { status: 400 });
		}

		const result = await saveProjectsData(projects);
		return NextResponse.json({
			success: result.success,
			firestoreUpdated: result.firestoreUpdated,
			localUpdated: result.localUpdated,
		});
	} catch (error) {
		console.error("Error saving projects:", error);
		return NextResponse.json({ error: "Failed to save projects" }, { status: 500 });
	}
}
