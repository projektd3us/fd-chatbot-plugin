=== Chatbot Widget ===

Contributors: (your name)
Tags: chatbot, widget, floating, ai, assistant
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Generic floating chatbot window (minimizable, bubble when minimized). All URLs, chatbot name, and appearance are configured in Settings → Chatbot Widget. No hardcoded endpoints.

== Description ==

This plugin adds a floating chatbot to your site. When minimized, a bubble appears; clicking it restores the chat window. The widget uses the same chat UI as the reference demo: header (name, language, theme, settings, minimize), messages, input with voice button, and optional feedback (like/dislike), job sidebar, and voice conversation popup.

All configuration is done in **Settings → Chatbot Widget**. You can set:

* **General:** Chatbot name, welcome message, input placeholder, max message length, footer text
* **API:** Chat API URL (required), fallback chat URL, proxy URL (optional), health check URL
* **Appearance:** Primary color, primary hover, user/bot message backgrounds, text colors, etc.
* **Voice:** ElevenLabs enabled, API key, voice ID (optional)
* **Feedback:** Like URL, dislike URL (optional; if set, like/dislike buttons are shown)
* **Optional:** Jobs API URL (if your backend returns job_filters and you want to show a job sidebar)

No chatbot names or API URLs are stored in the plugin code. The plugin is generic and can be used with any backend that implements the expected API contract.

== API contract ==

**Chat**
* Request: POST to your Chat API URL (or proxy + /chat) with JSON body: `{ "message": "string", "redis_session_id": "optional-session-id" }`
* Response: JSON with `answer` (string), optional `redis_session_id`, optional `job_filters` (object to POST to Jobs API URL)

**Feedback (optional)**
* Like: POST to Feedback Like URL with body e.g. `{ "type": "like", "message": "...", "sessionId": "...", "timestamp": "...", "likedMessagesCount": number }`
* Dislike: POST to Feedback Dislike URL with body e.g. `{ "type": "dislike", "message": "...", "reason": "...", "sessionId": "...", "timestamp": "..." }`

**Health check (optional)**
* GET to Health check URL; 2xx = OK, shown in widget settings as "API Status"

**Jobs (optional)**
* When the chat response includes `job_filters`, the plugin POSTs that object to Jobs API URL and displays the response (expects `rows` or `data` array of job objects).

**ElevenLabs (optional)**
* If Proxy URL is set, voices and TTS are requested from proxy (e.g. proxy + /api/elevenlabs/v1/voices and /api/elevenlabs/v1/text-to-speech/:voice_id). Otherwise direct ElevenLabs API is used (requires CORS or server-side proxy).

== Installation ==

1. Upload the `wp-chatbot-widget` folder to `/wp-content/plugins/`
2. Activate the plugin in the WordPress admin
3. Go to Settings → Chatbot Widget and enter at least the **Chat API URL** and **Chatbot name**
4. Save. The widget appears on the front end; minimize it to see the bubble.

== Frequently Asked Questions ==

= The widget does not appear =

Ensure **Chat API URL** is set in Settings → Chatbot Widget. The widget is only enqueued when that value is not empty.

= How do I use my own backend? =

Set Chat API URL to your POST endpoint. Your server should accept JSON `{ "message": "...", "redis_session_id": "..." }` and return JSON `{ "answer": "...", "redis_session_id": "..." }`. Configure other options (feedback URLs, health URL, colors, name) as needed.

== Changelog ==

= 1.0.0 =
* Initial release. Floating window, bubble when minimized, config-driven API and appearance.
