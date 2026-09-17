"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ArticleMeta } from "@/lib/cms/types";
import {
	IconChevronUp,
	IconChevronDown,
	IconTrash,
	IconSearch,
	IconCross,
} from "@/components/cms-icons";

interface MediaItem {
	url: string;
	name: string;
	folder: string;
	size: number;
}

export default function CmsArticlesPage() {
	const [articles, setArticles] = useState<ArticleMeta[]>([]);
	const [mediaList, setMediaList] = useState<MediaItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

	const [articleSearch, setArticleSearch] = useState("");
	const [editingArticle, setEditingArticle] = useState<ArticleMeta | null>(null);
	const [isNewArticle, setIsNewArticle] = useState(false);
	const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [confirmDeleteArticle, setConfirmDeleteArticle] = useState<number | null>(null);

	const showNotice = (text: string, type: "success" | "error" | "info" = "success") => {
		setNotice({ text, type });
		setTimeout(() => setNotice(null), 4000);
	};

	const loadData = async () => {
		setLoading(true);
		try {
			const [aRes, mRes] = await Promise.all([
				fetch("/api/cms/articles"),
				fetch("/api/cms/media"),
			]);

			if (aRes.ok) {
				const aData = await aRes.json();
				setArticles(aData.articles || []);
			}
			if (mRes.ok) {
				const mData = await mRes.json();
				setMediaList(mData.media || []);
			}
		} catch (err) {
			console.error("Error loading articles data:", err);
			showNotice("Failed to load articles", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const saveArticlesList = async (updatedArticles: ArticleMeta[]) => {
		setSaving(true);
		try {
			const res = await fetch("/api/cms/articles", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ articles: updatedArticles }),
			});
			const data = await res.json();
			if (res.ok && data.success) {
				setArticles(updatedArticles);
				showNotice("Articles updated and synced to Firestore & local JSON.", "success");
			} else {
				showNotice(data.error || "Failed to save articles", "error");
			}
		} catch (_err) {
			showNotice("Network error saving articles", "error");
		} finally {
			setSaving(false);
		}
	};

	const handleMoveArticle = (index: number, direction: "up" | "down") => {
		const newIndex = direction === "up" ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= articles.length) return;

		const updated = [...articles];
		const temp = updated[index];
		updated[index] = updated[newIndex];
		updated[newIndex] = temp;

		const ordered = updated.map((a, idx) => ({ ...a, order: idx }));
		saveArticlesList(ordered);
	};

	const handleToggleFeaturedArticle = (index: number) => {
		const updated = [...articles];
		updated[index] = { ...updated[index], featured: !updated[index].featured };
		saveArticlesList(updated);
	};

	const handleSaveArticleForm = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingArticle) return;

		let updated: ArticleMeta[];
		if (isNewArticle) {
			const cuid = editingArticle.cuid || `cm${Date.now()}`;
			updated = [{ ...editingArticle, cuid, order: 0 }, ...articles].map((a, idx) => ({
				...a,
				order: idx,
			}));
		} else {
			updated = articles.map((a) => (a.slug === editingArticle.slug ? editingArticle : a));
		}

		saveArticlesList(updated);
		setEditingArticle(null);
		setIsNewArticle(false);
	};

	const handleDeleteArticle = (index: number) => {
		const updated = articles.filter((_, idx) => idx !== index);
		saveArticlesList(updated);
		setConfirmDeleteArticle(null);
	};

	const handleMediaUpload = async (file: File) => {
		setUploadingImage(true);
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", "articles/assets");

			const res = await fetch("/api/cms/media", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();
			if (res.ok && data.url) {
				showNotice(`Uploaded ${data.name} to public/articles/assets`, "success");
				const mRes = await fetch("/api/cms/media");
				if (mRes.ok) {
					const mData = await mRes.json();
					setMediaList(mData.media || []);
				}
				if (editingArticle) {
					setEditingArticle({ ...editingArticle, cover: data.url, ogImage: data.url });
				}
				setMediaPickerOpen(false);
			} else {
				showNotice(data.error || "Image upload failed", "error");
			}
		} catch (_err) {
			showNotice("Network error uploading image", "error");
		} finally {
			setUploadingImage(false);
		}
	};

	const filteredArticles = useMemo(() => {
		if (!articleSearch.trim()) return articles;
		const q = articleSearch.toLowerCase();
		return articles.filter(
			(a) =>
				a.title.toLowerCase().includes(q) ||
				a.slug.toLowerCase().includes(q) ||
				a.tags.some((t) => t.toLowerCase().includes(q)),
		);
	}, [articles, articleSearch]);

	return (
		<div className="space-y-6">
			{/* Top Header Card */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="w-2 h-2 bg-[var(--accent)] inline-block" />
							<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">
								Publications &amp; Thoughts
							</span>
						</div>
						<h1 className="font-space font-medium text-2xl text-[var(--ink)]">Articles Management</h1>
						<p className="font-mono text-xs text-[var(--muted)] mt-1.5 leading-relaxed max-w-xl">
							Manage publications displayed on /blog and the homepage. Configure metadata, associate markdown files, and toggle Featured status.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2 shrink-0">
						<button
							type="button"
							onClick={() => {
								setIsNewArticle(true);
								setEditingArticle({
									title: "",
									seoTitle: "",
									seoDescription: "",
									datePublished: new Date().toISOString(),
									cuid: `cm${Date.now()}`,
									slug: "",
									cover: mediaList[0]?.url || "/articles/assets/async_tokio/cover.png",
									ogImage: mediaList[0]?.url || "/articles/assets/async_tokio/cover.png",
									tags: ["Engineering", "Rust"],
									content: "",
									featured: true,
								});
							}}
							className="px-4 py-2.5 bg-[var(--accent)] text-white hover:opacity-90 font-mono text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5 shadow-xs"
						>
							<span>+ New Article</span>
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

			{/* Toolbar & Search */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div className="relative flex-1 max-w-md">
						<input
							type="search"
							value={articleSearch}
							onChange={(e) => setArticleSearch(e.target.value)}
							placeholder="Filter articles by title, slug, or tags..."
							className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3.5 py-2 font-mono text-xs text-[var(--ink)] outline-none pl-8"
						/>
						<span className="absolute left-2.5 top-2.5 text-[var(--muted)]"><IconSearch /></span>
					</div>

					<div className="font-mono text-xs text-[var(--muted)] flex items-center gap-2">
						<span>Showing</span>
						<span className="font-semibold text-[var(--ink)]">{filteredArticles.length}</span>
						<span>of {articles.length} articles</span>
						{saving && <span className="text-[var(--accent)] animate-pulse ml-2">Saving...</span>}
					</div>
				</div>
			</div>

			{/* Article List */}
			{loading ? (
				<div className="border border-[var(--line)] bg-[var(--card)] p-12 text-center font-mono text-xs text-[var(--muted)]">
					<div className="flex flex-col items-center gap-3">
						<span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-ping" />
						<span>Loading articles...</span>
					</div>
				</div>
			) : filteredArticles.length === 0 ? (
				<div className="border border-[var(--line)] bg-[var(--card)] p-12 text-center">
					<p className="font-space text-lg text-[var(--ink)] font-medium mb-1">No articles found</p>
					<p className="font-mono text-xs text-[var(--muted)] max-w-sm mx-auto">
						No articles matched your search &ldquo;{articleSearch}&rdquo;.
					</p>
				</div>
			) : (
				<div className="border border-[var(--line)] bg-[var(--card)] divide-y divide-[var(--line)]">
					{filteredArticles.map((article, _index) => {
						const originalIndex = articles.findIndex((a) => a.slug === article.slug);
						const isFeatured = article.featured === true;

						return (
							<div
								key={article.slug}
								className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--paper)]/50 transition-colors"
							>
								{/* Left: Sequence Controls & Details */}
								<div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
									{/* Reorder Buttons */}
									<div className="flex flex-col items-center justify-center font-mono text-xs shrink-0">
										<button
											type="button"
											disabled={originalIndex === 0 || saving}
											onClick={() => handleMoveArticle(originalIndex, "up")}
											className="p-1 hover:text-[var(--ink)] disabled:opacity-20 text-[var(--muted)] cursor-pointer"
											title="Move Up in Sequence"
										>
											<IconChevronUp />
										</button>
										<span className="text-[10px] text-[var(--muted)] font-bold">{originalIndex + 1}</span>
										<button
											type="button"
											disabled={originalIndex === articles.length - 1 || saving}
											onClick={() => handleMoveArticle(originalIndex, "down")}
											className="p-1 hover:text-[var(--ink)] disabled:opacity-20 text-[var(--muted)] cursor-pointer"
											title="Move Down in Sequence"
										>
											<IconChevronDown />
										</button>
									</div>

									{/* Cover Thumbnail */}
									<div className="relative w-16 h-12 sm:w-20 sm:h-14 bg-[var(--paper)] border border-[var(--line)] overflow-hidden shrink-0">
										{article.cover ? (
											<Image src={article.cover} alt={article.title} fill unoptimized className="object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[var(--muted)]">
												No cover
											</div>
										)}
									</div>

									{/* Metadata */}
									<div className="space-y-1 min-w-0 flex-1">
										<div className="flex items-center gap-2 flex-wrap">
											<h3 className="font-space font-medium text-sm text-[var(--ink)] truncate">
												{article.title}
											</h3>
											<span className="font-mono text-[10px] text-[var(--muted)] truncate max-w-[180px]">
												/blog/{article.slug}
											</span>
										</div>

										<p className="font-mono text-xs text-[var(--muted)] line-clamp-1">
											{article.seoDescription || `Content: ${article.content}`}
										</p>

										<div className="flex items-center gap-3 flex-wrap font-mono text-[10px] text-[var(--muted)] pt-0.5">
											<span>Published: {new Date(article.datePublished).toLocaleDateString()}</span>
											{article.tags?.map((tag) => (
												<span
													key={tag}
													className="px-1.5 py-0.2 bg-[var(--paper)] border border-[var(--line)] text-[9px]"
												>
													#{tag}
												</span>
											))}
										</div>
									</div>
								</div>

								{/* Right: Actions */}
								<div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--line)]">
									{/* Featured toggle */}
									<button
										type="button"
										onClick={() => handleToggleFeaturedArticle(originalIndex)}
										className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1.5 ${
											isFeatured
												? "border-[var(--accent)] bg-[var(--accent)] text-white font-semibold"
												: "border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
										}`}
										title="Toggle display in 'Recent thoughts' on homepage"
									>
										<span>{isFeatured ? "Home: Active" : "Home: Off"}</span>
									</button>

									{/* View Article */}
									<Link
										href={`/blog/${article.slug}`}
										target="_blank"
										className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors inline-flex items-center gap-1"
									>
										<span>View</span>
										<span className="text-xs">↗</span>
									</Link>

									{/* Edit Details */}
									<button
										type="button"
										onClick={() => {
											setIsNewArticle(false);
											setEditingArticle({ ...article });
										}}
										className="px-3 py-1 font-mono text-[11px] uppercase tracking-wider border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors cursor-pointer"
									>
										Edit
									</button>

									{/* Delete */}
									<button
										type="button"
										onClick={() => setConfirmDeleteArticle(originalIndex)}
										className="p-1.5 font-mono text-xs text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
										title="Delete article"
									>
										<IconTrash />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* EDIT / CREATE ARTICLE MODAL */}
			{editingArticle && (
				<div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
					<div className="bg-[var(--card)] border border-[var(--line)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
						<div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--line)]">
							<div>
								<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">
									{isNewArticle ? "Create Article" : "Edit Article Metadata"}
								</span>
								<h2 className="font-space font-medium text-xl text-[var(--ink)]">
									{editingArticle.title || "Untitled Article"}
								</h2>
							</div>
							<button
								type="button"
								onClick={() => {
									setEditingArticle(null);
									setIsNewArticle(false);
								}}
								className="p-1 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
								aria-label="Close modal"
							>
								<IconCross />
							</button>
						</div>

						<form onSubmit={handleSaveArticleForm} className="space-y-4 font-mono text-xs">
							<div>
								<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
									Article Title *
								</label>
								<input
									type="text"
									required
									value={editingArticle.title}
									onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
									className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
									placeholder="Title"
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
										Slug *
									</label>
									<input
										type="text"
										required
										value={editingArticle.slug}
										onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
										className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
										placeholder="article-slug-name"
									/>
								</div>

								<div>
									<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
										Content Markdown File *
									</label>
									<input
										type="text"
										required
										value={editingArticle.content}
										onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
										className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
										placeholder="2026_05_22_tokio_under_the_hood.md"
									/>
								</div>
							</div>

							{/* Cover Image Picker */}
							<div>
								<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
									Cover Image URL *
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										required
										value={editingArticle.cover}
										onChange={(e) =>
											setEditingArticle({
												...editingArticle,
												cover: e.target.value,
												ogImage: e.target.value,
											})
										}
										className="flex-1 bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
										placeholder="/articles/assets/.../cover.png"
									/>
									<button
										type="button"
										onClick={() => setMediaPickerOpen(true)}
										className="px-3 py-2 bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)] cursor-pointer"
									>
										Pick Cover
									</button>
								</div>
								{editingArticle.cover && (
									<div className="mt-2 relative w-24 h-16 border border-[var(--line)] overflow-hidden">
										<Image src={editingArticle.cover} alt="Preview" fill unoptimized className="object-cover" />
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
										SEO Title
									</label>
									<input
										type="text"
										value={editingArticle.seoTitle || ""}
										onChange={(e) => setEditingArticle({ ...editingArticle, seoTitle: e.target.value })}
										className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
										placeholder="Search engine title"
									/>
								</div>

								<div>
									<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
										Published Date (ISO)
									</label>
									<input
										type="text"
										value={editingArticle.datePublished}
										onChange={(e) => setEditingArticle({ ...editingArticle, datePublished: e.target.value })}
										className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
										placeholder="2026-05-22T00:00:00.000Z"
									/>
								</div>
							</div>

							<div>
								<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
									SEO Description
								</label>
								<textarea
									rows={3}
									value={editingArticle.seoDescription || ""}
									onChange={(e) => setEditingArticle({ ...editingArticle, seoDescription: e.target.value })}
									className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] p-3 text-[var(--ink)] outline-none font-sans text-xs leading-relaxed"
									placeholder="Meta description for search engines and social share previews..."
								/>
							</div>

							<div>
								<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
									Tags (comma-separated)
								</label>
								<input
									type="text"
									value={editingArticle.tags?.join(", ") || ""}
									onChange={(e) =>
										setEditingArticle({
											...editingArticle,
											tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
										})
									}
									className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
									placeholder="Engineering, Rust, Tokio"
								/>
							</div>

							<div className="pt-2">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={editingArticle.featured ?? false}
										onChange={(e) => setEditingArticle({ ...editingArticle, featured: e.target.checked })}
										className="accent-[var(--accent)]"
									/>
									<span className="text-[11px] uppercase text-[var(--ink)]">
										Featured in &ldquo;Recent thoughts&rdquo; on Homepage
									</span>
								</label>
							</div>

							<div className="flex justify-end gap-3 pt-6 border-t border-[var(--line)]">
								<button
									type="button"
									onClick={() => {
										setEditingArticle(null);
										setIsNewArticle(false);
									}}
									className="px-4 py-2 border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] uppercase tracking-wider cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={saving}
									className="px-6 py-2 bg-[var(--accent)] text-white hover:opacity-90 uppercase tracking-wider font-semibold cursor-pointer"
								>
									{saving ? "Saving..." : "Save Article"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* MEDIA PICKER MODAL */}
			{mediaPickerOpen && (
				<div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
					<div className="bg-[var(--card)] border border-[var(--line)] w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl flex flex-col">
						<div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--line)]">
							<h3 className="font-space font-medium text-lg text-[var(--ink)]">Select Cover Image</h3>
							<button
								type="button"
								onClick={() => setMediaPickerOpen(false)}
								className="p-1 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
								aria-label="Close modal"
							>
								<IconCross />
							</button>
						</div>

						<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto max-h-96 p-1">
							{mediaList.map((m) => (
								<button
									key={m.url}
									type="button"
									onClick={() => {
										if (editingArticle) {
											setEditingArticle({ ...editingArticle, cover: m.url, ogImage: m.url });
										}
										setMediaPickerOpen(false);
									}}
									className="border border-[var(--line)] hover:border-[var(--accent)] p-1.5 text-left bg-[var(--paper)] transition-colors cursor-pointer group flex flex-col"
								>
									<div className="aspect-16/10 bg-[var(--card)] relative overflow-hidden mb-1">
										<Image src={m.url} alt={m.name} fill unoptimized className="object-cover" />
									</div>
									<span className="font-mono text-[9px] text-[var(--ink)] truncate block">{m.name}</span>
									<span className="font-mono text-[8px] text-[var(--muted)] truncate block">{m.folder}</span>
								</button>
							))}
						</div>

						<div className="mt-4 pt-3 border-t border-[var(--line)] flex justify-between items-center font-mono text-xs">
							<label className="px-3 py-1.5 border border-[var(--line)] text-[var(--ink)] uppercase tracking-wider hover:bg-[var(--line)] cursor-pointer">
								<span>{uploadingImage ? "Uploading..." : "+ Upload New Cover"}</span>
								<input
									type="file"
									accept="image/*"
									disabled={uploadingImage}
									className="hidden"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleMediaUpload(file);
									}}
								/>
							</label>

							<button
								type="button"
								onClick={() => setMediaPickerOpen(false)}
								className="px-4 py-1.5 bg-[var(--ink)] text-[var(--paper)] uppercase tracking-wider cursor-pointer"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation */}
			{confirmDeleteArticle !== null && (
				<div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
					<div className="bg-[var(--card)] border border-[var(--line)] max-w-sm w-full p-6 shadow-2xl font-mono text-xs text-center space-y-4">
						<h3 className="font-space text-lg text-[var(--ink)] font-medium">Delete Article?</h3>
						<p className="text-[var(--muted)] leading-relaxed">
							This permanently removes &ldquo;{articles[confirmDeleteArticle]?.title}&rdquo; from both Firestore and local records.
						</p>
						<div className="flex justify-center gap-3 pt-2">
							<button
								type="button"
								onClick={() => setConfirmDeleteArticle(null)}
								className="px-4 py-2 border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] uppercase tracking-wider"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => handleDeleteArticle(confirmDeleteArticle)}
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
