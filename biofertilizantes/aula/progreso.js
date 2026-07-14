/* ═══════════════════════════════════════════════════════════
   Progreso del alumno · Aula Biofertilizantes
   Se carga en el <head> de todas las páginas del aula (después de guard.js).

   ── DÓNDE VIVE EL PROGRESO ──
   Hoy: localStorage, con clave por curso y por alumno.
   Mañana: Firestore, contra el email del alumno.

   TODA la persistencia está en _cargar() y _guardar(). Para migrar al
   backend NO hay que tocar nada más: se reescriben esas dos funciones
   (async + fetch al API) y el resto de la API pública sigue igual.

   La clave lleva el slug del curso: el progreso de gerberas y el de
   biofertilizantes nunca se pisan, aunque sea el mismo alumno.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ── Datos del curso ────────────────────────────────────────────────
  // Duraciones y nº de subtemas CONTADOS de las páginas reales (el mockup
  // decía otra cosa en los módulos 3, 4 y 5 — ver reporte).
  // El módulo 5 todavía no tiene video: video = null.
  var CURSO = {
    slug: 'biofertilizantes',
    titulo: 'Elaboración y Aplicación de Biofertilizantes',
    ponente: 'Ing. Agr. José Ángel de la Cruz Hernández',
    totalMinutos: 220,           // 45+38+52+45+40 = 3 h 40 min
    materiales: 6,
    modulos: [
      {
        n: 1,
        titulo: 'Fertilizantes, abonos y biofertilizantes',
        corto: 'Fertilizantes',
        desc: 'Introducción a los conceptos, tipos, presentaciones y diferencias entre fertilizantes, abonos y biofertilizantes.',
        min: 45,
        subtemas: 5,
        video: '1PWKyKc0BvRF7ji793krMmO5IcuPGqdOF'
      },
      {
        n: 2,
        titulo: 'Criterios y evaluación para el uso de biofertilizantes',
        corto: 'Criterios',
        desc: 'Diagnóstico agroecológico, análisis de sistemas de siembra y calendarización del uso.',
        min: 38,
        subtemas: 5,
        video: '1c0zW46PRM4c_I_2wb3A9UzDPoBJNxFHb'
      },
      {
        n: 3,
        titulo: 'Elaboración y formulación de los biofertilizantes más comunes',
        corto: 'Elaboración',
        desc: 'Biol, compostas, tés, purines y caldos. Insumos, equipos y formulación por etapa fenológica.',
        min: 52,
        subtemas: 8,
        video: '1ewOyeeVRjWbvWPYXBX6JkXRhe5fg70Zq'
      },
      {
        n: 4,
        titulo: 'Tiempos de fermentación, degradación y calidad',
        corto: 'Fermentación',
        desc: 'Manejo de pH, conductividad, envasado y combinación de biofertilizantes.',
        min: 45,
        subtemas: 5,
        video: '1UHTu8ljMi_EF6aC5IgyO0DMPL4gHxhxC'
      },
      {
        n: 5,
        titulo: 'Métodos y ajustes de aplicación en diferentes entornos',
        corto: 'Aplicación',
        desc: 'Aplicación en campo abierto, invernaderos, praderas, jardines, frutales e hidroponía.',
        min: 40,
        subtemas: 6,
        video: null   // ⏳ video en producción — la tarjeta muestra "Próximamente"
      }
    ]
  };

  var TOTAL_MODULOS = CURSO.modulos.length;

  function metaModulo(n) {
    return CURSO.modulos[Number(n) - 1] || null;
  }

  // ── CAPA DE PERSISTENCIA ───────────────────────────────────────────
  // ⚠️  El único punto que toca el almacenamiento. Cambiar SOLO esto
  //     para migrar a Firestore.
  function _clave(email) {
    return 'sinergia_progreso_' + CURSO.slug + '_' + String(email || '').trim().toLowerCase();
  }

  function _cargar(email) {
    try {
      var crudo = localStorage.getItem(_clave(email));
      return crudo ? JSON.parse(crudo) : null;
    } catch (e) {
      return null; // almacenamiento bloqueado o JSON corrupto: arrancamos limpio
    }
  }

  function _guardar(email, datos) {
    try {
      localStorage.setItem(_clave(email), JSON.stringify(datos));
      return true;
    } catch (e) {
      console.warn('[progreso] No se pudo guardar:', e.message);
      return false;
    }
  }
  // ── FIN DE LA CAPA DE PERSISTENCIA ─────────────────────────────────

  function _vacio() {
    var datos = { modulos: {}, subtemas: {}, notas: {}, ultimoModulo: 1, actualizado: null };
    CURSO.modulos.forEach(function (m) {
      datos.modulos[m.n] = { visto: false, completado: false, ultimaVez: null };
      datos.subtemas[m.n] = new Array(m.subtemas).fill(false);
      datos.notas[m.n] = '';
    });
    return datos;
  }

  // Un progreso viejo (o manipulado) puede venir incompleto: lo rellenamos
  // sin perder lo que ya había.
  function _sanear(datos) {
    var base = _vacio();
    if (!datos || typeof datos !== 'object') return base;

    CURSO.modulos.forEach(function (m) {
      var mod = (datos.modulos || {})[m.n];
      if (mod && typeof mod === 'object') {
        base.modulos[m.n] = {
          visto: !!mod.visto,
          completado: !!mod.completado,
          ultimaVez: mod.ultimaVez || null
        };
      }
      var subs = (datos.subtemas || {})[m.n];
      if (Array.isArray(subs)) {
        for (var i = 0; i < m.subtemas; i++) base.subtemas[m.n][i] = !!subs[i];
      }
      var nota = (datos.notas || {})[m.n];
      if (typeof nota === 'string') base.notas[m.n] = nota;
    });

    var ult = Number(datos.ultimoModulo);
    base.ultimoModulo = (ult >= 1 && ult <= TOTAL_MODULOS) ? ult : 1;
    base.actualizado = datos.actualizado || null;
    return base;
  }

  // ── ESTADO EN MEMORIA ──────────────────────────────────────────────
  var emailActual = null;
  var datos = _vacio();

  function persistir() {
    datos.actualizado = new Date().toISOString();
    _guardar(emailActual, datos);
  }

  function emailDelGuard() {
    try {
      return localStorage.getItem('sinergia_aula_email_' + CURSO.slug) || '';
    } catch (e) {
      return '';
    }
  }

  // ── API PÚBLICA ────────────────────────────────────────────────────
  var Progreso = {
    CURSO: CURSO,
    TOTAL_MODULOS: TOTAL_MODULOS,
    metaModulo: metaModulo,

    // ¿Este módulo ya tiene video grabado?
    tieneVideo: function (n) {
      var m = metaModulo(n);
      return !!(m && m.video);
    },

    // Sin argumento, toma el email de la sesión que dejó guard.js.
    init: function (email) {
      emailActual = String(email || emailDelGuard() || '').trim().toLowerCase();
      datos = _sanear(_cargar(emailActual));
      return this;
    },

    marcarVisto: function (n) {
      var m = datos.modulos[n];
      if (!m) return this;
      m.visto = true;
      m.ultimaVez = new Date().toISOString();
      datos.ultimoModulo = Number(n);
      persistir();
      return this;
    },

    marcarCompletado: function (n, valor) {
      var m = datos.modulos[n];
      if (!m) return this;
      m.completado = (valor === undefined) ? true : !!valor;
      m.visto = true;
      m.ultimaVez = new Date().toISOString();
      persistir();
      return this;
    },

    toggleSubtema: function (n, i) {
      var lista = datos.subtemas[n];
      if (!lista || i < 0 || i >= lista.length) return false;
      lista[i] = !lista[i];
      datos.modulos[n].visto = true;
      persistir();
      return lista[i];
    },

    getModulo: function (n) {
      var m = datos.modulos[n];
      return m ? { visto: m.visto, completado: m.completado, ultimaVez: m.ultimaVez } : null;
    },

    getSubtemas: function (n) {
      return (datos.subtemas[n] || []).slice();
    },

    getSubtemasHechos: function (n) {
      return (datos.subtemas[n] || []).filter(Boolean).length;
    },

    // Estado de un módulo: sin-empezar | empezado | completado
    // (el "próximamente" del módulo sin video es cosa de la vista, no del dato:
    //  el alumno SÍ puede completarlo, porque tiene subtemas y descripción)
    getEstadoModulo: function (n) {
      var m = datos.modulos[n];
      if (!m) return 'sin-empezar';
      if (m.completado) return 'completado';
      if (m.visto || this.getSubtemasHechos(n) > 0) return 'empezado';
      return 'sin-empezar';
    },

    getModulosCompletados: function () {
      var total = 0;
      CURSO.modulos.forEach(function (m) {
        if (datos.modulos[m.n].completado) total++;
      });
      return total;
    },

    // El % se mide sobre los 5 módulos SIEMPRE, incluido el que no tiene
    // video: si midiéramos sobre 4, le diríamos al alumno que va al 100%
    // cuando aún le falta contenido.
    getPorcentaje: function () {
      return Math.round((this.getModulosCompletados() / TOTAL_MODULOS) * 100);
    },

    // Primer módulo sin completar (para el botón "Continuar").
    getUltimoModulo: function () {
      var pendiente = CURSO.modulos.find(function (m) {
        return !datos.modulos[m.n].completado;
      });
      if (!pendiente) return TOTAL_MODULOS;

      var enCurso = datos.ultimoModulo;
      if (enCurso && !datos.modulos[enCurso].completado) return enCurso;
      return pendiente.n;
    },

    getMinutosRestantes: function () {
      return CURSO.modulos.reduce(function (acc, m) {
        return acc + (datos.modulos[m.n].completado ? 0 : m.min);
      }, 0);
    },

    estaCompleto: function () {
      return this.getModulosCompletados() === TOTAL_MODULOS;
    },

    getNota: function (n) {
      return datos.notas[n] || '';
    },

    setNota: function (n, texto) {
      if (!(n in datos.notas)) return this;
      datos.notas[n] = String(texto || '');
      persistir();
      return this;
    },

    reset: function () {
      datos = _vacio();
      persistir();
      return this;
    },

    dump: function () {
      return JSON.parse(JSON.stringify(datos));
    }
  };

  // ── Utilidades de formato compartidas por las páginas ──────────────
  Progreso.formatoTiempo = function (minutos) {
    var h = Math.floor(minutos / 60);
    var m = minutos % 60;
    if (h && m) return h + ' h ' + m + ' min';
    if (h) return h + ' h';
    return m + ' min';
  };

  // Miniatura del video en Drive. Si el módulo no tiene video (o Drive
  // bloquea el hotlink), la tarjeta cae al bloque verde de fallback.
  Progreso.miniatura = function (idVideo) {
    return idVideo ? 'https://drive.google.com/thumbnail?id=' + idVideo + '&sz=w400' : '';
  };

  global.Progreso = Progreso;
})(window);
