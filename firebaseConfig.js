// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyitfb9I36VGsI8jnJA0k0CkKwcehUY1I",
  authDomain: "chat-app-4f287.firebaseapp.com",
  projectId: "chat-app-4f287",
  storageBucket: "chat-app-4f287.firebasestorage.app",
  messagingSenderId: "299046084974",
  appId: "1:299046084974:web:f0d6c832f140f4b0f0a17f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };