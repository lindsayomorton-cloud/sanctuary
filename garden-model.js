// Shared garden rules for Sanctuary and Garden. One source of truth for growth and seasons.
(function () {
  var DECK_OF = { 'Professional': 'work', 'Creative Work': 'creative', 'Home & Family': 'home' };
  var DEMO = { work: 5, home: 3, creative: 1 };
  var LIMITS = { work: 9, home: 5, creative: 2 };
  function counts(stones, demo) {
    var c = demo ? { work: DEMO.work, home: DEMO.home, creative: DEMO.creative } : { work: 0, home: 0, creative: 0 };
    (stones || []).forEach(function (s) { var k = DECK_OF[s.from]; if (k) c[k]++; });
    return c;
  }
  function season(stones, demo, override) {
    if (override && override !== 'auto') return override;
    var now = Date.now(), wk = 7 * 86400000, st = stones || [];
    var a = st.filter(function (s) { return s.at && now - s.at < wk; }).length;
    var b = st.filter(function (s) { return s.at && now - s.at >= wk && now - s.at < 2 * wk; }).length;
    if (demo) a += 2;
    if (a >= 4) return 'summer';
    if (a >= 1) return b > a ? 'autumn' : 'spring';
    return 'winter';
  }
  window.GardenModel = { DECK_OF: DECK_OF, LIMITS: LIMITS, counts: counts, season: season };
})();
