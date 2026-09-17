import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Firestore, getFirestore } from "firebase/firestore";
import { type Auth, getAuth } from "firebase/auth";
import { type FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID || process.env.FIREBASE_MSG_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

export const isFirebaseConfigured = (): boolean => {
	return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5 && firebaseConfig.projectId);
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

try {
	if (isFirebaseConfigured()) {
		app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
		db = getFirestore(app);
		auth = getAuth(app);
		storage = getStorage(app);
	}
} catch (error) {
	console.warn("Firebase initialization warning:", error);
}

export { app, db, auth, storage, firebaseConfig };
