"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";

export function useLenis() {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        if (typeof navigator === "undefined") {
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
