/* ============================================================ */
/* CERTIFICADOS · Sinergia-Agrícola                              */
/*                                                                */
/* Lógica de LECTURA compartida por validar-certificado.html,     */
/* ver-certificado.html y "Mis certificados" del panel:           */
/*  - formato del folio (SINERGIA-AAAA-XXXXXXXX; el anterior,    */
/*    IPCI-SIN-AAAA-NNNNNN, sigue siendo válido)                  */
/*  - consulta PÚBLICA GET /certificados/validar?folio= (sin      */
/*    sesión; el servidor decide si el folio existe y si sigue    */
/*    vigente)                                                    */
/*  - datos listos para dibujar (horas, clases, fecha, mensajes)  */
/*  - código QR dibujado en el propio navegador (sin servicios    */
/*    externos), con la librería qrcode-generator (MIT)           */
/* El certificado lo emite el servidor al terminar la última      */
/* clase: aquí no se crea nada. Se prueba en Node:                */
/*   SINERGIA\herramientas\certificados\probar-certificado.js     */
/* ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SIN_CERT = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var BASE_POR_DEFECTO = 'https://sinergia-webhook-production.up.railway.app';
  var SITIO = 'https://sinergiamexico.it.com';
  var URL_VALIDAR = SITIO + '/validar-certificado.html';
  var URL_VER = SITIO + '/ver-certificado.html';
  var ESPERA_MS = 9000;
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  // Folio que emite el servidor: SINERGIA-2026-9F3A71C2 (8 caracteres al azar). Los certificados anteriores llevan IPCI-SIN-2026-000123.
  // Revisión mínima antes de preguntar (el servidor decide si de verdad existe).
  var FOLIO_NUEVO = /^SINERGIA-\d{4}-[0-9A-F]{8}$/;
  var FOLIO_ANTERIOR = /^IPCI-SIN-\d{4}-\d{6}$/;
  var FOLIO_PLAUSIBLE = /^[A-Z0-9][A-Z0-9-]{4,79}$/;

  function texto(v, max) {
    var s = String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
    return max ? s.slice(0, max) : s;
  }

  function normalizarFolio(v) {
    return String(v == null ? '' : v).replace(/\s+/g, '').toUpperCase().slice(0, 80);
  }
  // 'nuevo' | 'anterior' | null
  function tipoFolio(v) {
    var f = normalizarFolio(v);
    if (FOLIO_NUEVO.test(f)) return 'nuevo';
    if (FOLIO_ANTERIOR.test(f)) return 'anterior';
    return null;
  }
  function folioValido(v) { return tipoFolio(v) !== null; }
  function folioPlausible(v) { return FOLIO_PLAUSIBLE.test(normalizarFolio(v)); }

  // Enlace que lleva el código QR y que se comparte: la verificación pública del folio.
  function urlVerificacion(folio) { return URL_VALIDAR + '?folio=' + encodeURIComponent(normalizarFolio(folio)); }
  // Página con el certificado completo (imprimir, compartir).
  function urlCertificado(folio) { return URL_VER + '?folio=' + encodeURIComponent(normalizarFolio(folio)); }

  /* ───────────────────────── Datos del certificado ───────────────────────── */

  // El servidor guarda la fecha ya escrita ("29 de octubre de 2026"); si llega una fecha ISO se escribe igual.
  function fechaLarga(v) {
    if (!v) return '';
    if (typeof v === 'string' && /^\d{1,2} de [a-záéíóú]+ de \d{4}$/i.test(v.trim())) return texto(v, 60);
    var d = typeof v.toDate === 'function' ? v.toDate() : new Date(v);
    if (isNaN(d.getTime())) return '';
    var p = { dia: d.getUTCDate(), mes: d.getUTCMonth() + 1, anio: d.getUTCFullYear() };
    try {
      var partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d);
      var o = {}; partes.forEach(function (x) { o[x.type] = Number(x.value); });
      if (o.day && o.month && o.year) p = { dia: o.day, mes: o.month, anio: o.year };
    } catch (e) { /* sin Intl: se usa UTC */ }
    return p.dia + ' de ' + MESES[p.mes - 1] + ' de ' + p.anio;
  }

  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

  // c: certificado tal como lo manda el servidor
  //   { folio, userName, courseName, institution, directorName, hours, sessions, courseArea, issueDate, status }
  function vistaCertificado(c) {
    var d = c && typeof c === 'object' ? c : {};
    var horas = Number(d.hours);
    var sesiones = Math.round(Number(d.sessions));
    var horasRedondeadas = isFinite(horas) && horas > 0 ? Math.round(horas * 10) / 10 : 0;
    var nSesiones = isFinite(sesiones) && sesiones > 0 ? sesiones : 0;
    var horasTexto = horasRedondeadas ? plural(horasRedondeadas, 'hora', 'horas') : '';
    var sesionesTexto = nSesiones ? plural(nSesiones, 'clase', 'clases') : '';
    return {
      folio: normalizarFolio(d.folio),
      nombre: texto(d.userName, 120),
      curso: texto(d.courseName, 200),
      area: texto(d.courseArea, 80),
      institucion: texto(d.institution, 80) || 'Sinergia-Agrícola',
      responsable: texto(d.directorName, 120),
      horas: horasRedondeadas,
      horasTexto: horasTexto,
      sesiones: nSesiones,
      sesionesTexto: sesionesTexto,
      fechaTexto: fechaLarga(d.issueDate),
      // "5 horas · 5 clases" para la ficha de verificación
      duracionTexto: [horasTexto, sesionesTexto].filter(Boolean).join(' · ')
    };
  }

  // Línea de detalle del certificado, en el orden en que se muestra
  function lineaDetalle(vista) {
    var v = vista || {};
    var partes = [];
    if (v.area) partes.push(v.area);
    if (v.sesionesTexto) partes.push(v.sesionesTexto);
    if (v.horasTexto) partes.push(v.horasTexto);
    partes.push('Modalidad en línea');
    return partes;
  }

  // Mensaje para quien comparte el certificado
  function textoCompartir(v) {
    var c = v || {};
    return 'Completé el curso "' + (c.curso || '') + '" en Sinergia-Agrícola.\n\nFolio: ' + (c.folio || '') + '\nVerifícalo aquí: ' + urlVerificacion(c.folio);
  }

  /* ───────────────────────── Mensajes ───────────────────────── */

  // estado: 'formato' | 'no-encontrado' | 'revocado' | 'limite' | 'red' | 'error' | 'falta-folio'
  var MENSAJES = {
    'formato': {
      titulo: 'Folio con formato no válido',
      detalle: 'Revisa que el folio esté escrito completo. Se ve así: SINERGIA-2026-9F3A71C2.'
    },
    'no-encontrado': {
      titulo: 'Folio no encontrado',
      detalle: 'Este folio no corresponde a ningún certificado emitido por Sinergia-Agrícola. Revisa que lo hayas escrito bien.'
    },
    'revocado': {
      titulo: 'Certificado revocado',
      detalle: 'Este certificado fue revocado por Sinergia-Agrícola y ya no es válido. Si tienes dudas, escríbenos.'
    },
    'limite': {
      titulo: 'Demasiadas consultas',
      detalle: 'Hiciste muchas consultas seguidas. Espera un minuto e inténtalo de nuevo.'
    },
    'red': {
      titulo: 'Sin conexión con el servidor',
      detalle: 'No pudimos conectar con Sinergia-Agrícola. Revisa tu internet e inténtalo de nuevo.'
    },
    'error': {
      titulo: 'No se pudo verificar',
      detalle: 'Ocurrió un problema al consultar el certificado. Inténtalo de nuevo en unos minutos.'
    },
    'falta-folio': {
      titulo: 'Falta el folio',
      detalle: 'El enlace no trae el número de folio del certificado.'
    }
  };

  function estadoDeStatus(status) {
    if (status === 400) return 'formato';
    if (status === 404) return 'no-encontrado';
    if (status === 429) return 'limite';
    if (status === 0) return 'red';
    return 'error';
  }
  function mensajeEstado(estado) { return MENSAJES[estado] || MENSAJES.error; }

  /* ───────────────────────── Consulta pública ───────────────────────── */

  function baseApi() {
    try {
      if (typeof BACKEND_URL !== 'undefined' && BACKEND_URL) return String(BACKEND_URL).replace(/\/+$/, '');
    } catch (e) { /* sin constante global */ }
    return BASE_POR_DEFECTO;
  }

  // GET /certificados/validar?folio=. No manda token (es pública). Nunca rechaza: devuelve
  //   { ok:true, certificado: vista, folio }
  //   { ok:false, estado, status, titulo, detalle, folio }
  // deps (opcional, para pruebas): { fetch, base, esperaMs }
  async function consultar(folioCrudo, deps) {
    var d = deps || {};
    var folio = normalizarFolio(folioCrudo);
    function fallo(estado, status) {
      var m = mensajeEstado(estado);
      return { ok: false, estado: estado, status: status, titulo: m.titulo, detalle: m.detalle, folio: folio };
    }
    if (!folio) return fallo('falta-folio', 0);
    if (!folioPlausible(folio)) return fallo('formato', 400);
    var f = d.fetch || (typeof fetch === 'function' ? function (u, o) { return fetch(u, o); } : null);
    if (!f) return fallo('red', 0);
    var base = d.base ? String(d.base).replace(/\/+$/, '') : baseApi();
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var corte = ctl ? setTimeout(function () { try { ctl.abort(); } catch (e) { /* ya terminó */ } }, d.esperaMs || ESPERA_MS) : null;
    try {
      var res = await f(base + '/certificados/validar?folio=' + encodeURIComponent(folio), { method: 'GET', cache: 'no-store', signal: ctl ? ctl.signal : undefined });
      var datos = null;
      try { datos = await res.json(); } catch (e) { datos = null; }
      if (!res.ok) return fallo(estadoDeStatus(res.status), res.status);
      if (datos && datos.revoked === true) return fallo('revocado', 200);
      if (!datos || datos.valid !== true || !datos.certificate || typeof datos.certificate !== 'object') return fallo('no-encontrado', 404);
      var vista = vistaCertificado(datos.certificate);
      if (!vista.folio) vista.folio = folio;
      return { ok: true, certificado: vista, folio: vista.folio };
    } catch (e) {
      return fallo('red', 0);
    } finally {
      if (corte) clearTimeout(corte);
    }
  }

  /* ───────────────────────── Código QR ───────────────────────── */

  // Devuelve un <svg> (texto) con el QR de `contenido`, listo para ponerse en la página o imprimirse.
  //   generador: la función qrcode(tipo, nivel) de qrcode-generator (en el navegador es la global `qrcode`)
  //   opciones:  { color, fondo, margen (módulos), nivel ('L'|'M'|'Q'|'H') }
  function qrComoSvg(contenido, generador, opciones) {
    var o = opciones || {};
    var gen = generador || (typeof qrcode === 'function' ? qrcode : null);
    if (!gen) throw new Error('Falta la librería del código QR');
    var qr = gen(0, o.nivel || 'M');
    qr.addData(String(contenido));
    qr.make();
    var n = qr.getModuleCount();
    var margen = o.margen == null ? 4 : o.margen;   // el QR pide 4 módulos de borde blanco para que lo lean bien
    var total = n + margen * 2;
    var trazo = '';
    for (var r = 0; r < n; r++) {
      var c = 0;
      while (c < n) {
        if (qr.isDark(r, c)) {
          var ini = c;
          while (c < n && qr.isDark(r, c)) c++;
          trazo += 'M' + (ini + margen) + ' ' + (r + margen) + 'h' + (c - ini) + 'v1h-' + (c - ini) + 'z';
        } else c++;
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" shape-rendering="crispEdges" role="img" aria-label="Código QR para verificar el certificado">' +
      '<rect width="' + total + '" height="' + total + '" fill="' + (o.fondo || '#ffffff') + '"/>' +
      '<path d="' + trazo + '" fill="' + (o.color || '#0b3d36') + '"/></svg>';
  }

  return {
    BASE_POR_DEFECTO: BASE_POR_DEFECTO, URL_VALIDAR: URL_VALIDAR, URL_VER: URL_VER, MENSAJES: MENSAJES,
    FOLIO_NUEVO: FOLIO_NUEVO, FOLIO_ANTERIOR: FOLIO_ANTERIOR,
    normalizarFolio: normalizarFolio, tipoFolio: tipoFolio, folioValido: folioValido, folioPlausible: folioPlausible,
    urlVerificacion: urlVerificacion, urlCertificado: urlCertificado,
    fechaLarga: fechaLarga, vistaCertificado: vistaCertificado, lineaDetalle: lineaDetalle, textoCompartir: textoCompartir,
    estadoDeStatus: estadoDeStatus, mensajeEstado: mensajeEstado,
    consultar: consultar, qrComoSvg: qrComoSvg
  };
});
