"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

interface ContributionDay {
	date: string;
	contributionCount: number;
	weekday: number;
}

interface ContributionWeek {
	contributionDays: ContributionDay[];
}

interface ContributionData {
	totalContributions: number;
	totalCommits: number;
	weeks: ContributionWeek[];
}

interface GitHubStats {
	contributions: ContributionData;
	currentStreak: number;
	longestStreak: number;
}

// Flattened day used for the bar chart
interface DayBar {
	date: string;
	count: number;
}

const GITHUB_USERNAME = "dtg-lucifer";
const BAR_DAYS = 95;

function computeStreaks(weeks: ContributionWeek[]): { current: number; longest: number } {
	const days = weeks.flatMap((w) => w.contributionDays).sort((a, b) => a.date.localeCompare(b.date));

	let longest = 0;
	let streak = 0;
	for (const day of days) {
		if (day.contributionCount > 0) {
			streak++;
			if (streak > longest) longest = streak;
		} else {
			streak = 0;
		}
	}

	const today = new Date().toISOString().slice(0, 10);
	let current = 0;
	for (let i = days.length - 1; i >= 0; i--) {
		const day = days[i];
		if (day.date > today) continue;
		if (day.contributionCount > 0) current++;
		else break;
	}

	return { current, longest };
}

function getLast95Days(weeks: ContributionWeek[]): DayBar[] {
	const all = weeks
		.flatMap((w) => w.contributionDays)
		.sort((a, b) => a.date.localeCompare(b.date));
	return all.slice(-BAR_DAYS).map((d) => ({ date: d.date, count: d.contributionCount }));
}

