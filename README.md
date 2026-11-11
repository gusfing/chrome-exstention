# Kawaki Agent Chrome Bridge & Extension

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Zero Debugger Banners](https://img.shields.io/badge/Mode-100%25%20Silent-blue.svg)](#zero-debugger-banner-guarantee)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Automate and inspect your real, active Google Chrome browser profile completely silently in the background.**  
> Preserves all your authenticated logins, active cookies, Google Search Console, Gmail, and merchant dashboards without bot detection, without invasive `--remote-debugging-port` startup flags, and **with zero top-level debugger infobar banners**.

---

## ⚡ Why This Exists

Traditional browser automation tools (Puppeteer, Selenium, Playwright) launch a fresh, cold browser profile where you are logged out of everything and easily detected by Cloudflare, Google, and bot shields. 

Alternatively, using Chrome's native DevTools Protocol (`chrome.debugger`) in an extension forces Chrome to display an involuntary top-level warning banner:  
`"Extension started debugging this browser"` on every tab, which interrupts your regular browsing.

**Kawaki Agent Chrome Bridge solves both problems:**
1. **100% Silent Background Execution**: Built entirely on Chrome's native `chrome.scripting` and `chrome.tabs` APIs. **No debugger attached, no infobar banner shown.**
2. **Uses Your Active Profile**: Keep all existing sessions, logged-in Google/OAuth accounts, and cookies.
3. **Dual Interface**:
   - **Local WebSocket (`ws://127.0.0.1:8765`)** for persistent low-latency extension communication.
   - **Local HTTP REST (`http://127.0.0.1:8765`) & CLI** for AI Agents, Python scripts, or terminal automation.

---

## 📂 Repository Structure

```
chrome-exstention/
├── extension/                 # Unpacked Chrome Extension (Manifest V3)
│   ├── manifest.json          # Permissions & MV3 configuration
│   ├── background.js          # Silent background service worker & bridge client
│   ├── popup.html             # Popup status UI
│   ├── popup.js               # Status indicator logic
│   └── icon*.png              # Extension icons
├── bridge/                    # Host automation server & CLI
│   ├── server.js              # Loopback HTTP REST & WebSocket bridge server
│   └── cli.js                 # Terminal CLI for automated control
├── package.json               # Node.js dependencies (ws)
├── .gitignore
└── README.md                  # Complete installation & usage guide
```

---

## 🚀 Quickstart Guide (30 Seconds)

### Step 1: Clone the Repository & Install Dependencies

```bash
git clone https://github.com/gusfing/chrome-exstention.git
cd chrome-exstention
npm install
```

### Step 2: Start the Local Bridge Server

```bash
npm start
```
*You will see:*
```
======================================================
⚡ Kawaki Agent Chrome Bridge Server Online
   Loopback: http://127.0.0.1:8765
   WebSocket: ws://127.0.0.1:8765
======================================================
```

### Step 3: Install the Extension in Google Chrome

1. Open your regular **Google Chrome** browser.
2. In the URL bar, go to:
   ```
   chrome://extensions/
   ```
3. Toggle on **Developer mode** (top-right toggle switch).
4. Click the **Load unpacked** button (top-left).
5. Select the **`extension`** folder inside this repository:
   ```
   path/to/chrome-exstention/extension
   ```
6. The extension icon will appear in your Chrome toolbar. Click it to confirm the green **"Connected"** status!

---

## 🛠️ CLI Usage & Commands

You can control your active Chrome profile directly from any terminal or AI Agent:

```bash
# 1. Check bridge and extension connection status
npm run cli -- status

# 2. List all open tabs across your Chrome windows
npm run cli -- tabs

# 3. Open a URL in a new background tab
npm run cli -- open https://kawaki.co.in

# 4. Navigate an existing tab (pass target tab ID with --tab <id>)
npm run cli -- --tab 573207320 navigate https://kawaki.co.in/about

# 5. Capture a clean PNG screenshot of a tab
npm run cli -- --tab 573207320 screenshot page.png

# 6. Extract page title, URL, and clean text snippet
npm run cli -- --tab 573207320 content

# 7. Click any button, link, or element (supports text match or CSS selector)
npm run cli -- --tab 573207320 click "Sign In"
npm run cli -- --tab 573207320 click "button.submit-btn"

# 8. Fill text into input fields or textareas (supports placeholders or names)
npm run cli -- --tab 573207320 fill "Email" "user@example.com"
npm run cli -- --tab 573207320 fill "textarea[name='bio']" "Full-stack engineer"

# 9. Close a specific tab
npm run cli -- close 573207320
```

---

## 📡 REST API Reference

For integration with AI Agents (e.g. Antigravity, Claude Code, LangChain, AutoGPT) or custom Python/Node scripts, send HTTP POST requests to `http://127.0.0.1:8765/<action>`:

### 1. `GET /status`
Check if the Chrome extension is actively connected over WebSocket.

### 2. `POST /list_tabs`
Returns an array of all open tabs with `id`, `windowId`, `title`, `url`, and `active` state.
```json
{}
```

### 3. `POST /open_tab`
Opens a new tab in the active profile.
```json
{
  "url": "https://example.com",
  "wait": true,
  "active": false
}
```

### 4. `POST /get_content`
Extracts document title, URL, and visible body text.
```json
{
  "tabId": 573207320
}
```

### 5. `POST /screenshot`
Captures visible tab viewport and writes the PNG directly to disk.
```json
{
  "tabId": 573207320,
  "savePath": "screenshots/output.png"
}
```

### 6. `POST /click`
Clicks an element by CSS selector or exact/partial inner text. Emulates full `mousedown`, `mouseup`, and `click` sequence.
```json
{
  "tabId": 573207320,
  "selector": "Save Changes"
}
```

### 7. `POST /fill`
Fills text into `<input>` or `<textarea>` elements using native React-compatible prototype setters and dispatches synthetic `input` and `change` events.
```json
{
  "tabId": 573207320,
  "selector": "input[type='email']",
  "text": "ks05460@gmail.com"
}
```

### 8. `POST /upload_file`
Uploads files to file input elements without local OS file dialog popups using the browser's native `DataTransfer` API:
```json
{
  "tabId": 573207320,
  "selector": "input[type='file']",
  "base64Data": "<base64_encoded_file_string>",
  "fileName": "avatar.png",
  "mimeType": "image/png"
}
```

---

## 🔒 Zero Debugger Banner Guarantee

Google Chrome displays a persistent yellow/blue infobar:  
`"Kawaki Agent Chrome Bridge started debugging this browser [Cancel] [x]"`  
only when the `chrome.debugger` API is attached to a tab.

This extension **does NOT use `chrome.debugger`**. It is built on **`chrome.scripting.executeScript`**, **`chrome.tabs`**, and **`DataTransfer`** APIs. As a result:
- No infobar banner will ever appear.
- You can work in other tabs while the agent performs tasks in worker tabs.
- Strict Content Security Policy (CSP) headers on modern web applications (like Contra, Twitter, GitHub) are fully bypassed by running native functions directly in the extension's isolated execution context.

---

## 🛠️ Troubleshooting

- **Extension Disconnected in Popup**:
  Ensure `npm start` (or `node bridge/server.js`) is running in a terminal.
- **Updating Code**:
  If you edit `background.js` or `manifest.json`, go to `chrome://extensions/` and click the **Reload (⟳)** icon on the extension card once.
- **Throttled Background Tabs**:
  When automating tabs that stay in the background for a long time, use `create_worker_window` to keep the tab active in an off-screen worker window without stealing focus from your main browsing window.

---

## 📄 License

MIT License. Free to use, modify, and integrate into your own automation pipelines.
