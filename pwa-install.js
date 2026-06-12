/* PWA install · Sinergia Agrícola VIP
   - Registra el service worker
   - Muestra un popup para instalar la app (panel y auth)
   - "Más tarde": vuelve a aparecer pasados 3 días
   - Si ya está instalada: no muestra nada nunca más
*/
(function () {
  'use strict';

  // Registrar el service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  var K_INSTALLED = 'sinergia_pwa_installed';
  var K_LAST = 'sinergia_pwa_last_prompt';
  var COOLDOWN = 3 * 24 * 60 * 60 * 1000; // 3 días
  var deferred = null, shown = false;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;

  function lg(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ls(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function installed() { return lg(K_INSTALLED) === '1' || isStandalone; }
  function canShow() {
    if (installed()) return false;
    var last = parseInt(lg(K_LAST) || '0', 10);
    if (!last) return true;
    return (Date.now() - last) >= COOLDOWN;
  }
  function snooze() { ls(K_LAST, String(Date.now())); }
  function markInstalled() { ls(K_INSTALLED, '1'); hide(); }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', function () { markInstalled(); });

  // ---------- UI ----------
  function injectStyles() {
    if (document.getElementById('sa-pwa-style')) return;
    var s = document.createElement('style');
    s.id = 'sa-pwa-style';
    s.textContent =
      '#sa-pwa-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:flex-end;justify-content:center;' +
      'background:rgba(8,25,23,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;transition:opacity .25s ease;padding:0 14px calc(16px + env(safe-area-inset-bottom))}' +
      '#sa-pwa-ov.on{opacity:1}' +
      '#sa-pwa-card{width:100%;max-width:420px;background:#fff;border-radius:22px;padding:20px 20px 18px;' +
      'box-shadow:0 -10px 40px rgba(0,0,0,.28);transform:translateY(24px);transition:transform .3s cubic-bezier(.2,.8,.2,1);font-family:"Plus Jakarta Sans","Inter",system-ui,sans-serif}' +
      '#sa-pwa-ov.on #sa-pwa-card{transform:translateY(0)}' +
      '.sa-pwa-top{display:flex;align-items:center;gap:13px;margin-bottom:13px}' +
      '.sa-pwa-ic{width:54px;height:54px;border-radius:14px;flex:none;box-shadow:0 4px 12px rgba(15,118,110,.25);background:#fff}' +
      '.sa-pwa-tt{font-size:16.5px;font-weight:800;color:#11302C;line-height:1.15;letter-spacing:-.3px}' +
      '.sa-pwa-sub{font-size:12.5px;color:#5C7C77;margin-top:3px;line-height:1.4}' +
      '.sa-pwa-body{font-size:13px;color:#33514D;line-height:1.55;margin:2px 0 16px}' +
      '.sa-pwa-body b{color:#0F766E}' +
      '.sa-pwa-btns{display:flex;gap:10px}' +
      '.sa-pwa-btn{flex:1;border:none;border-radius:13px;padding:13px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:transform .12s,box-shadow .2s,background .2s}' +
      '.sa-pwa-btn:active{transform:scale(.97)}' +
      '.sa-pwa-later{background:#EEF3F2;color:#5C7C77}' +
      '.sa-pwa-go{background:linear-gradient(135deg,#0D9488,#0F766E);color:#fff;box-shadow:0 6px 16px rgba(15,118,110,.35)}' +
      '.sa-pwa-steps{margin:4px 0 16px;padding:0;list-style:none;font-size:13px;color:#33514D;line-height:1.5}' +
      '.sa-pwa-steps li{display:flex;gap:9px;align-items:flex-start;margin-bottom:8px}' +
      '.sa-pwa-steps .n{width:21px;height:21px;border-radius:50%;background:#D9F2EE;color:#0F766E;font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;flex:none}' +
      '.sa-pwa-steps b{color:#0F766E}';
    document.head.appendChild(s);
  }

  function hide() {
    var ov = document.getElementById('sa-pwa-ov');
    if (ov) { ov.classList.remove('on'); setTimeout(function () { if (ov && ov.parentNode) ov.parentNode.removeChild(ov); }, 300); }
  }

  function show() {
    if (shown || !canShow() || document.getElementById('sa-pwa-ov')) return;
    shown = true;
    injectStyles();
    var ov = document.createElement('div');
    ov.id = 'sa-pwa-ov';
    ov.innerHTML =
      '<div id="sa-pwa-card" role="dialog" aria-label="Instalar aplicación">' +
        '<div class="sa-pwa-top">' +
          '<img class="sa-pwa-ic" src="img/pwa-192.png" alt="Sinergia Agrícola">' +
          '<div><div class="sa-pwa-tt">Instala Sinergia Agrícola</div>' +
          '<div class="sa-pwa-sub">Acceso directo desde tu pantalla de inicio</div></div>' +
        '</div>' +
        '<div id="sa-pwa-content"></div>' +
      '</div>';
    document.body.appendChild(ov);
    renderDefault();
    requestAnimationFrame(function () { ov.classList.add('on'); });
    ov.addEventListener('click', function (e) { if (e.target === ov) { snooze(); hide(); } });
  }

  function renderDefault() {
    var c = document.getElementById('sa-pwa-content');
    if (!c) return;
    c.innerHTML =
      '<p class="sa-pwa-body">Instala la app para entrar más rápido, sin buscar el enlace, y vivir la experiencia <b>como una aplicación</b>.</p>' +
      '<div class="sa-pwa-btns">' +
        '<button class="sa-pwa-btn sa-pwa-later" id="sa-pwa-later">Más tarde</button>' +
        '<button class="sa-pwa-btn sa-pwa-go" id="sa-pwa-go">Instalar app</button>' +
      '</div>';
    document.getElementById('sa-pwa-later').onclick = function () { snooze(); hide(); };
    document.getElementById('sa-pwa-go').onclick = onInstall;
  }

  function renderIOS() {
    var c = document.getElementById('sa-pwa-content');
    if (!c) return;
    c.innerHTML =
      '<ol class="sa-pwa-steps">' +
        '<li><span class="n">1</span><span>Toca el botón <b>Compartir</b> (el cuadrito con la flecha hacia arriba).</span></li>' +
        '<li><span class="n">2</span><span>Elige <b>“Agregar a inicio”</b>.</span></li>' +
        '<li><span class="n">3</span><span>Confirma con <b>Agregar</b>. ¡Listo!</span></li>' +
      '</ol>' +
      '<div class="sa-pwa-btns">' +
        '<button class="sa-pwa-btn sa-pwa-later" id="sa-pwa-later">Más tarde</button>' +
        '<button class="sa-pwa-btn sa-pwa-go" id="sa-pwa-ok">Entendido</button>' +
      '</div>';
    document.getElementById('sa-pwa-later').onclick = function () { snooze(); hide(); };
    document.getElementById('sa-pwa-ok').onclick = function () { snooze(); hide(); };
  }

  function onInstall() {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function (res) {
        if (res && res.outcome === 'accepted') { markInstalled(); }
        else { snooze(); hide(); }
        deferred = null;
      });
    } else if (isIOS) {
      renderIOS(); // iOS no soporta instalación automática: mostrar pasos
    } else {
      // Navegador sin prompt disponible: posponer
      snooze(); hide();
    }
  }

  // Disparar al cargar (delay para dar chance a beforeinstallprompt)
  window.addEventListener('load', function () {
    if (installed()) return;
    setTimeout(function () { if (canShow()) show(); }, 1200);
  });
})();
