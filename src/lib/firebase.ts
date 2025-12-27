import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGFk8Cr9PYUgjuoKDGu_waSZJAn7y1Mhw",
  authDomain: "zihadhasan.firebaseapp.com",
  projectId: "zihadhasan",
  storageBucket: "zihadhasan.firebasestorage.app",
  messagingSenderId: "209783034748",
  appId: "1:209783034748:web:26028c4398d3e4cb144af9"
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

  // App Check (ReCaptcha Enterprise)
  const { initializeAppCheck, ReCaptchaEnterpriseProvider } = require("firebase/app-check");

  if (typeof window !== "undefined") {
    // Use a valid site key from environment or console. 
    // Using a placeholder here that the user must replace or provide via ENV.
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY || "YOUR_RECAPTCHA_ENTERPRISE_KEY";

    if (siteKey !== "YOUR_RECAPTCHA_ENTERPRISE_KEY") {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log("Firebase App Check Initialized");
    }
  }
}
