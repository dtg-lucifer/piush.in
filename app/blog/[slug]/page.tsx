import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import LenisScroll from "@/components/lenis-scroll";
import { getAllArticleSlugs, getArticleBySlug } from "@/lib/articles";

interface ArticlePageProps {
    params: Promise<{
        slug: string;
    }>;
}

export function generateStaticParams() {
    return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
    { params }: ArticlePageProps,
): Promise<Metadata> {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        return {
            title: "Article Not Found",
        };
    }

    return {
        title: article.seoTitle,
        description: article.seoDescription,
    };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    const publishedDate = new Date(article.datePublished).toLocaleDateString(
        "en-US",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    );

    return (
        <div className="relative bg-background min-h-screen text-foreground">
            <LenisScroll />

            <main className="mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-28 max-w-4xl">
                <article className="space-y-10 sm:space-y-12">
                    <header className="space-y-6">
                        <Link
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                            href="/blog"
                        >
                            <span aria-hidden="true">←</span>
                            Back to blog
                        </Link>

                        <div className="space-y-4">
                            <div className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
                                {publishedDate}
                            </div>

                            <h1 className="font-light text-3xl sm:text-5xl leading-tight tracking-tight">
                                {article.title}
                            </h1>

                            <p className="max-w-3xl text-muted-foreground text-lg leading-relaxed">
                                {article.seoDescription}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {article.tags.map((tag) => (
                                <span
                                    className="px-2 py-1 border border-border text-muted-foreground text-xs uppercase tracking-wide"
                                    key={tag}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {article.cover
                            ? (
                                <Image
                                    alt={article.title}
                                    className="border border-border w-full h-auto object-cover"
                                    height={675}
                                    src={article.cover}
                                    width={1200}
                                />
                            )
                            : null}
                    </header>

                    <div className="space-y-6 [&_code]:bg-muted/40 [&_pre]:bg-muted/40 [&_li]:my-2 [&_p]:my-5 [&_h1]:mt-12 [&_h2]:mt-10 [&_h3]:mt-8 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-3 [&_pre]:p-4 [&_code]:px-1.5 [&_code]:py-0.5 [&_blockquote]:pl-4 [&_ol]:pl-6 [&_ul]:pl-6 [&_pre]:border [&_blockquote]:border-border [&_pre]:border-border [&_blockquote]:border-l [&_pre]:overflow-x-auto [&_h1]:font-light [&_h2]:font-light [&_h3]:font-medium text-muted-foreground [&_a]:text-foreground [&_blockquote]:text-foreground/90 [&_code]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground hover:[&_a]:text-muted-foreground [&_code]:text-sm text-lg [&_h3]:text-xl [&_h2]:text-2xl [&_h1]:text-3xl [&_a]:underline [&_a]:underline-offset-4 leading-relaxed [&_ol]:list-decimal [&_ul]:list-disc article-markdown">
                        <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            remarkPlugins={[remarkGfm]}
                        >
                            {article.markdown}
                        </ReactMarkdown>
                    </div>
                </article>
            </main>

            <div className="right-0 bottom-0 left-0 fixed bg-linear-to-t from-background via-background/80 to-transparent h-24 pointer-events-none" />
        </div>
    );
}
