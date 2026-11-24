const EVENTOS = {
  pagina_visitada: 'Visitas a la página', pagina_tiempo: 'Tiempo en página',
  enlace_abierto: 'Aperturas de oferta', enlace_tiempo: 'Tiempo desde la oferta',
  video_reproducido: 'Reproducciones', video_tiempo: 'Tiempo de reproducción',
  checkout_creado: 'Sesiones de Stripe creadas', checkout_montado: 'Formularios de pago abiertos',
  checkout_tiempo: 'Tiempo en el formulario', compra_pagada: 'Pagos confirmados registrados',
  ya_pague: 'Clics en «Ya compré»'
};
const MEDIDAS = {
  pagina_visitada: 'pagina_tiempo', enlace_abierto: 'enlace_tiempo', video_reproducido: 'video_tiempo',
  checkout_montado: 'checkout_tiempo'
};
const VISTAS = {
  resumen: ['pagina_visitada', 'video_reproducido', 'checkout_montado', 'compra_pagada'],
  visitas: ['pagina_visitada', 'enlace_abierto'], video: ['video_reproducido'],
  pagos: ['checkout_creado', 'checkout_montado', 'compra_pagada']
};
const DISPOSITIVOS = { telefono: 'Teléfono', computadora: 'Computadora', tableta: 'Tableta', desconocido: 'Sin dato' };
const MODOS = { manual: 'Manual', automatico: 'Automática', desconocido: 'Sin dato' };
const FORMATO = new Intl.NumberFormat('es-MX');
const FECHA = new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23' });
const DIA = new Intl.DateTimeFormat('es-MX', { timeZone: 'UTC', day: 'numeric', month: 'short' });
const RUTA = '/admin/panel/cursos/metricas';

