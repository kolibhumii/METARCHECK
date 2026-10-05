import { getState } from "../data.js";
import { escapeHtml, statusBadge } from "../utils.js";

const roleNames = {
  laboratory: "Laboratory / Testing Officer",
  manufacturer: "Manufacturer / Industry",
  inspector: "Inspector / Legal Metrology Officer",
  reviewer: "Reviewer",
  admin: "Administrator"
};

export function dashboardView(role) {
  const data = getState();
  const tests = data.tests;
  const products = role === "manufacturer" ? data.products.filter(item => item.company === "WeighTech Industries") : data.products;
  const stats = role === "manufacturer" ? [
    ["My products", products.length, "registered models"], ["Verified products", products.filter(item => item.status === "Verified").length, "authority status"], ["Pending verification", products.filter(item => item.status !== "Verified").length, "in review"], ["Test reports", tests.length, "linked reports"]
  ] : role === "inspector" ? [
    ["Pending inspections", 4, "assigned to your office"], ["Reports to review", 7, "awaiting inspection"], ["Manufacturers", 18, "registered in demo"], ["Flagged cases", 2, "require attention"]
  ] : role === "reviewer" ? [
    ["Pending reviews", tests.filter(item => item.review.includes("Awaiting")).length, "in your queue"], ["Approved reports", 24, "this period"], ["Returned reports", 3, "awaiting correction"], ["Flagged results", tests.filter(item => item.review === "Flagged").length, "require attention"]
  ] : role === "admin" ? [
    ["Active users", 86, "demo registry"], ["Manufacturers", 18, "registered"], ["Laboratories", 12, "participating"], ["Pending verifications", products.filter(item => item.status !== "Verified").length, "products"]
  ] : [
    ["Total instruments", 48, "in laboratory registry"], ["Tests completed", tests.filter(item => item.result !== "PENDING").length, "assessment records"], ["Tests pending", tests.filter(item => item.result === "PENDING").length, "completion required"], ["Awaiting review", tests.filter(item => item.review.includes("Awaiting")).length, "reports in queue"], ["Reports generated", tests.length, "digital records"], ["Failed tests", tests.filter(item => item.result === "FAIL").length, "require disposition"]
  ];
  const action = role === "manufacturer" ? ["products", "Register a product"] : role === "laboratory" ? ["new-test", "Start a NAWI test"] : role === "reviewer" ? ["review-queue", "Open review queue"] : role === "inspector" ? ["inspections", "Review inspections"] : ["users", "Manage users"];
  const quick = role === "laboratory" ? [["new-test", "New NAWI test"], ["instruments", "Instrument registry"], ["reports", "View reports"], ["verification", "Verify a report"]] : role === "manufacturer" ? [["products", "My products"], ["add-product", "Add product"], ["test-history", "Test history"]] : role === "inspector" ? [["inspections", "Inspection queue"], ["reports", "Reports"], ["products", "Products"]] : role === "reviewer" ? [["review-queue", "Review queue"], ["reports", "Reports"], ["audit-log", "Audit trail"]] : [["users", "Users and roles"], ["manufacturers", "Manufacturers"], ["laboratories", "Laboratories"], ["audit-log", "Audit log"]];
  const recent = tests.slice(0, 4);
  return `<div class="welcome-line"><div><p class="eyebrow">${escapeHtml(roleNames[role])}</p><h2>Good morning, ${escapeHtml(role === "manufacturer" ? "WeighTech Industries" : role === "reviewer" ? "M. Iyer" : role === "admin" ? "Platform Administrator" : role === "inspector" ? "Legal Metrology Office" : "Anita Rao")}</h2><p class="muted">${role === "laboratory" ? "Your testing workspace and reports requiring action." : "Your role workspace and current items requiring attention."}</p></div><button class="button button-primary" data-route="${action[0]}">${action[1]}</button></div>
  <section class="stat-grid stat-grid-${stats.length}" aria-label="Workspace summary">${stats.map(([label, value, note]) => `<div class="stat-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></div>`).join("")}</section>
  <section class="workflow-strip" aria-label="Assessment workflow"><div class="section-heading"><div><h2>Assessment workflow</h2><p class="muted">Product registration through public report verification</p></div><span class="status status-neutral">Prototype process</span></div><ol class="workflow-steps"><li><span>01</span><b>Manufacturer</b><small>Register product</small></li><li><span>02</span><b>Authority</b><small>Verify product</small></li><li><span>03</span><b>Laboratory</b><small>Conduct tests</small></li><li><span>04</span><b>Reviewer</b><small>Review report</small></li><li><span>05</span><b>Public</b><small>Verify record</small></li></ol></section>
  <section class="dashboard-lower"><div class="table-section"><div class="section-heading"><div><h2>${role === "reviewer" ? "Reports awaiting review" : role === "inspector" ? "Inspection queue" : role === "manufacturer" ? "My products" : "Recent tests"}</h2><p class="muted">Recent activity across your workspace</p></div><button class="button button-secondary" data-route="${role === "manufacturer" ? "products" : role === "reviewer" ? "review-queue" : "reports"}">View all</button></div><div class="table-scroll"><table><thead><tr><th>Report ID</th><th>Instrument</th><th>Serial number</th><th>Test date</th><th>Result</th><th>Review status</th><th></th></tr></thead><tbody>${recent.map(test => `<tr><td><b>${escapeHtml(test.id)}</b></td><td>${escapeHtml(test.instrument)}</td><td>${escapeHtml(test.serial)}</td><td>${escapeHtml(test.date)}</td><td>${statusBadge(test.result)}</td><td>${statusBadge(test.review)}</td><td><button class="table-action" data-action="view-report" data-id="${escapeHtml(test.id)}">View</button></td></tr>`).join("")}</tbody></table></div></div>
  <aside class="attention-panel"><div class="section-heading"><div><h2>Needs attention</h2><p class="muted">Open work items</p></div></div>${data.notifications.slice(0, 3).map(item => `<div class="attention-item">${statusBadge(item.state)}<p>${escapeHtml(item.text)}</p><small>${escapeHtml(item.time)}</small></div>`).join("")}</aside></section>
  <section class="quick-links"><div class="section-heading"><div><h2>Quick access</h2></div></div><div class="quick-link-list">${quick.map(([route, label]) => `<button class="button button-secondary" data-route="${route}">${escapeHtml(label)} <span aria-hidden="true">→</span></button>`).join("")}</div></section>`;
}