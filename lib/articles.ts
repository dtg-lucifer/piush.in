import { readdirSync, readFileSync } from "node:fs";
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
	} catch (e) {
		return [];
	}
}

export function getArticleBySlug(slug: string): ArticleDetail | null {
	const meta = getAllArticleMeta().find((article) => article.slug === slug);

	if (!meta) {
		return null;
	}

	const mdFiles = readdirSync(articlesDir).filter((name) => name.endsWith(".md"));

	let markdownRaw = "";
	for (const file of mdFiles) {
		const content = readFileSync(path.join(articlesDir, file), "utf8");
		if (content.includes(`slug: ${slug}`)) {
			markdownRaw = content;
			break;
		}
	}

	if (!markdownRaw) {
		return null;
	}

	return {
		...meta,
		markdown: stripFrontmatter(markdownRaw),
	};
}

export function getAllArticleSlugs(): string[] {
	return getAllArticleMeta().map((article) => article.slug);
}
