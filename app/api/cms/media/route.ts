import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/cms/auth";

export const dynamic = "force-dynamic";

interface MediaItem {
	url: string;
	name: string;
	folder: string;
	size: number;
}

const VALID_MEDIA_EXTENSIONS = new Set([
	".webp",
	".png",
	".jpg",
	".jpeg",
	".svg",
	".gif",
	".ico",
	".avif",
	".pdf",
]);

function scanDirectory(
	currentDir: string,
	baseDir: string,
	folderList: Set<string>,
	mediaList: MediaItem[],
) {
	if (!fs.existsSync(currentDir)) return;

	try {
		const entries = fs.readdirSync(currentDir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name);
			const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

			if (entry.isDirectory()) {
				// Ignore hidden folders like .git or .well-known
				if (!entry.name.startsWith(".")) {
					folderList.add(relativePath);
					scanDirectory(fullPath, baseDir, folderList, mediaList);
				}
			} else if (entry.isFile()) {
				const ext = path.extname(entry.name).toLowerCase();
				if (VALID_MEDIA_EXTENSIONS.has(ext)) {
					const stats = fs.statSync(fullPath);
					const folderName = path.dirname(relativePath).replace(/\\/g, "/");
					const cleanFolder = folderName === "." ? "root" : folderName;

					mediaList.push({
						url: `/${relativePath}`,
						name: entry.name,
						folder: cleanFolder,
						size: stats.size,
					});
				}
			}
		}
	} catch (err) {
		console.warn("Error scanning directory:", currentDir, err);
	}
}

export async function GET() {
	try {
		const publicDir = path.join(process.cwd(), "public");
		const folderSet = new Set<string>(["projects", "articles/assets", "assets/images", "favicon", "og"]);
		const mediaItems: MediaItem[] = [];

		scanDirectory(publicDir, publicDir, folderSet, mediaItems);

		const sortedFolders = Array.from(folderSet).sort();

		return NextResponse.json({
			media: mediaItems,
			folders: sortedFolders,
		});
	} catch (error) {
		console.error("Error listing media:", error);
		return NextResponse.json({ error: "Failed to scan media" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const session = await getCurrentSession();
	if (!session || !session.authenticated) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		let targetFolder = ((formData.get("folder") as string) || "projects").trim();

		if (!file) {
			return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
		}

		// Sanitize targetFolder to prevent directory traversal
		targetFolder = targetFolder.replace(/^\/+|\/+$/g, "").replace(/\.\./g, "");
		if (!targetFolder || targetFolder === "root") {
			targetFolder = "projects";
		}

		// Sanitize file name
		const rawName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "_");
		const publicDir = path.join(process.cwd(), "public");
		const targetDir = path.join(publicDir, targetFolder);

		// Ensure target directory is strictly within public folder
		if (!targetDir.startsWith(publicDir)) {
			return NextResponse.json({ error: "Invalid target folder path" }, { status: 400 });
		}

		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true });
		}

		const filePath = path.join(targetDir, rawName);
		const arrayBuffer = await file.arrayBuffer();
		fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

		const webUrl = `/${targetFolder}/${rawName}`;
		console.log(`[Media Upload] Uploaded ${rawName} into public/${targetFolder} (${file.size} bytes)`);

		return NextResponse.json({
			success: true,
			url: webUrl,
			name: rawName,
			folder: targetFolder,
		});
	} catch (error: unknown) {
		console.error("Error uploading media:", error);
		const err = error as { code?: string; message?: string };
		if (err.code === "EROFS") {
			return NextResponse.json(
				{
					error:
						"Vercel Serverless environment has a read-only filesystem. File uploads to /public should be made in local development (pnpm dev) or committed via Git.",
				},
				{ status: 403 },
			);
		}
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
