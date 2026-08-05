import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const OFFICIAL_URL = "https://www.dirkmathesius.de";

/**
 * Setzt __DM_CANONICAL_URL__ in index.html — abgeleitet, nicht doppelt gepflegt.
 * (Eigenes Token statt %VITE_…%: die Prozent-Syntax gehoert Vites eigener
 *  Env-Ersetzung und bricht den Build bei einem Namen, den sie nicht kennt.)
 *
 * official (Dirks Seite) → eigene URL.
 * fanpage  (Subdomain)   → dirkmathesius.de, damit das Ranking bei Dirk buendelt.
 *
 * Muss mit der Laufzeit-Logik in src/pages/Index.tsx uebereinstimmen. Stuenden hier
 * und dort verschiedene Ziele, saehen Crawler ohne JS ein anderes Canonical als
 * Google nach dem Rendern — ein widerspruechliches Signal ist schlechter als keines.
 */
const canonicalPlugin = (mode: string): Plugin => ({
  name: "dm-canonical-url",
  enforce: "pre",
  transformIndexHtml(html) {
    const env = loadEnv(mode, process.cwd(), "");
    const siteUrl = (env.VITE_SITE_URL || "https://dirkmathesius.berlinjohn.de").replace(/\/$/, "");
    const variant = (env.VITE_SITE_VARIANT || "").toLowerCase();
    const isOfficial =
      variant === "official" ? true
      : variant === "fanpage" ? false
      : /(^|\.)dirkmathesius\.de$/.test(new URL(siteUrl).hostname);
    return html.replaceAll("__DM_CANONICAL_URL__", isOfficial ? siteUrl : OFFICIAL_URL);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), canonicalPlugin(mode)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
