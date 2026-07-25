import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Zoryn — Capacitor native shell.
 *
 * Two modes:
 * 1) Remote (recommended for fastest iteration): keep `server.url` pointing at
 *    your published Lovable app. The native shell just loads the hosted PWA.
 * 2) Bundled (offline-capable): comment out `server`, run `bun run build`,
 *    then `npx cap sync`. You'll need to configure a SPA-style build output.
 *
 * After editing, run locally on your machine:
 *   npx cap add ios      # once
 *   npx cap add android  # once
 *   npx cap sync
 *   npx cap open ios     # requires Xcode (macOS)
 *   npx cap open android # requires Android Studio
 */
const config: CapacitorConfig = {
  appId: "app.zoryn.wallet",
  appName: "Zoryn",
  webDir: "dist",
  server: {
    // Point at your published Lovable URL (update after first publish)
    url: "https://id-preview--3f2d333e-3b47-43d8-b144-ed0600c95954.lovable.app",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
  },
  android: {
    backgroundColor: "#0a0a12",
  },
};

export default config;
