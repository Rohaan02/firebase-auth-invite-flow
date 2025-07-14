import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8lSWHDbcF-8RnpI_YaXDuQaZU5ERWsDQ",
  authDomain: "time-wise-5fbd4.firebaseapp.com",
  projectId: "time-wise-5fbd4",
  storageBucket: "time-wise-5fbd4.appspot.com", // fixed this too
  messagingSenderId: "1042774835729",
  appId: "1:1042774835729:web:e2f2cdaee76fc328e267b0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ Export these too
export {
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
};
