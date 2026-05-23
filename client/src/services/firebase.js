import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Public Firebase config.
// Since these values only identify the project, they are safe to check into frontend client code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAsnC-7xWjZ-ZpQ-qN-07F-1_wK-tQc_gY", // Fallback placeholder, user can override via client .env
  authDomain: "mock-2ff50.firebaseapp.com",
  projectId: "mock-2ff50",
  storageBucket: "mock-2ff50.appspot.com",
  messagingSenderId: "367375253818",
  appId: "1:367375253818:web:75db905c5674c106",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Apply standard Google Auth options (like select account prompt)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
