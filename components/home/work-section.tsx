"use client";

import type { Project } from "@/hooks/useProjects";
import Link from "next/link";

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
            id="work"
            ref={sectionRef}
            className="py-20 sm:py-32 min-h-screen"
        >
            <div className="space-y-12 sm:space-y-16">
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
                    <h2 className="font-light text-3xl sm:text-4xl">
                        Selected Work
                    </h2>
                    <div className="font-mono text-muted-foreground text-sm">
                        {isLoading
                            ? loadingMessage
                            : `${projects.length} Projects`}
                    </div>
                </div>

                <div className="space-y-8 sm:space-y-12">
                    {projects.map((project) => (
                        <div
                            key={project.name}
                            className="group items-start gap-4 sm:gap-8 grid lg:grid-cols-12 py-6 sm:py-8 border-border/50 hover:border-border border-b transition-colors duration-500"
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
                                            href={project.repoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:text-foreground transition-colors"
                                        >
                                            Repository
                                        </Link>
                                        {" · "}
                                        <Link
                                            href={project.demoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:text-foreground transition-colors"
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
                                        key={tag}
                                        className="px-2 py-1 group-hover:border-muted-foreground/50 rounded text-muted-foreground text-xs transition-colors duration-500"
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
