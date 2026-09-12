"use client";

import { useEffect, useState } from "react";

export default function PageLoader() {
	const [progress, setProgress] = useState(0);
	const [visible, setVisible] = useState(true);
	const [fading, setFading] = useState(false);

	useEffect(() => {
		// Total duration of progress increment: 2000ms (2 seconds)
		const duration = 2000;
		const startTime = performance.now();

		// Cubic bezier / ease-in curve: slow start, smoothly accelerating towards 100%
		// t in [0, 1] => progress = (t * t * 0.4 + t * 0.6) or easeInQuad / easeInCubic
		let animationFrameId: number;

		const updateProgress = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const rawT = Math.min(1, elapsed / duration);

			// Ease-in polynomial: gradual start, accelerates gracefully towards 100%
			// At t=0.2 => ~6%, t=0.5 => ~30%, t=0.8 => ~70%, t=1.0 => 100%
			const easeInT = Math.pow(rawT, 1.8);
			const currentProgress = Math.min(100, Math.round(easeInT * 100));

			setProgress(currentProgress);

			if (rawT < 1) {
				animationFrameId = requestAnimationFrame(updateProgress);
			} else {
				setProgress(100);
			}
		};

		animationFrameId = requestAnimationFrame(updateProgress);

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	useEffect(() => {
		if (progress === 100) {
			// Hold at 100% for 250ms, then trigger the 0.7s graceful full-screen fade out
			const fadeTimeout = setTimeout(() => {
				setFading(true);
				// Dispatch custom event right as the overlay begins fading so hero glitch text fires visibly
				if (typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("page-loader-done"));
				}
			}, 250);

			// Unmount after 250ms hold + 700ms fade completes
			const removeTimeout = setTimeout(() => {
				setVisible(false);
			}, 950);

			return () => {
				clearTimeout(fadeTimeout);
				clearTimeout(removeTimeout);
			};
		}
	}, [progress]);

	if (!visible) return null;

	return (
		<div
			aria-label="Loading page"
			aria-live="polite"
			className={`fullscreen-loader-overlay ${fading ? "fullscreen-loader-fade-out" : ""}`}
		>
			<div className="fullscreen-loader-content">
				{/* Top Branding / Monogram */}
				<div className="fullscreen-loader-brand">
					<span>PB</span>
					<span className="fullscreen-loader-brand-dot">.</span>
				</div>

				{/* Progress Track */}
				<div className="fullscreen-loader-bar-track">
					<div className="fullscreen-loader-bar-fill" style={{ width: `${progress}%` }} />
				</div>

				{/* Status & Counter */}
				<div className="fullscreen-loader-status-row">
					<span className="fullscreen-loader-label">INITIALIZING SYSTEM</span>
					<span className="fullscreen-loader-counter">{progress}%</span>
				</div>
			</div>
		</div>
	);
}
