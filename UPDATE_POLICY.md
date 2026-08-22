# AI Switch 更新策略 / Update Policy

## 简体中文

### 用户如何收到更新

AI Switch 使用本仓库的 GitHub Releases 作为公开更新源，不需要作者自建服务器。

1. 客户端启动约 15 秒后异步检查社区新版，此后每 6 小时检查一次，也可在“管理与设置 → 版本信息”手动检查。
2. 发现新版时只提示，不会自动下载或静默安装。
3. 用户点击“下载更新”后才下载并校验更新包。
4. 校验通过后，用户点击“重启并更新”完成升级；账户、会话、备份和设置不随应用包覆盖。

把代码推送到 GitHub、创建标签或上传普通附件，并不会自动成为客户端更新。只有非 Draft 的 Pre-release 同时包含目标平台需要的 preview 更新元数据和安装包时，社区版客户端才能发现它。

### 发布通道

- **社区 Pre-release**：当前唯一发布通道；所有新客户端固定接收。
- **稳定版**：长期停用。项目不发布或宣传无生产签名的所谓稳定版。
- **Draft**：发布者准备区，客户端不会接收。

### 平台要求

- Windows：校验 Ed25519 签名的 `update-manifest.json` 和更新包 SHA-256，并排安装失败时保留上一版本。
- macOS：社区通道使用 DMG/ZIP 和 `preview-mac.yml`；没有 Developer ID 和 notarization 时可能需要用户手动覆盖应用。
- Linux：需要对应架构的 AppImage/deb、`preview-linux.yml` / `preview-linux-arm64.yml` 和 SHA-256；不同安装格式分别验收。

所有公开构建必须保持 Pre-release，不能宣称为稳定更新。

## English

### How users receive updates

AI Switch uses this repository's GitHub Releases as its public update origin. No developer-operated update server is required.

1. The client checks asynchronously for a newer community release about 15 seconds after startup and every six hours thereafter. Users may also check from **Management & Settings → Version information**.
2. A new release is announced in the app, but it is never downloaded or silently installed without user action.
3. The package is downloaded only after the user chooses **Download update**.
4. After verification, the user chooses **Restart and update**. Accounts, conversations, backups, and settings are stored separately from the application package.

Pushing code, creating a tag, or uploading ordinary attachments does not publish a client update. Community clients discover an update only when a non-draft Pre-release contains the required preview metadata and packages for the target platform.

### Release channels

- **Community Pre-release**: the only active release channel; every new client follows it.
- **Stable**: permanently disabled. The project does not publish or advertise an unsigned “stable” edition.
- **Draft**: publisher staging area; clients do not receive it.

### Platform requirements

- Windows verifies the Ed25519-signed `update-manifest.json` and package SHA-256, and preserves the previous side-by-side version on failure.
- macOS community updates use DMG/ZIP assets and `preview-mac.yml`; without Developer ID signing and notarization, users may need to replace the app manually.
- Linux requires architecture-specific AppImage/deb assets, `preview-linux.yml` / `preview-linux-arm64.yml`, and SHA-256; each installation format is validated separately.

Every public build remains a Pre-release and must not be presented as a stable update.

