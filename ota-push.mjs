/**
 * ota-push.mjs
 * Builds zip of app/dist (React bundle) for Capgo OTA,, uploads to Backblaze B2 via Cloudflare CDN,
 * then writes version/url/checksum to Firestore ota_config/latest via REST API.
 * No service account key file needed — uses Firebase REST API with API key.
 */
import { readFileSync, existsSync, statSync, createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { zip } = require("zip-a-folder");
const dotenv = require("dotenv");
dotenv.config();

const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const __dirname = dirname(fileURLToPath(import.meta.url));

// Config
const PACKAGE_JSON_PATH = join(__dirname, "package.json");
const DIST_DIR = join(__dirname, "app", "dist");

const B2_BUCKET = process.env.B2_BUCKET || "aya-app-assets";
const B2_ENDPOINT = process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com";
const B2_REGION = process.env.B2_REGION || "us-east-005";
const B2_KEY_ID = process.env.B2_APPLICATION_KEY_ID;
const B2_APP_KEY = process.env.B2_APPLICATION_KEY;

// Use Cloudflare CDN zero-egress URL
const CDN_BASE = process.env.OTA_CDN_BASE || "https://cdn.aya-app.com";
const OTA_PREFIX = "aya-ota-bundles";

const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || "atyourage-e78ff";
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY;

function makeS3Client() {
  return new S3Client({
    region: B2_REGION,
    endpoint: B2_ENDPOINT,
    credentials: { accessKeyId: B2_KEY_ID, secretAccessKey: B2_APP_KEY },
  });
}

async function uploadToB2(s3, localPath, s3Key) {
  const stream = createReadStream(localPath);
  const size = statSync(localPath).size;
  const upload = new Upload({
    client: s3,
    params: { Bucket: B2_BUCKET, Key: s3Key, Body: stream, ContentType: "application/zip", ContentLength: size },
    partSize: 10 * 1024 * 1024,
    queueSize: 1,
    leavePartsOnError: false,
  });
  upload.on("httpUploadProgress", (p) => {
    const pct = Math.round((p.loaded / p.total) * 100);
    process.stdout.write("\r   Progress: " + pct + "% (" + (p.loaded/1024/1024).toFixed(1) + " / " + (p.total/1024/1024).toFixed(1) + " MB)");
  });
  await upload.done();
  process.stdout.write("\n");
}

function computeChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (d) => hash.update(d));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
}

async function updateFirestore(version, url, checksum) {
  const firestoreUrl = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID + "/databases/(default)/documents/ota_config/latest?key=" + FIREBASE_API_KEY;
  const body = JSON.stringify({
    fields: {
      version: { stringValue: version },
      url: { stringValue: url },
      checksum: { stringValue: checksum },
      message: { stringValue: "Version " + version },
      updatedAt: { stringValue: new Date().toISOString() },
    },
  });
  const res = await fetch(firestoreUrl, { method: "PATCH", headers: { "Content-Type": "application/json" }, body });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Firestore update failed: " + err);
  }
}

async function main() {
  console.log("\n🚀 OTA Push — AYA App (Backblaze B2 + Cloudflare)\n");

  const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));
  const version = pkg.version;
  console.log("📦 Version: " + version);

  if (!existsSync(DIST_DIR)) {
    console.error('❌ app/dist folder not found! Run "npm run build:game" first.! Run "npm run build:game" first.');
    process.exit(1);
  }

  if (!B2_KEY_ID || !B2_APP_KEY) {
    console.error("❌ B2_APPLICATION_KEY_ID and B2_APPLICATION_KEY must be set in .env");
    process.exit(1);
  }

  // Zip .output/public
  const zipPath = join(__dirname, "ota-bundle-" + version + ".zip");
  console.log("\n📦 Zipping app/dist → " + zipPath);
  await zip(DIST_DIR, zipPath);
  const sizeMB = (statSync(zipPath).size / 1024 / 1024).toFixed(2);
  console.log("✔ Zip created (" + sizeMB + " MB)");

  // Checksum
  const checksum = await computeChecksum(zipPath);
  console.log("🔑 SHA-256: " + checksum);

  // Upload to B2
  const s3Key = OTA_PREFIX + "/" + version + ".zip";
  const s3 = makeS3Client();
  console.log("\n⬆️  Uploading to B2...");
  console.log("   Bucket : " + B2_BUCKET);
  console.log("   Key    : " + s3Key);
  await uploadToB2(s3, zipPath, s3Key);

  const cdnUrl = CDN_BASE + "/" + s3Key;
  console.log("✔ Upload complete!");
  console.log("   CDN URL: " + cdnUrl);

  // Update Firestore
  console.log("\n🔥 Updating Firestore ota_config/latest...");
  await updateFirestore(version, cdnUrl, checksum);
  console.log("✔ Firestore updated!");

  // Cleanup local zip
  const { unlink } = await import("node:fs/promises");
  await unlink(zipPath);
  console.log("🗑️  Local zip deleted.");

  console.log("\n✅ OTA Update pushed successfully!");
  console.log("   Version : " + version);
  console.log("   URL     : " + cdnUrl);
  console.log("\n💡 Users will get this update automatically on next app launch!\n");
}

main().catch((err) => {
  console.error("❌ OTA Push failed:", err.message);
  process.exit(1);
});
