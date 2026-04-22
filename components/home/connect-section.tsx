"use client";

import Link from "next/link";

interface ConnectSectionProps {
    sectionRef: (el: HTMLElement | null) => void;
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
    { sectionRef }: ConnectSectionProps,
) {
    return (
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
                            Always interested in backend, systems, and platform
                            opportunities, plus collaborations around
                            open-source tooling.
                        </p>

                        <div className="space-y-4">
                            <Link
                                href="mailto:mail@piush.in"
                                className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                            >
                                <span className="text-base sm:text-lg">
                                    mail@piush.in
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
    );
}
