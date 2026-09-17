"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
	IconFolder,
	IconArticle,
	IconMessage,
	IconMedia,
	IconSync,
	IconSun,
	IconMoon,
	IconCross,
} from "@/components/cms-icons";
import { Menu, ArrowUpRight } from "lucide-react";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [authenticated, setAuthenticated] = useState<boolean | null>(null);
	const [curatorEmail, setCuratorEmail] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState("");
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const [pendingCount, setPendingCount] = useState<number>(0);

	// IST Clock
	useEffect(() => {
		setMounted(true);
		const updateTime = () => {
			try {
				const now = new Date();
				const formatted = new Intl.DateTimeFormat("en-IN", {
					timeZone: "Asia/Kolkata",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hour12: false,
				}).format(now);
				setCurrentTime(formatted);
			} catch {
				setCurrentTime("");
			}
		};
		updateTime();
		const timer = setInterval(updateTime, 1000);
		return () => clearInterval(timer);
	}, []);

	// Auth check
	useEffect(() => {
		if (pathname === "/cms/login") {
			setAuthenticated(false);
			return;
		}

		const checkAuth = async () => {
			try {
				const res = await fetch("/api/cms/auth");
				if (res.ok) {
					const data = await res.json();
					setAuthenticated(true);
					setCuratorEmail(data.email);
				} else {
					setAuthenticated(false);
					router.push("/cms/login");
				}
			} catch {
				setAuthenticated(false);
				router.push("/cms/login");
			}
		};

		checkAuth();
	}, [pathname, router]);

	// Fetch pending guestbook count for badge
	useEffect(() => {
		if (authenticated && pathname !== "/cms/login") {
			const fetchCounts = async () => {
				try {
					const res = await fetch("/api/cms/guestbook");
					if (res.ok) {
						const data = await res.json();
						setPendingCount(data.counts?.pending || 0);
					}
				} catch (err) {
					console.warn("Could not fetch pending guestbook count:", err);
				}
			};
			fetchCounts();
			const interval = setInterval(fetchCounts, 30000);
			return () => clearInterval(interval);
		}
	}, [authenticated, pathname]);

	// Close mobile sidebar on route change
	useEffect(() => {
		setMobileSidebarOpen(false);
	}, [pathname]);

	const handleLogout = async () => {
		await fetch("/api/cms/auth", { method: "DELETE" });
		setAuthenticated(false);
		router.push("/cms/login");
	};

	if (pathname === "/cms/login") {
		return <>{children}</>;
	}

	if (authenticated === null) {
		return (
			<div className="cms-root min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col items-center justify-center text-xs">
				<div className="flex flex-col items-center gap-4">
					<span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-ping" />
					<span className="uppercase tracking-widest text-[var(--muted)]">
						Verifying Curator Credentials...
					</span>
				</div>
			</div>
		);
	}

	if (!authenticated) {
		return null;
	}

	const isDark = resolvedTheme === "dark";
	// Muted, refined accent specifically for CMS panel to eliminate eye strain
	const mutedAccent = isDark ? "#ba614c" : "#9e4734";

	const navItems = [
		{
			name: "Projects",
			href: "/cms/projects",
			icon: <IconFolder />,
			active: pathname === "/cms" || pathname === "/cms/projects",
			badge: null,
		},
		{
			name: "Articles",
			href: "/cms/articles",
			icon: <IconArticle />,
			active: pathname === "/cms/articles",
			badge: null,
		},
		{
			name: "Guestbook",
			href: "/cms/guestbook",
			icon: <IconMessage />,
			active: pathname === "/cms/guestbook",
			badge: pendingCount > 0 ? `${pendingCount} pending` : null,
			badgeHighlight: pendingCount > 0,
		},
		{
			name: "Media Library",
			href: "/cms/media",
			icon: <IconMedia />,
			active: pathname === "/cms/media",
			badge: null,
		},
		{
			name: "Dual Sync & Health",
			href: "/cms/sync",
			icon: <IconSync />,
			active: pathname === "/cms/sync",
			badge: null,
		},
	];

	return (
		<div
			className="cms-root min-h-screen lg:h-screen lg:overflow-hidden bg-[var(--paper)] text-[var(--ink)] antialiased flex flex-col lg:flex-row selection:bg-[var(--accent)] selection:text-white"
			style={{ ["--accent" as string]: mutedAccent }}
		>
			{/* Mobile Top Header */}
			<header className="lg:hidden sticky top-0 z-40 bg-[var(--paper)]/90 backdrop-blur-md border-b border-[var(--line)] px-4 h-14 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
						className="p-2 text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ink)] font-mono text-xs cursor-pointer flex items-center justify-center"
						aria-label="Toggle sidebar menu"
					>
						{mobileSidebarOpen ? <IconCross /> : <Menu className="!text-xs" />}
					</button>
					<Link href="/cms/projects" className="flex items-center gap-1.5 font-space font-medium text-[var(--ink)]">
						<span>PB.</span>
						<span className="font-mono text-[9px] uppercase px-1 py-0.5 border border-[var(--line)] bg-[var(--card)] text-[var(--muted)]">
							CMS
						</span>
					</Link>
				</div>

				<div className="flex items-center gap-2 font-mono text-xs">
					{pendingCount > 0 && (
						<Link
							href="/cms/guestbook"
							className="px-2 py-0.5 bg-[var(--accent)] text-white text-[10px] uppercase tracking-wider"
						>
							{pendingCount} Pending
						</Link>
					)}
					<button
						type="button"
						onClick={handleLogout}
						className="px-2 py-1 border border-[var(--line)] text-[10px] uppercase text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
					>
						Logout
					</button>
				</div>
			</header>

			{/* Sidebar (Desktop Fixed Full-Height Column / Mobile Drawer) */}
			<aside
				className={`fixed lg:static top-0 left-0 bottom-0 z-50 h-screen lg:h-full w-64 lg:w-72 shrink-0 bg-[var(--card)] border-r border-[var(--line)] flex flex-col justify-between p-6 transition-transform duration-200 overflow-y-auto ${
					mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				}`}
			>
				{/* Top Branding */}
				<div className="space-y-6">
					<div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
						<Link href="/cms/projects" className="group block">
							<div className="flex items-center gap-2">
								<span className="font-space font-semibold text-xl text-[var(--ink)] tracking-tight">
									PB<span className="text-[var(--accent)]">.</span>
								</span>
								<span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-[var(--paper)] border border-[var(--line)] text-[var(--accent)] font-semibold">
									CURATOR
								</span>
							</div>
							<span className="font-mono text-[10px] text-[var(--muted)] block mt-0.5">
								Hybrid CMS Engine
							</span>
						</Link>

						<button
							type="button"
							onClick={() => setMobileSidebarOpen(false)}
							className="lg:hidden p-1 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
							aria-label="Close sidebar"
						>
							<IconCross />
						</button>
					</div>

					{/* Navigation List */}
					<nav className="space-y-1.5 font-mono text-xs" aria-label="CMS Navigation">
						<span className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-medium block mb-2 px-2">
							Management
						</span>

						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center justify-between px-3 py-2.5 transition-all group ${item.active
									? "bg-[var(--accent)] !text-white font-medium shadow-xs"
									: "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] border border-transparent hover:border-[var(--line)]"
									}`}
							>
								<div className="flex items-center gap-2.5">
									<span className="opacity-80">{item.icon}</span>
									<span className="tracking-wide">{item.name}</span>
								</div>

								{item.badge && (
									<span
										className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 font-semibold ${item.active
											? "bg-white text-[var(--accent)]"
											: item.badgeHighlight
												? "bg-[var(--accent)] text-white animate-pulse"
												: "bg-[var(--paper)] text-[var(--muted)] border border-[var(--line)]"
											}`}
									>
										{item.badge}
									</span>
								)}
							</Link>
						))}
					</nav>

					{/* Quick Links Section */}
					<div className="pt-4 border-t border-[var(--line)] space-y-1 font-mono text-[11px]">
						<span className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-medium block mb-2 px-2">
							Portals
						</span>
						<Link
							href="/"
							target="_blank"
							className="flex items-center justify-between px-3 py-1.5 text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
						>
							<span>Live Website</span>
							<ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
						</Link>
						<Link
							href="/guestbook"
							target="_blank"
							className="flex items-center justify-between px-3 py-1.5 text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
						>
							<span>Public Guestbook</span>
							<ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
						</Link>
					</div>
				</div>

				{/* Sidebar Footer */}
				<div className="pt-4 border-t border-[var(--line)] space-y-3 font-mono text-xs">
					{/* IST Clock */}
					<div className="flex items-center justify-between text-[10px] text-[var(--muted)] px-1">
						<span>Kolkata, IN</span>
						<span className="text-[var(--ink)] font-semibold">{currentTime} IST</span>
					</div>

					{/* Theme Switcher & Logout */}
					<div className="flex items-center gap-2">
						{mounted && (
							<button
								type="button"
								onClick={() => setTheme(isDark ? "light" : "dark")}
								aria-label="Toggle theme"
								className="flex-1 px-2.5 py-1.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] text-[10px] tracking-wider uppercase cursor-pointer transition-colors flex items-center justify-center gap-1.5"
							>
								{isDark ? <IconSun /> : <IconMoon />}
								<span>{isDark ? "Light" : "Dark"}</span>
							</button>
						)}
						<button
							type="button"
							onClick={handleLogout}
							className="flex-1 px-2.5 py-1.5 bg-[var(--paper)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--ink)] text-[10px] uppercase tracking-wider cursor-pointer transition-colors text-center"
							title="Log out"
						>
							Logout
						</button>
					</div>

					{/* Curator info */}
					<div className="text-[9px] text-[var(--muted)] px-1 truncate block" title={curatorEmail || ""}>
						Curator: <span className="text-[var(--ink)]">{curatorEmail}</span>
					</div>
				</div>
			</aside>

			{/* Mobile Overlay */}
			{mobileSidebarOpen && (
				<div
					onClick={() => setMobileSidebarOpen(false)}
					className="fixed inset-0 z-45 bg-black/60 backdrop-blur-xs lg:hidden"
				/>
			)}

			{/* Main Content Pane */}
			<main className="flex-1 min-w-0 lg:h-full px-4 sm:px-8 lg:px-12 py-8 overflow-y-auto">
				<div className="max-w-6xl mx-auto">{children}</div>
			</main>
		</div>
	);
}
