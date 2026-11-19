'use strict';

// Tabla de records local (localStorage). Hooks usados por game.js:
// Records.onInit(), Records.onLock(cleared), Records.onGameOver(score, lines).
const Records = (() => {
  const KEY = 'tetris.records';
  const TOP = 5;

  let combo = 0;        // locks consecutivos con lineas limpiadas
  let gameBestCombo = 0;
  let finished = false; // registro una sola vez por partida
  let pending = null;   // { score, lines } esperando nombre

  const el = id => document.getElementById(id);

  function defaults() {
    return { top: [], bestCombo: 0, maxLines: 0 };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const d = JSON.parse(raw);
      const top = Array.isArray(d.top) ? d.top.filter(e => e && typeof e.score === 'number') : [];
      return {
        top: top.slice(0, TOP),
        bestCombo: Number(d.bestCombo) || 0,
        maxLines: Number(d.maxLines) || 0,
      };
    } catch (e) {
      return defaults();
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* sin almacenamiento: ignorar */ }
  }

  function qualifies(data, score) {
    if (score <= 0) return false;
    return data.top.length < TOP || score > data.top[data.top.length - 1].score;
  }

  function renderInto(container, data, highlightIdx) {
    if (!container) return;
    container.textContent = '';
    const ol = document.createElement('ol');
    ol.className = 'records-list';
    if (!data.top.length) {
      const li = document.createElement('li');
      li.className = 'records-empty';
      li.textContent = 'Sin records';
      ol.appendChild(li);
    }
    data.top.forEach((e, i) => {
      const li = document.createElement('li');
      if (i === highlightIdx) li.className = 'records-highlight';
      const n = document.createElement('span');
      n.className = 'rec-name';
      n.textContent = e.name;
      const s = document.createElement('span');
      s.className = 'rec-score';
      s.textContent = Number(e.score).toLocaleString();
      li.append(n, s);
      li.title = `${e.lines} líneas - ${e.date}`;
      ol.appendChild(li);
    });
    container.appendChild(ol);
    const stats = document.createElement('div');
    stats.className = 'records-stats';
    stats.textContent = `Mejor combo: ${data.bestCombo} · Líneas máx: ${data.maxLines}`;
    container.appendChild(stats);
  }

  function render(highlightIdx) {
    const data = load();
    renderInto(el('records-list'), data, highlightIdx);
    renderInto(el('overlay-records'), data, highlightIdx);
  }

  function hideNameBlock() {
    const b = el('records-name-block');
    if (b) b.classList.add('hidden');
  }

  function commit() {
    if (!pending) return;
    const input = el('records-name');
    const name = ((input && input.value) || '').trim().slice(0, 12) || 'Anónimo';
    const data = load();
    const entry = { name, score: pending.score, lines: pending.lines, date: new Date().toISOString().slice(0, 10) };
    pending = null;
    data.top.push(entry);
    data.top.sort((a, b) => b.score - a.score);
    data.top = data.top.slice(0, TOP);
    save(data);
    hideNameBlock();
    render(data.top.indexOf(entry));
  }

  function onInit() {
    combo = 0;
    gameBestCombo = 0;
    finished = false;
    pending = null;
    hideNameBlock();
    render(-1);
  }

  function onLock(cleared) {
    if (cleared > 0) {
      combo++;
      if (combo > gameBestCombo) gameBestCombo = combo;
    } else {
      combo = 0;
    }
  }

  function onGameOver(score, lines) {
    if (finished) return;
    finished = true;
    const data = load();
    if (gameBestCombo > data.bestCombo) data.bestCombo = gameBestCombo;
    if (lines > data.maxLines) data.maxLines = lines;
    save(data);
    if (qualifies(data, score)) {
      pending = { score, lines };
      const b = el('records-name-block');
      const input = el('records-name');
      if (b) b.classList.remove('hidden');
      if (input) { input.value = ''; setTimeout(() => input.focus(), 0); }
    }
    render(-1);
  }

  function reset() {
    let ok = true;
    try { ok = confirm('¿Resetear todos los records?'); } catch (e) { ok = true; }
    if (!ok) return;
    try { localStorage.removeItem(KEY); } catch (e) { /* ignorar */ }
    pending = null;
    hideNameBlock();
    render(-1);
  }

  function bind() {
    const saveBtn = el('records-save');
    const input = el('records-name');
    const resetBtn = el('records-reset');
    const restart = el('restart-btn');
    if (saveBtn) saveBtn.addEventListener('click', commit);
    if (input) {
      input.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Enter') commit();
      });
    }
    if (resetBtn) resetBtn.addEventListener('click', reset);
    // Se registra antes que el de game.js: guarda el nombre pendiente al reiniciar.
    if (restart) restart.addEventListener('click', commit);
    render(-1);
  }

  bind();
  return { onInit, onLock, onGameOver };
})();
