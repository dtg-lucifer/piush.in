"use client";

import { useTheme } from "next-themes";
import ThemeIcon from "@/components/svg/theme-icon";

export default function SiteFooter() {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme !== "light";

	const toggleTheme = () => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<footer className="border-border border-t py-12 sm:py-16">
			<div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-6 px-6 sm:gap-8 sm:px-8 lg:flex-row lg:items-center lg:px-16">
				<div className="space-y-2">
					<div className="text-muted-foreground text-sm">© 2026 Piush Bose. All rights reserved.</div>
					<div className="text-muted-foreground text-xs">Built by Piush, designed with elegance.</div>
				</div>

				<button
					aria-label="Toggle theme"
					className="group rounded-lg border border-border p-3 transition-all duration-300 hover:border-muted-foreground/50"
					onClick={toggleTheme}
					type="button"
				>
					<ThemeIcon isDark={isDark} key={isDark ? "dark" : "light"} />
				</button>
			</div>
		</footer>
	);
}
