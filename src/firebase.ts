// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "next-estate-ab0d0.firebaseapp.com",
  projectId: "next-estate-ab0d0",
  storageBucket: "next-estate-ab0d0.firebasestorage.app",
  messagingSenderId: "53458835312",
  appId: "1:53458835312:web:23d5727e1490b6ddd6e1b5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);