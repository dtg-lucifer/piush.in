import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CMS_COOKIE_NAME, createSessionToken, getCurrentSession, verifyCredentials } from "@/lib/cms/auth";

export async function GET() {
	const session = await getCurrentSession();
	if (!session || !session.authenticated) {
		return NextResponse.json({ authenticated: false, email: null }, { status: 401 });
	}

	return NextResponse.json({
		authenticated: true,
		email: session.email,
	});
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { email, password } = body;

		if (!email || !password) {
			return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
		}

		const isValid = verifyCredentials(email, password);
		if (!isValid) {
			return NextResponse.json({ error: "Invalid owner credentials" }, { status: 401 });
		}

		const token = createSessionToken(email);
		const cookieStore = await cookies();

		cookieStore.set(CMS_COOKIE_NAME, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 7 * 24 * 60 * 60, // 7 days
		});

		return NextResponse.json({
			success: true,
			email: email.trim().toLowerCase(),
		});
	} catch (error) {
		console.error("Login API error:", error);
		return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
	}
}

export async function DELETE() {
	const cookieStore = await cookies();
	cookieStore.delete(CMS_COOKIE_NAME);
	return NextResponse.json({ success: true });
}
