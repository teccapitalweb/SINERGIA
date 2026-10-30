/* Aviso de cookies de SINERGIA Agrícola.
   Guarda la elección en este navegador (localStorage, clave "sinergia_cookies") y la expone para
   que cualquier herramienta de estadísticas futura solo se active si la persona la aceptó:
     window.sinergiaCookies.consentimiento()  -> { necesarias:true, preferencias:bool, estadisticas:bool, fecha, v } | null
     window.sinergiaCookies.abrir()           -> vuelve a mostrar el aviso para cambiar la elección
     evento "sinergia:cookies" en window      -> se dispara al guardar */
(function () {
  'use strict';
  var KEY = 'sinergia_cookies';
  var VERSION = 1;
  var memoria = null;

  function leer() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (d && d.v === VERSION) return d;
    } catch (e) { /* sin almacenamiento */ }
    return memoria && memoria.v === VERSION ? memoria : null;
  }
  function guardar(pref, est) {
    var d = { v: VERSION, necesarias: true, preferencias: !!pref, estadisticas: !!est, fecha: new Date().toISOString() };
    memoria = d;
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* sin almacenamiento */ }
    try { window.dispatchEvent(new CustomEvent('sinergia:cookies', { detail: d })); } catch (e) { /* navegador antiguo */ }
    return d;
  }

  var CSS = '' +
    '.ck{position:fixed;left:20px;bottom:20px;z-index:140;width:440px;max-width:calc(100vw - 24px);max-height:calc(100svh - 24px);overflow:auto;background:#FAF9F5;color:#183A33;border:1px solid #D9E5DF;border-radius:20px;padding:20px 20px 18px;box-shadow:0 30px 70px -28px rgba(11,32,20,.55);font:14px/1.55 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:0;transform:translateY(16px);transition:opacity .3s ease,transform .35s cubic-bezier(.22,.8,.24,1)}' +
    '.ck.on{opacity:1;transform:none}' +
    '.ck h2{font:700 16px/1.3 "Plus Jakarta Sans",Inter,sans-serif;color:#113D35;margin:0 0 6px}' +
    '.ck p{margin:0;color:#5A7168}' +
    '.ck a{color:#087F70;font-weight:600;text-decoration:underline;text-underline-offset:2px}' +
    '.ck a:hover{color:#113D35}' +
    '.ck-links{margin-top:8px;font-size:13px}' +
    '.ck-prefs{margin-top:14px;border-top:1px solid #D9E5DF}' +
    '.ck-prefs[hidden]{display:none}' +
    '.ck-op{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:12px 0;border-bottom:1px solid #D9E5DF}' +
    '.ck-op b{display:block;color:#113D35;font-size:13.5px}' +
    '.ck-op span{display:block;color:#5A7168;font-size:12.5px;line-height:1.45;margin-top:2px}' +
    '.ck-sw{position:relative;flex:none;width:42px;height:24px;margin-top:2px}' +
    '.ck-sw input{position:absolute;inset:0;width:100%;height:100%;opacity:0;margin:0;cursor:pointer}' +
    '.ck-sw i{position:absolute;inset:0;border-radius:99px;background:#C9D6D0;transition:background .2s;pointer-events:none}' +
    '.ck-sw i::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s}' +
    '.ck-sw input:checked+i{background:#1AA888}' +
    '.ck-sw input:checked+i::after{transform:translateX(18px)}' +
    '.ck-sw input:disabled{cursor:not-allowed}' +
    '.ck-sw input:disabled+i{opacity:.55}' +
    '.ck-sw input:focus-visible+i{outline:2px solid #113D35;outline-offset:2px}' +
    '.ck-acc{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}' +
    '.ck-b{flex:1 1 auto;min-height:42px;padding:10px 16px;border-radius:99px;border:1.5px solid #113D35;background:transparent;color:#113D35;font:700 13.5px/1 "Plus Jakarta Sans",Inter,sans-serif;cursor:pointer;transition:background .2s,color .2s,border-color .2s}' +
    '.ck-b:hover{background:#EDF4F0}' +
    '.ck-b:focus-visible{outline:2px solid #1AA888;outline-offset:2px}' +
    '.ck-b.main{background:#113D35;color:#fff}' +
    '.ck-b.main:hover{background:#1F5B4D;border-color:#1F5B4D}' +
    '.ck-pers{margin-top:10px;padding:0;background:none;border:0;color:#087F70;font:600 13px/1.2 Inter,sans-serif;text-decoration:underline;text-underline-offset:2px;cursor:pointer}' +
    '.ck-pers:hover{color:#113D35}' +
    '@media(max-width:760px){.ck{left:12px;right:12px;bottom:12px;width:auto;max-width:none;padding:18px 16px 16px;border-radius:18px}html.ck-abierto .sv-launch,html.ck-abierto .sv-hola{opacity:0!important;pointer-events:none!important}}' +
    '@media(prefers-reduced-motion:reduce){.ck,.ck-sw i,.ck-sw i::after{transition:none}}';

  var caja = null;

  function cerrar() {
    if (!caja) return;
    var c = caja; caja = null;
    c.classList.remove('on');
    document.documentElement.classList.remove('ck-abierto');
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 380);
  }

  function abrir() {
    if (caja) return;
    var actual = leer();
    if (!document.getElementById('ck-estilos')) {
      var st = document.createElement('style'); st.id = 'ck-estilos'; st.textContent = CSS; document.head.appendChild(st);
    }
    var el = document.createElement('div');
    el.className = 'ck';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'ck-tit');
    el.setAttribute('aria-describedby', 'ck-txt');
    el.innerHTML =
      '<h2 id="ck-tit">Cookies en Sinergia</h2>' +
      '<p id="ck-txt">Usamos cookies y almacenamiento del navegador para que el sitio funcione, recordar tus preferencias y, si lo permites, entender cómo se usa para mejorarlo.</p>' +
      '<p class="ck-links"><a href="terminos.html">Términos y condiciones</a> · <a href="privacidad.html">Aviso de privacidad</a></p>' +
      '<div class="ck-prefs" id="ck-prefs" hidden>' +
        '<div class="ck-op"><div><b>Necesarias</b><span>Mantienen tu sesión y hacen funcionar el sitio y los pagos. Siempre activas.</span></div><label class="ck-sw"><input type="checkbox" checked disabled aria-label="Necesarias"><i></i></label></div>' +
        '<div class="ck-op"><div><b>Preferencias</b><span>Recuerdan cosas como tu ruta de cursos sugerida y el tema que elegiste.</span></div><label class="ck-sw"><input type="checkbox" id="ck-pref" aria-label="Preferencias"><i></i></label></div>' +
        '<div class="ck-op"><div><b>Estadísticas</b><span>Nos dicen qué secciones se usan para mejorar el sitio. Hoy no usamos ninguna herramienta de estadísticas.</span></div><label class="ck-sw"><input type="checkbox" id="ck-est" aria-label="Estadísticas"><i></i></label></div>' +
      '</div>' +
      '<div class="ck-acc">' +
        '<button type="button" class="ck-b main" id="ck-todo">Aceptar todo</button>' +
        '<button type="button" class="ck-b" id="ck-nec">Solo necesarias</button>' +
      '</div>' +
      '<button type="button" class="ck-pers" id="ck-pers" aria-expanded="false" aria-controls="ck-prefs">Personalizar</button>';
    document.body.appendChild(el);
    caja = el;

    var prefs = el.querySelector('#ck-prefs');
    var pref = el.querySelector('#ck-pref');
    var est = el.querySelector('#ck-est');
    var pers = el.querySelector('#ck-pers');
    var acc = el.querySelector('.ck-acc');
    if (actual) { pref.checked = actual.preferencias; est.checked = actual.estadisticas; }

    function decidir(p, e) { guardar(p, e); cerrar(); }
    el.querySelector('#ck-todo').addEventListener('click', function () { decidir(true, true); });
    el.querySelector('#ck-nec').addEventListener('click', function () { decidir(false, false); });
    pers.addEventListener('click', function () {
      var abierto = !prefs.hidden;
      if (abierto) { prefs.hidden = true; pers.textContent = 'Personalizar'; pers.setAttribute('aria-expanded', 'false'); var g = el.querySelector('#ck-guardar'); if (g) g.parentNode.removeChild(g); return; }
      prefs.hidden = false; pers.textContent = 'Ocultar opciones'; pers.setAttribute('aria-expanded', 'true');
      if (!el.querySelector('#ck-guardar')) {
        var b = document.createElement('button');
        b.type = 'button'; b.id = 'ck-guardar'; b.className = 'ck-b'; b.textContent = 'Guardar mi selección';
        b.addEventListener('click', function () { decidir(pref.checked, est.checked); });
        acc.appendChild(b);
      }
    });

    document.documentElement.classList.add('ck-abierto');
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('on'); }); });
  }

  window.sinergiaCookies = { abrir: abrir, consentimiento: leer };

  function iniciar() {
    // Los enlaces "Configurar cookies" de las páginas
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cookies-abrir]') : null;
      if (t) { e.preventDefault(); abrir(); }
    });
    if (!leer()) setTimeout(abrir, 600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
