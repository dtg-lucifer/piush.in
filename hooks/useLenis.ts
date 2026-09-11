"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";

export function useLenis() {
	const lenisRef = useRef<Lenis | null>(null);

	useEffect(() => {
		if (typeof window === "undefined" || typeof navigator === "undefined") {
			return;
		}

		// Disable on touch devices to allow native 120Hz momentum scroll and avoid RAF overhead
		const isTouch = window.matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
		if (isTouch) {
			return;
		}

		const isFirefox = /firefox|fxios/i.test(navigator.userAgent);
		if (isFirefox) {
			return;
		}

		const lenis = new Lenis();
		lenisRef.current = lenis;

		let rafId = 0;

		const raf = (time: number) => {
			lenis.raf(time);
			rafId = window.requestAnimationFrame(raf);
		};

		rafId = window.requestAnimationFrame(raf);

		return () => {
			window.cancelAnimationFrame(rafId);
			lenis.destroy();
			lenisRef.current = null;
		};
	}, []);

	return lenisRef;
}
