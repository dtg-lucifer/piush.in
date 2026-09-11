import type { Metadata } from "next";
import LenisScroll from "@/components/lenis-scroll";
import SiteNav from "@/components/site-nav";
import { getAllArticleMeta } from "@/lib/articles";
import BlogListing from "@/components/blog/blog-listing";

export async function generateMetadata(): Promise<Metadata> {
	const articles = getAllArticleMeta();
	const tags = Array.from(new Set(articles.flatMap((a) => a.tags)));

	return {
		title: "Blog | Piush Bose",
		description:
			"Long-form notes on systems, backend architecture, cloud infrastructure, and engineering trade-offs from real project work.",
		keywords: ["blog", "engineering", "backend", "systems", ...tags],
	};
}

export default function BlogPage() {
	const articles = getAllArticleMeta();

	return (
		<div className="relative bg-background min-h-screen text-foreground">
			<LenisScroll />
			<SiteNav />

			<main className="mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 max-w-3xl">
				<BlogListing articles={articles} />
			</main>
		</div>
	);
}
