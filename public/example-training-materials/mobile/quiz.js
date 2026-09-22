// The deck. One question at a time, you check your own answer, and nothing is recorded.
//
// Handoff 04 §1: not points, not streaks, not badges, not a leaderboard — the motivation is
// already there. So there is a COUNT OF WHAT IS LEFT, which is navigation, and there is no
// TALLY of right and wrong, which would be scoring. Nothing is written to storage and nothing leaves the page. Reloading
// starts the day over, which is the whole of the memory design until Ernest rules otherwise.
//
// Progressive enhancement: the markup is a plain study list of every question with its answer
// showing. This file turns that list into a deck. With JavaScript off you still get the list.
(function () {
  var deck = document.querySelector("[data-deck]");
  if (!deck) return;
  document.documentElement.className += " js";

  var items = Array.prototype.slice.call(deck.querySelectorAll(".q"));
  var end = document.querySelector("[data-end]");
  var count = document.querySelector("[data-count]");
  var left = document.querySelector("[data-left]");
  var queue = [];

  function reset() {
    queue = items.map(function (_, i) { return i; });
    items.forEach(function (li) {
      li.hidden = true;
      li.querySelector(".ans").hidden = true;
      var ctl = li.querySelector("[data-ctl]");
      if (ctl) ctl.hidden = false;
      li.querySelector("[data-show]").hidden = false;
      li.querySelector("[data-mark]").hidden = true;
    });
    if (end) end.hidden = true;
    if (count) count.hidden = false;
    draw(true);
  }

  function draw(first) {
    items.forEach(function (li) { li.hidden = true; });
    if (!queue.length) {
      if (count) count.hidden = true;
      if (end) { end.hidden = false; if (!first) end.focus(); }
      return;
    }
    var li = items[queue[0]];
    li.hidden = false;
    li.querySelector(".ans").hidden = true;
    li.querySelector("[data-show]").hidden = false;
    li.querySelector("[data-mark]").hidden = true;
    if (left) left.textContent = String(queue.length);
    if (!first) li.focus();
  }

  deck.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    var li = t.closest(".q");
    if (t.hasAttribute("data-show")) {
      li.querySelector(".ans").hidden = false;
      t.hidden = true;
      li.querySelector("[data-mark]").hidden = false;
      return;
    }
    if (t.hasAttribute("data-got")) { queue.shift(); draw(); return; }
    // "Ask me again" goes to the back of the queue. The deck is done when everything has been
    // marked got it, and it never says how many times anything came round.
    if (t.hasAttribute("data-again")) { queue.push(queue.shift()); draw(); return; }
  });

  if (end) end.addEventListener("click", function (e) {
    if (e.target.closest("[data-restart]")) reset();
  });

  reset();
})();
