(function (root) {
  "use strict";

  const STARVATION_SECONDS = 30;

  function advanceHunger(secondsWithoutFood, deltaSeconds, limit = STARVATION_SECONDS) {
    const next = Math.max(0, secondsWithoutFood + Math.max(0, deltaSeconds));
    return { secondsWithoutFood: next, starved: next >= limit };
  }

  const api = { STARVATION_SECONDS, advanceHunger };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MiniWorldRules = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
