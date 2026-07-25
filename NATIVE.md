# Zoryn — Native Apps (iOS & Android)

Zoryn ships as a **PWA** (installable web app) and — via **Capacitor** — as
native iOS and Android shells that wrap the same web app.

## PWA (already live)

The web app is installable on any modern device:

- **iOS Safari** → Share → *Add to Home Screen*
- **Android Chrome** → Menu → *Install app*
- **Desktop Chrome/Edge** → install icon in the address bar

Manifest lives at `public/manifest.webmanifest`. Zoryn opens standalone with
the brand mark as its app icon.

## Native builds with Capacitor

Native builds cannot run inside the Lovable sandbox — Xcode and Android
Studio must run locally. Workflow:

### 1. Get the code locally

Export the repo to GitHub from Lovable, then clone it:

```bash
git clone <your-repo-url> zoryn
cd zoryn
bun install
```

### 2. Add native platforms (once)

```bash
npx cap add ios
npx cap add android
```

This creates `ios/` and `android/` folders. Commit them.

### 3. Sync web assets → native

Two modes in `capacitor.config.ts`:

- **Remote mode (default):** `server.url` points at your published Lovable
  URL. The native shell just loads the hosted app — every Lovable deploy
  updates the app instantly, no rebuild needed. Great for iteration.
- **Bundled mode:** comment out `server.url`, run `bun run build`, and the
  built assets in `dist/` (or `.output/public`) get bundled into the app for
  offline use. Adjust `webDir` accordingly.

After a config or web change:

```bash
npx cap sync
```

### 4. Open in the native IDE

```bash
npx cap open ios       # macOS + Xcode
npx cap open android   # Android Studio
```

From there: sign, build, and submit to App Store / Play Store as usual.

### App identity

- Bundle ID: `app.zoryn.wallet`
- Display name: `Zoryn`
- Change both in `capacitor.config.ts` if needed **before** `npx cap add`.

### Native features later

Add plugins as needed:

```bash
bun add @capacitor/push-notifications @capacitor/geolocation @capacitor/camera
npx cap sync
```

All Lovable Cloud auth, database, and server functions work unchanged
inside the native shell — it's the same web app, just wrapped.
