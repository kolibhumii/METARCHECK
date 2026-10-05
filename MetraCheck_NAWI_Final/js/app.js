import { getState, saveState, addTest, addProduct, updateProduct, addAudit } from "./data.js";
import "./pwa.js";
import { requiredFields, validNumber } from "./validation.js";
import { escapeHtml, toast, statusBadge, formatDate } from "./utils.js";
import { roleLabels, shellMarkup, setActiveNavigation } from "./navigation.js";
import { dashboardView } from "./views/dashboard.js";
import { productsView, productForm } from "./views/products.js";
import { newTestView } from "./views/testing.js";
import { reportsView, reportDetail, verificationView } from "./views/reports.js";
import { inspectionsView, offlineView, chatView, adminView } from "./views/operations.js";
import { profileView } from "./views/profile.js";

const role = document.body.dataset.role || localStorage.getItem("metracheck-role") || "laboratory";
if (sessionStorage.getItem("metracheck-session") !== "demo") window.location.replace("../../index.html");
document.body.innerHTML = `<div id="appRoot">${shellMarkup(role)}</div>`;
let currentRoute = "dashboard";
let testStep = 1;
let currentChannel = "Testing";
let currentProductId = null;
let imageObjectUrl = "";
const filters = { query: "", status: "All", date: "", sort: "date-desc" };
const profileIndex = { laboratory: 0, manufacturer: 0, inspector: 2, reviewer: 2, admin: 2 };

function render(route = currentRoute) {
  currentRoute = route;
  setActiveNavigation(route);
  const main = document.querySelector("#mainContent");
  if (route === "dashboard") main.innerHTML = dashboardView(role);
  else if (["products", "add-product", "manufacturers", "laboratories"].includes(route)) main.innerHTML = productsView({ role, ...filters });
  else if (route === "new-test") {
    testStep = 1;
    main.innerHTML = newTestView();
    document.querySelector('[name="testDate"]').value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    updateTestStep();
  }
  else if (["reports", "test-history", "review-queue"].includes(route)) main.innerHTML = reportsView({ ...filters, review: route === "review-queue" });
  else if (route === "verification") main.innerHTML = verificationView();
  else if (route === "instruments") main.innerHTML = instrumentsView();
  else if (route === "inspections") main.innerHTML = inspectionsView();
  else if (route === "offline-sync") main.innerHTML = offlineView();
  else if (route === "lab-chat") main.innerHTML = chatView();
  else if (route === "profile") main.innerHTML = profileView(role);
  else if (["users", "audit-log"].includes(route)) main.innerHTML = adminView(route);
  else main.innerHTML = `<div class="empty-state">This workspace view is not available.</div>`;
}

function instrumentsView() {
  const tests = getState().tests;
  return `<div class="page-toolbar"><div><p class="eyebrow">LABORATORY REGISTER</p><h2>Instrument registry</h2><p class="muted">Instrument identifiers and latest prototype testing records.</p></div><button class="button button-primary" data-route="new-test">Register instrument</button></div><div class="filter-bar"><label class="search-field"><span class="sr-only">Search instruments</span><input type="search" data-filter="query" value="${escapeHtml(filters.query)}" placeholder="Search serial number or model"></label></div><div class="table-section"><div class="table-scroll"><table><thead><tr><th>Instrument model</th><th>Serial number</th><th>Manufacturer</th><th>Laboratory</th><th>Last test</th><th>Latest result</th><th>Report</th></tr></thead><tbody>${tests.filter(test => `${test.instrument} ${test.serial}`.toLowerCase().includes(filters.query.toLowerCase())).map(test => `<tr><td><b>${escapeHtml(test.instrument)}</b></td><td>${escapeHtml(test.serial)}</td><td>${escapeHtml(test.company)}</td><td>${escapeHtml(test.lab)}</td><td>${formatDate(test.date)}</td><td>${statusBadge(test.result)}</td><td><button class="table-action" data-action="view-report" data-id="${escapeHtml(test.id)}">View report</button></td></tr>`).join("")}</tbody></table></div></div>`;
}

function updateTestStep() {
  document.querySelectorAll("[data-step]").forEach(panel => panel.classList.toggle("active", Number(panel.dataset.step) === testStep));
  document.querySelectorAll("[data-step-marker]").forEach(marker => marker.classList.toggle("current", Number(marker.dataset.stepMarker) === testStep));
  document.querySelector('[data-action="test-back"]')?.classList.toggle("hidden", testStep === 1);
  document.querySelector('[data-action="test-next"]')?.classList.toggle("hidden", testStep === 5);
  document.querySelector('#testForm button[type="submit"]')?.classList.toggle("hidden", testStep !== 5);
  if (testStep === 5) updateTestSummary();
}

