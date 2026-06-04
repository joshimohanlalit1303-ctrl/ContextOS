# Chrome Web Store Listing — Libro

> Last Updated: 2026-06-03

## Store Listing

**Extension Name** [REQUIRED]
Libro

**Short Description** [REQUIRED]
Syncs and seamlessly injects your personalized Context into ChatGPT, Claude, Gemini, and DeepSeek.

**Detailed Description** [REQUIRED]
Libro is the ultimate User Context Layer for AI applications. It bridges the gap between your local context and your favorite AI platforms, allowing you to instantly drop your customized identity, skills, active goals, and preferences directly into the chat prompt.

Key Features:
- Seamlessly integrates with ChatGPT, Claude, Gemini, and DeepSeek.
- Effortless Side Panel UI that stays out of your way while you chat.
- "Drop into Chat" mechanism that auto-injects your context straight into the prompt box.
- Secure, cloud-synced context powered by the Libro backend.

How to Use:
1. Open the Libro Side Panel while browsing your favorite AI platform.
2. Sign in with GitHub to pull down your personalized Context Capsule.
3. Click "Drop into Chat". Libro will instantly paste your up-to-date context into the active chat box.

Privacy Note:
Libro takes your privacy seriously. The extension only reads the specific AI chat platforms (chatgpt.com, claude.ai, gemini.google.com, chat.deepseek.com) to allow the injector to function.

Support & Feedback:
If you run into issues, please contact us or open an issue on our GitHub repository.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Syncs and seamlessly injects your personalized Context into ChatGPT, Claude, Gemini, and DeepSeek.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `dist/icon-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |

### Screenshot Notes
- **Screenshot 1**: Show the Libro Side Panel opened next to ChatGPT. The Side Panel should show "Connected to Context Engine" with the "Drop into Chat" button visible.
- **Screenshot 2**: Show the context successfully injected into the Claude or Gemini chatbox, demonstrating the end result.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `sidePanel` | permissions | Required to display the Libro UI in the browser's side panel so users can interact with it continuously without losing their active state while chatting on AI platforms. |
| `identity` | permissions | Required to securely authenticate the user via GitHub OAuth to sync their context from the Libro backend. |
| `tabs` | permissions | Required to determine which AI platform tab is currently active so the extension knows where to inject the context payload. |
| `*://chatgpt.com/*` | host_permissions | Required to inject the content script that tracks and pastes context into ChatGPT. |
| `*://claude.ai/*` | host_permissions | Required to inject the content script that tracks and pastes context into Claude. |
| `*://gemini.google.com/*` | host_permissions | Required to inject the content script that tracks and pastes context into Gemini. |
| `*://chat.deepseek.com/*` | host_permissions | Required to inject the content script that tracks and pastes context into DeepSeek. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Authentication info | Yes | Yes | To securely log the user in to their Libro account via GitHub OAuth. | No |
| Personal communications | Yes | Yes | To ingest prompts into the Context Engine for ongoing context refinement (from the AI chat platforms). | No |
| User activity | Yes | Yes | To verify the status of the context injection and tracking. | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
*To be hosted (e.g. on GitHub Pages or Notion) and provided here.*

## Developer Info

**Publisher Name** [REQUIRED]
*Your Publisher Name*

**Contact Email** [REQUIRED]
*Your Email Address*

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-06-03 | Initial release featuring Side Panel and cross-platform injector | Draft |
