/**
 * ota-predeploy.mjs
 * Checks local package.json version against Firestore ota_config/latest.
 * Uses Firebase REST API (no service account key file needed).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_JSON_PATH = join(__dirname, "package.json");

const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || "atyourage-e78ff";
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY;

function isNewer(local, remote) {
  const l = local.replace("v", "").split(".").map(Number);
  const r = remote.replace("v", "").split(".").map(Number);
  for (let i = 0; i < Math.max(l.length, r.length); i++) {
    const c1 = l[i] || 0;
    const c2 = r[i] || 0;
    if (c1 > c2) return true;
    if (c1 < c2) return false;
  }
  return false;
}

async function main() {
  console.log("Checking version before OTA deployment...");

  if (!existsSync(PACKAGE_JSON_PATH)) {
    console.error("ERROR: package.json not found!");
    process.exit(1);
  }

  const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));
  const localVersion = pkg.version;
  console.log("Local version: " + localVersion);

  const url = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID + "/databases/(default)/documents/ota_config/latest?key=" + FIREBASE_API_KEY;

  try {
    const res = await fetch(url);
    if (res.status === 404) {
      console.log("No existing OTA version in Firestore. First deploy!");
      process.exit(0);
    }
    if (!res.ok) {
      console.warn("Could not reach Firestore (" + res.status + "). Proceeding anyway.");
      process.exit(0);
    }
    const data = await res.json();
    const remoteVersion = data?.fields?.version?.stringValue;

    if (!remoteVersion) {
      console.log("No version set in Firestore yet. Proceeding.");
      process.exit(0);
    }

    console.log("Remote (live) version: " + remoteVersion);

    if (!isNewer(localVersion, remoteVersion)) {
      console.error("FATAL: Version conflict! Local=" + localVersion + " <= Remote=" + remoteVersion + ". Bump package.json version first!");
      process.exit(1);
    }

    console.log("Version " + localVersion + " is fresh! Deployment can proceed.");
    process.exit(0);
  } catch (err) {
    console.warn("Network error checking Firestore: " + err.message + ". Proceeding.");
    process.exit(0);
  }
}

main();