function updateTestSummary() {
  const form = document.querySelector("#testForm");
  if (!form) return;
  const values = new FormData(form);
  const readings = [...form.querySelectorAll("#readingRows tr")].map(row => {
    const reference = Number(row.querySelector('[name="reference"]').value);
    const indicated = Number(row.querySelector('[name="indicated"]').value);
    const error = indicated - reference;
    return `Point ${row.querySelector('[name="testPoint"]').value}: ${reference} / ${indicated} kg, error ${error.toFixed(4)} kg`;
  });
  const summary = [
    ["Manufacturer / model", `${values.get("company")} / ${values.get("instrument")}`], ["Serial number", values.get("serial")],
    ["Laboratory", values.get("lab")], ["Testing officer", values.get("tester")],
    ["Measurement readings", readings.join("; ")],
    ["Demo threshold", "Entered per-reading value; not an official tolerance"],
    ["Observations", values.get("observations") || "None recorded"]
  ];
  document.querySelector("#testSummary").innerHTML = summary.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
}

function validateStep() {
  const panel = document.querySelector(`[data-step="${testStep}"]`);
  const missing = [...panel.querySelectorAll("[required]")].find(field => !String(field.value).trim());
  const error = document.querySelector("#testError");
  if (missing) {
    missing.focus();
    missing.setAttribute("aria-invalid", "true");
    error.textContent = "Complete the required fields to continue.";
    return false;
  }
  error.textContent = "";
  if (testStep === 3) {
    const readings = [...panel.querySelectorAll('input[name="reference"]')].map((reference, index) => {
      const row = reference.closest("tr");
      const indicated = row.querySelector('[name="indicated"]');
      return [reference, indicated].every(field => validNumber(field.value));
    });
    if (readings.some(valid => !valid)) { error.textContent = "Enter valid numeric values for all readings."; return false; }
  }
  return true;
}

function readingCalculation(input) {
  const row = input.closest("tr");
  const reference = Number(row.querySelector('[name="reference"]').value);
  const indicated = Number(row.querySelector('[name="indicated"]').value);
  const tolerance = Number(row.querySelector('[name="tolerance"]').value);
  const error = indicated - reference;
  row.querySelector('[data-cell="error"]').textContent = Number.isFinite(error) ? error.toFixed(4) : "—";
  row.querySelector('[data-cell="result"]').innerHTML = statusBadge(Math.abs(error) <= Math.abs(tolerance) ? "PASS (demo)" : "FAIL (demo)");
}

function showModal(title, content, { narrow = false, footer = "" } = {}) {
  document.querySelector("#modalRoot").innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal-dialog${narrow ? " modal-narrow" : ""}" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><header class="modal-header"><h2 id="modalTitle">${escapeHtml(title)}</h2><button class="modal-close" aria-label="Close dialog" data-action="close-modal">×</button></header><div class="modal-body">${content}</div>${footer ? `<footer class="modal-footer">${footer}</footer>` : ""}</section></div>`;
  document.querySelector(".modal-close")?.focus();
}

function closeModal() { document.querySelector("#modalRoot").innerHTML = ""; if (imageObjectUrl) { URL.revokeObjectURL(imageObjectUrl); imageObjectUrl = ""; } }

function openProductForm(id = null) {
  currentProductId = id;
  const product = id ? getState().products.find(item => item.id === id) : role === "manufacturer" ? { company: "WeighTech Industries", registration: "MFR-DEMO-102" } : null;
  const body = productForm(product || {});
  showModal(product ? "Edit product" : "Product registration", body);
}

