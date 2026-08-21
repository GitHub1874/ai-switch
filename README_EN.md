# AI Switch

[简体中文](README.md) | English

AI Switch is a local desktop app for manually viewing Codex plan and quota status across accounts you own, switching the official Codex desktop login on your device, and managing official or OpenAI-compatible API providers.

> This is an unofficial third-party project. It is not published or endorsed by OpenAI and does not provide account sharing, automatic quota farming, or limit bypassing.

## Public source scope

AI Switch is being published in stages. This repository currently publishes:

- The desktop UI layer (HTML, CSS, and browser-side JavaScript)
- The secure update protocol and verification implementation
- Product documentation, release notes, and issue templates
- Official Windows and macOS release artifacts and checksums

Authorization, credential storage, and account-switching internals remain private for now and may be opened gradually. The full codebase is developed by the author and partners in a private Git repository through branches, pull requests, and reviews.

## Highlights

- Official OpenAI browser authorization and import of an existing local Codex login
- Manual batch display of plan, remaining quota, reset time, reset credits, and subscription expiry
- Local account switching while preserving conversation history
- Model discovery and selection for official APIs and compatible relay services
- Conversation management, local backups, authorization repair, project profiles, diagnostics, and tray support
- Signed Windows and macOS updates with integrity verification and rollback

## Downloads and updates

Download only from this repository's **Releases** page. AI Switch has no developer backend. Update files are hosted directly on GitHub Releases, verified with a release signature and SHA-256, and downloaded or installed only after the user explicitly requests it.

## Privacy

Account credentials, API keys, conversations, backups, and settings stay on the user's device. There is no telemetry or advertising, and update checks do not upload account information.

## License

The currently published source is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). Noncommercial use permitted by that license is free; any commercial use requires a separate written license.

Commercial licensing: **QQ 380456551**. See [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md).

Because commercial use is restricted, this project is source-available rather than OSI open source.
