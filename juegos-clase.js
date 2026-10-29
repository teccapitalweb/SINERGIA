/* ==========================================================================
   juegos-clase.js  -  Motor visual de actividades y juegos de clase (SINERGIA)
   JavaScript clasico, sin modulos ni dependencias. Expone window.SinergiaJuegos.

   - Actividades CALIFICABLES: solo dibuja y recoge respuestas. NUNCA conoce
     las respuestas correctas (las califica el servidor).
   - Juegos de PRACTICA: se resuelven en el navegador (no cuentan para nota).
   - Toda cadena de usuario se inserta con textContent / nodos de texto.
   - Estilos inyectados una sola vez en <style id="juegos-clase-css">, clases jg-*.
   ========================================================================== */
(function () {
  'use strict';

  /* =======================================================================
     1. FUNCIONES PURAS (sin DOM, probables en Node)
     ======================================================================= */

  // Mayusculas, sin acentos, N en lugar de Ñ, solo A-Z y 0-9 (sin espacios).
  function normalizar(s) {
    return String(s == null ? '' : s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  function azar(rng) { return (rng || Math.random)(); }
  function entero(n, rng) { return Math.floor(azar(rng) * n); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  // Copia barajada (Fisher-Yates).
  function barajar(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = entero(i + 1, rng);
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Permutacion de 0..n-1 que NO es la identidad (n >= 2).
  // opciones.sinFijos = true => ningun elemento queda en su sitio (derangement).
  function permutacion(n, opciones, rng) {
    var base = [], i;
    for (i = 0; i < n; i++) base.push(i);
    if (n < 2) return base;
    var sinFijos = !!(opciones && opciones.sinFijos);
    for (var intento = 0; intento < 1000; intento++) {
      var p = barajar(base, rng);
      var identidad = true, fijo = false;
      for (i = 0; i < n; i++) {
        if (p[i] !== i) identidad = false; else fijo = true;
      }
      if (identidad) continue;
      if (sinFijos && fijo) continue;
      return p;
    }
    // Respaldo determinista: rotacion de una posicion (no es identidad ni tiene fijos).
    return base.map(function (_, k) { return (k + 1) % n; });
  }

  // Copia barajada del arreglo que nunca queda igual (por posicion) al original.
  function barajarSinIdentidad(arr, rng) {
    return permutacion(arr.length, null, rng).map(function (i) { return arr[i]; });
  }

  // Solo http(s). Devuelve la URL normalizada o null.
  function urlSegura(u) {
    if (typeof u !== 'string') return null;
    var s = u.trim();
    if (!/^https?:\/\//i.test(s)) return null;
    try {
      var p = new URL(s);
      if (p.protocol !== 'http:' && p.protocol !== 'https:') return null;
      return p.href;
    } catch (e) { return null; }
  }

  // Acepta coma o punto decimal. Devuelve Number o null.
  function parsearNumero(txt) {
    var s = String(txt == null ? '' : txt).replace(/\s+/g, '');
    if (!s) return null;
    if (!/^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/.test(s)) return null;
    var n = Number(s.replace(',', '.'));
    return isFinite(n) ? n : null;
  }

  /* ----- Sopa de letras ------------------------------------------------- */
  // Direcciones faciles: derecha, abajo, diagonal abajo-derecha.
  var DIRS_SOPA = [[0, 1], [1, 0], [1, 1]];
  var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Devuelve { tam, cuadricula:[[letra]], colocadas:[{palabra,original,fila,col,df,dc}], noColocadas:[] }
  function generarSopa(palabras, tam, rng) {
    var lista = [], vistos = {};
    (palabras || []).forEach(function (p) {
      var n = normalizar(p);
      if (n.length >= 2 && !vistos[n]) {
        vistos[n] = true;
        lista.push({ palabra: n, original: String(p).trim() });
      }
    });
    var maxLen = lista.reduce(function (m, x) { return Math.max(m, x.palabra.length); }, 0);
    tam = Math.max(tam || 10, maxLen);

    var orden = lista.slice().sort(function (a, b) { return b.palabra.length - a.palabra.length; });

    for (var intento = 0; intento < 60; intento++) {
      var g = [], f, c, k;
      for (f = 0; f < tam; f++) { g.push([]); for (c = 0; c < tam; c++) g[f].push(''); }
      var colocadas = [], ok = true;

      for (var w = 0; w < orden.length && ok; w++) {
        var pal = orden[w].palabra, L = pal.length, cands = [];
        for (var d = 0; d < DIRS_SOPA.length; d++) {
          var df = DIRS_SOPA[d][0], dc = DIRS_SOPA[d][1];
          for (f = 0; f < tam; f++) {
            for (c = 0; c < tam; c++) {
              var ff = f + df * (L - 1), cc = c + dc * (L - 1);
              if (ff >= tam || cc >= tam) continue;
              var libre = true;
              for (k = 0; k < L; k++) {
                var cel = g[f + df * k][c + dc * k];
                if (cel !== '' && cel !== pal.charAt(k)) { libre = false; break; }
              }
              if (libre) cands.push([f, c, df, dc]);
            }
          }
        }
        if (!cands.length) { ok = false; break; }
        var e = cands[entero(cands.length, rng)];
        for (k = 0; k < L; k++) g[e[0] + e[2] * k][e[1] + e[3] * k] = pal.charAt(k);
        colocadas.push({ palabra: pal, original: orden[w].original, fila: e[0], col: e[1], df: e[2], dc: e[3] });
      }
      if (!ok) continue;

      for (f = 0; f < tam; f++) for (c = 0; c < tam; c++) {
        if (g[f][c] === '') g[f][c] = ABC.charAt(entero(26, rng));
      }
      // Mismo orden en que llegaron las palabras.
      colocadas.sort(function (a, b) {
        return indiceDe(lista, a.palabra) - indiceDe(lista, b.palabra);
      });
      return { tam: tam, cuadricula: g, colocadas: colocadas, noColocadas: [] };
    }
    return { tam: tam, cuadricula: [], colocadas: [], noColocadas: lista.map(function (x) { return x.palabra; }) };
  }

  function indiceDe(lista, palabra) {
    for (var i = 0; i < lista.length; i++) if (lista[i].palabra === palabra) return i;
    return -1;
  }

  /* ----- Crucigrama ----------------------------------------------------- */
  // Entrada: [{palabra, pista}]. Salida:
  // { filas, columnas, celdas:[[letra|null]], palabras:[{palabra,original,pista,fila,col,horiz,numero}], noColocadas:[] }
  function generarCrucigrama(entrada, rng) {
    var items = [];
    (entrada || []).forEach(function (p) {
      var w = normalizar(p && p.palabra);
      if (w.length >= 2) items.push({
        palabra: w,
        original: String(p.palabra).trim(),
        pista: String(p.pista == null ? '' : p.pista)
      });
    });
    if (!items.length) return { filas: 0, columnas: 0, celdas: [], palabras: [], noColocadas: [] };

    var mapa = {};          // 'f,c' -> { l, h, v }
    var colocadas = [];
    var caja = { minF: 0, maxF: 0, minC: 0, maxC: 0 };

    function hay(f, c) { return mapa[f + ',' + c]; }

    // Cruces validos (>=0) o -1 si no se puede colocar asi.
    function puede(w, f, c, horiz) {
      var df = horiz ? 0 : 1, dc = horiz ? 1 : 0, L = w.length;
      if (hay(f - df, c - dc) || hay(f + df * L, c + dc * L)) return -1;
      var cruces = 0;
      for (var i = 0; i < L; i++) {
        var ff = f + df * i, cc = c + dc * i, ex = hay(ff, cc);
        if (ex) {
          if (ex.l !== w.charAt(i)) return -1;
          if (horiz ? ex.h : ex.v) return -1;   // solapa con palabra de la misma direccion
          cruces++;
        } else if (hay(ff + dc, cc + df) || hay(ff - dc, cc - df)) {
          return -1;                             // tocaria lateralmente a otra palabra
        }
      }
      return cruces;
    }

    function poner(it, f, c, horiz) {
      var df = horiz ? 0 : 1, dc = horiz ? 1 : 0;
      for (var i = 0; i < it.palabra.length; i++) {
        var key = (f + df * i) + ',' + (c + dc * i);
        var ex = mapa[key];
        if (!ex) ex = mapa[key] = { l: it.palabra.charAt(i), h: false, v: false };
        if (horiz) ex.h = true; else ex.v = true;
      }
      var fe = f + df * (it.palabra.length - 1), ce = c + dc * (it.palabra.length - 1);
      caja.minF = Math.min(caja.minF, f); caja.maxF = Math.max(caja.maxF, fe);
      caja.minC = Math.min(caja.minC, c); caja.maxC = Math.max(caja.maxC, ce);
      colocadas.push({ palabra: it.palabra, original: it.original, pista: it.pista, fila: f, col: c, horiz: horiz });
    }

    var pendientes = items.slice();
    var primera = pendientes.shift();
    caja.maxC = primera.palabra.length - 1;
    poner(primera, 0, 0, true);

    while (pendientes.length) {
      var cands = [], bestScore = -Infinity, best = null;
      for (var idx = 0; idx < pendientes.length; idx++) {
        var w = pendientes[idx].palabra;
        for (var pi = 0; pi < colocadas.length; pi++) {
          var p = colocadas[pi];
          for (var i = 0; i < w.length; i++) {
            for (var j = 0; j < p.palabra.length; j++) {
              if (w.charAt(i) !== p.palabra.charAt(j)) continue;
              var horiz = !p.horiz;                       // perpendicular
              var pf = p.fila + (p.horiz ? 0 : j), pc = p.col + (p.horiz ? j : 0);
              var f = horiz ? pf : pf - i, c = horiz ? pc - i : pc;
              var r = puede(w, f, c, horiz);
              if (r > 0) {
                var fe = f + (horiz ? 0 : w.length - 1), ce = c + (horiz ? w.length - 1 : 0);
                var area = (Math.max(caja.maxF, fe) - Math.min(caja.minF, f) + 1) *
                           (Math.max(caja.maxC, ce) - Math.min(caja.minC, c) + 1);
                var score = r * 50 - area + azar(rng) * 3;
                if (score > bestScore) { bestScore = score; best = { idx: idx, f: f, c: c, horiz: horiz }; }
                cands.push(1);
              }
            }
          }
        }
      }
      if (best) {
        var it = pendientes.splice(best.idx, 1)[0];
        poner(it, best.f, best.c, best.horiz);
      } else {
        // Sin letras compartidas: fila/columna libre, sin tocar a las demas.
        var libre = pendientes.shift();
        if (colocadas.length % 2 === 0) poner(libre, caja.maxF + 2, caja.minC, true);
        else poner(libre, caja.minF, caja.maxC + 2, false);
      }
    }

    // Normaliza coordenadas a (0,0) y arma la cuadricula.
    var offF = caja.minF, offC = caja.minC;
    var filas = caja.maxF - caja.minF + 1, columnas = caja.maxC - caja.minC + 1;
    var celdas = [], f2, c2;
    for (f2 = 0; f2 < filas; f2++) {
      celdas.push([]);
      for (c2 = 0; c2 < columnas; c2++) celdas[f2].push(null);
    }
    Object.keys(mapa).forEach(function (k) {
      var par = k.split(',');
      celdas[+par[0] - offF][+par[1] - offC] = mapa[k].l;
    });
    colocadas.forEach(function (p) { p.fila -= offF; p.col -= offC; });

    // Numeracion por orden de lectura de las casillas de inicio.
    var numeros = {}, n = 0;
    for (f2 = 0; f2 < filas; f2++) for (c2 = 0; c2 < columnas; c2++) {
      var empieza = colocadas.some(function (p) { return p.fila === f2 && p.col === c2; });
      if (empieza) numeros[f2 + ',' + c2] = ++n;
    }
    colocadas.forEach(function (p) { p.numero = numeros[p.fila + ',' + p.col]; });
    colocadas.sort(function (a, b) { return a.numero - b.numero || (a.horiz ? -1 : 1); });

    return { filas: filas, columnas: columnas, celdas: celdas, palabras: colocadas, noColocadas: [] };
  }

  /* =======================================================================
     2. EXPORTS PARA NODE (pruebas)
     ======================================================================= */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      generarSopa: generarSopa,
      generarCrucigrama: generarCrucigrama,
      normalizar: normalizar,
      barajarSinIdentidad: barajarSinIdentidad,
      permutacion: permutacion,
      urlSegura: urlSegura,
      parsearNumero: parsearNumero
    };
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  /* =======================================================================
     3. DOM: utilidades y estilos
     ======================================================================= */
  var uid = 0;
  var LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function reducido() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    catch (e) { return false; }
  }

  function anexar(padre, hijo) {
    if (hijo == null || hijo === false) return;
    if (Array.isArray(hijo)) { hijo.forEach(function (x) { anexar(padre, x); }); return; }
    if (hijo.nodeType) padre.appendChild(hijo);
    else padre.appendChild(document.createTextNode(String(hijo)));
  }

  // h(tag, props, ...hijos). props.text -> textContent; class -> className; el resto atributos.
  function h(tag, props) {
    var e = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === 'class') e.className = v;
        else if (k === 'text') e.textContent = v;
        else e.setAttribute(k, v === true ? '' : String(v));
      });
    }
    for (var i = 2; i < arguments.length; i++) anexar(e, arguments[i]);
    return e;
  }

  function enfocar(e) { try { if (e) e.focus(); } catch (x) { /* sin foco */ } }

  function aviso(texto) { return h('p', { class: 'jg-aviso', role: 'status', text: texto }); }

  function cssUrl(u) {
    return 'url("' + u.replace(/["\\\r\n]/g, function (ch) { return encodeURIComponent(ch); }) + '")';
  }

  var CSS = [
    /* Base y variables locales (el modo oscuro del panel cambia las variables --bg-* / --text-*) */
    '.jg-root{--jg-ac:#087F70;--jg-pr:#113D35;--jg-pr-h:#1F5B4D;--jg-pr-t:#fff;--jg-err:#B4232C;--jg-sel:rgba(26,168,136,.14);color:var(--text-primary,#10231E);font-family:inherit;font-size:15px;line-height:1.5;text-align:left}',
    'html[data-theme="dark"] .jg-root{--jg-ac:#92C7A1;--jg-pr:#1AA888;--jg-pr-h:#3CC1A2;--jg-pr-t:#04201A;--jg-err:#F08A8F}',
    '.jg-root *,.jg-root *::before,.jg-root *::after{box-sizing:border-box}',
    '.jg-root :where(button,input){font-family:inherit;font-size:inherit;color:inherit;margin:0}',
    '.jg-root :where(button){cursor:pointer}',
    '.jg-root :where(button,input):focus-visible{outline:2px solid #1AA888;outline-offset:2px}',
    '.jg-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}',

    /* Textos y bloques comunes */
    '.jg-q{margin:0 0 12px;font-size:16px;font-weight:600;line-height:1.45;overflow-wrap:anywhere}',
    '.jg-ctx{margin:0 0 14px;padding:12px 14px;background:var(--bg-subtle,#F3F6F4);border:1px solid var(--border-card,#D9E2DD);border-left:4px solid #1AA888;border-radius:12px;white-space:pre-line;overflow-wrap:anywhere}',
    '.jg-ctx-t{display:block;margin-bottom:4px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--jg-ac)}',
    '.jg-pistas{margin:0 0 14px;padding:10px 14px;background:var(--bg-subtle,#F3F6F4);border-radius:12px;color:var(--text-secondary,#4A5E57);font-size:14px}',
    '.jg-pistas strong{display:block;margin-bottom:2px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--jg-ac)}',
    '.jg-pistas ol{margin:0;padding-left:20px}',
    '.jg-sub{margin:16px 0 8px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary,#4A5E57)}',
    '.jg-nota{margin:8px 0 0;font-size:13px;color:var(--text-secondary,#4A5E57)}',
    '.jg-error{margin:6px 0 0;font-size:13px;font-weight:600;color:var(--jg-err)}',
    '.jg-aviso{margin:8px 0;padding:10px 12px;border:1px solid var(--border-card,#D9E2DD);border-left:4px solid var(--jg-err);border-radius:12px;background:var(--bg-subtle,#F3F6F4);font-size:14px}',
    '.jg-msg{min-height:22px;margin:0 0 10px;font-size:14px;font-weight:600;color:var(--text-secondary,#4A5E57)}',
    '.jg-why{margin:14px 0 0;padding:12px 14px;background:var(--bg-subtle,#F3F6F4);border:1px solid var(--border-card,#D9E2DD);border-radius:12px;font-size:14px;color:var(--text-secondary,#4A5E57)}',
    '.jg-why strong{display:block;margin-bottom:2px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--jg-ac)}',
    '.jg-why p{margin:0;white-space:pre-line;overflow-wrap:anywhere}',

    /* Botones */
    '.jg-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border:1.5px solid var(--jg-pr);border-radius:12px;background:var(--jg-pr);color:var(--jg-pr-t);font-weight:600;transition:background-color .15s,border-color .15s}',
    '.jg-btn:hover{background:var(--jg-pr-h);border-color:var(--jg-pr-h)}',
    '.jg-btn[disabled]{opacity:.5;cursor:not-allowed}',
    '.jg-btn-sec{background:transparent;color:var(--text-primary,#10231E);border-color:var(--border-card,#D9E2DD)}',
    '.jg-btn-sec:hover{background:var(--bg-subtle,#F3F6F4);border-color:#1AA888}',
    '.jg-fila{display:flex;flex-wrap:wrap;align-items:center;gap:8px}',

    /* Opciones (opcion / vf) */
    '.jg-opts{display:flex;flex-direction:column;gap:8px}',
    '.jg-opt{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:10px 14px;text-align:left;background:var(--bg-card,#fff);color:var(--text-primary,#10231E);border:1.5px solid var(--border-card,#D9E2DD);border-radius:12px;line-height:1.4;transition:background-color .15s,border-color .15s}',
    '.jg-opt:hover{border-color:#1AA888}',
    '.jg-opt[aria-pressed="true"]{border-color:#1AA888;background:var(--jg-sel);box-shadow:inset 0 0 0 1px #1AA888}',
    '.jg-opt-l{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:1.5px solid var(--border-card,#D9E2DD);border-radius:8px;font-size:13px;font-weight:700;color:var(--jg-ac)}',
    '.jg-opt[aria-pressed="true"] .jg-opt-l{background:#1AA888;border-color:#1AA888;color:#04201A}',
    '.jg-opt-t{flex:1;min-width:0;overflow-wrap:anywhere}',

    /* Detecta el error */
    '.jg-img-box{margin:0 0 4px;text-align:center}',
    '.jg-img-wrap{position:relative;display:inline-block;max-width:100%;line-height:0;vertical-align:top;border-radius:12px;overflow:visible}',
    '.jg-img{display:block;width:auto;height:auto;max-width:100%;max-height:380px;object-fit:contain;border-radius:12px;border:1px solid var(--border-card,#D9E2DD)}',
    '.jg-marca{position:absolute;width:36px;height:36px;padding:0;transform:translate(-50%,-50%);border:2px solid #fff;border-radius:50%;background:rgba(17,61,53,.9);color:#fff;font-size:14px;font-weight:700;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.35)}',
    '.jg-marca::after{content:"";position:absolute;top:-4px;right:-4px;bottom:-4px;left:-4px;border-radius:50%}',
    '.jg-marca:hover{background:#1F5B4D}',
    '.jg-marca[aria-pressed="true"]{background:#1AA888;color:#04201A;box-shadow:0 0 0 4px rgba(26,168,136,.4)}',
    '.jg-puntos{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}',
    '.jg-chip{min-height:44px;padding:0 16px;border:1.5px solid var(--border-card,#D9E2DD);border-radius:12px;background:var(--bg-card,#fff);color:var(--text-primary,#10231E);font-weight:600}',
    '.jg-chip:hover{border-color:#1AA888}',
    '.jg-chip[aria-pressed="true"]{border-color:#1AA888;background:var(--jg-sel);box-shadow:inset 0 0 0 1px #1AA888}',

    /* Ordena el procedimiento */
    '.jg-orden-lista{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}',
    '.jg-orden-item{display:flex;align-items:stretch;gap:6px}',
    '.jg-orden-item .jg-opt{width:auto;flex:1;min-width:0;border-color:#1AA888}',
    '.jg-orden-n{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;font-weight:700;color:var(--jg-ac)}',
    '.jg-mini{flex:none;width:44px;min-height:44px;padding:0;border:1.5px solid var(--border-card,#D9E2DD);border-radius:12px;background:var(--bg-card,#fff);color:var(--text-primary,#10231E);font-size:13px}',
    '.jg-mini:hover:not([disabled]){border-color:#1AA888}',
    '.jg-mini[disabled]{opacity:.35;cursor:not-allowed}',
    '.jg-vacio{margin:0;padding:12px 14px;border:1.5px dashed var(--border-card,#D9E2DD);border-radius:12px;color:var(--text-secondary,#4A5E57);font-size:14px}',

    /* Calcula y produce */
    '.jg-calc{display:flex;flex-wrap:wrap;align-items:center;gap:10px}',
    '.jg-input{width:100%;max-width:220px;min-height:48px;padding:8px 14px;background:var(--bg-card,#fff);color:var(--text-primary,#10231E);border:1.5px solid var(--border-card,#D9E2DD);border-radius:12px;font-size:18px;font-weight:600}',
    '.jg-input[aria-invalid="true"]{border-color:var(--jg-err)}',
    '.jg-unidad{font-weight:600;color:var(--text-secondary,#4A5E57)}',

    /* Juegos de practica */
    '.jg-juego{max-width:480px;margin:0 auto}',
    '.jg-barra{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 16px;margin:0 0 12px;font-size:14px;color:var(--text-secondary,#4A5E57)}',
    '.jg-barra strong{color:var(--text-primary,#10231E)}',
    '.jg-exito{margin:16px 0 0;padding:16px;border:1.5px solid #1AA888;border-radius:14px;background:var(--jg-sel)}',
    '.jg-exito-t{margin:0;font-size:18px;font-weight:700;color:var(--jg-ac)}',
    '.jg-exito-d{margin:4px 0 12px}',

    /* Rompecabezas */
    '.jg-rc-ref{display:flex;align-items:center;gap:12px;margin:0 0 12px;font-size:13px;color:var(--text-secondary,#4A5E57)}',
    '.jg-rc-ref img{display:block;width:88px;height:auto;border-radius:8px;border:1px solid var(--border-card,#D9E2DD)}',
    '.jg-rc-tab{display:grid;gap:2px;width:100%;max-width:420px;margin:0 auto;padding:2px;background:var(--border-card,#D9E2DD);border-radius:12px;overflow:hidden}',
    '.jg-rc-pieza{display:block;width:100%;height:100%;min-height:0;padding:0;border:0;border-radius:0;background-color:var(--bg-subtle,#F3F6F4);background-repeat:no-repeat}',
    '.jg-rc-pieza:hover:not([disabled]){filter:brightness(1.08)}',
    '.jg-rc-pieza[aria-pressed="true"]{box-shadow:inset 0 0 0 4px #1AA888;filter:brightness(1.12)}',
    '.jg-root .jg-rc-pieza:focus-visible{outline:2px solid #1AA888;outline-offset:-5px}',

    /* Sopa */
    '.jg-sp-grid{display:grid;gap:2px;width:100%;max-width:440px;margin:0 auto 14px;user-select:none;-webkit-user-select:none}',
    '.jg-sp-c{display:flex;align-items:center;justify-content:center;aspect-ratio:1;min-width:0;padding:0;background:var(--bg-card,#fff);color:var(--text-primary,#10231E);border:1px solid var(--border-card,#D9E2DD);border-radius:6px;font-size:clamp(13px,3.6vw,18px);font-weight:700}',
    '.jg-sp-c.jg-sel{background:var(--jg-sel);border-color:#1AA888}',
    '.jg-sp-c.jg-hallada{background:#A9DDB9;border-color:#A9DDB9;color:#0C3A2F}',
    '.jg-sp-pal{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px}',
    '.jg-sp-pal li{padding:6px 12px;border:1px solid var(--border-card,#D9E2DD);border-radius:999px;font-size:14px;font-weight:600;letter-spacing:.03em;overflow-wrap:anywhere}',
    '.jg-sp-pal li.jg-ok{background:#A9DDB9;border-color:#A9DDB9;color:#0C3A2F;text-decoration:line-through}',

    /* Memoria */
    '.jg-mm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0 0 14px}',
    '@media (max-width:420px){.jg-mm-grid{grid-template-columns:repeat(2,1fr)}}',
    '.jg-mm-c{display:flex;align-items:center;justify-content:center;min-height:96px;padding:6px;text-align:center;background:var(--jg-pr);color:var(--jg-pr-t);border:1.5px solid var(--jg-pr);border-radius:12px;font-size:14px;font-weight:600;line-height:1.3;overflow:hidden;overflow-wrap:anywhere}',
    '.jg-mm-c[data-e="abierta"]{background:var(--bg-card,#fff);color:var(--text-primary,#10231E);border-color:#1AA888}',
    '.jg-mm-c[data-e="ok"]{background:rgba(169,221,185,.35);color:var(--text-primary,#10231E);border-color:#A9DDB9;cursor:default}',
    '.jg-mm-c img{display:block;max-width:100%;max-height:84px;object-fit:contain;border-radius:6px}',
    '.jg-mm-num{font-size:18px;font-weight:700}',

    /* Conecta */
    '.jg-cn-cols{display:grid;grid-template-columns:1fr 1fr;gap:0 14px;margin:0 0 14px}',
    '.jg-cn-col{display:flex;flex-direction:column;gap:8px;min-width:0}',
    '.jg-cn-item{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:52px;padding:8px 10px;text-align:left;background:var(--bg-card,#fff);color:var(--text-primary,#10231E);border:2px solid var(--border-card,#D9E2DD);border-radius:12px;line-height:1.35;overflow-wrap:anywhere}',
    '.jg-cn-item:hover:not([disabled]){border-color:#1AA888}',
    '.jg-cn-item[aria-pressed="true"]{box-shadow:0 0 0 3px rgba(26,168,136,.4)}',
    '.jg-cn-item.jg-ok{background:rgba(169,221,185,.3);cursor:default}',
    '.jg-cn-txt{flex:1;min-width:0}',
    '.jg-cn-tag{flex:none;min-width:30px;padding:2px 6px;border-radius:8px;font-size:12px;font-weight:700;text-align:center}',

    /* Crucigrama */
    '.jg-cw-actual{min-height:22px;margin:0 0 8px;font-size:14px;font-weight:600;color:var(--text-secondary,#4A5E57)}',
    '.jg-cw-scroll{overflow-x:auto;margin:0 0 12px;padding:2px}',
    '.jg-cw-grid{display:grid;grid-template-columns:repeat(var(--jg-cols),minmax(0,1fr));gap:2px;margin:0 auto;min-width:calc(var(--jg-cols)*28px);max-width:calc(var(--jg-cols)*42px)}',
    '.jg-cw-cell{position:relative;aspect-ratio:1;min-width:0}',
    '.jg-cw-num{position:absolute;top:1px;left:3px;font-size:10px;font-weight:700;line-height:1;color:var(--jg-ac);pointer-events:none}',
    '.jg-cw-in{width:100%;height:100%;padding:0;text-align:center;text-transform:uppercase;background:var(--bg-card,#fff);color:var(--text-primary,#10231E);border:1.5px solid var(--border-card,#D9E2DD);border-radius:6px;font-size:clamp(15px,4vw,20px);font-weight:700;caret-color:#1AA888}',
    '.jg-cw-cell.jg-act .jg-cw-in{background:var(--jg-sel);border-color:#1AA888}',
    '.jg-cw-in.jg-ok{background:#A9DDB9;border-color:#A9DDB9;color:#0C3A2F}',
    '.jg-cw-in.jg-mal{border:2px dashed var(--jg-err);color:var(--jg-err)}',
    '.jg-cw-pistas{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}',
    '@media (max-width:480px){.jg-cw-pistas{grid-template-columns:1fr}}',
    '.jg-cw-pistas h4{margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary,#4A5E57)}',
    '.jg-cw-pistas ul{list-style:none;margin:0;padding:0;font-size:14px;color:var(--text-secondary,#4A5E57)}',
    '.jg-cw-pistas li{margin:0 0 6px;overflow-wrap:anywhere}',
    '.jg-cw-pistas b{color:var(--text-primary,#10231E)}',

    '@media (prefers-reduced-motion: reduce){.jg-root *,.jg-root *::before,.jg-root *::after{transition:none!important;animation:none!important}}'
  ].join('\n');

  function inyectarCss() {
    if (document.getElementById('juegos-clase-css')) return;
    var s = document.createElement('style');
    s.id = 'juegos-clase-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* =======================================================================
     4. ACTIVIDADES CALIFICABLES
     ======================================================================= */
  function tipoDe(item) {
    if (!item) return '';
    var t = item.tipo;
    if (t === 'opcion' || t === 'vf' || t === 'detecta' || t === 'orden' || t === 'calcula') return t;
    return Array.isArray(item.opciones) ? 'opcion' : '';
  }

  function valorVacio(item) {
    var t = tipoDe(item);
    if (t === 'orden') return [];
    if (t === 'calcula') return null;
    return -1;
  }

  function respondido(item, valor) {
    var t = tipoDe(item);
    if (t === 'opcion' || t === 'vf') {
      var n = Array.isArray(item.opciones) ? item.opciones.length : Infinity;
      return Number.isInteger(valor) && valor >= 0 && valor < n;
    }
    if (t === 'detecta') {
      var m = Array.isArray(item.marcas) ? item.marcas.length : Infinity;
      return Number.isInteger(valor) && valor >= 0 && valor < m;
    }
    if (t === 'orden') {
      return Array.isArray(item.pasos) && Array.isArray(valor) && valor.length === item.pasos.length;
    }
    if (t === 'calcula') return typeof valor === 'number' && isFinite(valor);
    return false;
  }

  // Contexto (situacion/datos), pregunta y pistas comunes.
  function cabecera(raiz, item, etiquetaCtx, idPregunta) {
    if (item.contexto) {
      raiz.appendChild(h('div', { class: 'jg-ctx' },
        h('span', { class: 'jg-ctx-t', text: etiquetaCtx }),
        String(item.contexto)));
    }
    raiz.appendChild(h('p', { class: 'jg-q', id: idPregunta, text: String(item.pregunta == null ? '' : item.pregunta) }));
    if (Array.isArray(item.pistas) && item.pistas.length) {
      var ol = h('ol');
      item.pistas.forEach(function (p) { ol.appendChild(h('li', { text: String(p) })); });
      raiz.appendChild(h('div', { class: 'jg-pistas' }, h('strong', { text: 'Pistas' }), ol));
    }
  }

  function itemOpcion(item, valor, cb, raiz) {
    var actual = Number.isInteger(valor) ? valor : -1;
    cabecera(raiz, item, 'Situación', 'jg-q-' + (++uid));
    var grupo = h('div', { class: 'jg-opts', role: 'group', 'aria-label': 'Opciones de respuesta' });
    var botones = [];
    (item.opciones || []).forEach(function (o, i) {
      var texto = (o && typeof o === 'object') ? o.texto : o;
      var b = h('button', { type: 'button', class: 'jg-opt', 'aria-pressed': i === actual ? 'true' : 'false' },
        h('span', { class: 'jg-opt-l', 'aria-hidden': 'true', text: LETRAS.charAt(i) || String(i + 1) }),
        h('span', { class: 'jg-opt-t', text: String(texto == null ? '' : texto) }));
      b.addEventListener('click', function () {
        actual = i;
        botones.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
        cb(i);
      });
      botones.push(b);
      grupo.appendChild(b);
    });
    raiz.appendChild(grupo);
  }

  function itemDetecta(item, valor, cb, raiz) {
    var actual = Number.isInteger(valor) ? valor : -1;
    var marcas = Array.isArray(item.marcas) ? item.marcas : [];
    cabecera(raiz, item, 'Situación', 'jg-q-' + (++uid));
    var botonesMarca = [], chips = [];
    var estado = h('p', { class: 'jg-nota', role: 'status', 'aria-live': 'polite' });
    var caja = h('div', { class: 'jg-img-box' });

    function refrescar() {
      botonesMarca.forEach(function (b, j) { b.setAttribute('aria-pressed', j === actual ? 'true' : 'false'); });
      chips.forEach(function (b, j) { b.setAttribute('aria-pressed', j === actual ? 'true' : 'false'); });
      estado.textContent = actual >= 0 ? 'Punto elegido: ' + (actual + 1) + '.' : 'Toca el punto donde está el error.';
    }
    function elegir(i) { actual = i; refrescar(); cb(i); }

    function listaPuntos() {
      var g = h('div', { class: 'jg-puntos', role: 'group', 'aria-label': 'Puntos de la imagen' });
      marcas.forEach(function (m, i) {
        var b = h('button', { type: 'button', class: 'jg-chip', 'aria-pressed': 'false', text: 'Punto ' + (i + 1) });
        b.addEventListener('click', function () { elegir(i); });
        chips.push(b);
        g.appendChild(b);
      });
      return g;
    }
    function fallo() {
      caja.textContent = '';
      botonesMarca = [];
      caja.appendChild(aviso('No se pudo cargar la imagen.'));
      caja.appendChild(listaPuntos());
      refrescar();
    }

    raiz.appendChild(caja);
    raiz.appendChild(estado);

    var url = urlSegura(item.imagen);
    if (!url) { fallo(); return; }

    var wrap = h('div', { class: 'jg-img-wrap' });
    var img = h('img', { class: 'jg-img', src: url, alt: String(item.pregunta || 'Imagen de la pregunta') });
    var listo = false;
    function alCargar() {
      if (listo) return;
      listo = true;
      marcas.forEach(function (m, i) {
        var x = clamp(Number(m && m.x) || 0, 0, 100), y = clamp(Number(m && m.y) || 0, 0, 100);
        var b = h('button', { type: 'button', class: 'jg-marca', 'aria-label': 'Punto ' + (i + 1), 'aria-pressed': 'false', text: String(i + 1) });
        b.style.left = x + '%';
        b.style.top = y + '%';
        b.addEventListener('click', function () { elegir(i); });
        botonesMarca.push(b);
        wrap.appendChild(b);
      });
      refrescar();
    }
    img.addEventListener('load', alCargar);
    img.addEventListener('error', function () { if (!listo) { listo = true; fallo(); } });
    wrap.appendChild(img);
    caja.appendChild(wrap);
    refrescar();
    if (img.complete && img.naturalWidth > 0) alCargar();
  }

  function itemOrden(item, valor, cb, raiz) {
    var pasos = (item.pasos || []).map(function (p) { return String(p); });
    var n = pasos.length;
    var orden = [];
    if (Array.isArray(valor)) {
      valor.forEach(function (i) {
        if (Number.isInteger(i) && i >= 0 && i < n && orden.indexOf(i) < 0) orden.push(i);
      });
    }
    var foco = null; // lista de claves candidatas para devolver el foco tras repintar

    cabecera(raiz, item, 'Situación', 'jg-q-' + (++uid));
    raiz.appendChild(h('p', { class: 'jg-sub', text: 'Pasos disponibles' }));
    var disp = h('div', { class: 'jg-opts', role: 'group', 'aria-label': 'Pasos disponibles' });
    raiz.appendChild(disp);
    raiz.appendChild(h('p', { class: 'jg-sub', text: 'Tu orden' }));
    var vacio = h('p', { class: 'jg-vacio', text: 'Toca los pasos en el orden en que se hacen.' });
    var col = h('ol', { class: 'jg-orden-lista', 'aria-label': 'Tu orden' });
    raiz.appendChild(vacio);
    raiz.appendChild(col);
    var info = h('p', { class: 'jg-nota', role: 'status', 'aria-live': 'polite' });
    var reiniciar = h('button', { type: 'button', class: 'jg-btn jg-btn-sec', 'data-foco': 'r', text: 'Reiniciar orden' });
    raiz.appendChild(h('div', { class: 'jg-fila', style: 'margin-top:12px' }, reiniciar));
    raiz.appendChild(info);

    function emitir() { cb(orden.slice()); }

    function pintar() {
      disp.textContent = '';
      col.textContent = '';
      var usados = {};
      orden.forEach(function (i) { usados[i] = true; });
      var k = 0;
      pasos.forEach(function (txt, i) {
        if (usados[i]) return;
        var pos = k++;
        var b = h('button', { type: 'button', class: 'jg-opt', 'aria-pressed': 'false', 'data-foco': 'd' + pos },
          h('span', { class: 'jg-opt-t', text: txt }));
        b.addEventListener('click', function () {
          orden.push(i);
          foco = ['d' + pos, 'd' + (pos - 1), 'r'];
          pintar(); emitir();
        });
        disp.appendChild(b);
      });
      if (!k) disp.appendChild(h('p', { class: 'jg-nota', text: 'Ya colocaste todos los pasos.' }));

      orden.forEach(function (i, pos) {
        var devolver = h('button', {
          type: 'button', class: 'jg-opt', 'data-foco': 'q' + pos,
          'aria-label': 'Paso ' + (pos + 1) + ': ' + pasos[i] + '. Tocar para devolver a los disponibles'
        }, h('span', { class: 'jg-opt-t', text: pasos[i] }));
        devolver.addEventListener('click', function () {
          orden.splice(pos, 1);
          foco = ['q' + pos, 'q' + (pos - 1), 'd0', 'r'];
          pintar(); emitir();
        });
        var sube = h('button', { type: 'button', class: 'jg-mini', 'data-foco': 'u' + pos, 'aria-label': 'Subir paso ' + (pos + 1), text: '▲' });
        var baja = h('button', { type: 'button', class: 'jg-mini', 'data-foco': 'b' + pos, 'aria-label': 'Bajar paso ' + (pos + 1), text: '▼' });
        if (pos === 0) sube.setAttribute('disabled', '');
        if (pos === orden.length - 1) baja.setAttribute('disabled', '');
        sube.addEventListener('click', function () {
          var t = orden[pos]; orden[pos] = orden[pos - 1]; orden[pos - 1] = t;
          foco = ['u' + (pos - 1), 'b' + (pos - 1), 'r'];
          pintar(); emitir();
        });
        baja.addEventListener('click', function () {
          var t = orden[pos]; orden[pos] = orden[pos + 1]; orden[pos + 1] = t;
          foco = ['b' + (pos + 1), 'u' + (pos + 1), 'r'];
          pintar(); emitir();
        });
        col.appendChild(h('li', { class: 'jg-orden-item' },
          h('span', { class: 'jg-orden-n', 'aria-hidden': 'true', text: String(pos + 1) }),
          devolver, sube, baja));
      });

      vacio.style.display = orden.length ? 'none' : '';
      col.style.display = orden.length ? '' : 'none';
      reiniciar.disabled = !orden.length;
      info.textContent = orden.length + ' de ' + n + ' pasos colocados.';

      if (foco) {
        var candidatos = foco; foco = null;
        for (var c = 0; c < candidatos.length; c++) {
          var el = raiz.querySelector('[data-foco="' + candidatos[c] + '"]');
          if (el && !el.disabled) { enfocar(el); break; }
        }
      }
    }
    reiniciar.addEventListener('click', function () {
      orden = [];
      foco = ['d0'];
      pintar(); emitir();
    });
    pintar();
  }

  function itemCalcula(item, valor, cb, raiz) {
    var idP = 'jg-q-' + (++uid), idE = 'jg-e-' + uid;
    cabecera(raiz, item, 'Datos', idP);
    var input = h('input', {
      type: 'text', inputmode: 'decimal', class: 'jg-input', autocomplete: 'off', spellcheck: 'false',
      'aria-labelledby': idP, 'aria-describedby': idE, placeholder: '0'
    });
    if (typeof valor === 'number' && isFinite(valor)) input.value = String(valor);
    var error = h('p', { class: 'jg-error', id: idE, role: 'status' });
    error.style.display = 'none';
    var fila = h('div', { class: 'jg-calc' }, input);
    if (item.unidad) fila.appendChild(h('span', { class: 'jg-unidad', text: String(item.unidad) }));
    raiz.appendChild(fila);
    raiz.appendChild(error);
    raiz.appendChild(h('p', { class: 'jg-nota', text: 'Puedes usar coma o punto como separador decimal.' }));
    input.addEventListener('input', function () {
      var txt = input.value;
      var num = parsearNumero(txt);
      var malo = txt.trim() !== '' && num === null;
      input.setAttribute('aria-invalid', malo ? 'true' : 'false');
      error.textContent = malo ? 'Escribe solo un número.' : '';
      error.style.display = malo ? '' : 'none';
      cb(num);
    });
  }

  function pintarItem(item, valor, onCambio) {
    inyectarCss();
    var raiz = h('div', { class: 'jg-root jg-item' });
    var cb = typeof onCambio === 'function' ? onCambio : function () {};
    var t = tipoDe(item);
    if (t === 'opcion' || t === 'vf') itemOpcion(item, valor, cb, raiz);
    else if (t === 'detecta') itemDetecta(item, valor, cb, raiz);
    else if (t === 'orden') itemOrden(item, valor, cb, raiz);
    else if (t === 'calcula') itemCalcula(item, valor, cb, raiz);
    else raiz.appendChild(aviso('Este tipo de pregunta no es compatible con esta versión.'));
    return raiz;
  }

  function pintarExplicacion(texto) {
    var t = texto == null ? '' : String(texto).trim();
    if (!t) return null;
    inyectarCss();
    return h('div', { class: 'jg-root jg-why' }, h('strong', { text: 'Por qué' }), h('p', { text: t }));
  }

  /* =======================================================================
     5. JUEGOS DE PRACTICA
     Cada juego: function (datos, raiz, api). api = { limpieza(fn), fin(resultado, dato) }
     ======================================================================= */
  var JUEGOS = {};

  /* ----- Rompecabezas --------------------------------------------------- */
  JUEGOS.rompecabezas = function (d, raiz, api) {
    var filas = clamp(parseInt(d.filas, 10) || 2, 2, 4);
    var cols = clamp(parseInt(d.columnas, 10) || 3, 2, 4);
    var url = urlSegura(d.imagen);
    if (!url) { raiz.appendChild(aviso('No se pudo cargar la imagen del rompecabezas.')); return; }

    var carga = h('p', { class: 'jg-msg', role: 'status', text: 'Cargando imagen…' });
    raiz.appendChild(carga);
    var im = new Image();
    var muerto = false;
    api.limpieza(function () { muerto = true; im.onload = im.onerror = null; });
    im.onload = function () {
      if (muerto) return;
      raiz.removeChild(carga);
      armar(im.naturalWidth || 1, im.naturalHeight || 1);
    };
    im.onerror = function () {
      if (muerto) return;
      raiz.replaceChild(aviso('No se pudo cargar la imagen del rompecabezas.'), carga);
    };
    im.src = url;

    function armar(ancho, alto) {
      var n = filas * cols;
      var orden = permutacion(n);   // orden[ranura] = pieza que hay en esa ranura
      var movs = 0, sel = -1, terminado = false;

      var ref = h('div', { class: 'jg-rc-ref' },
        h('img', { src: url, alt: 'Imagen de referencia del rompecabezas' }),
        h('span', { text: 'Imagen de referencia' }));
      var contador = h('strong', { text: '0' });
      var barra = h('div', { class: 'jg-barra' },
        h('span', null, 'Movimientos: ', contador),
        h('span', { text: 'Toca dos piezas para intercambiarlas.' }));
      var tab = h('div', { class: 'jg-rc-tab', role: 'group', 'aria-label': 'Rompecabezas' });
      tab.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
      tab.style.gridTemplateRows = 'repeat(' + filas + ',1fr)';
      tab.style.aspectRatio = ancho + ' / ' + alto;

      var piezas = [];
      for (var i = 0; i < n; i++) {
        (function (ranura) {
          var b = h('button', { type: 'button', class: 'jg-rc-pieza', 'aria-pressed': 'false' });
          b.style.backgroundImage = cssUrl(url);
          b.style.backgroundSize = (cols * 100) + '% ' + (filas * 100) + '%';
          b.addEventListener('click', function () { tocar(ranura); });
          piezas.push(b);
          tab.appendChild(b);
        })(i);
      }

      function pintar() {
        piezas.forEach(function (b, ranura) {
          var id = orden[ranura], r = Math.floor(id / cols), c = id % cols;
          var x = cols > 1 ? c * 100 / (cols - 1) : 0, y = filas > 1 ? r * 100 / (filas - 1) : 0;
          b.style.backgroundPosition = x + '% ' + y + '%';
          b.setAttribute('aria-pressed', ranura === sel ? 'true' : 'false');
          b.setAttribute('aria-label', 'Fila ' + (Math.floor(ranura / cols) + 1) + ', columna ' + (ranura % cols + 1) +
            ', pieza ' + (id + 1) + (ranura === sel ? ', seleccionada' : ''));
          if (terminado) b.setAttribute('disabled', '');
        });
        contador.textContent = String(movs);
      }
      function resuelto() {
        for (var k = 0; k < n; k++) if (orden[k] !== k) return false;
        return true;
      }
      function tocar(i) {
        if (terminado) return;
        if (sel < 0) sel = i;
        else if (sel === i) sel = -1;
        else {
          var t = orden[sel]; orden[sel] = orden[i]; orden[i] = t;
          movs++; sel = -1;
        }
        if (resuelto()) terminado = true;
        pintar();
        if (terminado) api.fin({ ok: true, intentos: movs }, 'Lo resolviste en ' + movs + (movs === 1 ? ' movimiento.' : ' movimientos.'));
      }

      raiz.appendChild(ref);
      raiz.appendChild(barra);
      raiz.appendChild(tab);
      pintar();
    }
  };

  /* ----- Sopa de conceptos ---------------------------------------------- */
  JUEGOS.sopa = function (d, raiz, api) {
    var data = generarSopa(d.palabras, 10);
    if (!data.colocadas.length) { raiz.appendChild(aviso('Este juego no tiene palabras disponibles.')); return; }
    var n = data.tam, g = data.cuadricula;
    var pend = {}, faltan = data.colocadas.length, total = faltan, intentos = 0, terminado = false;
    data.colocadas.forEach(function (c) { pend[c.palabra] = c; });

    var msg = h('p', { class: 'jg-msg', role: 'status', 'aria-live': 'polite', text: 'Toca la primera y la última letra de una palabra, o arrastra sobre ella.' });
    var grid = h('div', { class: 'jg-sp-grid', role: 'group', 'aria-label': 'Sopa de letras' });
    grid.style.gridTemplateColumns = 'repeat(' + n + ',1fr)';
    var celdas = [];
    var f, c;
    for (f = 0; f < n; f++) {
      celdas.push([]);
      for (c = 0; c < n; c++) {
        (function (ff, cc) {
          var b = h('button', {
            type: 'button', class: 'jg-sp-c', 'aria-pressed': 'false',
            'aria-label': 'fila ' + (ff + 1) + ' columna ' + (cc + 1) + ' letra ' + g[ff][cc],
            'data-f': ff, 'data-c': cc, text: g[ff][cc]
          });
          b.addEventListener('click', function () { clic(ff, cc); });
          celdas[ff].push(b);
          grid.appendChild(b);
        })(f, c);
      }
    }

    var items = {};
    var lista = h('ul', { class: 'jg-sp-pal', 'aria-label': 'Palabras por encontrar' });
    data.colocadas.forEach(function (p) {
      var li = h('li', { text: p.original.toUpperCase() });
      items[p.palabra] = li;
      lista.appendChild(li);
    });

    raiz.appendChild(msg);
    raiz.appendChild(grid);
    raiz.appendChild(h('p', { class: 'jg-sub', text: 'Palabras por encontrar' }));
    raiz.appendChild(lista);

    var seleccion = [], inicio = null, arr = null;

    function limpiarSel() {
      seleccion.forEach(function (p) {
        var b = celdas[p[0]][p[1]];
        b.classList.remove('jg-sel');
        b.setAttribute('aria-pressed', 'false');
      });
      seleccion = [];
    }
    function pintarSel(lin) {
      limpiarSel();
      lin.forEach(function (p) {
        var b = celdas[p[0]][p[1]];
        b.classList.add('jg-sel');
        b.setAttribute('aria-pressed', 'true');
      });
      seleccion = lin.slice();
    }
    function linea(f1, c1, f2, c2) {
      var df = f2 - f1, dc = c2 - c1;
      if (!(df === 0 || dc === 0 || Math.abs(df) === Math.abs(dc))) return null;
      var pasos = Math.max(Math.abs(df), Math.abs(dc)), sf = Math.sign(df), sc = Math.sign(dc), lin = [];
      for (var k = 0; k <= pasos; k++) lin.push([f1 + sf * k, c1 + sc * k]);
      return lin;
    }
    function evaluar(lin) {
      if (lin.length < 2) return;
      var s = lin.map(function (p) { return g[p[0]][p[1]]; }).join('');
      var r = s.split('').reverse().join('');
      var hit = pend[s] ? s : (pend[r] ? r : null);
      intentos++;
      if (!hit) { msg.textContent = 'Esa no es una de las palabras. Sigue buscando.'; return; }
      var info = pend[hit];
      delete pend[hit];
      lin.forEach(function (p) {
        var b = celdas[p[0]][p[1]];
        b.classList.add('jg-hallada');
        b.setAttribute('aria-label', b.getAttribute('aria-label').replace(/, parte de una palabra encontrada$/, '') + ', parte de una palabra encontrada');
      });
      var li = items[hit];
      li.classList.add('jg-ok');
      li.appendChild(h('span', { class: 'jg-sr', text: ' (encontrada)' }));
      faltan--;
      msg.textContent = 'Encontraste «' + info.original + '». ' + (faltan ? 'Faltan ' + faltan + '.' : '');
      if (!faltan) {
        terminado = true;
        api.fin({ ok: true, intentos: intentos }, 'Encontraste las ' + total + ' palabras en ' + intentos + (intentos === 1 ? ' intento.' : ' intentos.'));
      }
    }
    function clic(ff, cc) {
      if (terminado) return;
      if (!inicio) {
        inicio = { f: ff, c: cc };
        pintarSel([[ff, cc]]);
        msg.textContent = 'Ahora toca la última letra de la palabra.';
        return;
      }
      if (inicio.f === ff && inicio.c === cc) { inicio = null; limpiarSel(); msg.textContent = ''; return; }
      var lin = linea(inicio.f, inicio.c, ff, cc);
      if (!lin) { inicio = { f: ff, c: cc }; pintarSel([[ff, cc]]); return; }
      inicio = null;
      limpiarSel();
      evaluar(lin);
    }

    // Arrastre con raton / lapiz (en tactil se usa toque-toque para no bloquear el scroll).
    function celdaDe(el) {
      while (el && el !== grid) {
        if (el.getAttribute && el.getAttribute('data-f') !== null) return el;
        el = el.parentNode;
      }
      return null;
    }
    grid.addEventListener('pointerdown', function (ev) {
      if (terminado || ev.pointerType === 'touch' || ev.button > 0) return;
      var b = celdaDe(ev.target);
      if (!b) return;
      arr = { f: +b.getAttribute('data-f'), c: +b.getAttribute('data-c'), movido: false, lin: null };
    });
    function mover(ev) {
      if (!arr) return;
      var b = celdaDe(document.elementFromPoint(ev.clientX, ev.clientY));
      if (!b) return;
      var ff = +b.getAttribute('data-f'), cc = +b.getAttribute('data-c');
      if (ff === arr.f && cc === arr.c) {
        if (arr.movido) { arr.lin = null; pintarSel([[arr.f, arr.c]]); }
        return;
      }
      arr.movido = true;
      arr.lin = linea(arr.f, arr.c, ff, cc);
      pintarSel(arr.lin || [[arr.f, arr.c]]);
    }
    function soltar() {
      if (!arr) return;
      var a = arr; arr = null;
      if (a.movido) {
        limpiarSel();
        inicio = null;
        if (a.lin) evaluar(a.lin);
      }
    }
    document.addEventListener('pointermove', mover);
    document.addEventListener('pointerup', soltar);
    document.addEventListener('pointercancel', soltar);
    api.limpieza(function () {
      document.removeEventListener('pointermove', mover);
      document.removeEventListener('pointerup', soltar);
      document.removeEventListener('pointercancel', soltar);
    });
  };

  /* ----- Memoria del campo ---------------------------------------------- */
  JUEGOS.memoria = function (d, raiz, api) {
    var parejas = (Array.isArray(d.parejas) ? d.parejas : []).filter(function (p) {
      return p && p.a != null && p.b != null && String(p.a).trim() && String(p.b).trim();
    }).slice(0, 8);
    if (parejas.length < 2) { raiz.appendChild(aviso('Este juego no tiene suficientes parejas.')); return; }

    var cartas = [];
    parejas.forEach(function (p, i) {
      cartas.push({ pid: i, txt: String(p.a).trim(), estado: 'abajo' });
      cartas.push({ pid: i, txt: String(p.b).trim(), estado: 'abajo' });
    });
    cartas = barajar(cartas);

    var abiertas = [], bloqueo = false, intentos = 0, halladas = 0, temporizador = null;
    api.limpieza(function () { if (temporizador) clearTimeout(temporizador); });

    var contador = h('strong', { text: '0' });
    var barra = h('div', { class: 'jg-barra' },
      h('span', null, 'Intentos: ', contador),
      h('span', { text: 'Encuentra las ' + parejas.length + ' parejas.' }));
    var grid = h('div', { class: 'jg-mm-grid', role: 'group', 'aria-label': 'Tarjetas de memoria' });
    var btns = [];

    function recortar(t) { return t.length > 28 ? t.slice(0, 27) + '…' : t; }
    function esImagen(c) { return /^https?:\/\//i.test(c.txt) && !!urlSegura(c.txt); }
    function contenido(c) {
      if (esImagen(c)) {
        var im = h('img', { src: urlSegura(c.txt), alt: '', draggable: 'false' });
        im.addEventListener('error', function () {
          if (im.parentNode) im.parentNode.replaceChild(h('span', { text: recortar(c.txt) }), im);
        });
        return im;
      }
      return h('span', { text: c.txt });
    }
    function pintar(i) {
      var c = cartas[i], b = btns[i];
      b.textContent = '';
      b.setAttribute('data-e', c.estado);
      if (c.estado === 'abajo') {
        b.appendChild(h('span', { class: 'jg-mm-num', 'aria-hidden': 'true', text: String(i + 1) }));
        b.setAttribute('aria-label', 'Tarjeta ' + (i + 1) + ', boca abajo');
      } else {
        b.appendChild(contenido(c));
        b.setAttribute('aria-label', 'Tarjeta ' + (i + 1) + ': ' + (esImagen(c) ? 'imagen' : c.txt) +
          (c.estado === 'ok' ? ', pareja encontrada' : ''));
      }
    }
    cartas.forEach(function (c, i) {
      var b = h('button', { type: 'button', class: 'jg-mm-c' });
      b.addEventListener('click', function () { voltear(i); });
      btns.push(b);
      grid.appendChild(b);
      pintar(i);
    });

    function voltear(i) {
      var c = cartas[i];
      if (bloqueo || c.estado !== 'abajo') return;
      c.estado = 'abierta';
      abiertas.push(i);
      pintar(i);
      if (abiertas.length < 2) return;
      intentos++;
      contador.textContent = String(intentos);
      var a = abiertas[0], b = abiertas[1];
      abiertas = [];
      if (cartas[a].pid === cartas[b].pid) {
        cartas[a].estado = cartas[b].estado = 'ok';
        pintar(a); pintar(b);
        halladas++;
        if (halladas === parejas.length) {
          api.fin({ ok: true, intentos: intentos }, 'Encontraste todas las parejas en ' + intentos + (intentos === 1 ? ' intento.' : ' intentos.'));
        }
      } else {
        bloqueo = true;
        temporizador = setTimeout(function () {
          temporizador = null;
          cartas[a].estado = cartas[b].estado = 'abajo';
          pintar(a); pintar(b);
          bloqueo = false;
        }, reducido() ? 400 : 900);
      }
    }

    raiz.appendChild(barra);
    raiz.appendChild(grid);
  };

  /* ----- Conecta conceptos ---------------------------------------------- */
  var PALETA = [
    { c: '#1AA888', t: '#04201A' },
    { c: '#087F70', t: '#FFFFFF' },
    { c: '#C9A227', t: '#1D1600' },
    { c: '#5B7C99', t: '#FFFFFF' }
  ];

  JUEGOS.conecta = function (d, raiz, api) {
    var pares = (Array.isArray(d.pares) ? d.pares : []).filter(function (p) {
      return p && p.izq != null && p.der != null && String(p.izq).trim() && String(p.der).trim();
    }).slice(0, 6);
    if (pares.length < 2) { raiz.appendChild(aviso('Este juego no tiene suficientes pares.')); return; }

    var n = pares.length;
    var perm = permutacion(n, { sinFijos: true }); // perm[j] = par que se muestra en la posicion j de la derecha
    var con = {}, color = {}, bloq = {};           // por indice izquierdo
    var sel = null, comprobaciones = 0;

    var msg = h('p', { class: 'jg-msg', role: 'status', 'aria-live': 'polite', text: 'Toca un concepto de la izquierda y luego su pareja de la derecha.' });
    var izq = [], der = [];
    var colI = h('div', { class: 'jg-cn-col', role: 'group', 'aria-label': 'Conceptos' });
    var colD = h('div', { class: 'jg-cn-col', role: 'group', 'aria-label': 'Parejas' });
    pares.forEach(function (p, i) {
      var b = h('button', { type: 'button', class: 'jg-cn-item' });
      b.addEventListener('click', function () { tocar('i', i); });
      izq.push(b); colI.appendChild(b);
    });
    perm.forEach(function (_, j) {
      var b = h('button', { type: 'button', class: 'jg-cn-item' });
      b.addEventListener('click', function () { tocar('d', j); });
      der.push(b); colD.appendChild(b);
    });
    var comprobar = h('button', { type: 'button', class: 'jg-btn', text: 'Comprobar' });
    var quitar = h('button', { type: 'button', class: 'jg-btn jg-btn-sec', text: 'Quitar conexiones' });

    function duenoDe(j) {
      for (var i = 0; i < n; i++) if (con[i] === j) return i;
      return -1;
    }
    function colorLibre() {
      var usados = {};
      Object.keys(color).forEach(function (i) { usados[color[i]] = true; });
      for (var k = 0; k < 20; k++) if (!usados[k]) return k;
      return 0;
    }
    function etiqueta(k) { return LETRAS.charAt(k % 26) + (k + 1); }

    function aplicar(b, texto, k, bloqueado, seleccionado) {
      b.textContent = '';
      b.appendChild(h('span', { class: 'jg-cn-txt', text: texto }));
      var etq = '';
      if (k >= 0) {
        etq = etiqueta(k);
        var col = PALETA[k % PALETA.length];
        var tag = h('span', { class: 'jg-cn-tag', 'aria-hidden': 'true', text: etq });
        tag.style.background = col.c;
        tag.style.color = col.t;
        b.appendChild(tag);
        b.style.borderColor = col.c;
      } else {
        b.style.borderColor = '';
      }
      b.classList.toggle('jg-ok', !!bloqueado);
      b.setAttribute('aria-pressed', seleccionado ? 'true' : 'false');
      b.setAttribute('aria-label', texto + (k >= 0 ? ', conectado con etiqueta ' + etq : '') + (bloqueado ? ', correcto' : ''));
      if (bloqueado) b.setAttribute('disabled', ''); else b.removeAttribute('disabled');
    }
    function pintar() {
      var conectados = 0;
      izq.forEach(function (b, i) {
        var k = con[i] !== undefined ? color[i] : -1;
        if (k >= 0) conectados++;
        aplicar(b, String(pares[i].izq), k, !!bloq[i], !!(sel && sel.lado === 'i' && sel.idx === i));
      });
      der.forEach(function (b, j) {
        var i = duenoDe(j);
        aplicar(b, String(pares[perm[j]].der), i >= 0 ? color[i] : -1, i >= 0 && !!bloq[i],
          !!(sel && sel.lado === 'd' && sel.idx === j));
      });
      comprobar.disabled = conectados < n;
      quitar.disabled = Object.keys(con).every(function (i) { return bloq[i]; });
    }
    function conectar(i, j) {
      if (con[i] !== undefined) { delete con[i]; delete color[i]; }
      var otro = duenoDe(j);
      if (otro >= 0) { delete con[otro]; delete color[otro]; }
      con[i] = j;
      color[i] = colorLibre();
    }
    function tocar(lado, idx) {
      if (lado === 'i' && bloq[idx]) return;
      if (lado === 'd' && duenoDe(idx) >= 0 && bloq[duenoDe(idx)]) return;
      if (sel && sel.lado !== lado) {
        var i = lado === 'i' ? idx : sel.idx, j = lado === 'd' ? idx : sel.idx;
        sel = null;
        conectar(i, j);
        msg.textContent = '';
      } else if (sel && sel.idx === idx) {
        sel = null;
      } else {
        sel = { lado: lado, idx: idx };
      }
      pintar();
    }
    comprobar.addEventListener('click', function () {
      comprobaciones++;
      Object.keys(con).forEach(function (k) {
        var i = +k;
        if (bloq[i]) return;
        if (perm[con[i]] === i) bloq[i] = true;
        else { delete con[i]; delete color[i]; }
      });
      sel = null;
      var bien = Object.keys(bloq).length;
      pintar();
      if (bien === n) {
        msg.textContent = '';
        api.fin({ ok: true, intentos: comprobaciones },
          'Conectaste todos los pares en ' + comprobaciones + (comprobaciones === 1 ? ' comprobación.' : ' comprobaciones.'));
      } else {
        msg.textContent = bien + ' bien, intenta con los demás.';
      }
    });
    quitar.addEventListener('click', function () {
      Object.keys(con).forEach(function (k) { if (!bloq[+k]) { delete con[k]; delete color[k]; } });
      sel = null;
      msg.textContent = '';
      pintar();
    });

    raiz.appendChild(msg);
    raiz.appendChild(h('div', { class: 'jg-cn-cols' }, colI, colD));
    raiz.appendChild(h('div', { class: 'jg-fila' }, comprobar, quitar));
    pintar();
  };

  /* ----- Mini crucigrama agricola --------------------------------------- */
  JUEGOS.crucigrama = function (d, raiz, api) {
    var cw = generarCrucigrama(d.palabras);
    if (!cw.palabras.length) { raiz.appendChild(aviso('Este juego no tiene palabras disponibles.')); return; }
    var F = cw.filas, C = cw.columnas;

    // Mapa de casilla -> palabras que pasan por ella.
    var dirs = {}, numeros = {};
    cw.palabras.forEach(function (w) {
      numeros[w.fila + ',' + w.col] = w.numero;
      for (var i = 0; i < w.palabra.length; i++) {
        var key = (w.fila + (w.horiz ? 0 : i)) + ',' + (w.col + (w.horiz ? i : 0));
        dirs[key] = dirs[key] || {};
        dirs[key][w.horiz ? 'H' : 'V'] = { w: w, i: i };
      }
    });

    var dirActual = 'H', ultimoClic = null, comprobaciones = 0, terminado = false;
    var inputs = [], contenedores = [];
    var actual = h('p', { class: 'jg-cw-actual', 'aria-live': 'polite' });
    var msg = h('p', { class: 'jg-msg', role: 'status', 'aria-live': 'polite' });
    var grid = h('div', { class: 'jg-cw-grid', role: 'group', 'aria-label': 'Crucigrama' });
    grid.style.setProperty('--jg-cols', String(C));

    function posDe(w, i) { return [w.fila + (w.horiz ? 0 : i), w.col + (w.horiz ? i : 0)]; }
    function textoPista(w) { return w.numero + ' ' + (w.horiz ? 'Horizontal' : 'Vertical') + ': ' + w.pista; }

    function resaltar(f, c) {
      contenedores.forEach(function (fila) { fila.forEach(function (e) { if (e) e.classList.remove('jg-act'); }); });
      var dd = dirs[f + ',' + c];
      if (!dd) return;
      var ref = dd[dirActual];
      if (!ref) { dirActual = dd.H ? 'H' : 'V'; ref = dd[dirActual]; }
      for (var i = 0; i < ref.w.palabra.length; i++) {
        var p = posDe(ref.w, i);
        contenedores[p[0]][p[1]].classList.add('jg-act');
      }
      actual.textContent = textoPista(ref.w);
    }
    function irA(f, c) {
      if (f < 0 || c < 0 || f >= F || c >= C || !inputs[f][c]) return false;
      enfocar(inputs[f][c]);
      return true;
    }
    function avanzar(f, c) {
      var ref = (dirs[f + ',' + c] || {})[dirActual];
      if (!ref || ref.i + 1 >= ref.w.palabra.length) return;
      var p = posDe(ref.w, ref.i + 1);
      irA(p[0], p[1]);
    }
    function retroceder(f, c) {
      var ref = (dirs[f + ',' + c] || {})[dirActual];
      if (!ref || ref.i === 0) return;
      var p = posDe(ref.w, ref.i - 1);
      if (irA(p[0], p[1])) { inputs[p[0]][p[1]].value = ''; limpiarMarca(inputs[p[0]][p[1]]); }
    }
    function limpiarMarca(inp) {
      inp.classList.remove('jg-ok', 'jg-mal');
      inp.removeAttribute('aria-invalid');
    }
    function moverFlecha(f, c, df, dc) {
      var ff = f + df, cc = c + dc;
      while (ff >= 0 && cc >= 0 && ff < F && cc < C) {
        if (inputs[ff][cc]) { enfocar(inputs[ff][cc]); return; }
        ff += df; cc += dc;
      }
    }

    for (var f = 0; f < F; f++) {
      inputs.push([]); contenedores.push([]);
      for (var c = 0; c < C; c++) {
        var letra = cw.celdas[f][c];
        if (letra === null) {
          inputs[f].push(null); contenedores[f].push(null);
          grid.appendChild(h('div', { class: 'jg-cw-cell', 'aria-hidden': 'true' }));
          continue;
        }
        (function (ff, cc) {
          var dd = dirs[ff + ',' + cc];
          var partes = [];
          if (dd.H) partes.push(dd.H.w.numero + ' horizontal');
          if (dd.V) partes.push(dd.V.w.numero + ' vertical');
          var inp = h('input', {
            type: 'text', class: 'jg-cw-in', maxlength: '1', autocomplete: 'off', autocapitalize: 'characters',
            spellcheck: 'false', 'aria-label': 'Fila ' + (ff + 1) + ' columna ' + (cc + 1) + ', ' + partes.join(' y ')
          });
          var cont = h('div', { class: 'jg-cw-cell' }, inp);
          var num = numeros[ff + ',' + cc];
          if (num) cont.appendChild(h('span', { class: 'jg-cw-num', 'aria-hidden': 'true', text: String(num) }));

          inp.addEventListener('focus', function () {
            if (!dd[dirActual]) dirActual = dd.H ? 'H' : 'V';
            resaltar(ff, cc);
            try { inp.select(); } catch (e) { /* sin seleccion */ }
          });
          inp.addEventListener('click', function () {
            var k = ff + ',' + cc;
            if (ultimoClic === k && dd.H && dd.V) { dirActual = dirActual === 'H' ? 'V' : 'H'; resaltar(ff, cc); }
            ultimoClic = k;
          });
          inp.addEventListener('input', function () {
            var v = normalizar(inp.value);
            inp.value = v.slice(-1);
            limpiarMarca(inp);
            if (inp.value) avanzar(ff, cc);
          });
          inp.addEventListener('keydown', function (ev) {
            var k = ev.key;
            if (k === 'ArrowLeft' || k === 'ArrowRight') { ev.preventDefault(); dirActual = 'H'; moverFlecha(ff, cc, 0, k === 'ArrowLeft' ? -1 : 1); }
            else if (k === 'ArrowUp' || k === 'ArrowDown') { ev.preventDefault(); dirActual = 'V'; moverFlecha(ff, cc, k === 'ArrowUp' ? -1 : 1, 0); }
            else if (k === 'Backspace' && inp.value === '') { ev.preventDefault(); retroceder(ff, cc); }
          });
          inputs[ff].push(inp);
          contenedores[ff].push(cont);
          grid.appendChild(cont);
        })(f, c);
      }
    }

    var comprobar = h('button', { type: 'button', class: 'jg-btn', text: 'Comprobar' });
    comprobar.addEventListener('click', function () {
      if (terminado) return;
      comprobaciones++;
      var ok = 0, total = 0, vacias = 0;
      for (var f2 = 0; f2 < F; f2++) for (var c2 = 0; c2 < C; c2++) {
        var inp = inputs[f2][c2];
        if (!inp) continue;
        total++;
        var v = normalizar(inp.value);
        limpiarMarca(inp);
        if (!v) { vacias++; continue; }
        if (v === cw.celdas[f2][c2]) { ok++; inp.classList.add('jg-ok'); }
        else { inp.classList.add('jg-mal'); inp.setAttribute('aria-invalid', 'true'); }
      }
      if (ok === total) {
        terminado = true;
        inputs.forEach(function (fila) { fila.forEach(function (i) { if (i) i.readOnly = true; }); });
        comprobar.setAttribute('disabled', '');
        msg.textContent = '';
        api.fin({ ok: true, intentos: comprobaciones },
          'Completaste el crucigrama con ' + comprobaciones + (comprobaciones === 1 ? ' comprobación.' : ' comprobaciones.'));
      } else {
        msg.textContent = ok + ' de ' + total + ' casillas correctas' +
          (vacias ? '; faltan ' + vacias + ' por llenar' : '') + '. Las incorrectas tienen borde punteado.';
      }
    });

    function listaPistas(horiz) {
      var ul = h('ul');
      cw.palabras.filter(function (w) { return w.horiz === horiz; }).forEach(function (w) {
        ul.appendChild(h('li', null, h('b', { text: w.numero + '. ' }), w.pista + ' (' + w.palabra.length + ' letras)'));
      });
      return ul;
    }
    var hor = cw.palabras.some(function (w) { return w.horiz; });
    var ver = cw.palabras.some(function (w) { return !w.horiz; });
    var pistas = h('div', { class: 'jg-cw-pistas' });
    if (hor) pistas.appendChild(h('div', null, h('h4', { text: 'Horizontales' }), listaPistas(true)));
    if (ver) pistas.appendChild(h('div', null, h('h4', { text: 'Verticales' }), listaPistas(false)));

    raiz.appendChild(actual);
    raiz.appendChild(h('div', { class: 'jg-cw-scroll' }, grid));
    raiz.appendChild(h('div', { class: 'jg-fila' }, comprobar));
    raiz.appendChild(msg);
    raiz.appendChild(pistas);
  };

  /* ----- Montaje comun de los juegos de practica ------------------------ */
  function practica(tipo, datos, contenedor, opciones) {
    inyectarCss();
    var opc = opciones || {};
    var raiz = h('div', { class: 'jg-root jg-juego' });
    var limpiezas = [], notificado = false, destruido = false;

    function limpiar() {
      var l = limpiezas; limpiezas = [];
      l.forEach(function (fn) { try { fn(); } catch (e) { /* ignorar */ } });
    }
    var api = {
      limpieza: function (fn) { limpiezas.push(fn); },
      fin: function (resultado, dato) {
        if (destruido || raiz.querySelector('.jg-exito')) return;
        var otra = h('button', { type: 'button', class: 'jg-btn', text: 'Jugar de nuevo' });
        otra.addEventListener('click', montar);
        var bloque = h('div', { class: 'jg-exito', role: 'status', tabindex: '-1' },
          h('p', { class: 'jg-exito-t', text: '¡Completado!' }),
          h('p', { class: 'jg-exito-d', text: dato || '' }),
          h('div', { class: 'jg-fila' }, otra));
        raiz.appendChild(bloque);
        enfocar(bloque);
        if (!notificado) {
          notificado = true;
          try { if (typeof opc.onFin === 'function') opc.onFin(resultado || { ok: true }); } catch (e) { /* ignorar */ }
        }
      }
    };

    function montar() {
      limpiar();
      raiz.textContent = '';
      var juego = JUEGOS[tipo];
      if (!juego) { raiz.appendChild(aviso('Este juego no está disponible.')); return; }
      try { juego(datos || {}, raiz, api); }
      catch (e) { raiz.textContent = ''; raiz.appendChild(aviso('No se pudo iniciar el juego.')); }
    }

    if (contenedor) {
      contenedor.textContent = '';
      contenedor.appendChild(raiz);
    }
    montar();

    return {
      destruir: function () {
        destruido = true;
        limpiar();
        if (raiz.parentNode) raiz.parentNode.removeChild(raiz);
      }
    };
  }

  /* =======================================================================
     6. API PUBLICA
     ======================================================================= */
  window.SinergiaJuegos = {
    TIPOS_CALIFICABLES: {
      detecta: 'Detecta el error',
      decision: 'Toma la decisión',
      orden: 'Ordena el procedimiento',
      diagnostico: 'Diagnóstico agrícola',
      calcula: 'Calcula y produce'
    },
    TIPOS_PRACTICA: {
      rompecabezas: 'Rompecabezas agrícola',
      sopa: 'Sopa de conceptos',
      memoria: 'Memoria del campo',
      conecta: 'Conecta conceptos',
      crucigrama: 'Mini crucigrama agrícola'
    },
    valorVacio: valorVacio,
    respondido: respondido,
    pintarItem: pintarItem,
    pintarExplicacion: pintarExplicacion,
    practica: practica
  };
})();
