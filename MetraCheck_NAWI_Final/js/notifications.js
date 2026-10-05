import { getState } from "./data.js";
import { escapeHtml, statusBadge } from "./utils.js";

export function notificationMarkup() {
  const items = getState().notifications;
  return `<div class="notification-wrap"><button class="icon-button notification-trigger" type="button" aria-label="Notifications" aria-expanded="false" data-action="notifications"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><span class="notification-count">${items.length}</span></button><div class="notification-panel hidden" id="notificationPanel"><h2>Notifications</h2>${items.map(item => `<div class="notification-item">${statusBadge(item.state)}<p>${escapeHtml(item.text)}</p><small>${escapeHtml(item.time)}</small></div>`).join("")}</div></div>`;
}