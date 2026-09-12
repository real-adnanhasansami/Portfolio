# Portfolio Website — v2 (multi-page + full CMS)

A minimal, professional, multi-page portfolio site. Still plain HTML/CSS/JS
— no npm, no build step — so it stays simple to host free and easy to hand
to an AI for edits later. This version replaces the single-page site with
separate pages per section, and a much more powerful admin panel.

**Nothing personal is hardcoded anymore.** Every page shows a friendly
placeholder ("Add this from the admin panel...") until you fill it in
yourself through `admin.html`. Your name, phone, email, education, and job
history are no longer written into the code anywhere — you control 100% of
what appears, from the admin panel.

---

## 1. What changed from v1

- **One page → many pages.** Home, About, Services, Pricing, Work, Blog,
  Shop, Courses, Testimonials, Contact — each is its own file, its own nav
  tab, its own admin editor.
- **Blog is now a real mini-blog platform**: cover image, category, tags,
  excerpt, full post page (`blog-post.html`), draft/publish status, a
  newsletter subscribe box.
- **The admin panel is now a generic CMS**, built from one config file
  (`js/admin-schema.js`) instead of hand-coded forms. Every section —
  Services, Pricing, Portfolio, Testimonials, Blog, Shop, Courses, FAQ,
  Experience, Skills, Social Links — has its own full add/edit/delete
  editor, plus read-only inboxes for Contact Messages and Newsletter
  Subscribers.
- **Shared header/footer** live in one place (`partials/header.html` and
  `partials/footer.html`) and get injected into every page by
  `js/common.js` — edit the menu once, it updates everywhere.

---

## 2. Project structure

```
portfolio/
├── index.html            ← Home
├── about.html             ← About
├── services.html          ← Services
├── pricing.html           ← Pricing
├── portfolio.html         ← Work / portfolio
├── blog.html               ← Blog list
├── blog-post.html           ← Single blog post (reads ?slug=... from the URL)
├── shop.html                ← Digital products
├── courses.html              ← Courses
├── testimonials.html          ← Testimonials
├── contact.html                ← Contact form + FAQ
├── admin.html                   ← Hidden admin panel (login required)
├── robots.txt
├── firestore.rules
├── database.rules.json
├── partials/
│   ├── header.html        ← Edit the nav menu here — once, for every page
│   └── footer.html
├── css/
│   └── style.css           ← All styling, numbered + titled sections
├── js/
│   ├── firebase-config.js   ← Your Firebase project keys
│   ├── common.js              ← Injects header/footer, handles nav + scroll
│   ├── content-loader.js       ← Reads Firestore, renders it on every page
│   ├── main.js                   ← Contact form + newsletter form
│   ├── admin-schema.js             ← Defines every admin-editable section
│   └── admin.js                     ← Generic engine that builds the admin UI
└── assets/
    └── profile.jpg          ← Keep your existing photo here when you copy these files in
```

Every file starts with a banner comment listing its sections in order.

---

## 3. How the admin panel became "like WordPress"

Instead of one hand-written form per section, **`js/admin-schema.js`** is a
list describing every editable section — its label, its Firestore
collection, and its fields. **`js/admin.js`** reads that list and builds
the tabs, forms, and item lists automatically.

