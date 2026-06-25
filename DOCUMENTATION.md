# WP Chatbot Widget: Plugin Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [WordPress as a Framework: Extension Points Used](#2-wordpress-as-a-framework-extension-points-used)
3. [Architecture](#3-architecture)
4. [File Structure](#4-file-structure)
5. [Installation](#5-installation)
6. [Configuration Reference](#6-configuration-reference)
7. [Backend API Contract](#7-backend-api-contract)
8. [Frontend Module Design](#8-frontend-module-design)
9. [Theming and CSS Variable System](#9-theming-and-css-variable-system)
10. [Security Model](#10-security-model)
11. [Extending the Plugin](#11-extending-the-plugin)
12. [Known Limitations](#12-known-limitations)

---

## 1. Overview

**Live demo:** [fd.projekttech.ro](https://fd.projekttech.ro/). The plugin is deployed and running there; visit to interact with the widget.

**WP Chatbot Widget** is a WordPress plugin that adds a floating chatbot window to any WordPress site's front end. The window is minimizable (collapses to a bubble), supports voice input and output, a multilingual UI, per-message feedback (like/dislike), an optional job-listing sidebar, and a health-check status indicator. Every URL, color, and label is configured through the WordPress admin settings page; no code changes are required to deploy it against a different backend.

The plugin is **backend-agnostic**: it defines a simple HTTP contract (see §7) and delegates all AI logic to the operator's own service.

### Key design principles

| Principle | How it is applied |
|---|---|
| No hardcoded endpoints | All URLs are stored as WordPress options and passed to JS at runtime via `wp_localize_script` |
| Generic / reusable | Works with any backend that satisfies the API contract |
| WordPress-idiomatic | Uses only official WordPress action hooks, Settings API, and asset pipeline |
| Layered JS | UI shell (`chatbot-widget.js`) is decoupled from chat logic (`chatbot-core.js`) |

---

## 2. WordPress as a Framework: Extension Points Used

WordPress provides a hook-based plugin architecture. A plugin registers callbacks against named **action** and **filter** hooks that WordPress fires at defined points in the request lifecycle. This plugin uses four action hooks:

```
add_action( 'admin_menu',        'wp_chatbot_widget_add_settings_page' );
add_action( 'admin_init',        array( 'WP_Chatbot_Widget_Settings', 'register' ) );
add_action( 'wp_enqueue_scripts','wp_chatbot_widget_enqueue_frontend' );
add_action( 'wp_footer',         'wp_chatbot_widget_render_container', 5 );
```

### Hook responsibilities

| Hook | When it fires | What this plugin does |
|---|---|---|
| `admin_menu` | Admin panel menu is built | Registers a settings page under *Settings > Chatbot Widget* |
| `admin_init` | Admin request initialisation | Registers the settings group and sanitize callback via the **Settings API** |
| `wp_enqueue_scripts` | Front-end `<head>` asset phase | Conditionally enqueues CSS and JS; passes PHP config to JS via `wp_localize_script` |
| `wp_footer` | Just before `</body>` on front end | Renders the empty root `<div>` that JS will populate |

### WordPress Settings API

The plugin stores all configuration as a single serialised array under the option key `wp_chatbot_widget_settings`, using the standard three-call pattern:

```php
register_setting( $group, $option_key, [
    'type'              => 'array',
    'sanitize_callback' => [ 'WP_Chatbot_Widget_Settings', 'sanitize' ],
    'default'           => WP_Chatbot_Widget_Settings::get_defaults(),
] );
```

WordPress calls the `sanitize` method before writing to the database on every settings save, ensuring all values are type-safe and properly escaped before storage.

### Capability check

The settings page is gated behind `manage_options`, the standard capability required for site-wide configuration:

```php
if ( ! current_user_can( 'manage_options' ) ) {
    return;
}
```

---

## 3. Architecture

```
WordPress request lifecycle
|
+-- admin_init  ---------------------------------------------------------+
|   WP_Chatbot_Widget_Settings::register()                               |
|   Registers option, sanitize callback, settings group                  |
|                                                                        |
+-- admin_menu  -------------------------------------------------------+ |
|   add_options_page() -> renders admin/settings-page.php              | |
|   PHP form -> WP Settings API -> sanitize() -> wp_options table      | |
|                                                                      | |
+-- Front-end request                                                  | |
    |                                                                  | |
    +-- wp_enqueue_scripts                                             | |
    |   +-- chatbot-widget.css          (styles)                       | |
    |   +-- chatbot-core.js             (chat logic)                   | |
    |   +-- chatbot-widget.js           (UI shell, depends on core)    | |
    |       +-- wp_localize_script -> window.wpChatbotWidgetConfig     | |
    |                                                                  | |
    +-- wp_footer                                                      | |
        +-- <div id="wp-chatbot-widget-root" data-css-vars="...">      | |
                                                                       | |
JavaScript execution (DOMContentLoaded)                                | |
|                                                                       | |
+-- chatbot-widget.js :: init()                                         | |
|   +-- Reads window.wpChatbotWidgetConfig                              | |
|   +-- Parses data-css-vars -> sets CSS custom properties on root      | |
|   +-- Injects widget HTML (bubble + chat window + modals + voice)     | |
|   +-- Sets up minimize / bubble toggle (persisted in sessionStorage)  | |
|   +-- Calls WPChatbotCore.init(root, config)                          | |
|                                                                       | |
+-- chatbot-core.js :: Core(root, config)                               | |
    +-- bindElements()        caches all DOM references                | |
    +-- loadSession()         restores sessionId from localStorage     | |
    +-- setupEventListeners() input, send, theme, settings, voice      | |
    +-- callAPI()             fetch with fallback URL chain + timeout   | |
    +-- sendMessage()         user message -> API -> bot reply         | |
    +-- handleJobFilters()    optional job-sidebar population          | |
    +-- handleLike/Dislike()  optional feedback POSTs                  | |
    +-- voice subsystem       Web Speech API + ElevenLabs TTS          | |
                                                                       | |
                   <-------------- Settings API ----------------------- + |
                   <-------------- admin_menu --------------------------- +
```

---

## 4. File Structure

```
fd-chatbot-plugin/                        (repository root)
|
+-- README.md                             GitHub landing page with screenshots and usage guide.
+-- DOCUMENTATION.md                      This file.
+-- screenshots/                          Demo screenshots referenced in README.md.
|
+-- wp-chatbot-widget/                    The installable plugin directory.
    |
    +-- wp-chatbot-widget.php             Main plugin file. Defines constants, requires includes,
    |                                     registers all four WordPress action hooks.
    |
    +-- includes/
    |   +-- class-settings.php            WP_Chatbot_Widget_Settings class.
    |                                      get_defaults()        canonical default values
    |                                      get_settings()        merge saved + defaults
    |                                      register()            Settings API registration
    |                                      sanitize($input)      validation / escaping
    |                                      get_frontend_config() PHP-to-JS config array
    |                                      get_css_variables()   CSS var string for data attribute
    |
    +-- admin/
    |   +-- settings-page.php             HTML form rendered inside the WP admin. Uses
    |                                     settings_fields(), submit_button(), and WP escaping
    |                                     helpers (esc_attr, esc_html, esc_textarea).
    |
    +-- assets/
        +-- css/
        |   +-- chatbot-widget.css        All styles. CSS custom properties prefixed
        |                                 --wp-cb-* so they cannot clash with theme styles.
        |
        +-- js/
            +-- chatbot-core.js           Self-contained IIFE. Exports window.WPChatbotCore.
            |                             All chat logic: API calls, session, messages, voice,
            |                             feedback, jobs, i18n, theme.
            |
            +-- chatbot-widget.js         Self-contained IIFE. Depends on chatbot-core.js.
                                          Builds the widget HTML, handles minimize/bubble,
                                          applies CSS variables, then delegates to WPChatbotCore.
```

---

## 5. Installation

### Requirements

- WordPress 5.0 or later
- PHP 7.4 or later
- A backend service implementing the API contract (§7)

### Steps

1. Copy the `wp-chatbot-widget/` folder into `/wp-content/plugins/`.
2. In the WordPress admin, go to **Plugins** and activate *Chatbot Widget*.
3. Go to **Settings > Chatbot Widget**.
4. Enter at minimum the **Chat API URL** and **Chatbot name**, then save.
5. Visit the front end; the floating chat window appears.

The widget is only enqueued when **Chat API URL** is non-empty. Leaving it blank disables the widget without deactivating the plugin.

---

## 6. Configuration Reference

All settings are available under **Settings > Chatbot Widget** in the WordPress admin.

### General

| Setting | Key | Default | Description |
|---|---|---|---|
| Chatbot name | `chatbot_name` | `""` | Name displayed in the chat header |
| Welcome message | `welcome_message` | `""` | First message shown when the widget opens |
| Input placeholder | `input_placeholder` | `"Type your message..."` | Placeholder text for the message input |
| Max message length | `max_message_length` | `500` | Characters allowed per message (100-2000) |
| Footer text | `footer_text` | `""` | Small text below the input bar; hidden if empty |

### API

| Setting | Key | Description |
|---|---|---|
| Chat API URL *(required)* | `chat_api_url` | POST endpoint for chat messages |
| Fallback Chat API URL | `fallback_chat_api_url` | Used automatically if the primary URL fails |
| Proxy URL | `proxy_url` | Base URL for a proxy server; prefixed to `/chat`, `/api/elevenlabs/v1/*`, feedback paths |
| Health check URL | `health_check_url` | GET endpoint; result shown as API status in widget settings |

**URL resolution order** for chat: Proxy (`proxy_url + /chat`) > Chat API URL > Fallback Chat API URL. The first successful response is used.

### Appearance

All color settings accept hex values (`#rrggbb`). They are applied as CSS custom properties on the widget root element and do not affect the host theme.

Light-mode properties: `primary_color`, `primary_hover`, `bg_chat`, `bg_user_message`, `bg_bot_message`, `text_primary`, `text_secondary`, `border_color`, and others.

Dark-mode properties: suffixed `_dark` (e.g. `bg_primary_dark`, `text_primary_dark`).

### Voice (ElevenLabs)

| Setting | Key | Description |
|---|---|---|
| Use ElevenLabs | `elevenlabs_enabled` | Enables ElevenLabs TTS; falls back to browser Web Speech API if disabled |
| ElevenLabs API key | `elevenlabs_api_key` | Sent as `xi-api-key` header. Route through Proxy URL to keep it server-side |
| ElevenLabs Voice ID | `elevenlabs_voice_id` | Default voice; user can override in the widget settings panel |

### Feedback

| Setting | Key | Description |
|---|---|---|
| Feedback Like URL | `feedback_like_url` | POST endpoint for thumbs-up events. If empty, like/dislike buttons are hidden |
| Feedback Dislike URL | `feedback_dislike_url` | POST endpoint for thumbs-down events with reason text |

### Optional: Jobs

| Setting | Key | Description |
|---|---|---|
| Jobs API URL | `jobs_api_url` | If set, and the chat response includes `job_filters`, the widget POSTs those filters here and displays results in a sidebar |

---

## 7. Backend API Contract

The plugin works with any backend that implements the following contract.

### Chat endpoint

**Request**

```
POST {chat_api_url}
Content-Type: application/json

{
  "message": "Answer in english: Hello!",
  "redis_session_id": "optional-existing-session-id"
}
```

The `message` field is always prefixed with `"Answer in {language}: "` by the client, based on the user's selected UI language. The `redis_session_id` is omitted on the first message and included on subsequent messages so the backend can maintain conversation context.

**Response**

```json
{
  "answer": "Hello! How can I help you?",
  "redis_session_id": "abc123",
  "job_filters": { "occupation": "developer", "current": 1, "rowCount": 10 }
}
```

| Field | Required | Description |
|---|---|---|
| `answer` | Yes | The bot's reply text. Supports `**bold**`, `[link](url)`, `* list item`, and newlines |
| `redis_session_id` | Recommended | Session token echoed back; stored in `localStorage` and sent on future requests |
| `job_filters` | No | If present and `jobs_api_url` is configured, triggers the job sidebar |

### Feedback endpoints

**Like**
```
POST {feedback_like_url}
Content-Type: application/json

{
  "type": "like",
  "message": "The full bot message text",
  "sessionId": "abc123",
  "timestamp": "2026-06-25T11:00:00.000Z",
  "likedMessagesCount": 3
}
```

**Dislike**
```
POST {feedback_dislike_url}
Content-Type: application/json

{
  "type": "dislike",
  "message": "The full bot message text",
  "reason": "User-supplied reason text",
  "sessionId": "abc123",
  "timestamp": "2026-06-25T11:00:00.000Z"
}
```

### Health check endpoint

```
GET {health_check_url}
```

Any 2xx response is treated as healthy. The result is shown as "OK" (green) or an error code (red) in the widget's settings panel.

### Jobs endpoint

```
POST {jobs_api_url}
Content-Type: application/json

{ ...job_filters from chat response, "current": 1, "rowCount": 100 }
```

Expected response:
```json
{ "rows": [ { "occupation": "...", "employer_name": "...", "address_locality_name": "..." } ] }
```

The plugin also accepts `data` instead of `rows`. Per-job fields used: `occupation` / `title` / `cor_name`, `employer_name` / `angajator` / `company`, `address_locality_name` / `location`.

---

## 8. Frontend Module Design

Both JavaScript files are **immediately-invoked function expressions (IIFEs)** that expose nothing to the global scope except the minimum required interface.

### `chatbot-core.js` / `window.WPChatbotCore`

Exports a single object with one method:

```js
window.WPChatbotCore = {
  init: function(rootElement, config) { ... }
};
```

Internally it creates a `Core` instance (constructor function, prototype-based) which owns:

- **Session management:** `loadSession()` / `saveSession()` backed by `localStorage`
- **API call chain:** `getChatUrls()` builds an ordered list; `callAPI()` tries each URL with an `AbortController` timeout (180 s)
- **Message rendering:** `addMessage()` creates DOM elements; `formatMessage()` converts a Markdown subset (`**bold**`, `[link](url)`, `* list`) to HTML
- **Voice subsystem:** `startListeningInPopup()` uses the browser's `SpeechRecognition` API; `speakWithElevenLabsInPopup()` fetches audio from ElevenLabs and plays it via `<audio>`; `speakWithWebSpeechInPopup()` falls back to `SpeechSynthesisUtterance`
- **i18n:** a `translations` map keyed by language code (en / ro / fr / de / hu); `getT()` returns the active translation object

### `chatbot-widget.js`

Depends on `chatbot-core.js` (declared via `wp_enqueue_script` dependency array).

Responsibilities:
1. Reads `window.wpChatbotWidgetConfig` (injected by `wp_localize_script`)
2. Parses the `data-css-vars` attribute from the root element and applies each value as a CSS custom property
3. Builds the full widget HTML string via `buildMarkup(config)` and inserts it into the root `<div>`
4. Manages the minimize/restore toggle between the chat window and the floating bubble, persisted in `sessionStorage`
5. Calls `WPChatbotCore.init(root, config)` to hand off chat logic

If `wpChatbotWidgetConfig` is absent or has no `chatApiUrl`, the script exits without doing anything.

### PHP to JavaScript data bridge

`wp_localize_script` outputs a `<script>` block that assigns the config to a named global before the plugin scripts run:

```html
<script>
var wpChatbotWidgetConfig = {
  "chatApiUrl": "https://example.com/chat",
  "chatbotName": "Support Assistant",
  "primaryColor": "#f97316",
  ...
};
</script>
```

---

## 9. Theming and CSS Variable System

All CSS custom properties are prefixed `--wp-cb-` to avoid collisions with the host WordPress theme.

`WP_Chatbot_Widget_Settings::get_css_variables()` serialises the color settings into a semicolon-delimited string of `name:value` pairs and stores it in the `data-css-vars` attribute of the root `<div>`. JavaScript then applies each pair as an inline style on that element:

```js
style.setProperty('--wp-cb-primary-color', '#f97316');
```

All CSS rules in `chatbot-widget.css` use `var(--wp-cb-*)` tokens, and those properties are set on the root element, so theming is scoped to the widget. The admin settings page is the single place to update colors.

Dark mode is toggled by setting `data-theme="dark"` on the root element, which CSS targets via `[data-theme="dark"]` selectors.

---

## 10. Security Model

### Admin side

- All settings are processed through WordPress's Settings API. `sanitize()` applies:
  - `esc_url_raw()` on every URL field
  - `sanitize_text_field()` on every text field
  - `sanitize_hex_color()` on every color field
  - `absint()` + range clamping on integer fields
- The settings page is protected by `current_user_can('manage_options')`.
- All output in `settings-page.php` uses `esc_attr()`, `esc_html()`, and `esc_textarea()`.

### Front end

- `escapeHtml()` (defined in both JS files) uses a throwaway `<div>.textContent` assignment to safely HTML-encode any user-supplied or API-returned strings before insertion into the DOM, preventing XSS from malicious API responses.
- Feedback and session buttons use `.addEventListener`; no inline event handlers are set via `.innerHTML`.

### ElevenLabs API key exposure

When `elevenlabs_api_key` is set in the WordPress admin, it is passed to the browser via `wp_localize_script` and is visible in page source. To avoid this, configure a **Proxy URL** so the browser communicates only with your own proxy, which holds the real API key server-side. The plugin's `proxyUrl` setting supports this pattern:

```
ElevenLabs voices:    GET  {proxyUrl}/api/elevenlabs/v1/voices
ElevenLabs TTS:       POST {proxyUrl}/api/elevenlabs/v1/text-to-speech/{voiceId}
```

---

## 11. Extending the Plugin

### Add a new UI language

1. Open `assets/js/chatbot-core.js`.
2. Add a new entry to the `translations` object at the top of the IIFE (all keys must be present):

```js
var translations = {
  // ... existing languages ...
  es: {
    noSession: 'Sin sesion activa',
    charCount: function(c, max) { return c + '/' + max; },
    error: 'Se produjo un error. Por favor, intentelo de nuevo.',
    // ... all other keys ...
  }
};
```

3. Add the new `<option>` in `buildMarkup()` inside `chatbot-widget.js`:

```js
'<option value="es">ES</option>'
```

4. Add the language name mapping in `sendMessage()` and `sendVoiceMessage()` in `chatbot-core.js`:

```js
var langNames = { en: 'english', ro: 'romanian', ..., es: 'spanish' };
```

### Add a new admin setting

1. Add the new key and default value to `get_defaults()` in `class-settings.php`.
2. Add the sanitization logic to `sanitize()` (choose the appropriate escaping function for the data type).
3. Add the field to `get_frontend_config()` if it needs to be available in JavaScript.
4. Add the HTML `<input>` row in `admin/settings-page.php`.
5. Use the value in `chatbot-core.js` or `chatbot-widget.js` via `config.yourNewKey`.

### Change the backend

Update **Chat API URL** in the admin settings to point to any service that implements the contract in §7. The fallback and proxy fields provide resilience without touching plugin code.

### Override styles

All styles use `--wp-cb-*` custom properties, so the simplest customisation is through the admin color pickers. For structural changes, add a `<style>` block in your theme targeting `.wp-chatbot-widget-inner` or its children. The plugin uses single class selectors throughout, so theme overrides take precedence without needing `!important`.

---

## 12. Known Limitations

- **No server-side message proxying.** Messages travel directly from the user's browser to the configured API URL. CORS must be enabled on the backend.
- **No nonce/CSRF on feedback endpoints.** Feedback POSTs are unauthenticated fire-and-forget calls; the backend should treat them as untrusted signals.
- **Speech Recognition browser support.** `window.SpeechRecognition` / `window.webkitSpeechRecognition` is available in Chromium-based browsers and Safari 14.1+. Firefox does not support it. The voice button is always shown; unsupported browsers receive a graceful error message.
- **Session stored in localStorage.** The session ID is not encrypted. It is a convenience token for backend session continuity, not an authentication credential.
- **Single widget instance per page.** The plugin renders one `#wp-chatbot-widget-root` element in `wp_footer`. Running multiple independent widgets on the same page is not supported.
