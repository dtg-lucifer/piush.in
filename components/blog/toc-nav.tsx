"use client";

import { useEffect, useRef, useState } from "react";

export interface TocItem {
	id: string;
	label: string;
	depth: number; // 1 = h1, 2 = h2, 3 = h3
}

interface TocNavProps {
	items: TocItem[];
}

export default function TocNav({ items }: TocNavProps) {
	const [activeId, setActiveId] = useState<string>("");
	const [expanded, setExpanded] = useState(false);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		if (items.length === 0) return;

		const headingEls = items
			.map(({ id }) => document.getElementById(id))
			.filter(Boolean) as HTMLElement[];

		observerRef.current = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((e) => e.isIntersecting);
				if (visible.length === 0) return;
				// pick the one closest to the top
				const top = visible.reduce((best, e) =>
					e.boundingClientRect.top < best.boundingClientRect.top ? e : best,
				);
				setActiveId(top.target.id);
			},
			{ rootMargin: "0px 0px -60% 0px", threshold: 0 },
		);

		for (const el of headingEls) observerRef.current.observe(el);
		return () => observerRef.current?.disconnect();
	}, [items]);

	const scrollTo = (id: string) => {
		const el = document.getElementById(id);
		if (!el) return;
		el.scrollIntoView({ behavior: "smooth", block: "start" });
		setActiveId(id);
		setExpanded(false);
	};

	if (items.length === 0) return null;

	return (
		<>
			{/* ── Desktop: right-side vertical pill ── */}
			<nav
				aria-label="Table of contents"
				className="hidden top-1/2 left-6 z-50 fixed xl:flex max-h-[80vh] -translate-y-1/2"
			>
				<div className="flex flex-col items-start bg-background/70 shadow-lg backdrop-blur-md px-3 py-4 min-w-[180px] max-w-[220px] max-h-[80vh]">
					{/* Pinned header — never scrolls */}
					<span className="mb-1 pl-2 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest shrink-0">
						Contents
					</span>
					{/* Scrollable list — no scrollbar */}
					<div className="flex flex-col items-start gap-1 w-full overflow-y-auto no-scrollbar">
						{items.map(({ id, label, depth }) => {
							const isActive = activeId === id;
							return (
								<button
									aria-label={`Go to ${label}`}
									className={`group flex w-full items-center gap-2 px-2 py-1 text-left text-xs transition-all duration-300 ${
										isActive
											? "text-foreground"
											: "text-muted-foreground/50 hover:text-muted-foreground"
									}`}
									key={id}
									onClick={() => scrollTo(id)}
									style={{ paddingLeft: `${(depth - 1) * 10 + 8}px` }}
									type="button"
								>
									<span
										className={`block h-[2px] shrink-0 rounded-full transition-all duration-300 ${
											isActive
												? "w-5 bg-foreground"
												: "w-2 bg-muted-foreground/40 group-hover:w-3 group-hover:bg-muted-foreground/60"
										}`}
									/>
									<span
										className={`truncate transition-all duration-300 ${
											isActive ? "opacity-100" : "opacity-80"
										}`}
									>
										{label}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			</nav>

			{/* ── Mobile: top-right collapsed ── */}
			<div className="xl:hidden top-6 right-2 z-50 fixed">
				{/* Expanded menu */}
				<div
					className={`absolute top-12 right-0 flex flex-col items-start border border-border bg-background/90 px-3 py-3 shadow-xl backdrop-blur-md transition-all duration-300 min-w-[180px] max-w-[240px] max-h-[60vh] ${
						expanded
							? "pointer-events-auto translate-y-0 opacity-100"
							: "pointer-events-none -translate-y-2 opacity-0"
					}`}
				>
					<span className="mb-1 pl-1 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest shrink-0">
						Contents
					</span>
					<div className="flex flex-col items-start gap-1 w-full overflow-y-auto no-scrollbar">
						{items.map(({ id, label, depth }) => {
							const isActive = activeId === id;
							return (
								<button
									className={`w-full py-1 text-left text-xs transition-all duration-200 ${
										isActive
											? "text-foreground"
											: "text-muted-foreground/60 hover:text-muted-foreground"
									}`}
									key={id}
									onClick={() => scrollTo(id)}
									style={{ paddingLeft: `${(depth - 1) * 10 + 12}px` }}
									type="button"
								>
									{label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Toggle button — matches home nav style exactly */}
				<button
					aria-label={expanded ? "Close table of contents" : "Open table of contents"}
					className="flex justify-center items-center bg-background/80 shadow-lg backdrop-blur-md border border-border hover:border-muted-foreground/40 w-10 h-10 transition-all duration-300"
					onClick={() => setExpanded((v) => !v)}
					type="button"
				>
					<span
						className={`font-mono text-lg text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-45" : ""}`}
					>
						{expanded ? "✕" : "≡"}
					</span>
				</button>
			</div>
		</>
	);
}