function saveProductForm(form) {
  if (!requiredFields(form)) { toast("Complete the required product fields."); return; }
  const values = new FormData(form);
  const previous = currentProductId ? getState().products.find(item => item.id === currentProductId) : null;
  const product = {
    id: previous?.id || `PR-${String(Date.now()).slice(-6)}`,
    company: role === "manufacturer" ? "WeighTech Industries" : values.get("company").trim(), registration: role === "manufacturer" ? "MFR-DEMO-102" : values.get("registration").trim(),
    name: values.get("model").trim() || values.get("productName").trim(), model: values.get("model").trim(),
    category: values.get("category"), capacity: values.get("capacity").trim(), min: values.get("min").trim(),
    division: values.get("division").trim(), cls: values.get("cls"), dimension: values.get("dimension").trim(),
    power: values.get("power").trim(), display: values.get("display").trim(), serialFormat: values.get("serialFormat").trim(),
    introduced: values.get("introduced"), status: "Pending verification", image: previous?.image || ""
  };
  const image = values.get("imageFile");
  if (image?.size) {
    const reader = new FileReader();
    reader.onload = () => { product.image = reader.result; persistProduct(product, previous); };
    reader.readAsDataURL(image);
  } else persistProduct(product, previous);
}

function persistProduct(product, previous) {
  if (previous) updateProduct(product); else addProduct(product);
  addAudit(`${previous ? "Updated" : "Created"} product ${product.name}; submitted for authority verification`);
  closeModal();
  toast("Product saved. Status: Pending Authority Verification.");
  render("products");
}

function viewProduct(id) {
  const product = getState().products.find(item => item.id === id);
  if (!product) return;
  showModal("Product details", `<dl class="report-details">${[["Manufacturer", product.company], ["Registration", product.registration], ["Model", product.name], ["Category", product.category], ["Capacity", product.capacity], ["Minimum capacity", product.min], ["Accuracy class", product.cls], ["Scale interval / e", product.division], ["Dimensions", product.dimension], ["Power", product.power], ["Display", product.display], ["Serial format", product.serialFormat], ["Status", product.status]].map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value || "Not recorded")}</dd></div>`).join("")}</dl>${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="image-preview">` : ""}`);
}

function viewReport(id) {
  const test = getState().tests.find(item => item.id === id);
  showModal("Digital test report", reportDetail(test), { footer: `<button class="button button-secondary" data-action="close-modal">Close</button><button class="button button-primary" data-action="print-report" data-id="${escapeHtml(id)}">Print / Save</button>` });
}

function navigate(route) {
  if (route === "add-product") { openProductForm(); return; }
  filters.query = "";
  filters.status = "All";
  filters.date = "";
  filters.sort = "date-desc";
  render(route);
  document.querySelector(".sidebar-open")?.classList.remove("sidebar-open");
  history.replaceState(null, "", `#${route}`);
}

function showConsent() {
  const accepted = localStorage.getItem("metracheck-consent-v1") === "accepted";
  if (accepted) return;
  showModal("Terms & Conditions and Privacy", `<div class="consent-dialog"><p>Before continuing, please review and accept the MetraCheck Terms &amp; Conditions and Privacy Policy.</p><div class="consent-links"><a href="../terms.html" target="_blank" rel="noopener">Terms &amp; Conditions</a><a href="../privacy.html" target="_blank" rel="noopener">Privacy Policy</a></div><p class="form-note">These are demonstration legal templates, not an official government policy. Do not enter personal or confidential data in this prototype.</p><label class="consent-check"><input type="checkbox" id="consentAccepted"><span>I have read and agree to the Terms &amp; Conditions and Privacy Policy.</span></label></div>`, { narrow: true, footer: `<button class="button button-secondary" data-action="logout">Review later / Sign out</button><button class="button button-primary" data-action="accept-consent">Accept &amp; continue</button>` });
}

function submitTest(form) {
  if (!requiredFields(form)) { toast("Complete the required test fields."); return; }
  const values = new FormData(form);
  if (!values.get("demoAcknowledged")) { document.querySelector("#testError").textContent = "Acknowledge the demo calculation limitation before submitting."; return; }
  const readings = [...form.querySelectorAll("#readingRows tr")].map(row => {
    const reference = Number(row.querySelector('[name="reference"]').value);
    const indicated = Number(row.querySelector('[name="indicated"]').value);
    const tolerance = Math.abs(Number(row.querySelector('[name="tolerance"]').value));
    const error = indicated - reference;
    return { point: Number(row.querySelector('[name="testPoint"]').value), reference, indicated, error: Number(error.toFixed(4)), tolerance, result: Math.abs(error) <= tolerance ? "PASS" : "FAIL" };
  });
  const dateValue = values.get("testDate");
  const date = dateValue ? dateValue.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const id = `NC-${date.slice(0, 4)}-${String(getState().tests.length + 1).padStart(3, "0")}`;
  const firstReading = readings[0];
  const test = { id, verificationId: `MCV-${Date.now().toString().slice(-5)}`, instrument: values.get("instrument"), company: values.get("company"), model: values.get("instrument"), serial: values.get("serial"), lab: values.get("lab"), tester: values.get("tester"), reviewer: "", result: readings.every(reading => reading.result === "PASS") ? "PASS" : "FAIL", review: "Awaiting review", date, reference: firstReading.reference, indicated: firstReading.indicated, error: firstReading.error, tolerance: firstReading.tolerance, readings, observations: values.get("observations") || "No observations recorded" };
  addTest(test);
  addAudit(`Generated prototype report ${id}`, values.get("tester"));
  toast(`Prototype report ${id} generated. Demo result: ${test.result}.`);
  render("reports");
}

