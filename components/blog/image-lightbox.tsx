"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
	src: string;
	alt: string;
	/** Pass raw SVG markup to render a mermaid diagram instead of an <img> */
	svgMarkup?: string;
	onClose: () => void;
}

export default function ImageLightbox({ src, alt, svgMarkup, onClose }: ImageLightboxProps) {
	const [scale, setScale] = useState(1);
	const [translate, setTranslate] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLDivElement>(null);

	// Close on Escape
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	// Lock body scroll
	useEffect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, []);

	// Non-passive wheel listener so preventDefault() actually works and
	// the underlying page doesn't scroll while zooming inside the lightbox.
	useEffect(() => {
		const el = imageRef.current;
		if (!el) return;

		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setScale((s) => Math.min(8, Math.max(0.5, s - e.deltaY * 0.001)));
		};

		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, []);

	// Also block wheel on the backdrop so any stray scroll events don't leak
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
		};

		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, []);

	// Mouse drag
	const onMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (scale <= 1) return;
			setIsDragging(true);
			dragStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };
		},
		[scale, translate],
	);

	const onMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging || !dragStart.current) return;
			setTranslate({
				x: dragStart.current.tx + (e.clientX - dragStart.current.x),
				y: dragStart.current.ty + (e.clientY - dragStart.current.y),
			});
		},
		[isDragging],
	);

	const onMouseUp = useCallback(() => {
		setIsDragging(false);
		dragStart.current = null;
	}, []);

	// Reset zoom/pan
	const reset = useCallback(() => {
		setScale(1);
		setTranslate({ x: 0, y: 0 });
	}, []);

	// Click backdrop to close (only when not dragging and not zoomed)
	const onBackdropClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === containerRef.current) {
				if (scale > 1) {
					reset();
				} else {
					onClose();
				}
			}
		},
		[scale, reset, onClose],
	);

	const content = (
		<div
			aria-label="Image lightbox"
			aria-modal="true"
			className="z-9999 fixed inset-0 flex justify-center items-center bg-black/90 backdrop-blur-sm"
			onClick={onBackdropClick}
			onMouseMove={onMouseMove}
			onMouseUp={onMouseUp}
			onMouseLeave={onMouseUp}
			ref={containerRef}
			role="dialog"
		>
			{/* Controls */}
			<div className="top-4 right-4 z-10 absolute flex items-center gap-2">
				{scale !== 1 && (
					<button
						aria-label="Reset zoom"
						className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 border border-border font-mono text-muted-foreground hover:text-foreground text-xs transition-colors"
						onClick={reset}
						type="button"
					>
						<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						{Math.round(scale * 100)}%
					</button>
				)}
				<button
					aria-label="Close lightbox"
					className="flex justify-center items-center bg-background/80 border border-border w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
					onClick={onClose}
					type="button"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{/* Hint */}
			{scale === 1 && (
				<div className="bottom-6 left-1/2 absolute font-mono text-muted-foreground/60 text-xs -translate-x-1/2 pointer-events-none select-none">
					scroll to zoom · click outside to close · esc to dismiss
				</div>
			)}

			{/* Image / SVG */}
			<div
				className="relative max-w-[90vw] max-h-[90vh]"
				onMouseDown={onMouseDown}
				ref={imageRef}
				style={{
					cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
					transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
					transition: isDragging ? "none" : "transform 0.15s ease",
					userSelect: "none",
				}}
			>
				{svgMarkup ? (
					<div
						className="bg-background/10 p-6 max-w-[85vw] [&_svg]:max-w-full [&_svg]:h-auto max-h-[85vh] overflow-auto"
						// biome-ignore lint: controlled SVG from mermaid renderer
						dangerouslySetInnerHTML={{ __html: svgMarkup }}
					/>
				) : (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						alt={alt}
						className="border border-border/30 max-w-[85vw] max-h-[85vh] object-contain"
						draggable={false}
						src={src}
					/>
				)}
			</div>
		</div>
	);

	return createPortal(content, document.body);
}
