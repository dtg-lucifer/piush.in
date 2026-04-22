"use client";

import { useEffect, useState } from "react";

const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface GlitchRevealTextProps {
	text: string;
	className?: string;
}

export default function GlitchRevealText({ text, className }: GlitchRevealTextProps) {
	const [displayText, setDisplayText] = useState(text.replace(/[^\s]/g, " "));

	useEffect(() => {
		let frame = 0;

		const interval = window.setInterval(() => {
			frame += 0.35;

			const next = text
				.split("")
				.map((char, index) => {
					if (char === " ") {
						return " ";
					}

					if (index < frame) {
						return char;
					}

					return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
				})
				.join("");

			setDisplayText(next);

			if (frame >= text.length) {
				window.clearInterval(interval);
				setDisplayText(text);
			}
		}, 45);

		return () => {
			window.clearInterval(interval);
		};
	}, [text]);

	return <span className={className}>{displayText}</span>;
}
