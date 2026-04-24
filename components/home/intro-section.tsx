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
		<header id="intro" ref={sectionRef} className="flex items-center opacity-0 min-h-screen">
			<div className="gap-12 sm:gap-16 grid lg:grid-cols-5 w-full">
				<div className="space-y-6 sm:space-y-8 lg:col-span-3">
					<div className="space-y-3 sm:space-y-2">
						<div className="pl-1 font-mono text-muted-foreground text-sm tracking-wider">
							ABOUT ME / 2026
						</div>
						<h1 className="font-light text-5xl sm:text-6xl lg:text-7xl tracking-tight">
							<GlitchRevealText text="Piush" className="font-space tracking-wide" />
							<br />
							<GlitchRevealText text="Bose" className="font-space hollow-text" />
						</h1>
					</div>

					<div className="space-y-6 max-w-md">
						<p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
							Indie software engineer building {"&"} specializing in scalable, event-driven systems and
							resilient backend architecture.
						</p>

						<div className="flex sm:flex-row flex-col sm:items-center gap-3 sm:gap-4 text-muted-foreground text-sm">
							<div className="flex items-center gap-2">
								<div className="bg-green-500 rounded-full w-2 h-2 animate-pulse" />
								Available for work {"·"} Kolkata, India
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col justify-end space-y-6 sm:space-y-8 lg:col-span-2 mt-8 lg:mt-0">
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
									className="px-3 py-1 border border-border hover:border-muted-foreground/50 rounded-full text-xs transition-colors duration-300"
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
