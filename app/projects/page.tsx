"use client";

import Link from "next/link";
import { useLenis } from "@/hooks/useLenis";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
    useLenis();
    const { projects, isLoading, loadingMessage } = useProjects();

    return (
        <div className="relative bg-background min-h-screen text-foreground">
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
                                {isLoading
                                    ? loadingMessage
                                    : `${projects.length} Total`}
                            </div>
                        </div>

                        <p className="max-w-2xl text-muted-foreground leading-relaxed">
                            A complete list of projects, including experimental
                            builds, production systems, and long-running work in
                            progress.
                        </p>
                    </div>

                    <div className="space-y-8 sm:space-y-12">
                        {projects.map((project) => (
                            <article
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
                                        <h2 className="font-medium text-lg sm:text-xl">
                                            {project.name}
                                        </h2>
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
                                            className="px-2 py-1 rounded text-muted-foreground text-xs transition-colors duration-500"
                                            key={tag}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            <div className="right-0 bottom-0 left-0 fixed bg-linear-to-t from-background via-background/80 to-transparent h-24 pointer-events-none" />
        </div>
    );
}
