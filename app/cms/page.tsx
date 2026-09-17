"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { GuestbookEntry, SyncStatus, Project, ArticleMeta } from "@/lib/cms/types";

export default function CmsOverviewPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [articles, setArticles] = useState<ArticleMeta[]>([]);
	const [guestbookCounts, setGuestbookCounts] = useState<{ total: number; pending: number; approved: number }>({
		total: 0,
		pending: 0,
		approved: 0,
	});
	const [pendingNotes, setPendingNotes] = useState<GuestbookEntry[]>([]);
	const [mediaCount, setMediaCount] = useState<number>(0);
	const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [actionId, setActionId] = useState<string | null>(null);
	const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

	const showNotice = (text: string, type: "success" | "error" | "info" = "success") => {
		setNotice({ text, type });
		setTimeout(() => setNotice(null), 4000);
	};

	const loadDashboard = async () => {
		setLoading(true);
		try {
			const [pRes, aRes, gRes, mRes, sRes] = await Promise.all([
				fetch("/api/cms/projects"),
				fetch("/api/cms/articles"),
				fetch("/api/cms/guestbook?status=all"),
				fetch("/api/cms/media"),
				fetch("/api/cms/sync"),
			]);

			if (pRes.ok) {
				const p = await pRes.json();
				setProjects(p.projects || []);
			}
			if (aRes.ok) {
				const a = await aRes.json();
				setArticles(a.articles || []);
			}
			if (gRes.ok) {
				const g = await gRes.json();
				if (g.counts) setGuestbookCounts(g.counts);
				const pending = (g.entries || []).filter((e: GuestbookEntry) => e.status === "pending");
				setPendingNotes(pending);
			}
			if (mRes.ok) {
				const m = await mRes.json();
				setMediaCount((m.media || []).length);
			}
			if (sRes.ok) {
				const s = await sRes.json();
				setSyncStatus(s);
			}
		} catch (err) {
			console.error("Error loading dashboard data:", err);
			showNotice("Failed to load dashboard metrics", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadDashboard();
	}, []);

	// Quick approve from overview
	const handleQuickApprove = async (id: string) => {
		setActionId(id);
		try {
			const res = await fetch("/api/cms/guestbook", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, status: "approved" }),
			});
			if (res.ok) {
				setPendingNotes((prev) => prev.filter((n) => n.id !== id));
				setGuestbookCounts((prev) => ({
					...prev,
					pending: Math.max(0, prev.pending - 1),
					approved: prev.approved + 1,
				}));
				showNotice("Note approved and published!", "success");
			}
		} catch (err) {
			console.error("Error quick approving note:", err);
		} finally {
			setActionId(null);
		}
	};

	return (
		<div className="space-y-8">
			{/* Top Hero Banner */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<span className="w-2.5 h-2.5 bg-[var(--accent)] inline-block" />
							<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold">
								Curator Overview
							</span>
						</div>
						<h1 className="font-space font-medium text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
							Command Center
						</h1>
						<p className="font-mono text-xs text-[var(--muted)] mt-1.5 leading-relaxed max-w-xl">
							Welcome to the piush.in Hybrid CMS. Use the sidebar to curate projects, publish articles, moderate guestbook signatures, and manage public folder media assets.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3 shrink-0 font-mono text-xs">
						<Link
							href="/cms/projects"
							className="px-4 py-2.5 bg-[var(--accent)] !text-white hover:opacity-90 transition-opacity uppercase tracking-wider"
						>
							Manage Projects →
						</Link>
						<Link
							href="/guestbook"
							target="_blank"
							className="px-4 py-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)] transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
						>
							<span>Public Guestbook</span>
							<span>↗</span>
						</Link>
					</div>
				</div>
			</div>

			{/* Notice Toast */}
			{notice && (
				<div
					className={`p-3.5 border font-mono text-xs ${notice.type === "success"
						? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--ink)]"
						: notice.type === "error"
							? "bg-red-500/10 border-red-500 text-red-500"
							: "bg-[var(--card)] border-[var(--line)] text-[var(--ink)]"
						}`}
				>
					{notice.text}
				</div>
			)}

			{/* Metric Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Projects Card */}
				<Link
					href="/cms/projects"
					className="border border-[var(--line)] bg-[var(--card)] p-5 hover:border-[var(--accent)] transition-all group block"
				>
					<div className="flex items-center justify-between font-mono text-xs text-[var(--muted)] mb-2">
						<span className="uppercase tracking-wider">Projects</span>
						<span className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
					</div>
					<div className="font-space font-medium text-3xl text-[var(--ink)]">
						{loading ? "..." : projects.length}
					</div>
					<p className="font-mono text-[10px] text-[var(--muted)] mt-1">
						{projects.filter((p) => p.featured).length} featured on homepage
					</p>
				</Link>

				{/* Articles Card */}
				<Link
					href="/cms/articles"
					className="border border-[var(--line)] bg-[var(--card)] p-5 hover:border-[var(--accent)] transition-all group block"
				>
					<div className="flex items-center justify-between font-mono text-xs text-[var(--muted)] mb-2">
						<span className="uppercase tracking-wider">Articles</span>
						<span className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
					</div>
					<div className="font-space font-medium text-3xl text-[var(--ink)]">
						{loading ? "..." : articles.length}
					</div>
					<p className="font-mono text-[10px] text-[var(--muted)] mt-1">
						{articles.filter((a) => a.featured).length} spotlighted on homepage
					</p>
				</Link>

				{/* Guestbook Moderation Card */}
				<Link
					href="/cms/guestbook"
					className={`border p-5 transition-all group block ${guestbookCounts.pending > 0
						? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-xs"
						: "border-[var(--line)] bg-[var(--card)] hover:border-[var(--accent)]"
						}`}
				>
					<div className="flex items-center justify-between font-mono text-xs text-[var(--muted)] mb-2">
						<span className="uppercase tracking-wider">Guestbook</span>
						{guestbookCounts.pending > 0 && (
							<span className="px-1.5 py-0.5 bg-[var(--accent)] text-white text-[9px] uppercase tracking-wider font-bold">
								{guestbookCounts.pending} Pending
							</span>
						)}
					</div>
					<div className="font-space font-medium text-3xl text-[var(--ink)]">
						{loading ? "..." : guestbookCounts.approved}
					</div>
					<p className="font-mono text-[10px] text-[var(--muted)] mt-1">
						{guestbookCounts.total} total signatures recorded
					</p>
				</Link>

				{/* Media Assets Card */}
				<Link
					href="/cms/media"
					className="border border-[var(--line)] bg-[var(--card)] p-5 hover:border-[var(--accent)] transition-all group block"
				>
					<div className="flex items-center justify-between font-mono text-xs text-[var(--muted)] mb-2">
						<span className="uppercase tracking-wider">Public Assets</span>
						<span className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
					</div>
					<div className="font-space font-medium text-3xl text-[var(--ink)]">
						{loading ? "..." : mediaCount}
					</div>
					<p className="font-mono text-[10px] text-[var(--muted)] mt-1">
						Distributed across /public directories
					</p>
				</Link>
			</div>

			{/* Moderation Alert / Pending Queue Section */}
			{pendingNotes.length > 0 && (
				<div className="border border-[var(--accent)]/60 bg-[var(--card)] p-6 space-y-4">
					<div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
							<h2 className="font-space font-medium text-lg text-[var(--ink)]">
								Awaiting Your Moderation ({pendingNotes.length})
							</h2>
						</div>
						<Link
							href="/cms/guestbook"
							className="font-mono text-xs text-[var(--accent)] hover:underline uppercase tracking-wider"
						>
							View Moderation Panel →
						</Link>
					</div>

					<div className="space-y-3">
						{pendingNotes.slice(0, 3).map((note) => (
							<div
								key={note.id}
								className="p-4 bg-[var(--paper)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs"
							>
								<div className="flex items-start gap-3">
									{note.userAvatar ? (
										<div className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--line)] shrink-0">
											<Image src={note.userAvatar} alt={note.userName} fill className="object-cover" />
										</div>
									) : (
										<div className="w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center font-bold">
											{note.userName[0]}
										</div>
									)}
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-[var(--ink)]">{note.userName}</span>
											{note.userHandle && (
												<span className="text-[var(--muted)] text-[10px]">@{note.userHandle}</span>
											)}
										</div>
										<p className="font-sans text-xs text-[var(--ink)] line-clamp-2">
											&ldquo;{note.message}&rdquo;
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2 shrink-0">
									<button
										type="button"
										disabled={actionId === note.id}
										onClick={() => handleQuickApprove(note.id)}
										className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold uppercase tracking-wider text-[10px] cursor-pointer disabled:opacity-50"
									>
										Approve &amp; Publish
									</button>
									<Link
										href="/cms/guestbook"
										className="px-2.5 py-1.5 border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] uppercase tracking-wider text-[10px]"
									>
										Review
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Infrastructure Status */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
				<div className="flex items-center gap-3">
					<span
						className={`w-3 h-3 rounded-full ${syncStatus?.firestoreConnected ? "bg-emerald-500" : "bg-amber-500"
							}`}
					/>
					<div>
						<span className="font-semibold text-[var(--ink)] block">
							{syncStatus?.firestoreConnected ? "Dual Sync Connected" : "Local Storage Mode"}
						</span>
						<span className="text-[10px] text-[var(--muted)]">
							Local files: public/projects/__data.json &amp; public/articles/__data.json
						</span>
					</div>
				</div>

				<Link
					href="/cms/sync"
					className="text-[var(--accent)] hover:underline uppercase tracking-wider text-[11px]"
				>
					Infrastructure Diagnostics →
				</Link>
			</div>
		</div>
	);
}
