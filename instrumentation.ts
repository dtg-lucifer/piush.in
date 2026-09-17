export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		try {
			const { syncLocalToFirestore } = await import("@/lib/cms/sync");
			await syncLocalToFirestore();
			console.log("Hybrid CMS: Local projects, articles & guestbook synchronized with Firestore on startup");
		} catch (error) {
			console.warn("Hybrid CMS: Startup sync note:", error);
		}
	}
}
