"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SiteNavProps {
	className?: string;
}

export default function SiteNav({ className = "" }: SiteNavProps) {
	const [mobileOpen, setMobileOpen] = useState(false);

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		if (mobileOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	return (
		<>
			<nav className={`site-nav relative w-full ${className}`} aria-label="Main navigation">
				<Link className="wordmark shrink-0" href="/">
					PB<span>.</span>
				</Link>

				{/* Desktop Links: strictly hidden on mobile via CSS media query, flex on desktop */}
				<div className="nav-links">
					{/* <Link href="/#work">Work</Link>
					<Link href="/#experience">Experience</Link>
					<Link href="/#skills">Skills</Link>
					<Link href="/#about">About</Link> */}
					<Link href="/blog">Blog</Link>
					<Link href="/projects">Projects</Link>
					<Link href="/guestbook">Guestbook</Link>
					<a className="nav-contact" href="mailto:mail@piush.in">
						Get in touch <span aria-hidden="true">↗</span>
					</a>
				</div>

				{/* Mobile Hamburger Button: strictly flex on mobile via CSS media query, hidden on desktop */}
				<div className="nav-mobile-toggle">
					<button
						type="button"
						aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
						aria-expanded={mobileOpen}
						className="border border-line text-ink font-mono bg-transparent cursor-pointer flex items-center justify-center w-11 h-11 transition-colors hover:border-ink"
						onClick={() => setMobileOpen(true)}
					>
						<span className="text-2xl font-mono leading-none">≡</span>
					</button>
				</div>
			</nav>

			{/* Full-screen Dark Mobile Side Panel (100% W x 100% H, non-scrollable, always dark-accented) */}
			{mobileOpen && (
				<div
					className="fixed inset-0 w-full h-full z-[999] bg-[#17221d] text-[#f2f0e9] flex flex-col justify-between p-6 sm:p-8 overflow-hidden mobile-menu-drawer"
					role="dialog"
					aria-modal="true"
					aria-label="Mobile Navigation"
				>
					{/* Top bar */}
					<div className="flex items-center justify-between w-full mobile-menu-header">
						<Link
							className="wordmark text-2xl text-[#f2f0e9]"
							href="/"
							onClick={() => setMobileOpen(false)}
						>
							PB<span className="text-[#f15b40]">.</span>
						</Link>
						<button
							type="button"
							aria-label="Close navigation menu"
							className="p-2 text-[#f2f0e9] hover:text-[#d7f36b] cursor-pointer bg-transparent border-0 transition-colors flex items-center justify-center"
							onClick={() => setMobileOpen(false)}
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
						</button>
					</div>

					{/* Centered navigation links with staggered animation & large pressing area */}
					<div className="flex flex-col items-center justify-center w-full my-auto gap-3">
						<Link
							href="/#work"
							onClick={() => setMobileOpen(false)}
							className="mobile-menu-link w-full text-center py-3 text-3xl sm:text-4xl font-medium tracking-tight text-[#f2f0e9] hover:text-[#d7f36b] hover:bg-white/5 transition-all duration-200"
						>
							Work
						</Link>
						<Link
							href="/#experience"
							onClick={() => setMobileOpen(false)}
							className="mobile-menu-link w-full text-center py-3 text-3xl sm:text-4xl font-medium tracking-tight text-[#f2f0e9] hover:text-[#d7f36b] hover:bg-white/5 transition-all duration-200"
						>
							Experience
						</Link>
						<Link
							href="/#skills"
							onClick={() => setMobileOpen(false)}
							className="mobile-menu-link w-full text-center py-3 text-3xl sm:text-4xl font-medium tracking-tight text-[#f2f0e9] hover:text-[#d7f36b] hover:bg-white/5 transition-all duration-200"
						>
							Skills
						</Link>
						<Link
							href="/#about"
							onClick={() => setMobileOpen(false)}
							className="mobile-menu-link w-full text-center py-3 text-3xl sm:text-4xl font-medium tracking-tight text-[#f2f0e9] hover:text-[#d7f36b] hover:bg-white/5 transition-all duration-200"
						>
							About
						</Link>
						<Link
							href="/blog"
							onClick={() => setMobileOpen(false)}
							className="mobile-menu-link w-full text-center py-3 text-3xl sm:text-4xl font-medium tracking-tight text-[#f2f0e9] hover:text-[#d7f36b] hover:bg-white/5 transition-all duration-200"
						>
							Blog
						</Link>
						<Link
							href="/projects"
							onClick={() => setMobileOpen(false)}
							className="mobile-menu-link w-full text-center py-3 text-3xl sm:text-4xl font-medium tracking-tight text-[#f2f0e9] hover:text-[#d7f36b] hover:bg-white/5 transition-all duration-200"
						>
							Projects
						</Link>
						<Link
							href="/guestbook"
							onClick={() => setMobileOpen(false)}
							className="mobile-menu-link w-full text-center py-3 text-3xl sm:text-4xl font-medium tracking-tight text-[#f2f0e9] hover:text-[#d7f36b] hover:bg-white/5 transition-all duration-200"
						>
							Guestbook
						</Link>

						<div className="pt-6 w-full flex justify-center mobile-menu-cta">
							<a
								href="mailto:mail@piush.in"
								onClick={() => setMobileOpen(false)}
								className="button button-light text-xs font-mono tracking-wider py-4 px-8 mt-0 inline-flex items-center justify-center gap-3"
							>
								Get in touch <span aria-hidden="true">↗</span>
							</a>
						</div>
					</div>

					{/* Bottom status line */}
					<div className="mobile-menu-footer flex items-center justify-between pt-4 border-t border-white/10 font-mono text-[11px] uppercase tracking-wider text-[#a6b0a5]">
						<span>Kolkata, India</span>
						<span>Available for work</span>
					</div>
				</div>
			)}
		</>
	);
}
