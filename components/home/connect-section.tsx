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

export default function ConnectSection({ sectionRef }: ConnectSectionProps) {
	return (
		<section id="connect" ref={sectionRef} className="py-20 opacity-0 sm:py-32">
			<div className="grid gap-12 sm:gap-16 lg:grid-cols-2">
				<div className="space-y-6 sm:space-y-8">
					<h2 className="font-light text-3xl sm:text-4xl">Let's Connect</h2>

					<div className="space-y-6">
						<p className="text-lg text-muted-foreground leading-relaxed sm:text-xl">
							Always interested in backend, systems, and platform opportunities, plus collaborations
							around open-source tooling.
						</p>

						<div className="space-y-4">
							<Link
								href="mailto:mail@piush.in"
								className="group flex items-center gap-3 text-foreground transition-colors duration-300 hover:text-muted-foreground"
							>
								<span className="text-base sm:text-lg">mail@piush.in</span>
								<svg
									className="h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
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
					<div className="font-mono text-muted-foreground text-sm">ELSEWHERE</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{socials.map((social) => (
							<Link
								key={social.name}
								href={social.url}
								className="group rounded-lg border border-border p-4 transition-all duration-300 hover:border-muted-foreground/50 hover:shadow-sm"
							>
								<div className="space-y-2">
									<div className="text-foreground transition-colors duration-300 group-hover:text-muted-foreground">
										{social.name}
									</div>
									<div className="text-muted-foreground text-sm">{social.handle}</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
