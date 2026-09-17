export interface Project {
	id?: string;
	name: string;
	description: string;
	image: string;
	repoUrl: string;
	demoUrl: string;
	tags: string[];
	languages?: string[];
	wip: boolean;
	featured?: boolean;
	order?: number;
	updatedAt?: string;
}

export interface ArticleMeta {
	id?: string;
	title: string;
	seoTitle: string;
	seoDescription: string;
	datePublished: string;
	cuid: string;
	slug: string;
	cover: string;
	ogImage: string;
	tags: string[];
	content: string;
	featured?: boolean;
	order?: number;
	updatedAt?: string;
}

export interface SyncStatus {
	lastSync: string | null;
	firestoreConnected: boolean;
	projectsCount: number;
	articlesCount: number;
	guestbookCount?: number;
	error?: string | null;
}

export interface CmsSession {
	email: string;
	authenticated: boolean;
	expiresAt: number;
}

export interface GuestbookEntry {
	id: string;
	userId: string;
	userName: string;
	userHandle?: string;
	userAvatar?: string;
	userEmail?: string;
	message: string;
	status: "pending" | "approved" | "rejected";
	createdAt: number;
	approvedAt?: number;
}

