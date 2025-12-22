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
