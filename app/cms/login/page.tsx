"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CmsLoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const res = await fetch("/api/cms/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Authentication failed");
				setLoading(false);
				return;
			}

			router.push("/cms");
			router.refresh();
		} catch (_err) {
			setError("Network error during login");
			setLoading(false);
		}
	};

	return (
		<div
			className="cms-root min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-center items-center px-4 sm:px-6 py-12 overflow-x-hidden"
			style={{ ["--accent" as string]: "#ba614c" }}
		>
			<div className="w-full max-w-md border border-[var(--line)] bg-[var(--card)] p-6 sm:p-10 shadow-sm relative overflow-hidden">
				<div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--line)]">
					<div>
						<div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest">
							Portfolio Studio
						</div>
						<h1 className="font-space text-xl sm:text-2xl font-medium tracking-tight text-[var(--ink)] break-words">
							Curator Authentication
						</h1>
					</div>
					<span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse shrink-0" />
				</div>

				<p className="font-mono text-xs text-[var(--muted)] mb-6 leading-relaxed">
					Access restricted to site curator. Enter credentials to manage projects, articles, and sync
					pipeline.
				</p>

				{error && (
					<div className="mb-6 p-3 border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)] font-mono text-xs flex items-center gap-2">
						<svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
						<span>{error}</span>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label
							htmlFor="owner-email"
							className="block font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5"
						>
							Curator Email
						</label>
						<input
							id="owner-email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="mail@piush.in"
							className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3.5 py-2.5 font-mono text-xs text-[var(--ink)] outline-none transition-colors"
						/>
					</div>

					<div>
						<label
							htmlFor="owner-pass"
							className="block font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5"
						>
							Passcode
						</label>
						<input
							id="owner-pass"
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							className="w-full bg-[var(--paper)] border border-[var(--line)] focus:border-[var(--ink)] px-3.5 py-2.5 font-mono text-xs text-[var(--ink)] outline-none transition-colors"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 font-mono text-xs uppercase tracking-widest transition-opacity cursor-pointer flex items-center justify-center gap-2"
					>
						{loading ? (
							<>
								<span className="w-3 h-3 border-2 border-[var(--paper)] border-t-transparent rounded-full animate-spin" />
								<span>Verifying...</span>
							</>
						) : (
							<span>Authenticate →</span>
						)}
					</button>
				</form>

				<div className="mt-8 pt-6 border-t border-[var(--line)] flex justify-between items-center font-mono text-xs text-[var(--muted)]">
					<Link href="/" className="hover:text-[var(--ink)] transition-colors flex items-center gap-1">
						<span>← Back to Portfolio</span>
					</Link>
					<span className="text-[10px]">piush.in</span>
				</div>
			</div>
		</div>
	);
}
