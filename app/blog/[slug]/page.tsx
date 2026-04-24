import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import LenisScroll from "@/components/lenis-scroll";
import { getAllArticleSlugs, getArticleBySlug } from "@/lib/articles";
import { extractText, getCodeLanguage } from "@/components/blog/markdown-renderer";
import MermaidDiagram from "@/components/blog/mermaid-diagram";

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
		title: article.seoTitle || article.title,
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

	const publishedDate = new Date(article.datePublished).toLocaleDateString("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

	return (
		<div className="relative bg-background min-h-screen text-foreground">
			<LenisScroll />

			<main className="mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-28 max-w-4xl">
				<article className="space-y-10 sm:space-y-12">
					<header className="space-y-6">
						<Link
							className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
							href="/blog"
						>
							<span aria-hidden="true">←</span>
							Back to blog
						</Link>

						<div className="space-y-4">
							<div className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
								{publishedDate}
							</div>

							<h1 className="font-light text-3xl sm:text-5xl leading-tight tracking-tight">
								{article.title}
							</h1>

							<p className="max-w-3xl text-muted-foreground text-lg leading-relaxed">
								{article.seoDescription}
							</p>
						</div>

						<div className="flex flex-wrap gap-2">
							{article.tags.map((tag) => (
								<span
									className="px-2 py-1 border border-border text-muted-foreground text-xs uppercase tracking-wide"
									key={tag}
								>
									{tag}
								</span>
							))}
						</div>

						{article.cover ? (
							<Image
								alt={article.title}
								className="border border-border w-full h-auto object-cover"
								height={675}
								src={article.cover}
								width={1200}
							/>
						) : null}
					</header>

					<div className="space-y-6 [&_code]:bg-muted/40 [&_pre_code]:bg-transparent! [&_pre]:bg-background [&_li]:my-1 [&_li>p]:my-1 [&_p]:my-5 [&_h1]:mt-12 [&_h2]:mt-10 [&_h3]:mt-8 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-3 [&_pre_code]:p-0! [&_pre]:p-4 [&_code]:px-1.5 [&_code]:py-0.5 [&_blockquote]:pl-4 [&_ol]:pl-6 [&_ul]:pl-6 [&_pre]:border [&_blockquote]:border-border [&_pre]:border-border [&_blockquote]:border-l [&_pre]:overflow-x-auto [&_h1]:font-light [&_h2]:font-light text-muted-foreground [&_a]:text-foreground [&_blockquote]:text-foreground/90 [&_code]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground hover:[&_a]:text-muted-foreground [&_code]:text-sm text-base [&_h3]:text-lg sm:text-lg [&_h2]:text-xl sm:[&_h3]:text-xl [&_h1]:text-2xl sm:[&_h2]:text-2xl sm:[&_h1]:text-3xl [&_a]:underline [&_a]:underline-offset-4 leading-relaxed [&_ol]:list-decimal [&_ul]:list-disc [&_pre]:no-scrollbar article-markdown">
						<ReactMarkdown
							components={{
								h1: ({ node, ...props }) => (
									<h1 {...props}>
										<span className="mr-3 font-mono text-muted-foreground/30 select-none">#</span>
										{props.children}
									</h1>
								),
								h2: ({ node, ...props }) => (
									<h2 {...props}>
										<span className="mr-3 font-mono text-muted-foreground/30 select-none">##</span>
										{props.children}
									</h2>
								),
								h3: ({ node, ...props }) => (
									<h3 {...props}>
										<span className="mr-3 font-mono text-muted-foreground/30 select-none">###</span>
										{props.children}
									</h3>
								),
								h4: ({ node, ...props }) => (
									<h4 {...props}>
										<span className="mr-3 font-mono text-muted-foreground/30 select-none">
											####
										</span>
										{props.children}
									</h4>
								),
								p: ({ node, ...props }) => {
									if (
										node?.children.length === 1 &&
										node?.children[0].type === "element" &&
										node?.children[0].tagName === "img"
									) {
										return <div className="flex justify-center my-6">{props.children}</div>;
									}
									return <p {...props} className="text-sm" />;
								},
								blockquote: ({ node, ...props }) => (
									<blockquote
										{...props}
										className="bg-muted-foreground/10 px-4 py-1 border-secondary border-l-4! text-muted"
									/>
								),
                                code: ({ node, ...props }) => (
									<code
										{...props}
										className="bg-muted/40 px-1.5 py-0.5 rounded font-mono text-sm"
									/>
								),
                                table: ({ children }) => (
                                    <div className="my-6 overflow-x-auto">
                                        <table className="border border-border w-full text-sm border-collapse">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="border-border border-b">{children}</thead>
                                ),
                                tbody: ({ children }) => <tbody>{children}</tbody>,
                                tr: ({ children }) => (
                                    <tr className="border-border last:border-0 border-b">{children}</tr>
                                ),
                                th: ({ children }) => (
                                    <th className="px-4 py-2 border-border last:border-0 border-r font-medium text-foreground text-sm text-left">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="px-4 py-2 border-border last:border-0 border-r font-normal text-muted-foreground text-sm">
                                        {children}
                                    </td>
                                ),
                                pre: ({ node, children, ...props }) => {
                                    const codeEl = node?.children.find(
                                        (c): c is import("hast").Element =>
                                            c.type === "element" && (c as import("hast").Element).tagName === "code",
                                    );
                                    if (codeEl && getCodeLanguage(codeEl) === "mermaid") {
                                        return <MermaidDiagram chart={extractText(codeEl)} />;
                                    }

                                    const className = `${props.className} font-sans`
                                    const newProps = {
                                        ...props,
                                        className
                                    }
                                    return <pre {...newProps}>{children}</pre>;
                                },
							}}
							rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
							remarkPlugins={[remarkGfm]}
						>
							{article.markdown}
						</ReactMarkdown>
					</div>
				</article>
			</main>

			<div className="right-0 bottom-0 left-0 fixed bg-linear-to-t from-background via-background/80 to-transparent h-24 pointer-events-none" />
		</div>
	);
}
