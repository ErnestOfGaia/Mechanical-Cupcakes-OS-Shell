// EN / ES toggle for the binder site, plus "?print=1" auto-print.
//
// No duplicate pages: the Spanish text lives in es.js as { "English string": "Español" }
// keyed by the exact (whitespace-collapsed) English text node. On toggle we walk every
// text node, swap the ones the dictionary knows, and remember the English so we can
// swap back. Elements marked data-i18n-skip (and icons, scripts, styles) are left alone.
// Missing translations stay English — window.ETM_MISSING lists them for the next pass.
(function () {
  var DICT = window.ETM_ES || {};
  var KEY = "etm-lang";
  var lang = "en";

  function norm(s) { return s.replace(/\s+/g, " ").trim(); }

  function walk(fn) {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p || p.closest("script,style,[data-i18n-skip],.material-symbols-outlined")) return NodeFilter.FILTER_REJECT;
        if (!norm(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = w.nextNode())) fn(n);
  }

  function apply(next) {
    lang = next;
    window.ETM_MISSING = [];
    walk(function (n) {
      if (n.__en == null) n.__en = n.nodeValue;
      var en = n.__en, key = norm(en);
      if (lang === "es") {
        var es = DICT[key];
        if (es == null) { window.ETM_MISSING.push(key); n.nodeValue = en; return; }
        var m = en.match(/^(\s*)[\s\S]*?(\s*)$/);
        n.nodeValue = m[1] + es + m[2];
      } else {
        n.nodeValue = en;
      }
    });
    if (document.__enTitle == null) document.__enTitle = document.title;
    document.title = (lang === "es" && DICT[norm(document.__enTitle)]) || document.__enTitle;
    document.documentElement.lang = lang;
    var labels = document.querySelectorAll("[data-lang-label]");
    for (var i = 0; i < labels.length; i++) labels[i].textContent = lang === "es" ? "English" : "Español";
    var btns = document.querySelectorAll("[data-lang-toggle]");
    for (var j = 0; j < btns.length; j++) btns[j].setAttribute("aria-label", lang === "es" ? "Switch to English" : "Cambiar a español");
    // Links between pages carry the language along, so a Spanish reader stays in Spanish
    // even where localStorage is unavailable (private mode, kitchen tablets).
    var links = document.querySelectorAll('a[href$=".html"], a[href*=".html?"]');
    for (var k = 0; k < links.length; k++) {
      var a = links[k];
      var href = a.getAttribute("href").replace(/([?&])lang=(en|es)&?/, "$1").replace(/[?&]$/, "");
      if (lang === "es") href += (href.indexOf("?") > -1 ? "&" : "?") + "lang=es";
      a.setAttribute("href", href);
    }
    // Other scripts (edit.js) keep their own labels in step.
    document.dispatchEvent(new CustomEvent("etm:lang", { detail: lang }));
  }

  var params = new URLSearchParams(location.search);
  var q = params.get("lang");
  try { lang = localStorage.getItem(KEY) || "en"; } catch (e) {}
  if (q === "es" || q === "en") { lang = q; try { localStorage.setItem(KEY, lang); } catch (e) {} }

  var toggles = document.querySelectorAll("[data-lang-toggle]");
  for (var t = 0; t < toggles.length; t++) {
    toggles[t].addEventListener("click", function () {
      var next = lang === "es" ? "en" : "es";
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next);
    });
  }
  apply(lang);

  // Home page "Print" links open the card with ?print=1: wait for fonts, then print.
  if (params.get("print") === "1") {
    var go = function () { setTimeout(function () { window.print(); }, 150); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else window.addEventListener("load", go);
  }

  window.ETM_I18N = { apply: apply, get lang() { return lang; }, norm: norm };
})();
