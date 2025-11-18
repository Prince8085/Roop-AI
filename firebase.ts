import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDyscXMBqI3oRdZvghbR1lZrgegkdEt1nY",
  authDomain: "roopai.firebaseapp.com",
  projectId: "roopai",
  storageBucket: "roopai.firebasestorage.app",
  messagingSenderId: "612257401456",
  appId: "1:612257401456:web:bb4ca65413e49b0a9702b5",
  measurementId: "G-F9WV55DY4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;
// Analytics only works in browser environments
if (typeof window !== 'undefined') {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics, auth, db, storage };