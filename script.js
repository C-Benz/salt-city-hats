const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navigationLinks = Array.from(siteNav?.querySelectorAll('a[href^="#"]') || []);
const hatRail = document.querySelector(".hat-rail");
const carouselButtons = document.querySelectorAll("[data-scroll-direction]");
const contactForm = document.querySelector("#contact-form");
const selectionGroups = ["felt", "color", "headSize"];
const feltInputs = document.querySelectorAll('input[name="felt"]');
const colorCards = Array.from(document.querySelectorAll(".hat-card[data-palettes]"));
const colorContext = document.querySelector("[data-color-context]");
const mobileNavigation = window.matchMedia("(max-width: 1080px)");

// Color is the visual first step, followed by felt compatibility.
const colorsSection = document.querySelector(".colors");
const materialsSection = document.querySelector(".materials");
if (colorsSection && materialsSection) materialsSection.before(colorsSection);

const colorDisplayOrder = [
  "Salt", "Sand", "Bone", "Fossil",
  "Wheat", "Mesa", "Coffee", "Canyon",
  "Juniper", "Pine", "Slate", "Black",
];

if (hatRail) {
  colorDisplayOrder.forEach((color, index) => {
    const card = colorCards.find((candidate) => candidate.querySelector('input[name="color"]')?.value === color);
    if (!card) return;
    const number = card.querySelector(".hat-card__number");
    if (number) number.textContent = String(index + 1).padStart(2, "0");
    hatRail.append(card);
  });
}

function addMaterialAvailability() {
  colorCards.forEach((card) => {
    const palettes = card.dataset.palettes?.split(" ") || [];
    const materials = [];
    if (palettes.includes("wool")) materials.push(["sheep", "Wool"]);
    if (palettes.includes("fur")) materials.push(["rabbit", "Rabbit"], ["beaver", "Beaver"]);

    const availability = document.createElement("span");
    availability.className = "hat-card__materials";
    availability.setAttribute("role", "img");
    availability.setAttribute("aria-label", `Available in ${materials.map(([, label]) => label).join(", ")}`);
    availability.innerHTML = materials
      .map(([icon, label]) => `<span title="${label}"><svg aria-hidden="true"><use href="#icon-${icon}"></use></svg></span>`)
      .join("");
    card.append(availability);
  });
}

function updateOrderSummary() {
  const summaries = {
    color: document.querySelector("[data-summary-color]"),
    felt: document.querySelector("[data-summary-felt]"),
    headSize: document.querySelector("[data-summary-size]"),
  };
  const placeholders = {
    felt: "Choose a felt",
    color: "Choose a color",
    headSize: "Choose a size",
  };

  selectionGroups.forEach((name) => {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    if (summaries[name]) summaries[name].textContent = selected instanceof HTMLInputElement ? selected.value : placeholders[name];
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

function updateFeltAvailability() {
  const selectedColor = document.querySelector('input[name="color"]:checked');
  const selectedCard = selectedColor instanceof HTMLInputElement ? selectedColor.closest(".hat-card") : null;
  const palettes = selectedCard?.dataset.palettes?.split(" ") || [];

  feltInputs.forEach((input) => {
    if (!(input instanceof HTMLInputElement)) return;
    const material = input.closest(".material");
    const unavailable = palettes.length > 0 && !palettes.includes(input.dataset.colorPalette || "");
    input.disabled = unavailable;
    material?.classList.toggle("material--unavailable", unavailable);
    material?.setAttribute("aria-disabled", String(unavailable));

    if (unavailable && input.checked) input.checked = false;
  });

  if (colorContext) {
    colorContext.textContent = selectedColor instanceof HTMLInputElement
      ? `${selectedColor.value} selected. Compatible felts are available in Step 02. Click this color again to clear your choice.`
      : "Choose a color to see which felts are available. Click it again to clear your choice.";
  }

  updateOrderSummary();
}

colorCards.forEach((card) => {
  const input = card.querySelector('input[name="color"]');
  card.hidden = false;
  card.setAttribute("aria-disabled", "false");
  if (!(input instanceof HTMLInputElement)) return;

  let wasChecked = false;
  card.addEventListener("pointerdown", () => {
    wasChecked = input.checked;
  });
  card.addEventListener("click", (event) => {
    if (!wasChecked) return;
    event.preventDefault();
    input.checked = false;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    wasChecked = false;
  });
  input.addEventListener("keydown", (event) => {
    if ((event.key === " " || event.key === "Enter") && input.checked) {
      event.preventDefault();
      input.checked = false;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  input.addEventListener("change", updateFeltAvailability);
});

addMaterialAvailability();
updateFeltAvailability();

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
