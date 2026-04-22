"use client";

import Link from "next/link";
import type { Project } from "@/hooks/useProjects";

interface WorkSectionProps {
	sectionRef: (el: HTMLElement | null) => void;
	projects: Project[];
	isLoading: boolean;
	loadingMessage: string;
}

export default function WorkSection({ sectionRef, projects, isLoading, loadingMessage }: WorkSectionProps) {
	return (
		<section className="min-h-screen py-20 sm:py-32" id="work" ref={sectionRef}>
			<div className="space-y-12 sm:space-y-16">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<h2 className="font-light text-3xl sm:text-4xl">Selected Work</h2>
					<div className="flex items-center gap-4 text-sm">
						<div className="font-mono text-muted-foreground">
							{isLoading ? loadingMessage : `${projects.length} Projects`}
						</div>
						<Link
							className="p-1 text-foreground text-sm underline underline-offset-4 transition-colors hover:bg-foreground hover:text-background sm:p-2"
							href="/projects"
						>
							View all
						</Link>
					</div>
				</div>

				<div className="space-y-8 sm:space-y-12">
					{projects.map((project) => (
						<div
							className="group grid items-start gap-4 border-border/50 border-b py-6 transition-colors duration-500 hover:border-border sm:gap-8 sm:py-8 lg:grid-cols-12"
							key={project.name}
						>
							<div className="lg:col-span-2">
								<div className="font-light text-muted-foreground text-xl transition-colors duration-500 group-hover:text-foreground sm:text-2xl">
									{project.wip ? "WIP" : "Live"}
								</div>
							</div>

							<div className="space-y-3 lg:col-span-6">
								<div>
									<h3 className="font-medium text-lg sm:text-xl">{project.name}</h3>
									<div className="text-muted-foreground text-sm">
										<Link
											className="transition-colors hover:text-foreground"
											href={project.repoUrl}
											rel="noreferrer"
											target="_blank"
										>
											Repository
										</Link>
										{" · "}
										<Link
											className="transition-colors hover:text-foreground"
											href={project.demoUrl}
											rel="noreferrer"
											target="_blank"
										>
											Demo
										</Link>
									</div>
								</div>
								<p className="max-w-lg text-muted-foreground leading-relaxed">{project.description}</p>
							</div>

							<div className="mt-2 flex flex-wrap gap-2 lg:col-span-4 lg:mt-0 lg:justify-end">
								{project.tags.map((tag) => (
									<span
										className="rounded px-2 py-1 text-muted-foreground text-xs transition-colors duration-500 group-hover:border-muted-foreground/50"
										key={tag}
									>
										{tag}
									</span>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
