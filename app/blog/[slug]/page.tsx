import type { Metadata } from "next";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import LenisScroll from "@/components/lenis-scroll";
import SiteNav from "@/components/site-nav";
import { getAllArticleSlugs, getArticleBySlug, extractToc, buildHeadingIdMap } from "@/lib/articles";
import { extractText, getCodeLanguage } from "@/components/blog/markdown-renderer";
import MermaidDiagram from "@/components/blog/mermaid-diagram";
import ZoomableImage from "@/components/blog/zoomable-image";
import TocNav from "@/components/blog/toc-nav";
import CopyButton from "@/components/blog/copy-button";
import { ImageReveal } from "@/components/motion-reveal";

interface ArticlePageProps {
	params: Promise<{
		slug: string;
	}>;
}

export function generateStaticParams() {
	return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
	const { slug } = await params;
	const article = getArticleBySlug(slug);

	if (!article) {
		return {
			title: "Article Not Found",
		};
	}

	return {
		title: `${article.seoTitle || article.title} | Piush Bose`,
		description: article.seoDescription,
		keywords: article.tags,
		openGraph: {
			title: article.seoTitle || article.title,
			description: article.seoDescription,
			type: "article",
			publishedTime: new Date(article.datePublished).toISOString(),
			url: `/blog/${article.slug}`,
			images: [
				{
					url: article.ogImage || article.cover,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: article.seoTitle || article.title,
			description: article.seoDescription,
			images: [article.ogImage || article.cover],
		},
	};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
	const { slug } = await params;
	const article = getArticleBySlug(slug);

	if (!article) {
		notFound();
	}

	const headingIdMap = buildHeadingIdMap(article.markdown);
	const headingIdCounters = new Map<string, number>();

	const headingId = (children: React.ReactNode): string | undefined => {
		const text =
			typeof children === "string"
				? children
				: Array.isArray(children)
					? children.map((c) => (typeof c === "string" ? c : "")).join("")
					: "";

		if (!text) return undefined;

		const base = text
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.trim()
			.replace(/[\s_]+/g, "-")
			.replace(/-+/g, "-");

		const ids = headingIdMap.get(base);
		if (!ids) return base;

		const idx = headingIdCounters.get(base) ?? 0;
		headingIdCounters.set(base, idx + 1);
		return ids[idx] ?? base;
	};

	const publishedDate = new Date(article.datePublished).toLocaleDateString("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

	const toc = extractToc(article.markdown);

	return (
		<div className="relative bg-background min-h-screen text-foreground">
			<LenisScroll />
			<SiteNav />
			<TocNav items={toc} />

			<main className="mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 max-w-4xl">
				<article className="space-y-10 sm:space-y-12">
					{/* Header */}
					<header className="space-y-6">
						<Link
							className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted hover:text-ink transition-colors"
							href="/blog"
						>
							<span aria-hidden="true">←</span>
							Back to blog
						</Link>

						<div className="space-y-3">
							<div className="font-mono text-muted text-xs uppercase tracking-widest">
								{publishedDate}
							</div>

							<h1 className="font-medium text-3xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink">
								{article.title}
							</h1>

							<p className="max-w-3xl text-muted text-base sm:text-lg leading-relaxed">
								{article.seoDescription}
							</p>
						</div>

						<div className="flex flex-wrap gap-2 pt-2">
							{article.tags.map((tag) => (
								<span
									className="px-2.5 py-1 border border-line font-mono text-muted text-xs uppercase tracking-wider"
									key={tag}
								>
									{tag}
								</span>
							))}
						</div>

						{article.cover ? (
							<div className="pt-4">
								<div className="border border-line overflow-hidden">
									<ImageReveal direction="horizontal" duration={1.1} delay={0.1}>
										<Image
											alt={article.title}
											className="w-full h-auto object-cover"
											height={675}
											priority
											src={article.cover}
											width={1200}
										/>
									</ImageReveal>
								</div>
							</div>
						) : null}
					</header>

					{/* Article Markdown Content */}
					<div className="article-markdown">
						<ReactMarkdown
							components={{
								h1: ({ node, ...props }) => (
									<h1 id={headingId(props.children)} {...props}>
										<span className="mr-3 font-mono text-[var(--accent)] select-none">#</span>
										{props.children}
									</h1>
								),
								h2: ({ node, ...props }) => (
									<h2 id={headingId(props.children)} {...props}>
										<span className="mr-3 font-mono text-[var(--accent)] select-none">##</span>
										{props.children}
									</h2>
								),
								h3: ({ node, ...props }) => (
									<h3 id={headingId(props.children)} {...props}>
										<span className="mr-2.5 font-mono text-muted select-none">###</span>
										{props.children}
									</h3>
								),
								h4: ({ node, ...props }) => (
									<h4 id={headingId(props.children)} {...props}>
										<span className="mr-2 font-mono text-muted select-none">####</span>
										{props.children}
									</h4>
								),
								p: ({ node, ...props }) => {
									const imgChildren =
										node?.children.filter(
											(c) => c.type === "element" && (c as { tagName: string }).tagName === "img",
										) ?? [];
									const onlyImages =
										imgChildren.length > 0 &&
										node?.children.every(
											(c) =>
												(c.type === "element" &&
													(c as { tagName: string }).tagName === "img") ||
												(c.type === "text" && (c as { value: string }).value.trim() === ""),
										);

									if (onlyImages) {
										return (
											<div className="flex flex-col items-center gap-4 my-8">
												{props.children}
											</div>
										);
									}
									return <p {...props} />;
								},
								img: ({ src, alt }) => (
									<ZoomableImage alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
								),
								blockquote: ({ node, ...props }) => <blockquote {...props} />,
								code: ({ node, ...props }) => {
									return <code {...props} />;
								},
								table: ({ children }) => (
									<div className="my-8 overflow-x-auto">
										<table className="w-full text-sm border-collapse">{children}</table>
									</div>
								),
								thead: ({ children }) => <thead>{children}</thead>,
								tbody: ({ children }) => <tbody>{children}</tbody>,
								tr: ({ children }) => <tr>{children}</tr>,
								th: ({ children }) => <th>{children}</th>,
								td: ({ children }) => <td>{children}</td>,
								pre: ({ node, children, ...props }) => {
									const codeEl = node?.children.find(
										(c) => c.type === "element" && (c as any).tagName === "code",
									) as import("hast").Element | undefined;
									if (codeEl && getCodeLanguage(codeEl) === "mermaid") {
										return <MermaidDiagram chart={extractText(codeEl)} />;
									}

									const language = codeEl ? getCodeLanguage(codeEl) : "";
									const rawText = codeEl ? extractText(codeEl) : "";

									return (
										<div className="my-8 border border-line bg-[var(--code-bg)] overflow-hidden">
											<div className="flex items-center justify-between px-4 py-2 border-b border-line bg-[var(--paper)] font-mono text-[11px] uppercase tracking-wider text-muted">
												<span>{language || "code"}</span>
												{rawText ? <CopyButton text={rawText} /> : null}
											</div>
											<pre
												{...props}
												className="p-4 sm:p-5 overflow-x-auto !m-0 !bg-transparent !border-0"
											>
												{children}
											</pre>
										</div>
									);
								},
							}}
							rehypePlugins={[
								rehypeRaw,
								rehypeKatex,
								[rehypeHighlight, { detect: true, ignoreMissing: true }],
							]}
							remarkPlugins={[remarkMath, remarkGfm]}
						>
							{article.markdown}
						</ReactMarkdown>
					</div>
				</article>
			</main>
		</div>
	);
}