export default function GitHubSection({ sectionRef }: { sectionRef: (el: HTMLElement | null) => void }) {
	const [stats, setStats] = useState<GitHubStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [hovered, setHovered] = useState<number | null>(null);
	const [animated, setAnimated] = useState(false);
	const chartRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchContributions = async () => {
			try {
				const res = await fetch("/api/github-contributions");
				if (!res.ok) throw new Error("fetch failed");
				const data = (await res.json()) as ContributionData;
				const { current, longest } = computeStreaks(data.weeks);
				setStats({
					contributions: data,
					currentStreak: current,
					longestStreak: longest,
				});
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchContributions();
	}, []);

	// Trigger bar animation when chart enters viewport
	useEffect(() => {
		if (!chartRef.current) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setAnimated(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.2 },
		);
		observer.observe(chartRef.current);
		return () => observer.disconnect();
	}, [loading]);

	const bars: DayBar[] = stats ? getLast95Days(stats.contributions.weeks) : [];
	const max = Math.max(...bars.map((b) => b.count), 1);
	const total = bars.reduce((s, b) => s + b.count, 0);

	return (
		<section id="activity" ref={sectionRef} className="py-20 sm:py-32">
			<div className="space-y-12 sm:space-y-16">
				{/* Header */}
				<div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
					<div className="space-y-2">
						<div className="font-mono text-muted-foreground/60 text-xs uppercase tracking-[0.3em]">
							Activity
						</div>
						<h2 className="font-light text-3xl sm:text-4xl">GitHub Contributions</h2>
					</div>
					<a
						className="group flex items-center gap-1.5 hover:bg-foreground p-1 sm:p-2 text-muted-foreground hover:text-background text-sm underline underline-offset-4 transition-colors"
						href={`https://github.com/${GITHUB_USERNAME}`}
						rel="noopener noreferrer"
						target="_blank"
					>
						@{GITHUB_USERNAME}
						<ExternalLink className="w-3 h-3" />
					</a>
				</div>

				{/* Stats row */}
				{!loading && !error && stats && (
					<div className="gap-px grid grid-cols-2 sm:grid-cols-4 border border-border/50">
						{[
							{
								label: "Contributions",
								value: stats.contributions.totalContributions.toLocaleString(),
								sub: "last year",
							},
							{ label: "Current Streak", value: `${stats.currentStreak}d`, sub: "days in a row" },
							{ label: "Longest Streak", value: `${stats.longestStreak}d`, sub: "personal best" },
							{
								label: "Total Commits",
								value: stats.contributions.totalCommits.toLocaleString(),
								sub: "lifetime",
							},
						].map((stat) => (
							<div
								className="flex flex-col gap-1 bg-card/30 hover:bg-card/60 px-5 py-5 transition-colors duration-300"
								key={stat.label}
							>
								<div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
									{stat.label}
								</div>
								<div className="font-light tabular-nums text-2xl sm:text-3xl">{stat.value}</div>
								<div className="text-muted-foreground/50 text-xs">{stat.sub}</div>
							</div>
						))}
					</div>
				)}

				{/* Bar chart card */}
				<div className="relative bg-card/20 p-5 sm:p-8 border border-border/50 overflow-hidden">
					{/* Stats row inside card */}
					{!loading && !error && stats && (
						<div className="flex justify-between items-center mb-6">
							<div>
								<p className="font-mono font-semibold tabular-nums text-foreground text-xl">
									{total.toLocaleString()}
								</p>
								<p className="mt-0.5 font-mono text-[11px] text-muted-foreground/50">
									commits · last {BAR_DAYS} days
								</p>
							</div>
							<a
								href={`https://github.com/${GITHUB_USERNAME}`}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
							>
								<svg
									viewBox="0 0 24 24"
									className="fill-current w-3.5 h-3.5"
									aria-hidden="true"
								>
									<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
								</svg>
								{GITHUB_USERNAME}
								<svg
									viewBox="0 0 24 24"
									className="fill-none stroke-2 stroke-current w-3 h-3"
									aria-hidden="true"
								>
									<path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</a>
						</div>
					)}

					{/* Loading skeleton */}
					{loading && (
						<div>
							<div className="flex justify-between items-center mb-6">
								<div className="space-y-1.5">
									<div className="bg-foreground/8 rounded w-16 h-6 animate-pulse" />
									<div className="bg-foreground/6 rounded w-32 h-3 animate-pulse" />
								</div>
								<div className="bg-foreground/6 rounded w-28 h-4 animate-pulse" />
							</div>
							<div className="flex items-end gap-[3px] h-20">
								{Array.from({ length: BAR_DAYS }).map((_, i) => (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton bars
										key={i}
										className="flex-1 bg-foreground/8 rounded-sm animate-pulse"
										style={{ height: `${20 + Math.random() * 60}%` }}
									/>
								))}
							</div>
							<div className="flex justify-between mt-2">
								<span className="font-mono text-[10px] text-muted-foreground/30">{BAR_DAYS}d ago</span>
								<span className="font-mono text-[10px] text-muted-foreground/30">today</span>
							</div>
						</div>
					)}

					{error && (
						<div className="flex justify-center items-center h-32 font-mono text-muted-foreground/50 text-sm">
							Could not load contribution data.
						</div>
					)}

					{/* Bar chart */}
					{!loading && !error && stats && (
						<div ref={chartRef}>
							<div className="flex items-end gap-[3px] h-20">
								{bars.map((bar, i) => {
									const heightPct =
										bar.count === 0
											? 8
											: Math.max(12, (bar.count / max) * 100);
									const isHov = hovered === i;

									// Opacity-based fill matching the reference
									const bgStyle: React.CSSProperties =
										bar.count === 0
											? { backgroundColor: "rgb(from var(--foreground) r g b / 0.06)" }
											: isHov
												? { backgroundColor: "rgb(from var(--foreground) r g b / 0.9)" }
												: {
														backgroundColor: `rgb(from var(--foreground) r g b / ${(0.15 + (bar.count / max) * 0.65).toFixed(3)})`,
													};

									return (
										<div
											key={bar.date}
											className="group relative flex-1 cursor-default"
											style={{ height: "100%", display: "flex", alignItems: "flex-end" }}
											onMouseEnter={() => setHovered(i)}
											onMouseLeave={() => setHovered(null)}
										>
											<div
												className="rounded-sm w-full transition-colors duration-150"
												style={{
													height: `${heightPct}%`,
													...bgStyle,
													transformOrigin: "bottom",
													transform: animated ? "scaleY(1)" : "scaleY(0)",
													transition: `transform 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 4}ms, background-color 150ms`,
												}}
											/>
											{/* Tooltip */}
											{isHov && bar.count > 0 && (
												<div className="bottom-[calc(100%+6px)] left-1/2 z-10 absolute bg-foreground px-2 py-1 rounded font-mono text-[10px] text-background whitespace-nowrap -translate-x-1/2 pointer-events-none">
													{bar.count} on {bar.date}
												</div>
											)}
										</div>
									);
								})}
							</div>

							{/* X-axis labels */}
							<div className="flex justify-between mt-2">
								<span className="font-mono text-[10px] text-muted-foreground/30">{BAR_DAYS}d ago</span>
								<span className="font-mono text-[10px] text-muted-foreground/30">today</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
