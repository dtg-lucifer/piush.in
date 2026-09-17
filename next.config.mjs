/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	outputFileTracingIncludes: {
		"/api/cms/**/*": ["./public/**/*"],
	},
	env: {
		NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
		NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: (
			process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
			process.env.FIREBASE_AUTH_DOMAIN ||
			""
		).replace(/=+$/, ""),
		NEXT_PUBLIC_FIREBASE_PROJECT_ID:
			process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "",
		NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
			process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
		NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID:
			process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID || process.env.FIREBASE_MSG_SENDER_ID || "",
		NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "",
	},
};

export default nextConfig;
