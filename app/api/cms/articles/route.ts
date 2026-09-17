import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/cms/auth";
import { fetchArticlesData, saveArticlesData } from "@/lib/cms/sync";
import type { ArticleMeta } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const articles = await fetchArticlesData();
		return NextResponse.json({ articles });
	} catch (error) {
		console.error("Error fetching articles:", error);
		return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	const session = await getCurrentSession();
	if (!session || !session.authenticated) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { articles } = body as { articles: ArticleMeta[] };

		if (!Array.isArray(articles)) {
			return NextResponse.json({ error: "Invalid articles payload. Array expected." }, { status: 400 });
		}

		const result = await saveArticlesData(articles);
		return NextResponse.json({
			success: result.success,
			firestoreUpdated: result.firestoreUpdated,
			localUpdated: result.localUpdated,
		});
	} catch (error) {
		console.error("Error saving articles:", error);
		return NextResponse.json({ error: "Failed to save articles" }, { status: 500 });
	}
}
