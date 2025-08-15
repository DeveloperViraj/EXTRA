// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import { getFirestore,doc, setDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpYghQr22TSB_iMSa0MvpV4jpBQelSZuE",
  authDomain: "financely-c2f9f.firebaseapp.com",
  projectId: "financely-c2f9f",
  storageBucket: "financely-c2f9f.firebasestorage.app",
  messagingSenderId: "510404487088",
  appId: "1:510404487088:web:98fc66a563c08145701875",
  measurementId: "G-KLRNZLGH14"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {db,auth,provider,doc,setDoc};