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
        <footer className="py-12 sm:py-16 border-border border-t">
            <div className="flex lg:flex-row flex-col justify-between items-start lg:items-center gap-6 sm:gap-8 mx-auto px-6 sm:px-8 lg:px-16 max-w-4xl">
                <div className="space-y-2">
                    <div className="text-muted-foreground text-sm">
                        © 2026 Piush Bose. All rights reserved.
                    </div>
                    <div className="text-muted-foreground text-xs">
                        Built by Piush, designed with elegance.
                    </div>
                </div>

                <button
                    aria-label="Toggle theme"
                    className="group p-3 border border-border hover:border-muted-foreground/50 rounded-lg transition-all duration-300"
                    onClick={toggleTheme}
                    type="button"
                >
                    <ThemeIcon
                        isDark={isDark}
                        key={isDark ? "dark" : "light"}
                    />
                </button>
            </div>
        </footer>
    );
}
