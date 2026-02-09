// Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCoaUtH5qCaVttSOXoAe5A6SeMusPiQtPQ",
  authDomain: "workout-tracker-84ebf.firebaseapp.com",
  projectId: "workout-tracker-84ebf",
  storageBucket: "workout-tracker-84ebf.firebasestorage.app",
  messagingSenderId: "678939061775",
  appId: "1:678939061775:web:b898a05fa80b5e48b53d7a"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
