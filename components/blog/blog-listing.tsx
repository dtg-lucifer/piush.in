"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import type { ArticleMeta } from "@/lib/articles";
import { useDebounce } from "@/hooks/useDebounce";
import GlitchRevealText from "@/components/glitch-text";

const ARTICLES_PER_PAGE = 4;

interface BlogListingProps {
	articles: ArticleMeta[];
}

export default function BlogListing({ articles }: BlogListingProps) {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const debouncedSearch = useDebounce(search, 300);

	const filtered = useMemo(() => {
		const q = debouncedSearch.trim().toLowerCase();
		if (!q) return articles;
		return articles.filter(
			(a) =>
				a.title.toLowerCase().includes(q) ||
				a.seoDescription.toLowerCase().includes(q) ||
				a.tags.some((t) => t.toLowerCase().includes(q)),
		);
	}, [articles, debouncedSearch]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / ARTICLES_PER_PAGE));
	const safePage = Math.min(page, totalPages);
	const paginated = filtered.slice((safePage - 1) * ARTICLES_PER_PAGE, safePage * ARTICLES_PER_PAGE);

	function handleSearch(value: string) {
		setSearch(value);
		setPage(1);
	}

	return (
		<section className="space-y-12 sm:space-y-16">
			{/* Header */}
			<div className="space-y-6">
				<Link
					className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted hover:text-ink transition-colors"
					href="/"
				>
					<span aria-hidden="true">←</span>
					Back to home
				</Link>

				<div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
					<div>
						<p className="eyebrow mb-2">Long-form notes</p>
						<h1 className="font-medium text-4xl sm:text-6xl tracking-tight text-ink m-0">Blog</h1>
					</div>
					<div className="font-mono text-muted text-xs uppercase tracking-wider">
						{filtered.length === articles.length
							? `${articles.length} Articles`
							: `${filtered.length} / ${articles.length} Articles`}
					</div>
				</div>

				<p className="max-w-2xl text-muted text-base leading-relaxed">
					Long-form notes on systems, backend architecture, cloud infrastructure, and engineering trade-offs
					from real project work.
				</p>

				{/* Search bar */}
				<div className="relative">
					<div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
						<svg
							aria-hidden="true"
							className="w-4 h-4 text-muted"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
							/>
						</svg>
					</div>
					<input
						aria-label="Search articles"
						className="bg-transparent py-3 pr-4 pl-10 border border-line focus:border-ink outline-none w-full font-mono text-ink placeholder:text-muted/60 text-xs uppercase tracking-wider transition-colors duration-200"
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Search by title, tag, or description…"
						type="search"
						value={search}
					/>
				</div>
			</div>

			{/* Article list */}
			<div className="gap-8 grid min-h-[200px]">
				{paginated.length === 0 ? (
					<div className="flex flex-col justify-center items-center gap-3 py-20 font-mono text-muted text-xs uppercase tracking-wider">
						<span>No articles match &ldquo;{search}&rdquo;</span>
					</div>
				) : (
					paginated.map((article, index) => {
						const publishedDate = new Date(article.datePublished).toLocaleDateString("en-US", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						});

						return (
							<Link className="group block" href={`/blog/${article.slug}`} key={article.slug}>
								<article className="border border-line bg-[var(--paper)] group-hover:border-ink transition-all duration-300">
									{article.cover ? (
										<div className="border-line border-b aspect-16/8 overflow-hidden">
											<Image
												alt={article.title}
												className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
												height={675}
												src={article.cover}
												width={1200}
											/>
										</div>
									) : null}

									<div className="space-y-4 p-6 sm:p-8">
										<div className="flex justify-between items-center font-mono text-muted text-xs uppercase tracking-wider">
											<span>{publishedDate}</span>
											<span>{article.tags[0] ?? "article"}</span>
										</div>

										<h2 className="font-medium text-ink text-2xl sm:text-3xl leading-tight group-hover:text-[var(--accent)] transition-colors">
											<GlitchRevealText
												text={article.title}
												triggerOnScroll
												delay={index * 120}
												retriggerOnHover={false}
											/>
										</h2>

										<p className="text-muted text-sm sm:text-base line-clamp-3 leading-relaxed">
											{article.seoDescription}
										</p>

										<div className="flex flex-wrap gap-2">
											{article.tags.slice(0, 5).map((tag) => (
												<span
													className="px-2 py-0.5 border border-line font-mono text-[11px] text-muted uppercase tracking-wider"
													key={tag}
												>
													{tag}
												</span>
											))}
										</div>

										<div className="inline-flex items-center gap-2 text-ink font-mono text-xs uppercase tracking-wider group-hover:text-[var(--accent)] transition-colors duration-200 pt-2">
											<span>Read article</span>
											<span
												aria-hidden="true"
												className="group-hover:translate-x-1 transition-transform"
											>
												↗
											</span>
										</div>
									</div>
								</article>
							</Link>
						);
					})
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<nav
					aria-label="Pagination"
					className="flex justify-between items-center pt-8 border-t border-line font-mono text-xs uppercase tracking-wider"
				>
					<button
						className="px-4 py-2 border border-line text-ink disabled:opacity-30 hover:border-ink cursor-pointer transition-colors"
						disabled={safePage <= 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						type="button"
					>
						← Previous
					</button>
					<span className="text-muted">
						Page {safePage} of {totalPages}
					</span>
					<button
						className="px-4 py-2 border border-line text-ink disabled:opacity-30 hover:border-ink cursor-pointer transition-colors"
						disabled={safePage >= totalPages}
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						type="button"
					>
						Next →
					</button>
				</nav>
			)}
		</section>
	);
}
