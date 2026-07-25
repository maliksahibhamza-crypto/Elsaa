// Firebase SDK Imports

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";


// Firebase Configuration

const firebaseConfig = {

    apiKey: "AIzaSyARkDn7KfxQeYuXNdUs9jJ6c0PfMcHnwaA",

    authDomain: "elsaandme-b7e29.firebaseapp.com",

    projectId: "elsaandme-b7e29",

    storageBucket: "elsaandme-b7e29.firebasestorage.app",

    messagingSenderId: "484608373203",

    appId: "1:484608373203:web:3cabb973f3afac64497f26",

    measurementId: "G-5RMLTVXL1H"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const analytics = getAnalytics(app);


// Export

export {

    app,

    auth,

    db,

    analytics

};
