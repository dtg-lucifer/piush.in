"use client";

import { useEffect, useState, useId } from "react";
import { ArrowUpRight } from "lucide-react";

interface ContributionDay {
	date: string;
	contributionCount: number;
	weekday: number;
}

interface ContributionWeek {
	contributionDays: ContributionDay[];
}

interface ContributionsData {
	totalContributions: number;
	totalCommits?: number;
	weeks: ContributionWeek[];
}

interface Point {
	x: number;
	y: number;
	date: string;
	count: number;
}

export default function GitHubCommitGraph() {
	const [data, setData] = useState<ContributionsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const gradientId = useId();

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 640);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		let active = true;
		async function fetchContributions() {
			try {
				const res = await fetch("/api/github-contributions");
				if (!res.ok) throw new Error("Failed to fetch");
				const json = await res.json();
				if (active) {
					setData(json);
					setLoading(false);
				}
			} catch (err) {
				console.error("Failed to load GitHub activity:", err);
				if (active) setLoading(false);
			}
		}
		fetchContributions();
		return () => {
			active = false;
		};
	}, []);

	// Flatten contribution days from all weeks
	const allDays: ContributionDay[] = (data?.weeks ?? []).flatMap((w) => w.contributionDays);

	// Full 30 days data on both mobile and desktop as requested
	const daysWindow = 30;
	const activeDays: ContributionDay[] = allDays.length >= daysWindow ? allDays.slice(-daysWindow) : allDays;

	// Total commits in the 30-day window
	const totalCommitsWindow = activeDays.reduce((acc, d) => acc + d.contributionCount, 0);

	// Calculate active streak (consecutive days with > 0 contributions ending at yesterday or today)
	let currentStreak = 0;
	if (allDays.length > 0) {
		const reversed = [...allDays].reverse();
		let startIndex = 0;
		if (reversed[0]?.contributionCount === 0 && (reversed[1]?.contributionCount ?? 0) > 0) {
			startIndex = 1;
		}
		for (let i = startIndex; i < reversed.length; i++) {
			if (reversed[i].contributionCount > 0) {
				currentStreak++;
			} else {
				break;
			}
		}
	}

	// SVG Dimensions: Use standard coordinate system
	const svgWidth = 800;
	const svgHeight = 220;
	const padX = 24;
	const padTop = 25;
	const padBottom = 30;
	const plotWidth = svgWidth - padX * 2;
	const plotHeight = svgHeight - padTop - padBottom;

	// Compute points along the line
	const maxCount = Math.max(...activeDays.map((d) => d.contributionCount), 1);
	const n = activeDays.length;

	const points: Point[] = activeDays.map((d, i) => {
		const x = padX + (i / Math.max(n - 1, 1)) * plotWidth;
		const normalized = d.contributionCount / maxCount;
		const y = padTop + plotHeight * (1 - normalized * 0.88);
		return { x, y, date: d.date, count: d.contributionCount };
	});

	// Catmull-Rom or Bezier spline interpolation for smooth curve
	function generateSmoothPath(pts: Point[]): { pathD: string; areaD: string } {
		if (pts.length === 0) return { pathD: "", areaD: "" };
		if (pts.length === 1) {
			const p = pts[0];
			return {
				pathD: `M ${p.x} ${p.y}`,
				areaD: `M ${p.x} ${p.y} L ${p.x} ${padTop + plotHeight} Z`,
			};
		}

		let pathD = `M ${pts[0].x} ${pts[0].y}`;

		for (let i = 0; i < pts.length - 1; i++) {
			const p0 = pts[Math.max(i - 1, 0)];
			const p1 = pts[i];
			const p2 = pts[i + 1];
			const p3 = pts[Math.min(i + 2, pts.length - 1)];

			// Tension / curvature controls
			const cp1x = p1.x + (p2.x - p0.x) / 6;
			const cp1y = p1.y + (p2.y - p0.y) / 6;

			const cp2x = p2.x - (p3.x - p1.x) / 6;
			const cp2y = p2.y - (p3.y - p1.y) / 6;

			pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
		}

		const baselineY = padTop + plotHeight;
		const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${baselineY} L ${pts[0].x.toFixed(1)} ${baselineY} Z`;

		return { pathD, areaD };
	}

	const { pathD, areaD } = generateSmoothPath(points);

	// Date format helpers
	const formatDate = (dateStr: string) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	const startDateLabel = activeDays.length > 0 ? formatDate(activeDays[0].date) : "";
	const midDateLabel = activeDays.length > 0 ? formatDate(activeDays[Math.floor(activeDays.length / 2)].date) : "";
	const endDateLabel = activeDays.length > 0 ? formatDate(activeDays[activeDays.length - 1].date) : "";

	return (
		<section className="commit-graph-section page-section" id="activity">
			<div className="commit-graph-card">
				{/* Top Bar / Header */}
				<div className="commit-graph-header">
					<div className="commit-graph-title-col">
						<div className="commit-graph-badge">
							<svg
								aria-hidden="true"
								className="commit-graph-github-icon"
								fill="currentColor"
								height="16"
								viewBox="0 0 16 16"
								width="16"
							>
								<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
							</svg>
							<span>COMMIT GRAPH</span>
						</div>
						<h3 className="commit-graph-subtext">
							{loading ? (
								<span className="commit-graph-skeleton-text">Loading activity…</span>
							) : (
								<>
									<strong>{totalCommitsWindow}</strong> commits in the last {daysWindow} days
								</>
							)}
						</h3>
					</div>

					<div className="commit-graph-actions">
						{/* Streak Pill */}
						<div className="commit-graph-streak-pill">
							<span className="commit-graph-streak-dot" />
							<span>
								{currentStreak} {currentStreak === 1 ? "day" : "days"} streak
							</span>
						</div>

						{/* Profile Link Pill */}
						<a
							className="commit-graph-profile-pill"
							href="https://github.com/dtg-lucifer"
							rel="noopener noreferrer"
							target="_blank"
						>
							<span>@dtg-lucifer</span>
							<ArrowUpRight className="w-3 h-3 commit-graph-profile-arrow" aria-hidden="true" />
						</a>
					</div>
				</div>

				{/* SVG Graph Container */}
				<div className="commit-graph-canvas-wrap">
					{loading ? (
						<div className="commit-graph-loading-state">
							<div className="commit-graph-pulse" />
						</div>
					) : (
						<svg className="commit-graph-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
							<defs>
								{/* Subtle green gradient fill matching screenshot */}
								<linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
									<stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
									<stop offset="60%" stopColor="#10b981" stopOpacity="0.12" />
									<stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
								</linearGradient>
							</defs>

							{/* Area under the line */}
							{areaD && <path d={areaD} fill={`url(#${gradientId})`} className="commit-graph-area" />}

							{/* Spline line */}
							{pathD && (
								<path
									d={pathD}
									fill="none"
									stroke="#10b981"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.75"
									className="commit-graph-line"
								/>
							)}

							{/* Points along the spline */}
							{points.map((pt, i) => {
								const isHovered = hoveredPoint?.date === pt.date;
								return (
									<g key={pt.date || i}>
										{/* Outer ring on hover */}
										{isHovered && (
											<circle
												cx={pt.x}
												cy={pt.y}
												r="7"
												fill="#10b981"
												fillOpacity="0.25"
												className="transition-all duration-150"
											/>
										)}
										{/* Main data point */}
										<circle
											cx={pt.x}
											cy={pt.y}
											r={isHovered ? 4.5 : 3.25}
											fill="var(--paper, #fff)"
											stroke="#10b981"
											strokeWidth={isHovered ? 2.5 : 2}
											className="cursor-pointer transition-all duration-150"
											onMouseEnter={() => setHoveredPoint(pt)}
											onMouseLeave={() => setHoveredPoint(null)}
										/>
										{/* Invisible hover area for easy cursor targeting */}
										<circle
											cx={pt.x}
											cy={pt.y}
											r="14"
											fill="transparent"
											className="cursor-pointer"
											onMouseEnter={() => setHoveredPoint(pt)}
											onMouseLeave={() => setHoveredPoint(null)}
										/>
									</g>
								);
							})}
						</svg>
					)}

					{/* Tooltip on hover */}
					{hoveredPoint && (
						<div
							className="commit-graph-tooltip"
							style={{
								left: `${(hoveredPoint.x / svgWidth) * 100}%`,
								top: `${(hoveredPoint.y / svgHeight) * 100}%`,
							}}
						>
							<div className="commit-graph-tooltip-count">
								<strong>{hoveredPoint.count}</strong> {hoveredPoint.count === 1 ? "commit" : "commits"}
							</div>
							<div className="commit-graph-tooltip-date">{formatDate(hoveredPoint.date)}</div>
						</div>
					)}
				</div>

				{/* Bottom Timeline Date Labels */}
				<div className="commit-graph-footer-dates">
					<span>{startDateLabel}</span>
					<span>{midDateLabel}</span>
					<span>{endDateLabel}</span>
				</div>
			</div>
		</section>
	);
}
