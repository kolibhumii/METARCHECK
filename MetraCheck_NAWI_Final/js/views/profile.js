import { getState } from "../data.js";
import { escapeHtml } from "../utils.js";

const roleToUser = { laboratory: 0, manufacturer: 0, inspector: 2, reviewer: 2, admin: 2 };

function roleProfile(role) {
  const source = getState().users[roleToUser[role]];
  const defaults = role === "manufacturer" ? { ...source, name: "WeighTech Industries", designation: "Manufacturer account", organization: "WeighTech Industries", employeeId: "MFR-DEMO-102", role: "Manufacturer / Industry", email: "compliance@weightech.example" }
    : role === "admin" ? { ...source, name: "Platform Administrator", designation: "System Administrator", organization: "MetraCheck Demo Office", employeeId: "ADM-DEMO-001", role: "Administrator", email: "admin@metracheck.example" }
      : role === "inspector" ? { ...source, designation: "Legal Metrology Officer", organization: "Legal Metrology Authority", employeeId: "LMA-INS-024", role: "Inspector / Legal Metrology Officer" }
        : source;
  return getState().profiles?.[role] || defaults;
}

export function profileView(role) {
  const user = roleProfile(role);
  const avatar = user.photo ? `<img class="avatar profile-photo" src="${escapeHtml(user.photo)}" alt="Profile photo">` : `<div class="avatar" aria-hidden="true">${escapeHtml(user.name.split(" ").map(name => name[0]).join("").slice(0, 2))}</div>`;
  return `<div class="page-toolbar"><div><p class="eyebrow">ACCOUNT SETTINGS</p><h2>Profile</h2><p class="muted">Personal and organization details for this demo account.</p></div><button class="button button-secondary" data-action="logout">Sign out</button></div>
  <section class="profile-header">${avatar}<div><h3>${escapeHtml(user.name)}</h3><p>${escapeHtml(user.designation)} · ${escapeHtml(user.organization)}</p><span class="status status-neutral">${escapeHtml(user.role)}</span></div><button class="button button-secondary" data-action="edit-profile">Edit profile</button></section>
  <form id="profileForm" class="profile-form hidden"><div class="form-grid"><label>Full name<input name="name" required value="${escapeHtml(user.name)}"></label><label>Designation<input name="designation" value="${escapeHtml(user.designation)}"></label><label>Email<input name="email" type="email" required value="${escapeHtml(user.email)}"></label><label>Phone<input name="phone" type="tel" value="${escapeHtml(user.phone)}"></label><label>Organization<input name="organization" value="${escapeHtml(user.organization)}"></label><label>Employee / registration ID<input name="employeeId" value="${escapeHtml(user.employeeId)}"></label></div><div class="form-actions"><button class="button button-primary" type="submit">Save changes</button><button class="button button-secondary" type="button" data-action="cancel-profile">Cancel</button></div></form>
  <div class="profile-columns"><section class="profile-section"><h3>Personal information</h3><dl class="profile-list"><div><dt>Full name</dt><dd>${escapeHtml(user.name)}</dd></div><div><dt>Designation</dt><dd>${escapeHtml(user.designation)}</dd></div><div><dt>Role</dt><dd>${escapeHtml(user.role)}</dd></div><div><dt>Employee / registration ID</dt><dd>${escapeHtml(user.employeeId)}</dd></div></dl></section>
  <section class="profile-section"><h3>Contact and organization</h3><dl class="profile-list"><div><dt>Email</dt><dd>${escapeHtml(user.email)}</dd></div><div><dt>Phone</dt><dd>${escapeHtml(user.phone)}</dd></div><div><dt>Organization</dt><dd>${escapeHtml(user.organization)}</dd></div></dl></section>
  <section class="profile-section"><h3>Security</h3><p class="muted">This prototype does not use real passwords or identity verification.</p><div class="profile-actions"><button class="button button-secondary" data-action="change-password">Change password</button><label class="check-label"><input type="checkbox" checked> <span>Email notifications</span></label><label class="file-field">Update profile photo<input type="file" accept="image/*" data-profile-photo></label></div></section></div>`;
}