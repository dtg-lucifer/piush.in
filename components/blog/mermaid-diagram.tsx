"use client";

import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { useEffect, useId, useMemo, useState } from "react";
import ImageLightbox from "./image-lightbox";

interface MermaidDiagramProps {
	chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
	const { resolvedTheme } = useTheme();
	const id = useId();
	const safeId = useMemo(() => id.replace(/:/g, "-"), [id]);
	const [svgMarkup, setSvgMarkup] = useState("");
	const [hasError, setHasError] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);

	useEffect(() => {
		let isActive = true;

		const renderDiagram = async () => {
			try {
				setHasError(false);

				mermaid.initialize({
					startOnLoad: false,
					securityLevel: "loose",
					theme: resolvedTheme === "light" ? "default" : "dark",
					fontFamily: "var(--font-sans)",
				});

				const { svg } = await mermaid.render(`mermaid-${safeId}`, chart);

				if (isActive) {
					setSvgMarkup(svg);
				}
			} catch {
				if (isActive) {
					setHasError(true);
				}
			}
		};

		void renderDiagram();

		return () => {
			isActive = false;
		};
	}, [chart, resolvedTheme, safeId]);

	if (hasError) {
		return (
			<pre className="code-block-wrapper">
				<code>{chart}</code>
			</pre>
		);
	}

	if (!svgMarkup) {
		return <div className="text-muted-foreground text-sm mermaid-diagram">Rendering diagram...</div>;
	}

	return (
		<>
			<div className="group relative flex justify-center w-full mermaid-diagram">
				<div
					className="w-full"
					dangerouslySetInnerHTML={{ __html: svgMarkup }}
				/>
				{/* Expand button */}
				<button
					aria-label="View diagram fullscreen"
					className="right-2 bottom-2 absolute flex items-center gap-1 bg-background/80 opacity-0 group-hover:opacity-100 px-2 py-1 border border-border font-mono text-[10px] text-muted-foreground transition-opacity duration-200 cursor-zoom-in"
					onClick={() => setLightboxOpen(true)}
					type="button"
				>
					<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
					</svg>
					zoom
				</button>
			</div>

			{lightboxOpen && (
				<ImageLightbox
					alt="Mermaid diagram"
					onClose={() => setLightboxOpen(false)}
					src=""
					svgMarkup={svgMarkup}
				/>
			)}
		</>
	);
}
