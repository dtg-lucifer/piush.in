import type { Metadata } from "next";
import fs from "fs";
import path from "path";

export async function generateMetadata(): Promise<Metadata> {
    const filePath = path.join(process.cwd(), "public/projects/__data.json");
    let tags: string[] = [];
    
    try {
        const raw = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(raw);
        tags = Array.from(new Set(data.flatMap((p: any) => p.tags || [])));
    } catch (e) {
        // Fallback gracefully
    }

    return {
        title: "Projects | Piush Bose",
        description: "A collection of my work, side projects, and open source contributions. Focusing on scalable systems, backend architecture, and full-stack development.",
        keywords: ["projects", "portfolio", "open source", "software engineer", ...tags],
    };
}

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
