// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpYghQr22TSB_iMSa0MvpV4jpBQelSZuE",
  authDomain: "financely-c2f9f.firebaseapp.com",
  projectId: "financely-c2f9f",
  storageBucket: "financely-c2f9f.firebasestorage.app",
  messagingSenderId: "510404487088",
  appId: "1:510404487088:web:98fc66a563c08145701875",
  measurementId: "G-KLRNZLGH14",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔑 Ensure login persists across refresh/revisit
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Persistence setup failed:", error);
});

export { db, auth, provider, doc, setDoc };
