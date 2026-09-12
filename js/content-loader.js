/* =========================================================================
   CONTENT LOADER
   -------------------------------------------------------------------------
   One shared file, included on every page. Each render function checks
   whether its container exists on the current page before doing anything —
   so it's safe to include this file everywhere without extra setup.

   Sections:
   1. HELPERS (fetch shortcuts, icons, escaping, small formatters)
   2. SITE SETTINGS (brand name, footer, booking link) — every page
   3. SOCIAL LINKS — every page (footer) + Home hero rail
   4. HOME PAGE (hero + teasers)
   5. ABOUT PAGE
   6. SERVICES PAGE
   7. PRICING PAGE
   8. PORTFOLIO / WORK PAGE
   9. TESTIMONIALS PAGE
   10. BLOG LIST PAGE
   11. BLOG SINGLE POST PAGE
   12. SHOP PAGE
   13. COURSES PAGE
   14. FAQ (used on contact.html)
   ========================================================================= */

import { db } from "./firebase-config.js";
import {
  doc, getDoc, collection, getDocs, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/* -------------------------------------------------------------------------
   1. HELPERS
   ------------------------------------------------------------------------- */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

async function fetchCollection(name, orderField, orderDir = "asc") {
  try {
    const q = orderField
      ? query(collection(db, name), orderBy(orderField, orderDir))
      : collection(db, name);
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    return items;
  } catch (e) {
    console.log(`Could not load "${name}":`, e.message);
    return [];
  }
}

async function fetchDoc(collectionName, docId) {
  try {
    const snap = await getDoc(doc(db, collectionName, docId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.log(`Could not load ${collectionName}/${docId}:`, e.message);
    return null;
  }
}

const SOCIAL_ICONS = {
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002M3.3 8.75h3.6V21H3.3zM9.3 8.75h3.45v1.68h.05c.48-.9 1.65-1.85 3.4-1.85 3.63 0 4.3 2.4 4.3 5.5V21h-3.6v-6.1c0-1.45-.03-3.3-2-3.3-2.02 0-2.33 1.58-2.33 3.2V21H9.3z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.7"/><circle cx="17.1" cy="6.9" r="0.6" fill="currentColor" stroke="none"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h4.3l4 5.4L16.9 3H20l-6.4 8.1L20.5 21h-4.3l-4.4-5.9L6.3 21H3l6.9-8.6z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.5c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.68-4.58 4.93.36.31.68.92.68 1.85v2.75c0 .26.18.58.69.48A10 10 0 0 0 12 2"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2m0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20m4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.2.2-.4.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.1 0-.2 0-.3l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.9 2.3 1 2.4c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1s-.2-.2-.4-.3"/></svg>`,
  website: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.8 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.8-3.8-9s1.3-6.4 3.8-9z"/></svg>`
};

function starString(rating) {
  const n = Math.max(0, Math.min(5, Number(rating) || 5));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

/* -------------------------------------------------------------------------
   2. SITE SETTINGS — runs on every page, after the header/footer exist
   ------------------------------------------------------------------------- */
async function loadSiteSettings() {
  const site = await fetchDoc("content", "site");
  if (!site) return;

  const brand = document.getElementById("brandLink");
  if (brand && site.siteName) brand.textContent = site.siteName;

  const footerNote = document.getElementById("footerNote");
  if (footerNote) {
    const year = new Date().getFullYear();
    footerNote.innerHTML = `&copy; ${year} ${escapeHtml(site.siteName || "")} ${site.footerText ? "— " + escapeHtml(site.footerText) : ""}`;
  }

  // "Book a call" buttons — shown wherever a placeholder exists and a link is set
  if (site.bookingLink) {
    document.querySelectorAll("[data-booking-link]").forEach((el) => {
      el.href = site.bookingLink;
      el.classList.remove("is-hidden-until-set");
      el.style.display = ""; // clear the inline display:none set in the HTML
    });
  }

  document.querySelectorAll("[data-contact-email]").forEach((el) => {
    if (site.contactEmail) { el.href = `mailto:${site.contactEmail}`; el.textContent = site.contactEmail; }
  });
  document.querySelectorAll("[data-contact-phone]").forEach((el) => {
    if (site.contactPhone) { el.href = `tel:${site.contactPhone}`; el.textContent = site.contactPhone; }
  });
}

/* -------------------------------------------------------------------------
   3. SOCIAL LINKS
   ------------------------------------------------------------------------- */
async function loadSocialLinks() {
  const rail = document.getElementById("heroSocialRail");
  const footerSocial = document.getElementById("footerSocial");
  if (!rail && !footerSocial) return;

  const links = await fetchCollection("social", "order", "asc");
  links.forEach(({ platform, url, label }) => {
    const icon = SOCIAL_ICONS[platform] || SOCIAL_ICONS.website;
    if (rail) {
      const a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", label || platform);
      a.innerHTML = icon;
      rail.appendChild(a);
    }
    if (footerSocial) {
      const a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.textContent = label || platform;
      footerSocial.appendChild(a);
    }
  });
}

/* -------------------------------------------------------------------------
   4. HOME PAGE
   ------------------------------------------------------------------------- */
async function loadHomePage() {
  if (!document.getElementById("heroHeadline")) return; // not on this page

  const hero = await fetchDoc("content", "hero");
  if (hero) {
    if (hero.role) document.getElementById("heroRole").textContent = hero.role;
    if (hero.headline) document.getElementById("heroHeadline").textContent = hero.headline;
    if (hero.bio) document.getElementById("heroBio").textContent = hero.bio;
    if (hero.photoUrl) document.getElementById("heroPhoto").src = hero.photoUrl;
  }

  // Teaser: top 3 services
  const servicesTeaser = document.getElementById("homeServicesTeaser");
  if (servicesTeaser) {
    const services = await fetchCollection("services", "order", "asc");
    renderEmptyOr(servicesTeaser, services.slice(0, 3), (s) => `
      <div class="service-card">
        ${s.icon ? `<div class="service-icon">${escapeHtml(s.icon)}</div>` : ""}
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.description || "")}</p>
      </div>`, "No services added yet.");
  }

  // Teaser: featured projects (fallback to first 3 if none marked featured)
  const workTeaser = document.getElementById("homeWorkTeaser");
  if (workTeaser) {
    const projects = (await fetchCollection("projects", "order", "asc")).filter((p) => p.published !== false);
    const featured = projects.filter((p) => p.featured);
    const list = (featured.length ? featured : projects).slice(0, 3);
    renderEmptyOr(workTeaser, list, projectCardHtml, "Projects are on the way — check back soon.");
  }

  // Teaser: testimonials (first 2)
  const testimonialsTeaser = document.getElementById("homeTestimonialsTeaser");
  if (testimonialsTeaser) {
    const testimonials = await fetchCollection("testimonials", "order", "asc");
    renderEmptyOr(testimonialsTeaser, testimonials.slice(0, 2), testimonialCardHtml, "No testimonials yet.");
  }
}

function renderEmptyOr(container, list, renderFn, emptyText) {
  if (!list.length) {
    container.innerHTML = `<p class="empty-note">${emptyText}</p>`;
    return;
  }
  container.innerHTML = list.map(renderFn).join("");
}

/* -------------------------------------------------------------------------
   5. ABOUT PAGE
   ------------------------------------------------------------------------- */
async function loadAboutPage() {
  const introEl = document.getElementById("aboutIntro");
  if (!introEl) return; // not on this page

  const about = await fetchDoc("content", "about");
  if (about?.intro) introEl.textContent = about.intro;

  const factsList = document.getElementById("aboutFactsList");
  if (factsList) {
    const facts = await fetchCollection("aboutFacts", "order", "asc");
    if (!facts.length) {
      factsList.innerHTML = `<p class="empty-note">Add your quick facts from the admin panel.</p>`;
    } else {
      factsList.innerHTML = facts.map((f) => `
        <div class="about-fact"><dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(f.value)}</dd></div>`).join("");
    }
  }

  const timeline = document.getElementById("experienceTimeline");
  if (timeline) {
    const items = await fetchCollection("experience", "order", "asc");
    if (!items.length) {
      timeline.innerHTML = `<p class="empty-note">Add your work experience from the admin panel.</p>`;
    } else {
      timeline.innerHTML = items.map((x) => `
        <div class="timeline-item">
          <p class="timeline-date">${escapeHtml(x.startDate || "")} — ${escapeHtml(x.endDate || "Present")}</p>
          <h3>${escapeHtml(x.role)}</h3>
          <p>${escapeHtml(x.company || "")}</p>
          ${x.description ? `<p>${escapeHtml(x.description)}</p>` : ""}
        </div>`).join("");
    }
  }

  const skillsWrap = document.getElementById("skillsColumns");
  if (skillsWrap) {
    const skills = await fetchCollection("skills", "order", "asc");
    if (!skills.length) {
      skillsWrap.innerHTML = `<p class="empty-note">Add your skills from the admin panel.</p>`;
    } else {
      const groups = {};
      skills.forEach((s) => {
        const cat = s.category || "Skills";
        groups[cat] = groups[cat] || [];
        groups[cat].push(s.name);
      });
      skillsWrap.innerHTML = Object.entries(groups).map(([cat, names]) => `
        <div><h3>${escapeHtml(cat)}</h3><ul>${names.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul></div>`).join("");
    }
  }
}

/* -------------------------------------------------------------------------
   6. SERVICES PAGE
   ------------------------------------------------------------------------- */
async function loadServicesPage() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  const services = await fetchCollection("services", "order", "asc");
  renderEmptyOr(grid, services, (s) => `
    <div class="service-card">
      ${s.icon ? `<div class="service-icon">${escapeHtml(s.icon)}</div>` : ""}
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.description || "")}</p>
    </div>`, "Services will be listed here soon.");
}

/* -------------------------------------------------------------------------
   7. PRICING PAGE
   ------------------------------------------------------------------------- */
async function loadPricingPage() {
  const grid = document.getElementById("pricingGrid");
  if (!grid) return;
  const plans = await fetchCollection("pricing", "order", "asc");
  renderEmptyOr(grid, plans, (p) => `
    <div class="pricing-card ${p.highlighted ? "is-highlighted" : ""}">
      <h3>${escapeHtml(p.planName)}</h3>
      <p class="pricing-price">${escapeHtml(p.price || "")} ${p.billingNote ? `<span>${escapeHtml(p.billingNote)}</span>` : ""}</p>
      <ul class="pricing-features">
        ${(p.features || "").split("\n").filter(Boolean).map((f) => `<li>${escapeHtml(f)}</li>`).join("")}
      </ul>
      <a href="contact.html" class="btn btn--outline">Get started</a>
    </div>`, "Pricing plans will be listed here soon.");
}

/* -------------------------------------------------------------------------
   8. PORTFOLIO / WORK PAGE
   ------------------------------------------------------------------------- */
let allProjects = [];

function projectCardHtml(p) {
  return `
    <div class="plain-card portfolio-card">
      ${p.imageUrl ? `<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.title)}" loading="lazy" />` : ""}
      <div class="plain-card-body portfolio-card-body">
        ${p.featured ? `<span class="featured-badge">Featured</span>` : ""}
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description || "")}</p>
        <div class="portfolio-meta">
          ${(p.tags || "").split(",").map((t) => t.trim()).filter(Boolean).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        </div>
        ${p.liveLink ? `<a class="portfolio-link" href="${escapeHtml(p.liveLink)}" target="_blank" rel="noopener noreferrer">View live →</a>` : ""}
        ${p.driveLink ? `<br><a class="portfolio-link" href="${escapeHtml(p.driveLink)}" target="_blank" rel="noopener noreferrer">View files (Drive) →</a>` : ""}
      </div>
    </div>`;
}

async function loadPortfolioPage() {
  const grid = document.getElementById("portfolioGrid");
  const filterBar = document.getElementById("portfolioFilter");
  if (!grid) return;

  allProjects = (await fetchCollection("projects", "order", "asc")).filter((p) => p.published !== false);
  if (!allProjects.length) {
    grid.innerHTML = `<p class="empty-note">Projects are on the way — check back soon.</p>`;
    return;
  }

  const categories = ["All", ...new Set(allProjects.map((p) => p.category).filter(Boolean))];
  if (filterBar) {
    filterBar.innerHTML = "";
    categories.forEach((cat, i) => {
      const btn = document.createElement("button");
      btn.textContent = cat;
      if (i === 0) btn.classList.add("is-active");
      btn.addEventListener("click", () => {
        filterBar.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        renderProjects(cat);
      });
      filterBar.appendChild(btn);
    });
  }
  renderProjects("All");
}

function renderProjects(category) {
  const grid = document.getElementById("portfolioGrid");
  const list = category === "All" ? allProjects : allProjects.filter((p) => p.category === category);
  grid.innerHTML = list.map(projectCardHtml).join("");
}

/* -------------------------------------------------------------------------
   9. TESTIMONIALS PAGE
   ------------------------------------------------------------------------- */
function testimonialCardHtml(t) {
  return `
    <div class="testimonial-card">
      <p class="testimonial-stars">${starString(t.rating)}</p>
      <p class="testimonial-quote">"${escapeHtml(t.quote)}"</p>
      <p class="testimonial-name">${escapeHtml(t.name)}</p>
      <p class="testimonial-role">${escapeHtml(t.role || "")}</p>
    </div>`;
}

async function loadTestimonialsPage() {
  const grid = document.getElementById("testimonialsGrid");
  if (!grid) return;
  const testimonials = await fetchCollection("testimonials", "order", "asc");
  renderEmptyOr(grid, testimonials, testimonialCardHtml, "No testimonials yet.");
}

/* -------------------------------------------------------------------------
   10. BLOG LIST PAGE
   ------------------------------------------------------------------------- */
async function loadBlogListPage() {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;
  const posts = (await fetchCollection("posts", "date", "desc")).filter((p) => p.status !== "Draft");
  renderEmptyOr(grid, posts, (p) => `
    <a href="blog-post.html?slug=${encodeURIComponent(p.slug || p.id)}" class="plain-card blog-card">
      ${p.coverImageUrl ? `<img src="${escapeHtml(p.coverImageUrl)}" alt="${escapeHtml(p.title)}" loading="lazy" />` : ""}
      <div class="plain-card-body blog-card-body">
        <div class="blog-meta-row">
          ${p.category ? `<span class="tag tag--accent">${escapeHtml(p.category)}</span>` : ""}
          <span class="blog-date">${escapeHtml(p.date || "")}</span>
          ${p.readTime ? `<span class="blog-date">· ${escapeHtml(p.readTime)}</span>` : ""}
        </div>
        <h3>${escapeHtml(p.title)}</h3>
        <p class="blog-excerpt">${escapeHtml(p.excerpt || "")}</p>
      </div>
    </a>`, "No posts published yet — first one is coming soon.");
}

/* -------------------------------------------------------------------------
   11. BLOG SINGLE POST PAGE
   ------------------------------------------------------------------------- */
async function loadBlogPostPage() {
  const wrap = document.getElementById("postContent");
  if (!wrap) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  const posts = await fetchCollection("posts");
  const post = posts.find((p) => (p.slug || p.id) === slug && p.status !== "Draft");

  if (!post) {
    wrap.innerHTML = `<div class="post-not-found"><h1>Post not found</h1><p><a class="btn btn--outline" href="blog.html">Back to blog</a></p></div>`;
    return;
  }

  document.title = post.title + " — Blog";
  wrap.innerHTML = `
    <div class="page-header post-header">
      <div class="container">
        <div class="blog-meta-row">
          ${post.category ? `<span class="tag tag--accent">${escapeHtml(post.category)}</span>` : ""}
          <span class="blog-date">${escapeHtml(post.date || "")}</span>
          ${post.readTime ? `<span class="blog-date">· ${escapeHtml(post.readTime)}</span>` : ""}
        </div>
        <h1>${escapeHtml(post.title)}</h1>
      </div>
    </div>
    <div class="container">
      ${post.coverImageUrl ? `<img class="post-cover" src="${escapeHtml(post.coverImageUrl)}" alt="${escapeHtml(post.title)}" />` : ""}
      <div class="post-body">
        <p>${escapeHtml(post.body || "")}</p>
      </div>
      <div style="max-width:72ch; margin: var(--space-lg) auto 0;">
        ${(post.tags || "").split(",").map((t) => t.trim()).filter(Boolean).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
      </div>
    </div>`;
}

/* -------------------------------------------------------------------------
   12. SHOP PAGE
   ------------------------------------------------------------------------- */
async function loadShopPage() {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;
  const products = await fetchCollection("shop", "order", "asc");
  renderEmptyOr(grid, products, (p) => `
    <div class="plain-card shop-card">
      ${p.imageUrl ? `<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" loading="lazy" />` : ""}
      <div class="plain-card-body">
        ${p.category ? `<span class="tag">${escapeHtml(p.category)}</span>` : ""}
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description || "")}</p>
        ${p.price ? `<p class="shop-price">${escapeHtml(p.price)}</p>` : ""}
        ${p.orderLink ? `<a class="btn btn--primary btn--small" href="${escapeHtml(p.orderLink)}" target="_blank" rel="noopener noreferrer">Order now</a>` : ""}
      </div>
    </div>`, "Products will be listed here soon.");
}

/* -------------------------------------------------------------------------
   13. COURSES PAGE
   ------------------------------------------------------------------------- */
async function loadCoursesPage() {
  const grid = document.getElementById("coursesGrid");
  if (!grid) return;
  const courses = await fetchCollection("courses", "order", "asc");
  renderEmptyOr(grid, courses, (c) => `
    <div class="course-card">
      <h3>${escapeHtml(c.title)}</h3>
      <div class="course-meta">
        ${c.duration ? `<span>${escapeHtml(c.duration)}</span>` : ""}
      </div>
      <p>${escapeHtml(c.description || "")}</p>
      <ul class="course-curriculum">
        ${(c.curriculum || "").split("\n").filter(Boolean).map((l) => `<li>${escapeHtml(l)}</li>`).join("")}
      </ul>
      ${c.price ? `<p class="course-price">${escapeHtml(c.price)}</p>` : ""}
      ${c.enrollLink ? `<a class="btn btn--primary btn--small" href="${escapeHtml(c.enrollLink)}" target="_blank" rel="noopener noreferrer">Enroll</a>` : ""}
    </div>`, "Courses will be listed here soon.");
}

/* -------------------------------------------------------------------------
   14. FAQ
   ------------------------------------------------------------------------- */
async function loadFaq() {
  const list = document.getElementById("faqList");
  if (!list) return;
  const faqs = await fetchCollection("faq", "order", "asc");
  renderEmptyOr(list, faqs, (f) => `
    <details class="faq-item">
      <summary>${escapeHtml(f.question)}</summary>
      <p>${escapeHtml(f.answer)}</p>
    </details>`, "");
}

/* -------------------------------------------------------------------------
   15. CONTENT BLOCKS (Page Builder) — shared by built-in pages and custom pages
   ------------------------------------------------------------------------- */
function toEmbedUrl(url) {
  if (!url) return "";
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

function blockToHtml(b) {
  switch (b.type) {
    case "heading": {
      const level = b.level || "h2";
      return `<${level}>${escapeHtml(b.text)}</${level}>`;
    }
    case "paragraph":
      return `<p style="white-space:pre-line;">${escapeHtml(b.text)}</p>`;
    case "image":
      return `<figure class="block-figure">
        <img src="${escapeHtml(b.url)}" alt="${escapeHtml(b.alt || "")}" loading="lazy" />
        ${b.caption ? `<figcaption>${escapeHtml(b.caption)}</figcaption>` : ""}
      </figure>`;
    case "button":
      return `<p><a class="btn btn--${b.style || "primary"}" href="${escapeHtml(b.url)}">${escapeHtml(b.text)}</a></p>`;
    case "list": {
      const tag = b.style === "numbered" ? "ol" : "ul";
      const items = (b.items || "").split("\n").filter(Boolean).map((i) => `<li>${escapeHtml(i)}</li>`).join("");
      return `<${tag} class="block-list">${items}</${tag}>`;
    }
    case "quote":
      return `<blockquote class="block-quote"><p>${escapeHtml(b.text)}</p>${b.attribution ? `<cite>${escapeHtml(b.attribution)}</cite>` : ""}</blockquote>`;
    case "video":
      return `<div class="block-video"><iframe src="${escapeHtml(toEmbedUrl(b.url))}" allowfullscreen loading="lazy"></iframe></div>`;
    case "gallery": {
      const imgs = (b.images || "").split("\n").filter(Boolean).map((u) => `<img src="${escapeHtml(u)}" loading="lazy" />`).join("");
      return `<div class="block-gallery">${imgs}</div>`;
    }
    case "spacer":
      return `<div style="height:${Number(b.height) || 40}px"></div>`;
    case "html":
      return b.code || "";
    default:
      return "";
  }
}

async function renderBlocksInto(pageSlug, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const all = await fetchCollection("blocks");
  const blocks = all.filter((b) => b.pageSlug === pageSlug).sort((a, b) => (a.order || 0) - (b.order || 0));
  el.innerHTML = blocks.map(blockToHtml).join("");
}

async function loadCustomBlocksOnExistingPages() {
  const el = document.getElementById("customBlocks");
  if (!el) return;
  await renderBlocksInto(el.dataset.pageSlug, "customBlocks");
}

/* -------------------------------------------------------------------------
   16. CUSTOM PAGES (page.html?slug=...)
   ------------------------------------------------------------------------- */
async function loadCustomPage() {
  const wrap = document.getElementById("customPageContent");
  if (!wrap) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  const pages = await fetchCollection("pages");
  const page = pages.find((p) => p.slug === slug);

  if (!page) {
    wrap.innerHTML = `<div class="post-not-found"><h1>Page not found</h1><p><a class="btn btn--outline" href="index.html">Back to home</a></p></div>`;
    return;
  }

  document.title = page.title + " — Portfolio";
  wrap.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>${escapeHtml(page.title)}</h1>
        ${page.seoDescription ? `<p>${escapeHtml(page.seoDescription)}</p>` : ""}
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div id="customPageBlocks"></div>
      </div>
    </section>`;

  await renderBlocksInto(page.slug, "customPageBlocks");
}

