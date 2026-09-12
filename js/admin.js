/* =========================================================================
   ADMIN ENGINE
   -------------------------------------------------------------------------
   Everything in the admin panel — tabs, forms, lists — is generated from
   js/admin-schema.js. This file doesn't know what "Services" or "Blog"
   are; it just knows how to turn a schema entry into a working editor.
   To change WHAT can be edited, edit admin-schema.js, not this file.

   Sections:
   1. AUTH GATE
   2. BUILD TABS + PANELS from the schema
   3. FIELD RENDERING HELPERS (turn a field definition into HTML/values)
   4. SINGLE-DOCUMENT PANEL LOGIC (Site Settings, Home Intro, About Intro)
   5. LIST PANEL LOGIC (everything else editable)
   6. READ-ONLY LIST LOGIC (Messages, Subscribers)
   ========================================================================= */

import { db, auth, ADMIN_EMAIL } from "./firebase-config.js";
import { ADMIN_SECTIONS } from "./admin-schema.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  doc, setDoc, getDoc,
  collection, addDoc, deleteDoc, updateDoc,
  onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* -------------------------------------------------------------------------
   1. AUTH GATE
   ------------------------------------------------------------------------- */
const loginScreen = document.getElementById("loginScreen");
const adminShell = document.getElementById("adminShell");
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const logoutBtn = document.getElementById("logoutBtn");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  loginStatus.textContent = "Signing in...";
  loginStatus.className = "form-status";
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginStatus.textContent = "Sign in failed. Check your email and password.";
    loginStatus.className = "form-status is-error";
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

let builtOnce = false;
onAuthStateChanged(auth, (user) => {
  if (user && user.email === ADMIN_EMAIL) {
    loginScreen.style.display = "none";
    adminShell.classList.add("is-visible");
    if (!builtOnce) { builtOnce = true; buildAdminUI(); }
  } else {
    if (user) signOut(auth); // signed in, but not the admin account
    adminShell.classList.remove("is-visible");
    loginScreen.style.display = "block";
  }
});

/* -------------------------------------------------------------------------
   2. BUILD TABS + PANELS from the schema
   ------------------------------------------------------------------------- */
function buildAdminUI() {
  const tabsEl = document.getElementById("adminTabs");
  const panelsEl = document.getElementById("adminPanels");

  ADMIN_SECTIONS.forEach((section, i) => {
    const tabBtn = document.createElement("button");
    tabBtn.textContent = section.label;
    tabBtn.dataset.tab = section.id;
    if (i === 0) tabBtn.classList.add("is-active");
    tabBtn.addEventListener("click", () => {
      tabsEl.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
      panelsEl.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("is-active"));
      tabBtn.classList.add("is-active");
      document.getElementById(`panel-${section.id}`).classList.add("is-active");
    });
    tabsEl.appendChild(tabBtn);

    const panel = document.createElement("section");
    panel.className = "admin-panel" + (i === 0 ? " is-active" : "");
    panel.id = `panel-${section.id}`;
    panel.innerHTML = `
      <h2>${escapeHtml(section.label)}</h2>
      ${section.hint ? `<p class="panel-hint">${escapeHtml(section.hint)}</p>` : ""}
      ${section.type !== "readonly-list" ? buildFormHtml(section) : ""}
      <div class="admin-list" id="list-${section.id}"></div>
    `;
    panelsEl.appendChild(panel);

    if (section.type === "single") initSinglePanel(section);
    else if (section.type === "list") initListPanel(section);
    else if (section.type === "readonly-list") initReadonlyListPanel(section);
  });

  // Let js/admin-blocks.js know it's safe to add its own "Page Builder" tab
  document.dispatchEvent(new Event("admin:ready"));
}

/* -------------------------------------------------------------------------
   3. FIELD RENDERING HELPERS
   ------------------------------------------------------------------------- */
function fieldId(section, field) {
  return `field-${section.id}-${field.key}`;
}

function buildFormHtml(section) {
  const fieldsHtml = section.fields.map((f) => {
    const id = fieldId(section, f);
    if (f.type === "textarea") {
      return `<div class="field"><label for="${id}">${escapeHtml(f.label)}</label>
        <textarea id="${id}" ${f.large ? 'style="min-height:220px;"' : ""}></textarea></div>`;
    }
    if (f.type === "select") {
      const opts = f.options.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("");
      return `<div class="field"><label for="${id}">${escapeHtml(f.label)}</label>
        <select id="${id}">${opts}</select></div>`;
    }
    if (f.type === "checkbox") {
      return `<div class="field checkbox-field"><input type="checkbox" id="${id}" /><label for="${id}">${escapeHtml(f.label)}</label></div>`;
    }
    return `<div class="field"><label for="${id}">${escapeHtml(f.label)}</label>
      <input type="${f.type}" id="${id}" /></div>`;
  }).join("");

  const submitLabel = section.type === "single" ? "Save" : "Add";
  return `
    <form class="admin-form" id="form-${section.id}" data-editing-id="">
      ${fieldsHtml}
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <button type="submit" class="btn btn--primary" id="submitBtn-${section.id}">${submitLabel}</button>
        <button type="button" class="btn btn--outline" id="cancelBtn-${section.id}" style="display:none;">Cancel edit</button>
      </div>
      <p class="form-status" id="status-${section.id}"></p>
    </form>`;
}

