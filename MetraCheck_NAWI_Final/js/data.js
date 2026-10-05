const seed = {
  profiles: {},
  products: [
    { id: "PR-001", company: "WeighTech Industries", registration: "MFR-DEMO-102", name: "WT-200", category: "Platform scale", capacity: "200 kg", min: "400 g", division: "20 g", cls: "III", status: "Verified", serialFormat: "WT200-####", dimension: "600 × 800 mm", power: "Mains / battery", display: "LCD", introduced: "2025-02-01", image: "" },
    { id: "PR-002", company: "Precision Scale Systems", registration: "MFR-DEMO-208", name: "PSS-50", category: "Bench scale", capacity: "50 kg", min: "200 g", division: "5 g", cls: "III", status: "Pending verification", serialFormat: "PSS50-####", dimension: "320 × 360 mm", power: "Mains", display: "LED", introduced: "2026-04-15", image: "" },
    { id: "PR-003", company: "Nova Instruments", registration: "MFR-DEMO-317", name: "NI-30", category: "Retail scale", capacity: "30 kg", min: "100 g", division: "2 g", cls: "III", status: "Verified", serialFormat: "NI30-####", dimension: "300 × 340 mm", power: "Rechargeable battery", display: "LCD", introduced: "2025-11-20", image: "" }
  ],
  tests: [
    { id: "NC-2026-001", verificationId: "MCV-26001", instrument: "WT-200", company: "WeighTech Industries", model: "WT-200", serial: "WT200-8831", lab: "Central Standards Laboratory", tester: "Anita Rao", reviewer: "", result: "PASS", review: "Awaiting review", date: "2026-09-26", reference: 100, indicated: 100, error: 0, tolerance: 1, observations: "Zero indication stable. Display legible." },
    { id: "NC-2026-002", verificationId: "MCV-26002", instrument: "PSS-50", company: "Precision Scale Systems", model: "PSS-50", serial: "PSS50-2290", lab: "Regional Metrology Laboratory", tester: "Rohan Sen", reviewer: "", result: "PENDING", review: "Awaiting review", date: "2026-09-25", reference: 25, indicated: 25.4, error: 0.4, tolerance: 0.5, observations: "Repeatability check required." },
    { id: "NC-2026-003", verificationId: "MCV-26003", instrument: "NI-30", company: "Nova Instruments", model: "NI-30", serial: "NI30-1442", lab: "Central Standards Laboratory", tester: "Anita Rao", reviewer: "M. Iyer", result: "FAIL", review: "Flagged", date: "2026-09-24", reference: 10, indicated: 11.4, error: 1.4, tolerance: 1, observations: "Indication exceeded prototype threshold." }
  ],
  users: [
    { name: "Anita Rao", email: "anita.rao@csl.example", phone: "+91 98765 41021", designation: "Testing Officer", organization: "Central Standards Laboratory", employeeId: "CSL-TO-014", role: "Laboratory / Testing Officer" },
    { name: "Rohan Sen", email: "rohan.sen@rml.example", phone: "+91 98765 41022", designation: "Testing Officer", organization: "Regional Metrology Laboratory", employeeId: "RML-TO-022", role: "Laboratory / Testing Officer" },
    { name: "M. Iyer", email: "m.iyer@authority.example", phone: "+91 98765 41023", designation: "Senior Reviewer", organization: "Legal Metrology Authority", employeeId: "LMA-RV-008", role: "Reviewer" }
  ],
  notifications: [
    { text: "WT-200 test report is awaiting review.", state: "warning", time: "10 min ago" },
    { text: "PSS-50 submitted for authority verification.", state: "neutral", time: "32 min ago" },
    { text: "Report NC-2026-001 was generated.", state: "success", time: "1 hr ago" },
    { text: "Offline records waiting to sync.", state: "warning", time: "Today" }
  ],
  activity: [
    { event: "WT-200 test report generated", status: "PASS", time: "10 min ago" },
    { event: "PSS-50 product submitted for verification", status: "Pending", time: "32 min ago" },
    { event: "NI-30 report flagged for review", status: "Flagged", time: "1 hr ago" }
  ],
  chat: [
    { channel: "Testing", sender: "Anita Rao", time: "09:42", text: "WT-200 test completed. Reading set is ready for review." },
    { channel: "Testing", sender: "Rohan Sen", time: "09:51", text: "I will check the repeatability notes before submission." },
    { channel: "Announcements", sender: "Lab Coordinator", time: "Yesterday", text: "Reference equipment certificates are due for review this month." }
  ],
  offline: { pending: 3, synced: 12, lastSync: "26 Sep 2026, 09:18" },
  audit: [
    { who: "Anita Rao", action: "Generated report NC-2026-001", when: "26 Sep 2026, 10:14" },
    { who: "M. Iyer", action: "Flagged report NC-2026-003", when: "26 Sep 2026, 09:32" },
    { who: "System demo", action: "Product PR-002 submitted for verification", when: "26 Sep 2026, 09:03" }
  ]
};

const storageKey = "metracheck-prototype-state-v2";
let state;
try {
  state = { ...seed, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
} catch {
  state = { ...seed };
}

export function getState() { return state; }
export function saveState() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Storage may be unavailable in private browsing. */ }
}
export function addTest(test) { state.tests.unshift(test); state.activity.unshift({ event: `${test.instrument} test report generated`, status: test.result, time: "Just now" }); saveState(); }
export function addProduct(product) { state.products.unshift(product); state.activity.unshift({ event: `${product.name} product submitted for verification`, status: "Pending", time: "Just now" }); saveState(); }
export function updateProduct(product) { state.products = state.products.map(item => item.id === product.id ? product : item); saveState(); }
export function addAudit(action, who = "Demo user") { state.audit.unshift({ who, action, when: new Date().toLocaleString() }); saveState(); }