/* =========================================================================
   PAGE BUILDER (admin.html only)
   -------------------------------------------------------------------------
   Adds a "Page Builder" tab to the admin panel. Lets you add rich content
   blocks (headings, images, buttons, lists, quotes, video, galleries,
   spacers, custom HTML) to any page — built-in or a brand-new custom page
   created in the "Custom Pages" tab — without touching any code.

   Blocks live in the "blocks" Firestore collection:
   { pageSlug, type, order, ...fields specific to that block type }

   This file waits for the "admin:ready" event fired by js/admin.js once
   you're signed in, then builds its own tab and panel inside the same
   #adminTabs / #adminPanels containers the rest of the admin panel uses.
   ========================================================================= */

import { db } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const BUILTIN_PAGES = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "services", label: "Services" },
  { slug: "pricing", label: "Pricing" },
  { slug: "portfolio", label: "Work / Portfolio" },
  { slug: "blog", label: "Blog (list page)" },
  { slug: "shop", label: "Shop" },
  { slug: "courses", label: "Courses" },
  { slug: "testimonials", label: "Testimonials" },
  { slug: "contact", label: "Contact" }
];

const BLOCK_FIELDS = {
  heading: [
    { key: "text", label: "Heading text", type: "text" },
    { key: "level", label: "Size", type: "select", options: ["h2", "h3", "h4"], default: "h2" }
  ],
  paragraph: [
    { key: "text", label: "Paragraph text", type: "textarea" }
  ],
  image: [
    { key: "url", label: "Image URL", type: "url" },
    { key: "caption", label: "Caption (optional)", type: "text" },
    { key: "alt", label: "Alt text (for accessibility)", type: "text" }
  ],
  button: [
    { key: "text", label: "Button text", type: "text" },
    { key: "url", label: "Link URL", type: "url" },
    { key: "style", label: "Style", type: "select", options: ["primary", "outline"], default: "primary" }
  ],
  list: [
    { key: "items", label: "Items (one per line)", type: "textarea" },
    { key: "style", label: "Style", type: "select", options: ["bullet", "numbered"], default: "bullet" }
  ],
  quote: [
    { key: "text", label: "Quote text", type: "textarea" },
    { key: "attribution", label: "Attribution (optional)", type: "text" }
  ],
  video: [
    { key: "url", label: "YouTube or Vimeo link", type: "url" }
  ],
  gallery: [
    { key: "images", label: "Image URLs (one per line)", type: "textarea" }
  ],
  spacer: [
    { key: "height", label: "Height in pixels", type: "number", default: 40 }
  ],
  html: [
    { key: "code", label: "HTML code (advanced — only paste code you trust)", type: "textarea" }
  ]
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

let currentPageSlug = null;
let editingBlockId = null;
let unsubscribe = null;

document.addEventListener("admin:ready", initPageBuilder);

async function initPageBuilder() {
  const tabsEl = document.getElementById("adminTabs");
  const panelsEl = document.getElementById("adminPanels");

  const panel = document.createElement("section");
  panel.className = "admin-panel";
  panel.id = "panel-pagebuilder";
  panel.innerHTML = `
    <h2>Page Builder</h2>
    <p class="panel-hint">Add rich content blocks to any page — headings, images, buttons, lists, quotes, video, galleries — without touching code. On built-in pages, blocks appear near the bottom. On a custom page, blocks are the entire page content.</p>
    <div class="field">
      <label for="pb-page-select">Choose a page</label>
      <select id="pb-page-select"></select>
    </div>
    <div id="pb-editor" style="display:none;">
      <form class="admin-form" id="pb-block-form">
        <div class="field">
          <label for="pb-block-type">Block type</label>
          <select id="pb-block-type">
            <option value="heading">Heading</option>
            <option value="paragraph">Paragraph</option>
            <option value="image">Image</option>
            <option value="button">Button</option>
            <option value="list">List</option>
            <option value="quote">Quote</option>
            <option value="video">Video embed</option>
            <option value="gallery">Image gallery</option>
            <option value="spacer">Spacer</option>
            <option value="html">Custom HTML (advanced)</option>
          </select>
        </div>
        <div id="pb-block-fields"></div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <button type="submit" class="btn btn--primary" id="pb-submit-btn">Add block</button>
          <button type="button" class="btn btn--outline" id="pb-cancel-btn" style="display:none;">Cancel edit</button>
        </div>
        <p class="form-status" id="pb-status"></p>
      </form>
      <div class="admin-list" id="pb-block-list"></div>
    </div>
  `;
  panelsEl.appendChild(panel);

  const tabBtn = document.createElement("button");
  tabBtn.textContent = "Page Builder";
  tabBtn.dataset.tab = "pagebuilder";
  tabBtn.addEventListener("click", () => {
    tabsEl.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
    panelsEl.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("is-active"));
    tabBtn.classList.add("is-active");
    panel.classList.add("is-active");
  });
  tabsEl.appendChild(tabBtn);

  const select = document.getElementById("pb-page-select");
  BUILTIN_PAGES.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.slug; opt.textContent = p.label;
    select.appendChild(opt);
  });

  // Also list any custom pages created in the "Custom Pages" tab
  const customPagesSnap = await getDocs(collection(db, "pages"));
  customPagesSnap.forEach((d) => {
    const p = d.data();
    if (!p.slug) return;
    const opt = document.createElement("option");
    opt.value = p.slug;
    opt.textContent = `${p.title || p.slug} (custom page)`;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => selectPage(select.value));
  document.getElementById("pb-block-type").addEventListener("change", () => renderBlockFields());
  document.getElementById("pb-cancel-btn").addEventListener("click", resetBlockForm);
  document.getElementById("pb-block-form").addEventListener("submit", saveBlock);

  renderBlockFields();
  if (select.value) selectPage(select.value);
}

