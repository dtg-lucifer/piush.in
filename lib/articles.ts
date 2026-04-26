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
	key: string;
	label: string;
	depth: number;
}

// Slugify a heading text the same way rehype-slug would
export function slugify(text: string): string {
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
	// Track how many times each base slug has been used to deduplicate
	const seenSlugs = new Map<string, number>();

	for (const [index, line] of lines.entries()) {
		const match = line.match(/^(#{1,2})\s+(.+)/);
		if (!match) continue;
		const depth = match[1].length;
		// Strip inline markdown (bold, italic, code, links)
		const label = match[2]
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			.replace(/[*_`]/g, "")
			.trim();

		const base = slugify(label);
		const count = seenSlugs.get(base) ?? 0;
		seenSlugs.set(base, count + 1);
		// First occurrence keeps the plain slug; subsequent ones get -2, -3, …
		const id = count === 0 ? base : `${base}-${count + 1}`;

		entries.push({ id, key: `toc-${index}`, label, depth });
	}

	return entries;
}

/**
 * Build a map of { headingText -> uniqueId } for every heading in the markdown,
 * applying the same deduplication logic used in extractToc.
 * Used by the page renderer to keep heading element IDs in sync with the TOC.
 */
export function buildHeadingIdMap(markdown: string): Map<string, string[]> {
	const lines = markdown.split(/\r?\n/);
	// Map from base slug → ordered list of unique IDs (one per occurrence)
	const result = new Map<string, string[]>();
	const seenSlugs = new Map<string, number>();

	for (const line of lines) {
		const match = line.match(/^(#{1,4})\s+(.+)/);
		if (!match) continue;

		const label = match[2]
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			.replace(/[*_`]/g, "")
			.trim();

		const base = slugify(label);
		const count = seenSlugs.get(base) ?? 0;
		seenSlugs.set(base, count + 1);
		const id = count === 0 ? base : `${base}-${count + 1}`;

		const existing = result.get(base) ?? [];
		existing.push(id);
		result.set(base, existing);
	}

	return result;
}
