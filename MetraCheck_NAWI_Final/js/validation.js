export function requiredFields(form) {
  const missing = [...form.querySelectorAll("[required]")].find(field => !String(field.value).trim());
  if (missing) {
    missing.focus();
    missing.setAttribute("aria-invalid", "true");
    return false;
  }
  form.querySelectorAll("[aria-invalid=true]").forEach(field => field.removeAttribute("aria-invalid"));
  return true;
}

export function validNumber(value) { return value !== "" && Number.isFinite(Number(value)); }