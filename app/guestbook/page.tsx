"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
	GithubAuthProvider,
	signInWithPopup,
	signOut,
	onAuthStateChanged,
	type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/app/firebase";
import SiteNav from "@/components/site-nav";
import LenisScroll from "@/components/lenis-scroll";
import type { GuestbookEntry } from "@/lib/cms/types";
import { IconCheck, IconSync } from "@/components/cms-icons";
import { Reveal } from "@/components/motion-reveal";
import { Heart, ChevronLeft, ChevronRight, ArrowUpRight, MessageSquare, ShieldCheck } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function GuestbookPage() {
	const [user, setUser] = useState<User | null>(null);
	const [userHandle, setUserHandle] = useState<string>("");
	const [authLoading, setAuthLoading] = useState<boolean>(true);
	const [signingIn, setSigningIn] = useState<boolean>(false);

	const [entries, setEntries] = useState<GuestbookEntry[]>([]);
	const [loadingEntries, setLoadingEntries] = useState<boolean>(true);

	// Pagination
	const [currentPage, setCurrentPage] = useState<number>(1);

	// Optimistic likes: entryId -> likes array
	const [localLikes, setLocalLikes] = useState<Record<string, string[]>>({});
	const [likingIds, setLikingIds] = useState<Set<string>>(new Set());

	const [message, setMessage] = useState<string>("");
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(
		null,
	);
	const [userPendingEntries, setUserPendingEntries] = useState<GuestbookEntry[]>([]);

	// Format date helper
	const formatDate = (timestamp: number) => {
		try {
			const date = new Date(timestamp);
			return new Intl.DateTimeFormat("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			}).format(date);
		} catch {
			return "Recent";
		}
	};

	// Auth observer
	useEffect(() => {
		if (!auth) {
			setAuthLoading(false);
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			if (currentUser) {
				const providerData = currentUser.providerData.find(
					(p) => p.providerId === "github.com",
				);
				// @ts-expect-error Firebase user may contain screenName in reloadUserInfo
				const screenName = currentUser.reloadUserInfo?.screenName;
				setUserHandle(screenName || providerData?.displayName || currentUser.displayName || "");
			} else {
				setUserHandle("");
			}
			setAuthLoading(false);
		});

		return () => unsubscribe();
	}, []);

	// Load approved entries
	const loadEntries = useCallback(async () => {
		setLoadingEntries(true);
		try {
			const res = await fetch("/api/guestbook");
			if (res.ok) {
				const data = await res.json();
				const fetched: GuestbookEntry[] = data.entries || [];
				setEntries(fetched);
				// Seed localLikes from fetched data
				const seed: Record<string, string[]> = {};
				for (const e of fetched) {
					seed[e.id] = e.likes || [];
				}
				setLocalLikes(seed);
				setCurrentPage(1);
			}
		} catch (err) {
			console.error("Error loading guestbook:", err);
		} finally {
			setLoadingEntries(false);
		}
	}, []);

	useEffect(() => {
		loadEntries();
	}, [loadEntries]);

	// Recalculate smooth scroll boundaries whenever entries or page changes
	useEffect(() => {
		const timer = setTimeout(() => {
			if (typeof window !== "undefined") {
				window.dispatchEvent(new CustomEvent("lenis-resize"));
				(window as unknown as { __lenis?: { resize: () => void } }).__lenis?.resize();
			}
		}, 60);
		return () => clearTimeout(timer);
	}, [entries, loadingEntries, currentPage]);

	// GitHub Sign In
	const handleGitHubSignIn = async () => {
		if (!auth) {
			setNotice({
				text: "Firebase Auth is not configured on this instance.",
				type: "error",
			});
			return;
		}

		setSigningIn(true);
		setNotice(null);
		try {
			const provider = new GithubAuthProvider();
			provider.addScope("read:user");
			const result = await signInWithPopup(auth, provider);

			// @ts-expect-error Firebase credentials may contain username
			const handle = result?._tokenResponse?.screenName || result.user.displayName || "";
			setUserHandle(handle);
			setNotice({ text: `Signed in as @${handle || result.user.displayName}`, type: "info" });
		} catch (err: unknown) {
			console.error("Sign in error:", err);
			const error = err as { message?: string; code?: string };
			let errMessage = error.message || "Failed to sign in with GitHub. Please try again.";

			if (error.code === "auth/unauthorized-domain") {
				const currentDomain = typeof window !== "undefined" ? window.location.hostname : "your domain";
				errMessage = `Domain "${currentDomain}" is not authorized. Please add "${currentDomain}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`;
			} else if (error.code === "auth/popup-closed-by-user") {
				errMessage = "Sign-in popup was closed before completing authentication.";
			} else if (error.code === "auth/cancelled-popup-request") {
				errMessage = "Previous sign-in request was cancelled.";
			}

			setNotice({
				text: errMessage,
				type: "error",
			});
		} finally {
			setSigningIn(false);
		}
	};

	// Sign Out
	const handleSignOut = async () => {
		if (!auth) return;
		try {
			await signOut(auth);
			setUser(null);
			setUserHandle("");
			setNotice({ text: "Signed out successfully.", type: "info" });
		} catch (err) {
			console.error("Sign out error:", err);
		}
	};

	// Submit Message
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			setNotice({ text: "Please sign in with GitHub to post a note.", type: "error" });
			return;
		}

		if (!message.trim()) {
			setNotice({ text: "Please write a message before submitting.", type: "error" });
			return;
		}

		if (message.trim().length > 500) {
			setNotice({ text: "Message cannot exceed 500 characters.", type: "error" });
			return;
		}

		setSubmitting(true);
		setNotice(null);

		try {
			const res = await fetch("/api/guestbook", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user.uid,
					userName: user.displayName || userHandle || "Developer",
					userHandle: userHandle || "",
					userAvatar: user.photoURL || "",
					userEmail: user.email || "",
					message: message.trim(),
				}),
			});

			const data = await res.json();
			if (res.ok && data.success) {
				setNotice({
					text:
						data.notice ||
						"Your note has been submitted and is pending curator approval by Piush. Thank you for signing!",
					type: "success",
				});
				if (data.entry) {
					setUserPendingEntries((prev) => [data.entry, ...prev.filter((e) => e.id !== data.entry.id)]);
				}
				setMessage("");
			} else {
				setNotice({
					text: data.error || "Failed to submit note. Please try again.",
					type: "error",
				});
			}
		} catch (err) {
			console.error("Error submitting guestbook note:", err);
			setNotice({
				text: "Network error submitting note. Please try again.",
				type: "error",
			});
		} finally {
			setSubmitting(false);
		}
	};

	// Handle Like
	const handleLike = async (entryId: string) => {
		if (!user) {
			setNotice({ text: "Sign in with GitHub to like entries.", type: "info" });
			return;
		}

		// Prevent liking while in progress
		if (likingIds.has(entryId)) return;

		// Optimistic update
		const currentLikes = localLikes[entryId] || [];
		const alreadyLiked = currentLikes.includes(user.uid);
		const optimisticLikes = alreadyLiked
			? currentLikes.filter((id) => id !== user.uid)
			: [...currentLikes, user.uid];

		setLocalLikes((prev) => ({ ...prev, [entryId]: optimisticLikes }));
		setLikingIds((prev) => new Set(prev).add(entryId));

		try {
			const res = await fetch("/api/guestbook/like", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ entryId, userId: user.uid }),
			});

			if (res.ok) {
				const data = await res.json();
				if (data.likes) {
					setLocalLikes((prev) => ({ ...prev, [entryId]: data.likes }));
				}
			} else {
				// Revert optimistic update on failure
				setLocalLikes((prev) => ({ ...prev, [entryId]: currentLikes }));
			}
		} catch {
			// Revert on network error
			setLocalLikes((prev) => ({ ...prev, [entryId]: currentLikes }));
		} finally {
			setLikingIds((prev) => {
				const next = new Set(prev);
				next.delete(entryId);
				return next;
			});
		}
	};

	// Pagination computed values
	const totalPages = Math.max(1, Math.ceil(entries.length / ITEMS_PER_PAGE));
	const paginatedEntries = entries.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	return (
		<div className="relative bg-background min-h-screen text-foreground flex flex-col selection:bg-[var(--accent)] selection:text-white">
			<LenisScroll />
			<SiteNav />

			<main className="flex-1 mx-auto px-6 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-24 sm:pb-32 max-w-3xl w-full">
				<div className="space-y-10">
					{/* Hero Header */}
					<Reveal direction="up" distance={20}>
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<span className="w-2 h-2 bg-[var(--accent)] inline-block" />
								<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">
									Community &amp; Signatures
								</span>
							</div>

							<h1 className="font-space font-medium text-3xl sm:text-4xl text-ink tracking-tight">
								Guestbook
							</h1>

							<p className="font-mono text-xs sm:text-sm text-muted leading-relaxed max-w-xl">
								Leave a message, share a thought, or just say hello. Authenticate with GitHub to verify your developer profile. All submissions are moderated prior to appearing publicly.
							</p>
						</div>
					</Reveal>

					{/* Notification Notice */}
					{notice && (
						<div
							className={`p-4 border font-mono text-xs transition-all ${notice.type === "success"
								? "bg-[var(--accent)]/10 border-[var(--accent)] text-ink"
								: notice.type === "error"
									? "bg-red-500/10 border-red-500 text-red-500"
									: "bg-card border-line text-ink"
								}`}
						>
							<div className="flex items-start gap-2.5">
								<span className="shrink-0 mt-0.5">
									{notice.type === "success" ? (
										<IconCheck className="w-3.5 h-3.5 text-emerald-500" />
									) : notice.type === "error" ? (
										<svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
									) : (
										<svg className="w-3.5 h-3.5 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
									)}
								</span>
								<span className="leading-relaxed">{notice.text}</span>
							</div>
						</div>
					)}

					{/* Sign / Auth Box */}
					<div className="border border-line bg-card p-6 sm:p-8 space-y-6">
						{authLoading ? (
							<div className="flex items-center gap-3 font-mono text-xs text-muted py-4">
								<span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-ping" />
								<span>Checking authentication status...</span>
							</div>
						) : !user ? (
							<div className="space-y-4">
								<div className="space-y-1">
									<h2 className="font-space font-medium text-lg text-ink">Sign the Guestbook</h2>
									<p className="font-mono text-xs text-muted">
										Sign in with your GitHub account to leave a signature. We only display your public username, name, and profile picture.
									</p>
								</div>

								<button
									type="button"
									disabled={signingIn || !isFirebaseConfigured()}
									onClick={handleGitHubSignIn}
									className="px-5 py-3 bg-ink text-paper hover:opacity-90 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{/* GitHub Octocat Icon */}
									<svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
										/>
									</svg>
									<span>{signingIn ? "Authenticating..." : "Continue with GitHub"}</span>
								</button>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-4">
								{/* Authenticated user pill */}
								<div className="flex items-center justify-between pb-3 border-b border-line">
									<div className="flex items-center gap-3">
										{user.photoURL ? (
											<div className="relative w-8 h-8 rounded-full overflow-hidden border border-line">
												<Image
													src={user.photoURL}
													alt={user.displayName || "User avatar"}
													fill
													className="object-cover"
												/>
											</div>
										) : (
											<div className="w-8 h-8 rounded-full bg-line flex items-center justify-center font-mono text-xs font-semibold">
												{(user.displayName || "U")[0]}
											</div>
										)}
										<div className="font-mono text-xs">
											<span className="font-semibold text-ink block">
												{user.displayName || userHandle || "Developer"}
											</span>
											{userHandle && (
												<span className="text-muted text-[10px]">@{userHandle}</span>
											)}
										</div>
									</div>

									<button
										type="button"
										onClick={handleSignOut}
										className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-ink cursor-pointer transition-colors"
									>
										Sign Out
									</button>
								</div>

								{/* Message text area */}
								<div className="space-y-1.5">
									<label
										htmlFor="guestbook-message"
										className="block font-mono text-[10px] uppercase tracking-wider text-muted"
									>
										Your Message *
									</label>
									<textarea
										id="guestbook-message"
										rows={3}
										maxLength={500}
										required
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder="Share your thoughts, what you are building, or how you found the site..."
										className="w-full bg-paper border border-line focus:border-ink p-3 text-ink outline-none font-sans text-xs leading-relaxed transition-colors resize-y"
									/>
									<div className="flex justify-between items-center font-mono text-[10px] text-muted">
										<span>Markdown formatting supported</span>
										<span>{message.length} / 500</span>
									</div>
								</div>

								{/* Action button */}
								<div className="flex justify-end pt-2">
									<button
										type="submit"
										disabled={submitting || !message.trim()}
										className="px-5 py-2.5 bg-[var(--accent)] text-white hover:opacity-90 font-mono text-xs uppercase tracking-wider transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
									>
										{submitting ? (
											<>
												<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
												<span>Submitting...</span>
											</>
										) : (
											<>
												<span>Post Note</span>
												<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
											</>
										)}
									</button>
								</div>
							</form>
						)}
					</div>

					{/* User's Own Pending Submissions */}
					{userPendingEntries.length > 0 && (
						<div className="space-y-3">
							<span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)] font-medium">
								Your Pending Notes ({userPendingEntries.length})
							</span>
							<div className="space-y-3">
								{userPendingEntries.map((pEntry) => (
									<div
										key={pEntry.id}
										className="border border-[var(--accent)]/50 bg-[var(--accent)]/5 p-4 sm:p-5 relative"
									>
										<div className="flex items-center justify-between gap-2 mb-2 font-mono text-xs">
											<span className="font-medium text-ink">You (@{pEntry.userHandle || "you"})</span>
											<span className="px-2 py-0.5 bg-[var(--accent)] text-white text-[9px] uppercase tracking-widest font-mono">
												Pending Approval
											</span>
										</div>
										<p className="font-sans text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
											{pEntry.message}
										</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Public Feed */}
					<div className="space-y-6 pt-4 border-t border-line">
						<div className="flex items-center justify-between font-mono text-xs">
							<span className="uppercase tracking-wider text-muted">
								Approved Signatures ({entries.length})
							</span>
							<button
								type="button"
								onClick={loadEntries}
								className="text-[10px] uppercase tracking-wider text-muted hover:text-ink cursor-pointer transition-colors inline-flex items-center gap-1.5"
							>
								<IconSync className="w-3 h-3" />
								<span>Refresh Feed</span>
							</button>
						</div>

						{loadingEntries ? (
							<div className="p-12 text-center font-mono text-xs text-muted border border-line bg-card">
								<div className="flex flex-col items-center gap-3">
									<span className="w-3 h-3 rounded-full bg-[var(--accent)] animate-ping" />
									<span>Loading signatures...</span>
								</div>
							</div>
						) : entries.length === 0 ? (
							<div className="p-12 text-center font-mono text-xs text-muted border border-line bg-card">
								<p className="font-space text-base text-ink font-medium mb-1">
									Be the first to sign!
								</p>
								<p className="text-muted max-w-sm mx-auto">
									No approved notes yet. Sign in with GitHub above and leave your thoughts on the wall.
								</p>
							</div>
						) : (
							<>
								<div className="space-y-4">
									{paginatedEntries.map((entry, index) => {
										const entryLikes = localLikes[entry.id] || entry.likes || [];
										const isLiked = user ? entryLikes.includes(user.uid) : false;
										const isLiking = likingIds.has(entry.id);
										const isOwnEntry = user?.uid === entry.userId;

										return (
											<Reveal direction="up" distance={16} delay={index * 0.04} key={entry.id}>
												<article className="border border-line bg-card/80 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:border-ink/50 hover:shadow-sm group relative">
													{/* Card Header */}
													<div className="flex items-start justify-between gap-4 mb-3.5">
														<div className="flex items-center gap-3">
															{entry.userAvatar ? (
																<div className="relative w-9 h-9 rounded-full overflow-hidden border border-line ring-1 ring-background shrink-0">
																	<Image
																		src={entry.userAvatar}
																		alt={entry.userName}
																		fill
																		className="object-cover"
																	/>
																</div>
															) : (
																<div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center font-mono text-xs font-semibold shrink-0">
																	{(entry.userName || "U")[0]}
																</div>
															)}

															<div>
																<div className="flex items-center gap-2 flex-wrap">
																	<span className="font-space font-medium text-sm text-ink leading-none">
																		{entry.userName}
																	</span>
																	{entry.userHandle && (
																		<a
																			href={`https://github.com/${entry.userHandle}`}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="font-mono text-[11px] text-muted hover:text-[var(--accent)] transition-colors inline-flex items-center gap-0.5 group/handle"
																		>
																			<span>@{entry.userHandle}</span>
																			<ArrowUpRight className="w-2.5 h-2.5 opacity-60 group-hover/handle:opacity-100 group-hover/handle:translate-x-0.5 transition-transform" />
																		</a>
																	)}
																</div>
																<div className="flex items-center gap-2 mt-1">
																	<span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-medium">
																		<ShieldCheck className="w-2.5 h-2.5" />
																		Verified Note
																	</span>
																</div>
															</div>
														</div>

														<time className="font-mono text-[10px] text-muted shrink-0 tabular-nums">
															{formatDate(entry.createdAt)}
														</time>
													</div>

													{/* Message Body */}
													<div className="pl-0 sm:pl-12 my-3">
														<div className="border-l-2 border-line group-hover:border-[var(--accent)]/40 pl-3.5 transition-colors py-0.5">
															<p className="font-sans text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
																{entry.message}
															</p>
														</div>
													</div>

													{/* Footer Actions: Likes */}
													<div className="pt-2 border-t border-line/60 flex items-center justify-between sm:pl-12">
														<div className="flex items-center gap-2">
															<button
																type="button"
																onClick={() => handleLike(entry.id)}
																disabled={isLiking || isOwnEntry || authLoading}
																title={
																	!user
																		? "Sign in to like"
																		: isOwnEntry
																			? "You cannot like your own note"
																			: isLiked
																				? "Unlike"
																				: "Like"
																}
																className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-[11px] tracking-wider transition-all cursor-pointer disabled:cursor-not-allowed group/like ${
																	isLiked
																		? "bg-rose-500/10 border-rose-500/30 text-rose-500"
																		: "bg-background border-line text-muted hover:border-rose-300 hover:text-rose-500 disabled:hover:text-muted disabled:hover:border-line"
																}`}
															>
																<Heart
																	className={`w-3 h-3 transition-transform group-hover/like:scale-115 ${
																		isLiked ? "fill-rose-500" : "fill-none"
																	} ${isLiking ? "animate-pulse" : ""}`}
																/>
																<span className="font-medium">{entryLikes.length > 0 ? entryLikes.length : 0}</span>
															</button>
															{!user && (
																<span className="font-mono text-[9px] text-muted/60">
																	Sign in to like
																</span>
															)}
															{isOwnEntry && (
																<span className="font-mono text-[9px] text-muted/60">
																	Your note
																</span>
															)}
														</div>

														<span className="font-mono text-[9px] text-muted/40 uppercase tracking-widest hidden sm:inline">
															Signature #{paginatedEntries.length - index}
														</span>
													</div>
												</article>
											</Reveal>
										);
									})}
								</div>

								{/* Pagination controls */}
								{totalPages > 1 && (
									<div className="flex items-center justify-between pt-2 border-t border-line font-mono text-xs">
										<button
											type="button"
											onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
											disabled={currentPage === 1}
											className="inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
										>
											<ChevronLeft className="w-3.5 h-3.5" />
											<span>Prev</span>
										</button>

										<span className="text-muted text-[10px] tracking-wider">
											Page {currentPage} of {totalPages}
										</span>

										<button
											type="button"
											onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
											disabled={currentPage === totalPages}
											className="inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
										>
											<span>Next</span>
											<ChevronRight className="w-3.5 h-3.5" />
										</button>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</main>

		</div>
	);
}
