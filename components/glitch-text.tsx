"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const UPPER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const LOWER_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function getRandomChar(char: string) {
	if (char >= "a" && char <= "z") {
		return LOWER_CHARS[Math.floor(Math.random() * LOWER_CHARS.length)];
	}
	return UPPER_CHARS[Math.floor(Math.random() * UPPER_CHARS.length)];
}

interface GlitchRevealTextProps {
	text: string;
	className?: string;
	delay?: number;
	retriggerOnHover?: boolean;
	triggerOnHover?: boolean;
	triggerOnScroll?: boolean;
	as?: "span" | "strong" | "div" | "h1" | "h2" | "h3" | "p";
}

export default function GlitchRevealText({
	text,
	className,
	delay = 0,
	retriggerOnHover = true,
	triggerOnHover,
	triggerOnScroll = false,
	as: Component = "span",
}: GlitchRevealTextProps) {
	const [displayText, setDisplayText] = useState(text);
	const [isRevealed, setIsRevealed] = useState(!triggerOnScroll);
	const elementRef = useRef<HTMLElement | null>(null);
	const intervalRef = useRef<number | null>(null);
	const hasTriggeredRef = useRef(false);

	const shouldRetrigger = triggerOnHover !== undefined ? triggerOnHover : retriggerOnHover;

	const triggerGlitch = useCallback(() => {
		if (intervalRef.current !== null) {
			window.clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		let frame = 0;
		const frameStep = Math.max(0.35, text.length / 28);
		const interval = window.setInterval(() => {
			frame += frameStep;

			const next = text
				.split("")
				.map((char, index) => {
					if (char === " ") {
						return " ";
					}
					if (index < frame) {
						return char;
					}
					return getRandomChar(char);
				})
				.join("");

			setDisplayText(next);

			if (frame >= text.length) {
				window.clearInterval(interval);
				if (intervalRef.current === interval) {
					intervalRef.current = null;
				}
				setDisplayText(text);
			}
		}, 42);

		intervalRef.current = interval;

		return () => {
			window.clearInterval(interval);
			if (intervalRef.current === interval) {
				intervalRef.current = null;
			}
		};
	}, [text]);

	useEffect(() => {
		if (!triggerOnScroll) {
			let cleanupGlitch: (() => void) | undefined;

			// Listen for the page-loader-done custom event so it triggers right as loader fades
			const handleLoaderDone = () => {
				if (cleanupGlitch) cleanupGlitch();
				cleanupGlitch = triggerGlitch();
			};

			window.addEventListener("page-loader-done", handleLoaderDone);

			// Fallback delay timer in case the event was already fired or loader is absent
			const timer = setTimeout(() => {
				cleanupGlitch = triggerGlitch();
			}, delay || 2200);

			return () => {
				window.removeEventListener("page-loader-done", handleLoaderDone);
				clearTimeout(timer);
				if (cleanupGlitch) cleanupGlitch();
				if (intervalRef.current !== null) {
					window.clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
			};
		}

		// Scroll-triggered reveal mode
		const element = elementRef.current;
		if (!element) return;

		let timeoutId: NodeJS.Timeout | undefined;

		if (typeof IntersectionObserver === "undefined") {
			setIsRevealed(true);
			triggerGlitch();
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting && !hasTriggeredRef.current) {
						hasTriggeredRef.current = true;
						observer.unobserve(entry.target);

						timeoutId = setTimeout(() => {
							setIsRevealed(true);
							triggerGlitch();
						}, delay);
						break;
					}
				}
			},
			{ threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
		);

		observer.observe(element);

		return () => {
			observer.disconnect();
			if (timeoutId) clearTimeout(timeoutId);
			if (intervalRef.current !== null) {
				window.clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [triggerOnScroll, triggerGlitch, delay]);

	return (
		<Component
			ref={elementRef as any}
			className={`inline-block transition-opacity duration-200 ${
				isRevealed ? "opacity-100" : "opacity-0"
			} ${className || ""}`}
			onMouseEnter={shouldRetrigger ? triggerGlitch : undefined}
		>
			{displayText}
		</Component>
	);
}
