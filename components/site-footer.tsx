"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SiteFooter() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = resolvedTheme === "dark";

	const toggleTheme = () => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<footer>
			<div className="footer-copyright">
				<span>Piush Bose © 2026</span>
			</div>

			<div className="footer-links">
				<a href="https://www.linkedin.com/in/bosepiush/" target="_blank" rel="noreferrer">
					LinkedIn
				</a>
				<a href="https://github.com/dtg-lucifer" target="_blank" rel="noreferrer">
					GitHub
				</a>
				<a href="https://devpiush.hashnode.dev/" target="_blank" rel="noreferrer">
					Hashnode
				</a>
				<a href="/resume.pdf" target="_blank" rel="noreferrer">
					Resume
				</a>
			</div>

			<div className="footer-theme">
				<button
					type="button"
					onClick={toggleTheme}
					aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
					className="theme-switch-btn"
				>
					<span>{mounted ? (isDark ? "☀ Light mode" : "☾ Dark mode") : "Theme"}</span>
				</button>
			</div>
		</footer>
	);
}
