"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SyncStatus } from "@/lib/cms/types";
import { IconSync } from "@/components/cms-icons";

export default function CmsSyncPage() {
	const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [syncing, setSyncing] = useState(false);
	const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

	const showNotice = (text: string, type: "success" | "error" | "info" = "success") => {
		setNotice({ text, type });
		setTimeout(() => setNotice(null), 4000);
	};

	const loadSyncStatus = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/cms/sync");
			if (res.ok) {
				const data = await res.json();
				setSyncStatus(data);
			} else {
				showNotice("Failed to load sync status", "error");
			}
		} catch (err) {
			console.error("Error loading sync status:", err);
			showNotice("Network error loading sync status", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadSyncStatus();
	}, []);

	const handleManualSync = async () => {
		setSyncing(true);
		try {
			const res = await fetch("/api/cms/sync", { method: "POST" });
			const data = await res.json();
			if (res.ok && data.success) {
				setSyncStatus(data.status);
				showNotice("Hybrid Sync complete: Firestore and local JSON files synchronized!", "success");
			} else {
				showNotice(`Sync notice: ${data.error || "Operated with local storage fallback"}`, "info");
			}
		} catch (_err) {
			showNotice("Network error during sync", "error");
		} finally {
			setSyncing(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Top Header Card */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="w-2 h-2 bg-[var(--accent)] inline-block" />
							<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">
								Infrastructure Telemetry
							</span>
						</div>
						<h1 className="font-space font-medium text-2xl text-[var(--ink)]">
							Dual Sync &amp; Firestore Health
						</h1>
						<p className="font-mono text-xs text-[var(--muted)] mt-1.5 leading-relaxed max-w-xl">
							Monitors bidirectional synchronization between local JSON files (
							<code>public/projects/__data.json</code>, <code>public/articles/__data.json</code>) and Google Firebase Firestore collections.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2 shrink-0">
						<button
							type="button"
							disabled={syncing}
							onClick={handleManualSync}
							className="px-4 py-2.5 bg-[var(--accent)] text-white hover:opacity-90 font-mono text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
						>
							{syncing ? (
								<>
									<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
									<span>Syncing...</span>
								</>
							) : (
								<>
									<IconSync className="w-3.5 h-3.5" />
									<span>Trigger Sync Now</span>
								</>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Toast Notice */}
			{notice && (
				<div
					className={`p-3.5 border font-mono text-xs ${
						notice.type === "success"
							? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--ink)]"
							: notice.type === "error"
								? "bg-red-500/10 border-red-500 text-red-500"
								: "bg-[var(--card)] border-[var(--line)] text-[var(--ink)]"
					}`}
				>
					{notice.text}
				</div>
			)}

			{/* Status Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				{/* Connection */}
				<div className="border border-[var(--line)] bg-[var(--card)] p-5 space-y-2">
					<span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">
						Firestore Status
					</span>
					<div className="flex items-center gap-2">
						<span
							className={`w-2.5 h-2.5 rounded-full ${
								syncStatus?.firestoreConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
							}`}
						/>
						<span className="font-space font-medium text-lg text-[var(--ink)]">
							{loading ? "Checking..." : syncStatus?.firestoreConnected ? "Connected" : "Local Fallback"}
						</span>
					</div>
					<p className="font-mono text-[10px] text-[var(--muted)]">
						{syncStatus?.firestoreConnected
							? "Cloud Firestore synchronized with local storage."
							: "Operating locally. Changes persist to local disk."}
					</p>
				</div>

				{/* Projects in Sync */}
				<div className="border border-[var(--line)] bg-[var(--card)] p-5 space-y-2">
					<span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">
						Projects Synced
					</span>
					<div className="font-space font-medium text-2xl text-[var(--ink)]">
						{loading ? "..." : syncStatus?.projectsCount ?? 0}
					</div>
					<p className="font-mono text-[10px] text-[var(--muted)]">
						Stored in <code>public/projects/__data.json</code>
					</p>
				</div>

				{/* Articles in Sync */}
				<div className="border border-[var(--line)] bg-[var(--card)] p-5 space-y-2">
					<span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">
						Articles Synced
					</span>
					<div className="font-space font-medium text-2xl text-[var(--ink)]">
						{loading ? "..." : syncStatus?.articlesCount ?? 0}
					</div>
					<p className="font-mono text-[10px] text-[var(--muted)]">
						Stored in <code>public/articles/__data.json</code>
					</p>
				</div>

				{/* Guestbook in Sync */}
				<div className="border border-[var(--line)] bg-[var(--card)] p-5 space-y-2">
					<span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">
						Guestbook Synced
					</span>
					<div className="font-space font-medium text-2xl text-[var(--ink)]">
						{loading ? "..." : syncStatus?.guestbookCount ?? 0}
					</div>
					<p className="font-mono text-[10px] text-[var(--muted)]">
						Stored in <code>public/guestbook/__data.json</code>
					</p>
				</div>

				{/* Last Sync */}
				<div className="border border-[var(--line)] bg-[var(--card)] p-5 space-y-2">
					<span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">
						Last Synchronization
					</span>
					<div className="font-mono text-xs font-semibold text-[var(--ink)] truncate" title={syncStatus?.lastSync || ""}>
						{loading ? "..." : syncStatus?.lastSync ? new Date(syncStatus.lastSync).toLocaleTimeString() : "Pending"}
					</div>
					<p className="font-mono text-[10px] text-[var(--muted)]">
						{syncStatus?.lastSync ? new Date(syncStatus.lastSync).toLocaleDateString() : "No sync recorded"}
					</p>
				</div>
			</div>

			{/* Architecture Explanation Card */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-6 space-y-4">
				<h2 className="font-space font-medium text-lg text-[var(--ink)]">
					How the Hybrid Sync Engine Works
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs text-[var(--muted)] leading-relaxed">
					<div className="space-y-2 p-4 bg-[var(--paper)] border border-[var(--line)]">
						<span className="text-[var(--accent)] font-bold text-sm block">01. Startup Boot</span>
						<p>
							When the Next.js server starts up, <code>instrumentation.ts</code> reads the local JSON files on disk and verifies they match Firebase Firestore collections.
						</p>
					</div>

					<div className="space-y-2 p-4 bg-[var(--paper)] border border-[var(--line)]">
						<span className="text-[var(--accent)] font-bold text-sm block">02. Two-Way Writes</span>
						<p>
							Whenever an edit, reorder, or deletion occurs in the CMS, changes write to both Firestore and the local JSON files simultaneously.
						</p>
					</div>

					<div className="space-y-2 p-4 bg-[var(--paper)] border border-[var(--line)]">
						<span className="text-[var(--accent)] font-bold text-sm block">03. Graceful Resilience</span>
						<p>
							If Firebase security rules or network are unreachable, the CMS automatically operates in local fallback mode so you never lose work.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
