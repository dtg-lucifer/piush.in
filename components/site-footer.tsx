"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IconSun, IconMoon } from "@/components/cms-icons";

export default function SiteFooter() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setMounted(true);
	}, []);

	// Never render public website footer inside the CMS management portal
	if (pathname?.startsWith("/cms")) {
		return null;
	}

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
				<a href="/cms">
					CMS
				</a>
			</div>

			<div className="footer-theme">
				<button
					type="button"
					onClick={toggleTheme}
					aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
					className="theme-switch-btn"
				>
					{mounted ? (
						<span className="flex items-center gap-1.5">
							{isDark ? (
								<>
									<IconSun className="w-3.5 h-3.5 inline" />
									<span>Light mode</span>
								</>
							) : (
								<>
									<IconMoon className="w-3.5 h-3.5 inline" />
									<span>Dark mode</span>
								</>
							)}
						</span>
					) : (
						<span>Theme</span>
					)}
				</button>
			</div>
		</footer>
	);
}
