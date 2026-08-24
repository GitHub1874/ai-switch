# AI Switch 1.15.1-preview.1

这是 GitHub Pre-release 社区预览版，不是稳定版。请只从
`GitHub1874/ai-switch` 的 Releases 页面下载安装文件。

## 本次更新

- 新增官方 `auth.json` 安全迁移。OAuth、OpenAI 官方 API Key 与 Agent Identity
  按账户和凭证模式分别导入、导出；凭证正文只在本机后端与系统文件对话框之间流动。
- OAuth 导入必须完成官方强制刷新与身份复核；API Key 使用官方 `/v1/models`
  做最小连接验证；Agent Identity 必须通过官方 App Server 的只读远端认证请求。
- 流式代理识别完整终止事件并及时释放半开上游连接；不同请求的解析器、响应 ID
  和中止控制保持隔离。
- 用户主动启动失效账户时，重新授权成功后只续接原启动一次；取消、失败或错误会话
  不会触发后台启动、账号轮换或故障转移。
- 恢复数据前生成的自动安全备份按来源保留最新一份；手动、损坏、身份不匹配或锁定
  的备份不会被误删。
- 完整桌面包现在会优先使用自身更新的内嵌核心，不再被旧版本遗留的已激活核心指针
  覆盖；仍会保留并使用严格更新于桌面包的签名核心补丁。

## 安全与兼容性

- 所有账户凭证、API Key、会话和备份仍只保存在用户设备上；没有云同步、遥测、
  后台额度轮询或自动切号。
- 本版本修改了 Windows 与 macOS/Linux 桌面宿主，旧宿主不能只安装业务核心补丁，
  必须使用对应平台的完整 `1.15.1-preview.1` 社区包。
- macOS 社区包没有 Apple Developer ID 签名或 notarization，需要按安装说明手动确认；
  Windows 可能显示 SmartScreen 提示。

---

This is a GitHub Pre-release community preview, not a stable release. Download
artifacts only from the `GitHub1874/ai-switch` Releases page.

## Highlights

- Adds secure, per-account official `auth.json` transfer for OAuth, official
  OpenAI API keys, and Agent Identity credentials through native file dialogs.
- Requires official refresh and identity checks for OAuth, a minimal official
  `/v1/models` connection for API keys, and a read-only authenticated App Server
  request for Agent Identity imports.
- Reliably terminates streaming proxy requests and releases half-open upstream
  readers while keeping concurrent request state isolated.
- Resumes exactly one user-requested launch after successful reauthorization.
- Retains the newest verified automatic pre-restore safety backup without
  deleting manual or suspicious backups.
- Ensures a full desktop package supersedes an older activated core while still
  honoring a signed core update that is strictly newer than the bundled core.

Credentials, API keys, conversations, backups, and settings remain local. This
release does not add telemetry, background quota polling, automatic account
rotation, or failover. Because the desktop hosts changed, install the full
platform package for `1.15.1-preview.1`.
