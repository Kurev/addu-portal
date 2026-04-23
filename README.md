# Montes

**Framework:** Angular
**Module:** Authentication UI (Login & Forgot Password) + Alumni Dashboard + PWA

---

## Installation

A step-by-step guide to replicate this project and run it on a different computer.

### Prerequisites

Make sure the following are installed on your machine:

- [Node.js v18 or higher](https://nodejs.org) — required to run Angular
- [Git](https://git-scm.com) — required to clone the repository

### Steps

1. **Install Angular CLI globally**
   ```bash
   npm install -g @angular/cli
   ```

2. **Clone this repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

3. **Navigate into the project folder**
   ```bash
   cd YOUR_REPO_NAME
   ```

4. **Install project dependencies**
   ```bash
   npm install
   ```

5. **Run the development server**
   ```bash
   ng serve
   ```

6. **Open the app in your browser**
   ```
   http://localhost:4200
   ```

---

## PWA Setup (feature/pwa-ready branch)

### Branch
```bash
git checkout -b feature/pwa-ready
```

### Files Added / Modified

| File | Purpose |
|------|---------|
| `public/manifest.json` | Web App Manifest with AdDU branding, icons, shortcuts |
| `public/service-worker.js` | Custom Service Worker — Cache First for shell/images, Network First for data |
| `public/offline.html` | Offline fallback page shown when no cache & no network |
| `src/index.html` | Updated with `<link rel="manifest">`, PWA meta tags, SW registration script |
| `ngsw-config.json` | Angular's official SW config (asset groups + data groups) |

### Caching Strategies

```
App Shell  (HTML, CSS, JS)  →  Cache First   (cached on first visit, works offline)
Images                       →  Cache First   (with SVG placeholder fallback)
Fonts (Google Fonts)         →  Cache First   (cached on first visit)
API / dynamic data           →  Network First  (fresh data, falls back to cache)
Navigation (SPA routes)      →  Serve index.html from cache
```

### Build & Run for Production

The install prompt only appears on HTTPS or localhost with a **production build**:

```bash
# 1. Build for production
ng build --configuration production

# 2. Serve the browser folder
npx http-server dist/addu-alumni-portal/browser -p 8080
```

Then open `http://localhost:8080`

### Offline Stress Test
1. Open browser and visit every page at least once while **online**
   - Profile → My Impact → Projects → Donations
2. Open DevTools → **Application** tab → **Service Workers**
3. Check ✅ **Offline**
4. Press **Ctrl + R** to refresh
5. Everything — including images — still loads ✅

---

## AI Tools Used

- **Claude (Anthropic)** — used for generating Angular component code, CSS styling, PWA files, and README structure

---

## Master Prompt (PWA Conversion)

> "I am using Angular 17 with standalone components, SSR enabled, and no NgModules. My assets are served from the `public/` folder (configured in angular.json as `{ "glob": "**/*", "input": "public" }`). Convert my static Alumni Portal into a fully offline-ready Progressive Web Application. I need:
>
> (1) A valid `manifest.json` with AdDU university branding — navy `#1e3a5f` and blue `#2563eb` as theme colors, app name 'AdDU Alumni Portal', short name 'AdDU Alumni', standalone display mode, and app shortcuts for Profile and Donations.
>
> (2) A `service-worker.js` that only pre-caches `/` and `/index.html` on install (because Angular production builds use hashed filenames like `main-EQAD6OV4.js` that cannot be hardcoded), then automatically caches all other assets — JS, CSS, fonts, images — on first visit using fetch event handlers. Use Cache First strategy for the app shell and images, Network First for dynamic data, and return an SVG placeholder for offline images.
>
> (3) A polished `offline.html` fallback page matching the portal's dark navy `#0d1f3c` theme, with an auto-reload script that triggers when the connection is restored.
>
> (4) An updated `index.html` that registers the service worker, links the manifest, and includes all required PWA meta tags including Apple touch icons and theme-color.
>
> (5) An `ngsw-config.json` for Angular's built-in SW configuration with asset groups and data groups. Place `manifest.json`, `service-worker.js`, and `offline.html` inside the `public/` folder — not `src/` — because that is where this project's assets are configured to be served from."

---

## AI Hallucinations / Errors Fixed Manually

| # | Hallucination / Error | Manual Fix Applied |
|---|----------------------|-------------------|
| 1 | AI generated `app.module.ts` imports for `FormsModule` but the project uses standalone components | Moved `FormsModule` and `CommonModule` into the `imports` array inside the standalone `AppComponent` decorator |
| 2 | `main.server.ts` imported `App` from `./app/app` but the correct export name is `AppComponent` in `app.component.ts` | Changed import to `AppComponent` from `./app/app.component` |
| 3 | `main.ts` also referenced `App` instead of `AppComponent` | Same rename fix applied in `main.ts` |
| 4 | Service Worker `SHELL_ASSETS` list hardcoded bare filenames like `/main.js`, `/styles.css`, `/polyfills.js` — Angular production builds use hashed filenames (e.g. `main-EQAD6OV4.js`) so `cache.addAll()` failed with `TypeError: Request failed` | Removed all hashed filenames from `SHELL_ASSETS` — only kept `/` and `/index.html`. All other assets are now cached automatically on first visit via the fetch handler |
| 5 | AI placed `manifest.json`, `service-worker.js`, and `offline.html` inside `src/` and told me to add them to the `assets` array in `angular.json` — but this project uses `{ "glob": "**/*", "input": "public" }` which serves from `public/` not `src/` | Moved all 3 files into the `public/` folder instead |
| 6 | AI suggested using `node dist/addu-alumni-portal/server/server.mjs` to serve the app — but SSR blocks the Service Worker with a SSRF security error: `URL with hostname "localhost" is not allowed` | Switched to serving just the browser folder using `npx http-server dist/addu-alumni-portal/browser -p 8080` |
| 7 | `ngsw-config.json` had `$schema` pointing to `@angular/service-worker` which was not installed, causing a schema not found error | Removed the `$schema` line entirely — it is only used for VS Code autocomplete and does not affect runtime behavior |
| 8 | `ng build` failed with font budget error: `css-inline-fonts exceeded maximum budget. Budget 8.00 kB was not met by 14.33 kB` | Increased `anyComponentStyle` budget in `angular.json` from `8kB` error to `200kb`, and `initial` budget from `1MB` to `5mb` |
| 9 | Dashboard page did not spread full width — AI's initial CSS used `min-height: 100vh` without `width: 100vw` and forgot `min-width: 0` on the flex child `.dash-main` | Added `width: 100%`, `min-width: 0`, and `overflow-x: hidden` to fix the layout |
| 10 | Sidebar disappeared when scrolling — AI used `position: sticky` which only works relative to its scroll container | Changed to `position: fixed` with `z-index: 100` and added `margin-left: 240px` + `width: calc(100vw - 240px)` to `.dash-main` to compensate |

---

## Screenshots

### Login Page
![Login Page](public/login.png)

### Forgot Password Page
![Forgot Password Page](public/forgot.png)

### Dashboard – Profile
![Dashboard Profile](public/profile.png)

### Dashboard – My Impact
![Dashboard My Impact](public/impact.png)

### Dashboard – Projects
![Dashboard Projects](public/project.png)

### Dashboard – Donations
![Dashboard Donations](public/donation.png)