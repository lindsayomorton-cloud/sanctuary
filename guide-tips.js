// First-visit guided tips. Each tour runs once, when its trigger element first appears.
(function () {
  const KEY = 'sanctuary-guide-seen', OFF = 'sanctuary-guide-off';
  const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const visible = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  const q = (sel) => [].slice.call(document.querySelectorAll(sel)).find(visible);

  const TOURS = [
    { id:'home', when:'[aria-label^="Enter "]', delay:6200, steps:[
      { sel:'[aria-label^="Enter "]', title:'Your decks', body:'Click a deck to see its top card.\nThe larger deck needs you most.' },
      { sel:'[aria-label^="Today"]', title:'Today’s sky', body:'Click for the moon phase and today’s signs.' },
      { sel:'[aria-label^="Visit"]', title:'The altar', body:'Each card you finish earns a stone.\nClick to see them all.' },
      { sel:'[aria-label="Decks and rituals"]', title:'Decks and rituals', body:'Every deck and ritual in one place.\nStart a new deck here.' },
      { sel:'a[href="rituals.html"]', title:'Book of Rituals', body:'Jobs Claude repeats for you, like sorting mail.\nEach stays off until you switch it on.' },
      { sel:'[aria-label^="AI activity"]', title:'AI activity', body:'What Claude is doing, and in which app.\nPause anything from here.' }
    ]},
    { id:'deck', when:'[aria-label="Leave this deck"]', delay:900, steps:[
      { sel:'[aria-label="Leave this deck"]', title:'Start here', body:'Claude picked this card for you.\n“Why this card?” says why.\n“See the whole deck” shows the rest.' }
    ]},
    { id:'browse', when:'[aria-label="View this deck as"]', delay:700, steps:[
      { sel:'[aria-label="View this deck as"]', title:'Sort this deck', body:'Group by due date, category or status.\n“Uses” shows the apps each task needs.' }
    ]},
    { id:'seer', when:'[aria-label="Write to the Seer"]', delay:1200, steps:[
      { sel:'[aria-label="Write to the Seer"]', title:'Tell the Seer', body:'Type or paste anything, then press Enter.\nUse “Add a file” for notes or screenshots.' }
    ]},
    { id:'streak', when:'[aria-label$="in this streak."]', delay:900, steps:[
      { sel:'[aria-label$="in this streak."]', title:'Your streak', body:'Three cards in a row from this deck.\nThe ring shows pace, not a deadline.\nEnd any time. Your stones are kept.' }
    ]},
    { id:'spellbook', page:'Spellbook', when:'[data-guide="spellbook"]', delay:900, steps:[
      { sel:'[data-guide="spellbook"]', title:'Your book of rituals', body:'Write each ritual as one sentence: when it runs and what it does.\nNothing runs until you switch it on.' }
    ]},
    { id:'garden', page:'Garden', when:'[data-guide="garden"]', delay:1600, steps:[
      { sel:'[data-guide="garden"]', title:'Your garden', body:'Each finished card adds something here.\nDrag pieces to move them.' }
    ]}
  ];

  let held = false, active = null, layer, ring, tip, timers = {};
  const seen = () => read(KEY, []);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.querySelector('[data-sensory="low"]');

  function build() {
    layer = document.createElement('div');
    layer.setAttribute('data-guide-layer', '');
    layer.style.cssText = 'position:fixed; inset:0; z-index:200; pointer-events:none;';
    ring = document.createElement('div');
    ring.style.cssText = 'position:fixed; border-radius:18px; box-shadow:0 0 0 2px #E8B45C, 0 0 0 9999px rgba(10,4,12,.58); pointer-events:none;';
    tip = document.createElement('div');
    tip.setAttribute('role', 'dialog');
    tip.setAttribute('aria-modal', 'false');
    tip.style.cssText = 'position:fixed; width:min(340px,calc(100vw - 32px)); box-sizing:border-box; padding:20px 22px 18px; border-radius:20px; background:#FFFCF6; color:#241A20; box-shadow:0 24px 60px rgba(10,4,12,.5), 0 0 0 1px rgba(36,26,32,.08); pointer-events:auto; font-family:var(--font-body, inherit); opacity:0;';
    layer.append(ring, tip);
    document.body.append(layer);
    if (!document.getElementById('guide-pause-css')) { const st = document.createElement('style'); st.id = 'guide-pause-css'; st.textContent = 'body.guide-on *:not([data-guide-layer]):not([data-guide-layer] *), body.guide-on *::before, body.guide-on *::after { animation-play-state: paused !important; }'; document.head.append(st); }
    document.body.classList.add('guide-on');
    document.querySelectorAll('video').forEach(v => { if (!v.paused) { v.pause(); v.dataset.guidePaused = '1'; } });
    const follow = () => { if (!layer) return; place(); layer._raf = requestAnimationFrame(follow); }; layer._raf = requestAnimationFrame(follow);
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    document.addEventListener('keydown', onKey, true);
  }
  const btn = (label, primary) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.style.cssText = primary
      ? 'font-family:inherit; white-space:nowrap; font-size:15px; font-weight:700; min-height:44px; padding:0 22px; border-radius:999px; border:none; background:#1F5F57; color:#fff; cursor:pointer; box-shadow:0 2px 6px rgba(10,4,12,.2);'
      : 'font-family:inherit; white-space:nowrap; font-size:14.5px; min-height:44px; padding:0 4px; background:none; border:none; color:#4E3B43; cursor:pointer; text-decoration:underline; text-underline-offset:3px;';
    if (primary) { b.onmouseenter = () => b.style.boxShadow = '0 4px 12px rgba(10,4,12,.3)'; b.onmouseleave = () => b.style.boxShadow = '0 2px 6px rgba(10,4,12,.2)'; }
    return b; };

  function show() {
    const { tour, i } = active, steps = tour.steps.filter(s => q(s.sel));
    if (!steps.length) return finish();
    active.steps = steps; const s = steps[Math.min(i, steps.length - 1)];
    if (!layer) build();
    tip.innerHTML = '';
    tip.setAttribute('aria-label', s.title);
    const count = document.createElement('div');
    count.textContent = steps.length > 1 ? (i + 1) + ' of ' + steps.length : 'Tip';
    count.style.cssText = 'font-size:13px; letter-spacing:.08em; text-transform:uppercase; font-weight:700; color:#4E3B43;';
    const h = document.createElement('div'); h.textContent = s.title;
    h.style.cssText = 'font-family:var(--font-display, inherit); font-weight:700; font-size:24px; line-height:1.15; margin-top:6px;';
    const p = document.createElement('div'); p.textContent = s.body;
    p.style.cssText = 'font-size:16px; line-height:1.5; margin-top:6px; white-space:pre-line;';
    const row = document.createElement('div'); row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:14px; flex-wrap:wrap;';
    const left = document.createElement('div'); left.style.cssText = 'display:flex; gap:16px;';
    const last = i >= steps.length - 1;
    const skip = btn(last ? 'Stop showing tips' : 'Skip tips', false);
    skip.onclick = last ? () => { write(OFF, true); finish(); } : finish;
    left.append(skip);
    if (i > 0) { const back = btn('Back', false); back.onclick = () => { active.i--; show(); }; left.append(back); }
    const next = btn(last ? 'Got it' : 'Next', true);
    next.onclick = () => { if (last) finish(); else { active.i++; show(); } };
    row.append(left, next);
    tip.append(count, h, p, row);
    place();
    const t = reduced() ? 'none' : 'opacity .35s ease';
    tip.style.transition = t; ring.style.transition = 'none';
    requestAnimationFrame(() => { tip.style.opacity = '1'; next.focus({ preventScroll:true }); });
  }
  function place() {
    if (!active || !tip) return;
    const s = active.steps[active.i], el = s && q(s.sel); if (!el) return;
    const r = el.getBoundingClientRect(), pad = 8;
    Object.assign(ring.style, { left:(r.left - pad) + 'px', top:(r.top - pad) + 'px', width:(r.width + pad * 2) + 'px', height:(r.height + pad * 2) + 'px' });
    const tw = tip.offsetWidth, th = tip.offsetHeight, vw = innerWidth, vh = innerHeight, g = 18;
    let left, top;
    if (r.right + g + tw < vw - 12) { left = r.right + g; top = r.top + r.height / 2 - th / 2; }
    else if (r.bottom + g + th < vh - 12) { top = r.bottom + g; left = r.left + r.width / 2 - tw / 2; }
    else if (r.top - g - th > 12) { top = r.top - g - th; left = r.left + r.width / 2 - tw / 2; }
    else { left = r.left - g - tw; top = r.top + r.height / 2 - th / 2; }
    tip.style.left = Math.max(12, Math.min(vw - tw - 12, left)) + 'px';
    tip.style.top = Math.max(12, Math.min(vh - th - 12, top)) + 'px';
  }
  function onKey(e) {
    if (!active) return;
    if (e.key === 'Escape') { e.stopPropagation(); finish(); }
  }
  function finish() {
    if (active) write(KEY, Array.from(new Set(seen().concat(active.tour.id))));
    active = null;
    if (layer) { cancelAnimationFrame(layer._raf); document.body.classList.remove('guide-on'); document.querySelectorAll('video[data-guide-paused]').forEach(v => { delete v.dataset.guidePaused; v.play().catch(() => {}); }); layer.remove(); layer = null; window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); document.removeEventListener('keydown', onKey, true); }
    setTimeout(check, 300);
  }
  function check() {
    if (held || active || read(OFF, false)) return;
    const done = seen();
    TOURS.forEach(t => {
      if (done.includes(t.id) || active) return;
      if (t.page && decodeURIComponent(location.pathname).indexOf(t.page) < 0) return;
      if (!q(t.when)) { clearTimeout(timers[t.id]); timers[t.id] = null; return; }
      if (timers[t.id]) return;
      timers[t.id] = setTimeout(() => { timers[t.id] = null; if (!active && q(t.when) && !seen().includes(t.id) && !read(OFF, false)) { active = { tour:t, i:0 }; show(); } }, t.delay);
    });
  }
  window.SanctuaryGuide = { reset() { write(KEY, []); write(OFF, false); held = true; }, check };
  const start = () => { new MutationObserver(() => { if (start._t) return; start._t = setTimeout(() => { start._t = null; check(); }, 250); }).observe(document.body, { childList:true, subtree:true }); setInterval(check, 600); check(); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
