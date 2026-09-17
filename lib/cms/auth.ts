import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { CmsSession } from "./types";

export const CMS_COOKIE_NAME = "piush_cms_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecretKey(): string {
	return process.env.OWNER_PASS || process.env.SESSION_SECRET || "piush-portfolio-cms-secret-salt-2026";
}

export function verifyCredentials(email: string, pass: string): boolean {
	const ownerEmail = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
	const ownerPass = (process.env.OWNER_PASS || "").trim();

	const inputEmail = (email || "").trim().toLowerCase();
	const inputPass = (pass || "").trim();

	if (!ownerEmail || !ownerPass) {
		console.warn("OWNER_EMAIL or OWNER_PASS environment variable is not defined.");
		return false;
	}

	return inputEmail === ownerEmail && inputPass === ownerPass;
}

export function signPayload(data: object): string {
	const json = JSON.stringify(data);
	const base64 = Buffer.from(json, "utf8").toString("base64url");
	const hmac = crypto.createHmac("sha256", getSecretKey()).update(base64).digest("base64url");
	return `${base64}.${hmac}`;
}

export function verifyToken(token: string): CmsSession | null {
	if (!token || !token.includes(".")) return null;
	const [base64, signature] = token.split(".");
	if (!base64 || !signature) return null;

	const expectedHmac = crypto.createHmac("sha256", getSecretKey()).update(base64).digest("base64url");
	if (signature !== expectedHmac) return null;

	try {
		const json = Buffer.from(base64, "base64url").toString("utf8");
		const session = JSON.parse(json) as CmsSession;
		if (session.expiresAt && session.expiresAt < Date.now()) {
			return null;
		}
		return session;
	} catch {
		return null;
	}
}

export async function getCurrentSession(): Promise<CmsSession | null> {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get(CMS_COOKIE_NAME)?.value;
		if (!token) return null;
		return verifyToken(token);
	} catch {
		return null;
	}
}

export function createSessionToken(email: string): string {
	const session: CmsSession = {
		email: email.trim().toLowerCase(),
		authenticated: true,
		expiresAt: Date.now() + SESSION_DURATION_MS,
	};
	return signPayload(session);
}
