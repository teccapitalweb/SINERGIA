/* Conteo anónimo de visitas de Sinergia-Agrícola.
   Solo cuenta si la persona aceptó «Estadísticas» en el aviso de cookies (clave sinergia_cookies de cookies.js).
   Suma 1 a un contador por día y página en nuestro servidor. No envía ni guarda cookies, IP, identificadores ni datos de tu navegador,
   y no cuenta si tu navegador tiene activado «No rastrear». Uso: <script src="visitas.js" data-pagina="portada" defer></script>
   (páginas válidas: portada, planes, acceso). Ver privacidad.html. */
(function () {
  'use strict';
  try {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1') return;
    var script = document.currentScript;
    var pagina = script && script.getAttribute('data-pagina');
    if (!pagina) return;
    var h = location.hostname;
    var base = (h === 'localhost' || h === '127.0.0.1') ? 'http://localhost:3000' : 'https://sinergia-webhook-production.up.railway.app';
    var contada = false;

    function aceptado() {
      try {
        var d = JSON.parse(localStorage.getItem('sinergia_cookies') || 'null');
        return !!(d && d.estadisticas === true);
      } catch (e) { return false; }
    }
    function contar() {
      if (contada || !aceptado()) return;
      contada = true;
      // Sin cookies (credentials: omit) y sin cuerpo: una petición simple que el servidor responde con «sin contenido»
      fetch(base + '/api/visitas?p=' + encodeURIComponent(pagina), { method: 'POST', keepalive: true, credentials: 'omit', mode: 'cors' }).catch(function () { /* el conteo nunca debe molestar */ });
    }

    contar();
    // Si la persona acepta «Estadísticas» en esta misma visita, se cuenta entonces
    window.addEventListener('sinergia:cookies', contar);
  } catch (e) { /* el conteo nunca debe molestar */ }
})();
