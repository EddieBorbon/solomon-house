// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxbFqLXt5ir-Vnbl0H_tX-RwiV1v5hTpE",
  authDomain: "solomonhouse-5f528.firebaseapp.com",
  projectId: "solomonhouse-5f528",
  storageBucket: "solomonhouse-5f528.firebasestorage.app",
  messagingSenderId: "479726159678",
  appId: "1:479726159678:web:8ca0239ef048be1b644e6f",
  measurementId: "G-JKEHV8PDEP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
