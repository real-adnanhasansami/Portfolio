/* =========================================================================
   MAIN — interactive forms
   -------------------------------------------------------------------------
   1. CONTACT FORM — saves to Firestore "messages"
   2. NEWSLETTER SUBSCRIBE FORM — saves to Firestore "subscribers"
   Both check the element exists first, so this file is safe to include
   on every page even where a form isn't present.
   ========================================================================= */

import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/* -------------------------------------------------------------------------
   1. CONTACT FORM
   ------------------------------------------------------------------------- */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  const formStatus = document.getElementById("formStatus");

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("cf-name").value.trim();
    const email = document.getElementById("cf-email").value.trim();
    const message = document.getElementById("cf-message").value.trim();
    const honeypot = document.getElementById("cf-website").value.trim();

    if (honeypot) {
      // Likely a bot — pretend success, save nothing.
      formStatus.textContent = "Thanks — your message has been sent.";
      formStatus.className = "form-status is-success";
      contactForm.reset();
      return;
    }
    if (!name || !email || !message) return;

    const submitBtn = contactForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    formStatus.textContent = "Sending...";
    formStatus.className = "form-status";

    try {
      await addDoc(collection(db, "messages"), {
        name, email, message, createdAt: serverTimestamp(), read: false
      });
      formStatus.textContent = "Thanks — your message has been sent. I'll reply by email soon.";
      formStatus.className = "form-status is-success";
      contactForm.reset();
    } catch (err) {
      console.error(err);
      formStatus.textContent = "Something went wrong. Please email me directly instead.";
      formStatus.className = "form-status is-error";
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* -------------------------------------------------------------------------
   2. NEWSLETTER SUBSCRIBE FORM
   ------------------------------------------------------------------------- */
const subscribeForm = document.getElementById("subscribeForm");
if (subscribeForm) {
  const subscribeStatus = document.getElementById("subscribeStatus");

  subscribeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("subscribe-email").value.trim();
    if (!email) return;

    const submitBtn = subscribeForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
      await addDoc(collection(db, "subscribers"), { email, createdAt: serverTimestamp() });
      if (subscribeStatus) {
        subscribeStatus.textContent = "Subscribed — thank you!";
        subscribeStatus.className = "form-status is-success";
      }
      subscribeForm.reset();
    } catch (err) {
      if (subscribeStatus) {
        subscribeStatus.textContent = "Something went wrong, please try again.";
        subscribeStatus.className = "form-status is-error";
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
}
console.log("%c👋 Hey, curious developer!", "font-size:16px; font-weight:bold; color:#2A5457;");
console.log("%cThis site was hand-built by Adnan Hasan Sami — designed, deployed, and wired up entirely from VS Code, GitHub, Vercel, and Firebase, no coding background going in. If you're hiring or collaborating, say hi: adnansite01@gmail.com", "font-size:13px; color:#55565C;");