/* Envío anónimo de la ruta de aprendizaje y de las preguntas que Savia no supo contestar, para el panel «Encuesta».
   Solo manda algo si la persona aceptó «Estadísticas» en el aviso de cookies (clave sinergia_cookies de cookies.js)
   y su navegador no tiene activado «No rastrear». Sin eso, todo se queda en este navegador, como antes.
   Qué se manda: las opciones que elegiste en la ruta y un código al azar (se guarda en este navegador) para no contarte dos veces. Sin nombre, correo, teléfono ni IP.
   Lo de Savia: solo el texto de la pregunta que no supo contestar; el servidor le quita correos, enlaces y números largos.
   Ver privacidad.html. API: window.sinergiaEncuesta.{activa, respuesta, hablo, sinRespuesta} */
(function () {
  'use strict';
  var ID_KEY = 'sinergia_ruta_id';
  var h = location.hostname;
  var base = (h === 'localhost' || h === '127.0.0.1') ? 'http://localhost:3000' : 'https://sinergia-webhook-production.up.railway.app';

  function activa() {
    try {
      if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1') return false;
      var d = JSON.parse(localStorage.getItem('sinergia_cookies') || 'null');
      return !!(d && d.estadisticas === true);
    } catch (e) { return false; }
  }
  function nuevoId() {
    var b = new Uint8Array(12), s = '';
    (window.crypto || window.msCrypto).getRandomValues(b);
    for (var i = 0; i < b.length; i++) s += ('0' + b[i].toString(16)).slice(-2);
    return s;
  }
  function id() {
    try {
      var v = localStorage.getItem(ID_KEY);
      if (v && /^[a-f0-9]{24}$/.test(v)) return v;
      v = nuevoId(); localStorage.setItem(ID_KEY, v); return v;
    } catch (e) { return ''; }
  }
  function mandar(ruta, cuerpo) {
    try {
      fetch(base + ruta, { method: 'POST', keepalive: true, credentials: 'omit', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })
        .catch(function () { /* el envío nunca debe molestar */ });
    } catch (e) { /* el envío nunca debe molestar */ }
  }

  window.sinergiaEncuesta = {
    activa: activa,
    // r = respuestas de la ruta (clave → opción elegida)
    respuesta: function (r) { if (!activa() || !r) return; var i = id(); if (i) mandar('/api/encuesta/respuesta', { id: i, r: r }); },
    hablo: function () { if (!activa()) return; var i = id(); if (i) mandar('/api/encuesta/respuesta', { id: i, hablo: true }); },
    sinRespuesta: function (texto) { if (!activa() || !texto) return; mandar('/api/encuesta/sin-respuesta', { texto: String(texto).slice(0, 300) }); }
  };
})();
