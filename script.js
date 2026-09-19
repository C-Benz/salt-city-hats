const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navigationLinks = Array.from(siteNav?.querySelectorAll('a[href^="#"]') || []);
const hatRail = document.querySelector(".hat-rail");
const carouselButtons = document.querySelectorAll("[data-scroll-direction]");
const contactForm = document.querySelector("#contact-form");
const selectionGroups = ["color", "felt", "headSize"];
const mobileNavigation = window.matchMedia("(max-width: 1080px)");

function updateOrderSummary() {
  const summaries = {
    color: document.querySelector("[data-summary-color]"),
    felt: document.querySelector("[data-summary-felt]"),
    headSize: document.querySelector("[data-summary-size]"),
  };

  selectionGroups.forEach((name) => {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    if (selected instanceof HTMLInputElement && summaries[name]) {
      summaries[name].textContent = selected.value;
    }
  });
}

selectionGroups.forEach((name) => {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.addEventListener("change", updateOrderSummary);
  });
});

function setNavigationAvailability() {
  if (!siteNav) return;
  const isOpen = siteNav.classList.contains("site-nav--open");
  const shouldBeInactive = mobileNavigation.matches && !isOpen;
  siteNav.toggleAttribute("inert", shouldBeInactive);
  siteNav.setAttribute("aria-hidden", String(shouldBeInactive));
}

function closeMenu({ restoreFocus = false } = {}) {
  if (!menuButton || !siteNav) return;
  const wasOpen = siteNav.classList.contains("site-nav--open");
  menuButton.classList.remove("menu-toggle--open");
  siteNav.classList.remove("site-nav--open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("menu-open");
  setNavigationAvailability();
  if (restoreFocus && wasOpen) menuButton.focus();
}

menuButton?.addEventListener("click", () => {
  if (!siteNav) return;
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.classList.toggle("menu-toggle--open", !isOpen);
  siteNav.classList.toggle("site-nav--open", !isOpen);
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  document.body.classList.toggle("menu-open", !isOpen);
  setNavigationAvailability();
  if (!isOpen) siteNav.querySelector("a")?.focus();
});

siteNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu({ restoreFocus: true });
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Node) || !siteNav || !menuButton) return;
  if (!siteNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});

mobileNavigation.addEventListener("change", closeMenu);
setNavigationAvailability();

function setActiveNavigation(sectionId) {
  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

const navigationTargets = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter((target) => target instanceof HTMLElement);
let navigationFrame;

function updateActiveNavigation() {
  const marker = window.scrollY + window.innerHeight * 0.35;
  const activeSection = navigationTargets.reduce(
    (active, target) => (target.offsetTop <= marker ? target : active),
    null,
  );
  setActiveNavigation(activeSection?.id || "");
}

function queueNavigationUpdate() {
  if (navigationFrame) return;
  navigationFrame = requestAnimationFrame(() => {
    navigationFrame = null;
    updateActiveNavigation();
  });
}

window.addEventListener("scroll", queueNavigationUpdate, { passive: true });
window.addEventListener("resize", queueNavigationUpdate);
updateActiveNavigation();

function updateCarouselControls() {
  if (!hatRail) return;
  const maxScroll = Math.max(0, hatRail.scrollWidth - hatRail.clientWidth);
  carouselButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    const direction = Number(button.dataset.scrollDirection);
    button.disabled = direction < 0 ? hatRail.scrollLeft <= 1 : hatRail.scrollLeft >= maxScroll - 1;
  });
}

carouselButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!hatRail || !(button instanceof HTMLElement)) return;
    const direction = Number(button.dataset.scrollDirection);
    hatRail.scrollBy({ left: direction * hatRail.clientWidth * 0.72, behavior: "smooth" });
  });
});

hatRail?.addEventListener("scroll", updateCarouselControls, { passive: true });
window.addEventListener("resize", updateCarouselControls);
updateCarouselControls();

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!(contactForm instanceof HTMLFormElement)) return;

  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const message = String(data.get("message") || "").trim();
  const color = String(data.get("color") || "Not selected");
  const felt = String(data.get("felt") || "Not selected");
  const headSize = String(data.get("headSize") || "Not selected");
  const body = [
    "CUSTOM HAT REQUEST",
    `Color: ${color}`,
    `Felt: ${felt}`,
    `Head size: ${headSize}`,
    "",
    `Name: ${name}`,
    `Contact: ${contact}`,
    `Notes: ${message}`,
  ].join("\n");

  window.location.href = `sms:+18019990655?body=${encodeURIComponent(body)}`;
});
