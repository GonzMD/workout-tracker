import { auth } from './firebase-config.js';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');


export function loginWithGoogle() {
    return signInWithPopup(auth, provider);
}

export function logout() {
    return signOut(auth);
}

export function onUserChange(callback) {
    onAuthStateChanged(auth, callback);
}
