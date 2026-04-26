"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import LenisScroll from "@/components/lenis-scroll";
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

			<main className="mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-28 max-w-4xl">
				<section className="space-y-12 sm:space-y-16">
					{/* Header */}
					<div className="space-y-6">
						<Link
							className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
							href="/"
						>
							<span aria-hidden="true">←</span>
							Back to home
						</Link>

						<div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
							<h1 className="font-light text-4xl sm:text-5xl tracking-tight">Projects</h1>
							<div className="font-mono text-muted-foreground text-sm">
								{isLoading
									? loadingMessage
									: filtered.length === projects.length
										? `${projects.length} Projects`
										: `${filtered.length} / ${projects.length} Projects`}
							</div>
						</div>

						<p className="max-w-2xl text-muted-foreground leading-relaxed">
							A collection of my work, side projects, and open source contributions. Focusing on scalable
							systems, backend architecture, and full-stack development.
						</p>

						{/* Search bar */}
						{!isLoading && (
							<div className="relative">
								<div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
									<svg
										aria-hidden="true"
										className="w-4 h-4 text-muted-foreground"
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
									className="bg-background py-2.5 pr-4 pl-9 border border-border focus:border-foreground outline-none w-full font-mono text-foreground placeholder:text-muted-foreground/50 text-sm transition-colors duration-200"
									onChange={(e) => handleSearch(e.target.value)}
									placeholder="Search by name, tag, or description…"
									type="search"
									value={search}
								/>
							</div>
						)}
					</div>

					{/* Project list */}
					<div className="gap-8 grid min-h-[200px]">
						{isLoading ? (
							<div className="font-mono text-muted-foreground text-sm animate-pulse">
								{loadingMessage}
							</div>
						) : paginated.length === 0 ? (
							<div className="flex flex-col justify-center items-center gap-3 py-20 font-mono text-muted-foreground text-sm">
								<svg
									aria-hidden="true"
									className="opacity-40 w-8 h-8"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
									/>
								</svg>
								<span>No projects match &ldquo;{search}&rdquo;</span>
							</div>
						) : (
							paginated.map((project) => (
								<Link
									className="group block"
									href={project.demoUrl}
									key={project.name}
									target="_blank"
									rel="noopener noreferrer"
								>
									<article className="bg-background group-hover:bg-muted/30 border border-border group-hover:border-foreground transition-all duration-300">
										{project.image ? (
											<div className="bg-muted/20 border-border border-b aspect-16/8 overflow-hidden">
												<Image
													alt={project.name}
													className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
													height={675}
													src={project.image}
													width={1200}
												/>
											</div>
										) : null}

										<div className="space-y-4 p-5 sm:p-6">
											<div className="flex justify-between items-center font-mono text-muted-foreground text-xs uppercase tracking-wide">
												<span>{project.wip ? "WIP" : "Live"}</span>
												<span>{project.tags[0] ?? "Project"}</span>
											</div>

											<h2 className="font-medium text-foreground text-2xl leading-tight transition-transform group-hover:translate-x-0.5 duration-300">
												{project.name}
											</h2>

											<p className="text-muted-foreground line-clamp-3 leading-relaxed">
												{project.description}
											</p>

											<div className="flex flex-wrap gap-2">
												{project.tags.slice(0, 5).map((tag) => (
													<span
														className="px-2 py-1 border border-border text-[11px] text-muted-foreground group-hover:text-foreground uppercase tracking-wide transition-colors"
														key={tag}
													>
														{tag}
													</span>
												))}
											</div>

											<div className="inline-flex items-center gap-2 text-muted-foreground group-hover:text-foreground text-sm transition-colors duration-300">
												<span>View Project</span>
												<svg
													aria-hidden="true"
													className="w-4 h-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 duration-300 transform"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M7 17L17 7M17 7H7M17 7V17"
													/>
												</svg>
											</div>
										</div>
									</article>
								</Link>
							))
						)}
					</div>

					{/* Pagination */}
					{!isLoading && totalPages > 1 && (
						<div className="flex justify-between items-center pt-8 border-border border-t">
							<button
								aria-label="Previous page"
								className="inline-flex items-center gap-2 disabled:opacity-30 px-4 py-2 border border-border hover:border-foreground disabled:hover:border-border font-mono text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground text-sm transition-all duration-200 disabled:cursor-not-allowed"
								disabled={safePage <= 1}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								type="button"
							>
								<svg
									aria-hidden="true"
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M7 16l-4-4m0 0l4-4m-4 4h18"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
									/>
								</svg>
								Prev
							</button>

							<div className="flex items-center gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
									<button
										aria-current={p === safePage ? "page" : undefined}
										aria-label={`Page ${p}`}
										className={`w-8 h-8 font-mono text-xs border transition-all duration-200 ${
											p === safePage
												? "border-foreground text-foreground bg-foreground/5"
												: "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
										}`}
										key={p}
										onClick={() => setPage(p)}
										type="button"
									>
										{p}
									</button>
								))}
							</div>

							<button
								aria-label="Next page"
								className="inline-flex items-center gap-2 disabled:opacity-30 px-4 py-2 border border-border hover:border-foreground disabled:hover:border-border font-mono text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground text-sm transition-all duration-200 disabled:cursor-not-allowed"
								disabled={safePage >= totalPages}
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								type="button"
							>
								Next
								<svg
									aria-hidden="true"
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M17 8l4 4m0 0l-4 4m4-4H3"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
									/>
								</svg>
							</button>
						</div>
					)}
				</section>
			</main>

			<div className="right-0 bottom-0 left-0 fixed bg-linear-to-t from-background via-background/80 to-transparent h-24 pointer-events-none" />
		</div>
	);
}
