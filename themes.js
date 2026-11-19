'use strict';

// Skins visuales. Define COLORS (global, reasignado al cambiar de skin),
// themeDrawBlock() y themeGridColor() que usa game.js.

function rrect(context, x, y, w, h, r) {
  context.beginPath();
  if (context.roundRect) context.roundRect(x, y, w, h, r);
  else context.rect(x, y, w, h);
}

const SKINS = {
  retro: {
    name: 'Retro',
    colors: [null, '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784', '#e57373', '#7986cb', '#ffb74d'],
    grid: '#22222e',
    draw(context, px, py, s, color) {
      context.fillStyle = color;
      context.fillRect(px + 1, py + 1, s - 2, s - 2);
      context.fillStyle = 'rgba(255,255,255,0.12)';
      context.fillRect(px + 1, py + 1, s - 2, 4);
    },
  },
  neon: {
    name: 'Neon',
    colors: [null, '#00f5ff', '#fff200', '#d400ff', '#39ff14', '#ff073a', '#4d6bff', '#ff9500'],
    grid: '#16162a',
    draw(context, px, py, s, color) {
      context.shadowColor = color;
      context.shadowBlur = 12;
      context.fillStyle = 'rgba(0,0,0,0.85)';
      context.fillRect(px + 2, py + 2, s - 4, s - 4);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(px + 2, py + 2, s - 4, s - 4);
      context.fillStyle = color;
      context.globalAlpha *= 0.35;
      context.fillRect(px + 5, py + 5, s - 10, s - 10);
      context.shadowBlur = 0;
      context.shadowColor = 'transparent';
    },
  },
  pastel: {
    name: 'Pastel',
    colors: [null, '#a8e6ef', '#fff1b8', '#e4c1f9', '#b9f6ca', '#ffb3c1', '#b8c0ff', '#ffd6a5'],
    grid: '#e3dcea',
    draw(context, px, py, s, color) {
      context.fillStyle = color;
      rrect(context, px + 1.5, py + 1.5, s - 3, s - 3, 8);
      context.fill();
      context.fillStyle = 'rgba(255,255,255,0.45)';
      rrect(context, px + 5, py + 5, s - 14, 5, 3);
      context.fill();
    },
  },
  pixel: {
    name: 'Pixel art',
    colors: [null, '#29adff', '#ffec27', '#7e2553', '#00e436', '#ff004d', '#83769c', '#ffa300'],
    grid: '#1d2b53',
    draw(context, px, py, s, color) {
      context.fillStyle = color;
      context.fillRect(px, py, s, s);
      const u = s / 6;
      // patron de ladrillo/pixeles: claros arriba-izq, oscuros abajo-der
      context.fillStyle = 'rgba(255,255,255,0.3)';
      context.fillRect(px, py, s, u);
      context.fillRect(px, py, u, s);
      context.fillStyle = 'rgba(0,0,0,0.35)';
      context.fillRect(px, py + s - u, s, u);
      context.fillRect(px + s - u, py, u, s);
      context.fillStyle = 'rgba(0,0,0,0.18)';
      for (let i = 1; i < 5; i++)
        for (let j = 1; j < 5; j++)
          if ((i + j) % 2 === 0) context.fillRect(px + i * u, py + j * u, u, u);
    },
  },
};

let COLORS = SKINS.retro.colors;
let currentSkin = 'retro';

function themeDrawBlock(context, x, y, colorIndex, size) {
  const skin = SKINS[currentSkin];
  skin.draw(context, x * size, y * size, size, COLORS[colorIndex]);
  context.shadowBlur = 0;
}

function themeGridColor() {
  return SKINS[currentSkin].grid;
}

function setSkin(key, save) {
  if (!SKINS[key]) key = 'retro';
  currentSkin = key;
  COLORS = SKINS[key].colors;
  document.body.dataset.skin = key;
  const sel = document.getElementById('skin-select');
  if (sel && sel.value !== key) sel.value = key;
  if (save) {
    try { localStorage.setItem('tetris.skin', key); } catch (e) { /* ignorar */ }
  }
  // forzar redibujo (si el juego ya inicio; tambien en pausa / game over)
  try { draw(); drawNext(); } catch (e) { /* juego aun no listo */ }
}

(function initSkins() {
  const sel = document.getElementById('skin-select');
  if (sel) {
    sel.innerHTML = '';
    for (const k of Object.keys(SKINS)) {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = SKINS[k].name;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => {
      setSkin(sel.value, true);
      sel.blur(); // que las flechas/espacio no manejen el select
    });
  }
  let saved = null;
  try { saved = localStorage.getItem('tetris.skin'); } catch (e) { /* ignorar */ }
  setSkin(saved, false);
})();
