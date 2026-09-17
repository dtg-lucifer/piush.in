"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GuestbookEntry } from "@/lib/cms/types";
import {
	IconSearch,
	IconTrash,
	IconCheck,
	IconCross,
	IconSync,
} from "@/components/cms-icons";

export default function CmsGuestbookPage() {
	const [entries, setEntries] = useState<GuestbookEntry[]>([]);
	const [counts, setCounts] = useState<{ total: number; pending: number; approved: number; rejected: number }>({
		total: 0,
		pending: 0,
		approved: 0,
		rejected: 0,
	});
	const [filterStatus, setFilterStatus] = useState<"pending" | "approved" | "all">("pending");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const [actionInProgress, setActionInProgress] = useState<string | null>(null);
	const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	const showNotice = (text: string, type: "success" | "error" | "info" = "success") => {
		setNotice({ text, type });
		setTimeout(() => setNotice(null), 4000);
	};

	const loadGuestbookData = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/cms/guestbook?status=all");
			if (res.ok) {
				const data = await res.json();
				setEntries(data.entries || []);
				if (data.counts) setCounts(data.counts);
			} else {
				showNotice("Failed to load guestbook entries", "error");
			}
		} catch (err) {
			console.error("Error loading CMS guestbook:", err);
			showNotice("Network error loading guestbook", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadGuestbookData();
	}, []);

	// Update status action (Approve / Reject / Pending)
	const handleStatusChange = async (id: string, newStatus: "approved" | "rejected" | "pending") => {
		setActionInProgress(id);
		try {
			const res = await fetch("/api/cms/guestbook", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, status: newStatus }),
			});

			const data = await res.json();
			if (res.ok && data.success) {
				setEntries((prev) =>
					prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
				);
				if (data.counts) setCounts(data.counts);
				showNotice(
					newStatus === "approved"
						? "Note approved and published to /guestbook."
						: newStatus === "rejected"
							? "Note marked as rejected."
							: "Note returned to pending moderation.",
					"success",
				);
			} else {
				showNotice(data.error || "Failed to update note status", "error");
			}
		} catch (err) {
			console.error("Error updating status:", err);
			showNotice("Network error updating status", "error");
		} finally {
			setActionInProgress(null);
		}
	};

	// Delete action
	const handleDelete = async (id: string) => {
		setActionInProgress(id);
		try {
			const res = await fetch(`/api/cms/guestbook?id=${encodeURIComponent(id)}`, {
				method: "DELETE",
			});

			const data = await res.json();
			if (res.ok && data.success) {
				setEntries((prev) => prev.filter((e) => e.id !== id));
				if (data.counts) setCounts(data.counts);
				setConfirmDeleteId(null);
				showNotice("Note permanently deleted.", "success");
			} else {
				showNotice(data.error || "Failed to delete note", "error");
			}
		} catch (err) {
			console.error("Error deleting note:", err);
			showNotice("Network error deleting note", "error");
		} finally {
			setActionInProgress(null);
		}
	};

	// Format date
	const formatDate = (timestamp: number) => {
		try {
			const date = new Date(timestamp);
			return new Intl.DateTimeFormat("en-IN", {
				dateStyle: "medium",
				timeStyle: "short",
			}).format(date);
		} catch {
			return "Unknown";
		}
	};

	// Filtered list
	const filteredEntries = useMemo(() => {
		return entries.filter((entry) => {
			if (filterStatus !== "all" && entry.status !== filterStatus) {
				return false;
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				return (
					entry.userName.toLowerCase().includes(q) ||
					(entry.userHandle && entry.userHandle.toLowerCase().includes(q)) ||
					entry.message.toLowerCase().includes(q)
				);
			}
			return true;
		});
	}, [entries, filterStatus, searchQuery]);

	return (
		<div className="space-y-6">
			{/* Top Header Card */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="w-2 h-2 bg-[var(--accent)] inline-block" />
							<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">
								Moderation Queue
							</span>
						</div>
						<h1 className="font-space font-medium text-2xl text-[var(--ink)]">
							Guestbook Signatures
						</h1>
						<p className="font-mono text-xs text-[var(--muted)] mt-1.5 leading-relaxed max-w-xl">
							Review notes submitted by developers authenticated with GitHub. Approve valid signatures to publish them directly on the public{" "}
							<Link href="/guestbook" target="_blank" className="text-[var(--accent)] hover:underline">
								/guestbook
							</Link>{" "}
							page.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2 shrink-0 font-mono text-xs">
						<button
							type="button"
							onClick={loadGuestbookData}
							disabled={loading}
							className="px-3 py-2 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
						>
							<IconSync className="w-3.5 h-3.5" />
							<span>{loading ? "Refreshing..." : "Refresh"}</span>
						</button>
						<a
							href="/api/cms/guestbook/download"
							download="guestbook.json"
							className="px-3 py-2 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer flex items-center gap-2"
							title="Export all guestbook entries as JSON file"
						>
							<svg className="w-3.5 h-3.5 text-[var(--foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
							<span>Download JSON</span>
						</a>
						<Link
							href="/guestbook"
							target="_blank"
							className="px-4 py-2 bg-[var(--accent)] text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
						>
							<span className="text-white">View Public Wall</span>
							<svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" /></svg>
						</Link>
					</div>
				</div>
			</div>

			{/* Toast Notice */}
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

			{/* Filter & Search Bar */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-4 space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					{/* Search */}
					<div className="relative flex-1 max-w-md">
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search by name, @github, or note text..."
							className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-xs font-mono text-[var(--ink)] outline-none pl-8"
						/>
						<span className="absolute left-2.5 top-2.5 text-[var(--muted)] pointer-events-none">
							<IconSearch className="w-3.5 h-3.5" />
						</span>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-2 text-[var(--muted)] hover:text-[var(--ink)] font-mono text-xs cursor-pointer p-0.5"
							>
								<IconCross className="w-3 h-3" />
							</button>
						)}
					</div>

					{/* Metrics Pills */}
					<div className="flex flex-wrap items-center gap-2 font-mono text-xs">
						<button
							type="button"
							onClick={() => setFilterStatus("pending")}
							className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${filterStatus === "pending"
								? "bg-[var(--accent)] text-white border-[var(--accent)] font-semibold"
								: "bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
								}`}
						>
							<span>Pending</span>
							<span
								className={`text-[10px] px-1.5 py-0.2 border ${filterStatus === "pending"
									? "border-white/40 bg-white/20 text-white"
									: "border-[var(--line)] bg-[var(--card)] text-[var(--accent)] font-bold"
									}`}
							>
								{counts.pending}
							</span>
						</button>

						<button
							type="button"
							onClick={() => setFilterStatus("approved")}
							className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${filterStatus === "approved"
								? "bg-[var(--accent)] text-white border-[var(--accent)] font-semibold"
								: "bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
								}`}
						>
							<span>Approved</span>
							<span
								className={`text-[10px] px-1.5 py-0.2 border ${filterStatus === "approved"
									? "border-white/40 bg-white/20 text-white"
									: "border-[var(--line)] bg-[var(--card)] text-[var(--muted)]"
									}`}
							>
								{counts.approved}
							</span>
						</button>

						<button
							type="button"
							onClick={() => setFilterStatus("all")}
							className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${filterStatus === "all"
								? "bg-[var(--accent)] text-white border-[var(--accent)] font-semibold"
								: "bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
								}`}
						>
							<span>All Notes</span>
							<span
								className={`text-[10px] px-1.5 py-0.2 border ${filterStatus === "all"
									? "border-white/40 bg-white/20 text-white"
									: "border-[var(--line)] bg-[var(--card)] text-[var(--muted)]"
									}`}
							>
								{counts.total}
							</span>
						</button>
					</div>
				</div>
			</div>

			{/* Entries List */}
			{loading ? (
				<div className="border border-[var(--line)] bg-[var(--card)] p-12 text-center font-mono text-xs text-[var(--muted)]">
					<div className="flex flex-col items-center gap-3">
						<span className="w-3 h-3 rounded-full bg-[var(--accent)] animate-ping" />
						<span>Loading moderation queue...</span>
					</div>
				</div>
			) : filteredEntries.length === 0 ? (
				<div className="border border-[var(--line)] bg-[var(--card)] p-12 text-center">
					<p className="font-space text-lg text-[var(--ink)] font-medium mb-1">
						No notes found
					</p>
					<p className="font-mono text-xs text-[var(--muted)] max-w-sm mx-auto">
						{filterStatus === "pending"
							? "No notes are currently awaiting moderation. All caught up!"
							: filterStatus === "approved"
								? "No approved signatures found in the archive."
								: "No guestbook entries matched your search query."}
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{filteredEntries.map((entry) => {
						const isPending = entry.status === "pending";
						const isApproved = entry.status === "approved";
						const isRejected = entry.status === "rejected";
						const isBusy = actionInProgress === entry.id;

						return (
							<div
								key={entry.id}
								className={`border p-5 transition-colors bg-[var(--card)] ${isPending
									? "border-[var(--accent)]/60 bg-[var(--accent)]/5"
									: "border-[var(--line)] hover:border-[var(--ink)]"
									}`}
							>
								<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
									{/* User & Info */}
									<div className="flex items-start gap-3">
										{entry.userAvatar ? (
											<div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--line)] shrink-0">
												<Image
													src={entry.userAvatar}
													alt={entry.userName}
													fill
													className="object-cover"
												/>
											</div>
										) : (
											<div className="w-10 h-10 rounded-full bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center font-mono text-xs font-semibold shrink-0">
												{(entry.userName || "U")[0]}
											</div>
										)}

										<div className="space-y-1 font-mono text-xs">
											<div className="flex items-center gap-2 flex-wrap">
												<span className="font-space font-medium text-sm text-[var(--ink)]">
													{entry.userName}
												</span>
												{entry.userHandle && (
													<a
														href={`https://github.com/${entry.userHandle}`}
														target="_blank"
														rel="noopener noreferrer"
														className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)] underline"
													>
														@{entry.userHandle}
													</a>
												)}
												{/* Status Pill */}
												<span
													className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold border ${isApproved
														? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
														: isPending
															? "bg-[var(--accent)] text-white border-[var(--accent)]"
															: "bg-zinc-500/10 border-zinc-500/40 text-[var(--muted)]"
														}`}
												>
													{entry.status}
												</span>
											</div>

											<div className="text-[10px] text-[var(--muted)] flex items-center gap-3">
												<span>Submitted: {formatDate(entry.createdAt)}</span>
												{entry.userEmail && <span>• {entry.userEmail}</span>}
											</div>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex items-center gap-2 shrink-0 font-mono text-xs">
										{isPending && (
											<>
												<button
													type="button"
													disabled={isBusy}
													onClick={() => handleStatusChange(entry.id, "approved")}
													className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white uppercase tracking-wider font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-[11px]"
												>
													<IconCheck className="w-3.5 h-3.5" />
													<span>Approve &amp; Publish</span>
												</button>

												<button
													type="button"
													disabled={isBusy}
													onClick={() => handleStatusChange(entry.id, "rejected")}
													className="px-2.5 py-1.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-red-500 uppercase tracking-wider cursor-pointer text-[11px]"
												>
													<span>Reject</span>
												</button>
											</>
										)}

										{isApproved && (
											<button
												type="button"
												disabled={isBusy}
												onClick={() => handleStatusChange(entry.id, "pending")}
												className="px-2.5 py-1.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] uppercase tracking-wider cursor-pointer text-[10px]"
												title="Move back to pending queue"
											>
												<span>Move to Pending</span>
											</button>
										)}

										{isRejected && (
											<button
												type="button"
												disabled={isBusy}
												onClick={() => handleStatusChange(entry.id, "approved")}
												className="px-2.5 py-1.5 border border-[var(--line)] bg-[var(--paper)] text-emerald-600 uppercase tracking-wider cursor-pointer text-[10px]"
											>
												<span>Approve</span>
											</button>
										)}

										<button
											type="button"
											disabled={isBusy}
											onClick={() => setConfirmDeleteId(entry.id)}
											className="px-2 py-1.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-red-500 cursor-pointer text-xs flex items-center justify-center"
											title="Delete note"
										>
											<IconTrash className="w-3.5 h-3.5" />
										</button>
									</div>
								</div>

								{/* Message Content */}
								<div className="mt-4 pt-3 border-t border-[var(--line)]">
									<p className="font-sans text-xs sm:text-sm text-[var(--ink)] leading-relaxed whitespace-pre-line">
										{entry.message}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{confirmDeleteId && (
				<div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
					<div className="bg-[var(--card)] border border-[var(--line)] max-w-sm w-full p-6 shadow-2xl font-mono text-xs text-center space-y-4">
						<h3 className="font-space text-lg text-[var(--ink)] font-medium">Delete Signature?</h3>
						<p className="text-[var(--muted)] leading-relaxed">
							This will permanently remove this note from both Firestore and local records.
						</p>
						<div className="flex justify-center gap-3 pt-2">
							<button
								type="button"
								onClick={() => setConfirmDeleteId(null)}
								className="px-4 py-2 border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] uppercase tracking-wider"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => handleDelete(confirmDeleteId)}
								className="px-4 py-2 bg-[var(--accent)] text-white hover:opacity-90 uppercase tracking-wider font-semibold cursor-pointer"
							>
								Confirm Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
