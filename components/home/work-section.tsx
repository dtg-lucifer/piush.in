"use client";

import Link from "next/link";
import type { Project } from "@/hooks/useProjects";

interface WorkSectionProps {
    sectionRef: (el: HTMLElement | null) => void;
    projects: Project[];
    isLoading: boolean;
    loadingMessage: string;
}

export default function WorkSection(
    { sectionRef, projects, isLoading, loadingMessage }: WorkSectionProps,
) {
    return (
        <section
            className="py-20 sm:py-32 min-h-screen"
            id="work"
            ref={sectionRef}
        >
            <div className="space-y-12 sm:space-y-16">
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
                    <h2 className="font-light text-3xl sm:text-4xl">
                        Selected Work
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="font-mono text-muted-foreground">
                            {isLoading
                                ? loadingMessage
                                : `${projects.length} Projects`}
                        </div>
                        <Link
                            className="text-foreground hover:bg-foreground hover:text-background p-1 sm:p-2 text-sm underline underline-offset-4 transition-colors"
                            href="/projects"
                        >
                            View all
                        </Link>
                    </div>
                </div>

                <div className="space-y-8 sm:space-y-12">
                    {projects.map((project) => (
                        <div
                            className="group items-start gap-4 sm:gap-8 grid lg:grid-cols-12 py-6 sm:py-8 border-border/50 hover:border-border border-b transition-colors duration-500"
                            key={project.name}
                        >
                            <div className="lg:col-span-2">
                                <div className="font-light text-muted-foreground group-hover:text-foreground text-xl sm:text-2xl transition-colors duration-500">
                                    {project.wip ? "WIP" : "Live"}
                                </div>
                            </div>

                            <div className="space-y-3 lg:col-span-6">
                                <div>
                                    <h3 className="font-medium text-lg sm:text-xl">
                                        {project.name}
                                    </h3>
                                    <div className="text-muted-foreground text-sm">
                                        <Link
                                            className="hover:text-foreground transition-colors"
                                            href={project.repoUrl}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            Repository
                                        </Link>
                                        {" · "}
                                        <Link
                                            className="hover:text-foreground transition-colors"
                                            href={project.demoUrl}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            Demo
                                        </Link>
                                    </div>
                                </div>
                                <p className="max-w-lg text-muted-foreground leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap lg:justify-end gap-2 lg:col-span-4 mt-2 lg:mt-0">
                                {project.tags.map((tag) => (
                                    <span
                                        className="px-2 py-1 group-hover:border-muted-foreground/50 rounded text-muted-foreground text-xs transition-colors duration-500"
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
