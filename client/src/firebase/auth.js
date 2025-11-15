// src/firebase/auth.js
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { app } from "./config";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// SIGN UP
export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// SIGN IN
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// GOOGLE SIGN-IN
export const signInWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

// SIGN OUT
export const logout = () => signOut(auth);

// LISTEN TO USER
export const onUserChanged = (callback) => onAuthStateChanged(auth, callback);

export { auth };
