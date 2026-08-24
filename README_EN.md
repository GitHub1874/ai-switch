# AI Switch

[简体中文](README.md) | English

AI Switch is a local desktop app for manually viewing Codex plan and quota status across accounts you own, switching the official Codex desktop login on your device, and managing official or OpenAI-compatible API providers.

> This is an unofficial third-party project. It is not published or endorsed by OpenAI and does not provide account sharing, automatic quota farming, or limit bypassing.

## Public source scope

AI Switch is being published in stages. This repository currently publishes:

- The desktop UI layer (HTML, CSS, and browser-side JavaScript)
- The secure update protocol and verification implementation
- Product documentation, release notes, and issue templates
- Windows, macOS, and Linux community preview artifacts and checksums

Authorization, credential storage, and account-switching internals remain private for now and may be opened gradually. The full codebase is developed by the author and partners in a private Git repository through branches, pull requests, and reviews.

## Highlights

- Official OpenAI browser authorization and import of an existing local Codex login
- Manual batch display of plan, remaining quota, reset time, reset credits, and subscription expiry
- Local account switching while preserving conversation history
- Model discovery and selection for official APIs and compatible relay services
- Conversation management, local backups, authorization repair, project profiles, diagnostics, and tray support
- Windows, macOS, and Linux update flows with package verification and rollback

## Downloads and updates

Download only from this repository's **Releases** page. AI Switch has no developer backend. Installation and update files are hosted directly on GitHub Releases.

The app automatically checks for community updates about 15 seconds after startup and every six hours thereafter; users can also check manually. It never downloads or silently installs an update without user action. Users choose **Download update** and then **Restart and update**. Pushing code, creating a tag, or uploading ordinary files does not publish a client update. See the [Update Policy](UPDATE_POLICY.md) for the complete rules.

- [Latest downloads / Releases](https://github.com/GitHub1874/ai-switch/releases)
- [v1.15.0-preview.1 community preview for Windows, macOS, and Linux](https://github.com/GitHub1874/ai-switch/releases/tag/v1.15.0-preview.1)

The current preview provides:

- A Universal macOS DMG/ZIP for both Apple Silicon and Intel.
- Linux x64/ARM64 AppImages and amd64/arm64 deb packages.
- Linux integration for the distributions currently supported by the official OpenAI desktop app: Ubuntu 24.04/26.04, Debian 13, and Fedora 43/44. The official Codex/ChatGPT desktop app must still be installed separately.

This project permanently distributes community builds as GitHub Pre-releases and does not offer or advertise an unsigned “stable” edition. Every new client follows the preview update channel. Historical installations that still follow stable/latest must install the community edition once before they can receive subsequent preview updates automatically.

The macOS community build is not signed with an Apple Developer ID or notarized, so first launch or upgrades may require downloading the DMG, replacing the app manually, and confirming system warnings as documented in the Release notes. Windows may show a SmartScreen warning.

## Privacy

Account credentials, API keys, conversations, backups, and settings stay on the user's device. There is no telemetry or advertising, and update checks do not upload account information.

## License

The currently published source is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). Noncommercial use permitted by that license is free; any commercial use requires a separate written license.

Commercial licensing: **QQ 380456551**. See [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md).

Because commercial use is restricted, this project is source-available rather than OSI open source.

The public repository and release assets follow the [Public Release IP Policy](PUBLIC_RELEASE_IP_POLICY.md). Third-party component, provider-icon, and trademark notices are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
