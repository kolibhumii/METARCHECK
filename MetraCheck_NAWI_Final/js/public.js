import { getState } from "./data.js";
import "./pwa.js";
import { escapeHtml, formatDate, statusBadge } from "./utils.js";

const form = document.querySelector("#publicVerifyForm");
const input = document.querySelector("#publicVerificationId");
const result = document.querySelector("#publicResult");
const scanStatus = document.querySelector("#scanStatus");
const video = document.querySelector("#qrVideo");
let cameraStream;
let scannerFrame;

function verify(value) {
  if (!result) return;
  const rawValue = String(value ?? "").trim();
  if (!rawValue) {
    result.innerHTML = `<section class="verification-record invalid"><h2>${statusBadge("INVALID / NOT FOUND")}</h2><p>Enter a verification ID to search the local prototype dataset.</p></section>`;
    return;
  }
  const id = rawValue.toUpperCase();
  const test = getState().tests.find(item => item.id.toUpperCase() === id || item.verificationId.toUpperCase() === id);
  result.innerHTML = test ? `<section class="verification-record"><h2>${statusBadge("VERIFIED IN DEMO DATASET")}</h2><p>This local match does not independently verify authority authenticity.</p><div class="record-grid">${[["Report ID", test.id], ["Instrument", test.instrument], ["Manufacturer", test.company], ["Model", test.model], ["Serial number", test.serial], ["Laboratory", test.lab], ["Test date", formatDate(test.date)], ["Result", test.result], ["Verification status", test.review], ["Last updated", test.date]].map(([key, item]) => `<div><small>${escapeHtml(key)}</small><b>${escapeHtml(item)}</b></div>`).join("")}</div></section>` : `<section class="verification-record invalid"><h2>${statusBadge("INVALID / NOT FOUND")}</h2><p>No matching record was found in the local prototype data.</p><p class="muted">Expired and revoked status cannot be established by this prototype.</p></section>`;
}

if (form && input && result) {
  form.addEventListener("submit", event => { event.preventDefault(); verify(input.value); });
}

async function scanFrame() {
  if (!cameraStream || video.readyState < 2) return;
  try {
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    const codes = await detector.detect(video);
    if (codes.length) {
      const value = codes[0].rawValue;
      const match = value.match(/(?:MCV-\w+|NC-\d{4}-\d+)/i);
      input.value = match?.[0] || value;
      verify(input.value);
      stopScanner();
      scanStatus.textContent = "QR code scanned.";
      return;
    }
  } catch {
    scanStatus.textContent = "QR scanning is not supported by this browser.";
    stopScanner();
    return;
  }
  scannerFrame = requestAnimationFrame(scanFrame);
}

function stopScanner() {
  if (scannerFrame) cancelAnimationFrame(scannerFrame);
  cameraStream?.getTracks().forEach(track => track.stop());
  cameraStream = null;
  video.classList.add("hidden");
}

const scanButton = document.querySelector("#scanButton");
if (scanButton) {
  scanButton.addEventListener("click", async () => {
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) {
      if (scanStatus) scanStatus.textContent = "Camera QR scanning is unavailable in this browser. Enter the verification ID instead.";
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (video) {
        video.srcObject = cameraStream;
        video.classList.remove("hidden");
        await video.play();
      }
      if (scanStatus) scanStatus.textContent = "Camera active. Hold the report QR code within view.";
      scanFrame();
    } catch {
      if (scanStatus) scanStatus.textContent = "Camera access was not available. Enter the verification ID instead.";
      stopScanner();
    }
  });
}

window.addEventListener("pagehide", stopScanner);