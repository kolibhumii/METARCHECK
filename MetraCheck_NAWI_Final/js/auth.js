import { toast } from "./utils.js";
import "./pwa.js";

const rolePages = {
  laboratory: "pages/laboratory/dashboard.html",
  manufacturer: "pages/manufacturer/dashboard.html",
  inspector: "pages/inspector/dashboard.html",
  reviewer: "pages/reviewer/dashboard.html",
  admin: "pages/admin/dashboard.html"
};

function enter(role) {
  localStorage.setItem("metracheck-role", role);
  sessionStorage.setItem("metracheck-session", "demo");
  window.location.href = rolePages[role] || rolePages.laboratory;
}

function guessedRole(email) {
  const value = email.toLowerCase();
  for (const role of Object.keys(rolePages)) if (value.includes(role)) return role;
  if (value.includes("manufacturer") || value.includes("industry")) return "manufacturer";
  if (value.includes("inspector") || value.includes("officer")) return "inspector";
  return "laboratory";
}

document.querySelector("#loginForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  const error = document.querySelector("#loginError");
  if (!email || !password) {
    error.textContent = "Enter an email or username and password to continue.";
    return;
  }
  error.textContent = "";
  if (form.elements.remember.checked) localStorage.setItem("metracheck-remembered-user", email);
  enter(guessedRole(email));
});

document.querySelector("#demoForm")?.addEventListener("submit", event => {
  event.preventDefault();
  enter(event.currentTarget.elements.role.value);
});

document.addEventListener("click", event => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "toggle-demo") document.querySelector("#demoForm")?.classList.toggle("hidden");
  if (action === "toggle-password") {
    const input = document.querySelector("#password");
    const button = event.target.closest("button");
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", visible ? "Hide password" : "Show password");
    button.title = visible ? "Hide password" : "Show password";
    button.innerHTML = visible ? `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a15.5 15.5 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8"/></svg>` : `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
  if (action === "forgot-password") toast("Password recovery is not connected in this prototype. Contact your administrator.");
});