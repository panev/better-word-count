// import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase/app';
import { collection, doc, getFirestore, setDoc } from "firebase/firestore"; 
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from './firebaseConfig';
import { getAnalytics } from "firebase/analytics";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const usersRef = collection(db, "users");
export const sourceRef = "obsidian"
export const auth = getAuth();

// Send stats to Firebase
export async function sendStats(obj: Object) {
    await setDoc(doc(usersRef, 'user'), obj);
}

// Handle sign-in attempt
export async function firebaseSignIn(email: string, password: string) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      console.log(userCredential.user.uid)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}