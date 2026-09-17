"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import LatexText from "@/components/latex-text";
import type { Project } from "@/lib/cms/types";
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

export default function CmsProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [mediaList, setMediaList] = useState<MediaItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

	const [projectSearch, setProjectSearch] = useState("");
	const [editingProject, setEditingProject] = useState<Project | null>(null);
	const [isNewProject, setIsNewProject] = useState(false);
	const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [confirmDeleteProject, setConfirmDeleteProject] = useState<number | null>(null);

	const showNotice = (text: string, type: "success" | "error" | "info" = "success") => {
		setNotice({ text, type });
		setTimeout(() => setNotice(null), 4000);
	};

	const loadData = async () => {
		setLoading(true);
		try {
			const [pRes, mRes] = await Promise.all([
				fetch("/api/cms/projects"),
				fetch("/api/cms/media"),
			]);

			if (pRes.ok) {
				const pData = await pRes.json();
				setProjects(pData.projects || []);
			}
			if (mRes.ok) {
				const mData = await mRes.json();
				setMediaList(mData.media || []);
			}
		} catch (err) {
			console.error("Error loading projects data:", err);
			showNotice("Failed to load projects", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const saveProjectsList = async (updatedProjects: Project[]) => {
		setSaving(true);
		try {
			const res = await fetch("/api/cms/projects", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ projects: updatedProjects }),
			});
			const data = await res.json();
			if (res.ok && data.success) {
				setProjects(updatedProjects);
				showNotice("Changes saved and synchronized across Firestore & local files.", "success");
			} else {
				showNotice(data.error || "Failed to save projects", "error");
			}
		} catch (_err) {
			showNotice("Network error saving projects", "error");
		} finally {
			setSaving(false);
		}
	};

	const handleMoveProject = (index: number, direction: "up" | "down") => {
		const newIndex = direction === "up" ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= projects.length) return;

		const updated = [...projects];
		const temp = updated[index];
		updated[index] = updated[newIndex];
		updated[newIndex] = temp;

		const ordered = updated.map((p, idx) => ({ ...p, order: idx }));
		saveProjectsList(ordered);
	};

	const handleToggleFeatured = (index: number) => {
		const updated = [...projects];
		updated[index] = { ...updated[index], featured: !updated[index].featured };
		saveProjectsList(updated);
	};

	const handleToggleWip = (index: number) => {
		const updated = [...projects];
		updated[index] = { ...updated[index], wip: !updated[index].wip };
		saveProjectsList(updated);
	};

	const handleSaveProjectForm = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingProject) return;

		let updated: Project[];
		if (isNewProject) {
			updated = [{ ...editingProject, order: 0 }, ...projects].map((p, idx) => ({
				...p,
				order: idx,
			}));
		} else {
			updated = projects.map((p) => (p.name === editingProject.name ? editingProject : p));
		}

		saveProjectsList(updated);
		setEditingProject(null);
		setIsNewProject(false);
	};

	const handleDeleteProject = (index: number) => {
		const updated = projects.filter((_, idx) => idx !== index);
		saveProjectsList(updated);
		setConfirmDeleteProject(null);
	};

	const handleMediaUpload = async (file: File) => {
		setUploadingImage(true);
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", "projects");

			const res = await fetch("/api/cms/media", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();
			if (res.ok && data.url) {
				showNotice(`Uploaded ${data.name} to public/projects`, "success");
				const mRes = await fetch("/api/cms/media");
				if (mRes.ok) {
					const mData = await mRes.json();
					setMediaList(mData.media || []);
				}
				if (editingProject) {
					setEditingProject({ ...editingProject, image: data.url });
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

	const filteredProjects = useMemo(() => {
		if (!projectSearch.trim()) return projects;
		const q = projectSearch.toLowerCase();
		return projects.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q) ||
				p.tags.some((t) => t.toLowerCase().includes(q)),
		);
	}, [projects, projectSearch]);

	return (
		<div className="space-y-6">
			{/* Top Header Card */}
			<div className="border border-[var(--line)] bg-[var(--card)] p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="w-2 h-2 bg-[var(--accent)] inline-block" />
							<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">
								Portfolio Showcase
							</span>
						</div>
						<h1 className="font-space font-medium text-2xl text-[var(--ink)]">Projects Management</h1>
						<p className="font-mono text-xs text-[var(--muted)] mt-1.5 leading-relaxed max-w-xl">
							Manage works displayed on the homepage and /projects. Drag or reorder with ▲ / ▼ to set presentation sequence. Toggle Featured to spotlight projects on the landing page.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2 shrink-0">
						<button
							type="button"
							onClick={() => {
								setIsNewProject(true);
								setEditingProject({
									name: "",
									description: "",
									image: mediaList[0]?.url || "/projects/veritas_demo.webp",
									repoUrl: "",
									demoUrl: "",
									tags: ["Rust", "Systems"],
									languages: ["Rust"],
									wip: false,
									featured: true,
								});
							}}
							className="px-4 py-2.5 bg-[var(--accent)] text-white hover:opacity-90 font-mono text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5 shadow-xs"
						>
							<span>+ New Project</span>
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
							value={projectSearch}
							onChange={(e) => setProjectSearch(e.target.value)}
							placeholder="Filter projects by title, tag, or description..."
							className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3.5 py-2 font-mono text-xs text-[var(--ink)] outline-none pl-8"
						/>
						<span className="absolute left-2.5 top-2.5 text-[var(--muted)]"><IconSearch /></span>
					</div>

					<div className="font-mono text-xs text-[var(--muted)] flex items-center gap-2">
						<span>Showing</span>
						<span className="font-semibold text-[var(--ink)]">{filteredProjects.length}</span>
						<span>of {projects.length} projects</span>
						{saving && <span className="text-[var(--accent)] animate-pulse ml-2">Saving...</span>}
					</div>
				</div>
			</div>

			{/* Project List */}
			{loading ? (
				<div className="border border-[var(--line)] bg-[var(--card)] p-12 text-center font-mono text-xs text-[var(--muted)]">
					<div className="flex flex-col items-center gap-3">
						<span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-ping" />
						<span>Loading projects...</span>
					</div>
				</div>
			) : filteredProjects.length === 0 ? (
				<div className="border border-[var(--line)] bg-[var(--card)] p-12 text-center">
					<p className="font-space text-lg text-[var(--ink)] font-medium mb-1">No projects found</p>
					<p className="font-mono text-xs text-[var(--muted)] max-w-sm mx-auto">
						No projects matched your search &ldquo;{projectSearch}&rdquo;.
					</p>
				</div>
			) : (
				<div className="border border-[var(--line)] bg-[var(--card)] divide-y divide-[var(--line)]">
					{filteredProjects.map((project, _index) => {
						const originalIndex = projects.findIndex((p) => p.name === project.name);
						const isFeatured = project.featured === true;
						const isWip = project.wip === true;

						return (
							<div
								key={project.name}
								className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--paper)]/50 transition-colors"
							>
								{/* Left: Sequence Controls & Details */}
								<div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
									{/* Reorder Buttons */}
									<div className="flex flex-col items-center justify-center font-mono text-xs shrink-0">
										<button
											type="button"
											disabled={originalIndex === 0 || saving}
											onClick={() => handleMoveProject(originalIndex, "up")}
											className="p-1 hover:text-[var(--ink)] disabled:opacity-20 text-[var(--muted)] cursor-pointer"
											title="Move Up in Homepage Sequence"
										>
											<IconChevronUp />
										</button>
										<span className="text-[10px] text-[var(--muted)] font-bold">{originalIndex + 1}</span>
										<button
											type="button"
											disabled={originalIndex === projects.length - 1 || saving}
											onClick={() => handleMoveProject(originalIndex, "down")}
											className="p-1 hover:text-[var(--ink)] disabled:opacity-20 text-[var(--muted)] cursor-pointer"
											title="Move Down in Homepage Sequence"
										>
											<IconChevronDown />
										</button>
									</div>

									{/* Thumbnail */}
									<div className="relative w-16 h-12 sm:w-20 sm:h-14 bg-[var(--paper)] border border-[var(--line)] overflow-hidden shrink-0">
										{project.image ? (
											<Image src={project.image} alt={project.name} fill unoptimized className="object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[var(--muted)]">
												No img
											</div>
										)}
									</div>

									{/* Metadata */}
									<div className="space-y-1 min-w-0 flex-1">
										<div className="flex items-center gap-2 flex-wrap">
											<h3 className="font-space font-medium text-sm text-[var(--ink)] truncate">
												{project.name}
											</h3>
											{isWip && (
												<span className="px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)]">
													WIP
												</span>
											)}
										</div>

										<p className="font-mono text-xs text-[var(--muted)] line-clamp-1">
											{project.description}
										</p>

										<div className="flex items-center gap-2 flex-wrap font-mono text-[10px] text-[var(--muted)] pt-0.5">
											{project.tags?.map((tag) => (
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

								{/* Right: Toggles & Actions */}
								<div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--line)]">
									{/* Featured toggle */}
									<button
										type="button"
										onClick={() => handleToggleFeatured(originalIndex)}
										className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1.5 ${
											isFeatured
												? "border-[var(--accent)] bg-[var(--accent)] text-white font-semibold"
												: "border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
										}`}
										title="Toggle display on home page"
									>
										<span>{isFeatured ? "Home: Active" : "Home: Off"}</span>
									</button>

									{/* WIP toggle */}
									<button
										type="button"
										onClick={() => handleToggleWip(originalIndex)}
										className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border cursor-pointer transition-colors ${
											isWip
												? "border-[var(--line)] bg-[var(--line)] text-[var(--ink)] font-semibold"
												: "border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]"
										}`}
									>
										{isWip ? "WIP" : "Done"}
									</button>

									{/* Edit Details */}
									<button
										type="button"
										onClick={() => {
											setIsNewProject(false);
											setEditingProject({ ...project });
										}}
										className="px-3 py-1 font-mono text-[11px] uppercase tracking-wider border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors cursor-pointer"
									>
										Edit
									</button>

									{/* Delete */}
									<button
										type="button"
										onClick={() => setConfirmDeleteProject(originalIndex)}
										className="p-1.5 font-mono text-xs text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
										title="Delete project"
									>
										<IconTrash />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* EDIT / CREATE PROJECT MODAL */}
			{editingProject && (
				<div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
					<div className="bg-[var(--card)] border border-[var(--line)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
						<div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--line)]">
							<div>
								<span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">
									{isNewProject ? "Create Project" : "Edit Project Details"}
								</span>
								<h2 className="font-space font-medium text-xl text-[var(--ink)]">
									{editingProject.name || "Untitled Project"}
								</h2>
							</div>
							<button
								type="button"
								onClick={() => {
									setEditingProject(null);
									setIsNewProject(false);
								}}
								className="p-1 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
								aria-label="Close modal"
							>
								<IconCross />
							</button>
						</div>

						<form onSubmit={handleSaveProjectForm} className="space-y-4 font-mono text-xs">
							<div>
								<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
									Project Name *
								</label>
								<input
									type="text"
									required
									value={editingProject.name}
									onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
									className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
									placeholder="Project name"
								/>
							</div>

							<div>
								<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
									Description (LaTeX supported e.g. $P(S) \mid S$) *
								</label>
								<textarea
									rows={4}
									required
									value={editingProject.description}
									onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
									className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] p-3 text-[var(--ink)] outline-none font-sans text-xs leading-relaxed"
									placeholder="Project architectural overview and impact..."
								/>
								{editingProject.description && (
									<div className="mt-2 p-2.5 bg-[var(--paper)] border border-[var(--line)] text-xs text-[var(--muted)]">
										<span className="text-[10px] uppercase text-[var(--muted)] block mb-1">
											Live LaTeX Preview:
										</span>
										<LatexText text={editingProject.description} />
									</div>
								)}
							</div>

							{/* Image Selection */}
							<div>
								<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
									Project Image URL *
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										required
										value={editingProject.image}
										onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
										className="flex-1 bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
										placeholder="/projects/filename.webp"
									/>
									<button
										type="button"
										onClick={() => setMediaPickerOpen(true)}
										className="px-3 py-2 bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)] cursor-pointer"
									>
										Pick Image
									</button>
								</div>
								{editingProject.image && (
									<div className="mt-2 relative w-24 h-16 border border-[var(--line)] overflow-hidden">
										<Image src={editingProject.image} alt="Preview" fill unoptimized className="object-cover" />
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
										Repository URL
									</label>
									<input
										type="url"
										value={editingProject.repoUrl}
										onChange={(e) => setEditingProject({ ...editingProject, repoUrl: e.target.value })}
										className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
										placeholder="https://github.com/..."
									/>
								</div>

								<div>
									<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
										Demo / Live URL
									</label>
									<input
										type="url"
										value={editingProject.demoUrl}
										onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
										className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
										placeholder="https://..."
									/>
								</div>
							</div>

							<div>
								<label className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1 font-medium">
									Tags (comma-separated)
								</label>
								<input
									type="text"
									value={editingProject.tags?.join(", ") || ""}
									onChange={(e) =>
										setEditingProject({
											...editingProject,
											tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
										})
									}
									className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3 py-2 text-[var(--ink)] outline-none"
									placeholder="Rust, WebAssembly, Distributed"
								/>
							</div>

							<div className="flex items-center gap-6 pt-2">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={editingProject.featured ?? true}
										onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
										className="accent-[var(--accent)]"
									/>
									<span className="text-[11px] uppercase text-[var(--ink)]">Featured on Homepage</span>
								</label>

								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={editingProject.wip ?? false}
										onChange={(e) => setEditingProject({ ...editingProject, wip: e.target.checked })}
										className="accent-[var(--accent)]"
									/>
									<span className="text-[11px] uppercase text-[var(--ink)]">Work In Progress</span>
								</label>
							</div>

							<div className="flex justify-end gap-3 pt-6 border-t border-[var(--line)]">
								<button
									type="button"
									onClick={() => {
										setEditingProject(null);
										setIsNewProject(false);
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
									{saving ? "Saving..." : "Save Project"}
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
							<h3 className="font-space font-medium text-lg text-[var(--ink)]">Select Project Image</h3>
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
										if (editingProject) {
											setEditingProject({ ...editingProject, image: m.url });
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
								<span>{uploadingImage ? "Uploading..." : "+ Upload New Image"}</span>
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
			{confirmDeleteProject !== null && (
				<div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
					<div className="bg-[var(--card)] border border-[var(--line)] max-w-sm w-full p-6 shadow-2xl font-mono text-xs text-center space-y-4">
						<h3 className="font-space text-lg text-[var(--ink)] font-medium">Delete Project?</h3>
						<p className="text-[var(--muted)] leading-relaxed">
							This permanently removes &ldquo;{projects[confirmDeleteProject]?.name}&rdquo; from both Firestore and local records.
						</p>
						<div className="flex justify-center gap-3 pt-2">
							<button
								type="button"
								onClick={() => setConfirmDeleteProject(null)}
								className="px-4 py-2 border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] uppercase tracking-wider"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => handleDeleteProject(confirmDeleteProject)}
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
