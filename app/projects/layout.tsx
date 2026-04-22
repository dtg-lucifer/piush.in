import type { Project } from "@/hooks/useProjects";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";

export async function generateMetadata(): Promise<Metadata> {
	const filePath = path.join(process.cwd(), "public/projects/__data.json");
	let tags: string[] = [];

	try {
		const raw = fs.readFileSync(filePath, "utf8");
		const data = JSON.parse(raw);
		tags = Array.from(new Set(data.flatMap((p: Project) => p.tags || [])));
	} catch (_e) {
		tags = [];
	}

	return {
		title: "Projects | Piush Bose",
		description:
			"A collection of my work, side projects, and open source contributions. Focusing on scalable systems, backend architecture, and full-stack development.",
		keywords: ["projects", "portfolio", "open source", "software engineer", ...tags],
	};
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
