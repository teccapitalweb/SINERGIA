/* ═══════════════════════════════════════════════════════════
   Precios de los cursos · Sinergia Agrícola
   Lee precios.json y rellena los precios de la landing.

   ── MEJORA PROGRESIVA (lo importante de este archivo) ──
   Cada elemento marcado con data-precio YA trae el precio correcto
   escrito en el HTML. Este script solo lo SOBREESCRIBE cuando
   precios.json carga bien. Si el archivo no llega —red caída, 404,
   JSON mal formado— no se toca el DOM y la página sigue mostrando
   el precio bueno. Nunca se ve un hueco ni un "undefined".

   Por eso, al agregar un data-precio nuevo, escribe SIEMPRE el
   número correcto dentro del elemento. El atributo no reemplaza al
   HTML: lo respalda.

   ── LO QUE ESTE ARCHIVO NO CONTROLA ──
   El COBRO. Lo que se le carga a la tarjeta lo decide el objeto
   Price de Stripe desde el backend. precios.json manda sobre lo que
   se ANUNCIA, nada más. Si cambias un precio aquí, hay que cambiarlo
   también en Stripe o la landing y el cargo quedan desalineados.

   ── USO ──
     <script src="../precios.js"></script>
     <script>Precios.init('gerberas');</script>

   Ranuras disponibles para data-precio:
     numero     → 550       (el precio, con separador de miles)
     antes      → 1,050     (el precio tachado)
     ahorras    → 500       (antes − precio)
     descuento  → 48        (el % OFF, sin el símbolo)
     formato    → $550 MXN  (precio con moneda)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ── DE DÓNDE SALE EL PRECIO (en este orden) ──
  // 1. El backend (GET /precios). Es la fuente viva: el panel escribe ahí y
  //    el cambio se ve sin volver a publicar el sitio.
  // 2. precios.json del repo. Respaldo si el backend no responde.
  // 3. Lo escrito en el HTML. Si los dos fallan, no se toca nada.
  var URL_BACKEND = 'https://sinergia-webhook-production.up.railway.app/precios';

  // precios.json vive junto a este script. Se resuelve desde la URL del
  // propio <script> para que dé igual si la página está en /gerberas/,
  // en /habanero/ o en la raíz.
  var URL_JSON = (function () {
    var s = document.currentScript;
    if (s && s.src) {
      try { return new URL('precios.json', s.src).href; } catch (e) { /* sigue al respaldo */ }
    }
    return '/precios.json';
  })();

  var datos = null;   // { precio, antes, moneda } del curso activo
  var slug = null;

  function miles(n) {
    return Number(n).toLocaleString('es-MX');
  }

  function cuandoHayaDOM(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  var Precios = {
    curso:   function () { return slug; },
    cargado: function () { return datos !== null; },
    precio:  function () { return datos ? datos.precio : null; },
    moneda:  function () { return datos ? (datos.moneda || 'MXN') : null; },

    // null cuando el curso no anuncia precio tachado.
    antes: function () {
      return (datos && datos.antes != null) ? datos.antes : null;
    },

    ahorras: function () {
      if (!datos || datos.antes == null) return null;
      return datos.antes - datos.precio;
    },

    descuento: function () {
      if (!datos || !datos.antes) return null;
      return Math.round((datos.antes - datos.precio) / datos.antes * 100);
    },

    // formato()      → el precio del curso, "$550 MXN"
    // formato(1050)  → ese número, "$1,050 MXN"
    formato: function (n) {
      var v = (n == null) ? Precios.precio() : n;
      return (v == null) ? '' : '$' + miles(v) + ' ' + (Precios.moneda() || 'MXN');
    }
  };

  var RANURAS = {
    numero:    function () { var v = Precios.precio();    return v == null ? null : miles(v); },
    antes:     function () { var v = Precios.antes();     return v == null ? null : miles(v); },
    ahorras:   function () { var v = Precios.ahorras();   return v == null ? null : miles(v); },
    descuento: function () { var v = Precios.descuento(); return v == null ? null : String(v); },
    formato:   function () { var v = Precios.precio();    return v == null ? null : Precios.formato(v); }
  };

  // Rellena los [data-precio]. Devuelve cuántos escribió.
  // Si una ranura no aplica (curso sin precio tachado), deja el HTML como
  // estaba en vez de vaciar el elemento.
  Precios.pintar = function (raiz) {
    var els = (raiz || document).querySelectorAll('[data-precio]');
    var escritos = 0;
    for (var i = 0; i < els.length; i++) {
      var tipo = els[i].getAttribute('data-precio');
      var ranura = RANURAS[tipo];
      if (!ranura) {
        console.warn('[Precios] data-precio="' + tipo + '" no existe. Se respeta el HTML.');
        continue;
      }
      var valor = ranura();
      if (valor == null) continue;
      els[i].textContent = valor;
      escritos++;
    }
    return escritos;
  };

  // Siempre resuelve —nunca rechaza— para que una landing pueda llamar
  // init() sin .catch() y no ensuciar la consola con un unhandled rejection.
  // Se sabe si funcionó por el .ok del resultado o por Precios.cargado().
  function pedir(url, cursoSlug) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (json) {
        var d = json && json[cursoSlug];
        if (!d || typeof d.precio !== 'number') {
          throw new Error('sin precio válido para "' + cursoSlug + '"');
        }
        return d;
      });
  }

  Precios.init = function (cursoSlug) {
    slug = cursoSlug;
    var origen = null;

    return pedir(URL_BACKEND, cursoSlug)
      .then(function (d) { origen = 'backend'; return d; })
      .catch(function (errBackend) {
        // El backend puede estar dormido o caído: no es motivo para dejar de
        // pintar el precio. Se intenta el archivo del repo.
        console.warn('[Precios] El backend no respondió (' + errBackend.message +
                     '). Se intenta precios.json.');
        return pedir(URL_JSON, cursoSlug).then(function (d) { origen = 'precios.json'; return d; });
      })
      .then(function (d) {
        datos = d;
        return new Promise(function (res) {
          cuandoHayaDOM(function () {
            res({ ok: true, curso: cursoSlug, precio: d.precio, origen: origen, elementos: Precios.pintar() });
          });
        });
      })
      .catch(function (err) {
        // A propósito no se toca el DOM: el HTML ya trae el precio bueno.
        console.warn('[Precios] Ni el backend ni ' + URL_JSON + ' respondieron (' + err.message +
                     '). La landing se queda con los precios escritos en el HTML.');
        return { ok: false, curso: cursoSlug, error: err.message, elementos: 0 };
      });
  };

  global.Precios = Precios;
})(window);
