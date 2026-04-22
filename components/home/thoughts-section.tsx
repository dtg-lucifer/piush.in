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
        <section
            className="opacity-0 py-20 sm:py-32 min-h-screen"
            id="thoughts"
            ref={sectionRef}
        >
            <div className="space-y-12 sm:space-y-16">
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
                    <h2 className="font-light text-3xl sm:text-4xl">
                        Recent Thoughts
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="font-mono text-muted-foreground">
                            {isLoading
                                ? loadingMessage
                                : `${articles.length} Articles`}
                        </div>
                        <Link
                            className="text-foreground hover:bg-foreground hover:text-background p-1 sm:p-2 text-sm underline underline-offset-4 transition-colors"
                            href="/blog"
                        >
                            Visit blog
                        </Link>
                    </div>
                </div>

                <div className="gap-6 sm:gap-8 grid lg:grid-cols-2">
                    {articles.map((article) => {
                        const publishedDate = new Date(
                            article.datePublished,
                        ).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        });

                        return (
                            <Link href={`/blog/${article.slug}`} key={article.slug} className="group block">
                                <article
                                    className="h-full hover:shadow-lg p-6 sm:p-8 border border-border group-hover:border-foreground transition-all duration-500 cursor-pointer"
                                >
                                    <div className="flex flex-col h-full space-y-4">
                                        <div className="flex justify-between items-center font-mono text-muted-foreground text-xs uppercase tracking-wide">
                                            <span>{publishedDate}</span>
                                            <span>{article.tags[0] ?? "article"}</span>
                                        </div>

                                        <h3 className="font-medium group-hover:text-muted-foreground text-lg sm:text-xl transition-colors duration-300">
                                            {article.title}
                                        </h3>

                                        <p className="grow text-muted-foreground leading-relaxed line-clamp-3">
                                            {article.seoDescription}
                                        </p>

                                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground text-sm transition-colors duration-300 mt-auto pt-4">
                                            <span>Read more</span>
                                            <svg
                                                aria-hidden="true"
                                                className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300 transform"
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
