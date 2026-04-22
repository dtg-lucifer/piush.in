"use client";

import Image from "next/image";
import Link from "next/link";
import LenisScroll from "@/components/lenis-scroll";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
	const { projects, isLoading, loadingMessage } = useProjects();

	return (
		<div className="relative min-h-screen bg-background text-foreground">
			<LenisScroll />

			<main className="mx-auto max-w-4xl px-6 py-20 sm:px-8 sm:py-28 lg:px-16">
				<section className="space-y-12 sm:space-y-16">
					<div className="space-y-6">
						<Link
							className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
							href="/"
						>
							<span aria-hidden="true">←</span>
							Back to home
						</Link>

						<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
							<h1 className="font-light text-4xl tracking-tight sm:text-5xl">Projects</h1>
							<div className="font-mono text-muted-foreground text-sm">
								{isLoading ? loadingMessage : `${projects.length} Projects`}
							</div>
						</div>

						<p className="max-w-2xl text-muted-foreground leading-relaxed">
							A collection of my work, side projects, and open source contributions. Focusing on scalable
							systems, backend architecture, and full-stack development.
						</p>
					</div>

					<div className="grid gap-8">
						{isLoading ? (
							<div className="animate-pulse font-mono text-muted-foreground text-sm">
								Loading projects...
							</div>
						) : (
							projects.map((project) => (
								<Link
									className="group block"
									href={project.demoUrl}
									key={project.name}
									target="_blank"
									rel="noopener noreferrer"
								>
									<article className="border border-border bg-background transition-all duration-300 group-hover:border-foreground group-hover:bg-muted/30">
										{project.image ? (
											<div className="aspect-16/8 overflow-hidden border-border border-b bg-muted/20">
												<Image
													alt={project.name}
													className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
													height={675}
													src={project.image}
													width={1200}
												/>
											</div>
										) : null}

										<div className="space-y-4 p-5 sm:p-6">
											<div className="flex items-center justify-between font-mono text-muted-foreground text-xs uppercase tracking-wide">
												<span>{project.wip ? "WIP" : "Live"}</span>
												<span>{project.tags[0] ?? "Project"}</span>
											</div>

											<h2 className="font-medium text-2xl text-foreground leading-tight transition-transform duration-300 group-hover:translate-x-0.5">
												{project.name}
											</h2>

											<p className="line-clamp-3 text-muted-foreground leading-relaxed">
												{project.description}
											</p>

											<div className="flex flex-wrap gap-2">
												{project.tags.slice(0, 5).map((tag) => (
													<span
														className="border border-border px-2 py-1 text-[11px] text-muted-foreground uppercase tracking-wide transition-colors group-hover:text-foreground"
														key={tag}
													>
														{tag}
													</span>
												))}
											</div>

											<div className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors duration-300 group-hover:text-foreground">
												<span>View Project</span>
												<svg
													aria-hidden="true"
													className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
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
				</section>
			</main>

			<div className="pointer-events-none fixed right-0 bottom-0 left-0 h-24 bg-linear-to-t from-background via-background/80 to-transparent" />
		</div>
	);
}
