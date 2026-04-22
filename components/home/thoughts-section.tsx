"use client";

import Link from "next/link";
import type { ArticleMeta } from "@/hooks/useProjects";

interface ThoughtsSectionProps {
	sectionRef: (el: HTMLElement | null) => void;
	articles: ArticleMeta[];
	isLoading: boolean;
	loadingMessage: string;
}

export default function ThoughtsSection({ sectionRef, articles, isLoading, loadingMessage }: ThoughtsSectionProps) {
	return (
		<section className="min-h-screen py-20 opacity-0 sm:py-32" id="thoughts" ref={sectionRef}>
			<div className="space-y-12 sm:space-y-16">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<h2 className="font-light text-3xl sm:text-4xl">Recent Thoughts</h2>
					<div className="flex items-center gap-4 text-sm">
						<div className="font-mono text-muted-foreground">
							{isLoading ? loadingMessage : `${articles.length} Articles`}
						</div>
						<Link
							className="p-1 text-foreground text-sm underline underline-offset-4 transition-colors hover:bg-foreground hover:text-background sm:p-2"
							href="/blog"
						>
							Visit blog
						</Link>
					</div>
				</div>

				<div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
					{articles.map((article) => {
						const publishedDate = new Date(article.datePublished).toLocaleDateString("en-US", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						});

						return (
							<Link href={`/blog/${article.slug}`} key={article.slug} className="group block">
								<article className="h-full cursor-pointer border border-border p-6 transition-all duration-500 hover:shadow-lg group-hover:border-foreground sm:p-8">
									<div className="flex h-full flex-col space-y-4">
										<div className="flex items-center justify-between font-mono text-muted-foreground text-xs uppercase tracking-wide">
											<span>{publishedDate}</span>
											<span>{article.tags[0] ?? "article"}</span>
										</div>

										<h3 className="font-medium text-lg transition-colors duration-300 group-hover:text-muted-foreground sm:text-xl">
											{article.title}
										</h3>

										<p className="line-clamp-3 grow text-muted-foreground leading-relaxed">
											{article.seoDescription}
										</p>

										<div className="mt-auto flex items-center gap-2 pt-4 text-muted-foreground text-sm transition-colors duration-300 group-hover:text-foreground">
											<span>Read more</span>
											<svg
												aria-hidden="true"
												className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													d="M17 8l4 4m0 0l-4 4m4-4H3"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
												/>
											</svg>
										</div>
									</div>
								</article>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
