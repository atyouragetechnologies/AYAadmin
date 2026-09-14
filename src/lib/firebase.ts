import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'],
  appId: import.meta.env['VITE_FIREBASE_APP_ID'],
  storageBucket: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'],
  apiKey: import.meta.env['VITE_FIREBASE_API_KEY'],
  authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'],
  messagingSenderId: import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'],
  measurementId: import.meta.env['VITE_FIREBASE_MEASUREMENT_ID']
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export { app };