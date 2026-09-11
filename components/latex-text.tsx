import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface LatexTextProps {
	text: string;
	className?: string;
}

export default function LatexText({ text, className }: LatexTextProps) {
	if (!text) return null;

	// Split text by inline math delimiter $...$
	// e.g. "Formula $P(S_{t+1})$ and $K=5$ here"
	const parts = text.split(/(\$[^$]+\$)/g);

	return (
		<span className={className}>
			{parts.map((part, index) => {
				if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
					const math = part.slice(1, -1);
					try {
						const html = katex.renderToString(math, {
							throwOnError: false,
							displayMode: false,
						});
						return (
							<span
								key={index}
								dangerouslySetInnerHTML={{ __html: html }}
								className="inline-katex text-[1.05em] align-baseline mx-0.5"
							/>
						);
					} catch {
						return <span key={index}>{part}</span>;
					}
				}
				return <React.Fragment key={index}>{part}</React.Fragment>;
			})}
		</span>
	);
}
