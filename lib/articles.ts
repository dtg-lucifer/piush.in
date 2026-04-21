import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export interface ArticleMeta {
    fileBase: string;
    title: string;
    seoTitle: string;
    seoDescription: string;
    datePublished: string;
    cuid: string;
    slug: string;
    cover: string;
    ogImage: string;
    tags: string[];
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

    const endIndex = lines.findIndex((line, index) =>
        index > 0 && line.trim() === "---"
    );

    if (endIndex === -1) {
        return markdown;
    }

    return lines
        .slice(endIndex + 1)
        .join("\n")
        .trim();
}

function parseArticleMeta(fileName: string): ArticleMeta {
    const fullPath = path.join(articlesDir, fileName);
    const raw = readFileSync(fullPath, "utf8");
    const parsed = JSON.parse(raw) as Omit<ArticleMeta, "fileBase">;

    return {
        ...parsed,
        fileBase: fileName.replace(/\.json$/, ""),
    };
}

export function getAllArticleMeta(): ArticleMeta[] {
    const jsonFiles = readdirSync(articlesDir)
        .filter((name) => name.endsWith(".json"))
        .sort();

    const articles = jsonFiles.map((fileName) => parseArticleMeta(fileName));

    return articles.sort((a, b) => {
        const aTime = new Date(a.datePublished).getTime();
        const bTime = new Date(b.datePublished).getTime();

        return bTime - aTime;
    });
}

export function getArticleBySlug(slug: string): ArticleDetail | null {
    const meta = getAllArticleMeta().find((article) => article.slug === slug);

    if (!meta) {
        return null;
    }

    const markdownPath = path.join(articlesDir, `${meta.fileBase}.md`);
    const markdownRaw = readFileSync(markdownPath, "utf8");

    return {
        ...meta,
        markdown: stripFrontmatter(markdownRaw),
    };
}

export function getAllArticleSlugs(): string[] {
    return getAllArticleMeta().map((article) => article.slug);
}
