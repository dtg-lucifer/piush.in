import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";
import type { Components } from "react-markdown";
import type { Element, ElementContent } from "hast";
import CopyButton from "./copy-button";

// Lazy-load mermaid ONLY when needed — never bundled unless rendered
const MermaidDiagram = dynamic(() => import("./mermaid-diagram"), {
    ssr: false,
    loading: () => (
        <div className="mermaid-loading">Rendering diagram…</div>
    ),
});

interface MarkdownRendererProps {
    content: string;
}

// Extract language from a <code> hast node
function getCodeLanguage(node: Element): string {
    const classes = (node.properties?.className as string[]) ?? [];
    const langClass = classes.find((c) => c.startsWith("language-"));
    return langClass ? langClass.replace("language-", "") : "";
}

// Extract text content from a hast node recursively
function extractText(node: Element | { type: string; value?: string }): string {
    if (node.type === "text") return (node as { type: string; value?: string }).value ?? "";
    if ("children" in node) {
        return (node as Element).children
            .map((child: ElementContent) => extractText(child as Element))
            .join("");
    }
    return "";
}

// Custom code block renderer (server component, no state)
function CodeBlock({ node }: { node?: Element }) {
    if (!node) return null;

    // Find the inner <code> element
    const codeEl = node.children.find(
        (c: ElementContent): c is Element => c.type === "element" && (c as Element).tagName === "code",
    ) as Element | undefined;

    if (!codeEl) return null;

    const language = getCodeLanguage(codeEl);
    const rawText = extractText(codeEl);

    // Mermaid: render as diagram
    if (language === "mermaid") {
        return <MermaidDiagram chart={rawText} />;
    }

    return (
        <div className="code-block-wrapper" data-language={language || "text"}>
            <div className="code-block-header">
                {language
                    ? <span className="code-lang-badge">{language}</span>
                    : <span className="code-lang-badge">text</span>}
                <CopyButton text={rawText} />
            </div>
            <div
                className="code-block-body"
                // biome-ignore lint: server-rendered hljs HTML is safe
                dangerouslySetInnerHTML={{
                    __html: (() => {
                        // Serialize the hast node back to HTML string
                        // We grab the highlighted HTML from the hast tree directly
                        const serialize = (el: ElementContent): string => {
                            if (el.type === "text") {
                                return (el.value ?? "")
                                    .replace(/&/g, "&amp;")
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;");
                            }
                            if (el.type !== "element") return "";
                            const attrs = Object.entries(el.properties ?? {})
                                .map(([k, v]) => {
                                    if (Array.isArray(v)) return `${k}="${v.join(" ")}"`;
                                    if (v === true) return k;
                                    if (v === false || v == null) return "";
                                    return `${k}="${String(v)}"`;
                                })
                                .filter(Boolean)
                                .join(" ");
                            const children = el.children
                                .map((c: ElementContent) => serialize(c))
                                .join("");
                            return attrs
                                ? `<${el.tagName} ${attrs}>${children}</${el.tagName}>`
                                : `<${el.tagName}>${children}</${el.tagName}>`;
                        };
                        return serialize(codeEl);
                    })(),
                }}
            />
        </div>
    );
}

const components: Components = {
    pre({ node }) {
        return <CodeBlock node={node as Element} />;
    },
    // Tight list spacing
    ul({ children }) {
        return <ul className="article-ul">{children}</ul>;
    },
    ol({ children }) {
        return <ol className="article-ol">{children}</ol>;
    },
    li({ children }) {
        return <li className="article-li">{children}</li>;
    },
    // Better blockquote
    blockquote({ children }) {
        return <blockquote className="article-blockquote">{children}</blockquote>;
    },
    // Inline code — not highlighted, just styled
    code({ className, children }) {
        if (!className) {
            return <code className="inline-code">{children}</code>;
        }
        // This case shouldn't hit — block code is handled by pre renderer
        return <code className={className}>{children}</code>;
    },
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="article-markdown">
            <ReactMarkdown
                components={components}
                rehypePlugins={[
                    [rehypeHighlight, { detect: true, ignoreMissing: true }],
                    rehypeRaw,
                ]}
                remarkPlugins={[remarkGfm]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
