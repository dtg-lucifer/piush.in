import type React from "react";
import type { Metadata, Viewport } from "next";
import { DM_Mono, Space_Grotesk } from "next/font/google";
import SiteFooter from "@/components/site-footer";
import PageLoader from "@/components/page-loader";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500", "600", "700"],
	variable: "--font-space-grotesk",
});

const dmMono = DM_Mono({
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500"],
	style: ["normal", "italic"],
	variable: "--font-dm-mono",
});

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f2f0e9" },
		{ media: "(prefers-color-scheme: dark)", color: "#17221d" },
	],
	width: "device-width",
	initialScale: 1,
};

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://piush.in");
const canonicalUrl = new URL("/", siteUrl);
const ogLandscapeUrl = new URL("/og/og_landscape_opt.jpg", siteUrl);
const ogTwitterUrl = new URL("/og/og_twitter.png", siteUrl);

export const metadata: Metadata = {
	metadataBase: siteUrl,
	title: "Piush Bose | Software Engineer & Machine Learning Engineer",
	description:
		"Piush Bose is a Software Engineer & Machine Learning Engineer building scalable backend systems, machine learning pipelines, and distributed architecture.",
	manifest: "/favicon/dark/site.webmanifest",
	icons: {
		icon: [
			{ url: "/favicon/dark/favicon.ico" },
			{
				url: "/favicon/dark/favicon-32x32.png",
				type: "image/png",
				sizes: "32x32",
			},
			{
				url: "/favicon/dark/favicon-16x16.png",
				type: "image/png",
				sizes: "16x16",
			},
		],
		apple: "/favicon/dark/apple-touch-icon.png",
	},
	openGraph: {
		title: "Piush Bose | Software & Machine Learning Engineer",
		description:
			"Piush Bose is a Software Engineer & Machine Learning Engineer building scalable backend systems, machine learning pipelines, and distributed architecture.",
		url: canonicalUrl,
		siteName: "Piush Bose",
		images: [
			{
				url: ogLandscapeUrl,
				width: 1200,
				height: 630,
				alt: "Piush Bose - Software & Machine Learning Engineer",
				type: "image/jpeg",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Piush Bose | Software & Machine Learning Engineer",
		description:
			"Piush Bose is a Software Engineer & Machine Learning Engineer building scalable backend systems, machine learning pipelines, and distributed architecture.",
		images: [ogTwitterUrl],
	},
	keywords: [
		"Software Engineer",
		"Machine Learning Engineer",
		"ML Engineer",
		"AI Infrastructure",
		"SDE II",
		"Scalable systems",
		"Backend development",
		"Distributed Systems Engineer",
		"Piush Bose",
		"Piush",
		"Dev Piush",
		"dtg-lucifer",
		"bosepiush",
		"Bose Piush",
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${dmMono.variable} h-full`}>
			<body className="font-sans antialiased min-h-full flex flex-col">
				<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
					<PageLoader />
					{children}
					<SiteFooter />
				</ThemeProvider>
			</body>
		</html>
	);
}
