import { API_SINERGIA, CURSO_RIEGO, PORTADA_RIEGO, CURSOS_INDIVIDUALES } from './cursos-individuales-config.js?v=1';

const CLAVE_NAVEGADOR = 'sinergia_regalo_navegador_v1';
const PORTADA_PROMOCION = '/campus/portadas/riego-promocion.webp';
const NOMBRE = 'Riego Eficiente y Ahorro del Agua';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const leer = clave => { try { return localStorage.getItem(clave); } catch (_) { return null; } };
const escribir = (clave, valor) => { try { localStorage.setItem(clave, valor); } catch (_) {} };

function descripcionContenido(contenido) {
  const { clasesDisponibles, clasesTotales, materialesDisponibles, accesoAnticipado } = contenido || {};
  const cantidades = [clasesDisponibles, clasesTotales, materialesDisponibles];
  if (!cantidades.every(n => Number.isSafeInteger(n) && n >= 0) || clasesDisponibles > clasesTotales) return '';
  const materiales = materialesDisponibles + (materialesDisponibles === 1 ? ' material disponible' : ' materiales disponibles');
  if (accesoAnticipado === true && clasesDisponibles < clasesTotales) {
    return `Acceso anticipado · ${clasesDisponibles} de ${clasesTotales} clases y ${materiales}. Las demás clases están en preparación.`;
  }
  return `${clasesDisponibles} ${clasesDisponibles === 1 ? 'clase' : 'clases'} y ${materiales}.`;
}

function restante(dato) {
  if (!dato) return 0;
  const porReloj = dato.vence - Date.now() - dato.desfase;
  return Math.max(0, Math.min(porReloj, dato.limite === undefined ? porReloj : dato.limite - performance.now()));
}

function tiempo(ms) {
  const segundos = Math.ceil(ms / 1000);
  return String(Math.floor(segundos / 60)).padStart(2, '0') + ':' + String(segundos % 60).padStart(2, '0');
}

function prepararFoto(nodo) {
  const foto = nodo.querySelector('img');
  foto.addEventListener('error', () => { foto.src = PORTADA_RIEGO; }, { once: true });
  foto.src = PORTADA_PROMOCION;
}

function celebrarReserva() {
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (movimientoReducido.matches || document.visibilityState === 'hidden') return;

  const lienzo = document.createElement('canvas');
  const dibujo = lienzo.getContext('2d');
  if (!dibujo) return;

  const ancho = window.innerWidth;
  const alto = window.innerHeight;
  const escala = Math.min(window.devicePixelRatio || 1, 2);
  lienzo.className = 'sgi-confeti';
  lienzo.setAttribute('aria-hidden', 'true');
  lienzo.width = ancho * escala;
  lienzo.height = alto * escala;
  dibujo.scale(escala, escala);

  const colores = ['#167348', '#55a457', '#ffd263', '#208ab0', '#f29853'];
  const piezas = Array.from({ length: ancho < 600 ? 48 : 72 }, (_, i) => ({
    x: ancho * (.47 + Math.random() * .06),
    y: alto * (.4 + Math.random() * .04),
    vx: (Math.random() - .5) * Math.min(ancho * 1.15, 720),
    vy: -140 - Math.random() * 310,
    giro: (Math.random() - .5) * 14,
    ancho: 5 + Math.random() * 4,
    color: colores[i % colores.length]
  }));
  const inicio = performance.now();
  const duracion = 2.1;
  document.body.append(lienzo);

  function animar(ahora) {
    const t = (ahora - inicio) / 1000;
    if (t >= duracion || movimientoReducido.matches || document.visibilityState === 'hidden') {
      lienzo.remove();
      return;
    }
    dibujo.clearRect(0, 0, ancho, alto);
    dibujo.globalAlpha = Math.min(1, (duracion - t) / .5);
    for (const pieza of piezas) {
      dibujo.save();
      dibujo.translate(pieza.x + pieza.vx * t, pieza.y + pieza.vy * t + 260 * t * t);
      dibujo.rotate(pieza.giro * t);
      dibujo.fillStyle = pieza.color;
      dibujo.fillRect(0, 0, pieza.ancho, pieza.ancho * .6);
      dibujo.restore();
    }
    requestAnimationFrame(animar);
  }
  requestAnimationFrame(animar);
}