function selectPage(slug) {
  currentPageSlug = slug;
  document.getElementById("pb-editor").style.display = "block";
  resetBlockForm();
  if (unsubscribe) unsubscribe();
  unsubscribe = onSnapshot(collection(db, "blocks"), (snap) => {
    const blocks = [];
    snap.forEach((d) => { if (d.data().pageSlug === currentPageSlug) blocks.push({ id: d.id, ...d.data() }); });
    blocks.sort((a, b) => (a.order || 0) - (b.order || 0));
    renderBlockList(blocks);
  });
}

function renderBlockFields(existingData) {
  const type = document.getElementById("pb-block-type").value;
  const fieldsEl = document.getElementById("pb-block-fields");
  const defs = BLOCK_FIELDS[type] || [];
  fieldsEl.innerHTML = defs.map((f) => {
    const id = `pb-field-${f.key}`;
    if (f.type === "textarea") return `<div class="field"><label for="${id}">${escapeHtml(f.label)}</label><textarea id="${id}"></textarea></div>`;
    if (f.type === "select") {
      const opts = f.options.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("");
      return `<div class="field"><label for="${id}">${escapeHtml(f.label)}</label><select id="${id}">${opts}</select></div>`;
    }
    return `<div class="field"><label for="${id}">${escapeHtml(f.label)}</label><input type="${f.type}" id="${id}" /></div>`;
  }).join("");

  defs.forEach((f) => {
    const el = document.getElementById(`pb-field-${f.key}`);
    if (!el) return;
    el.value = (existingData ? existingData[f.key] : (f.default ?? "")) ?? "";
  });
}

function collectBlockValues(type) {
  const defs = BLOCK_FIELDS[type] || [];
  const values = { type, pageSlug: currentPageSlug };
  defs.forEach((f) => {
    const el = document.getElementById(`pb-field-${f.key}`);
    values[f.key] = f.type === "number" ? Number(el.value) || 0 : el.value.trim();
  });
  return values;
}

function resetBlockForm() {
  editingBlockId = null;
  document.getElementById("pb-block-type").value = "heading";
  renderBlockFields();
  document.getElementById("pb-submit-btn").textContent = "Add block";
  document.getElementById("pb-cancel-btn").style.display = "none";
}

async function saveBlock(e) {
  e.preventDefault();
  const type = document.getElementById("pb-block-type").value;
  const status = document.getElementById("pb-status");
  const values = collectBlockValues(type);

  try {
    if (editingBlockId) {
      await updateDoc(doc(db, "blocks", editingBlockId), values);
      status.textContent = "Updated.";
    } else {
      const snap = await getDocs(collection(db, "blocks"));
      let maxOrder = 0;
      snap.forEach((d) => { if (d.data().pageSlug === currentPageSlug) maxOrder = Math.max(maxOrder, d.data().order || 0); });
      values.order = maxOrder + 1;
      await addDoc(collection(db, "blocks"), values);
      status.textContent = "Block added.";
    }
    status.className = "form-status is-success";
    resetBlockForm();
  } catch (err) {
    status.textContent = "Could not save: " + err.message;
    status.className = "form-status is-error";
  }
}

function blockSummary(b) {
  const defs = BLOCK_FIELDS[b.type] || [];
  const textField = defs.find((f) => f.type === "text" || f.type === "textarea");
  const preview = textField ? String(b[textField.key] || "").slice(0, 60) : "";
  return `<span class="tag tag--accent">${escapeHtml(b.type)}</span> ${escapeHtml(preview)}`;
}

function renderBlockList(blocks) {
  const listEl = document.getElementById("pb-block-list");
  listEl.innerHTML = "";
  if (!blocks.length) {
    listEl.innerHTML = `<p class="empty-note">No blocks on this page yet.</p>`;
    return;
  }
  blocks.forEach((b, i) => {
    const item = document.createElement("div");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div>${blockSummary(b)}</div>
      <div class="item-actions">
        ${i > 0 ? `<button data-action="up">↑</button>` : ""}
        ${i < blocks.length - 1 ? `<button data-action="down">↓</button>` : ""}
        <button class="primary" data-action="edit">Edit</button>
        <button class="danger" data-action="delete">Delete</button>
      </div>`;
    item.querySelector('[data-action="edit"]').addEventListener("click", () => {
      editingBlockId = b.id;
      document.getElementById("pb-block-type").value = b.type;
      renderBlockFields(b);
      document.getElementById("pb-submit-btn").textContent = "Save changes";
      document.getElementById("pb-cancel-btn").style.display = "inline-flex";
      document.getElementById("pb-block-form").scrollIntoView({ behavior: "smooth" });
    });
    item.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (confirm("Delete this block?")) deleteDoc(doc(db, "blocks", b.id));
    });
    const upBtn = item.querySelector('[data-action="up"]');
    if (upBtn) upBtn.addEventListener("click", () => swapOrder(blocks, i, i - 1));
    const downBtn = item.querySelector('[data-action="down"]');
    if (downBtn) downBtn.addEventListener("click", () => swapOrder(blocks, i, i + 1));
    listEl.appendChild(item);
  });
}

async function swapOrder(blocks, indexA, indexB) {
  const a = blocks[indexA], b = blocks[indexB];
  const orderA = a.order || 0, orderB = b.order || 0;
  await updateDoc(doc(db, "blocks", a.id), { order: orderB });
  await updateDoc(doc(db, "blocks", b.id), { order: orderA });
}
