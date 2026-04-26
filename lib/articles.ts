import { readFileSync } from "node:fs";
import path from "node:path";

export interface ArticleMeta {
	title: string;
	seoTitle: string;
	seoDescription: string;
	datePublished: string;
	cuid: string;
	slug: string;
	cover: string;
	ogImage: string;
	tags: string[];
	content: string; // filename of the markdown file, e.g. "2025_07_21_rusty_kv.md"
	featured?: boolean;
}

export interface ArticleDetail extends ArticleMeta {
	markdown: string;
}

const articlesDir = path.join(process.cwd(), "public/articles");

function stripFrontmatter(markdown: string): string {
	if (!markdown.startsWith("---")) {
		return markdown;
	}

	const lines = markdown.split(/\r?\n/);

	if (lines[0].trim() !== "---") {
		return markdown;
	}

	const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");

	if (endIndex === -1) {
		return markdown;
	}

	return lines
		.slice(endIndex + 1)
		.join("\n")
		.trim();
}

export function getAllArticleMeta(): ArticleMeta[] {
	const fullPath = path.join(articlesDir, "__data.json");
	try {
		const raw = readFileSync(fullPath, "utf8");
		const articles = JSON.parse(raw) as ArticleMeta[];

		return articles.sort((a, b) => {
			const aTime = new Date(a.datePublished).getTime();
			const bTime = new Date(b.datePublished).getTime();

			return bTime - aTime;
		});
	} catch {
		return [];
	}
}

export function getArticleBySlug(slug: string): ArticleDetail | null {
	const meta = getAllArticleMeta().find((article) => article.slug === slug);

	if (!meta) {
		return null;
	}

	try {
		const filePath = path.join(articlesDir, meta.content);
		const markdownRaw = readFileSync(filePath, "utf8");

		return {
			...meta,
			markdown: stripFrontmatter(markdownRaw),
		};
	} catch {
		return null;
	}
}

export function getAllArticleSlugs(): string[] {
	return getAllArticleMeta().map((article) => article.slug);
}

export interface TocEntry {
	id: string;
	label: string;
	depth: number;
}

// Slugify a heading text the same way rehype-slug would
function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.trim()
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-");
}

export function extractToc(markdown: string): TocEntry[] {
	const lines = markdown.split(/\r?\n/);
	const entries: TocEntry[] = [];

	for (const line of lines) {
		const match = line.match(/^(#{1,2})\s+(.+)/);
		if (!match) continue;
		const depth = match[1].length;
		// Strip inline markdown (bold, italic, code, links)
		const label = match[2]
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			.replace(/[*_`]/g, "")
			.trim();
		entries.push({ id: slugify(label), label, depth });
	}

	return entries;
}