function verifyRecord(id) {
  const normalized = id.trim().toUpperCase();
  const test = getState().tests.find(item => item.id.toUpperCase() === normalized || item.verificationId.toUpperCase() === normalized);
  const result = document.querySelector("#verificationResult");
  result.innerHTML = test ? `<section class="verification-record"><h3>${statusBadge("VERIFIED IN DEMO DATASET")}</h3><p>This is a local prototype match only; it does not prove authority authenticity.</p><div class="record-grid">${[["Report ID", test.id], ["Instrument", test.instrument], ["Manufacturer", test.company], ["Model", test.model], ["Serial number", test.serial], ["Laboratory", test.lab], ["Test date", formatDate(test.date)], ["Result", test.result], ["Review status", test.review], ["Last updated", test.date]].map(([key, value]) => `<div><small>${escapeHtml(key)}</small><b>${escapeHtml(value)}</b></div>`).join("")}</div></section>` : `<section class="verification-record invalid"><h3>${statusBadge("INVALID / NOT FOUND")}</h3><p>No matching verification ID was found in this browser's prototype dataset.</p></section>`;
}

function runReview(action, id) {
  const test = getState().tests.find(item => item.id === id);
  if (!test) return;
  if (action === "approve-report" && !window.confirm(`Approve report ${id}? This is a demo action and does not issue a certificate.`)) return;
  test.review = action === "approve-report" ? "Approved" : action === "return-report" ? "Returned" : "Flagged";
  test.reviewer = action === "approve-report" ? "M. Iyer" : test.reviewer;
  saveState();
  addAudit(`${test.review} report ${id}`, "M. Iyer");
  closeModal();
  toast(`Report ${id}: ${test.review} (demo).`);
  render(currentRoute);
}

function runInspectionDecision(action, id) {
  if (action === "approve-inspection" && !window.confirm(`Approve inspection ${id}? This is a demo action only.`)) return;
  addAudit(`${action.replace("-inspection", "")} inspection ${id}`, "Legal Metrology Officer");
  closeModal();
  toast(`Inspection ${id}: ${action.replace("-inspection", " ")} recorded in demo audit.`);
  render("inspections");
}

function addReading() {
  const tbody = document.querySelector("#readingRows");
  const index = tbody.rows.length + 1;
  const row = tbody.insertRow();
  row.innerHTML = `<td>${index}<input type="hidden" name="testPoint" value="${index}"></td><td><input aria-label="Reference load" name="reference" type="number" step="any" required></td><td><input aria-label="Indicated value" name="indicated" type="number" step="any" required></td><td data-cell="error">—</td><td><input aria-label="Demo permissible error" name="tolerance" type="number" step="any" value="1"></td><td data-cell="result">NOT CALCULATED</td>`;
}

function showReview(id) {
  const test = getState().tests.find(item => item.id === id);
  if (!test) return;
  showModal(`Review report ${id}`, `${reportDetail(test)}<div class="form-actions"><button class="button button-primary" data-action="approve-report" data-id="${escapeHtml(id)}">Approve report</button><button class="button button-secondary" data-action="return-report" data-id="${escapeHtml(id)}">Return for correction</button><button class="button button-danger" data-action="flag-report" data-id="${escapeHtml(id)}">Flag issue</button></div>`, { footer: `<button class="button button-secondary" data-action="close-modal">Close</button>` });
}

function updateChatChannel(channel) {
  currentChannel = channel;
  document.querySelector("#activeChannel").textContent = channel;
  document.querySelector("#chatMessage").placeholder = `Message #${channel}`;
  document.querySelectorAll(".chat-channels button").forEach(button => button.classList.toggle("active", button.dataset.channel === channel));
  const messages = getState().chat.filter(item => item.channel === channel);
  document.querySelector("#messageList").innerHTML = messages.map(message => `<article class="chat-message"><div class="message-meta"><b>${escapeHtml(message.sender)}</b><time>${escapeHtml(message.time)}</time></div><p>${escapeHtml(message.text)}</p></article>`).join("") || `<p class="empty-state">No messages in this channel.</p>`;
}