export function regaloCurso(slug) {
  const claveReclamo = 'sinergia_regalo_reclamo_v1_' + slug;
  const dialogo = document.createElement('dialog');
  const dialogoNativo = typeof dialogo.showModal === 'function';
  dialogo.className = 'sgi-regalo';
  dialogo.setAttribute('aria-labelledby', 'sgi-regalo-titulo');
  dialogo.innerHTML = `
    <div class="sgi-regalo-foto"><img alt=""><span class="sgi-regalo-etiqueta">Curso de regalo</span></div>
    <button class="sgi-cerrar" type="button" aria-label="Cerrar">×</button>
    <div class="sgi-regalo-contenido">
      <h2 id="sgi-regalo-titulo">Llévate gratis ${NOMBRE}</h2>
      <p>Aparta el regalo y paga <b data-sgi-curso></b> en este navegador.</p>
      <p class="sgi-regalo-detalle" data-sgi-contenido hidden></p>
      <div class="sgi-tiempo"><span>Plazo para confirmar tu pago al apartarlo</span><b>60 min</b></div>
      <button class="sgi-btn" type="button" data-sgi-reclamar>Quiero mi lugar</button>
      <p class="sgi-error" data-sgi-error role="status" hidden>No pudimos apartar tu regalo. Intenta de nuevo.</p>
      <button class="sgi-omitir" type="button">Ahora no</button>
    </div>`;
  dialogo.querySelector('[data-sgi-curso]').textContent = CURSOS_INDIVIDUALES[slug].titulo;
  if (!dialogoNativo) dialogo.hidden = true;

  const cinta = document.createElement('aside');
  cinta.className = 'sgi-cinta';
  cinta.hidden = true;
  cinta.setAttribute('aria-label', 'Plazo del regalo');
  cinta.innerHTML = '<span><b>¡Riego Eficiente apartado!</b> Confirma tu pago en <strong role="timer" data-sgi-reloj></strong> para recibirlo.</span><button type="button">Inscribirme</button>';
  document.body.prepend(cinta);
  document.body.append(dialogo);

  const tarjetas = [...document.querySelectorAll('[data-sgi-regalo-card]')];
  tarjetas.forEach(tarjeta => {
    tarjeta.classList.add('sgi-regalo-card');
    tarjeta.innerHTML = `<div class="sgi-regalo-foto"><img alt="" decoding="async" loading="lazy"></div>
      <div class="sgi-regalo-card-texto">
        <span class="sgi-regalo-etiqueta">Curso de regalo</span>
        <p class="sgi-regalo-card-titulo"><b>${NOMBRE}</b></p>
        <p data-sgi-card-plazo></p>
        <p class="sgi-regalo-detalle" data-sgi-contenido hidden></p>
        <button class="sgi-regalo-card-btn" type="button" data-sgi-reclamar>Apartar regalo</button>
        <p class="sgi-error" data-sgi-error role="status" hidden>No pudimos apartar tu regalo. Intenta de nuevo.</p>
      </div>`;
  });

  const superficies = [dialogo, ...tarjetas];
  const botones = superficies.map(n => n.querySelector('[data-sgi-reclamar]'));
  const plazos = tarjetas.map(n => n.querySelector('[data-sgi-card-plazo]'));
  const detalles = superficies.map(n => n.querySelector('[data-sgi-contenido]'));
  const errores = superficies.map(n => n.querySelector('[data-sgi-error]'));
  const reloj = cinta.querySelector('[data-sgi-reloj]');
  let navegadorId, reserva = null, reclamo = leerReclamo(), notaPago = null, activacion = null;
  let consultado = false, solicitando = false, activando = false, disponible = false, rechazado = false;
  let listo = false, presentado = false, tic = null, contenido = '';

  function leerReclamo() {
    try {
      const dato = JSON.parse(leer(claveReclamo));
      return dato && UUID.test(dato.navegadorId) && typeof dato.token === 'string' && dato.token &&
        Number.isFinite(dato.vence) && Number.isFinite(dato.desfase) ? dato : null;
    } catch (_) { return null; }
  }

  function recordarReclamo() {
    const { token, vence, desfase, navegadorId: id } = reserva;
    reclamo = { token, vence, desfase, navegadorId: id };
    const serializado = JSON.stringify(reclamo);
    if (leer(claveReclamo) !== serializado) escribir(claveReclamo, serializado);
  }

  function idNavegador() {
    if (navegadorId) return navegadorId;
    const id = leer(CLAVE_NAVEGADOR);
    navegadorId = reclamo?.navegadorId || (UUID.test(id) ? id : globalThis.crypto?.randomUUID?.());
    if (navegadorId) escribir(CLAVE_NAVEGADOR, navegadorId);
    return navegadorId;
  }

  async function consultar(id, soloConsultar) {
    const cancelar = new AbortController();
    const timeout = setTimeout(() => cancelar.abort(), 4500);
    const desde = performance.now();
    try {
      const r = await fetch(API_SINERGIA + '/publico/cursos/regalo/apartar', {
        method: 'POST', cache: 'no-store', signal: cancelar.signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoSlug: slug, navegadorId: id, ...(soloConsultar ? { soloConsultar: true } : {}) })
      });
      if (!r.ok) return r.status >= 400 && r.status < 500 && ![408, 429].includes(r.status) ? { disponible: false } : null;
      const d = await r.json();
      if (d.regaloSlug !== CURSO_RIEGO || typeof d.regaloDisponible !== 'boolean') return null;
      if (!d.regaloDisponible || (d.venceEn && d.activo !== true)) return { disponible: false };
      const estado = { disponible: true, contenido: descripcionContenido(d.contenido) };
      if (d.activo !== true) return estado;
      const vence = Date.parse(d.venceEn);
      const ahora = Date.parse(d.ahora);
      if (typeof d.token !== 'string' || !d.token || !Number.isFinite(vence) || !Number.isFinite(ahora)) return null;
      estado.reserva = { token: d.token, navegadorId: id, vence, limite: desde + vence - ahora, desfase: ahora + (performance.now() - desde) - Date.now() };
      return estado;
    } catch (_) { return null; }
    finally { clearTimeout(timeout); }
  }

  function aplicar(estado) {
    if (!estado) return;
    rechazado = !estado.disponible;
    disponible = estado.disponible;
    reserva = estado.reserva || null;
    if (reserva) recordarReclamo();
    if (estado.contenido) contenido = estado.contenido;
    detalles.forEach(n => { n.textContent = contenido; n.hidden = !contenido; });
    if (disponible) superficies.forEach(n => { if (!n.querySelector('img').hasAttribute('src')) prepararFoto(n); });
  }

  const pagoAbierto = () => document.getElementById('payOverlay')?.classList.contains('open');
  const abrirPago = () => document.querySelector('.js-buy')?.click();
  const medirCinta = () => {
    if (!cinta.hidden) document.body.style.setProperty('--sgi-cinta-alto', cinta.offsetHeight + 'px');
  };
  function pintar() {
    const falta = restante(reserva);
    const mostrar = disponible && (!reserva || falta > 0);
    const inscripcion = Boolean(falta);
    const mostrarCinta = mostrar && inscripcion && !pagoAbierto();
    if (cinta.hidden === mostrarCinta) {
      cinta.hidden = !mostrarCinta;
      document.body.classList.toggle('sgi-reserva-activa', mostrarCinta);
      medirCinta();
    }
    tarjetas.forEach((n, i) => {
      n.hidden = !mostrar;
      const leyenda = inscripcion ? 'Apartado · confirma tu pago en ' + tiempo(falta) + '.' :
        'Aparta el regalo y confirma tu pago en 60 minutos.';
      if (plazos[i].textContent !== leyenda) plazos[i].textContent = leyenda;
    });
    botones.forEach((b, i) => {
      b.disabled = activando;
      const titulo = activando ? 'Apartando…' : i === 0 ? 'Quiero mi lugar' : inscripcion ? 'Inscribirme' : 'Apartar regalo';
      if (b.textContent !== titulo) b.textContent = titulo;
    });
    if (dialogo.open && (!mostrar || inscripcion || pagoAbierto())) dialogo.close();
    if (notaPago && !notaPago.nodo.isConnected) notaPago = null;
    if (notaPago) {
      const vigente = restante(notaPago.dato) > 0;
      const mensaje = vigente ? `Confirma tu pago antes de que venza el plazo para recibir ${NOMBRE}.${contenido ? ' ' + contenido : ''}` :
        'Terminó el plazo del regalo. Puedes continuar con tu inscripción.';
      if (notaPago.nodo.textContent !== mensaje) notaPago.nodo.textContent = mensaje;
      if (!vigente) notaPago = null;
    }
    const lectura = tiempo(falta);
    if (reloj.textContent !== lectura) reloj.textContent = lectura;
    clearTimeout(tic);
    const espera = falta || (notaPago ? restante(notaPago.dato) : 0);
    if (espera) tic = setTimeout(pintar, Math.min(1000, espera));
  }

  async function presentar() {
    if (document.visibilityState === 'hidden' || solicitando || activando) return;
    if (!consultado) {
      const id = idNavegador();
      if (!id) return;
      consultado = solicitando = true;
      const estado = await consultar(id, true);
      solicitando = false;
      if (id !== navegadorId || !consultado) return presentar();
      aplicar(estado);
      pintar();
    }
    if (!dialogoNativo || !listo || presentado || reserva || !disponible || pagoAbierto() || document.visibilityState === 'hidden') return;
    presentado = true;
    dialogo.showModal();
  }

  function sincronizar() { pintar(); presentar(); }

  async function activar() {
    if (restante(reserva)) return abrirPago();
    if (!disponible || activando || rechazado) return;
    activando = true;
    errores.forEach(n => { n.hidden = true; });
    pintar();
    const id = idNavegador();
    activacion = consultar(id, false);
    const estado = await activacion;
    activacion = null;
    activando = false;
    if (id !== navegadorId) return sincronizar();
    const confirmada = estado?.disponible && restante(estado.reserva) > 0;
    const repetida = confirmada && [reclamo, leerReclamo()].some(dato => dato?.token === estado.reserva.token);
    aplicar(estado);
    if (!restante(reserva)) errores.forEach(n => { n.hidden = false; });
    pintar();
    if (confirmada && !repetida) celebrarReserva();
  }

  for (const b of botones) b.addEventListener('click', activar);
  for (const b of dialogo.querySelectorAll('.sgi-cerrar, .sgi-omitir')) b.addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('click', e => { if (e.target === dialogo) dialogo.close(); });
  cinta.querySelector('button').addEventListener('click', abrirPago);
  document.addEventListener('visibilitychange', sincronizar);
  window.addEventListener('pageshow', sincronizar);
  window.addEventListener('resize', medirCinta);
  if (typeof ResizeObserver === 'function') new ResizeObserver(medirCinta).observe(cinta);
  window.addEventListener('online', () => {
    if (!reserva && !rechazado && !solicitando) consultado = false;
    sincronizar();
  });
  window.addEventListener('storage', e => {
    if (e.key !== claveReclamo) return;
    const dato = leerReclamo();
    if (dato && dato.navegadorId === reclamo?.navegadorId && dato.token === reclamo.token) return;
    reclamo = dato;
    navegadorId = dato?.navegadorId || navegadorId;
    consultado = false;
    sincronizar();
  });
  presentar();
  setTimeout(() => { listo = true; presentar(); }, 1500);

  return {
    sincronizar,
    async datosCheckout() {
      if (activacion) await activacion;
      const dato = !rechazado && (reserva || reclamo);
      return restante(dato) ? { regaloToken: dato.token, navegadorId: dato.navegadorId } : {};
    },
    confirmarPago(regalo, nodo) {
      const dato = reserva || reclamo;
      if (!dato || !nodo || regalo?.regaloSlug !== CURSO_RIEGO || Date.parse(regalo.venceEn) !== dato.vence) return;
      notaPago = { dato, nodo };
      pintar();
    }
  };
}
