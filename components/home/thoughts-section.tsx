"use client";

import Link from "next/link";

interface ThoughtsSectionProps {
    sectionRef: (el: HTMLElement | null) => void;
}

const posts = [
    {
        title: "The Future of Web Development",
        excerpt:
            "Exploring how AI and automation are reshaping the way we build for the web.",
        date: "Dec 2024",
        readTime: "5 min",
    },
    {
        title: "Design Systems at Scale",
        excerpt:
            "Lessons learned from building and maintaining design systems across multiple products.",
        date: "Nov 2024",
        readTime: "8 min",
    },
    {
        title: "Performance-First Development",
        excerpt:
            "Why performance should be a first-class citizen in your development workflow.",
        date: "Oct 2024",
        readTime: "6 min",
    },
    {
        title: "The Art of Code Review",
        excerpt:
            "Building better software through thoughtful and constructive code reviews.",
        date: "Sep 2024",
        readTime: "4 min",
    },
];

export default function ThoughtsSection({ sectionRef }: ThoughtsSectionProps) {
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
                    <Link
                        className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition-colors"
                        href="/blog"
                    >
                        Visit blog
                    </Link>
                </div>

                <div className="gap-6 sm:gap-8 grid lg:grid-cols-2">
                    {posts.map((post) => (
                        <article
                            className="group hover:shadow-lg p-6 sm:p-8 border border-border hover:border-muted-foreground/50 rounded-lg transition-all duration-500 cursor-pointer"
                            key={post.title}
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-center font-mono text-muted-foreground text-xs">
                                    <span>{post.date}</span>
                                    <span>{post.readTime}</span>
                                </div>

                                <h3 className="font-medium group-hover:text-muted-foreground text-lg sm:text-xl transition-colors duration-300">
                                    {post.title}
                                </h3>

                                <p className="text-muted-foreground leading-relaxed">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground text-sm transition-colors duration-300">
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
                    ))}
                </div>
            </div>
        </section>
    );
}
