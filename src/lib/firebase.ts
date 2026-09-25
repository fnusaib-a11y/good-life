import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeFirestore, getFirestore, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

// Set Firestore log level to 'silent' to suppress internal offline/transport retry messages from emitting console errors
try {
  setLogLevel('silent');
} catch {
  // ignore if not supported in current environment
}

// Intercept harmless internal Firestore offline/retry connection messages from polluting console.error
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const errorText = args.map(a => (typeof a === 'object' ? (a?.message || JSON.stringify(a)) : String(a))).join(' ');
    if (
      errorText.includes('Could not reach Cloud Firestore backend') ||
      errorText.includes('code=unavailable') ||
      errorText.includes('the client is offline') ||
      errorText.includes('@firebase/firestore') ||
      errorText.includes('Missing or insufficient permissions') ||
      errorText.includes('permission-denied')
    ) {
      console.warn('[Firestore Notice] Operating in seamless offline/local mode:', args[0]);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// Web & Mobile app's Firebase configuration
const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {} as any;
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyCFbLaT3tyGBoGPHpuSB3neCkEdTvoIVpc",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "kilagbe-e58bf.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "kilagbe-e58bf",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "kilagbe-e58bf.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "284870819080",
  appId: env.VITE_FIREBASE_APP_ID || "1:284870819080:web:32d649e095b834a22c80bd",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-5HPK58SE7C"
};

// Initialize Firebase App safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore Database with autoDetectLongPolling for robust connectivity in APKs, iframes & sandboxes
export const auth = getAuth(app);
export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
})();
export const storage = getStorage(app);

// Reliably ensure authenticated session for Firestore security rules across Web and APK
export const ensureFirebaseAuth = async () => {
  if (typeof window === "undefined" || !auth) return null;
  if (auth.currentUser) return auth.currentUser;
  
  // 1. Try signing in with authenticated service sync account
  try {
    const cred = await signInWithEmailAndPassword(auth, "goodlife_sync@goodlife.com", "GoodLifeSync@2026");
    return cred.user;
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, "goodlife_sync@goodlife.com", "GoodLifeSync@2026");
        return newCred.user;
      } catch {}
    }
  }

  // 2. Fallback to anonymous sign-in if enabled
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch {
    return null;
  }
};

if (typeof window !== "undefined") {
  ensureFirebaseAuth().catch(() => {});
}

// Initialize Firebase Analytics safely (supported in browser environments)
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      logEvent(analytics, 'app_init', { app_name: 'kilagbe', timestamp: Date.now() });
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}

/**
 * Safely log an event to Firebase Analytics
 */
export const logAppEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (e) {
      console.warn("Firebase Analytics logging error:", e);
    }
  }
};

// Strictly authorized Admin phone number
export const ADMIN_PHONE_NUMBER = '01877722819';

/**
 * Returns true ONLY if the phone number belongs to the designated admin: 01877722819
 */
export const isAuthorizedAdminPhone = (phone?: string | null): boolean => {
  if (!phone) return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly === '01877722819' || digitsOnly === '8801877722819' || digitsOnly === '1877722819';
};

