import { notificationMarkup } from "./notifications.js";

export const roleLabels = {
  laboratory: "Laboratory / Testing Officer",
  manufacturer: "Manufacturer / Industry",
  inspector: "Inspector / Legal Metrology Officer",
  reviewer: "Reviewer",
  admin: "Administrator"
};

const menus = {
  laboratory: [["dashboard", "Overview"], ["new-test", "New NAWI test"], ["instruments", "Instruments"], ["reports", "Reports"], ["verification", "Verify report"], ["offline-sync", "Offline sync"], ["lab-chat", "Lab channels"]],
  manufacturer: [["dashboard", "Overview"], ["products", "My products"], ["add-product", "Register product"], ["test-history", "Test history"]],
  inspector: [["dashboard", "Overview"], ["inspections", "Inspection queue"], ["reports", "Reports"], ["products", "Products"]],
  reviewer: [["dashboard", "Overview"], ["review-queue", "Review queue"], ["reports", "Reports"], ["audit-log", "Audit trail"]],
  admin: [["dashboard", "Overview"], ["users", "Users and roles"], ["manufacturers", "Manufacturers"], ["laboratories", "Laboratories"], ["products", "Products"], ["reports", "Reports"], ["audit-log", "Audit log"]]
};

export function routeLabel(route) {
  const titles = { dashboard: "Workspace overview", "new-test": "New NAWI test", instruments: "Instrument registry", reports: "Reports and test history", verification: "Public report verification", "offline-sync": "Offline sync", "lab-chat": "Laboratory group chat", products: "Product registry", "add-product": "Register product", "test-history": "Test history", inspections: "Inspection queue", "review-queue": "Report review queue", "audit-log": "Audit trail", users: "Users and roles", manufacturers: "Manufacturers", laboratories: "Laboratories", profile: "Profile" };
  return titles[route] || "Workspace";
}

export function shellMarkup(role, active = "dashboard") {
  const links = menus[role] || menus.laboratory;
  return `<div class="app-shell"><aside class="sidebar" id="sidebar"><a href="../../index.html" class="wordmark" aria-label="MetraCheck home"><span class="wordmark-mark">M</span><span class="brand-name">MetraCheck</span></a><p class="sidebar-role">${roleLabels[role]}</p><button class="sidebar-toggle" type="button" data-action="toggle-sidebar" aria-label="Collapse navigation" title="Collapse navigation"><span aria-hidden="true">‹</span></button><nav class="side-nav" aria-label="Main navigation">${links.map(([route, label]) => `<button type="button" class="nav-link${active === route ? " active" : ""}" data-route="${route}"><span class="nav-mark" aria-hidden="true">${label.slice(0, 1)}</span><span>${label}</span></button>`).join("")}</nav><div class="sidebar-footer"><div class="sidebar-user"><span class="avatar avatar-small">${role === "manufacturer" ? "WI" : role === "reviewer" ? "MI" : role === "admin" ? "AD" : role === "inspector" ? "LM" : "AR"}</span><span><b>${role === "manufacturer" ? "WeighTech" : role === "reviewer" ? "M. Iyer" : role === "admin" ? "Administrator" : role === "inspector" ? "LM Officer" : "Anita Rao"}</b><small>${roleLabels[role]}</small></span></div><button class="nav-link profile-link" data-route="profile"><span class="nav-mark" aria-hidden="true">P</span><span>Profile</span></button><button class="nav-link signout-link" data-action="logout"><span class="nav-mark" aria-hidden="true">↪</span><span>Sign out</span></button></div></aside><div class="workspace"><header class="topbar"><div class="topbar-title"><button class="mobile-menu" data-action="toggle-sidebar" aria-label="Open navigation">☰</button><div><p class="breadcrumb">MetraCheck <span aria-hidden="true">/</span> ${routeLabel(active)}</p><h1 id="pageTitle">${routeLabel(active)}</h1></div></div><div class="topbar-actions">${notificationMarkup()}<a class="help-link" href="../../README.txt" aria-label="Open prototype information">Help</a><button class="profile-trigger" data-route="profile"><span class="avatar avatar-small">${role === "manufacturer" ? "WI" : role === "reviewer" ? "MI" : "AR"}</span><span>${role === "manufacturer" ? "WeighTech" : role === "reviewer" ? "M. Iyer" : "Anita Rao"}</span><span aria-hidden="true">⌄</span></button></div></header><main id="mainContent" class="main-content" tabindex="-1"></main><footer class="workspace-footer"><span>MetraCheck prototype · Demo data</span><span>Calculations and verification are not authority validated.</span><a href="../public/verify-report.html">Public verification</a></footer></div><div id="modalRoot"></div><div id="toast" class="toast" role="status" aria-live="polite"></div></div>`;
}

export function setActiveNavigation(route) {
  document.querySelectorAll(".nav-link[data-route]").forEach(link => link.classList.toggle("active", link.dataset.route === route));
  document.querySelector("#pageTitle").textContent = routeLabel(route);
  document.querySelector(".breadcrumb").innerHTML = `MetraCheck <span aria-hidden="true">/</span> ${routeLabel(route)}`;
  document.querySelector("#mainContent").focus({ preventScroll: true });
}