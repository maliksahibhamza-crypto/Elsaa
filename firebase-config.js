// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyARkDn7KfxQeYuXNdUs9jJ6c0PfMcHnwaA",
  authDomain: "elsaandme-b7e29.firebaseapp.com",
  projectId: "elsaandme-b7e29",
  storageBucket: "elsaandme-b7e29.firebasestorage.app",
  messagingSenderId: "484608373203",
  appId: "1:484608373203:web:3cabb973f3afac64497f26"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
