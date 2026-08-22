"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { AsyncLock } = require("./async-lock");

const SHA256 = /^[a-f0-9]{64}$/i;
const VERSION = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
const MAX_MANIFEST_BYTES = 1024 * 1024;
const MAX_PACKAGE_BYTES = 768 * 1024 * 1024;
const SAFE_HOSTS = new Set(["api.github.com", "github.com", "raw.githubusercontent.com"]);

function parseVersion(value) {
  const match = String(value || "").trim().match(VERSION);
  if (!match) throw new Error(`版本号无效：${String(value || "")}`);
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ? match[4].split(".") : []
  };
}

function comparePrerelease(left, right) {
  if (!left.length && !right.length) return 0;
  if (!left.length) return 1;
  if (!right.length) return -1;
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if (left[index] == null) return -1;
    if (right[index] == null) return 1;
    const leftNumeric = /^\d+$/.test(left[index]);
    const rightNumeric = /^\d+$/.test(right[index]);
    if (leftNumeric && rightNumeric) {
      const difference = Number(left[index]) - Number(right[index]);
      if (difference) return Math.sign(difference);
    } else if (leftNumeric !== rightNumeric) {
      return leftNumeric ? -1 : 1;
    } else {
      const difference = left[index].localeCompare(right[index]);
      if (difference) return Math.sign(difference);
    }
  }
  return 0;
}

function compareVersions(leftValue, rightValue) {
  const left = parseVersion(leftValue);
  const right = parseVersion(rightValue);
  for (const key of ["major", "minor", "patch"]) {
    if (left[key] !== right[key]) return Math.sign(left[key] - right[key]);
  }
  return comparePrerelease(left.prerelease, right.prerelease);
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function manifestPayload(manifest) {
  const copy = { ...manifest };
  delete copy.signature;
  return Buffer.from(canonicalJson(copy), "utf8");
}

function normalizePublicKey(value) {
  if (value && typeof value === "object" && value.type === "public") return value;
  const text = String(value || "").trim().replace(/\\n/g, "\n");
  if (!text) return null;
  if (text.includes("BEGIN PUBLIC KEY")) return text;
  return crypto.createPublicKey({ key: Buffer.from(text, "base64"), format: "der", type: "spki" });
}

function verifyManifestSignature(manifest, publicKey) {
  const signature = String(manifest?.signature || "").trim();
  if (!signature) throw new Error("更新清单缺少数字签名");
  let decoded;
  try { decoded = Buffer.from(signature, "base64"); } catch { throw new Error("更新清单签名格式无效"); }
  if (!decoded.length || !crypto.verify(null, manifestPayload(manifest), normalizePublicKey(publicKey), decoded)) {
    throw new Error("更新清单签名验证失败");
  }
}

function isSafeUpdateUrl(value, allowLocalhost = false) {
  let url;
  try { url = new URL(String(value || "")); } catch { return false; }
  const host = url.hostname.toLowerCase();
  if (allowLocalhost && url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(host)) return true;
  return url.protocol === "https:" && (
    SAFE_HOSTS.has(host) ||
    host.endsWith(".githubusercontent.com") ||
    host.endsWith(".githubassets.com")
  );
}

function platformPackageKey(platform, arch) {
  const normalizedArch = arch === "arm64" ? "arm64" : arch === "x64" ? "x64" : arch;
  return `${platform}-${normalizedArch}`;
}

function validateManifest(manifest, options) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("更新清单格式无效");
  if (manifest.schema !== 1) throw new Error("更新清单版本不受支持");
  parseVersion(manifest.version);
  if (manifest.minimumVersion) parseVersion(manifest.minimumVersion);
  if (manifest.minimumHostVersion) parseVersion(manifest.minimumHostVersion);
  if (!options.allowUnsigned) verifyManifestSignature(manifest, options.publicKey);
  const key = platformPackageKey(options.platform, options.arch);
  const candidate = manifest.packages?.[key];
  if (!candidate || typeof candidate !== "object") throw new Error(`新版本不支持当前平台：${key}`);
  if (!isSafeUpdateUrl(candidate.url, options.allowLocalhost)) throw new Error("更新包下载地址不在受信任范围内");
  if (!SHA256.test(String(candidate.sha256 || ""))) throw new Error("更新包缺少有效的 SHA-256");
  const size = Number(candidate.size);
  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_PACKAGE_BYTES) throw new Error("更新包大小无效");
  const rollout = manifest.rollout == null ? 100 : Number(manifest.rollout);
  if (!Number.isFinite(rollout) || rollout < 0 || rollout > 100) throw new Error("灰度发布比例无效");
  return {
    version: String(manifest.version).replace(/^v/i, ""),
    minimumVersion: manifest.minimumVersion ? String(manifest.minimumVersion).replace(/^v/i, "") : null,
    minimumHostVersion: manifest.minimumHostVersion ? String(manifest.minimumHostVersion).replace(/^v/i, "") : null,
    mandatory: Boolean(manifest.mandatory),
    rollout,
    publishedAt: manifest.publishedAt || null,
    notes: Array.isArray(manifest.notes) ? manifest.notes.map(String).slice(0, 30) : [],
    package: { url: String(candidate.url), sha256: String(candidate.sha256).toLowerCase(), size }
  };
}

