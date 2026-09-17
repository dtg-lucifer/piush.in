import fs from "node:fs";
import path from "node:path";
import { PassThrough, Readable } from "node:stream";
import { NextResponse } from "next/server";
import { ZipArchive, type ArchiverError } from "archiver";
import { getCurrentSession } from "@/lib/cms/auth";

export const dynamic = "force-dynamic";

export async function GET() {
	const session = await getCurrentSession();
	if (!session || !session.authenticated) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const publicDir = path.join(process.cwd(), "public");
		if (!fs.existsSync(publicDir)) {
			return NextResponse.json({ error: "Public folder not found" }, { status: 404 });
		}

		// Use pure Node.js ZipArchive (runs reliably on Vercel Serverless / AWS Lambda)
		const archive = new ZipArchive({
			zlib: { level: 9 },
		});

		const passThrough = new PassThrough();
		archive.pipe(passThrough);

		archive.on("warning", (err: ArchiverError) => {
			if (err.code === "ENOENT") {
				console.warn("Archiver warning:", err);
			} else {
				console.error("Archiver error:", err);
			}
		});

		archive.on("error", (err: ArchiverError) => {
			console.error("Archiver fatal error:", err);
			passThrough.destroy(err);
		});

		// Append the entire public directory into the zip root
		archive.directory(publicDir, false);

		// Finalize archive (begins streaming to passThrough)
		void archive.finalize();

		const webStream = Readable.toWeb(passThrough) as ReadableStream;

		return new Response(webStream, {
			headers: {
				"Content-Type": "application/zip",
				"Content-Disposition": 'attachment; filename="piush-in-public.zip"',
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		console.error("Error creating public folder zip archive:", error);
		return NextResponse.json({ error: "Failed to create archive" }, { status: 500 });
	}
}
