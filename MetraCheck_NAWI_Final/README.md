# MetraCheck NAWI Assessment Prototype

MetraCheck demonstrates a role-based front-end workflow for Non-Automatic Weighing Instrument (NAWI) product registration, laboratory testing, review, report generation, and public report lookup.

## Run locally

Serve this folder with a local static web server, then open `http://localhost:8000`. For example, run `python3 -m http.server 8000` from this folder. ES modules, browser storage, and app installation do not work reliably from a `file://` URL. No package installation is required.

MetraCheck can be installed as a web app from a supported browser's install control. On iPhone or iPad, open the site in Safari and use Share > Add to Home Screen. The app shell is cached after the first visit for offline launches; demo records remain in browser storage and are not synchronized.

## Workspaces

- Laboratory / Testing Officer: tests, instrument registry, reports, report lookup, offline queue, and laboratory chat.
- Manufacturer / Industry: product registration, editing, image preview, verification status, and test history.
- Inspector / Legal Metrology Officer: inspection queue, inspection notes, reports, and audit timeline.
- Reviewer: report review, approval confirmation, return, and issue flagging.
- Administrator: demo users/roles, manufacturers, laboratories, product records, reports, and audit log.
- Public: report lookup without login at `pages/public/verify-report.html`.

## Project structure

```text
index.html
manifest.webmanifest  Installable app metadata
service-worker.js     App-shell caching for offline launches
assets/               App icon
css/                 Shared, login, legal, public, and workspace styles
js/                   Authentication demo, PWA install, navigation, state, validation, utilities
js/views/              Independent role and feature view modules
pages/laboratory/      Laboratory workspace entry point
pages/manufacturer/    Manufacturer workspace entry point
pages/inspector/       Inspector workspace entry point
pages/reviewer/        Reviewer workspace entry point
pages/admin/           Administrator workspace entry point
pages/public/          Unauthenticated verification page
```

## Prototype limitations

- Authentication, authorization, password reset, backend APIs, authority verification, and server-side audit trails are not implemented. Demo credentials are not validated or transmitted.
- Product, test, chat, profile, and audit changes are stored in browser `localStorage`; they are not official or backed up. Offline sync only updates local demo state.
- Test error is calculated as indicated value minus reference load. The configurable example threshold and resulting PASS/FAIL label are explicitly demonstrative and are not verified OIML R-76 or legal-metrology tolerances or procedures. No conformity decision is made.
- Verification IDs only search the local demo dataset. QR camera scanning depends on browser `BarcodeDetector` support and secure-context camera access; an ID can always be entered manually.
- Terms and privacy pages are sample templates, not an official government policy. They require review and replacement by the responsible organization before deployment.
- Demo records are fictional. Do not enter real personal, confidential, or regulated information.

## Applicable requirements

Before production, identify the instrument type, jurisdiction, applicable edition and national adoption of OIML R-76, legal-metrology procedures, approved pattern requirements, instrument-specific test conditions, and authorized decision roles. Have the competent authority validate those rules before representing any calculation or outcome as compliant.