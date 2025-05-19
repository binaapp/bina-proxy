// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDvE4DkBeqUDr3wCyRLAGCmbRIO5YOEEMU",
  authDomain: "binaapp-a96c2.firebaseapp.com",
  projectId: "binaapp-a96c2",
  storageBucket: "binaapp-a96c2.firebasestorage.app",
  messagingSenderId: "594711237256",
  appId: "1:594711237256:web:426147fef85bfecdc1c53d",
  measurementId: "G-1WQBY3LFPN",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
