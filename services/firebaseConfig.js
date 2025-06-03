// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIyFHLw8eY8cmw1X_io77HJxGORt7sB3c",
  authDomain: "nutrixp-1.firebaseapp.com",
  projectId: "nutrixp-1",
  storageBucket: "nutrixp-1.firebasestorage.app",
  messagingSenderId: "925545468865",
  appId: "1:925545468865:web:fdaacf46ab09c3c3395540"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };