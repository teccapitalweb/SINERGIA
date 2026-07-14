/* ═══════════════════════════════════════════════════════════
   Progreso del alumno · Aula Gerberas
   Se carga en el <head> de todas las páginas del aula (después de guard.js).

   ── DÓNDE VIVE EL PROGRESO ──
   En Firestore (colección progreso_alumnos), contra el email del alumno.
   localStorage queda solo como RESPALDO si el backend no responde.

   El backend saca el email y el curso DEL JWT del aula, nunca del body:
   nadie puede escribir el progreso de otro alumno.

   init() es la única función async de la API. Hace UNA llamada y deja todo
   en memoria; los getters siguen siendo síncronos.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ── Datos del curso ────────────────────────────────────────────────
  // Duraciones y nº de subtemas verificados contra las páginas reales.
  var CURSO = {
    slug: 'gerberas',
    titulo: 'Cultivo y Manejo de Gerberas',
    ponente: 'Ing. Irene del Pilar García Pérez',
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
  // El progreso vive en Firestore. localStorage queda como RESPALDO: si el
  // backend no responde, el alumno sigue avanzando y se sube después.
  //
  // El backend saca el email y el curso DEL TOKEN, no de lo que enviemos.
  // Aquí solo mandamos el documento de progreso.
  var BACKEND = 'https://sinergia-webhook-production.up.railway.app';
  var ESPERA_GUARDADO = 1000;   // debounce del autoguardado
  var ESPERA_REINTENTO = 6000;  // si el backend falla, se reintenta

  function _token() {
    try { return localStorage.getItem('sinergia_aula_token_' + CURSO.slug) || ''; }
    catch (e) { return ''; }
  }

  function _claveLocal(email) {
    return 'sinergia_progreso_' + CURSO.slug + '_' + String(email || '').trim().toLowerCase();
  }

  function _cargarLocal(email) {
    try {
      var crudo = localStorage.getItem(_claveLocal(email));
      return crudo ? JSON.parse(crudo) : null;
    } catch (e) {
      return null;
    }
  }

  function _guardarLocal(email, datos) {
    try { localStorage.setItem(_claveLocal(email), JSON.stringify(datos)); return true; }
    catch (e) { return false; }
  }

  function _borrarLocal(email) {
    try { localStorage.removeItem(_claveLocal(email)); } catch (e) { /* nada */ }
  }

  // Token caducado o manipulado: de vuelta a la puerta.
  function _sesionCaducada() {
    try { localStorage.removeItem('sinergia_aula_token_' + CURSO.slug); } catch (e) { /* nada */ }
    window.location.replace('acceso.html');
  }

  // GET: devuelve { datos, nuevo }. Lanza si el backend no responde.
  function _cargarRemoto() {
    return fetch(BACKEND + '/aula/progreso', {
      headers: { 'Authorization': 'Bearer ' + _token() }
    }).then(function (r) {
      if (r.status === 401) { _sesionCaducada(); throw new Error('sesión caducada'); }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      return { datos: j.progreso, nuevo: !!j.nuevo };
    });
  }

  // PUT: true si quedó guardado en Firestore. El % y el flag 'completado'
  // NO se envían: los calcula el backend (si no, cualquiera se auto-certifica).
  function _guardarRemoto(datos, conKeepalive) {
    return fetch(BACKEND + '/aula/progreso', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _token()
      },
      keepalive: !!conKeepalive,
      body: JSON.stringify({
        modulos: datos.modulos,
        subtemas: datos.subtemas,
        notas: datos.notas,
        ultimoModulo: datos.ultimoModulo
      })
    }).then(function (r) {
      if (r.status === 401) { _sesionCaducada(); return false; }
      return r.ok;
    });
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
      // El temario puede cambiar (un módulo pasa de 5 a 9 subtemas). Si el
      // array guardado tiene otra longitud, viene de un temario viejo: sus
      // posiciones ya NO corresponden a los mismos temas, así que se descarta
      // entero en vez de arrastrar marcas que ahora significan otra cosa.
      // Vale igual para lo que llega del backend y para el respaldo local:
      // los dos pasan por aquí.
      var subs = (datos.subtemas || {})[m.n];
      if (Array.isArray(subs) && subs.length === m.subtemas) {
        for (var i = 0; i < m.subtemas; i++) base.subtemas[m.n][i] = !!subs[i];
      } else if (Array.isArray(subs) && subs.length > 0) {
        console.warn('[progreso] Módulo ' + m.n + ': el temario cambió (' +
          subs.length + ' → ' + m.subtemas + ' subtemas). Se reinician sus marcas.');
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
  var sinConexion = false;   // el backend no contesta
  var pendiente = false;     // hay cambios sin subir
  var temporizador = null;

  // ¿Este progreso tiene algo dentro? (para decidir si migrarlo)
  function _tieneAvance(d) {
    return CURSO.modulos.some(function (m) {
      var mod = d.modulos[m.n];
      return (mod && (mod.visto || mod.completado)) ||
             (d.subtemas[m.n] || []).some(Boolean) ||
             (d.notas[m.n] || '') !== '';
    });
  }

  // Aviso discreto: el alumno merece saber que está trabajando sin red.
  function _avisoSinConexion(mostrar) {
    var id = 'avisoSinConexion';
    var el = document.getElementById(id);
    if (!mostrar) { if (el) el.remove(); return; }
    if (el || !document.body) return;
    el = document.createElement('div');
    el.id = id;
    el.textContent = 'Trabajando sin conexión · tu avance se guarda en este dispositivo';
    el.setAttribute('style',
      'position:fixed;left:16px;bottom:16px;z-index:90;padding:9px 15px;' +
      'border-radius:999px;background:rgba(17,24,39,0.88);color:#fff;' +
      'font-size:12.5px;font-family:system-ui,-apple-system,sans-serif;' +
      'box-shadow:0 6px 20px rgba(0,0,0,0.18)');
    document.body.appendChild(el);
  }

  function _subir() {
    if (!emailActual) return;
    _guardarRemoto(datos).then(function (ok) {
      pendiente = !ok;
      sinConexion = !ok;
      _avisoSinConexion(!ok);
      if (!ok) {
        clearTimeout(temporizador);
        temporizador = setTimeout(_subir, ESPERA_REINTENTO);  // reintento
      }
    }).catch(function () {
      pendiente = true;
      sinConexion = true;
      _avisoSinConexion(true);
      clearTimeout(temporizador);
      temporizador = setTimeout(_subir, ESPERA_REINTENTO);
    });
  }

  // Cada cambio: caché en memoria → respaldo local inmediato → backend con
  // debounce. Marcar 5 subtemas seguidos = UNA sola llamada al backend.
  function persistir() {
    datos.actualizado = new Date().toISOString();
    _guardarLocal(emailActual, datos);   // el avance NUNCA se pierde
    pendiente = true;
    clearTimeout(temporizador);
    temporizador = setTimeout(_subir, ESPERA_GUARDADO);
  }

  // Si cierra la pestaña con cambios sin subir, un último intento.
  window.addEventListener('pagehide', function () {
    if (pendiente && emailActual) {
      clearTimeout(temporizador);
      _guardarRemoto(datos, true);
    }
  });

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

    // ÚNICA función async de la API. Hace una sola llamada al backend y deja
    // el progreso en memoria; todos los getters siguen siendo SÍNCRONOS, así
    // que las páginas no se rompen ni se congelan esperando a la red.
    init: function (email) {
      emailActual = String(email || emailDelGuard() || '').trim().toLowerCase();

      // Respaldo inmediato: si el backend no contesta, seguimos con esto.
      var local = _sanear(_cargarLocal(emailActual));
      datos = local;

      var self = this;
      var localCrudo = _cargarLocal(emailActual);

      return _cargarRemoto().then(function (r) {
        var remoto = _sanear(r.datos);

        // ¿El respaldo local es MÁS NUEVO que el servidor? Entonces son
        // cambios que nunca llegaron a subir (backend caído, PUT fallido…).
        // Mandan ellos, y los subimos. Nunca se pisa lo del alumno.
        var fechaLocal = localCrudo && localCrudo.actualizado ? Date.parse(localCrudo.actualizado) : 0;
        var fechaRemota = r.datos && r.datos.actualizado ? Date.parse(r.datos.actualizado) : 0;
        var localGana = _tieneAvance(local) && (r.nuevo || fechaLocal > fechaRemota);

        if (localGana) {
          // Migración (backend vacío) o rescate (cambios sin subir).
          datos = local;
          return _guardarRemoto(datos).then(function (ok) {
            if (ok) _borrarLocal(emailActual);
            sinConexion = !ok;
            return self;
          });
        }

        datos = remoto;
        _borrarLocal(emailActual);   // ya vive en el backend
        sinConexion = false;
        return self;
      }).catch(function (e) {
        // Backend caído: el aula sigue funcionando con el respaldo local.
        sinConexion = true;
        _avisoSinConexion(true);
        console.warn('[progreso] Sin backend, usando respaldo local:', e.message);
        return self;
      });
    },

    estaSinConexion: function () { return sinConexion; },

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
