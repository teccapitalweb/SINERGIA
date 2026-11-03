/* Avatares de campo de Sinergia: dibujos vectoriales que cada persona arma a su gusto.
   window.SIN_AVATARES = {
     svg(codigo, tam)        -> texto SVG (acepta un código "v1.…" o el id de un personaje)
     valido(codigo)          -> true si es un código que este archivo sabe dibujar
     personajes              -> [{ id, nombre, codigo }]
     abrirEditor({ codigo, guardar(codigo) -> Promise, alQuitar() -> Promise (opcional), alCerrar })
   }
   El código es corto ("v1.2.0.0.1.…"): cada número es la posición de la opción elegida. El servidor solo revisa su formato. */
(function () {
  'use strict';

  var C = {
    tinta: '#183A33', bosque: '#113D35', hoja: '#1F5B4D', menta: '#1AA888',
    paja: '#E8B84A', crema: '#F6EFDC', blanco: '#FBFAF6',
    tierra: '#8A5A3C', terracota: '#C8553D', cielo: '#4F9DA6'
  };

  /* ---------- Opciones (el orden fija el código: no reordenar, solo agregar al final) ---------- */
  var OP = {
    piel: [
      ['Muy clara', '#F6D3B5'], ['Clara', '#EDBB96'], ['Media', '#D9A07A'],
      ['Morena', '#C48A62'], ['Morena oscura', '#A8704B'], ['Oscura', '#7E4F33']
    ],
    peloEstilo: [['Corto', 'corto'], ['Trenza', 'trenza'], ['Largo', 'largo'], ['Chongo', 'chongo'], ['Cola', 'cola'], ['Rizado', 'rizado'], ['Sin cabello', 'ninguno']],
    peloColor: [['Negro', '#1F1A17'], ['Castaño oscuro', '#4A3022'], ['Castaño', '#7A4B2A'], ['Cobrizo', '#B8742F'], ['Canoso', '#C9C9C4'], ['Rojizo', '#8E3B2B']],
    sombrero: [['Ninguno', 'ninguno'], ['Sombrero de palma', 'palma'], ['Sombrero vaquero', 'vaquero'], ['Gorra', 'gorra'], ['Gorra hacia atrás', 'gorraAtras'], ['Pañuelo', 'panuelo'], ['Velo de apicultor', 'velo']],
    sombreroColor: [['Paja', '#E8B84A'], ['Café', '#8A5A3C'], ['Verde', '#1F5B4D'], ['Terracota', '#C8553D'], ['Azul', '#4F9DA6'], ['Crema', '#F2E3B8']],
    ropa: [['Blusa con delantal', 'blusa'], ['Overol', 'overol'], ['Camisa', 'camisa'], ['Chaleco', 'chaleco'], ['Sudadera', 'sudadera'], ['Rebozo', 'rebozo'], ['Overol de trabajo', 'traje']],
    ropaColor: [['Blanco', '#FBFAF6'], ['Arena', '#F0DFB8'], ['Verde', '#1F5B4D'], ['Azul', '#4F9DA6'], ['Terracota', '#C8553D'], ['Mostaza', '#E8B84A']],
    ojos: [['Normales', 'normales'], ['Contentos', 'contentos'], ['Guiño', 'guino']],
    boca: [['Sonrisa', 'sonrisa'], ['Sonrisa grande', 'grande'], ['Serena', 'serena'], ['Ladeada', 'ladeada']],
    extra: [['Ninguno', 'ninguno'], ['Lentes', 'lentes'], ['Bigote', 'bigote'], ['Barba', 'barba'], ['Pecas', 'pecas']],
    detalle: [['Ninguno', 'ninguno'], ['Abeja', 'abeja'], ['Hoja', 'hoja'], ['Flor', 'flor']],
    fondo: [['Menta', '#A9D8C3'], ['Arena', '#E6CF9E'], ['Cielo', '#D6E6EA'], ['Salvia', '#DCE8D2'], ['Miel', '#E9C877'], ['Barro', '#EAD9C8'], ['Turquesa', '#BFE3DA'], ['Durazno', '#EFC3A3']]
  };
  var CAMPOS = ['piel', 'peloEstilo', 'peloColor', 'sombrero', 'sombreroColor', 'ropa', 'ropaColor', 'ojos', 'boca', 'extra', 'detalle', 'fondo'];

  function aCodigo(cfg) { return 'v1.' + CAMPOS.map(function (k) { return cfg[k] | 0; }).join('.'); }
  function deCodigo(codigo) {
    if (typeof codigo !== 'string' || !/^v1(\.\d{1,2}){12}$/.test(codigo)) return null;
    var n = codigo.split('.').slice(1), cfg = {};
    for (var i = 0; i < CAMPOS.length; i++) {
      var v = parseInt(n[i], 10);
      if (v >= OP[CAMPOS[i]].length) return null;
      cfg[CAMPOS[i]] = v;
    }
    return cfg;
  }

  /* ---------- Personajes de partida (índices en el mismo orden de CAMPOS) ---------- */
  var PERSONAJES = [
    ['agricultora', 'Agricultora', { piel: 2, peloEstilo: 1, peloColor: 0, sombrero: 1, sombreroColor: 0, ropa: 0, ropaColor: 2, ojos: 0, boca: 0, extra: 4, detalle: 0, fondo: 0 }],
    ['agricultor', 'Agricultor', { piel: 3, peloEstilo: 0, peloColor: 0, sombrero: 1, sombreroColor: 0, ropa: 1, ropaColor: 2, ojos: 0, boca: 0, extra: 0, detalle: 0, fondo: 1 }],
    ['agronoma', 'Agrónoma', { piel: 1, peloEstilo: 2, peloColor: 2, sombrero: 0, sombreroColor: 0, ropa: 3, ropaColor: 2, ojos: 0, boca: 0, extra: 1, detalle: 2, fondo: 2 }],
    ['agronomo', 'Agrónomo', { piel: 4, peloEstilo: 0, peloColor: 0, sombrero: 3, sombreroColor: 2, ropa: 2, ropaColor: 1, ojos: 0, boca: 1, extra: 2, detalle: 0, fondo: 3 }],
    ['apicultora', 'Apicultora', { piel: 2, peloEstilo: 6, peloColor: 0, sombrero: 6, sombreroColor: 0, ropa: 6, ropaColor: 0, ojos: 1, boca: 0, extra: 0, detalle: 1, fondo: 4 }],
    ['ganadero', 'Ganadero', { piel: 3, peloEstilo: 0, peloColor: 1, sombrero: 2, sombreroColor: 1, ropa: 2, ropaColor: 3, ojos: 0, boca: 1, extra: 2, detalle: 0, fondo: 5 }],
    ['viverista', 'Viverista', { piel: 4, peloEstilo: 4, peloColor: 0, sombrero: 5, sombreroColor: 3, ropa: 0, ropaColor: 4, ojos: 1, boca: 0, extra: 0, detalle: 2, fondo: 6 }],
    ['campesino', 'Campesino', { piel: 5, peloEstilo: 0, peloColor: 4, sombrero: 1, sombreroColor: 5, ropa: 2, ropaColor: 0, ojos: 0, boca: 3, extra: 2, detalle: 0, fondo: 7 }],
    ['campesina', 'Campesina', { piel: 4, peloEstilo: 3, peloColor: 4, sombrero: 0, sombreroColor: 0, ropa: 5, ropaColor: 3, ojos: 0, boca: 0, extra: 0, detalle: 0, fondo: 2 }],
    ['joven', 'Joven agricultor', { piel: 2, peloEstilo: 5, peloColor: 0, sombrero: 4, sombreroColor: 3, ropa: 4, ropaColor: 2, ojos: 2, boca: 1, extra: 4, detalle: 0, fondo: 3 }],
    ['veterinaria', 'Veterinaria', { piel: 3, peloEstilo: 4, peloColor: 1, sombrero: 0, sombreroColor: 0, ropa: 6, ropaColor: 3, ojos: 0, boca: 0, extra: 0, detalle: 3, fondo: 6 }],
    ['cacaotero', 'Cacaotero', { piel: 5, peloEstilo: 0, peloColor: 0, sombrero: 5, sombreroColor: 4, ropa: 1, ropaColor: 4, ojos: 1, boca: 0, extra: 4, detalle: 0, fondo: 1 }]
  ].map(function (p) { return { id: p[0], nombre: p[1], cfg: p[2], codigo: aCodigo(p[2]) }; });

  /* ---------- Dibujo ---------- */
  function oscurecer(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function m(x) { return Math.max(0, Math.round(x * f)); }
    return '#' + [m(r), m(g), m(b)].map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }
  var CUERPO = 'M12 122C12 98 32 88 60 88s48 10 48 34Z';

  var ROPA = {
    blusa: function (col) {
      return '<path d="' + CUERPO + '" fill="' + C.blanco + '"/>' +
        '<path d="M38 122l4-26q3-6 9-8l9 8 9-8q6 2 9 8l4 26Z" fill="' + col + '"/>' +
        '<path d="M44 91l16 14 16-14" fill="none" stroke="' + oscurecer(C.blanco, .85) + '" stroke-width="2"/>';
    },
    overol: function (col) {
      return '<path d="' + CUERPO + '" fill="' + C.crema + '"/>' +
        '<path d="M40 122V104q0-4 4-4h32q4 0 4 4v18Z" fill="' + col + '"/>' +
        '<path d="M44 100l-2-12h8l4 12ZM76 100l2-12h-8l-4 12Z" fill="' + col + '"/>' +
        '<circle cx="46" cy="102" r="2" fill="' + C.paja + '"/><circle cx="74" cy="102" r="2" fill="' + C.paja + '"/>';
    },
    camisa: function (col) {
      return '<path d="' + CUERPO + '" fill="' + col + '"/>' +
        '<path d="M50 88l10 12 10-12-3-3-7 6-7-6Z" fill="' + oscurecer(col, .86) + '"/>' +
        '<path d="M60 100v22" stroke="' + oscurecer(col, .8) + '" stroke-width="1.6"/>';
    },
    chaleco: function (col) {
      return '<path d="' + CUERPO + '" fill="' + C.crema + '"/>' +
        '<path d="M34 122l4-26 12-8 8 14v20ZM86 122l-4-26-12-8-8 14v20Z" fill="' + col + '"/>' +
        '<path d="M80 104q3-3 6 0-2 6-6 6-2-3 0-6Z" fill="' + C.menta + '"/>';
    },
    sudadera: function (col) {
      return '<path d="' + CUERPO + '" fill="' + col + '"/>' +
        '<path d="M42 90q18 16 36 0" fill="none" stroke="' + oscurecer(col, .7) + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M54 100v10M66 100v10" stroke="' + C.crema + '" stroke-width="2" stroke-linecap="round"/>';
    },
    rebozo: function (col) {
      return '<path d="' + CUERPO + '" fill="' + C.blanco + '"/>' +
        '<path d="M14 122C14 100 30 90 48 90l12 22 12-22c18 0 34 10 34 32Z" fill="' + col + '"/>' +
        '<path d="M48 90l12 22 12-22" fill="none" stroke="' + oscurecer(col, .75) + '" stroke-width="2"/>' +
        '<path d="M20 112l8 4M30 108l8 4M90 108l-8 4M100 112l-8 4" stroke="' + C.crema + '" stroke-width="2" stroke-linecap="round" opacity=".7"/>';
    },
    traje: function (col) {
      return '<path d="' + CUERPO + '" fill="' + col + '"/>' +
        '<path d="M46 88q14 14 28 0v6q-14 14-28 0Z" fill="' + oscurecer(col, .88) + '"/>' +
        '<path d="M60 100v22" stroke="' + oscurecer(col, .8) + '" stroke-width="1.6"/>' +
        '<rect x="70" y="106" width="14" height="10" rx="2" fill="none" stroke="' + oscurecer(col, .75) + '" stroke-width="1.6"/>';
    }
  };

  var PELO = { // { atras, frente }
    corto: function (c) {
      return { atras: '', frente: '<path d="M40 56C38 38 48 32 60 32s22 6 20 24c-3-8-9-12-20-12s-17 4-20 12Z" fill="' + c + '"/>' };
    },
    trenza: function (c) {
      return {
        atras: '<ellipse cx="60" cy="56" rx="23" ry="26" fill="' + c + '"/><path d="M76 70q10 8 6 20t4 22" fill="none" stroke="' + c + '" stroke-width="9" stroke-linecap="round"/>',
        frente: '<path d="M39 58C36 36 48 30 60 30s24 6 21 28c-2-12-8-18-21-18s-19 6-21 18Z" fill="' + c + '"/>'
      };
    },
    largo: function (c) {
      return {
        atras: '<path d="M36 56C34 32 48 28 60 28s26 4 24 28q2 22 6 38H30q4-16 6-38Z" fill="' + c + '"/>',
        frente: '<path d="M39 58C36 36 48 31 60 31s24 5 21 27c-3-9-9-15-21-15s-18 6-21 15Z" fill="' + c + '"/>'
      };
    },
    chongo: function (c) {
      return {
        atras: '<circle cx="60" cy="27" r="9" fill="' + c + '"/>',
        frente: '<path d="M39 58C37 38 48 32 60 32s23 6 21 26c-3-9-10-14-21-14s-18 5-21 14Z" fill="' + c + '"/>'
      };
    },
    cola: function (c) {
      return {
        atras: '<path d="M78 46q16 4 12 24-4-8-14-8Z" fill="' + c + '"/>',
        frente: '<path d="M39 58C37 38 48 31 60 31s23 7 21 27c-3-10-10-15-21-15s-18 5-21 15Z" fill="' + c + '"/>'
      };
    },
    rizado: function (c) {
      var bolas = [[42, 46], [50, 38], [60, 35], [70, 38], [78, 46], [40, 56], [80, 56]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="8" fill="' + c + '"/>'; }).join('');
      return { atras: '', frente: bolas };
    },
    ninguno: function () { return { atras: '', frente: '' }; }
  };

  var SOMBRERO = {
    palma: function (col) {
      var cinta = col === '#1F5B4D' ? C.tierra : C.hoja;
      return '<ellipse cx="60" cy="43" rx="40" ry="9" fill="' + oscurecer(col, .86) + '"/>' +
        '<path d="M41 44C41 22 79 22 79 44Z" fill="' + col + '"/>' +
        '<path d="M41.5 41q18 6 37 0l.5 4q-19 7-38 0Z" fill="' + cinta + '"/>' +
        '<ellipse cx="60" cy="43.5" rx="40" ry="9" fill="none" stroke="' + oscurecer(col, .7) + '" stroke-width="1.4"/>';
    },
    vaquero: function (col) {
      return '<path d="M18 44q22 10 42 4 20 6 42-4-4 12-42 12T18 44Z" fill="' + oscurecer(col, .9) + '"/>' +
        '<path d="M40 46q-1-22 20-22t20 22Z" fill="' + col + '"/>' +
        '<path d="M52 27q8 6 16 0" fill="none" stroke="' + oscurecer(col, .7) + '" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M40.5 42q19 6 39 0l.5 4q-20 7-40 0Z" fill="' + C.crema + '" opacity=".85"/>';
    },
    gorra: function (col) {
      return '<path d="M40 48C38 28 82 28 80 48Z" fill="' + col + '"/>' +
        '<path d="M74 46q20 0 24 8-14-3-24-1Z" fill="' + oscurecer(col, .8) + '"/>' +
        '<circle cx="60" cy="38" r="2" fill="' + oscurecer(col, .7) + '"/>' +
        '<path d="M52 36q5-4 12-1q-3 6-9 5-2-2-3-4Z" fill="' + C.menta + '"/>';
    },
    gorraAtras: function (col) {
      return '<path d="M40 48C38 28 82 28 80 48Z" fill="' + col + '"/>' +
        '<path d="M46 46q-16 0-20 8 12-2 22-1Z" fill="' + oscurecer(col, .8) + '"/>' +
        '<circle cx="60" cy="38" r="2" fill="' + oscurecer(col, .7) + '"/>';
    },
    panuelo: function (col) {
      return '<path d="M38 56C36 34 84 34 82 56c-4-9-10-13-22-13S42 47 38 56Z" fill="' + col + '"/>' +
        '<circle cx="50" cy="42" r="1.6" fill="' + C.crema + '"/><circle cx="60" cy="39" r="1.6" fill="' + C.crema + '"/><circle cx="70" cy="42" r="1.6" fill="' + C.crema + '"/>' +
        '<path d="M80 50l12-3-4 9 8 4-12 1Z" fill="' + col + '"/>';
    },
    velo: function () {
      return '<ellipse cx="60" cy="43" rx="38" ry="8" fill="' + C.crema + '"/>' +
        '<path d="M43 44C43 24 77 24 77 44Z" fill="' + C.blanco + '"/>' +
        '<path d="M26 46q4 40 8 44h52q4-4 8-44" fill="' + C.blanco + '" fill-opacity=".5" stroke="' + C.tinta + '" stroke-opacity=".45" stroke-width="1"/>' +
        '<path d="M36 52v34M44 52v38M52 52v40M60 52v40M68 52v40M76 52v38M84 52v34" stroke="' + C.tinta + '" stroke-opacity=".12" stroke-width="1"/>' +
        '<ellipse cx="60" cy="43" rx="38" ry="8" fill="none" stroke="' + oscurecer(C.crema, .7) + '" stroke-width="1.4"/>';
    },
    ninguno: function () { return ''; }
  };

  var OJOS = {
    normales: function () { return '<circle cx="52" cy="60" r="2.3" fill="' + C.tinta + '"/><circle cx="68" cy="60" r="2.3" fill="' + C.tinta + '"/>'; },
    contentos: function () { return '<path d="M49 61q3-4 6 0M65 61q3-4 6 0" fill="none" stroke="' + C.tinta + '" stroke-width="2" stroke-linecap="round"/>'; },
    guino: function () { return '<circle cx="52" cy="60" r="2.3" fill="' + C.tinta + '"/><path d="M65 61q3-4 6 0" fill="none" stroke="' + C.tinta + '" stroke-width="2" stroke-linecap="round"/>'; }
  };
  var BOCA = {
    sonrisa: function () { return '<path d="M54 71.5q6 5 12 0" fill="none" stroke="' + C.tinta + '" stroke-width="1.9" stroke-linecap="round"/>'; },
    grande: function () { return '<path d="M52.5 70h15q-1 9-7.500 9T52.500 70Z" fill="#8E3B35"/><path d="M54 70h12v2.600H54Z" fill="#fff"/>'; },
    serena: function () { return '<path d="M55 72.500h10" fill="none" stroke="' + C.tinta + '" stroke-width="1.9" stroke-linecap="round"/>'; },
    ladeada: function () { return '<path d="M54 73q7 3 12-3" fill="none" stroke="' + C.tinta + '" stroke-width="1.9" stroke-linecap="round"/>'; }
  };

  function extraCara(tipo, colorPelo) {
    if (tipo === 'lentes') return '<g fill="none" stroke="' + C.tinta + '" stroke-width="1.8"><circle cx="52" cy="60" r="6"/><circle cx="68" cy="60" r="6"/><path d="M58 60h4"/></g>';
    if (tipo === 'bigote') return '<path d="M51 68q4-3 9 0 5-3 9 0-3 5-9 3-6 2-9-3Z" fill="' + colorPelo + '"/>';
    if (tipo === 'pecas') return '<g fill="#B8714F" opacity=".5"><circle cx="50" cy="66" r=".9"/><circle cx="53" cy="68" r=".9"/><circle cx="67" cy="68" r=".9"/><circle cx="70" cy="66" r=".9"/></g>';
    return '';
  }
  function detalleAvatar(tipo) {
    if (tipo === 'abeja') return '<g transform="translate(94 28) rotate(-18)"><ellipse rx="6" ry="4" fill="' + C.paja + '"/><path d="M-2 -4v8M2 -4v8" stroke="' + C.tinta + '" stroke-width="1.6"/><ellipse cx="-1" cy="-5" rx="3.4" ry="2.4" fill="#fff" opacity=".85"/></g>';
    if (tipo === 'hoja') return '<path d="M92 24q12 0 14 12-12 0-14-12Z" fill="' + C.menta + '"/><path d="M92 24q7 5 12 11" stroke="' + C.bosque + '" stroke-width="1" fill="none"/>';
    if (tipo === 'flor') return '<g transform="translate(96 30)"><circle r="3" fill="' + C.paja + '"/><g fill="#fff"><circle cx="0" cy="-6" r="3.4"/><circle cx="5.700" cy="-1.800" r="3.4"/><circle cx="3.500" cy="4.900" r="3.400"/><circle cx="-3.500" cy="4.900" r="3.400"/><circle cx="-5.700" cy="-1.800" r="3.400"/></g><circle r="2.600" fill="' + C.paja + '"/></g>';
    return '';
  }

  var contador = 0;
  function dibujar(cfg, tam) {
    var piel = OP.piel[cfg.piel][1], sombra = oscurecer(piel, .84);
    var colorPelo = OP.peloColor[cfg.peloColor][1];
    var estiloPelo = OP.peloEstilo[cfg.peloEstilo][1];
    var pelo = PELO[estiloPelo](colorPelo);
    var tipoRopa = OP.ropa[cfg.ropa][1];
    var ropa = ROPA[tipoRopa](OP.ropaColor[cfg.ropaColor][1]);
    var tipoSombrero = OP.sombrero[cfg.sombrero][1];
    var sombrero = SOMBRERO[tipoSombrero](OP.sombreroColor[cfg.sombreroColor][1]);
    var tipoExtra = OP.extra[cfg.extra][1];
    var cejas = estiloPelo === 'ninguno' ? oscurecer(piel, .5) : colorPelo;
    var colorBarba = tipoExtra === 'barba' ? colorPelo : '';

    var cara =
      '<rect x="52" y="76" width="16" height="18" rx="6" fill="' + sombra + '"/>' +
      '<circle cx="40" cy="61" r="4.2" fill="' + piel + '"/><circle cx="80" cy="61" r="4.2" fill="' + piel + '"/>' +
      '<ellipse cx="60" cy="58" rx="20" ry="23" fill="' + piel + '"/>' +
      (colorBarba ? '<path d="M40.500 62q0 22 19.500 24 19.500-2 19.500-24-3 10-19.500 10S43.500 72 40.500 62Z" fill="' + colorBarba + '"/>' : '') +
      '<circle cx="46" cy="66" r="4" fill="#E06A5A" opacity=".2"/><circle cx="74" cy="66" r="4" fill="#E06A5A" opacity=".2"/>' +
      '<path d="M60 61q-2.400 5 .8 6.400" fill="none" stroke="' + oscurecer(piel, .7) + '" stroke-width="1.600" stroke-linecap="round"/>' +
      OJOS[OP.ojos[cfg.ojos][1]]() +
      '<path d="M48 54.500q4-2.400 8 0M64 54.500q4-2.400 8 0" fill="none" stroke="' + cejas + '" stroke-width="1.800" stroke-linecap="round"/>' +
      (colorBarba ? '<path d="M50 70q10-4 20 0" fill="none" stroke="' + oscurecer(colorBarba, .8) + '" stroke-width="0"/>' : '') +
      BOCA[OP.boca[cfg.boca][1]]() +
      extraCara(tipoExtra, colorPelo);

    var cp = 'sav' + (++contador);
    var t = tam ? ' width="' + tam + '" height="' + tam + '"' : '';
    var capas = pelo.atras + ropa + cara + pelo.frente + detalleAvatar(OP.detalle[cfg.detalle][1]) + sombrero;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"' + t + ' role="img" aria-label="Avatar">' +
      '<defs><clipPath id="' + cp + '"><circle cx="60" cy="60" r="60"/></clipPath></defs>' +
      '<g clip-path="url(#' + cp + ')"><rect width="120" height="120" fill="' + OP.fondo[cfg.fondo][1] + '"/>' + capas + '</g></svg>';
  }

  function cfgDe(valor) {
    if (valor && typeof valor === 'object') return valor;
    var p = PERSONAJES.filter(function (x) { return x.id === valor; })[0];
    return p ? p.cfg : deCodigo(valor);
  }
  function svg(valor, tam) {
    var cfg = cfgDe(valor);
    return cfg ? dibujar(cfg, tam) : '';
  }

  /* ---------- Editor ---------- */
  var ESTILO_ID = 'sin-avatares-estilo';
  var CSS =
    '.av-fondo{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(10,30,26,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}' +
    '.av-caja{width:min(560px,100%);max-height:min(92vh,760px);display:flex;flex-direction:column;background:#FFFFFF;color:#183A33;border-radius:20px;box-shadow:0 30px 70px -20px rgba(0,0,0,.5);font-family:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden}' +
    '.av-cab{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid #E1ECE6}' +
    '.av-cab h2{margin:0;font:800 18px/1.2 "Plus Jakarta Sans",system-ui,sans-serif;color:#113D35}' +
    '.av-x{border:0;background:#EDF4F0;color:#113D35;width:34px;height:34px;border-radius:50%;font-size:20px;line-height:1;cursor:pointer}' +
    '.av-cuerpo{overflow:auto;padding:16px 20px 8px;-webkit-overflow-scrolling:touch}' +
    '.av-prev{display:flex;align-items:center;gap:16px;margin-bottom:14px}' +
    '.av-prev-img{flex:0 0 auto;width:132px;height:132px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 4px #fff,0 0 0 6px #CFE0D8}' +
    '.av-prev-img svg{display:block;width:100%;height:100%}' +
    '.av-prev p{margin:0;font-size:13.5px;line-height:1.5;color:#5A7168}' +
    '.av-azar{margin-top:8px;border:1px solid #CFE0D8;background:#fff;color:#113D35;border-radius:99px;padding:8px 14px;font:700 13px/1 "Plus Jakarta Sans",system-ui,sans-serif;cursor:pointer}' +
    '.av-sec{padding:12px 0;border-top:1px solid #EEF4F1}' +
    '.av-sec h3{margin:0 0 8px;font:800 12px/1 "Plus Jakarta Sans",system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#087F70}' +
    '.av-fila{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:8px}' +
    '.av-fila:last-child{margin-bottom:0}' +
    '.av-chip{border:1.5px solid #D9E5DF;background:#fff;color:#183A33;border-radius:99px;padding:7px 12px;font:600 13px/1.1 "Inter",system-ui,sans-serif;cursor:pointer}' +
    '.av-chip[aria-pressed="true"]{background:#113D35;border-color:#113D35;color:#fff}' +
    '.av-color{width:30px;height:30px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1.5px #CFE0D8;cursor:pointer;padding:0}' +
    '.av-color[aria-pressed="true"]{box-shadow:0 0 0 2.5px #113D35}' +
    '.av-pers{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}' +
    '.av-per{border:2px solid transparent;border-radius:50%;padding:0;background:none;cursor:pointer;line-height:0}' +
    '.av-per svg{width:100%;height:auto;border-radius:50%}' +
    '.av-per[aria-pressed="true"]{border-color:#113D35}' +
    '.av-pie{display:flex;justify-content:flex-end;gap:10px;padding:14px 20px;border-top:1px solid #E1ECE6;background:#fff}' +
    '.av-btn{border-radius:99px;padding:12px 22px;font:800 14px/1 "Plus Jakarta Sans",system-ui,sans-serif;cursor:pointer;border:1.5px solid #CFE0D8;background:#fff;color:#113D35}' +
    '.av-btn--ok{background:#113D35;border-color:#113D35;color:#fff}' +
    '.av-btn--quitar{margin-right:auto;border-color:transparent;background:none;color:#B4232C;padding-left:4px;padding-right:4px}' +
    '.av-btn[disabled]{opacity:.6;cursor:default}' +
    '.av-err{margin:0 20px 8px;color:#B3261E;font-size:13px}' +
    'html[data-theme="dark"] .av-caja{background:#142B26;color:#E6F0EB}' +
    'html[data-theme="dark"] .av-cab,html[data-theme="dark"] .av-pie{border-color:#24433B;background:#142B26}' +
    'html[data-theme="dark"] .av-cab h2{color:#E6F0EB}' +
    'html[data-theme="dark"] .av-x{background:#1F3D35;color:#E6F0EB}' +
    'html[data-theme="dark"] .av-sec{border-color:#24433B}' +
    'html[data-theme="dark"] .av-sec h3{color:#5ED1B4}' +
    'html[data-theme="dark"] .av-prev p{color:#A9C1B8}' +
    'html[data-theme="dark"] .av-chip,html[data-theme="dark"] .av-azar,html[data-theme="dark"] .av-btn{background:#1B3730;color:#E6F0EB;border-color:#2C5248}' +
    'html[data-theme="dark"] .av-chip[aria-pressed="true"],html[data-theme="dark"] .av-btn--ok{background:#1AA888;border-color:#1AA888;color:#06231D}' +
    'html[data-theme="dark"] .av-color{border-color:#142B26}' +
    'html[data-theme="dark"] .av-color[aria-pressed="true"]{box-shadow:0 0 0 2.5px #5ED1B4}' +
    'html[data-theme="dark"] .av-per[aria-pressed="true"]{border-color:#5ED1B4}' +
    '@media (max-width:520px){.av-prev{flex-direction:column;align-items:center;text-align:center}.av-pers{grid-template-columns:repeat(4,1fr)}.av-fondo{padding:0;align-items:flex-end}.av-caja{border-radius:20px 20px 0 0;max-height:94vh}}';

  function el(tag, attrs, hijos) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'texto') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (hijos || []).forEach(function (h) { e.appendChild(h); });
    return e;
  }

  var SECCIONES = [
    { titulo: 'Piel', filas: [{ campo: 'piel', color: true }] },
    { titulo: 'Cabello', filas: [{ campo: 'peloEstilo' }, { campo: 'peloColor', color: true }] },
    { titulo: 'Sombrero', filas: [{ campo: 'sombrero' }, { campo: 'sombreroColor', color: true }] },
    { titulo: 'Ropa', filas: [{ campo: 'ropa' }, { campo: 'ropaColor', color: true }] },
    { titulo: 'Cara', filas: [{ campo: 'ojos' }, { campo: 'boca' }, { campo: 'extra' }] },
    { titulo: 'Detalle', filas: [{ campo: 'detalle' }] },
    { titulo: 'Fondo', filas: [{ campo: 'fondo', color: true }] }
  ];

  function abrirEditor(opc) {
    opc = opc || {};
    if (document.getElementById('sinAvatarEditor')) return;
    if (!document.getElementById(ESTILO_ID)) {
      var st = el('style', { id: ESTILO_ID }); st.textContent = CSS; document.head.appendChild(st);
    }
    var inicial = deCodigo(opc.codigo) || PERSONAJES[0].cfg;
    var cfg = {}; CAMPOS.forEach(function (k) { cfg[k] = inicial[k]; });
    var previo = document.activeElement;

    var fondo = el('div', { class: 'av-fondo', id: 'sinAvatarEditor' });
    var caja = el('div', { class: 'av-caja', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'avTitulo' });
    var btnX = el('button', { type: 'button', class: 'av-x', 'aria-label': 'Cerrar', texto: '×' });
    caja.appendChild(el('div', { class: 'av-cab' }, [el('h2', { id: 'avTitulo', texto: 'Arma tu avatar' }), btnX]));

    var cuerpo = el('div', { class: 'av-cuerpo' });
    var prevImg = el('div', { class: 'av-prev-img' });
    var btnAzar = el('button', { type: 'button', class: 'av-azar', texto: 'Sorpréndeme' });
    cuerpo.appendChild(el('div', { class: 'av-prev' }, [prevImg, el('div', {}, [
      el('p', { texto: 'Empieza con un personaje y cámbiale lo que quieras: piel, cabello, sombrero, ropa y cara.' }), btnAzar])]));

    var secPers = el('div', { class: 'av-sec' }, [el('h3', { texto: 'Personajes' })]);
    var rejPers = el('div', { class: 'av-pers' });
    secPers.appendChild(rejPers); cuerpo.appendChild(secPers);

    var botones = []; // para refrescar el estado pulsado
    function pintarPrevia() {
      prevImg.innerHTML = dibujar(cfg);
      botones.forEach(function (b) { b.el.setAttribute('aria-pressed', cfg[b.campo] === b.i ? 'true' : 'false'); });
      Array.prototype.forEach.call(rejPers.children, function (b, i) {
        var p = PERSONAJES[i], igual = CAMPOS.every(function (k) { return p.cfg[k] === cfg[k]; });
        b.setAttribute('aria-pressed', igual ? 'true' : 'false');
      });
    }
    PERSONAJES.forEach(function (p) {
      var b = el('button', { type: 'button', class: 'av-per', title: p.nombre, 'aria-label': p.nombre, html: dibujar(p.cfg) });
      b.addEventListener('click', function () { CAMPOS.forEach(function (k) { cfg[k] = p.cfg[k]; }); pintarPrevia(); });
      rejPers.appendChild(b);
    });
    SECCIONES.forEach(function (s) {
      var sec = el('div', { class: 'av-sec' }, [el('h3', { texto: s.titulo })]);
      s.filas.forEach(function (f) {
        var fila = el('div', { class: 'av-fila' });
        OP[f.campo].forEach(function (o, i) {
          var b = f.color
            ? el('button', { type: 'button', class: 'av-color', style: 'background:' + o[1], title: o[0], 'aria-label': o[0], 'aria-pressed': 'false' })
            : el('button', { type: 'button', class: 'av-chip', texto: o[0], 'aria-pressed': 'false' });
          b.addEventListener('click', function () { cfg[f.campo] = i; pintarPrevia(); });
          botones.push({ el: b, campo: f.campo, i: i });
          fila.appendChild(b);
        });
        sec.appendChild(fila);
      });
      cuerpo.appendChild(sec);
    });
    caja.appendChild(cuerpo);

    var msg = el('p', { class: 'av-err', role: 'alert', style: 'display:none' });
    var btnCancelar = el('button', { type: 'button', class: 'av-btn', texto: 'Cancelar' });
    var btnGuardar = el('button', { type: 'button', class: 'av-btn av-btn--ok', texto: 'Guardar avatar' });
    caja.appendChild(msg);
    var btnQuitar = null;
    if (typeof opc.alQuitar === 'function' && deCodigo(opc.codigo)) btnQuitar = el('button', { type: 'button', class: 'av-btn av-btn--quitar', texto: 'Quitar mi avatar' });
    caja.appendChild(el('div', { class: 'av-pie' }, (btnQuitar ? [btnQuitar] : []).concat([btnCancelar, btnGuardar])));
    fondo.appendChild(caja);
    document.body.appendChild(fondo);
    document.documentElement.style.overflow = 'hidden';
    pintarPrevia();

    function cerrar(guardado) {
      document.removeEventListener('keydown', teclas, true);
      if (fondo.parentNode) fondo.parentNode.removeChild(fondo);
      document.documentElement.style.overflow = '';
      try { if (previo && previo.focus) previo.focus(); } catch (e) {}
      if (typeof opc.alCerrar === 'function') opc.alCerrar(guardado || null);
    }
    function teclas(e) {
      if (e.key === 'Escape') { e.stopPropagation(); cerrar(null); return; }
      if (e.key !== 'Tab') return;
      var f = caja.querySelectorAll('button:not([disabled])'); if (!f.length) return;
      var primero = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
    document.addEventListener('keydown', teclas, true);
    btnX.addEventListener('click', function () { cerrar(null); });
    btnCancelar.addEventListener('click', function () { cerrar(null); });
    fondo.addEventListener('mousedown', function (e) { if (e.target === fondo) cerrar(null); });
    btnAzar.addEventListener('click', function () {
      CAMPOS.forEach(function (k) { cfg[k] = Math.floor(Math.random() * OP[k].length); });
      pintarPrevia();
    });
    btnGuardar.addEventListener('click', function () {
      var codigo = aCodigo(cfg);
      msg.style.display = 'none';
      btnGuardar.disabled = true; btnCancelar.disabled = true; btnGuardar.textContent = 'Guardando…';
      Promise.resolve(typeof opc.guardar === 'function' ? opc.guardar(codigo) : null).then(function () {
        cerrar(codigo);
      }, function (err) {
        btnGuardar.disabled = false; btnCancelar.disabled = false; btnGuardar.textContent = 'Guardar avatar';
        msg.textContent = (err && err.message) || 'No pudimos guardar tu avatar. Intenta de nuevo.';
        msg.style.display = 'block';
      });
    });
    if (btnQuitar) btnQuitar.addEventListener('click', function () {
      msg.style.display = 'none';
      btnQuitar.disabled = true; btnGuardar.disabled = true; btnCancelar.disabled = true;
      Promise.resolve(opc.alQuitar()).then(function () { cerrar('quitado'); }, function (err) {
        btnQuitar.disabled = false; btnGuardar.disabled = false; btnCancelar.disabled = false;
        msg.textContent = (err && err.message) || 'No pudimos quitar tu avatar. Intenta de nuevo.';
        msg.style.display = 'block';
      });
    });
    setTimeout(function () { btnGuardar.focus(); }, 30);
  }

  window.SIN_AVATARES = {
    svg: svg,
    valido: function (codigo) { return !!deCodigo(codigo); },
    personajes: PERSONAJES.map(function (p) { return { id: p.id, nombre: p.nombre, codigo: p.codigo }; }),
    abrirEditor: abrirEditor,
    _opciones: OP, _campos: CAMPOS
  };
})();
