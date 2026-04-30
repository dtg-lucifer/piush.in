"use client";

import { useState } from "react";
import ImageLightbox from "./image-lightbox";

interface ZoomableImageProps {
	src: string;
	alt: string;
	className?: string;
}

export default function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				aria-label={`View full size: ${alt || "image"}`}
				className="group inline-block relative bg-transparent p-0 border-0 cursor-zoom-in"
				onClick={() => setOpen(true)}
				type="button"
			>
				{/* biome-ignore lint: markdown images have dynamic src */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					alt={alt}
					className={`${className ?? ""} transition-opacity duration-200 group-hover:opacity-90`}
					src={src}
				/>
				<span className="right-2 bottom-2 absolute flex items-center gap-1 bg-background/80 opacity-0 group-hover:opacity-100 px-2 py-1 border border-border font-mono text-[10px] text-muted-foreground transition-opacity duration-200 pointer-events-none select-none">
					<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
					</svg>
					zoom
				</span>
			</button>

			{open && (
				<ImageLightbox
					alt={alt}
					onClose={() => setOpen(false)}
					src={src}
				/>
			)}
		</>
	);
}
