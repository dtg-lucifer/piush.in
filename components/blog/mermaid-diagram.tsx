"use client";

import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { useEffect, useId, useMemo, useState } from "react";

interface MermaidDiagramProps {
	chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
	const { resolvedTheme } = useTheme();
	const id = useId();
	const safeId = useMemo(() => id.replace(/:/g, "-"), [id]);
	const [svgMarkup, setSvgMarkup] = useState("");
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		let isActive = true;

		const renderDiagram = async () => {
			try {
				setHasError(false);

				mermaid.initialize({
					startOnLoad: false,
					securityLevel: "loose",
					theme: resolvedTheme === "light" ? "default" : "dark",
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
		<div
			className="mermaid-diagram"
			dangerouslySetInnerHTML={{ __html: svgMarkup }}
		/>
	);
}
