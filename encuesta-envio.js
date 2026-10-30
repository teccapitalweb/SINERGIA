/* Envío anónimo de la ruta de aprendizaje y de las preguntas que Savia no supo contestar, para el panel «Encuesta».
   La portada avisa de forma visible que las respuestas se guardan de forma anónima. No se manda nada si el navegador tiene activado «No rastrear».
   Qué se manda: las opciones que elegiste en la ruta y un código al azar (se guarda en este navegador) para no contarte dos veces. Sin nombre, correo, teléfono ni IP.
   Lo de Savia: solo el texto de la pregunta que no supo contestar; el servidor le quita correos, enlaces y números largos.
   WhatsApp: solo si la persona lo escribe y acepta el Aviso de privacidad (contacto). Ver privacidad.html.
   API: window.sinergiaEncuesta.{activa, respuesta, hablo, sinRespuesta, contacto} */
(function () {
  'use strict';
  var ID_KEY = 'sinergia_ruta_id';
  var h = location.hostname;
  var base = (h === 'localhost' || h === '127.0.0.1') ? 'http://localhost:3000' : 'https://sinergia-webhook-production.up.railway.app';

  function activa() {
    try { return !(navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1'); } catch (e) { return true; }
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
    return fetch(base + ruta, { method: 'POST', keepalive: true, credentials: 'omit', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
  }
  function enSilencio(ruta, cuerpo) {
    try { mandar(ruta, cuerpo).catch(function () { /* el envío nunca debe molestar */ }); } catch (e) { /* el envío nunca debe molestar */ }
  }

  window.sinergiaEncuesta = {
    activa: activa,
    // r = respuestas de la ruta (clave → opción elegida)
    respuesta: function (r) { if (!activa() || !r) return; var i = id(); if (i) enSilencio('/api/encuesta/respuesta', { id: i, r: r }); },
    hablo: function () { if (!activa()) return; var i = id(); if (i) enSilencio('/api/encuesta/respuesta', { id: i, hablo: true }); },
    sinRespuesta: function (texto) { if (!activa() || !texto) return; enSilencio('/api/encuesta/sin-respuesta', { texto: String(texto).slice(0, 300) }); },
    // La persona dejó su WhatsApp y aceptó el aviso de privacidad. Devuelve una promesa con { ok, error }
    contacto: function (whatsapp, r) {
      var i = id();
      if (!i) return Promise.resolve({ ok: false, error: 'Tu navegador no permite guardar tu número. Escríbenos por WhatsApp.' });
      return mandar('/api/encuesta/contacto', { id: i, r: r, whatsapp: whatsapp, acepto: true })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return res.ok ? { ok: true } : { ok: false, error: j.error || 'No se pudo guardar tu número. Inténtalo de nuevo.' }; }); })
        .catch(function () { return { ok: false, error: 'Sin conexión. Inténtalo de nuevo en un momento.' }; });
    }
  };
})();
