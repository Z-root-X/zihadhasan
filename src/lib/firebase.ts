import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Free Power-Ups
import { getAnalytics, isSupported } from "firebase/analytics";
import { getRemoteConfig } from "firebase/remote-config";
import { getPerformance } from "firebase/performance";

export let analytics: any = null;
export let remoteConfig: any = null;
export let perf: any = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      perf = getPerformance(app);
      remoteConfig = getRemoteConfig(app);

      // Default Config
      remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
      remoteConfig.defaultConfig = {
        "promo_text": "Welcome to Zihad's World",
      };
    }
  });

  // App Check Initialization

  if (typeof window !== "undefined") {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

    if (siteKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log("Firebase App Check Initialized (Standard v3)");
    } else {
      console.warn("ReCaptcha Key not found in environment variables.");
    }
  }
}
