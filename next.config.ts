import { statSync } from "node:fs";
import type { NextConfig } from "next";

/**
 * Kairo's model is served gzipped, which drops Content-Length, so his loader couldn't show a percentage.
 * three.js falls back to X-File-Size (the uncompressed size, which is what it counts as it downloads).
 */
const KAIRO_MODEL = "/kairo/model/kairo.vrm";
const kairoModelSize = (() => {
  try { return String(statSync(`public${KAIRO_MODEL}`).size); } catch { return null; }
})();

const nextConfig: NextConfig = {
  async headers() {
    return kairoModelSize ? [{ source: KAIRO_MODEL, headers: [{ key: "X-File-Size", value: kairoModelSize }] }] : [];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
