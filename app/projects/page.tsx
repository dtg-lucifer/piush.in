"use client";

import Image from "next/image";
import Link from "next/link";
import LenisScroll from "@/components/lenis-scroll";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
    const { projects, isLoading, loadingMessage } = useProjects();

    return (
        <div className="relative bg-background min-h-screen text-foreground">
            <LenisScroll />

            <main className="mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-28 max-w-4xl">
                <section className="space-y-12 sm:space-y-16">
                    <div className="space-y-6">
                        <Link
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                            href="/"
                        >
                            <span aria-hidden="true">←</span>
                            Back to home
                        </Link>

                        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
                            <h1 className="font-light text-4xl sm:text-5xl tracking-tight">
                                Projects
                            </h1>
                            <div className="font-mono text-muted-foreground text-sm">
                                {isLoading ? loadingMessage : `${projects.length} Projects`}
                            </div>
                        </div>

                        <p className="max-w-2xl text-muted-foreground leading-relaxed">
                            A collection of my work, side projects, and open source
                            contributions. Focusing on scalable systems, backend
                            architecture, and full-stack development.
                        </p>
                    </div>

                    <div className="gap-8 grid">
                        {isLoading ? (
                            <div className="text-muted-foreground animate-pulse font-mono text-sm">Loading projects...</div>
                        ) : (
                            projects.map((project) => (
                                <Link
                                    className="group block"
                                    href={project.demoUrl}
                                    key={project.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <article className="bg-background group-hover:bg-muted/30 border border-border group-hover:border-foreground transition-all duration-300">
                                        {project.image ? (
                                            <div className="border-border border-b aspect-16/8 overflow-hidden bg-muted/20">
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
                                                    className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-300 transform"
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

            <div className="right-0 bottom-0 left-0 fixed bg-linear-to-t from-background via-background/80 to-transparent h-24 pointer-events-none" />
        </div>
    );
}