async function hashFile(target) {
  const hash = crypto.createHash("sha256");
  const stream = fs.createReadStream(target);
  for await (const chunk of stream) hash.update(chunk);
  return hash.digest("hex");
}

function createUpdateManager(options) {
  const dataRoot = path.resolve(options.dataRoot);
  const namespace = String(options.namespace || "").trim();
  if (namespace && !/^[a-z0-9-]+$/i.test(namespace)) throw new Error("更新命名空间无效");
  const updatesRoot = namespace
    ? path.join(dataRoot, "updates", namespace)
    : path.join(dataRoot, "updates");
  const packagesRoot = path.join(updatesRoot, "packages");
  const statePath = path.join(updatesRoot, "state.json");
  const pendingPath = path.join(updatesRoot, "pending-update.json");
  const installIdPath = path.join(updatesRoot, "install-id");
  const currentVersion = String(options.currentVersion || "0.0.0").replace(/^v/i, "");
  const hostVersion = String(options.hostVersion || currentVersion).replace(/^v/i, "");
  const platform = options.platform || process.platform;
  const arch = options.arch || process.arch;
  const manifestUrl = String(options.manifestUrl || "").trim();
  const publicKey = options.publicKey || "";
  const fetchImpl = options.fetchImpl || global.fetch;
  const allowLocalhost = Boolean(options.allowLocalhost);
  const allowUnsigned = Boolean(options.allowUnsigned);
  const updateKind = String(options.updateKind || "application");
  const now = options.now || (() => new Date());
  const operations = new AsyncLock();
  let state = null;

  function baseState() {
    return {
      schema: 1,
      configured: Boolean(manifestUrl && (publicKey || allowUnsigned)),
      currentVersion,
      hostVersion,
      platform,
      arch,
      status: manifestUrl && (publicKey || allowUnsigned) ? "idle" : "disabled",
      checkedAt: null,
      latestVersion: null,
      candidate: null,
      progress: null,
      error: null
    };
  }

  async function writeJsonAtomic(target, value) {
    await fsp.mkdir(path.dirname(target), { recursive: true });
    const temporary = `${target}.${process.pid}.${crypto.randomUUID()}.tmp`;
    await fsp.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    await fsp.rename(temporary, target);
  }

  async function persist() { await writeJsonAtomic(statePath, state); }

  async function initialize() {
    await fsp.mkdir(packagesRoot, { recursive: true });
    try {
      const saved = JSON.parse(await fsp.readFile(statePath, "utf8"));
      state = { ...baseState(), ...saved, currentVersion, hostVersion, platform, arch };
      if (!baseState().configured) state = baseState();
      if (state.candidate && compareVersions(state.candidate.version, currentVersion) <= 0) {
        state.status = "up-to-date";
        state.candidate = null;
        state.progress = null;
        state.error = null;
      }
      if (["checking", "downloading", "applying"].includes(state.status)) {
        state.status = state.candidate ? "available" : "idle";
        state.progress = null;
      }
    } catch (error) {
      if (error.code !== "ENOENT") state = { ...baseState(), status: "error", error: "本地更新状态已重置" };
      else state = baseState();
    }
    await persist();
    return getStatus();
  }

  async function installId() {
    try { return (await fsp.readFile(installIdPath, "utf8")).trim(); } catch (error) {
      if (error.code !== "ENOENT") throw error;
      const value = crypto.randomUUID();
      await fsp.writeFile(installIdPath, `${value}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" }).catch(async (writeError) => {
        if (writeError.code !== "EEXIST") throw writeError;
      });
      return (await fsp.readFile(installIdPath, "utf8")).trim();
    }
  }

  async function participates(version, rollout) {
    if (rollout >= 100) return true;
    if (rollout <= 0) return false;
    const digest = crypto.createHash("sha256").update(`${await installId()}:${version}`).digest();
    return digest.readUInt32BE(0) / 0x100000000 * 100 < rollout;
  }

  function getStatus() {
    const candidate = state?.candidate;
    return {
      configured: Boolean(state?.configured),
      updateKind,
      currentVersion,
      hostVersion,
      platform,
      arch,
      status: state?.status || "disabled",
      checkedAt: state?.checkedAt || null,
      updateAvailable: ["available", "downloading", "ready", "applying"].includes(state?.status),
      latestVersion: state?.latestVersion || null,
      mandatory: Boolean(candidate?.mandatory),
      notes: candidate?.notes || [],
      publishedAt: candidate?.publishedAt || null,
      packageSize: candidate?.package?.size || null,
      progress: state?.progress || null,
      readyToRestart: state?.status === "ready",
      error: state?.error || null
    };
  }

  async function fetchJson(url) {
    if (!isSafeUpdateUrl(url, allowLocalhost)) throw new Error("更新清单地址不在受信任范围内");
    const response = await fetchImpl(url, { headers: { Accept: "application/json", "User-Agent": `AI-Switch/${currentVersion}` }, redirect: "follow" });
    if (!response.ok) throw new Error(`检查更新失败：HTTP ${response.status}`);
    if (response.url && !isSafeUpdateUrl(response.url, allowLocalhost)) throw new Error("更新清单重定向到了未受信任地址");
    const declared = Number(response.headers?.get?.("content-length"));
    if (Number.isFinite(declared) && declared > MAX_MANIFEST_BYTES) throw new Error("更新清单过大");
    const text = await response.text();
    if (Buffer.byteLength(text) > MAX_MANIFEST_BYTES) throw new Error("更新清单过大");
    try { return JSON.parse(text); } catch { throw new Error("更新清单不是有效的 JSON"); }
  }

  async function check() {
    return operations.run(async () => {
      if (!state) await initialize();
      if (!state.configured) return getStatus();
      state.status = "checking";
      state.error = null;
      state.progress = null;
      await persist();
      try {
        const manifest = await fetchJson(manifestUrl);
        const candidate = validateManifest(manifest, { publicKey, platform, arch, allowLocalhost, allowUnsigned });
        state.checkedAt = now().toISOString();
        state.latestVersion = candidate.version;
        if (candidate.minimumHostVersion && compareVersions(hostVersion, candidate.minimumHostVersion) < 0) {
          state.status = "host-required";
          state.candidate = null;
        } else if (compareVersions(candidate.version, currentVersion) <= 0 || !(await participates(candidate.version, candidate.rollout))) {
          state.status = "up-to-date";
          state.candidate = null;
        } else {
          state.status = "available";
          state.candidate = candidate;
        }
        await persist();
        return getStatus();
      } catch (error) {
        state.status = state.candidate ? "available" : "error";
        state.error = String(error.message || error).slice(0, 500);
        await persist();
        throw error;
      }
    });
  }

  async function validateDownloaded(target, candidate) {
    const stat = await fsp.stat(target);
    if (stat.size !== candidate.package.size) throw new Error("更新包大小与发布清单不一致");
    if (await hashFile(target) !== candidate.package.sha256) throw new Error("更新包 SHA-256 校验失败");
  }

  async function download() {
    return operations.run(async () => {
      if (!state) await initialize();
      const candidate = state.candidate;
      if (!candidate || !["available", "ready", "error"].includes(state.status)) throw new Error("当前没有可下载的更新");
      const target = path.join(packagesRoot, `${candidate.package.sha256}.zip`);
      if (fs.existsSync(target)) {
        try {
          await validateDownloaded(target, candidate);
          state.status = "ready";
          state.progress = { transferred: candidate.package.size, total: candidate.package.size, percent: 100 };
          state.error = null;
          await persist();
          return getStatus();
        } catch { await fsp.rm(target, { force: true }); }
      }
      const temporary = `${target}.${process.pid}.part`;
      state.status = "downloading";
      state.progress = { transferred: 0, total: candidate.package.size, percent: 0 };
      state.error = null;
      await persist();
      try {
        const response = await fetchImpl(candidate.package.url, { headers: { Accept: "application/octet-stream", "User-Agent": `AI-Switch/${currentVersion}` }, redirect: "follow" });
        if (!response.ok) throw new Error(`下载更新失败：HTTP ${response.status}`);
        if (response.url && !isSafeUpdateUrl(response.url, allowLocalhost)) throw new Error("更新包重定向到了未受信任地址");
        const file = await fsp.open(temporary, "w", 0o600);
        const hash = crypto.createHash("sha256");
        let transferred = 0;
        let lastPersisted = 0;
        try {
          const body = response.body;
          if (!body) throw new Error("更新包响应为空");
          for await (const raw of body) {
            const chunk = Buffer.from(raw);
            transferred += chunk.length;
            if (transferred > candidate.package.size || transferred > MAX_PACKAGE_BYTES) throw new Error("更新包超过发布清单声明的大小");
            hash.update(chunk);
            await file.write(chunk);
            state.progress = { transferred, total: candidate.package.size, percent: Math.min(100, Math.round(transferred / candidate.package.size * 100)) };
            if (transferred - lastPersisted >= 4 * 1024 * 1024) {
              lastPersisted = transferred;
              await persist();
            }
          }
        } finally { await file.close(); }
        if (transferred !== candidate.package.size) throw new Error("更新包下载不完整");
        if (hash.digest("hex") !== candidate.package.sha256) throw new Error("更新包 SHA-256 校验失败");
        await fsp.rename(temporary, target);
        state.status = "ready";
        state.progress = { transferred, total: candidate.package.size, percent: 100 };
        await persist();
        return getStatus();
      } catch (error) {
        await fsp.rm(temporary, { force: true }).catch(() => {});
        state.status = "available";
        state.error = String(error.message || error).slice(0, 500);
        state.progress = null;
        await persist();
        throw error;
      }
    });
  }

  async function prepareApply() {
    return operations.run(async () => {
      if (!state) await initialize();
      const candidate = state.candidate;
      if (!candidate || state.status !== "ready") throw new Error("更新尚未下载完成");
      const target = path.join(packagesRoot, `${candidate.package.sha256}.zip`);
      await validateDownloaded(target, candidate);
      await writeJsonAtomic(pendingPath, {
        schema: 1,
        version: candidate.version,
        sha256: candidate.package.sha256,
        platform,
        arch,
        createdAt: now().toISOString()
      });
      state.status = "applying";
      state.error = null;
      await persist();
      return { ...getStatus(), restartRequired: true, hostAction: "apply-update" };
    });
  }

  return { initialize, getStatus, check, download, prepareApply, paths: { updatesRoot, packagesRoot, statePath, pendingPath } };
}

module.exports = {
  canonicalJson,
  compareVersions,
  createUpdateManager,
  isSafeUpdateUrl,
  manifestPayload,
  platformPackageKey,
  validateManifest,
  verifyManifestSignature
};