document.addEventListener("click", event => {
  const route = event.target.closest("[data-route]")?.dataset.route;
  if (route) { navigate(route); return; }
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "toggle-sidebar") document.body.classList.toggle(button.classList.contains("mobile-menu") ? "sidebar-open" : "sidebar-collapsed");
  if (action === "notifications") {
    const panel = document.querySelector("#notificationPanel");
    panel.classList.toggle("hidden");
    button.setAttribute("aria-expanded", String(!panel.classList.contains("hidden")));
  }
  if (action === "logout") { sessionStorage.removeItem("metracheck-session"); localStorage.removeItem("metracheck-role"); window.location.href = "../../index.html"; }
  if (action === "accept-consent") {
    if (!document.querySelector("#consentAccepted").checked) { toast("Please accept the terms and privacy template to continue."); return; }
    localStorage.setItem("metracheck-consent-v1", "accepted"); closeModal();
  }
  if (action === "add-product") openProductForm();
  if (action === "edit-product") openProductForm(id);
  if (action === "product-details") viewProduct(id);
  if (action === "product-history") { filters.query = getState().products.find(item => item.id === id)?.name || ""; navigate("test-history"); }
  if (action === "close-modal") closeModal();
  if (action === "backdrop-close" && event.target === button) closeModal();
  if (action === "view-report") viewReport(id);
  if (action === "print-report") { if (!document.querySelector("#modalRoot .report-document")) viewReport(id); setTimeout(() => window.print(), 60); }
  if (action === "print-page") window.print();
  if (action === "test-back" && testStep > 1) { testStep--; updateTestStep(); }
  if (action === "test-next") { if (validateStep()) { testStep++; updateTestStep(); document.querySelector(".test-form").scrollIntoView({ behavior: "smooth", block: "start" }); } }
  if (action === "add-reading") addReading();
  if (action === "review-report") showReview(id);
  if (["approve-report", "return-report", "flag-report"].includes(action)) runReview(action, id);
  if (action === "edit-profile") document.querySelector("#profileForm").classList.remove("hidden");
  if (action === "cancel-profile") document.querySelector("#profileForm").classList.add("hidden");
  if (action === "change-password") toast("Password changes require the production identity service.");
  if (action === "sync-now" || action === "retry-sync") {
    const offline = getState().offline;
    offline.synced += offline.pending;
    offline.pending = 0;
    offline.lastSync = new Date().toLocaleString();
    saveState();
    toast("Local demo queue marked as synced. No server upload occurred.");
    render("offline-sync");
  }
  if (action === "sync-log") toast("Sync details are shown in the local timeline below.");
  if (action === "inspection-review" || action === "inspection-note") {
    const decisions = action === "inspection-review" ? `<button class="button button-primary" data-action="approve-inspection" data-id="${escapeHtml(id)}">Approve</button><button class="button button-danger" data-action="reject-inspection" data-id="${escapeHtml(id)}">Reject</button><button class="button button-secondary" data-action="correct-inspection" data-id="${escapeHtml(id)}">Request correction</button>` : "";
    showModal(action === "inspection-review" ? `Inspection ${id}` : `Note for ${id}`, `<p>This inspection action is for the demo record only.</p><label class="inspection-note-label">Inspection note<textarea id="inspectionNote" rows="4" placeholder="Record observations or requested corrections"></textarea></label>`, { narrow: true, footer: `${decisions}<button class="button button-secondary" data-action="close-modal">Cancel</button><button class="button button-primary" data-action="save-inspection" data-id="${escapeHtml(id)}">Save note</button>` });
  }
  if (action === "save-inspection") { addAudit(`Inspection note recorded for ${id}`); closeModal(); toast("Inspection note added to local audit history."); }
  if (["approve-inspection", "reject-inspection", "correct-inspection"].includes(action)) runInspectionDecision(action, id);
  if (action === "add-user") showModal("Add user", `<form id="userForm" class="form-grid"><label>Full name<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Role<select name="role"><option>Laboratory / Testing Officer</option><option>Manufacturer / Industry</option><option>Inspector / Legal Metrology Officer</option><option>Reviewer</option><option>Administrator</option></select></label><label>Organization<input name="organization" required></label></form>`, { narrow: true, footer: `<button class="button button-secondary" data-action="close-modal">Cancel</button><button class="button button-primary" data-action="save-user">Add demo user</button>` });
  if (action === "save-user") {
    const form = document.querySelector("#userForm");
    if (!requiredFields(form)) { toast("Complete all user fields."); return; }
    const values = new FormData(form);
    getState().users.push({ name: values.get("name"), email: values.get("email"), phone: "Not provided", designation: "Demo user", organization: values.get("organization"), employeeId: "DEMO-PENDING", role: values.get("role") });
    saveState(); addAudit(`Created demo user ${values.get("email")}`); closeModal(); toast("Demo user added."); render("users");
  }
  if (action === "export-demo") toast("Export is not connected in this prototype.");
  if (action === "toggle-notifications") document.querySelector("#notificationPanel")?.classList.toggle("hidden");
  if (button.dataset.channel) updateChatChannel(button.dataset.channel);
});

