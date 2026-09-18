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
		const isTouch =
			window.matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
		if (isTouch) {
			return;
		}

		const isFirefox = /firefox|fxios/i.test(navigator.userAgent);
		if (isFirefox) {
			return;
		}

		const lenis = new Lenis({
			autoResize: true,
		});
		lenisRef.current = lenis;

		// Expose on window for components to trigger recalculation if needed
		(window as unknown as { __lenis?: Lenis }).__lenis = lenis;

		let rafId = 0;

		const raf = (time: number) => {
			lenis.raf(time);
			rafId = window.requestAnimationFrame(raf);
		};

		rafId = window.requestAnimationFrame(raf);

		// Observer to recalculate scroll dimensions when dynamic client content loads
		const handleResize = () => {
			lenis.resize();
		};

		const resizeObserver = new ResizeObserver(() => {
			handleResize();
		});

		if (document.body) {
			resizeObserver.observe(document.body);
		}

		// Also observe mutations in child nodes (e.g. async card insertion)
		const mutationObserver = new MutationObserver(() => {
			handleResize();
		});

		if (document.body) {
			mutationObserver.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		window.addEventListener("lenis-resize", handleResize);

		return () => {
			window.removeEventListener("lenis-resize", handleResize);
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			window.cancelAnimationFrame(rafId);
			lenis.destroy();
			lenisRef.current = null;
			delete (window as unknown as { __lenis?: Lenis }).__lenis;
		};
	}, []);

	return lenisRef;
}
