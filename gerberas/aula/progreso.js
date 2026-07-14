/* ═══════════════════════════════════════════════════════════
   Progreso del alumno · Aula Gerberas
   Se carga en el <head> de todas las páginas del aula (después de guard.js).

   ── DÓNDE VIVE EL PROGRESO ──
   Hoy: localStorage, con clave por curso y por alumno.
   Mañana: Firestore, contra el email del alumno.

   TODA la persistencia está en _cargar() y _guardar(). Para migrar al
   backend NO hay que tocar nada más: se reescriben esas dos funciones
   (async + fetch al API) y el resto de la API pública sigue igual.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ── Datos del curso ────────────────────────────────────────────────
  // Duraciones y nº de subtemas verificados contra las páginas reales.
  var CURSO = {
    slug: 'gerberas',
    titulo: 'Cultivo y Manejo de Gerberas',
    ponente: 'Dr. Marco Antonio Villegas Olguín',
    totalMinutos: 211,           // 45+38+42+51+35 = 3 h 31 min
    materiales: 6,
    modulos: [
      {
        n: 1,
        titulo: 'Establecimiento del cultivo',
        corto: 'Establecimiento',
        desc: 'Selección de variedades, preparación del terreno, sustratos y sistemas de cultivo.',
        min: 45,
        subtemas: 8,
        video: '1FhFZxSlA8WlJmNtHV-LqsP0W4JcTp_p-'
      },
      {
        n: 2,
        titulo: 'Riego, nutrición y manejo del cultivo',
        corto: 'Riego y nutrición',
        desc: 'Manejo eficiente del riego, requerimientos nutricionales y bioestimulantes.',
        min: 38,
        subtemas: 7,
        video: '1aIdV91gWCAsHrTwA7xTWyKo0lYlsVbuT'
      },
      {
        n: 3,
        titulo: 'Plagas, enfermedades y manejo preventivo',
        corto: 'Plagas',
        desc: 'Identificación de plagas, manejo de trips y pulgones, y aplicaciones fitosanitarias.',
        min: 42,
        subtemas: 6,
        video: '1Hz1B_ccaJJpB8mzk3MdwUYmXICioQ_TV'
      },
      {
        n: 4,
        titulo: 'Cosecha, postcosecha e hidratación',
        corto: 'Cosecha',
        desc: 'Momento ideal de corte, soluciones hidratantes y producción en maceta.',
        min: 51,
        subtemas: 8,
        video: '1ZV6XLEhjxZp5pTJ6zrxc-R7f6w9zDCyR'
      },
      {
        n: 5,
        titulo: 'Producción rentable y comercialización',
        corto: 'Comercialización',
        desc: 'Indicadores de calidad, programación anual y clasificación comercial.',
        min: 35,
        subtemas: 5,
        video: '1tQl5mBC8CxuXqKcgukoRyBXmzhFLycJv'
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

    // Estado de un módulo, ya resuelto para pintar: sin-empezar | empezado | completado
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

    // El % del curso se mide en módulos completados, no en subtemas:
    // el subtema es una ayuda de estudio, el módulo es la unidad real.
    getPorcentaje: function () {
      return Math.round((this.getModulosCompletados() / TOTAL_MODULOS) * 100);
    },

    // Primer módulo sin completar (para el botón "Continuar").
    getUltimoModulo: function () {
      var pendiente = CURSO.modulos.find(function (m) {
        return !datos.modulos[m.n].completado;
      });
      if (!pendiente) return TOTAL_MODULOS;

      // Si dejó uno a medias, ese manda sobre el orden natural.
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

    // Volcado crudo (útil para depurar desde la consola).
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

  // Miniatura del video en Drive. Si Drive bloquea el hotlink, la página
  // cae al fallback con gradiente (ver onerror en las tarjetas).
  Progreso.miniatura = function (idVideo) {
    return 'https://drive.google.com/thumbnail?id=' + idVideo + '&sz=w400';
  };

  global.Progreso = Progreso;
})(window);
