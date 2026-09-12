/* =========================================================================
   COMMON LAYOUT LOADER
   -------------------------------------------------------------------------
   Every page includes this file. It:
   1. Fetches partials/header.html and partials/footer.html and drops them
      into the <div id="site-header"></div> / <div id="site-footer"></div>
      placeholders that every page has near the top/bottom of <body>.
   2. Highlights the current page's link in the nav menu.
   3. Wires up the mobile menu button and the "shrink on scroll" header line.
   4. Fires a "layout:ready" event on document once done, so other scripts
      (content-loader.js) know it's safe to fill in header/footer text.
   ========================================================================= */

async function loadPartial(url, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  try {
    const res = await fetch(url);
    mount.innerHTML = await res.text();
  } catch (e) {
    console.error(`Could not load ${url}:`, e);
  }
}

async function initLayout() {
  await Promise.all([
    loadPartial("partials/header.html", "site-header"),
    loadPartial("partials/footer.html", "site-footer")
  ]);

  // Highlight current page in nav
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#navLinks a[data-nav]").forEach((link) => {
    if (link.dataset.nav === current) link.classList.add("is-current");
  });

  // Mobile nav toggle
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Header border on scroll
  const header = document.getElementById("siteHeader");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    });
  }

  // Footer year
  const footerYear = document.getElementById("footerYear");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // Let the rest of the page know header/footer are ready to be filled in
  document.dispatchEvent(new Event("layout:ready"));
}

initLayout();
