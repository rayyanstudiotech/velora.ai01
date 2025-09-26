

// FIX: Corrected Firebase import paths for modular SDK to resolve 'has no exported member' errors.
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";

// --- IMPORTANT: FIREBASE CONFIGURATION ---
// To fix authentication errors, please follow these steps:
// 1. Go to your Firebase project Console: https://console.firebase.google.com/
// 2. Select your project.
// 3. Go to Project Settings (click the gear icon ⚙️).
// 4. In the "General" tab, scroll down to "Your apps".
// 5. Find your web app and click on "SDK setup and configuration".
// 6. Select the "Config" option.
// 7. Copy the entire `firebaseConfig` object provided by Firebase.
// 8. Paste it here, replacing the placeholder object below.
// 9. IMPORTANT: In the Firebase console, go to Authentication -> Sign-in method and ensure "Email/Password" is enabled.
const firebaseConfig = {
  apiKey: "AIzaSyBXcqFri4H-bQKp1j3SA7Nez_Ly61DxC14",
  authDomain: "velora-ai-a73aa.firebaseapp.com",
  projectId: "velora-ai-a73aa",
  storageBucket: "velora-ai-a73aa.firebasestorage.app",
  messagingSenderId: "851221320439",
  appId: "1:851221320439:web:443c4e796be669e5dff9f2",
  measurementId: "G-RY8SHE32MY"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


// Get a reference to the auth service
const auth = getAuth(app);

export { auth };