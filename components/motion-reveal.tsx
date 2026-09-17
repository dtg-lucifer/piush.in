"use client";

import React, { useEffect, useState } from "react";
import { motion, type HTMLMotionProps } from "motion/react";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

export interface ImageRevealProps {
	children: React.ReactNode;
	direction?: "horizontal" | "vertical";
	duration?: number;
	delay?: number;
	zoom?: boolean;
	className?: string;
	aspectRatio?: string;
	waitForLoader?: boolean;
}

/**
 * Architectural curtain reveal for images using clip-path, exactly as implemented
 * in modern luxury portfolios (e.g. the demo codebase).
 */
export function ImageReveal({
	children,
	direction = "horizontal",
	duration = 1.05,
	delay = 0,
	zoom = true,
	className = "",
	waitForLoader = false,
}: ImageRevealProps) {
	const initialClip =
		direction === "horizontal"
			? "polygon(0 0, 0 0, 0 100%, 0% 100%)"
			: "polygon(0 0, 100% 0, 100% 0, 0 0)";

	const targetClip = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";

	const [loaderReady, setLoaderReady] = useState(!waitForLoader);

	useEffect(() => {
		if (!waitForLoader) return;

		const handleLoaderDone = () => {
			setLoaderReady(true);
		};

		window.addEventListener("page-loader-done", handleLoaderDone);

		// Fallback timeout in case page-loader-done was already dispatched or loader absent
		const timer = setTimeout(() => {
			setLoaderReady(true);
		}, 2400);

		return () => {
			window.removeEventListener("page-loader-done", handleLoaderDone);
			clearTimeout(timer);
		};
	}, [waitForLoader]);

	if (waitForLoader) {
		return (
			<motion.div
				initial={{ clipPath: initialClip }}
				animate={loaderReady ? { clipPath: targetClip } : { clipPath: initialClip }}
				transition={{ duration, delay, ease: LUXURY_EASE }}
				className={`relative overflow-hidden w-full h-full ${className}`}
			>
				{zoom ? (
					<motion.div
						initial={{ scale: 1.08 }}
						animate={loaderReady ? { scale: 1 } : { scale: 1.08 }}
						transition={{ duration: duration * 1.15, delay, ease: LUXURY_EASE }}
						className="w-full h-full"
					>
						{children}
					</motion.div>
				) : (
					children
				)}
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ clipPath: initialClip }}
			whileInView={{ clipPath: targetClip }}
			viewport={{ once: true, margin: "-50px" }}
			transition={{ duration, delay, ease: LUXURY_EASE }}
			className={`relative overflow-hidden w-full h-full ${className}`}
		>
			{zoom ? (
				<motion.div
					initial={{ scale: 1.08 }}
					whileInView={{ scale: 1 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: duration * 1.15, delay, ease: LUXURY_EASE }}
					className="w-full h-full"
				>
					{children}
				</motion.div>
			) : (
				children
			)}
		</motion.div>
	);
}

export interface RevealProps extends HTMLMotionProps<"div"> {
	children: React.ReactNode;
	direction?: "up" | "down" | "left" | "right" | "none";
	distance?: number;
	duration?: number;
	delay?: number;
	className?: string;
	waitForLoader?: boolean;
}

/**
 * Micro-reveal wrapper for cards, blocks, and headings
 */
export function Reveal({
	children,
	direction = "up",
	distance = 20,
	duration = 0.7,
	delay = 0,
	className = "",
	waitForLoader = false,
	...motionProps
}: RevealProps) {
	const [loaderReady, setLoaderReady] = useState(!waitForLoader);

	useEffect(() => {
		if (!waitForLoader) return;

		const handleLoaderDone = () => {
			setLoaderReady(true);
		};

		window.addEventListener("page-loader-done", handleLoaderDone);

		const timer = setTimeout(() => {
			setLoaderReady(true);
		}, 2400);

		return () => {
			window.removeEventListener("page-loader-done", handleLoaderDone);
			clearTimeout(timer);
		};
	}, [waitForLoader]);

	const getInitial = () => {
		switch (direction) {
			case "up":
				return { opacity: 0, y: distance };
			case "down":
				return { opacity: 0, y: -distance };
			case "left":
				return { opacity: 0, x: distance };
			case "right":
				return { opacity: 0, x: -distance };
			case "none":
			default:
				return { opacity: 0 };
		}
	};

	const getTarget = () => {
		switch (direction) {
			case "up":
			case "down":
				return { opacity: 1, y: 0 };
			case "left":
			case "right":
				return { opacity: 1, x: 0 };
			case "none":
			default:
				return { opacity: 1 };
		}
	};

	if (waitForLoader) {
		return (
			<motion.div
				initial={getInitial()}
				animate={loaderReady ? getTarget() : getInitial()}
				transition={{ duration, delay, ease: LUXURY_EASE }}
				className={className}
				{...motionProps}
			>
				{children}
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={getInitial()}
			whileInView={getTarget()}
			viewport={{ once: true, margin: "-40px" }}
			transition={{ duration, delay, ease: LUXURY_EASE }}
			className={className}
			{...motionProps}
		>
			{children}
		</motion.div>
	);
}

/**
 * Expanding architectural divider line
 */
export function AnimatedLine({
	className = "",
	delay = 0,
}: {
	className?: string;
	delay?: number;
}) {
	return (
		<motion.div
			initial={{ scaleX: 0 }}
			whileInView={{ scaleX: 1 }}
			viewport={{ once: true, margin: "-20px" }}
			transition={{ duration: 0.9, delay, ease: LUXURY_EASE }}
			className={`origin-left h-px bg-[var(--line)] w-full ${className}`}
		/>
	);
}

/**
 * Masked line or phrase reveal that slides up from an overflow hidden container
 */
export function TextLineReveal({
	children,
	delay = 0,
	duration = 0.75,
	className = "",
}: {
	children: React.ReactNode;
	delay?: number;
	duration?: number;
	className?: string;
}) {
	return (
		<span className={`block overflow-hidden ${className}`}>
			<motion.span
				initial={{ y: "115%" }}
				whileInView={{ y: "0%" }}
				viewport={{ once: true }}
				transition={{ duration, delay, ease: LUXURY_EASE }}
				className="block"
			>
				{children}
			</motion.span>
		</span>
	);
}
