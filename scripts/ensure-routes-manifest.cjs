/**
 * Ensures .next/routes-manifest.json has fields `next start` expects.
 * Turbopack `next dev` can overwrite a production .next and drop `dataRoutes`,
 * which then crashes with: TypeError: routesManifest.dataRoutes is not iterable
 */
const fs = require("fs");
const path = require("path");

const manifestPath = path.join(process.cwd(), ".next", "routes-manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.warn("[ensure-routes-manifest] missing", manifestPath);
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
let changed = false;

for (const key of [
  "dataRoutes",
  "dynamicRoutes",
  "staticRoutes",
  "redirects",
  "headers",
]) {
  if (!Array.isArray(manifest[key])) {
    manifest[key] = [];
    changed = true;
  }
}

if (manifest.rewrites == null || typeof manifest.rewrites !== "object") {
  manifest.rewrites = { beforeFiles: [], afterFiles: [], fallback: [] };
  changed = true;
} else {
  for (const key of ["beforeFiles", "afterFiles", "fallback"]) {
    if (!Array.isArray(manifest.rewrites[key])) {
      manifest.rewrites[key] = [];
      changed = true;
    }
  }
}

if (changed) {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  console.log("[ensure-routes-manifest] patched incomplete routes-manifest.json");
}
