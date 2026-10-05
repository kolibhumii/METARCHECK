const appRoot = new URL("../", import.meta.url);
const manifestLink = document.createElement("link");
manifestLink.rel = "manifest";
manifestLink.href = new URL("manifest.webmanifest", appRoot);
document.head.append(manifestLink);

const appleIconLink = document.createElement("link");
appleIconLink.rel = "apple-touch-icon";
appleIconLink.href = new URL("assets/metracheck-icon-192.png", appRoot);
document.head.append(appleIconLink);

const appleAppMeta = document.createElement("meta");
appleAppMeta.name = "apple-mobile-web-app-capable";
appleAppMeta.content = "yes";
document.head.append(appleAppMeta);

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register(new URL("service-worker.js", appRoot), { scope: appRoot.pathname }).catch(() => {});
}

function addInstallActions() {
  const containers = [document.querySelector(".login-form-wrap"), document.querySelector(".topbar-actions")];
  for (const container of containers) {
    if (!container || container.querySelector(".install-app-button")) continue;
    const button = document.createElement("button");
    button.className = "button button-secondary install-app-button";
    button.type = "button";
    button.textContent = "Install app";
    button.hidden = true;
    container.append(button);
  }
  return containers.some(container => container?.querySelector(".install-app-button"));
}

if (!addInstallActions()) {
  const shellObserver = new MutationObserver(() => {
    if (addInstallActions()) shellObserver.disconnect();
  });
  shellObserver.observe(document.documentElement, { childList: true, subtree: true });
}

let installPrompt;
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  document.querySelectorAll(".install-app-button").forEach(button => { button.hidden = false; });
});

document.addEventListener("click", async event => {
  const button = event.target.closest(".install-app-button");
  if (!button || !installPrompt) return;
  const prompt = installPrompt;
  installPrompt = null;
  await prompt.prompt();
  await prompt.userChoice;
  document.querySelectorAll(".install-app-button").forEach(item => { item.hidden = true; });
});

window.addEventListener("appinstalled", () => {
  installPrompt = null;
  document.querySelectorAll(".install-app-button").forEach(button => { button.hidden = true; });
});