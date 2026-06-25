/**
 * Chatbot Widget - Bubble and window shell, minimize/restore, inject CSS vars, init core.
 */
(function () {
  'use strict';

  var STORAGE_MINIMIZED = 'wp_chatbot_widget_minimized';

  function getRoot() {
    return document.getElementById('wp-chatbot-widget-root');
  }

  function applyCssVars(root) {
    var vars = root.getAttribute('data-css-vars');
    if (!vars) return;
    var style = root.style;
    vars.split(';').forEach(function (pair) {
      var i = pair.indexOf(':');
      if (i === -1) return;
      var name = pair.substring(0, i).trim();
      var value = pair.substring(i + 1).trim();
      if (name && value) style.setProperty(name, value);
    });
  }

  function buildMarkup(config) {
    var name = config.chatbotName || 'Assistant';
    var welcome = config.welcomeMessage || 'Hello! How can I help you today?';
    var placeholder = config.inputPlaceholder || 'Type your message...';
    var maxLen = config.maxMessageLength || 500;
    var footerText = config.footerText || '';

    return (
      '<button type="button" class="wp-chatbot-bubble hide" id="wpChatbotBubble" aria-label="Open chat">' +
        '<i class="fas fa-comment-dots"></i>' +
      '</button>' +
      '<div class="wp-chatbot-window" id="wpChatbotWindow">' +
        '<div class="chatbox">' +
          '<div class="chat-header">' +
            '<div class="header-left">' +
              '<h3 id="chatHeaderTitle">' + escapeHtml(name) + '</h3>' +
              '<span class="status-indicator online"></span>' +
            '</div>' +
            '<div class="header-controls">' +
              '<select id="languageSwitch" class="language-switch">' +
                '<option value="en">EN</option><option value="ro">RO</option><option value="fr">FR</option>' +
                '<option value="de">DE</option><option value="hu">HU</option>' +
              '</select>' +
              '<button type="button" class="control-btn theme-toggle" id="themeToggle" title="Toggle theme">' +
                '<i class="fas fa-moon"></i>' +
              '</button>' +
              '<button type="button" class="control-btn settings-btn" id="settingsBtn" title="Settings">' +
                '<i class="fas fa-cog"></i>' +
              '</button>' +
              '<button type="button" class="control-btn minimize-btn" id="minimizeBtn" title="Minimize">' +
                '<i class="fas fa-minus"></i>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="chat-messages" id="chatMessages">' +
            '<div class="welcome-message">' +
              '<div class="bot-avatar"><i class="fas fa-robot"></i></div>' +
              '<div class="message-content"><p>' + escapeHtml(welcome) + '</p></div>' +
            '</div>' +
          '</div>' +
          '<div class="chat-input-container">' +
            '<div class="input-wrapper">' +
              '<input type="text" id="messageInput" placeholder="' + escapeHtml(placeholder) + '" maxlength="' + maxLen + '">' +
              '<button type="button" id="voiceBtn" class="voice-btn" title="Voice">' +
                '<i class="fas fa-microphone"></i>' +
              '</button>' +
              '<button type="button" id="sendBtn" class="send-btn" disabled>' +
                '<i class="fas fa-paper-plane"></i>' +
              '</button>' +
            '</div>' +
            '<div class="input-footer">' +
              (footerText ? '<span class="char-count">' + escapeHtml(footerText) + '</span>' : '<span></span>') +
              '<span class="char-count" id="charCount">0/' + maxLen + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<!-- Settings modal -->' +
        '<div class="modal-overlay" id="settingsModal">' +
          '<div class="modal">' +
            '<div class="modal-header">' +
              '<h3>Settings</h3>' +
              '<button type="button" class="close-btn" id="closeModal"><i class="fas fa-times"></i></button>' +
            '</div>' +
            '<div class="modal-content">' +
              '<div class="setting-group">' +
                '<label>Current Session ID</label>' +
                '<div class="session-info">' +
                  '<code id="sessionIdDisplay">No active session</code>' +
                  '<button type="button" class="copy-btn" id="copySessionId" title="Copy"><i class="fas fa-copy"></i></button>' +
                '</div>' +
              '</div>' +
              '<div class="setting-group">' +
                '<label>Session Started</label>' +
                '<div class="session-time" id="sessionStartTime">-</div>' +
              '</div>' +
              '<div class="setting-group">' +
                '<button type="button" class="delete-session-btn" id="deleteCurrentSessionBtn"><i class="fas fa-trash"></i> Delete Current Session</button>' +
              '</div>' +
              '<div class="setting-group">' +
                '<button type="button" class="delete-all-sessions-btn" id="deleteAllSessionsBtn"><i class="fas fa-trash-alt"></i> Delete All Sessions</button>' +
              '</div>' +
              '<div class="setting-group voice-settings-group">' +
                '<label>Voice Settings</label>' +
                '<div class="voice-settings">' +
                  '<div class="voice-setting-item">' +
                    '<label for="elevenLabsEnabled">Use ElevenLabs</label>' +
                    '<input type="checkbox" id="elevenLabsEnabled" class="voice-checkbox">' +
                  '</div>' +
                  '<div class="voice-setting-item" id="apiKeyContainer" style="display:none">' +
                    '<label for="elevenLabsApiKey">ElevenLabs API Key</label>' +
                    '<input type="password" id="elevenLabsApiKey" class="api-key-input" placeholder="API key">' +
                  '</div>' +
                  '<div class="voice-setting-item" id="voiceSelectContainer" style="display:none">' +
                    '<label for="voiceSelect">Voice</label>' +
                    '<select id="voiceSelect" class="voice-select"><option value="">Loading...</option></select>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="setting-group" id="healthCheckGroup" style="display:none">' +
                '<label>API Status</label>' +
                '<div class="proxy-status">' +
                  '<div class="proxy-status-indicator">' +
                    '<i class="fas fa-circle" id="healthStatusIcon"></i>' +
                    '<span id="healthStatusText">Checking...</span>' +
                  '</div>' +
                  '<button type="button" class="proxy-check-btn" id="checkHealthBtn" title="Check"><i class="fas fa-sync-alt"></i></button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<!-- Voice popup -->' +
        '<div id="voiceConversationPopup" class="voice-popup-overlay">' +
          '<div class="voice-popup">' +
            '<div class="voice-popup-header">' +
              '<h3 id="voicePopupTitle">Voice Conversation</h3>' +
              '<button type="button" id="closeVoicePopup" class="close-voice-btn"><i class="fas fa-times"></i></button>' +
            '</div>' +
            '<div class="voice-conversation-container">' +
              '<div id="listeningState" class="voice-state listening-state">' +
                '<div class="voice-indicator listening-indicator">' +
                  '<div class="listening-dots"><span></span><span></span><span></span></div>' +
                  '<p class="voice-status-text">Listening...</p>' +
                '</div>' +
                '<div class="voice-transcript" id="voiceTranscript"></div>' +
              '</div>' +
              '<div id="speakingState" class="voice-state speaking-state" style="display:none">' +
                '<div class="voice-indicator speaking-indicator">' +
                  '<div class="speaking-wave"><span></span><span></span><span></span><span></span><span></span></div>' +
                  '<p class="voice-status-text">Speaking...</p>' +
                '</div>' +
                '<div class="voice-response" id="voiceResponse"></div>' +
              '</div>' +
              '<div id="waitingState" class="voice-state waiting-state" style="display:none">' +
                '<div class="voice-indicator waiting-indicator">' +
                  '<div class="waiting-spinner"><i class="fas fa-spinner fa-spin"></i></div>' +
                  '<p class="voice-status-text">Processing...</p>' +
                '</div>' +
                '<div class="voice-transcript" id="waitingTranscript"></div>' +
              '</div>' +
              '<div id="errorState" class="voice-state error-state" style="display:none">' +
                '<div class="voice-indicator error-indicator">' +
                  '<i class="fas fa-exclamation-triangle"></i>' +
                  '<p class="voice-status-text">Error occurred</p>' +
                '</div>' +
                '<div class="voice-error-message" id="voiceErrorMessage"></div>' +
              '</div>' +
            '</div>' +
            '<div class="voice-popup-footer">' +
              '<button type="button" id="voicePopupMicBtn" class="voice-mic-btn"><i class="fas fa-microphone"></i></button>' +
              '<p class="voice-instructions">Click microphone to start speaking</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<!-- Job sidebar placeholder (core may append content) -->' +
        '<div id="jobSidebar" class="job-sidebar" style="display:none">' +
          '<div class="job-sidebar-header">' +
            '<h2 id="jobSidebarTitle">Available Jobs</h2>' +
            '<button type="button" id="closeJobSidebar" class="close-job-sidebar"><i class="fas fa-times"></i></button>' +
          '</div>' +
          '<div class="job-listings" id="jobListings"></div>' +
        '</div>' +
      '</div>'
    );
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function init() {
    var config = typeof wpChatbotWidgetConfig !== 'undefined' ? wpChatbotWidgetConfig : null;
    if (!config || !config.chatApiUrl) return;

    var root = getRoot();
    if (!root) return;

    applyCssVars(root);
    var wrapper = document.createElement('div');
    wrapper.className = 'wp-chatbot-widget-inner';
    wrapper.innerHTML = buildMarkup(config);
    root.appendChild(wrapper);

    var bubble = document.getElementById('wpChatbotBubble');
    var windowEl = document.getElementById('wpChatbotWindow');
    var minimizeBtn = document.getElementById('minimizeBtn');

    var minimized = sessionStorage.getItem(STORAGE_MINIMIZED) === '1';

    function showWindow() {
      if (windowEl) windowEl.classList.remove('hide');
      if (bubble) bubble.classList.add('hide');
      sessionStorage.setItem(STORAGE_MINIMIZED, '0');
    }

    function showBubble() {
      if (windowEl) windowEl.classList.add('hide');
      if (bubble) bubble.classList.remove('hide');
      sessionStorage.setItem(STORAGE_MINIMIZED, '1');
    }

    if (minimized) {
      showBubble();
    } else {
      showWindow();
    }

    if (bubble) {
      bubble.addEventListener('click', function (e) {
        e.preventDefault();
        showWindow();
      });
    }

    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', function () {
        showBubble();
      });
    }

    if (typeof window.WPChatbotCore !== 'undefined') {
      window.WPChatbotCore.init(root, config);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
