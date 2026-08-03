/*
 * CometChat Concierge (Crossword) demo widget.
 *
 * Injected into a live page (via Playwright) to overlay an animated, scripted
 * AI conversation on top of any website — so a screen recording looks like the
 * Crossword widget is really embedded and mid-chat.
 *
 * Isolated inside a Shadow DOM so the host page's CSS can't touch it.
 *
 * Usage (from the recorder):
 *   CrosswordWidget.mount(script, cssText)  ->  starts playback, returns a
 *   Promise that resolves when the scripted conversation finishes. The total
 *   real-time duration is also published on window.__CC_TOTAL_MS__.
 *
 * `script` shape (see references/conversation.md):
 *   {
 *     title: "CometChat Concierge",
 *     agentName: "Aster",
 *     welcome: "Welcome to CometChat. I'm Aster. How can I assist you today?",
 *     messages: [ { role: "visitor"|"ai", text: "..." }, ... ],
 *     startDelayMs?: number,
 *     endHoldMs?: number
 *   }
 */
(function () {
  "use strict";

  var ICONS = {
    logo:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M20 11.4A8 8 0 1 1 12.6 4 6.4 6.4 0 0 0 20 11.4Z" fill="#fff"/>' +
      '<circle cx="12" cy="12" r="2.1" fill="#0a0a0a"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
    send:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></svg>',
    plus:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    clock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    expand:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h5v5M20 4l-6 6M9 20H4v-5M4 20l6-6"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    cursor:
      '<svg viewBox="0 0 24 24" fill="#1a1c22" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"><path d="M5 3l14 8-6 1.4L11 19 5 3z"/></svg>',
  };

  // extra time (ms) the opening "click the input bar" gesture takes
  var CLICK_MS = 1080;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function sleep(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function build(root, script) {
    var panel = el("div", "cc-panel");

    // header
    var header = el("div", "cc-header");
    var logo = el("div", "cc-logo", ICONS.logo);
    var title = el("div", "cc-title", script.title || "CometChat Concierge");
    var actions = el("div", "cc-actions",
      '<span class="cc-ico cc-ico-plus">' + ICONS.plus + "</span>" +
      '<span class="cc-ico cc-ico-hist">' + ICONS.clock + "</span>" +
      '<span class="cc-ico cc-ico-expand">' + ICONS.expand + "</span>" +
      '<span class="cc-ico cc-ico-close">' + ICONS.close + "</span>");
    header.appendChild(logo);
    header.appendChild(title);
    header.appendChild(actions);

    var divider = el("div", "cc-divider");
    var messages = el("div", "cc-messages");

    var footer = el("div", "cc-footer",
      "AI can make mistakes. Powered by <u>Crossword</u>");

    panel.appendChild(header);
    panel.appendChild(divider);
    panel.appendChild(messages);
    panel.appendChild(footer);

    // detached input pill
    var inputbar = el("div", "cc-inputbar");
    var search = el("div", "cc-search", ICONS.search);
    var input = el("div", "cc-input cc-placeholder");
    input.textContent = "Ask anything...";
    var send = el("div", "cc-send", ICONS.send);
    inputbar.appendChild(search);
    inputbar.appendChild(input);
    inputbar.appendChild(send);

    root.appendChild(panel);
    root.appendChild(inputbar);

    return {
      panel: panel,
      messages: messages,
      input: input,
      send: send,
      inputbar: inputbar,
    };
  }

  // Opening gesture: a pointer moves onto the "Ask anything…" bar and taps it,
  // then the panel opens. Reads as the visitor clicking the widget.
  async function clickInput(refs) {
    var bar = refs.inputbar;
    var cursor = el("div", "cc-cursor", ICONS.cursor);
    bar.appendChild(cursor);
    await sleep(40);
    cursor.classList.add("cc-in");
    await sleep(460);
    // tap down
    bar.classList.add("cc-focused");
    cursor.classList.add("cc-tap");
    var ripple = el("div", "cc-ripple");
    bar.appendChild(ripple);
    await sleep(180);
    cursor.classList.remove("cc-tap");
    await sleep(260);
    cursor.classList.add("cc-out");
    await sleep(150);
    cursor.remove();
    ripple.remove();
  }

  function addBubble(messages, role, text) {
    var b = el("div", "cc-msg " + (role === "ai" ? "cc-in" : "cc-out"));
    b.textContent = text;
    messages.appendChild(b);
    messages.scrollTop = messages.scrollHeight;
    return b;
  }

  function showTyping(messages) {
    var t = el("div", "cc-typing", "<span></span><span></span><span></span>");
    messages.appendChild(t);
    messages.scrollTop = messages.scrollHeight;
    return t;
  }

  function setPlaceholder(input) {
    input.className = "cc-input cc-placeholder";
    input.textContent = "Ask anything...";
  }

  async function typeInto(input, text) {
    input.className = "cc-input";
    input.textContent = "";
    var caret = el("span", "cc-caret");
    input.appendChild(caret);
    // per-char speed scaled so long questions still finish quickly
    var per = clamp(Math.round(2200 / Math.max(text.length, 1)), 28, 60);
    for (var i = 0; i < text.length; i++) {
      caret.insertAdjacentText("beforebegin", text[i]);
      // eslint-disable-next-line no-await-in-loop
      await sleep(per);
    }
    await sleep(280);
    caret.remove();
  }

  async function play(refs, script) {
    var messages = refs.messages;
    var input = refs.input;
    var send = refs.send;

    await sleep(script.startDelayMs != null ? script.startDelayMs : 700);
    // 1) visitor clicks the "Ask anything…" bar, then 2) the panel opens
    await clickInput(refs);
    refs.panel.classList.add("cc-open");
    await sleep(520);

    if (script.welcome) {
      addBubble(messages, "ai", script.welcome);
      await sleep(750);
    }

    var msgs = script.messages || [];
    for (var i = 0; i < msgs.length; i++) {
      var m = msgs[i];
      if (m.role === "visitor") {
        await typeInto(input, m.text);
        send.classList.add("cc-send-active");
        await sleep(120);
        send.classList.add("cc-press");
        await sleep(140);
        send.classList.remove("cc-press");
        addBubble(messages, "visitor", m.text);
        setPlaceholder(input);
        send.classList.remove("cc-send-active");
        await sleep(520);
      } else {
        var t = showTyping(messages);
        var think = clamp((m.text || "").length * 26, 900, 2200);
        await sleep(think);
        t.remove();
        addBubble(messages, "ai", m.text);
        await sleep(800);
      }
    }

    await sleep(script.endHoldMs != null ? script.endHoldMs : 1600);
  }

  function estimateTotalMs(script) {
    var total =
      (script.startDelayMs != null ? script.startDelayMs : 700) +
      CLICK_MS +
      520;
    if (script.welcome) total += 750;
    (script.messages || []).forEach(function (m) {
      if (m.role === "visitor") {
        var per = clamp(Math.round(2200 / Math.max((m.text || "").length, 1)), 28, 60);
        total += per * (m.text || "").length + 280 + 120 + 140 + 520;
      } else {
        total += clamp((m.text || "").length * 26, 900, 2200) + 800;
      }
    });
    total += script.endHoldMs != null ? script.endHoldMs : 1600;
    return total;
  }

  var CrosswordWidget = {
    mount: function (script, cssText) {
      var host = document.getElementById("__cc_crossword_host__");
      if (host) host.remove();
      host = document.createElement("div");
      host.id = "__cc_crossword_host__";
      document.documentElement.appendChild(host);

      var shadow = host.attachShadow({ mode: "open" });
      var style = document.createElement("style");
      style.textContent = cssText || "";
      shadow.appendChild(style);

      var root = el("div", "cc-root");
      shadow.appendChild(root);

      var refs = build(root, script);

      window.__CC_TOTAL_MS__ = estimateTotalMs(script);
      window.__CC_DONE__ = false;

      var p = play(refs, script).then(function () {
        window.__CC_DONE__ = true;
      });
      return p;
    },
    estimateTotalMs: estimateTotalMs,
  };

  window.CrosswordWidget = CrosswordWidget;
})();
