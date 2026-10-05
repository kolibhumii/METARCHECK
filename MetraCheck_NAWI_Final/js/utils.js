export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

export function statusBadge(value) {
  const key = String(value).toLowerCase();
  const type = key.includes("pass") || key.includes("approv") || key.includes("verified") ? "success" : key.includes("fail") || key.includes("reject") || key.includes("flag") || key.includes("invalid") ? "danger" : key.includes("pending") || key.includes("await") || key.includes("return") ? "warning" : "neutral";
  return `<span class="status status-${type}">${escapeHtml(value)}</span>`;
}

export function toast(message) {
  const node = document.querySelector("#toast");
  if (!node) return;
  node.textContent = message;
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => { node.textContent = ""; }, 3200);
}

export function formatDate(date) { return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }