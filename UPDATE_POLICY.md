# AI Switch 更新策略 / Update Policy

## 简体中文

### 用户如何收到更新

AI Switch 使用本仓库的 GitHub Releases 作为公开更新源，不需要作者自建服务器。

1. 客户端启动后异步检查正式新版，也可在“管理与设置 → 版本信息”手动检查。
2. 发现新版时只提示，不会自动下载或静默安装。
3. 用户点击“下载更新”后才下载并校验更新包。
4. 校验通过后，用户点击“重启并更新”完成升级；账户、会话、备份和设置不随应用包覆盖。

把代码推送到 GitHub、创建标签或上传普通附件，并不会自动成为客户端更新。只有非 Draft、非 Pre-release 的正式 Release，同时包含目标平台需要的更新元数据和安装包时，稳定版客户端才能发现它。

### 发布通道

- **稳定版**：面向普通用户。必须经过签名/校验，并完成从旧版本升级到新版本的实机验收。
- **Pre-release**：只用于测试。稳定版客户端默认不会自动接收。
- **Draft**：发布者准备区，客户端不会接收。

### 平台要求

- Windows：校验 Ed25519 签名的 `update-manifest.json` 和更新包 SHA-256，并排安装失败时保留上一版本。
- macOS：需要 Developer ID 签名、Apple notarization、DMG/ZIP 和 `latest-mac.yml`。
- Linux：需要对应架构的 AppImage/deb、更新元数据和 SHA-256；不同安装格式分别验收。

在签名、公证或真机升级验证未完成时，相关构建只能作为 Pre-release，不能宣称为稳定更新。

## English

### How users receive updates

AI Switch uses this repository's GitHub Releases as its public update origin. No developer-operated update server is required.

1. The client checks asynchronously for a newer stable release after startup, and users may also check from **Management & Settings → Version information**.
2. A new release is announced in the app, but it is never downloaded or silently installed without user action.
3. The package is downloaded only after the user chooses **Download update**.
4. After verification, the user chooses **Restart and update**. Accounts, conversations, backups, and settings are stored separately from the application package.

Pushing code, creating a tag, or uploading ordinary attachments does not publish a client update. Stable clients can discover a release only when a non-draft, non-prerelease GitHub Release contains the required update metadata and packages for the target platform.

### Release channels

- **Stable**: for general users; must be signed/verified and pass a real upgrade from an installed older version.
- **Pre-release**: testing only; stable clients do not receive it by default.
- **Draft**: publisher staging area; clients do not receive it.

### Platform requirements

- Windows verifies the Ed25519-signed `update-manifest.json` and package SHA-256, and preserves the previous side-by-side version on failure.
- macOS requires Developer ID signing, Apple notarization, DMG/ZIP assets, and `latest-mac.yml`.
- Linux requires architecture-specific AppImage/deb assets, update metadata, and SHA-256; each installation format is validated separately.

If signing, notarization, or real-device upgrade validation is incomplete, the build remains a Pre-release and must not be presented as a stable update.