function getFieldValue(section, field) {
  const el = document.getElementById(fieldId(section, field));
  if (field.type === "checkbox") return el.checked;
  if (field.type === "number") return el.value === "" ? (field.default ?? 0) : Number(el.value);
  return el.value.trim();
}

function setFieldValue(section, field, value) {
  const el = document.getElementById(fieldId(section, field));
  if (!el) return;
  if (field.type === "checkbox") el.checked = !!value;
  else el.value = value ?? "";
}

function resetForm(section) {
  const form = document.getElementById(`form-${section.id}`);
  section.fields.forEach((f) => setFieldValue(section, f, f.type === "checkbox" ? false : (f.default ?? "")));
  form.dataset.editingId = "";
  document.getElementById(`submitBtn-${section.id}`).textContent = section.type === "single" ? "Save" : "Add";
  document.getElementById(`cancelBtn-${section.id}`).style.display = "none";
}

function collectFormValues(section) {
  const values = {};
  section.fields.forEach((f) => { values[f.key] = getFieldValue(section, f); });
  return values;
}

/* -------------------------------------------------------------------------
   4. SINGLE-DOCUMENT PANEL LOGIC
   ------------------------------------------------------------------------- */
async function initSinglePanel(section) {
  const form = document.getElementById(`form-${section.id}`);
  const status = document.getElementById(`status-${section.id}`);
  document.getElementById(`cancelBtn-${section.id}`).style.display = "none";

  const snap = await getDoc(doc(db, section.collection, section.docId));
  if (snap.exists()) {
    const data = snap.data();
    section.fields.forEach((f) => setFieldValue(section, f, data[f.key]));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, section.collection, section.docId), collectFormValues(section), { merge: true });
      status.textContent = "Saved.";
      status.className = "form-status is-success";
    } catch (err) {
      status.textContent = "Could not save: " + err.message;
      status.className = "form-status is-error";
    }
  });
}

/* -------------------------------------------------------------------------
   5. LIST PANEL LOGIC
   ------------------------------------------------------------------------- */
function initListPanel(section) {
  const form = document.getElementById(`form-${section.id}`);
  const status = document.getElementById(`status-${section.id}`);
  const cancelBtn = document.getElementById(`cancelBtn-${section.id}`);

  cancelBtn.addEventListener("click", () => resetForm(section));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const values = collectFormValues(section);
    const editingId = form.dataset.editingId;
    try {
      if (editingId) {
        await updateDoc(doc(db, section.collection, editingId), values);
        status.textContent = "Updated.";
      } else {
        await addDoc(collection(db, section.collection), values);
        status.textContent = "Added.";
      }
      status.className = "form-status is-success";
      resetForm(section);
    } catch (err) {
      status.textContent = "Could not save: " + err.message;
      status.className = "form-status is-error";
    }
  });

  const q = query(collection(db, section.collection), orderBy(section.orderField || "order", section.orderDir || "asc"));
  onSnapshot(q, (snap) => {
    const listEl = document.getElementById(`list-${section.id}`);
    listEl.innerHTML = "";
    if (snap.empty) {
      listEl.innerHTML = `<p class="empty-note">Nothing added yet.</p>`;
      return;
    }
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const item = document.createElement("div");
      item.className = "admin-list-item";
      item.innerHTML = `
        <div>${section.summary(data)}</div>
        <div class="item-actions">
          <button class="primary" data-action="edit">Edit</button>
          <button class="danger" data-action="delete">Delete</button>
        </div>`;
      item.querySelector('[data-action="edit"]').addEventListener("click", () => {
        section.fields.forEach((f) => setFieldValue(section, f, data[f.key]));
        form.dataset.editingId = docSnap.id;
        document.getElementById(`submitBtn-${section.id}`).textContent = "Save changes";
        cancelBtn.style.display = "inline-flex";
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      item.querySelector('[data-action="delete"]').addEventListener("click", async () => {
        if (confirm("Delete this item? This cannot be undone.")) {
          await deleteDoc(doc(db, section.collection, docSnap.id));
        }
      });
      listEl.appendChild(item);
    });
  });
}

/* -------------------------------------------------------------------------
   6. READ-ONLY LIST LOGIC (Messages, Subscribers)
   ------------------------------------------------------------------------- */
function initReadonlyListPanel(section) {
  const q = query(collection(db, section.collection), orderBy(section.orderField || "createdAt", section.orderDir || "desc"));
  onSnapshot(q, (snap) => {
    const listEl = document.getElementById(`list-${section.id}`);
    listEl.innerHTML = "";
    if (snap.empty) {
      listEl.innerHTML = `<p class="empty-note">Nothing here yet.</p>`;
      return;
    }
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const item = document.createElement("div");
      item.className = "admin-list-item";
      item.style.opacity = data.read === false || data.read === undefined ? "1" : "0.6";
      item.innerHTML = `
        <div>${section.summary(data)}</div>
        <div class="item-actions">
          ${section.markReadable && !data.read ? `<button class="primary" data-action="read">Mark read</button>` : ""}
          <button class="danger" data-action="delete">Delete</button>
        </div>`;
      const readBtn = item.querySelector('[data-action="read"]');
      if (readBtn) readBtn.addEventListener("click", () => updateDoc(doc(db, section.collection, docSnap.id), { read: true }));
      item.querySelector('[data-action="delete"]').addEventListener("click", () => {
        if (confirm("Delete this item?")) deleteDoc(doc(db, section.collection, docSnap.id));
      });
      listEl.appendChild(item);
    });
  });
}
