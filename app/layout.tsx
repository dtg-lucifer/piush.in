import type React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import SiteFooter from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const lilex = localFont({
	src: [
		{
			path: "../public/assets/fonts/variable/Lilex-VariableFont_wght.ttf",
			style: "normal",
		},
		{
			path:
				"../public/assets/fonts/variable/Lilex-Italic-VariableFont_wght.ttf",
			style: "italic",
		},
	],
	display: "swap",
	variable: "--font-lilex",
});

const geistMono = Geist_Mono({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-geist-mono",
});

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://piush.in");
const canonicalUrl = new URL("/", siteUrl);
const ogLandscapeUrl = new URL("/og/og_landscape.png", siteUrl);
const ogTwitterUrl = new URL("/og/og_twitter.png", siteUrl);

export const metadata: Metadata = {
	metadataBase: siteUrl,
	title: "Piush Bose | Software Engineer",
	description:
		"Piush Bose is a Software Engineer and SDE II building scalable systems, polished products, and performant web experiences.",
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
		title: "Piush Bose | Software Engineer",
		description:
			"Piush Bose is a Software Engineer and SDE II building scalable systems, polished products, and performant web experiences.",
		url: canonicalUrl,
		siteName: "Piush Bose",
		images: [
			{
				url: ogLandscapeUrl,
				width: 1200,
				height: 630,
				alt: "Piush Bose - Software Engineer and SDE II",
				type: "image/png",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Piush Bose | Software Engineer",
		description:
			"Piush Bose is a Software Engineer and SDE II building scalable systems, polished products, and performant web experiences.",
		images: [ogTwitterUrl],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${lilex.variable} ${geistMono.variable} dark`}
		>
			<body className="font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>
					{children}
					<SiteFooter />
				</ThemeProvider>
			</body>
		</html>
	);
}
