"use client";

import { useEffect, useState } from "react";
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

const GITHUB_USERNAME = "dtg-lucifer";

// Intensity level 0–4 based on count
function getLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
	if (count === 0) return 0;
	if (max === 0) return 0;
	const ratio = count / max;
	if (ratio < 0.15) return 1;
	if (ratio < 0.4) return 2;
	if (ratio < 0.7) return 3;
	return 4;
}

const levelClasses: Record<0 | 1 | 2 | 3 | 4, string> = {
	0: "bg-border/40",
	1: "bg-emerald-900/60",
	2: "bg-emerald-700/70",
	3: "bg-emerald-500/80",
	4: "bg-emerald-400",
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function computeStreaks(weeks: ContributionWeek[]): { current: number; longest: number } {
	const days = weeks.flatMap((w) => w.contributionDays).sort((a, b) => a.date.localeCompare(b.date));

	let current = 0;
	let longest = 0;
	let streak = 0;

	const today = new Date().toISOString().slice(0, 10);

	// longest streak
	for (const day of days) {
		if (day.contributionCount > 0) {
			streak++;
			if (streak > longest) longest = streak;
		} else {
			streak = 0;
		}
	}

	// current streak (walk backwards from today)
	for (let i = days.length - 1; i >= 0; i--) {
		const day = days[i];
		if (day.date > today) continue;
		if (day.contributionCount > 0) {
			current++;
		} else {
			break;
		}
	}

	return { current, longest };
}

function getMonthPositions(weeks: ContributionWeek[]): { label: string; col: number }[] {
	const positions: { label: string; col: number }[] = [];
	let lastMonth = -1;

	weeks.forEach((week, colIndex) => {
		const firstDay = week.contributionDays[0];
		if (!firstDay) return;
		const month = new Date(firstDay.date).getMonth();
		if (month !== lastMonth) {
			positions.push({ label: MONTH_LABELS[month], col: colIndex });
			lastMonth = month;
		}
	});

	return positions;
}

export default function GitHubSection({ sectionRef }: { sectionRef: (el: HTMLElement | null) => void }) {
	const [stats, setStats] = useState<GitHubStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

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

	const weeks = stats?.contributions.weeks ?? [];
	const allDays = weeks.flatMap((w) => w.contributionDays);
	const maxCount = Math.max(...allDays.map((d) => d.contributionCount), 1);
	const monthPositions = getMonthPositions(weeks);

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

				{/* Contribution grid */}
				<div className="relative bg-card/20 p-5 sm:p-6 border border-border/50 overflow-hidden">
					{loading && (
						<div className="flex justify-center items-center h-32 font-mono text-muted-foreground/50 text-sm">
							Loading activity...
						</div>
					)}

					{error && (
						<div className="flex justify-center items-center h-32 font-mono text-muted-foreground/50 text-sm">
							Could not load contribution data.
						</div>
					)}

					{!loading && !error && stats && (
						<div className="overflow-x-auto">
							<div className="inline-block min-w-full">
								{/* Month labels */}
								<div className="relative mb-2 ml-8 h-4">
									{monthPositions.map(({ label, col }) => (
										<span
											className="absolute font-mono text-[10px] text-muted-foreground/50"
											key={`${label}-${col}`}
											style={{ left: `${col * 13}px` }}
										>
											{label}
										</span>
									))}
								</div>

								{/* Grid with day labels */}
								<div className="flex gap-1">
									{/* Day-of-week labels */}
									<div className="flex flex-col gap-[3px] mr-1 pt-px">
										{DAY_LABELS.map((label, i) => (
											<div
												// biome-ignore lint/suspicious/noArrayIndexKey: static labels
												className="flex justify-end items-center w-6 h-[10px] font-mono text-[9px] text-muted-foreground/40 leading-none"
												key={i}
											>
												{label}
											</div>
										))}
									</div>

									{/* Weeks */}
									<div className="flex gap-[3px]">
										{weeks.map((week, wi) => (
											<div className="flex flex-col gap-[3px]" key={`week-${wi}`}>
												{/* Pad top if week doesn't start on Sunday */}
												{Array.from({ length: week.contributionDays[0]?.weekday ?? 0 }).map(
													(_, pi) => (
														<div
															className="rounded-[2px] w-[10px] h-[10px]"
															// biome-ignore lint/suspicious/noArrayIndexKey: padding cells
															key={`pad-${pi}`}
														/>
													),
												)}
												{week.contributionDays.map((day) => {
													const level = getLevel(day.contributionCount, maxCount);
													return (
														<div
															className={`rounded-[2px] w-[10px] h-[10px] cursor-default transition-opacity duration-150 hover:opacity-70 ${levelClasses[level]}`}
															key={day.date}
															onMouseEnter={(e) => {
																const rect = (
																	e.currentTarget as HTMLElement
																).getBoundingClientRect();
																const parentRect = (
																	e.currentTarget.closest(
																		".relative",
																	) as HTMLElement
																)?.getBoundingClientRect();
																setTooltip({
																	text:
																		day.contributionCount === 0
																			? `No contributions on ${day.date}`
																			: `${day.contributionCount} contribution${day.contributionCount !== 1 ? "s" : ""} on ${day.date}`,
																	x: rect.left - (parentRect?.left ?? 0) + 5,
																	y: rect.top - (parentRect?.top ?? 0) - 28,
																});
															}}
															onMouseLeave={() => setTooltip(null)}
														/>
													);
												})}
											</div>
										))}
									</div>
								</div>

								{/* Legend */}
								<div className="flex justify-end items-center gap-2 mt-4">
									<span className="font-mono text-[10px] text-muted-foreground/40">Less</span>
									{([0, 1, 2, 3, 4] as const).map((level) => (
										<div
											className={`rounded-[2px] w-[10px] h-[10px] ${levelClasses[level]}`}
											key={level}
										/>
									))}
									<span className="font-mono text-[10px] text-muted-foreground/40">More</span>
								</div>
							</div>
						</div>
					)}

					{/* Tooltip */}
					{tooltip && (
						<div
							className="z-10 absolute bg-background/95 shadow-lg px-2 py-1 border border-border/70 font-mono text-[11px] text-foreground whitespace-nowrap pointer-events-none"
							style={{ left: tooltip.x, top: tooltip.y }}
						>
							{tooltip.text}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
