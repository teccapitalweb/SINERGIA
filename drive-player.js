/* Adaptador visual para el reproductor embebido de Google Drive.
   Drive muestra mejor su interfaz a un ancho de escritorio; en móvil se
   conserva ese lienzo y se escala completo, sin recortar controles. */
(function () {
  'use strict';

  var BASE_WIDTH = 640;
  var BASE_HEIGHT = 360;
  var mobile = window.matchMedia('(max-width: 640px)');

  function reset(shell, frame) {
    shell.classList.remove('drive-player-mobile');
    shell.style.removeProperty('height');
    shell.style.removeProperty('aspect-ratio');
    frame.style.removeProperty('width');
    frame.style.removeProperty('height');
    frame.style.removeProperty('inset');
    frame.style.removeProperty('transform');
    frame.style.removeProperty('transform-origin');
  }

  function fit(shell) {
    var frame = shell.querySelector('iframe');
    if (!frame) return;

    if (!mobile.matches) {
      reset(shell, frame);
      return;
    }

    var width = shell.clientWidth;
    if (!width) return;
    var scale = width / BASE_WIDTH;

    shell.classList.add('drive-player-mobile');
    shell.style.height = (BASE_HEIGHT * scale) + 'px';
    shell.style.aspectRatio = 'auto';
    frame.style.width = BASE_WIDTH + 'px';
    frame.style.height = BASE_HEIGHT + 'px';
    frame.style.inset = '0 auto auto 0';
    frame.style.transformOrigin = 'top left';
    frame.style.transform = 'translateZ(0) scale(' + scale + ')';
  }

  function init() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell:not(.video-proximamente)'));
    if (!shells.length) return;

    function refresh() { shells.forEach(fit); }
    refresh();

    if (window.ResizeObserver) {
      var observer = new ResizeObserver(refresh);
      shells.forEach(function (shell) { observer.observe(shell); });
    }
    mobile.addEventListener('change', refresh);
    window.addEventListener('orientationchange', refresh);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
