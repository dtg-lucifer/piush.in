"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import LenisScroll from "@/components/lenis-scroll";
import SiteNav from "@/components/site-nav";
import LatexText from "@/components/latex-text";
import { useProjects } from "@/hooks/useProjects";
import { useDebounce } from "@/hooks/useDebounce";

const PROJECTS_PER_PAGE = 4;

export default function ProjectsPage() {
	const { projects, isLoading, loadingMessage } = useProjects();

	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const debouncedSearch = useDebounce(search, 300);

	const filtered = useMemo(() => {
		const q = debouncedSearch.trim().toLowerCase();
		if (!q) return projects;
		return projects.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q) ||
				p.tags.some((t) => t.toLowerCase().includes(q)),
		);
	}, [projects, debouncedSearch]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PROJECTS_PER_PAGE));
	const safePage = Math.min(page, totalPages);
	const paginated = filtered.slice((safePage - 1) * PROJECTS_PER_PAGE, safePage * PROJECTS_PER_PAGE);

	function handleSearch(value: string) {
		setSearch(value);
		setPage(1);
	}

	return (
		<div className="relative bg-background min-h-screen text-foreground">
			<LenisScroll />
			<SiteNav />

			<main className="mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 max-w-3xl">
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
								<p className="eyebrow mb-2">Systems &amp; Open Source</p>
								<h1 className="font-medium text-4xl sm:text-6xl tracking-tight text-ink m-0">Projects</h1>
							</div>
							<div className="font-mono text-muted text-xs uppercase tracking-wider">
								{isLoading
									? loadingMessage
									: filtered.length === projects.length
										? `${projects.length} Projects`
										: `${filtered.length} / ${projects.length} Projects`}
							</div>
						</div>

						<p className="max-w-2xl text-muted text-base leading-relaxed">
							A collection of my work, side projects, and open source contributions. Focusing on scalable
							systems, low-level architecture, and distributed services.
						</p>

						{/* Search bar */}
						{!isLoading && (
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
									aria-label="Search projects"
									className="bg-transparent py-3 pr-4 pl-10 border border-line focus:border-ink outline-none w-full font-mono text-ink placeholder:text-muted/60 text-xs uppercase tracking-wider transition-colors duration-200"
									onChange={(e) => handleSearch(e.target.value)}
									placeholder="Search by title, tag, or description…"
									type="search"
									value={search}
								/>
							</div>
						)}
					</div>

					{/* Project list */}
					<div className="gap-8 grid min-h-[200px]">
						{isLoading ? (
							<div className="flex justify-center items-center py-20 font-mono text-muted text-xs uppercase tracking-wider">
								{loadingMessage}
							</div>
						) : paginated.length === 0 ? (
							<div className="flex flex-col justify-center items-center gap-3 py-20 font-mono text-muted text-xs uppercase tracking-wider">
								<span>No projects match &ldquo;{search}&rdquo;</span>
							</div>
						) : (
							paginated.map((project, idx) => (
								<article
									key={project.name}
									className="border border-line bg-[var(--paper)] group hover:border-ink transition-all duration-300"
								>
									{project.image ? (
										<div className="border-line border-b aspect-16/8 overflow-hidden">
											<Image
												alt={project.name}
												className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
												height={675}
												src={project.image}
												width={1200}
											/>
										</div>
									) : null}

									<div className="space-y-4 p-6 sm:p-8">
										<div className="flex justify-between items-center font-mono text-muted text-xs uppercase tracking-wider">
											<span>0{(safePage - 1) * PROJECTS_PER_PAGE + idx + 1} / {project.wip ? "WIP" : "Live"}</span>
											<span>{project.tags[0] ?? "Project"}</span>
										</div>

										<h2 className="font-medium text-ink text-2xl sm:text-3xl leading-tight group-hover:text-[var(--accent)] transition-colors">
											{project.name}
										</h2>

										<p className="text-muted text-sm sm:text-base leading-relaxed">
											<LatexText text={project.description} />
										</p>

										{project.languages && project.languages.length > 0 && (
											<div className="flex flex-wrap items-center gap-2 pt-1">
												<span className="font-mono text-[10px] text-muted uppercase tracking-widest mr-1">
													Languages:
												</span>
												{project.languages.map((lang) => (
													<span
														className="px-2 py-0.5 border border-line bg-[var(--paper-secondary,var(--paper))] font-mono text-[11px] text-ink font-medium uppercase tracking-wider"
														key={lang}
													>
														{lang}
													</span>
												))}
											</div>
										)}

										<div className="flex flex-wrap gap-2">
											{project.tags.map((tag) => (
												<span
													className="px-2 py-0.5 border border-line font-mono text-[11px] text-muted uppercase tracking-wider"
													key={tag}
												>
													{tag}
												</span>
											))}
										</div>

										<div className="flex items-center gap-6 pt-2 font-mono text-xs uppercase tracking-wider">
											{project.demoUrl ? (
												<a
													href={project.demoUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-ink hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1.5"
												>
													<span>Demo</span>
													<span aria-hidden="true">↗</span>
												</a>
											) : null}
											{project.repoUrl ? (
												<a
													href={project.repoUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-muted hover:text-ink transition-colors inline-flex items-center gap-1.5"
												>
													<span>Repository</span>
													<span aria-hidden="true">↗</span>
												</a>
											) : null}
										</div>
									</div>
								</article>
							))
						)}
					</div>

					{/* Pagination */}
					{!isLoading && totalPages > 1 && (
						<nav aria-label="Pagination" className="flex justify-between items-center pt-8 border-t border-line font-mono text-xs uppercase tracking-wider">
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
			</main>
		</div>
	);
}
