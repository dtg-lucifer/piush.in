"use client";

import GlitchRevealText from "@/components/glitch-text";

interface IntroSectionProps {
	sectionRef: (el: HTMLElement | null) => void;
}

const focusSkills = [
	"Distributed Systems",
	"Cloud Infrastructure",
	"Backend Engineering",
	"Full Stack Development",
	"Web3 & Blockchain",
];

export default function IntroSection({ sectionRef }: IntroSectionProps) {
	return (
		<header id="intro" ref={sectionRef} className="flex min-h-screen items-center opacity-0">
			<div className="grid w-full gap-12 sm:gap-16 lg:grid-cols-5">
				<div className="space-y-6 sm:space-y-8 lg:col-span-3">
					<div className="space-y-3 sm:space-y-2">
						<div className="pl-1 font-mono text-muted-foreground text-sm tracking-wider">
							ABOUT ME / 2026
						</div>
						<h1 className="font-light text-5xl tracking-tight sm:text-6xl lg:text-7xl">
							<GlitchRevealText text="Piush" />
							<br />
							<GlitchRevealText text="Bose" className="text-muted-foreground" />
						</h1>
					</div>

					<div className="max-w-md space-y-6">
						<p className="text-lg text-muted-foreground leading-relaxed sm:text-xl">
							Indie software engineer building {"&"} specializing in scalable, event-driven systems and
							resilient backend architecture.
						</p>

						<div className="flex flex-col gap-3 text-muted-foreground text-sm sm:flex-row sm:items-center sm:gap-4">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
								Available for work {"·"} Kolkata, India
							</div>
						</div>
					</div>
				</div>

				<div className="mt-8 flex flex-col justify-end space-y-6 sm:space-y-8 lg:col-span-2 lg:mt-0">
					<div className="space-y-4">
						<div className="font-mono text-muted-foreground text-sm">CURRENTLY</div>
						<div className="space-y-2">
							<div className="text-foreground">
								<GlitchRevealText text="Software Engineer · SDE II" />
							</div>
							<div className="text-muted-foreground">@ Netpiedev</div>
							<div className="text-muted-foreground text-xs">Apr, 2026 - Present</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="font-mono text-muted-foreground text-sm">FOCUS</div>
						<div className="flex flex-wrap gap-2">
							{focusSkills.map((skill) => (
								<span
									key={skill}
									className="rounded-full border border-border px-3 py-1 text-xs transition-colors duration-300 hover:border-muted-foreground/50"
								>
									{skill}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
