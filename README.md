# AI Switch

[English](README_EN.md) | 简体中文

AI Switch 是一款纯本机桌面工具，用于手动查看本人多个 Codex 账户的套餐、额度与重置时间，切换本机官方 Codex 登录账户，并管理官方 API 或兼容中转站。

> 非官方第三方项目，不代表 OpenAI 发布或背书。本项目不提供账号共享、自动刷额度或绕过平台限制的能力。

## 当前公开范围

项目采用阶段性源码公开策略。当前仓库公开：

- 桌面界面层（HTML、CSS、前端 JavaScript）
- 安全更新协议及校验实现
- 产品文档、更新记录和问题反馈模板
- Windows 正式发布包，以及 macOS / Linux 预览包和校验文件

授权、凭证存储、账户切换等核心实现暂不公开，后续计划逐步开放。完整源码在私有仓库中由作者与合伙人通过 Git 分支、Pull Request 和代码审查协同开发。

## 主要功能

- OpenAI 官方网页登录授权与本机 Codex 登录导入
- 手动批量查询套餐、剩余额度、重置时间、重置卡和订阅有效期
- 本机账户切换与会话记录保留
- OpenAI、DeepSeek 等官方 API 及兼容中转站的模型发现与切换
- 会话、本机备份、授权修复、项目方案、诊断和系统托盘管理
- Windows / macOS / Linux 更新检查、完整包校验、并排安装和失败回滚

## 下载与更新

请只从本仓库的 **Releases** 下载。AI Switch 没有开发者后台，安装与更新文件直接托管在 GitHub Releases。

- [下载最新版 / Releases](https://github.com/GitHub1874/ai-switch/releases)
- [下载 v1.13.0-preview.1（macOS / Linux 预览版）](https://github.com/GitHub1874/ai-switch/releases/tag/v1.13.0-preview.1)

当前预览版提供：

- macOS Universal DMG / ZIP：同时支持 Apple Silicon 与 Intel。
- Linux x64 / ARM64 AppImage，以及 amd64 / arm64 deb。
- Linux 适配 OpenAI 官方桌面端当前支持的 Ubuntu 24.04/26.04、Debian 13、Fedora 43/44；安装 AI Switch 前仍需单独安装官方 Codex/ChatGPT 桌面应用。

macOS 预览包尚未使用 Apple Developer ID 签名和 notarization，只用于测试，首次打开需按 Release 说明操作。正式稳定版会在证书、公证及真机回归完成后发布。

## 隐私

账户凭证、API Key、会话、备份和设置只保存在用户设备上。软件无遥测、无广告，版本检查也不会上传账户信息。

## 许可证

当前公开源码使用 [PolyForm Noncommercial License 1.0.0](LICENSE)。符合许可证定义的非商业用途免费；任何商业使用必须购买作者书面授权。

商业授权联系作者：**QQ 380456551**。详见 [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md)。

由于限制商业使用，本项目属于 source-available（源码可见），不是 OSI 定义的开源软件。