const lista = a => Array.isArray(a) ? a : [];
const n = v => Number.isFinite(v) ? Math.max(0, v) : 0;
const numero = v => FORMATO.format(n(v));
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const texto = t => `<p class="sg-ci-nota">${esc(t)}</p>`;
const tarjeta = (titulo, contenido) => `<section class="widget-box sg-ci-widget"><h3>${esc(titulo)}</h3>${contenido}</section>`;
const fecha = v => v && Number.isFinite(+new Date(v)) ? FECHA.format(new Date(v)) : '—';
const dia = v => v && Number.isFinite(+new Date(v + 'T00:00:00Z')) ? DIA.format(new Date(v + 'T00:00:00Z')) : '—';
const dispositivo = v => Object.hasOwn(DISPOSITIVOS, v) ? DISPOSITIVOS[v] : DISPOSITIVOS.desconocido;
const modo = v => Object.hasOwn(MODOS, v) ? MODOS[v] : MODOS.desconocido;
function importe(centavos, moneda) {
  if (!Number.isFinite(centavos) || !/^[a-z]{3}$/i.test(moneda || '')) return '';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda }).format(centavos / 100);
}
function tiempo(v) {
  const s = Math.floor(n(v));
  const h = Math.floor(s / 3600);
  const m = Math.floor(s / 60) % 60;
  return h ? `${numero(h)} h ${m} min` : m ? `${m} min ${s % 60} s` : `${s} s`;
}
function nombre(slug, cursos) {
  if (!slug) return 'Curso sin identificar';
  return cursos.get(slug) || String(slug).replace(/-/g,' ').replace(/^./, letra => letra.toUpperCase());
}
function nombreOrigen(slug, cursos) {
  if (!slug || slug === 'directo') return 'Página directa';
  if (slug === 'sin_atribucion') return 'Sin atribución';
  return 'Desde ' + nombre(slug, cursos);
}
function tabla(titulos, filas) {
  return `<div class="sg-ci-tabla-scroll"><table class="sg-ci-tabla"><thead><tr>${titulos.map(t => `<th scope="col">${esc(t)}</th>`).join('')}</tr></thead><tbody>${filas.map(fila =>
    `<tr>${fila.map((valor, i) => `<td data-label="${esc(titulos[i])}">${valor}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const opcion = (valor, etiqueta, actual) => `<option value="${esc(valor)}"${valor === actual ? ' selected' : ''}>${esc(etiqueta)}</option>`;
const opcionesOrigen = (origenes, cursos, actual) => opcion('', 'Todos los orígenes', actual) +
  [...origenes].map(slug => opcion(slug, nombreOrigen(slug, cursos), actual)).join('');
function filtros(estado, cursos, origenes) {
  return `<form class="widget-box sg-ci-filtros" data-ci-filtros>
    <label>Curso<select name="destinoSlug">${opcion('', 'Todos los cursos', estado.destinoSlug)}${[...cursos.keys()].map(slug => opcion(slug, nombre(slug, cursos), estado.destinoSlug)).join('')}</select></label>
    <label>Origen<select name="origenSlug">${opcionesOrigen(origenes, cursos, estado.origenSlug)}</select></label>
    <label>Periodo<select name="dias">${[7, 30, 90].map(d => opcion(d, 'Últimos ' + d + ' días', estado.dias)).join('')}</select></label>
    <button type="submit" class="btn-secondary">Aplicar filtros</button>
  </form>`;
}

function indicadores(totales = {}, tipos) {
  return '<div class="sg-ci-kpis">' + tipos.map(tipo => {
    const dato = totales[tipo] || {};
    const medida = MEDIDAS[tipo];
    const segundos = medida ? n(totales[medida]?.duracionSeg) : 0;
    return `<article class="widget-box sg-ci-kpi"><span>${EVENTOS[tipo]}</span><strong>${numero(dato.eventos)}</strong>
      <small>${numero(dato.identificados ?? n(dato.personas) - n(dato.anonimos))} identificados · ${numero(dato.anonimos)} anónimos</small>
      ${medida ? `<small>Tiempo medido · ${segundos ? tiempo(segundos) : 'Sin registro'}</small>` : ''}</article>`;
  }).join('') + '</div>';
}
function comparar(datos, cursos, historial, seleccionado) {
  const compras = historial?.compras;
  const medidos = new Map(lista(datos.porCurso).map(c => [c.slug, c.totales]));
  const disponibles = seleccionado ? [seleccionado] : [...cursos.keys()];
  if (!disponibles.length) return tarjeta('Comparativo por curso', texto('Todavía no hay cursos disponibles para comparar.'));
  const tipos = VISTAS.resumen;
  const filas = disponibles.map(slug => {
    const valores = medidos.get(slug) || (seleccionado ? datos.totales : {});
    const comprasCurso = compras?.filter(c => c.curso === slug).length;
    return [esc(nombre(slug, cursos)), ...tipos.map(t => numero(valores?.[t]?.eventos)), comprasCurso === undefined ? '—' : numero(comprasCurso)];
  });
  return tarjeta('Comparativo por curso', texto('La actividad corresponde al periodo seleccionado. Las inscripciones históricas abarcan los registros disponibles.') +
    (!compras ? texto('El historial de inscripciones no está disponible en este momento.') : '') +
    (historial?.truncado ? texto('El historial alcanzó su límite de consulta.') : '') +
    tabla(['Curso', ...tipos.map(t => EVENTOS[t]), 'Inscripciones históricas'], filas));
}
function grafica(serie, tipos, porTiempo) {
  const columnas = porTiempo ? tipos.map(t => MEDIDAS[t]).filter(Boolean) : tipos;
  if (!columnas.length) return '';
  const valor = (d, t) => n(porTiempo ? d.duraciones?.[t] : d[t]);
  const formato = porTiempo ? tiempo : numero;
  const titulo = porTiempo ? 'Tiempo medido por día' : 'Eventos por día';
  const max = Math.max(0, ...serie.map(d => columnas.reduce((s, t) => s + valor(d, t), 0)));
  if (!max) return tarjeta(titulo, texto('Sin registros en el periodo seleccionado.'));
  const barras = serie.map(d => `<div class="sg-ci-barras" title="${esc(dia(d.fecha) + ' · ' + columnas.map(t => EVENTOS[t] + ' ' + formato(valor(d, t))).join(' · '))}">` +
    columnas.map((t, i) => valor(d, t) ? `<i data-color="${i}" style="height:${(100 * valor(d, t) / max).toFixed(2)}%"></i>` : '').join('') + '</div>').join('');
  const salto = Math.max(1, Math.ceil((serie.length - 1) / 4));
  const marcas = serie.map((d, i) => i === serie.length - 1 || (i % salto === 0 && serie.length - 1 - i >= salto / 2)
    ? `<small style="left:${(100 * i / Math.max(1, serie.length - 1)).toFixed(2)}%">${esc(dia(d.fecha))}</small>` : '').join('');
  return tarjeta(titulo, '<div aria-hidden="true"><div class="sg-ci-leyenda">' + columnas.map((t, i) => `<span><i data-color="${i}"></i>${EVENTOS[t]}</span>`).join('') +
    '</div><div class="sg-ci-grafica">' + barras + '</div><div class="sg-ci-eje">' + marcas + '</div></div><details><summary>Valores por día</summary>' +
    tabla(['Día', ...columnas.map(t => EVENTOS[t])], serie.map(d => [esc(dia(d.fecha)), ...columnas.map(t => formato(valor(d, t)))])) + '</details>');
}

function distribucion(filas, tipos, titulo) {
  if (!filas.length) return '';
  return tarjeta(titulo, '<div class="sg-ci-distribucion">' + tipos.map(t => {
    const max = Math.max(1, ...filas.map(f => n(f.totales?.[t]?.eventos)));
    return `<article><h4>${EVENTOS[t]}</h4><dl>${filas.map(f => {
      const cuenta = n(f.totales?.[t]?.eventos);
      const segundos = n(f.totales?.[MEDIDAS[t]]?.duracionSeg);
      return `<div><dt>${esc(f.etiqueta)}</dt><dd><progress value="${cuenta}" max="${max}" aria-label="${esc(f.etiqueta + ' · ' + EVENTOS[t])}"></progress><b>${numero(cuenta)}</b>${segundos ? `<small>${tiempo(segundos)}</small>` : ''}</dd></div>`;
    }).join('')}</dl></article>`;
  }).join('') + '</div>');
}
function embudo(datos) {
  if (!datos) return '';
  const pasos = [['Formularios vinculados', datos.checkoutsMontados], ['Con pago confirmado', datos.checkoutsMontadosPagados], ['Sin pago confirmado', datos.checkoutsMontadosSinConfirmar]];
  return tarjeta('Seguimiento de formularios', texto('Los pagos se cotejan con la misma sesión vinculada dentro del periodo seleccionado.') +
    '<div class="sg-ci-kpis">' + pasos.map(([etiqueta, valor]) => `<article class="sg-ci-kpi"><span>${etiqueta}</span><strong>${numero(valor)}</strong></article>`).join('') + '</div>');
}
function identidad(r) {
  if (r.anonimo || r.identidad === 'visita_anonima') return 'Visita anónima';
  const clase = r.identidad === 'comprador_stripe' ? 'Comprador registrado en Stripe' : r.identidad === 'cuenta_verificada' ? 'Cuenta verificada' : '';
  const nombre = r.nombre || r.email;
  if (!nombre) return esc(clase || 'Sin identificación');
  return `<b>${esc(nombre)}</b>${r.nombre && r.email ? `<small>${esc(r.email)}</small>` : ''}${clase ? `<small>${esc(clase)}</small>` : ''}`;
}
function detalles(titulo, contenido) {
  return `<details class="widget-box sg-ci-widget"><summary>${esc(titulo)}</summary>${contenido}</details>`;
}
function actividad(datos, tipos, cursos) {
  const personas = lista(datos.personas).filter(p => tipos.some(t => n(p.totales?.[t]) || n(p.duraciones?.[MEDIDAS[t]])));
  const eventos = lista(datos.eventos).filter(e => tipos.includes(e.tipo) || tipos.some(t => MEDIDAS[t] === e.tipo));
  return (personas.length ? detalles('Actividad por visitante (' + personas.length + ')',
    (datos.personasTruncadas ? texto('El detalle de visitantes llegó al límite de registros.') : '') + tabla(['Visitante', 'Actividad', 'Dispositivo', 'Último registro'], personas.map(p => [
      identidad(p), tipos.filter(t => p.totales?.[t] || p.duraciones?.[MEDIDAS[t]]).map(t => `<div>${EVENTOS[t]} · ${numero(p.totales?.[t])}${p.duraciones?.[MEDIDAS[t]] ? ` · ${tiempo(p.duraciones[MEDIDAS[t]])}` : ''}</div>`).join(''),
      esc(lista(p.dispositivos).map(dispositivo).join(', ') || 'Sin dato'), esc(fecha(p.ultimoEn))
    ]))) : '') + (eventos.length ? detalles('Eventos recientes (' + eventos.length + ')',
    (datos.detalleTruncado ? texto('El detalle llegó al límite de registros recientes.') : '') + tabla(['Fecha y hora', 'Visitante', 'Evento', 'Curso y origen', 'Dispositivo'], eventos.map(e => {
      const detalle = [e.modo ? modo(e.modo) : '', n(e.duracionSeg) ? tiempo(e.duracionSeg) : '',
        e.tipo === 'compra_pagada' ? importe(e.montoCentavos, e.moneda) : ''].filter(Boolean).join(' · ');
      return [esc(fecha(e.fechaEn)), identidad(e), esc(EVENTOS[e.tipo]) + (detalle ? `<small>${esc(detalle)}</small>` : ''),
        esc(nombre(e.destinoSlug, cursos)) + `<small>${esc(nombreOrigen(e.origenSlug, cursos))}</small>`, esc(dispositivo(e.dispositivo))];
    }))) : '');
}

export function crearMetricasCursos({ contenedor, pedir, historial }) {
  const cursos = new Map();
  const filtro = { dias: 30, origenSlug: '', destinoSlug: '' };
  let ofertas = [];
  let pestaña = 'resumen';
  let peticion = 0;
  let vigente = null;
  const interacciones = new AbortController();
  function origenesValidos(destino) {
    return new Set(ofertas.filter(e => !destino || e.destinoSlug === destino).map(e => e.origenSlug || 'directo'));
  }
  const formulario = () => filtros(filtro, cursos, origenesValidos(filtro.destinoSlug));

  function cargar(forzar = false) {
    const params = new URLSearchParams({ dias: filtro.dias });
    if (filtro.destinoSlug) params.set('destinoSlug', filtro.destinoSlug);
    if (filtro.origenSlug) params.set('origenSlug', filtro.origenSlug);
    const clave = params.toString();
    if (!forzar && vigente?.clave === clave && vigente.hasta > Date.now()) return vigente.promesa;
    const promesa = pedir(RUTA + '?' + clave).then(datos => {
      if (!datos.totales || !Array.isArray(datos.serie)) throw new Error('Respuesta de actividad incompleta');
      return datos;
    }).catch(e => { if (vigente?.promesa === promesa) vigente = null; throw e; });
    vigente = { clave, hasta: Date.now() + 60000, promesa };
    return promesa;
  }

  async function abrir(tab, forzar) {
    pestaña = Object.hasOwn(VISTAS, tab) ? tab : 'resumen';
    const id = ++peticion;
    contenedor.innerHTML = formulario() + '<p class="widget-box" role="status">Cargando la actividad…</p>';
    try {
      const [datos, compras] = await Promise.all([cargar(forzar), pestaña === 'resumen' ? historial().catch(() => null) : null]);
      if (id !== peticion) return;
      lista(datos.cursos).forEach(c => { if (c.slug) cursos.set(c.slug, c.titulo || cursos.get(c.slug)); });
      lista(datos.porCurso).forEach(c => { if (c.slug && !cursos.has(c.slug)) cursos.set(c.slug, c.titulo); });
      ofertas = lista(datos.ofertas);
      ofertas.forEach(e => {
        if (e?.destinoSlug && !cursos.has(e.destinoSlug)) cursos.set(e.destinoSlug, e.titulo);
      });
      const tipos = pestaña === 'pagos' && n(datos.totales.ya_pague?.eventos) ? [...VISTAS.pagos, 'ya_pague'] : VISTAS[pestaña];
      const dispositivos = lista(datos.dispositivos).map(d => ({ etiqueta: dispositivo(d.dispositivo), totales: d.totales }));
      const modos = lista(datos.porModoVideo).map(d => ({ etiqueta: modo(d.modo), totales: d.totales }));
      const origenes = lista(datos.origenes).map(o => ({ etiqueta: nombreOrigen(o.origenSlug, cursos), totales: o.totales }));
      const nota = pestaña === 'pagos' ? 'El formulario se registra cuando la página inicia Stripe. La actividad de pago incluye sesiones con seguimiento autorizado. En Inscripciones está el historial de los cursos.' :
        pestaña === 'video' ? 'Se cuentan los inicios de reproducción y el tiempo medido mientras el video estaba visible.' :
        'Las aperturas de oferta pueden formar parte de las visitas a página. Los registros anónimos se cuentan por visita.';
      contenedor.innerHTML = formulario() + indicadores(datos.totales, tipos) +
        texto(nota + ' Horario de Ciudad de México. La actividad anterior a la medición no está disponible.') +
        (datos.truncado ? '<p class="widget-box" role="status">La consulta llegó al límite de registros. Acorta el periodo para revisar los totales.</p>' : '') +
        (pestaña === 'resumen' ? comparar(datos, cursos, compras, filtro.destinoSlug) : '') +
        (pestaña === 'pagos' ? embudo(datos.embudo) : '') + grafica(datos.serie, tipos, false) + grafica(datos.serie, tipos, true) +
        distribucion(dispositivos, tipos, 'Actividad por dispositivo') + (pestaña === 'video' ? distribucion(modos, tipos, 'Inicio de reproducción') : '') +
        (pestaña === 'visitas' ? distribucion(origenes, tipos, 'Origen de las visitas') : '') + actividad(datos, tipos, cursos);
    } catch (error) {
      const mensaje = error?.status === 401 || error?.status === 403
        ? 'Tu cuenta no tiene permiso para consultar la actividad de cursos individuales.'
        : 'No se pudo cargar la actividad. Vuelve a aplicar los filtros para reintentar.';
      if (id === peticion) contenedor.innerHTML = formulario() + `<p class="widget-box" role="alert">${mensaje}</p>`;
    }
  }

  contenedor.addEventListener('change', e => {
    if (!e.target.matches('select[name="destinoSlug"]')) return;
    const origen = e.target.form.elements.origenSlug;
    origen.innerHTML = opcionesOrigen(origenesValidos(e.target.value), cursos, origen.value);
  }, { signal: interacciones.signal });
  contenedor.addEventListener('submit', e => {
    if (!e.target.matches('[data-ci-filtros]')) return;
    e.preventDefault();
    const form = new FormData(e.target);
    filtro.dias = Number(form.get('dias'));
    filtro.destinoSlug = String(form.get('destinoSlug') || '');
    filtro.origenSlug = String(form.get('origenSlug') || '');
    abrir(pestaña, true);
  }, { signal: interacciones.signal });
  function cerrar() {
    peticion++;
    vigente = null;
    interacciones.abort();
  }
  return { abrir, cerrar };
}
