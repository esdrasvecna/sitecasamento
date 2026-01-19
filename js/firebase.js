import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/**
 * Cole aqui a config do seu Firebase (Project Settings -> Your apps -> Web app)
 */
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
