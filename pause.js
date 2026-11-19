'use strict';

// Menú de pausa. Depende de globals de game.js (startLevel, togglePause, init),
// que solo se usan en tiempo de evento, nunca al cargar este script.
(function () {
  const menu = document.getElementById('pause-menu');
  const mainView = document.getElementById('pause-main');
  const helpView = document.getElementById('pause-help');
  const levelSelect = document.getElementById('start-level-select');

  for (let i = 1; i <= 15; i++) {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = String(i);
    levelSelect.appendChild(opt);
  }

  function showView(help) {
    mainView.classList.toggle('hidden', help);
    helpView.classList.toggle('hidden', !help);
    document.getElementById(help ? 'pause-back' : 'pause-resume').focus();
  }

  window.showPauseMenu = function () {
    levelSelect.value = String(startLevel);
    menu.classList.remove('hidden');
    showView(false);
  };

  window.hidePauseMenu = function () {
    menu.classList.add('hidden');
    if (document.activeElement && menu.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  };

  document.getElementById('pause-resume').addEventListener('click', () => togglePause());
  document.getElementById('pause-restart').addEventListener('click', () => init());
  document.getElementById('pause-controls').addEventListener('click', () => showView(true));
  document.getElementById('pause-back').addEventListener('click', () => showView(false));
  levelSelect.addEventListener('change', () => {
    startLevel = Math.min(15, Math.max(1, parseInt(levelSelect.value, 10) || 1));
  });
})();
