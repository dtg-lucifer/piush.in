"use client";

import ThemeIcon from "@/components/svg/theme-icon";
import Link from "next/link";

interface ConnectSectionProps {
    sectionRef: (el: HTMLElement | null) => void;
    isDark: boolean;
    onToggleTheme: () => void;
}

const socials = [
    {
        name: "GitHub",
        handle: "@dtg-lucifer",
        url: "https://github.com/dtg-lucifer",
    },
    {
        name: "Hashnode",
        handle: "@devpiush",
        url: "https://devpiush.hashnode.dev/",
    },
    {
        name: "LinkedIn",
        handle: "@bosepiush",
        url: "https://www.linkedin.com/in/bosepiush",
    },
    {
        name: "Documents",
        handle: "Certifications & Resume",
        url: "https://drive.google.com/drive/folders/17UozAf9dH3iK0jQ_i5xqJh7jyhbyAPEq?usp=sharing",
    },
];

export default function ConnectSection(
    { sectionRef, isDark, onToggleTheme }: ConnectSectionProps,
) {
    return (
        <>
            <section
                id="connect"
                ref={sectionRef}
                className="opacity-0 py-20 sm:py-32"
            >
                <div className="gap-12 sm:gap-16 grid lg:grid-cols-2">
                    <div className="space-y-6 sm:space-y-8">
                        <h2 className="font-light text-3xl sm:text-4xl">
                            Let's Connect
                        </h2>

                        <div className="space-y-6">
                            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
                                Always interested in backend, systems, and
                                platform opportunities, plus collaborations
                                around open-source tooling.
                            </p>

                            <div className="space-y-4">
                                <Link
                                    href="mailto:dev.bosepiush@gmail.com"
                                    className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                                >
                                    <span className="text-base sm:text-lg">
                                        dev.bosepiush@gmail.com
                                    </span>
                                    <svg
                                        className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-300 transform"
                                        aria-hidden="true"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                        <div className="font-mono text-muted-foreground text-sm">
                            ELSEWHERE
                        </div>

                        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                            {socials.map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.url}
                                    className="group hover:shadow-sm p-4 border border-border hover:border-muted-foreground/50 rounded-lg transition-all duration-300"
                                >
                                    <div className="space-y-2">
                                        <div className="text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                                            {social.name}
                                        </div>
                                        <div className="text-muted-foreground text-sm">
                                            {social.handle}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-12 sm:py-16 border-border border-t">
                <div className="flex lg:flex-row flex-col justify-between items-start lg:items-center gap-6 sm:gap-8">
                    <div className="space-y-2">
                        <div className="text-muted-foreground text-sm">
                            © 2026 Piush Bose. All rights reserved.
                        </div>
                        <div className="text-muted-foreground text-xs">
                            Built with Next.js and v0 template customization
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onToggleTheme}
                            className="group p-3 border border-border hover:border-muted-foreground/50 rounded-lg transition-all duration-300"
                            aria-label="Toggle theme"
                        >
                            <ThemeIcon
                                key={isDark ? "dark" : "light"}
                                isDark={isDark}
                            />
                        </button>

                        <button
                            type="button"
                            className="group p-3 border border-border hover:border-muted-foreground/50 rounded-lg transition-all duration-300"
                        >
                            <svg
                                className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                                aria-hidden="true"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </footer>
        </>
    );
}
