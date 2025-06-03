import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDIyFHLw8eY8cmw1X_io77HJxGORt7sB3c",
    authDomain: "nutrixp-1.firebaseapp.com",
    projectId: "nutrixp-1",
    storageBucket: "nutrixp-1.firebasestorage.app",
    messagingSenderId: "925545468865",
    appId: "1:925545468865:web:fdaacf46ab09c3c3395540"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 