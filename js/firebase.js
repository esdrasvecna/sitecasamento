// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

// Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// (Opcional) Analytics — só funciona em produção com domínio válido
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";

// Config do seu projeto (a que você enviou)
const firebaseConfig = {
  apiKey: "AIzaSyA3gFneshlL0gTbx0mkfo3jJYVIUKkrNSs",
  authDomain: "casamento-c1b31.firebaseapp.com",
  projectId: "casamento-c1b31",
  storageBucket: "casamento-c1b31.firebasestorage.app",
  messagingSenderId: "878474342158",
  appId: "1:878474342158:web:bc00819222e78426f1f15f",
  measurementId: "G-6KBTNKQ9T5"
};

// Inicializa o app
export const app = initializeApp(firebaseConfig);

// Firestore (ESSENCIAL)
export const db = getFirestore(app);

// Analytics (seguro)
isSupported().then((ok) => {
  if (ok) getAnalytics(app);
});