/* -------------------------------------------------------------------------
   17. DYNAMIC NAVIGATION
   If "navLinks" has any entries, it fully replaces the default menu built
   into partials/header.html. Empty collection = default menu stays as-is.
   ------------------------------------------------------------------------- */
async function loadDynamicNav() {
  const navEl = document.getElementById("navLinks");
  if (!navEl) return;
  const links = await fetchCollection("navLinks", "order", "asc");
  if (!links.length) return;

  const current = window.location.pathname.split("/").pop() || "index.html";
  navEl.innerHTML = links.map(({ label, target }) => {
    const isCurrent = target === current || target === (current + window.location.search);
    return `<a href="${escapeHtml(target)}" class="${isCurrent ? "is-current" : ""}">${escapeHtml(label)}</a>`;
  }).join("");
}

/* -------------------------------------------------------------------------
   Run once the shared header/footer are in place
   ------------------------------------------------------------------------- */
document.addEventListener("layout:ready", async () => {
  const reveal = () => { document.body.style.visibility = "visible"; };
  const safetyTimer = setTimeout(reveal, 1200);

  await Promise.all([
    loadSiteSettings(),
    loadSocialLinks(),
    loadDynamicNav(),
    loadHomePage(),
    loadAboutPage(),
    loadServicesPage(),
    loadPricingPage(),
    loadPortfolioPage(),
    loadTestimonialsPage(),
    loadBlogListPage(),
    loadBlogPostPage(),
    loadShopPage(),
    loadCoursesPage(),
    loadFaq(),
    loadCustomBlocksOnExistingPages(),
    loadCustomPage()
  ]);

  clearTimeout(safetyTimer);
  reveal();
});
