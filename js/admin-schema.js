/* =========================================================================
   ADMIN SCHEMA
   -------------------------------------------------------------------------
   This is the control panel for your control panel. Every tab, form field
   and list you see in admin.html is generated from this file by
   js/admin.js — you never hand-build admin.html forms.

   TO ADD A BRAND NEW SECTION LATER (e.g. "Case Studies"):
   1. Copy one of the "type: list" blocks below.
   2. Change id, label, and collection to something new.
   3. List the fields you want to fill in for each entry.
   4. Save this file — the admin panel now has a new tab automatically.
   5. To show that content on the public site, add a matching render
      function in js/content-loader.js (copy an existing one, e.g.
      loadShopPage, as a template) and a container in the relevant HTML page.

   FIELD TYPES available: text, email, url, number, date, textarea, select, checkbox
   - "textarea" fields marked multiline:"lines" store one item per line
     (used for pricing features / course curriculum) — shown as a bullet list.
   - "select" fields need an `options: [...]` array.
   ========================================================================= */

export const ADMIN_SECTIONS = [

  // ---- SINGLE-DOCUMENT SECTIONS (one record, not a list) ------------------
  {
    id: "site", label: "Site Settings", type: "single",
    collection: "content", docId: "site",
    hint: "Controls your site name, footer text and contact details shown across every page.",
    fields: [
      { key: "siteName", label: "Site name (shown in header/footer)", type: "text" },
      { key: "tagline", label: "Short tagline (optional)", type: "text" },
      { key: "footerText", label: "Footer note", type: "text" },
      { key: "contactEmail", label: "Contact email", type: "email" },
      { key: "contactPhone", label: "Contact phone", type: "text" },
      { key: "bookingLink", label: "\"Book a call\" link (Calendly, WhatsApp, etc. — optional)", type: "url" },
      { key: "metaDescription", label: "SEO description (one sentence about your site)", type: "textarea" }
    ]
  },
  {
    id: "hero", label: "Home Intro", type: "single",
    collection: "content", docId: "hero",
    hint: "The top section of your homepage.",
    fields: [
      { key: "role", label: "Small label above the headline", type: "text" },
      { key: "headline", label: "Main headline", type: "text" },
      { key: "bio", label: "Short bio paragraph", type: "textarea" },
      { key: "photoUrl", label: "Photo URL", type: "url" }
    ]
  },
  {
    id: "about", label: "About Page Intro", type: "single",
    collection: "content", docId: "about",
    hint: "The main paragraph on your About page.",
    fields: [
      { key: "intro", label: "About paragraph", type: "textarea" }
    ]
  },

  // ---- LIST SECTIONS (add / edit / delete multiple entries) ---------------
  {
    id: "aboutFacts", label: "About — Quick Facts", type: "list",
    collection: "aboutFacts", orderField: "order",
    hint: "Short label/value pairs shown on the About page, e.g. Based in / Chattogram.",
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "value", label: "Value", type: "text" },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.label}</strong>: ${d.value}`
  },
  {
    id: "experience", label: "Experience", type: "list",
    collection: "experience", orderField: "order",
    fields: [
      { key: "role", label: "Job title / role", type: "text" },
      { key: "company", label: "Company / organisation", type: "text" },
      { key: "startDate", label: "Start (e.g. 2024)", type: "text" },
      { key: "endDate", label: "End (leave blank for 'Present')", type: "text" },
      { key: "description", label: "Description (optional)", type: "textarea" },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.role}</strong> — ${d.company || ""}`
  },
  {
    id: "skills", label: "Skills", type: "list",
    collection: "skills", orderField: "order",
    fields: [
      { key: "name", label: "Skill name", type: "text" },
      { key: "category", label: "Group", type: "select", options: ["Technical", "Working Style"], default: "Technical" },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.name}</strong> <span class="tag">${d.category || ""}</span>`
  },
  {
    id: "services", label: "Services", type: "list",
    collection: "services", orderField: "order",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "icon", label: "Emoji icon (optional, e.g. 🎯)", type: "text" },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.title}</strong>`
  },
  {
    id: "pricing", label: "Pricing Plans", type: "list",
    collection: "pricing", orderField: "order",
    fields: [
      { key: "planName", label: "Plan name", type: "text" },
      { key: "price", label: "Price (e.g. $50 or ৳3000)", type: "text" },
      { key: "billingNote", label: "Billing note (e.g. /project, /month)", type: "text" },
      { key: "features", label: "Features (one per line)", type: "textarea" },
      { key: "highlighted", label: "Highlight this plan as 'Most popular'", type: "checkbox" },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.planName}</strong> — ${d.price || ""}`
  },
  {
    id: "projects", label: "Portfolio / Work", type: "list",
    collection: "projects", orderField: "order",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Short description", type: "textarea" },
      { key: "category", label: "Category (e.g. Design, Marketing, Website, eBook)", type: "text" },
      { key: "tags", label: "Tags (comma separated)", type: "text" },
      { key: "imageUrl", label: "Cover image URL", type: "url" },
      { key: "liveLink", label: "Live link (optional)", type: "url" },
      { key: "driveLink", label: "Google Drive link (optional)", type: "url" },
      { key: "year", label: "Year", type: "text" },
      { key: "featured", label: "Feature on homepage", type: "checkbox" },
      { key: "published", label: "Published (visible on site)", type: "checkbox", default: true },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.title}</strong> <span class="tag">${d.category || "Uncategorized"}</span>${d.featured ? ' <span class="tag tag--gold">Featured</span>' : ""}`
  },
  {
    id: "testimonials", label: "Testimonials", type: "list",
    collection: "testimonials", orderField: "order",
    fields: [
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role / company (optional)", type: "text" },
      { key: "photoUrl", label: "Photo URL (optional)", type: "url" },
      { key: "rating", label: "Rating (1–5)", type: "number", default: 5 },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.name}</strong> — "${(d.quote || "").slice(0, 60)}${(d.quote || "").length > 60 ? "…" : ""}"`
  },
  {
    id: "posts", label: "Blog", type: "list",
    collection: "posts", orderField: "date", orderDir: "desc",
    hint: "Write posts the way you'd write a LinkedIn newsletter or Medium article — title, cover image, category, tags, and the full text.",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "URL slug (e.g. my-first-post — no spaces)", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "tags", label: "Tags (comma separated)", type: "text" },
      { key: "coverImageUrl", label: "Cover image URL", type: "url" },
      { key: "excerpt", label: "Short excerpt (shown in the list)", type: "textarea" },
      { key: "body", label: "Full post content", type: "textarea", large: true },
      { key: "date", label: "Publish date", type: "date" },
      { key: "readTime", label: "Read time (e.g. '4 min read')", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Published"], default: "Draft" }
    ],
    summary: (d) => `<strong>${d.title}</strong> <span class="tag">${d.status || "Draft"}</span>`
  },
  {
    id: "shop", label: "Shop / Digital Products", type: "list",
    collection: "shop", orderField: "order",
    hint: "No payment processor is set up (keeps things free) — the Order link can point to WhatsApp, a Drive folder, or any payment link you use.",
    fields: [
      { key: "name", label: "Product name", type: "text" },
      { key: "price", label: "Price (e.g. $10 or ৳500)", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "imageUrl", label: "Image URL", type: "url" },
      { key: "category", label: "Category (optional)", type: "text" },
      { key: "orderLink", label: "Order link (WhatsApp / Drive / payment link)", type: "url" },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.name}</strong> — ${d.price || ""}`
  },
  {
    id: "courses", label: "Courses", type: "list",
    collection: "courses", orderField: "order",
    fields: [
      { key: "title", label: "Course title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "duration", label: "Duration (e.g. '4 weeks')", type: "text" },
      { key: "curriculum", label: "What's covered (one line per point)", type: "textarea" },
      { key: "price", label: "Price", type: "text" },
      { key: "enrollLink", label: "Enroll link (WhatsApp / form / payment link)", type: "url" },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.title}</strong> — ${d.price || ""}`
  },
  {
    id: "faq", label: "FAQ", type: "list",
    collection: "faq", orderField: "order",
    hint: "Shown on your Contact page.",
    fields: [
      { key: "question", label: "Question", type: "text" },
      { key: "answer", label: "Answer", type: "textarea" },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.question}</strong>`
  },
  {
    id: "social", label: "Social Links", type: "list",
    collection: "social", orderField: "order",
    fields: [
      { key: "platform", label: "Platform", type: "select", options: ["facebook", "linkedin", "instagram", "x", "github", "whatsapp", "website"], default: "facebook" },
      { key: "label", label: "Label (shown in footer)", type: "text" },
      { key: "url", label: "Link URL", type: "url" },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.label || d.platform}</strong> — ${d.url}`
  },

  {
    id: "pages", label: "Custom Pages", type: "list",
    collection: "pages", orderField: "order",
    hint: "Create brand-new pages beyond the built-in ones (e.g. Media Kit, Resources, a case study). Each one is viewable at page.html?slug=your-slug — add it in the Menu tab to make it appear in navigation, and add content to it from the Page Builder tab.",
    fields: [
      { key: "title", label: "Page title", type: "text" },
      { key: "slug", label: "URL slug (e.g. media-kit — no spaces)", type: "text" },
      { key: "seoDescription", label: "Short description shown under the title (optional)", type: "textarea" },
      { key: "order", label: "Sort order (for your own reference)", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.title}</strong> — page.html?slug=${d.slug}`
  },
  {
    id: "navLinks", label: "Menu / Navigation", type: "list",
    collection: "navLinks", orderField: "order",
    hint: "Controls the menu bar at the top of every page. Leave this empty to keep the default built-in menu. The moment you add even one item here, this list fully replaces the menu everywhere — so add every item you want (Home, About, etc.) once you start.",
    fields: [
      { key: "label", label: "Menu text (e.g. Home)", type: "text" },
      { key: "target", label: "Link target (e.g. index.html, about.html, or page.html?slug=media-kit)", type: "text" },
      { key: "order", label: "Display order", type: "number", default: 1 }
    ],
    summary: (d) => `<strong>${d.label}</strong> → ${d.target}`
  },

  // ---- READ-ONLY SECTIONS ---------------------------------------------------
  {
    id: "messages", label: "Contact Messages", type: "readonly-list",
    collection: "messages", orderField: "createdAt", orderDir: "desc",
    hint: "Messages people send through your contact form.",
    summary: (d) => `<strong>${d.name}</strong> — ${d.email}<br><span style="font-size:0.9rem;">${d.message}</span>`,
    markReadable: true
  },
  {
    id: "subscribers", label: "Newsletter Subscribers", type: "readonly-list",
    collection: "subscribers", orderField: "createdAt", orderDir: "desc",
    hint: "Emails collected from the newsletter box on your blog.",
    summary: (d) => `${d.email}`
  }
];