document.addEventListener("input", event => {
  if (event.target.matches("[data-filter='query']")) {
    filters.query = event.target.value;
    const position = event.target.selectionStart;
    render(currentRoute);
    const search = document.querySelector("[data-filter='query']");
    search?.focus(); search?.setSelectionRange(position, position);
  }
  if (event.target.matches('#readingRows input[name="reference"], #readingRows input[name="indicated"], #readingRows input[name="tolerance"]')) readingCalculation(event.target);
  if (event.target.name === "reference" || event.target.name === "indicated" || event.target.name === "observations") if (testStep === 5) updateTestSummary();
});

document.addEventListener("change", event => {
  if (event.target.matches("[data-filter='status']")) { filters.status = event.target.value; render(currentRoute); }
  if (event.target.matches("[data-filter='date']")) { filters.date = event.target.value; render(currentRoute); }
  if (event.target.matches("[data-filter='sort']")) { filters.sort = event.target.value; render(currentRoute); }
  if (event.target.name === "company") {
    const selected = event.target.value;
    const instrument = document.querySelector('[name="instrument"]');
    if (instrument) instrument.value = "";
    document.querySelectorAll('[name="instrument"] option').forEach(option => {
      if (option.value) option.hidden = !getState().products.some(product => product.company === selected && product.name === option.value);
    });
  }
  if (event.target.name === "instrument") {
    const product = getState().products.find(item => item.name === event.target.value);
    const form = event.target.form;
    if (product && form) {
      form.elements.company.value = product.company;
      form.elements.capacity.value = product.capacity;
      form.elements.minCapacity.value = product.min;
      form.elements.interval.value = product.division;
    }
  }
  if (event.target.name === "imageFile" && event.target.files?.[0]) {
    if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
    imageObjectUrl = URL.createObjectURL(event.target.files[0]);
    const preview = document.querySelector(".image-preview");
    preview.src = imageObjectUrl;
    preview.classList.remove("hidden");
  }
  if (event.target.matches("[data-profile-photo]") && event.target.files?.[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      getState().profiles[role] = { ...(getState().profiles[role] || {}), photo: reader.result };
      saveState();
      toast("Profile photo updated in this browser.");
      render("profile");
    };
    reader.readAsDataURL(event.target.files[0]);
  }
});

document.addEventListener("submit", event => {
  event.preventDefault();
  if (event.target.id === "productForm") saveProductForm(event.target);
  if (event.target.id === "testForm") submitTest(event.target);
  if (event.target.id === "verifyForm") verifyRecord(new FormData(event.target).get("id"));
  if (event.target.id === "chatForm") {
    const values = new FormData(event.target);
    getState().chat.push({ channel: currentChannel, sender: role === "reviewer" ? "M. Iyer" : role === "manufacturer" ? "WeighTech" : "Anita Rao", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), text: values.get("message") });
    saveState(); event.target.reset(); updateChatChannel(currentChannel);
  }
  if (event.target.id === "profileForm") {
    if (!requiredFields(event.target)) { toast("Check the profile fields."); return; }
    const values = new FormData(event.target);
    const user = getState().users[profileIndex[role]];
    getState().profiles[role] = { ...(getState().profiles[role] || user), ...Object.fromEntries(values.entries()) };
    saveState(); addAudit("Updated profile details", getState().profiles[role].name); toast("Profile changes saved in this browser."); render("profile");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

render(location.hash.slice(1) || "dashboard");
showConsent();