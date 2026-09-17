"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { IconFolder, IconSearch, IconCross, IconUpload } from "@/components/cms-icons";
import { Plus } from "lucide-react";

interface MediaItem {
	url: string;
	name: string;
	folder: string;
	size: number;
}

export default function CmsMediaPage() {
	const [mediaList, setMediaList] = useState<MediaItem[]>([]);
	const [mediaFolders, setMediaFolders] = useState<string[]>([]);
	const [selectedMediaFolder, setSelectedMediaFolder] = useState<string>("all");
	const [mediaSearch, setMediaSearch] = useState<string>("");
	const [loading, setLoading] = useState(true);

	// Upload & Modal
	const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
	const [uploadTargetFolder, setUploadTargetFolder] = useState<string>("projects");
	const [customFolderName, setCustomFolderName] = useState<string>("");
	const [isCustomFolder, setIsCustomFolder] = useState<boolean>(false);
	const [uploadFile, setUploadFile] = useState<File | null>(null);
	const [uploadingImage, setUploadingImage] = useState(false);

	// Download Zip
	const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
	const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

	const showNotice = (text: string, type: "success" | "error" | "info" = "success") => {
		setNotice({ text, type });
		setTimeout(() => setNotice(null), 4000);
	};

	const loadMedia = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/cms/media");
			if (res.ok) {
				const data = await res.json();
				setMediaList(data.media || []);
				setMediaFolders(data.folders || []);
			} else {
				showNotice("Failed to load media assets", "error");
			}
		} catch (err) {
			console.error("Error loading media:", err);
			showNotice("Network error loading media", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadMedia();
	}, []);

	// Download whole public folder
	const handleDownloadPublicFolder = async () => {
		setDownloadingZip(true);
		try {
			const res = await fetch("/api/cms/media/download");
			if (!res.ok) throw new Error("Failed to download archive");
			const blob = await res.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "piush-in-public.zip";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
			showNotice("Successfully downloaded public folder archive (piush-in-public.zip)", "success");
		} catch (_err) {
			showNotice("Failed to download public folder archive", "error");
		} finally {
			setDownloadingZip(false);
		}
	};

	// Upload asset
	const handleMediaUpload = async (file: File, folder?: string) => {
		const destinationFolder =
			folder || (isCustomFolder && customFolderName.trim() ? customFolderName.trim() : uploadTargetFolder);
		setUploadingImage(true);
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", destinationFolder);

			const res = await fetch("/api/cms/media", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();
			if (res.ok && data.url) {
				showNotice(`Uploaded into public/${data.folder || destinationFolder}: ${data.name}`, "success");
				await loadMedia();
				setShowUploadModal(false);
				setUploadFile(null);
				setCustomFolderName("");
				setIsCustomFolder(false);
			} else {
				showNotice(data.error || "Upload failed", "error");
			}
		} catch (_err) {
			showNotice("Network error uploading asset", "error");
		} finally {
			setUploadingImage(false);
		}
	};

	const folderCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		mediaList.forEach((m) => {
			counts[m.folder] = (counts[m.folder] || 0) + 1;
		});
		return counts;
	}, [mediaList]);

	const filteredMediaList = useMemo(() => {
		return mediaList.filter((m) => {
			if (selectedMediaFolder !== "all" && m.folder !== selectedMediaFolder) {
				return false;
			}
			if (mediaSearch.trim()) {
				const q = mediaSearch.toLowerCase();
				return m.name.toLowerCase().includes(q) || m.folder.toLowerCase().includes(q);
			}
			return true;
		});
	}, [mediaList, selectedMediaFolder, mediaSearch]);

	return (
		<div className="space-y-6">
			{/* Top Header Card */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-6">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="w-2 h-2 bg-[var(--accent)] inline-block" />
							<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">
								Asset Repository
							</span>
						</div>
						<h1 className="font-space font-medium text-2xl text-[var(--ink)]">
							Media Library &amp; Public Assets
						</h1>
						<p className="font-mono text-xs text-[var(--muted)] mt-1.5 leading-relaxed max-w-2xl">
							Organize and distribute assets across any directory under Next.js{" "}
							<code className="text-[var(--ink)] bg-[var(--paper)] px-1 py-0.5 border border-[var(--line)]">
								/public
							</code>
							. Upload into existing or new custom subfolders, copy asset URLs, and download the entire public directory archive.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3 shrink-0">
						{/* Download Archive */}
						<button
							type="button"
							disabled={downloadingZip}
							onClick={handleDownloadPublicFolder}
							className="px-4 py-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
							title="Download entire /public directory as a .zip file"
						>
							{downloadingZip ? (
								<>
									<span className="w-3 h-3 border-2 border-[var(--ink)] border-t-transparent rounded-full animate-spin" />
									<span>Zipping...</span>
								</>
							) : (
								<>
									<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
										/>
									</svg>
									<span>Download /public (.zip)</span>
								</>
							)}
						</button>

						{/* Upload Button */}
						<button
							type="button"
							onClick={() => {
								setShowUploadModal(true);
								setUploadFile(null);
							}}
							className="px-4 py-2.5 bg-[var(--accent)] text-white hover:opacity-90 font-mono text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-2 shadow-xs"
						>
							<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							<span>Upload to Folder</span>
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

			{/* Folder Distribution & Filtering Bar */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-4 space-y-4">
				{/* Search Bar & Stats */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div className="relative flex-1 max-w-md">
						<input
							type="text"
							value={mediaSearch}
							onChange={(e) => setMediaSearch(e.target.value)}
							placeholder="Search assets by file name or folder..."
							className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-xs font-mono text-[var(--ink)] outline-none pl-8"
						/>
						<span className="absolute left-2.5 top-2.5 text-[var(--muted)] pointer-events-none">
							<IconSearch className="w-3.5 h-3.5" />
						</span>
						{mediaSearch && (
							<button
								type="button"
								onClick={() => setMediaSearch("")}
								className="absolute right-2.5 top-2 text-[var(--muted)] hover:text-[var(--ink)] font-mono text-xs cursor-pointer p-0.5"
							>
								<IconCross className="w-3 h-3" />
							</button>
						)}
					</div>

					<div className="font-mono text-xs text-[var(--muted)] flex items-center gap-2">
						<span>Showing</span>
						<span className="font-semibold text-[var(--ink)]">{filteredMediaList.length}</span>
						<span>of {mediaList.length} assets</span>
						{selectedMediaFolder !== "all" && (
							<span className="text-[var(--accent)] font-medium">(in /{selectedMediaFolder})</span>
						)}
					</div>
				</div>

				{/* Folder Tabs / Pills */}
				<div>
					<div className="flex items-center justify-between mb-2">
						<span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
							Folder Distribution ({mediaFolders.length} directories)
						</span>
						{selectedMediaFolder !== "all" && (
							<button
								type="button"
								onClick={() => setSelectedMediaFolder("all")}
								className="font-mono text-[10px] text-[var(--accent)] hover:underline cursor-pointer"
							>
								Reset to All Folders
							</button>
						)}
					</div>

					<div className="flex flex-wrap gap-2">
						{/* All Folders Option */}
						<button
							type="button"
							onClick={() => setSelectedMediaFolder("all")}
							className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-1.5 ${
								selectedMediaFolder === "all"
									? "bg-[var(--accent)] text-white border-[var(--accent)]"
									: "bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
							}`}
						>
							<span>All Assets</span>
							<span
								className={`text-[10px] px-1.5 py-0.2 border ${
									selectedMediaFolder === "all"
										? "border-white/40 bg-white/20 text-white"
										: "border-[var(--line)] bg-[var(--card)] text-[var(--muted)]"
								}`}
							>
								{mediaList.length}
							</span>
						</button>

						{/* Folder Pills */}
						{mediaFolders.map((folder) => {
							const count = folderCounts[folder] || 0;
							const isSelected = selectedMediaFolder === folder;
							return (
								<button
									key={folder}
									type="button"
									onClick={() => setSelectedMediaFolder(folder)}
									className={`px-3 py-1.5 font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
										isSelected
											? "bg-[var(--accent)] text-white border-[var(--accent)]"
											: "bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
									}`}
								>
									<IconFolder className="w-3.5 h-3.5 opacity-75" />
									<span>{folder}</span>
									<span
										className={`text-[10px] px-1.5 py-0.2 border ${
											isSelected
												? "border-white/40 bg-white/20 text-white"
												: "border-[var(--line)] bg-[var(--card)] text-[var(--muted)]"
										}`}
									>
										{count}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Media Grid */}
			{loading ? (
				<div className="border border-[var(--line)] bg-[var(--card)] p-12 text-center font-mono text-xs text-[var(--muted)]">
					<div className="flex flex-col items-center gap-3">
						<span className="w-3 h-3 rounded-full bg-[var(--accent)] animate-ping" />
						<span>Scanning public directory assets...</span>
					</div>
				</div>
			) : filteredMediaList.length === 0 ? (
				<div className="border border-[var(--line)] bg-[var(--card)] p-12 text-center">
					<p className="font-space text-lg text-[var(--ink)] font-medium mb-1">No assets found</p>
					<p className="font-mono text-xs text-[var(--muted)] max-w-sm mx-auto mb-4">
						{selectedMediaFolder !== "all"
							? `No media assets currently exist in public/${selectedMediaFolder}. You can upload a new asset directly into this folder.`
							: "No media assets matched your search filter."}
					</p>
					<button
						type="button"
						onClick={() => {
							if (selectedMediaFolder !== "all") {
								setUploadTargetFolder(selectedMediaFolder);
								setIsCustomFolder(false);
							}
							setShowUploadModal(true);
						}}
						className="px-4 py-2 bg-[var(--accent)] text-white font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"
					>
						<Plus className="w-3.5 h-3.5" aria-hidden="true" />
						<span>Upload to {selectedMediaFolder !== "all" ? `public/${selectedMediaFolder}` : "Folder"}</span>
					</button>
				</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{filteredMediaList.map((media) => (
						<div
							key={media.url}
							className="border border-[var(--line)] bg-[var(--card)] p-2.5 group hover:border-[var(--accent)] transition-all flex flex-col justify-between"
						>
							{/* Thumbnail */}
							<div className="aspect-16/10 bg-[var(--paper)] relative overflow-hidden mb-2 border border-[var(--line)]/50 group-hover:border-[var(--line)]">
								<Image
									src={media.url}
									alt={media.name}
									fill
									unoptimized
									className="object-cover group-hover:scale-105 transition-transform duration-300"
								/>
							</div>

							{/* Metadata & Actions */}
							<div className="font-mono text-[10px] space-y-1.5">
								<span className="text-[var(--ink)] font-medium truncate block" title={media.name}>
									{media.name}
								</span>

								<div className="flex items-center justify-between text-[var(--muted)] text-[9px]">
									<button
										type="button"
										onClick={() => setSelectedMediaFolder(media.folder)}
										className="hover:text-[var(--accent)] hover:underline truncate max-w-[90px] cursor-pointer text-left inline-flex items-center gap-1"
										title={`Filter by folder: ${media.folder}`}
									>
										<IconFolder className="w-2.5 h-2.5 shrink-0" />
										<span className="truncate">{media.folder}</span>
									</button>
									<span className="shrink-0">{(media.size / 1024).toFixed(1)} KB</span>
								</div>

								<div className="pt-2 border-t border-[var(--line)] flex items-center justify-between gap-1">
									<button
										type="button"
										onClick={() => {
											navigator.clipboard.writeText(media.url);
											showNotice(`Copied ${media.url} to clipboard!`, "info");
										}}
										className="text-[9px] uppercase tracking-wider text-[var(--accent)] hover:underline transition-colors cursor-pointer flex items-center gap-1"
									>
										<span>Copy URL</span>
									</button>

									<a
										href={media.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[9px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1"
									>
										<span>Open</span>
										<svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round"/></svg>
									</a>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* UPLOAD MODAL */}
			{showUploadModal && (
				<div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
					<div className="bg-[var(--card)] border border-[var(--line)] w-full max-w-lg shadow-2xl p-6 sm:p-8">
						<div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--line)]">
							<div>
								<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">
									Public Asset Upload
								</span>
								<h3 className="font-space font-medium text-xl text-[var(--ink)]">Upload to Folder</h3>
							</div>
							<button
								type="button"
								onClick={() => {
									setShowUploadModal(false);
									setUploadFile(null);
								}}
								className="font-mono text-xs text-[var(--muted)] hover:text-[var(--ink)] p-1 cursor-pointer"
							>
								<IconCross className="w-4 h-4" />
							</button>
						</div>

						<div className="space-y-5 font-mono text-xs">
							{/* Destination folder */}
							<div>
								<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2 font-medium">
									Target Destination Folder
								</label>
								<div className="flex items-center gap-4 mb-3">
									<label className="flex items-center gap-2 cursor-pointer text-[var(--ink)]">
										<input
											type="radio"
											name="folderType"
											checked={!isCustomFolder}
											onChange={() => setIsCustomFolder(false)}
											className="accent-[var(--accent)] cursor-pointer"
										/>
										<span>Existing Folder</span>
									</label>

									<label className="flex items-center gap-2 cursor-pointer text-[var(--ink)]">
										<input
											type="radio"
											name="folderType"
											checked={isCustomFolder}
											onChange={() => setIsCustomFolder(true)}
											className="accent-[var(--accent)] cursor-pointer"
										/>
										<span>Custom / New Subfolder</span>
									</label>
								</div>

								{!isCustomFolder ? (
									<select
										value={uploadTargetFolder}
										onChange={(e) => setUploadTargetFolder(e.target.value)}
										className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
									>
										{mediaFolders.map((f) => (
											<option key={f} value={f}>
												public/{f}
											</option>
										))}
									</select>
								) : (
									<div>
										<input
											type="text"
											value={customFolderName}
											onChange={(e) => setCustomFolderName(e.target.value)}
											placeholder="e.g. banners, assets/icons, projects/case-study"
											className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
										/>
										<p className="text-[10px] text-[var(--muted)] mt-1.5">
											Subdirectories will be automatically created under Next.js <code>public/</code>.
										</p>
									</div>
								)}

								<div className="mt-2.5 p-2 bg-[var(--paper)] border border-[var(--line)] text-[11px] text-[var(--muted)] flex items-center justify-between">
									<span>Saving to:</span>
									<code className="text-[var(--ink)] font-semibold">
										public/
										{isCustomFolder && customFolderName.trim() ? customFolderName.trim() : uploadTargetFolder}/
									</code>
								</div>
							</div>

							{/* File Selection */}
							<div>
								<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2 font-medium">
									Select File to Upload
								</label>
								<div className="border-2 border-dashed border-[var(--line)] hover:border-[var(--accent)] bg-[var(--paper)] p-6 text-center transition-colors">
									<input
										id="asset-upload-input"
										type="file"
										accept="image/*,.pdf,.svg,.ico,.avif,.webp"
										onChange={(e) => {
											const f = e.target.files?.[0];
											if (f) setUploadFile(f);
										}}
										className="hidden"
									/>
									<label htmlFor="asset-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
										<IconUpload className="w-8 h-8 text-[var(--accent)] opacity-80" />
										<span className="text-[var(--ink)] font-medium">
											{uploadFile ? uploadFile.name : "Choose an asset file or drag & drop"}
										</span>
										<span className="text-[10px] text-[var(--muted)]">
											{uploadFile
												? `${(uploadFile.size / 1024).toFixed(1)} KB • Click to change file`
												: "Supports WebP, PNG, JPG, SVG, GIF, AVIF, ICO, PDF"}
										</span>
									</label>
								</div>
							</div>

							{/* Dialog Actions */}
							<div className="flex justify-end items-center gap-3 pt-4 border-t border-[var(--line)]">
								<button
									type="button"
									onClick={() => {
										setShowUploadModal(false);
										setUploadFile(null);
									}}
									className="px-4 py-2 border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] uppercase tracking-wider cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="button"
									disabled={!uploadFile || uploadingImage}
									onClick={() => {
										if (uploadFile) {
											const folder =
												isCustomFolder && customFolderName.trim()
													? customFolderName.trim()
													: uploadTargetFolder;
											handleMediaUpload(uploadFile, folder);
										}
									}}
									className="px-6 py-2 bg-[var(--accent)] text-white hover:opacity-90 uppercase tracking-wider font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
								>
									{uploadingImage ? (
										<>
											<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
											<span>Uploading...</span>
										</>
									) : (
										<span>Upload Asset</span>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
