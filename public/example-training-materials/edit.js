// Demo edit mode: steps, list items, table cells and notes on a card can be edited in
// place. Headings, banners and labels stay locked. Edits are saved in this browser only
// (localStorage, key "etm-edits") and re-applied on every page that carries the same
// item id — that is how the quick guide follows the cards. "Reset edits" wipes them.
//
// Item ids are derived from the item's original English text ("02:preheat-wells-1-3-to…")
// so the guide can name the card line it mirrors with data-edit="…".
(function () {
  var KEY = "etm-edits";
  var body = document.body;
  var card = body.getAttribute("data-card"); // "01".."04" on card pages, absent on the guide/home

  // What counts as "a step or a list", per card. Everything else is structure.
  var EDITABLE = {
    "01": [
      "#card .space-y-space-xs > div > span:last-child",   // zone items and handling rules
      "#card .mt-space-md > div.mt-0\\.5",                 // the note under each zone
      "#card .mt-space-sm > div.mt-0\\.5",                 // …and the same note where the rhythm is tighter
      "#card tbody td",                                     // fry time & yield table
      "#card .bg-surface-container p"                       // supervisor note
    ],
    "02": ["#card label .flex-col > span"],                 // checklist line + its note
    // Card 03's body is built by hand (CARD3_BODY in build-site.mjs) and every editable line
    // already carries its data-edit id, so there is nothing to discover by selector here.
    "03": [],
    "04": [
      "#card li > span:last-child",                         // stage observations
      "#card .mt-space-sm.pt-space-xs > span:last-child",   // action / remediation lines
      "#card label[for^='check-']",                         // audit intervals
      "#card .grid span.block.font-bold",                   // cleaning steps (any column count: a
                                                            // grid-cols-2 selector deleted these ids
                                                            // when the column stacked, 2026-09-20)
      "#card span.font-body-sm.text-body-sm.text-on-surface-variant" // why polar matters
    ]
  };

  function norm(s) { return s.replace(/\s+/g, " ").trim(); }
  // An item's text as a person reads it: icon glyph names dropped, line breaks as " · ".
  function textOf(el) {
    var c = el.cloneNode(true);
    c.querySelectorAll(".material-symbols-outlined").forEach(function (i) { i.remove(); });
    c.querySelectorAll("br").forEach(function (b) { b.replaceWith(" ¶ "); });
    return norm(norm(c.textContent).replace(/\s*¶\s*/g, " · ").replace(/^(\s*·\s*)+|(\s*·\s*)+$/g, ""));
  }
  function slug(s) {
    return norm(s).toLowerCase().replace(/°f/g, "f").replace(/°c/g, "c")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48).replace(/-$/, "");
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(edits) { try { localStorage.setItem(KEY, JSON.stringify(edits)); } catch (e) {} }
  function textNodes(el, fn) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var n; while ((n = w.nextNode())) fn(n);
  }

  // 1. Mark editable items on card pages (the guide names its own with data-edit).
  if (card && EDITABLE[card]) {
    var seen = {};
    var els = [];
    EDITABLE[card].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.hasAttribute("data-edit") || els.indexOf(el) > -1) return;
        if (!textOf(el) || el.closest("th,thead,h1,h2,h3,button,a")) return;
        els.push(el);
      });
    });
    els.forEach(function (el) {
      var id = card + ":" + slug(textOf(el));
      if (seen[id]) { seen[id]++; id += "-" + seen[id]; } else { seen[id] = 1; }
      el.setAttribute("data-edit", id);
    });
  }

  // 2. Apply saved edits (before the language layer takes its English snapshot).
  var edits = load();
  var applied = 0;
  document.querySelectorAll("[data-edit]").forEach(function (el) {
    var id = el.getAttribute("data-edit");
    if (edits[id] != null && textOf(el) !== norm(edits[id])) {
      // Keep the item's leading inline markup (badges, squares); replace the text only.
      var textEl = el;
      var kids = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3 && norm(n.nodeValue); });
      if (kids.length === 1 && el.children.length) { kids[0].nodeValue = " " + edits[id] + " "; }
      else { textEl.textContent = edits[id]; }
      el.setAttribute("data-edited", "");
      applied++;
    } else if (edits[id] != null) {
      el.setAttribute("data-edited", "");
      applied++;
    }
  });

  // 3. Edit mode UI (card pages only).
  var toggle = document.querySelector("[data-edit-toggle]");
  var resetBtns = document.querySelectorAll("[data-edit-reset]");
  var banner = document.querySelector("[data-edit-banner]");
  var count = document.querySelectorAll("[data-edit-count]");
  var editing = false;

  function refresh() {
    var n = Object.keys(load()).length;
    count.forEach(function (c) { c.textContent = String(n); });
    resetBtns.forEach(function (b) { b.hidden = n === 0; });
    if (banner) banner.hidden = !editing && applied === 0;
  }

  // The toggle's own label is bilingual and outside the translation walker (data-i18n-skip).
  var LABEL = { en: { off: "Edit", on: "Done" }, es: { off: "Editar", on: "Listo" } };
  function relabel() {
    if (!toggle) return;
    var label = toggle.querySelector("[data-edit-label]");
    var l = LABEL[document.documentElement.lang === "es" ? "es" : "en"];
    if (label) label.textContent = editing ? l.on : l.off;
  }
  document.addEventListener("etm:lang", relabel);

  function setEditing(on) {
    editing = on;
    body.classList.toggle("is-editing", on);
    document.querySelectorAll("[data-edit]").forEach(function (el) {
      if (on) el.setAttribute("contenteditable", "true"); else el.removeAttribute("contenteditable");
      // Icons inside an item stay put.
      el.querySelectorAll(".material-symbols-outlined").forEach(function (i) { i.setAttribute("contenteditable", "false"); });
    });
    if (toggle) toggle.setAttribute("aria-pressed", on ? "true" : "false");
    relabel();
    refresh();
  }

  if (toggle) {
    toggle.addEventListener("click", function () { setEditing(!editing); });
    document.addEventListener("input", function (e) {
      var el = e.target.closest && e.target.closest("[data-edit]");
      if (!el || !editing) return;
      var all = load();
      var text = textOf(el);
      all[el.getAttribute("data-edit")] = text;
      el.setAttribute("data-edited", "");
      save(all);
      // The language layer restores from each text node's English snapshot; the edit is
      // the new baseline in either language.
      textNodes(el, function (n) { n.__en = n.nodeValue; });
      refresh();
    });
    // Enter on a single-line item just ends the edit instead of inserting a line break.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey && e.target.closest && e.target.closest("[data-edit]")) { e.preventDefault(); e.target.blur(); }
    });
  }
  resetBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      location.reload();
    });
  });
  refresh();

  window.ETM_EDIT = {
    ids: function () { return Array.prototype.map.call(document.querySelectorAll("[data-edit]"), function (el) { return { id: el.getAttribute("data-edit"), text: textOf(el) }; }); },
    applied: applied,
    set: function (id, text) { var all = load(); all[id] = text; save(all); },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };
})();
