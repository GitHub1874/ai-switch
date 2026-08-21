"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const {
  compareVersions,
  createUpdateManager,
  manifestPayload,
  validateManifest
} = require("../lib/update-manager");

function signedManifest(privateKey, packageBytes, overrides = {}) {
  const manifest = {
    schema: 1,
    version: "2.0.0",
    minimumVersion: "1.0.0",
    rollout: 100,
    mandatory: false,
    notes: ["安全更新"],
    packages: {
      "win32-x64": {
        url: "https://github.com/example/ai-switch/releases/download/v2.0.0/windows.zip",
        sha256: crypto.createHash("sha256").update(packageBytes).digest("hex"),
        size: packageBytes.length
      }
    },
    ...overrides
  };
  manifest.signature = crypto.sign(null, manifestPayload(manifest), privateKey).toString("base64");
  return manifest;
}

test("compares stable and prerelease semantic versions", () => {
  assert.equal(compareVersions("1.12.0", "1.11.9"), 1);
  assert.equal(compareVersions("1.12.0-beta.2", "1.12.0-beta.10"), -1);
  assert.equal(compareVersions("1.12.0", "1.12.0-beta.10"), 1);
});

test("accepts an Ed25519-signed platform manifest and rejects tampering", () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const bytes = Buffer.from("package");
  const manifest = signedManifest(privateKey, bytes);
  const result = validateManifest(manifest, { publicKey, platform: "win32", arch: "x64" });
  assert.equal(result.version, "2.0.0");
  manifest.notes.push("tampered");
  assert.throws(
    () => validateManifest(manifest, { publicKey, platform: "win32", arch: "x64" }),
    /签名验证失败/
  );
});

test("downloads, verifies and prepares a side-by-side update without touching app data", async (t) => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), "ai-switch-update-"));
  t.after(() => fsp.rm(root, { recursive: true, force: true }));
  const bytes = Buffer.from("signed update package");
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const manifest = signedManifest(privateKey, bytes);
  const responses = new Map([
    ["http://127.0.0.1/manifest.json", new Response(JSON.stringify(manifest), { status: 200 })],
    [manifest.packages["win32-x64"].url, new Response(bytes, { status: 200 })]
  ]);
  const manager = createUpdateManager({
    dataRoot: root,
    currentVersion: "1.0.0",
    platform: "win32",
    arch: "x64",
    manifestUrl: "http://127.0.0.1/manifest.json",
    publicKey,
    allowLocalhost: true,
    fetchImpl: async (url) => {
      const response = responses.get(String(url));
      if (!response) throw new Error(`unexpected URL ${url}`);
      return response.clone();
    }
  });
  await manager.initialize();
  assert.equal((await manager.check()).updateAvailable, true);
  assert.equal((await manager.download()).readyToRestart, true);
  const prepared = await manager.prepareApply();
  assert.equal(prepared.restartRequired, true);
  const pending = JSON.parse(await fsp.readFile(manager.paths.pendingPath, "utf8"));
  assert.equal(pending.version, "2.0.0");
  assert.match(pending.sha256, /^[a-f0-9]{64}$/);
});

test("secure defaults keep updates disabled until a manifest and verification key are configured", async (t) => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), "ai-switch-update-disabled-"));
  t.after(() => fsp.rm(root, { recursive: true, force: true }));
  const manager = createUpdateManager({ dataRoot: root, currentVersion: "1.0.0" });
  const status = await manager.initialize();
  assert.equal(status.configured, false);
  assert.equal(status.status, "disabled");
});
