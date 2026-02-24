// services/firebase.js — Firebase Authentication Setup
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";

// Firebase configuration
// Get these from: https://console.firebase.google.com
// Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC...",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

/**
 * Register with email & password
 */
export const registerWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send to backend
    const response = await fetch("http://localhost:8000/api/v1/auth/firebase/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebase_uid: user.uid,
        email: user.email,
        display_name: displayName,
        photo_url: user.photoURL,
        auth_provider: "email",
      }),
    });
    
    const data = await response.json();
    
    // Store user data
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("firebase_uid", user.uid);
    
    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Login with email & password
 */
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send to backend
    const response = await fetch("http://localhost:8000/api/v1/auth/firebase/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebase_uid: user.uid,
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoURL,
        auth_provider: "email",
      }),
    });
    
    const data = await response.json();
    
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("firebase_uid", user.uid);
    
    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Continue with Google
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Send to backend
    const response = await fetch("http://localhost:8000/api/v1/auth/firebase/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebase_uid: user.uid,
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoURL,
        auth_provider: "google",
      }),
    });
    
    const data = await response.json();
    
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("firebase_uid", user.uid);
    
    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem("user");
    localStorage.removeItem("firebase_uid");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Check auth state
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem("firebase_uid");
};

export { auth };
export default app;
