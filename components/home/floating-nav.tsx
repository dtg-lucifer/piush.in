"use client";

import Link from "next/link";
import { useState } from "react";

interface FloatingNavProps {
	activeSection: string;
	onNavigate: (section: string) => void;
}

const sections = [
	{ id: "intro", label: "Intro" },
	{ id: "experience", label: "Experience" },
	{ id: "skills", label: "Skills" },
	{ id: "work", label: "Work" },
	{ id: "thoughts", label: "Thoughts" },
	{ id: "connect", label: "Connect" },
];

const pages = [
	{ href: "/blog", label: "Blog" },
	{ href: "/projects", label: "Projects" },
];

export default function FloatingNav({ activeSection, onNavigate }: FloatingNavProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<>
			{/* ── Desktop: right-side vertical pill ── */}
			<nav
				aria-label="Page navigation"
				className="hidden top-1/2 right-6 z-50 fixed xl:flex -translate-y-1/2"
			>
				<div className="flex flex-col items-end gap-1 bg-background/70 shadow-lg backdrop-blur-md px-3 py-4 border border-border rounded-2xl">
					{/* Section links */}
					<div className="flex flex-col items-end gap-1 w-full">
						<span className="mb-1 pr-1 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
							Sections
						</span>
						{sections.map(({ id, label }) => {
							const isActive = activeSection === id;
							return (
								<button
									aria-label={`Go to ${label}`}
									className={`group flex items-center gap-2 rounded-lg px-2 py-1 text-right text-xs transition-all duration-300 ${
										isActive
											? "text-foreground"
											: "text-muted-foreground/50 hover:text-muted-foreground"
									}`}
									key={id}
									onClick={() => onNavigate(id)}
									type="button"
								>
									<span
										className={`transition-all duration-300 ${
											isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
										}`}
									>
										{label}
									</span>
									<span
										className={`block h-[2px] rounded-full transition-all duration-300 ${
											isActive
												? "w-5 bg-foreground"
												: "w-2 bg-muted-foreground/40 group-hover:w-3 group-hover:bg-muted-foreground/60"
										}`}
									/>
								</button>
							);
						})}
					</div>

					{/* Divider */}
					<div className="my-2 bg-border w-full h-px" />

					{/* Page links */}
					<div className="flex flex-col items-end gap-1 w-full">
						<span className="mb-1 pr-1 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
							Pages
						</span>
						{pages.map(({ href, label }) => (
							<Link
								className="flex items-center gap-2 px-2 py-1 rounded-lg text-muted-foreground/50 hover:text-muted-foreground text-xs transition-all duration-300"
								href={href}
								key={href}
							>
								<span>{label}</span>
								<span className="block bg-muted-foreground/30 rounded-full w-2 hover:w-3 h-[2px] transition-all duration-300" />
							</Link>
						))}
					</div>
				</div>
			</nav>

			{/* ── Mobile: bottom-right collapsed pill ── */}
			<div className="xl:hidden right-4 bottom-6 z-50 fixed">
				{/* Expanded menu */}
				<div
					className={`absolute bottom-12 right-0 mb-2 flex flex-col items-end gap-1 rounded-2xl border border-border bg-background/90 px-3 py-3 shadow-xl backdrop-blur-md transition-all duration-300 ${
						expanded
							? "pointer-events-auto translate-y-0 opacity-100"
							: "pointer-events-none translate-y-2 opacity-0"
					}`}
				>
					<span className="mb-1 pr-1 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
						Sections
					</span>
					{sections.map(({ id, label }) => {
						const isActive = activeSection === id;
						return (
							<button
								className={`rounded-lg px-3 py-1 text-xs transition-all duration-200 ${
									isActive
										? "text-foreground"
										: "text-muted-foreground/60 hover:text-muted-foreground"
								}`}
								key={id}
								onClick={() => {
									onNavigate(id);
									setExpanded(false);
								}}
								type="button"
							>
								{label}
							</button>
						);
					})}

					<div className="my-1 bg-border w-full h-px" />

					<span className="mb-1 pr-1 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
						Pages
					</span>
					{pages.map(({ href, label }) => (
						<Link
							className="px-3 py-1 rounded-lg text-muted-foreground/60 hover:text-muted-foreground text-xs transition-all duration-200"
							href={href}
							key={href}
							onClick={() => setExpanded(false)}
						>
							{label}
						</Link>
					))}
				</div>

				{/* Toggle button */}
				<button
					aria-label={expanded ? "Close navigation" : "Open navigation"}
					className="flex justify-center items-center bg-background/80 shadow-lg backdrop-blur-md border border-border hover:border-muted-foreground/40 rounded-full w-10 h-10 transition-all duration-300"
					onClick={() => setExpanded((v) => !v)}
					type="button"
				>
					<span
						className={`font-mono text-xs text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-45" : ""}`}
					>
						{expanded ? "✕" : "≡"}
					</span>
				</button>
			</div>
		</>
	);
}
