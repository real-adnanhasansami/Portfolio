/* =========================================================================
   FIREBASE CONFIG
   -------------------------------------------------------------------------
   The only file with your Firebase project keys. These values are not
   secret — they identify your project, not grant access. Real protection
   comes from firestore.rules and the admin-email check in js/admin.js.
   ========================================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBlpTpYvnM5awhINY9bmmcAO4mWxUOqTW4",
  authDomain: "portfolio-cb122.firebaseapp.com",
  databaseURL: "https://portfolio-cb122-default-rtdb.firebaseio.com",
  projectId: "portfolio-cb122",
  storageBucket: "portfolio-cb122.firebasestorage.app",
  messagingSenderId: "392347791405",
  appId: "1:392347791405:web:b5be639fa6e1ec5201c8a4",
  measurementId: "G-N1GXJ2N9QV"
};

// The only email allowed to use the admin panel.
export const ADMIN_EMAIL = "adnansite01@gmail.com";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics is optional and fails silently if unsupported/blocked.
import("https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js")
  .then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => { if (supported) getAnalytics(app); });
  })
  .catch(() => { /* analytics not available, ignore */ });