**To add a brand-new section later** (e.g. "Case Studies" or "Client
Portal"):
1. Open `js/admin-schema.js`, copy one of the `type: "list"` blocks.
2. Rename it and list the fields you want.
3. Save — the admin panel now has a new tab, with no other changes needed.
4. To show it on the public site too, add a small render function in
   `js/content-loader.js` (copy `loadShopPage` as a template — it's short)
   and a container `<div>` on the page you want it to appear on.

### The Page Builder — add content anywhere, without any of the above

There's now a faster, no-code way that doesn't need any file changes at
all: the **Page Builder** tab.
- Pick any page (built-in or one you created in **Custom Pages**).
- Add content blocks: Heading, Paragraph, Image, Button, List, Quote,
  Video, Image Gallery, Spacer, or Custom HTML (advanced).
- Reorder them with the ↑ / ↓ buttons, edit or delete any time.
- On a built-in page, your blocks appear near the bottom.
- On a **Custom Page** (made in the **Custom Pages** tab), your blocks
  *are* the entire page — write a title there, then build the content
  here.

**Custom Pages** let you create something like "Media Kit" or a case
study with its own URL (`page.html?slug=media-kit`) entirely from the
admin panel. Add it to the **Menu / Navigation** tab to make it show up
in the header — the moment you add even one item there, that list fully
replaces the default menu everywhere, so add every item you want (Home,
About, etc.) once you start using it.

---

## 4. Firebase setup

Your config keys are already in `js/firebase-config.js`. Still to do:

### a) Firestore Security Rules — do this first
1. Firebase Console → **Firestore Database** → **Rules**
2. Replace everything with the contents of `firestore.rules` → **Publish**

This keeps content publicly readable (so the site works) and only
writable by you — permanently, no expiry date.

### b) Realtime Database — not used
1. Firebase Console → **Realtime Database** → **Rules**
2. Paste in `database.rules.json` → **Publish** (or delete the Realtime
   Database instance entirely, since nothing here uses it)

### c) Authentication — your one admin login
1. Firebase Console → **Authentication** → **Users** → **Add user**
2. Email: `adnansite01@gmail.com` + a strong password
3. This is the only account that can get into `admin.html` — checked both
   by the rules and by the code, so no one else can get in even with their
   own Firebase account.

### d) Storage — still intentionally unused
Images go in as **URLs** (no Storage, no cost):
- **Profile photo**: a file in `/assets` in your repo (free, via Vercel).
- **Everything else** (project covers, blog covers, shop/course images):
  paste a public image URL into the relevant admin form. Since you're
  putting projects on Google Drive, remember to set the Drive file/folder
  sharing to **"Anyone with the link"** or the image/link won't load for
  visitors.

---

## 5. Deploying (GitHub + Vercel)

Same as before:
1. Push all these files to your GitHub repo (see the push guide below).
2. Vercel → your project should already be connected — it redeploys
   automatically on every push. No separate "deploy to Vercel" step.

---

## 6. Pushing updates from VS Code (what you asked for)

You have two options. Since you started this repo with GitHub's website
uploader, your VS Code folder likely isn't linked to git yet — so do the
**one-time setup** below first, then use the **every-time commands** after
that for all future changes.

### One-time setup (do this once)

Open the Terminal in VS Code (`Terminal` menu → `New Terminal`), make sure
you're inside your project folder, then run:

```bash
git init
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
```

Replace `YOUR-USERNAME/YOUR-REPO-NAME` with your actual GitHub repo path
(copy it from the address bar when viewing your repo on GitHub.com).

Since the repo already has files (from your first web upload), pull them
down first so git knows about them:

```bash
git pull origin main --allow-unrelated-histories
```

If it opens a text editor for a merge commit message, just save and close
it (in VS Code: `Ctrl+S` then close the tab, or `Cmd+S` on Mac).

### Every time you make changes (from now on)

```bash
git add .
git commit -m "describe what you changed here"
git push
```

That's it — three lines, every time. Vercel notices the new push and
redeploys automatically within about a minute.

**Tip:** VS Code also has a point-and-click version of this — the Source
Control icon in the left sidebar (the one with the branching icon, already
visible in your VS Code). It shows changed files, lets you type a commit
message in a box, and has a "Commit" button and a "Sync/Push" button — no
terminal typing needed if you prefer that.

If `git push` ever asks you to sign in, use your GitHub username and, for
the password, a **Personal Access Token** (GitHub no longer accepts your
regular password for this) — GitHub will prompt you to create one the
first time, or you can make one at:
GitHub.com → Settings → Developer settings → Personal access tokens.

---

## 7. Using the admin panel day-to-day

Go to `yoursite.vercel.app/admin.html`, sign in, and you'll see a tab for
every section. General pattern for list-type sections (Services,
Portfolio, Blog, etc.):
- Fill the form at the top → **Add**.
- Click **Edit** on any existing item to load it back into the form, make
  changes, and click **Save changes**.
- Click **Delete** to remove an item (asks for confirmation first).

Notes:
- **Blog**: set Status to "Draft" while you're still writing — drafts
  never show up on the public blog list or post page. Switch to
  "Published" when it's ready.
- **Portfolio**: since you're using Google Drive for your projects, put
  the Drive link in the "Google Drive link" field. You can also add a
  "Live link" if a project has its own separate live URL.
- **Site Settings** tab controls your site name, footer text, contact
  email/phone shown on the Contact page, and an optional "Book a call"
  link — fill these in first, since the header/footer and Contact page
  are blank without them.

---

## 8. Checklist before calling this "live"

- [ ] Paste `firestore.rules` into Firebase Console and publish (updated again for Custom Pages / Page Builder / Menu — includes `pages`, `blocks`, `navLinks`)
- [ ] Paste `database.rules.json` into Firebase Console and publish (or delete the Realtime Database)
- [ ] Create your admin user in Firebase Authentication
- [ ] Confirm `assets/profile.jpg` is present
- [ ] Fill in **Site Settings** and **Home Intro** in the admin panel first
- [ ] Add your real Services, Portfolio projects (with Drive links), Pricing, and Testimonials
- [ ] Write and publish your first Blog post
- [ ] Send yourself a test message through the Contact form and confirm it appears under Contact Messages
- [ ] Subscribe to your own newsletter box and confirm it appears under Newsletter Subscribers
