/**
 * Chatbot Widget - Config-driven chat logic. No hardcoded URLs.
 * Expects: window.WPChatbotCore.init(rootElement, config)
 */
(function () {
  'use strict';

  var SESSION_KEY = 'wp_chatbot_session';
  var HISTORY_KEY = 'wp_chatbot_history';

  var translations = {
    en: { noSession: 'No active session', charCount: function (c, max) { return c + '/' + max; }, error: 'Sorry, an error occurred. Please try again.', reportIssue: 'Report Issue', messageYouDisliked: 'Message you disliked:', pleaseTellUs: 'Please tell us what was wrong:', describeIssue: 'Describe the issue...', cancel: 'Cancel', submitReport: 'Submit Report', submitting: 'Submitting...', thankYouFeedback: 'Thank you for your feedback!', pleaseProvideReason: 'Please provide a reason.', voicePopupTitle: 'Voice Conversation', listeningText: 'Listening...', speakingText: 'Speaking...', processingText: 'Processing...', errorOccurredText: 'Error occurred', voiceInstructions: 'Click microphone to start speaking.', jobSidebarTitle: 'Available Jobs', noJobsFound: 'No jobs found.', jobLoadingError: 'Error loading jobs.' },
    ro: { noSession: 'Nicio sesiune activă', charCount: function (c, max) { return c + '/' + max; }, error: 'A apărut o eroare. Te rugăm să încerci din nou.', reportIssue: 'Raportează problema', messageYouDisliked: 'Mesajul pe care l-ai dezaprobat:', pleaseTellUs: 'Te rugăm să ne spui ce nu a fost în regulă:', describeIssue: 'Descrie problema...', cancel: 'Anulează', submitReport: 'Trimite raportul', submitting: 'Se trimite...', thankYouFeedback: 'Mulțumim pentru feedback!', pleaseProvideReason: 'Te rugăm să oferi un motiv.', voicePopupTitle: 'Conversație vocală', listeningText: 'Se ascultă...', speakingText: 'Se vorbește...', processingText: 'Se procesează...', errorOccurredText: 'A apărut o eroare', voiceInstructions: 'Apasă microfonul pentru a vorbi.', jobSidebarTitle: 'Locuri de muncă disponibile', noJobsFound: 'Nu au fost găsite locuri.', jobLoadingError: 'Eroare la încărcare.' },
    fr: { noSession: 'Aucune session active', charCount: function (c, max) { return c + '/' + max; }, error: 'Une erreur s\'est produite. Veuillez réessayer.', reportIssue: 'Signaler un problème', messageYouDisliked: 'Message que vous n\'avez pas aimé :', pleaseTellUs: 'Veuillez nous dire ce qui n\'allait pas :', describeIssue: 'Décrivez le problème...', cancel: 'Annuler', submitReport: 'Soumettre le rapport', submitting: 'Soumission...', thankYouFeedback: 'Merci pour vos commentaires !', pleaseProvideReason: 'Veuillez fournir une raison.', voicePopupTitle: 'Conversation vocale', listeningText: 'Écoute...', speakingText: 'Parle...', processingText: 'Traitement...', errorOccurredText: 'Une erreur s\'est produite', voiceInstructions: 'Cliquez sur le micro pour parler.', jobSidebarTitle: 'Emplois disponibles', noJobsFound: 'Aucun emploi trouvé.', jobLoadingError: 'Erreur lors du chargement.' },
    de: { noSession: 'Keine aktive Sitzung', charCount: function (c, max) { return c + '/' + max; }, error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', reportIssue: 'Problem melden', messageYouDisliked: 'Nachricht, die Ihnen nicht gefallen hat:', pleaseTellUs: 'Bitte teilen Sie uns mit, was nicht stimmte:', describeIssue: 'Beschreiben Sie das Problem...', cancel: 'Abbrechen', submitReport: 'Bericht einreichen', submitting: 'Wird übermittelt...', thankYouFeedback: 'Vielen Dank für Ihr Feedback!', pleaseProvideReason: 'Bitte geben Sie einen Grund an.', voicePopupTitle: 'Sprachkonversation', listeningText: 'Hört zu...', speakingText: 'Spricht...', processingText: 'Verarbeitung...', errorOccurredText: 'Ein Fehler ist aufgetreten', voiceInstructions: 'Klicken Sie auf das Mikrofon zum Sprechen.', jobSidebarTitle: 'Verfügbare Stellen', noJobsFound: 'Keine Stellen gefunden.', jobLoadingError: 'Fehler beim Laden.' },
    hu: { noSession: 'Nincs aktív munkamenet', charCount: function (c, max) { return c + '/' + max; }, error: 'Hiba történt. Kérjük, próbálja újra.', reportIssue: 'Probléma jelentése', messageYouDisliked: 'Az Ön által nem kedvelt üzenet:', pleaseTellUs: 'Kérjük, mondja el, mi volt a probléma:', describeIssue: 'Írja le a problémát...', cancel: 'Mégse', submitReport: 'Jelentés elküldése', submitting: 'Küldés...', thankYouFeedback: 'Köszönjük a visszajelzést!', pleaseProvideReason: 'Kérjük, adjon indokot.', voicePopupTitle: 'Hangos beszélgetés', listeningText: 'Hallgat...', speakingText: 'Beszél...', processingText: 'Feldolgozás...', errorOccurredText: 'Hiba történt', voiceInstructions: 'Kattintson a mikrofonra a beszédhez.', jobSidebarTitle: 'Elérhető állások', noJobsFound: 'Nem találhatók állások.', jobLoadingError: 'Hiba a betöltéskor.' }
  };

  function Core(root, config) {
    this.root = root;
    this.config = config || {};
    this.sessionId = null;
    this.sessionStartTime = null;
    this.isLoading = false;
    this.language = (typeof localStorage !== 'undefined' && localStorage.getItem('wp_chatbot_language')) || 'en';
    this.isDarkMode = (typeof localStorage !== 'undefined' && localStorage.getItem('wp_chatbot_darkMode') === 'true') || false;
    this.elevenLabsEnabled = !!config.elevenlabsEnabled;
    this.elevenLabsApiKey = config.elevenlabsApiKey || '';
    this.currentVoiceId = config.elevenlabsVoiceId || '';
    this.availableVoices = [];
    this.isVoicePopupOpen = false;
    this.isListeningInPopup = false;
    this.isSpeakingInPopup = false;
    this.isWaitingForResponse = false;
    this.popupRecognition = null;
    this.popupAudio = null;
    this.speechSynthesis = typeof window !== 'undefined' && window.speechSynthesis;
    this.voiceRate = 1;
    this.voicePitch = 1;
    this.voiceVolume = 1;
    this.likedMessagesCount = 0;
    this.elements = {};
  }

  Core.prototype.getT = function () {
    return translations[this.language] || translations.en;
  };

  Core.prototype.bindElements = function () {
    var r = this.root;
    this.elements.messageInput = r.querySelector('#messageInput');
    this.elements.sendBtn = r.querySelector('#sendBtn');
    this.elements.chatMessages = r.querySelector('#chatMessages');
    this.elements.themeToggle = r.querySelector('#themeToggle');
    this.elements.settingsBtn = r.querySelector('#settingsBtn');
    this.elements.settingsModal = r.querySelector('#settingsModal');
    this.elements.closeModal = r.querySelector('#closeModal');
    this.elements.deleteCurrentSessionBtn = r.querySelector('#deleteCurrentSessionBtn');
    this.elements.deleteAllSessionsBtn = r.querySelector('#deleteAllSessionsBtn');
    this.elements.sessionIdDisplay = r.querySelector('#sessionIdDisplay');
    this.elements.sessionStartTime = r.querySelector('#sessionStartTime');
    this.elements.copySessionId = r.querySelector('#copySessionId');
    this.elements.charCount = r.querySelector('#charCount');
    this.elements.languageSwitch = r.querySelector('#languageSwitch');
    this.elements.chatHeader = r.querySelector('#chatHeaderTitle');
    this.elements.voiceBtn = r.querySelector('#voiceBtn');
    this.elements.voiceConversationPopup = r.querySelector('#voiceConversationPopup');
    this.elements.closeVoicePopup = r.querySelector('#closeVoicePopup');
    this.elements.voicePopupMicBtn = r.querySelector('#voicePopupMicBtn');
    this.elements.listeningState = r.querySelector('#listeningState');
    this.elements.speakingState = r.querySelector('#speakingState');
    this.elements.waitingState = r.querySelector('#waitingState');
    this.elements.errorState = r.querySelector('#errorState');
    this.elements.voiceTranscript = r.querySelector('#voiceTranscript');
    this.elements.voiceResponse = r.querySelector('#voiceResponse');
    this.elements.waitingTranscript = r.querySelector('#waitingTranscript');
    this.elements.voiceErrorMessage = r.querySelector('#voiceErrorMessage');
    this.elements.jobSidebar = r.querySelector('#jobSidebar');
    this.elements.jobListings = r.querySelector('#jobListings');
    this.elements.closeJobSidebar = r.querySelector('#closeJobSidebar');
    this.elements.jobSidebarTitle = r.querySelector('#jobSidebarTitle');
    this.elements.healthCheckGroup = r.querySelector('#healthCheckGroup');
    this.elements.healthStatusIcon = r.querySelector('#healthStatusIcon');
    this.elements.healthStatusText = r.querySelector('#healthStatusText');
    this.elements.checkHealthBtn = r.querySelector('#checkHealthBtn');
    this.elements.elevenLabsEnabled = r.querySelector('#elevenLabsEnabled');
    this.elements.elevenLabsApiKey = r.querySelector('#elevenLabsApiKey');
    this.elements.voiceSelect = r.querySelector('#voiceSelect');
    this.elements.apiKeyContainer = r.querySelector('#apiKeyContainer');
    this.elements.voiceSelectContainer = r.querySelector('#voiceSelectContainer');
  };

  Core.prototype.loadSession = function () {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        this.sessionId = s.id;
        this.sessionStartTime = s.startTime ? new Date(s.startTime) : null;
      }
    } catch (e) {}
  };

  Core.prototype.saveSession = function () {
    if (this.sessionId && this.sessionStartTime) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        id: this.sessionId,
        startTime: this.sessionStartTime.toISOString()
      }));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  Core.prototype.getChatUrls = function () {
    var c = this.config;
    var urls = [];
    if (c.proxyUrl) {
      urls.push(c.proxyUrl.replace(/\/$/, '') + '/chat');
    }
    if (c.chatApiUrl) urls.push(c.chatApiUrl);
    if (c.fallbackChatApiUrl) urls.push(c.fallbackChatApiUrl);
    return urls;
  };

  Core.prototype.callAPI = function (message) {
    var self = this;
    var urls = this.getChatUrls();
    if (!urls.length) return Promise.reject(new Error('No chat API URL configured'));

    var body = { message: message };
    if (this.sessionId) body.redis_session_id = this.sessionId;

    var timeout = 180000;
    function fetchOne(url) {
      var controller = new AbortController();
      var tid = setTimeout(function () { controller.abort(); }, timeout);
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      }).then(function (res) {
        clearTimeout(tid);
        return res;
      }).catch(function (err) {
        clearTimeout(tid);
        throw err;
      });
    }

    function tryNext(i) {
      if (i >= urls.length) return Promise.reject(new Error('All chat endpoints failed'));
      return fetchOne(urls[i]).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).catch(function (err) {
        return tryNext(i + 1);
      });
    }
    return tryNext(0);
  };

  Core.prototype.formatMessage = function (text) {
    if (!text) return '';
    var s = String(text)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
    var lines = s.split('<br>');
    var result = [];
    var inList = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line.indexOf('*') === 0) {
        if (!inList) { result.push('<ul>'); inList = true; }
        result.push('<li>' + line.substring(1).trim() + '</li>');
      } else {
        if (inList) { result.push('</ul>'); inList = false; }
        if (line) result.push('<p>' + line + '</p>');
      }
    }
    if (inList) result.push('</ul>');
    return result.join('');
  };

  Core.prototype.addMessage = function (content, sender, isError, isVoice) {
    var el = this.elements.chatMessages;
    if (!el) return;
    var div = document.createElement('div');
    div.className = 'message ' + sender;
    var avatar = document.createElement('div');
    avatar.className = 'message-avatar ' + sender + '-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    var msgContent = document.createElement('div');
    msgContent.className = 'message-content';
    msgContent.innerHTML = this.formatMessage(content);
    if (isError) {
      msgContent.style.background = 'var(--danger-color)';
      msgContent.style.color = 'white';
    }
    if (sender === 'user') {
      div.appendChild(avatar);
      div.appendChild(msgContent);
    } else {
      var wrap = document.createElement('div');
      wrap.className = 'message-content-wrapper';
      wrap.appendChild(avatar);
      wrap.appendChild(msgContent);
      div.appendChild(wrap);
      if (this.config.showFeedback && !isError) {
        var fb = document.createElement('div');
        fb.className = 'message-feedback';
        var likeBtn = document.createElement('button');
        likeBtn.className = 'feedback-btn like-btn';
        likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        likeBtn.onclick = (function (c) { return function () { this.handleLike(c); }.bind(this); })(content);
        var dislikeBtn = document.createElement('button');
        dislikeBtn.className = 'feedback-btn dislike-btn';
        dislikeBtn.innerHTML = '<i class="fas fa-thumbs-down"></i>';
        dislikeBtn.onclick = (function (c) { return function () { this.handleDislike(c); }.bind(this); })(content);
        fb.appendChild(likeBtn);
        fb.appendChild(dislikeBtn);
        div.appendChild(fb);
      }
    }
    el.appendChild(div);
    this.scrollToBottom();
  };

  Core.prototype.showTypingIndicator = function () {
    var id = 'typing-' + Date.now();
    var div = document.createElement('div');
    div.id = id;
    div.className = 'message bot';
    div.innerHTML = '<div class="message-content-wrapper">' +
      '<div class="message-avatar bot-avatar"><i class="fas fa-robot"></i></div>' +
      '<div class="typing-indicator"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>';
    this.elements.chatMessages.appendChild(div);
    this.scrollToBottom();
    return id;
  };

  Core.prototype.removeTypingIndicator = function (id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  };

  Core.prototype.scrollToBottom = function () {
    var el = this.elements.chatMessages;
    if (el) el.scrollTop = el.scrollHeight;
  };

  Core.prototype.updateCharCount = function () {
    var input = this.elements.messageInput;
    var countEl = this.elements.charCount;
    if (!input || !countEl) return;
    var max = this.config.maxMessageLength || 500;
    var c = input.value.length;
    countEl.textContent = this.getT().charCount(c, max);
  };

  Core.prototype.toggleSendButton = function () {
    var send = this.elements.sendBtn;
    var input = this.elements.messageInput;
    if (send && input) send.disabled = !input.value.trim() || this.isLoading;
  };

  Core.prototype.sendMessage = function () {
    var self = this;
    var input = this.elements.messageInput;
    var t = this.getT();
    var msg = input && input.value.trim();
    if (!msg || this.isLoading) return;

    this.addMessage(msg, 'user');
    input.value = '';
    this.updateCharCount();
    this.toggleSendButton();

    var langNames = { en: 'english', ro: 'romanian', fr: 'french', de: 'german', hu: 'hungarian' };
    var lang = langNames[this.language] || this.language;
    var messageWithLang = 'Answer in ' + lang + ': ' + msg;

    var typingId = this.showTypingIndicator();
    this.isLoading = true;
    this.toggleSendButton();

    this.callAPI(messageWithLang).then(function (res) {
      self.removeTypingIndicator(typingId);
      self.isLoading = false;
      self.toggleSendButton();

      if (res.redis_session_id) {
        self.sessionId = res.redis_session_id;
        if (!self.sessionStartTime) self.sessionStartTime = new Date();
        self.saveSession();
      }

      if (res.job_filters && self.config.jobsApiUrl) {
        self.handleJobFilters(res.job_filters);
      }
      if (res.answer) {
        self.addMessage(res.answer, 'bot');
      }
    }).catch(function (err) {
      self.removeTypingIndicator(typingId);
      self.isLoading = false;
      self.toggleSendButton();
      self.addMessage(t.error, 'bot', true);
    });
  };

  Core.prototype.handleJobFilters = function (filters) {
    var self = this;
    var url = this.config.jobsApiUrl;
    if (!url || !this.elements.jobSidebar || !this.elements.jobListings) return;
    this.elements.jobSidebar.style.display = 'flex';
    this.elements.jobSidebar.classList.add('active');
    this.elements.jobListings.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-muted)"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    var payload = filters && typeof filters === 'object' ? filters : {};
    if (!payload.current) payload.current = 1;
    if (!payload.rowCount) payload.rowCount = 100;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.ok ? r.json() : Promise.reject(new Error(r.status)); }).then(function (data) {
      var rows = data.rows || data.data || [];
      var html = '';
      if (rows.length === 0) html = '<p class="char-count">' + (self.getT().noJobsFound || 'No jobs found.') + '</p>';
      else {
        rows.forEach(function (job) {
          var title = job.occupation || job.title || job.cor_name || 'Job';
          var emp = job.employer_name || job.angajator || job.company || '';
          var loc = job.address_locality_name || job.location || '';
          html += '<div class="job-card"><div class="job-card-title">' + escapeHtml(title) + '</div>';
          if (emp) html += '<div class="job-card-company">' + escapeHtml(emp) + '</div>';
          if (loc) html += '<div class="job-card-location">' + escapeHtml(loc) + '</div></div>';
        });
      }
      self.elements.jobListings.innerHTML = html;
    }).catch(function () {
      self.elements.jobListings.innerHTML = '<p class="char-count">' + (self.getT().jobLoadingError || 'Error loading jobs.') + '</p>';
    });
  };

  function escapeHtml(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  Core.prototype.closeJobSidebar = function () {
    var sb = this.elements.jobSidebar;
    if (sb) {
      sb.classList.remove('active');
      sb.style.display = 'none';
    }
  };

  Core.prototype.handleLike = function (messageContent) {
    var url = this.config.feedbackLikeUrl;
    if (!url) return;
    this.likedMessagesCount++;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'like',
        message: messageContent,
        sessionId: this.sessionId || 'no-session',
        timestamp: new Date().toISOString(),
        likedMessagesCount: this.likedMessagesCount
      })
    }).catch(function () {});
  };

  Core.prototype.handleDislike = function (messageContent) {
    var url = this.config.feedbackDislikeUrl;
    if (!url) return;
    var t = this.getT();
    var overlay = document.createElement('div');
    overlay.className = 'dislike-popup-overlay';
    overlay.id = 'dislikePopup';
    overlay.innerHTML = '<div class="dislike-popup">' +
      '<div class="dislike-popup-header"><h3>' + t.reportIssue + '</h3><button type="button" class="close-dislike-popup"><i class="fas fa-times"></i></button></div>' +
      '<div class="dislike-popup-content">' +
        '<div class="disliked-message"><h4>' + t.messageYouDisliked + '</h4><div class="message-preview"></div></div>' +
        '<label for="dislikeReason">' + t.pleaseTellUs + '</label>' +
        '<textarea id="dislikeReason" rows="4" maxlength="500" placeholder="' + t.describeIssue + '"></textarea>' +
        '<div class="char-count-dislike">0/500</div>' +
        '<div class="dislike-popup-actions">' +
          '<button type="button" class="cancel-btn">' + t.cancel + '</button>' +
          '<button type="button" class="submit-btn">' + t.submitReport + '</button>' +
        '</div></div></div>';
    var preview = overlay.querySelector('.message-preview');
    preview.textContent = (messageContent || '').replace(/<[^>]+>/g, '').substring(0, 200);
    this.root.appendChild(overlay);
    var textarea = overlay.querySelector('#dislikeReason');
    var closeBtn = overlay.querySelector('.close-dislike-popup');
    var cancelBtn = overlay.querySelector('.cancel-btn');
    var submitBtn = overlay.querySelector('.submit-btn');
    var charCount = overlay.querySelector('.char-count-dislike');
    function close() {
      overlay.classList.remove('show');
      setTimeout(function () { overlay.remove(); }, 300);
    }
    closeBtn.onclick = close;
    cancelBtn.onclick = close;
    overlay.onclick = function (e) { if (e.target === overlay) close(); };
    textarea.oninput = function () {
      var c = textarea.value.length;
      charCount.textContent = c + '/500';
    };
    setTimeout(function () { overlay.classList.add('show'); }, 10);
    submitBtn.onclick = (function (self, msg, url) {
      return function () {
        var reason = textarea.value.trim();
        if (!reason) { alert(t.pleaseProvideReason); return; }
        submitBtn.disabled = true;
        submitBtn.textContent = t.submitting;
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'dislike',
            message: msg,
            reason: reason,
            sessionId: self.sessionId || 'no-session',
            timestamp: new Date().toISOString()
          })
        }).then(function () {
          alert(t.thankYouFeedback);
          close();
        }).catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = t.submitReport;
        });
      };
    })(this, messageContent, url);
  };

  Core.prototype.applyTheme = function () {
    this.root.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    localStorage.setItem('wp_chatbot_darkMode', this.isDarkMode);
    var icon = this.root.querySelector('#themeToggle i');
    if (icon) {
      icon.classList.remove('fa-moon', 'fa-sun');
      icon.classList.add(this.isDarkMode ? 'fa-sun' : 'fa-moon');
    }
  };

  Core.prototype.openSettings = function () {
    this.updateSettingsDisplay();
    if (this.elements.settingsModal) this.elements.settingsModal.classList.add('active');
    if (this.config.healthCheckUrl) this.checkHealth();
    this.updateElevenLabsUI();
  };

  Core.prototype.closeSettings = function () {
    if (this.elements.settingsModal) this.elements.settingsModal.classList.remove('active');
  };

  Core.prototype.updateSettingsDisplay = function () {
    var t = this.getT();
    if (this.elements.sessionIdDisplay) this.elements.sessionIdDisplay.textContent = this.sessionId || t.noSession;
    if (this.elements.sessionStartTime) this.elements.sessionStartTime.textContent = this.sessionStartTime ? this.sessionStartTime.toLocaleString() : '-';
  };

  Core.prototype.deleteCurrentSession = function () {
    this.sessionId = null;
    this.sessionStartTime = null;
    this.saveSession();
    localStorage.removeItem(HISTORY_KEY);
    this.clearMessageHistory();
    this.updateSettingsDisplay();
    this.closeJobSidebar();
  };

  Core.prototype.deleteAllSessions = function () {
    this.deleteCurrentSession();
  };

  Core.prototype.copySessionId = function () {
    if (!this.sessionId) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(this.sessionId);
    }
  };

  Core.prototype.checkHealth = function () {
    var url = this.config.healthCheckUrl;
    if (!url || !this.elements.healthStatusIcon || !this.elements.healthStatusText) return;
    var icon = this.elements.healthStatusIcon;
    var text = this.elements.healthStatusText;
    text.textContent = 'Checking...';
    icon.style.color = '';
    fetch(url, { method: 'GET' }).then(function (r) {
      if (r.ok) {
        text.textContent = 'OK';
        icon.style.color = 'var(--success-color)';
      } else {
        text.textContent = 'Error ' + r.status;
        icon.style.color = 'var(--danger-color)';
      }
    }).catch(function () {
      text.textContent = 'Unreachable';
      icon.style.color = 'var(--danger-color)';
    });
  };

  Core.prototype.updateElevenLabsUI = function () {
    var c = this.elements.apiKeyContainer;
    var v = this.elements.voiceSelectContainer;
    if (this.elements.elevenLabsEnabled) {
      this.elevenLabsEnabled = this.elements.elevenLabsEnabled.checked;
      if (c) c.style.display = this.elevenLabsEnabled ? 'flex' : 'none';
      if (v) v.style.display = this.elevenLabsEnabled && this.availableVoices.length ? 'flex' : 'none';
    }
  };

  Core.prototype.loadElevenLabsVoices = function () {
    var self = this;
    if (!this.elevenLabsApiKey) return;
    var base = this.config.proxyUrl ? this.config.proxyUrl.replace(/\/$/, '') + '/api/elevenlabs/v1' : 'https://api.elevenlabs.io/v1';
    fetch(base + '/voices', { headers: { 'xi-api-key': this.elevenLabsApiKey } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        self.availableVoices = data.voices || [];
        var sel = self.elements.voiceSelect;
        if (!sel) return;
        sel.innerHTML = '<option value="">Select voice</option>';
        self.availableVoices.forEach(function (v) {
          var opt = document.createElement('option');
          opt.value = v.voice_id;
          opt.textContent = v.name;
          if (v.voice_id === self.currentVoiceId) opt.selected = true;
          sel.appendChild(opt);
        });
        if (self.elements.voiceSelectContainer) self.elements.voiceSelectContainer.style.display = 'flex';
      }).catch(function () {});
  };

  Core.prototype.clearMessageHistory = function () {
    var el = this.elements.chatMessages;
    if (!el) return;
    var welcome = el.querySelector('.welcome-message');
    el.innerHTML = '';
    if (welcome) el.appendChild(welcome);
  };

  Core.prototype.setupEventListeners = function () {
    var self = this;
    var el = this.elements;
    if (el.messageInput) {
      el.messageInput.addEventListener('input', function () { self.updateCharCount(); self.toggleSendButton(); });
      el.messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); self.sendMessage(); }
      });
    }
    if (el.sendBtn) el.sendBtn.addEventListener('click', function () { self.sendMessage(); });
    if (el.themeToggle) el.themeToggle.addEventListener('click', function () {
      self.isDarkMode = !self.isDarkMode;
      self.applyTheme();
    });
    if (el.settingsBtn) el.settingsBtn.addEventListener('click', function () { self.openSettings(); });
    if (el.closeModal) el.closeModal.addEventListener('click', function () { self.closeSettings(); });
    if (el.settingsModal) el.settingsModal.addEventListener('click', function (e) {
      if (e.target === el.settingsModal) self.closeSettings();
    });
    if (el.deleteCurrentSessionBtn) el.deleteCurrentSessionBtn.addEventListener('click', function () {
      if (confirm('Delete current session?')) self.deleteCurrentSession();
    });
    if (el.deleteAllSessionsBtn) el.deleteAllSessionsBtn.addEventListener('click', function () {
      if (confirm('Delete all sessions?')) self.deleteAllSessions();
    });
    if (el.copySessionId) el.copySessionId.addEventListener('click', function () { self.copySessionId(); });
    if (el.languageSwitch) {
      el.languageSwitch.value = this.language;
      el.languageSwitch.addEventListener('change', function (e) {
        self.language = e.target.value;
        localStorage.setItem('wp_chatbot_language', self.language);
        if (el.chatHeader) el.chatHeader.textContent = self.config.chatbotName || 'Assistant';
        self.updateCharCount();
      });
    }
    if (el.voiceBtn) el.voiceBtn.addEventListener('click', function (e) { e.preventDefault(); self.openVoicePopup(); });
    if (el.closeVoicePopup) el.closeVoicePopup.addEventListener('click', function () { self.closeVoicePopup(); });
    if (el.voiceConversationPopup) el.voiceConversationPopup.addEventListener('click', function (e) {
      if (e.target === el.voiceConversationPopup) self.closeVoicePopup();
    });
    if (el.voicePopupMicBtn) el.voicePopupMicBtn.addEventListener('click', function () {
      if (self.isWaitingForResponse) return;
      if (self.isListeningInPopup) self.stopListeningInPopup();
      else if (self.isSpeakingInPopup) self.stopSpeakingInPopup();
      else self.startListeningInPopup();
    });
    if (el.closeJobSidebar) el.closeJobSidebar.addEventListener('click', function () { self.closeJobSidebar(); });
    if (el.elevenLabsEnabled) {
      el.elevenLabsEnabled.checked = this.elevenLabsEnabled;
      el.elevenLabsEnabled.addEventListener('change', function (e) {
        self.elevenLabsEnabled = e.target.checked;
        self.updateElevenLabsUI();
        if (self.elevenLabsEnabled && self.elevenLabsApiKey) self.loadElevenLabsVoices();
      });
    }
    if (el.elevenLabsApiKey) {
      el.elevenLabsApiKey.value = this.elevenLabsApiKey;
      el.elevenLabsApiKey.addEventListener('input', function (e) {
        self.elevenLabsApiKey = e.target.value;
        if (self.elevenLabsApiKey && self.elevenLabsEnabled) self.loadElevenLabsVoices();
      });
    }
    if (el.voiceSelect) el.voiceSelect.addEventListener('change', function (e) { self.currentVoiceId = e.target.value; });
    if (el.checkHealthBtn) el.checkHealthBtn.addEventListener('click', function () { self.checkHealth(); });
  };

  Core.prototype.openVoicePopup = function () {
    this.isVoicePopupOpen = true;
    if (this.elements.voiceConversationPopup) this.elements.voiceConversationPopup.classList.add('active');
    this.showListeningState();
  };

  Core.prototype.closeVoicePopup = function () {
    this.isVoicePopupOpen = false;
    if (this.elements.voiceConversationPopup) this.elements.voiceConversationPopup.classList.remove('active');
    this.stopListeningInPopup();
    this.stopSpeakingInPopup();
  };

  Core.prototype.showListeningState = function () {
    var ls = this.elements.listeningState;
    var ss = this.elements.speakingState;
    var ws = this.elements.waitingState;
    var es = this.elements.errorState;
    if (ls) ls.style.display = 'flex';
    if (ss) ss.style.display = 'none';
    if (ws) ws.style.display = 'none';
    if (es) es.style.display = 'none';
    if (this.elements.voicePopupMicBtn) {
      this.elements.voicePopupMicBtn.classList.remove('speaking', 'waiting');
    }
  };

  Core.prototype.showSpeakingState = function () {
    var ls = this.elements.listeningState;
    var ss = this.elements.speakingState;
    var ws = this.elements.waitingState;
    if (ls) ls.style.display = 'none';
    if (ss) ss.style.display = 'flex';
    if (ws) ws.style.display = 'none';
  };

  Core.prototype.showWaitingState = function () {
    var ls = this.elements.listeningState;
    var ss = this.elements.speakingState;
    var ws = this.elements.waitingState;
    if (ls) ls.style.display = 'none';
    if (ss) ss.style.display = 'none';
    if (ws) ws.style.display = 'flex';
    if (this.elements.voicePopupMicBtn) {
      this.elements.voicePopupMicBtn.classList.add('waiting');
      this.elements.voicePopupMicBtn.disabled = true;
    }
  };

  Core.prototype.showErrorState = function (msg) {
    var es = this.elements.errorState;
    var em = this.elements.voiceErrorMessage;
    if (es) es.style.display = 'flex';
    if (em) em.textContent = msg || 'Error';
    if (this.elements.listeningState) this.elements.listeningState.style.display = 'none';
    if (this.elements.speakingState) this.elements.speakingState.style.display = 'none';
    if (this.elements.waitingState) this.elements.waitingState.style.display = 'none';
    if (this.elements.voicePopupMicBtn) {
      this.elements.voicePopupMicBtn.classList.remove('waiting', 'speaking');
      this.elements.voicePopupMicBtn.disabled = false;
    }
  };

  Core.prototype.startListeningInPopup = function () {
    var self = this;
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.showErrorState('Speech recognition not supported');
      return;
    }
    this.popupRecognition = new SpeechRecognition();
    this.popupRecognition.continuous = false;
    this.popupRecognition.interimResults = true;
    this.popupRecognition.lang = this.language === 'en' ? 'en-US' : this.language;
    this.currentTranscript = '';
    if (this.elements.voiceTranscript) this.elements.voiceTranscript.textContent = '';
    this.popupRecognition.onresult = function (e) {
      var t = '';
      for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      self.currentTranscript = t;
      if (self.elements.voiceTranscript) self.elements.voiceTranscript.textContent = t;
    };
    this.popupRecognition.onend = function () {
      if (!self.isWaitingForResponse && self.currentTranscript) {
        self.isListeningInPopup = false;
        self.sendVoiceMessage(self.currentTranscript);
      }
    };
    this.popupRecognition.start();
    this.isListeningInPopup = true;
  };

  Core.prototype.stopListeningInPopup = function () {
    if (this.popupRecognition) {
      this.popupRecognition.stop();
      this.popupRecognition = null;
    }
    this.isListeningInPopup = false;
  };

  Core.prototype.sendVoiceMessage = function (text) {
    var self = this;
    var langNames = { en: 'english', ro: 'romanian', fr: 'french', de: 'german', hu: 'hungarian' };
    var messageWithLang = 'Answer in ' + (langNames[this.language] || this.language) + ': ' + text;
    if (this.elements.waitingTranscript) this.elements.waitingTranscript.textContent = text;
    this.showWaitingState();
    this.isWaitingForResponse = true;
    this.callAPI(messageWithLang).then(function (res) {
      self.isWaitingForResponse = false;
      if (res.redis_session_id) {
        self.sessionId = res.redis_session_id;
        if (!self.sessionStartTime) self.sessionStartTime = new Date();
        self.saveSession();
      }
      var answer = res.answer || '';
      if (self.elements.voiceResponse) self.elements.voiceResponse.textContent = answer;
      self.showSpeakingState();
      if (self.elements.voicePopupMicBtn) {
        self.elements.voicePopupMicBtn.classList.add('speaking');
        self.elements.voicePopupMicBtn.classList.remove('waiting');
        self.elements.voicePopupMicBtn.disabled = false;
      }
      if (answer) {
        if (self.elevenLabsApiKey && self.elevenLabsEnabled) self.speakWithElevenLabsInPopup(answer);
        else self.speakWithWebSpeechInPopup(answer);
      } else {
        self.showListeningState();
      }
    }).catch(function (err) {
      self.isWaitingForResponse = false;
      self.showErrorState(self.getT().error);
      if (self.elements.voicePopupMicBtn) {
        self.elements.voicePopupMicBtn.classList.remove('waiting');
        self.elements.voicePopupMicBtn.disabled = false;
      }
    });
  };

  Core.prototype.speakWithElevenLabsInPopup = function (text) {
    var self = this;
    if (!this.elevenLabsApiKey || !this.currentVoiceId) {
      this.speakWithWebSpeechInPopup(text);
      return;
    }
    var base = this.config.proxyUrl ? this.config.proxyUrl.replace(/\/$/, '') + '/api/elevenlabs/v1' : 'https://api.elevenlabs.io/v1';
    var url = base + '/text-to-speech/' + this.currentVoiceId;
    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.elevenLabsApiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.5, style: 0, use_speaker_boost: true }
      })
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.blob();
    }).then(function (blob) {
      var audioUrl = URL.createObjectURL(blob);
      self.popupAudio = new Audio(audioUrl);
      self.popupAudio.onended = function () {
        self.isSpeakingInPopup = false;
        if (self.elements.voicePopupMicBtn) self.elements.voicePopupMicBtn.classList.remove('speaking');
        if (self.isVoicePopupOpen) self.showListeningState();
        URL.revokeObjectURL(audioUrl);
        self.popupAudio = null;
      };
      self.popupAudio.onerror = function () {
        self.isSpeakingInPopup = false;
        if (self.elements.voicePopupMicBtn) self.elements.voicePopupMicBtn.classList.remove('speaking');
        if (self.isVoicePopupOpen) self.showListeningState();
        URL.revokeObjectURL(audioUrl);
        self.popupAudio = null;
      };
      self.isSpeakingInPopup = true;
      return self.popupAudio.play();
    }).catch(function () {
      self.speakWithWebSpeechInPopup(text);
    });
  };

  Core.prototype.speakWithWebSpeechInPopup = function (text) {
    if (!this.speechSynthesis) {
      this.isSpeakingInPopup = false;
      if (this.elements.voicePopupMicBtn) this.elements.voicePopupMicBtn.classList.remove('speaking');
      this.showListeningState();
      return;
    }
    var self = this;
    var u = new SpeechSynthesisUtterance(text);
    u.rate = this.voiceRate;
    u.pitch = this.voicePitch;
    u.volume = this.voiceVolume;
    u.lang = this.language === 'en' ? 'en-US' : this.language;
    u.onstart = function () { self.isSpeakingInPopup = true; if (self.elements.voicePopupMicBtn) self.elements.voicePopupMicBtn.classList.add('speaking'); };
    u.onend = function () {
      self.isSpeakingInPopup = false;
      if (self.elements.voicePopupMicBtn) self.elements.voicePopupMicBtn.classList.remove('speaking');
      if (self.isVoicePopupOpen) self.showListeningState();
    };
    u.onerror = function () {
      self.isSpeakingInPopup = false;
      if (self.elements.voicePopupMicBtn) self.elements.voicePopupMicBtn.classList.remove('speaking');
      if (self.isVoicePopupOpen) self.showListeningState();
    };
    this.speechSynthesis.speak(u);
  };

  Core.prototype.stopSpeakingInPopup = function () {
    this.isSpeakingInPopup = false;
    if (this.popupAudio) {
      this.popupAudio.pause();
      this.popupAudio.currentTime = 0;
      this.popupAudio = null;
    }
    if (this.speechSynthesis) this.speechSynthesis.cancel();
    if (this.elements.voicePopupMicBtn) this.elements.voicePopupMicBtn.classList.remove('speaking');
    this.showListeningState();
  };

  Core.prototype.init = function () {
    this.bindElements();
    this.loadSession();
    this.applyTheme();
    this.updateCharCount();
    this.toggleSendButton();
    if (this.elements.chatHeader) this.elements.chatHeader.textContent = this.config.chatbotName || 'Assistant';
    if (this.config.healthCheckUrl && this.elements.healthCheckGroup) this.elements.healthCheckGroup.style.display = 'block';
    if (this.config.elevenlabsEnabled && this.elements.elevenLabsEnabled) {
      this.elements.elevenLabsEnabled.checked = true;
      this.elevenLabsEnabled = true;
      if (this.elements.apiKeyContainer) this.elements.apiKeyContainer.style.display = 'flex';
      if (this.elevenLabsApiKey) this.loadElevenLabsVoices();
    }
    this.setupEventListeners();
  };

  window.WPChatbotCore = { init: function (root, config) {
    var core = new Core(root, config);
    core.init();
  }};
})();
