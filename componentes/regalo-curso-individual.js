import { API_SINERGIA, CURSO_RIEGO, PORTADA_RIEGO, CURSOS_INDIVIDUALES } from './cursos-individuales-config.js?v=1';

const CLAVE_NAVEGADOR = 'sinergia_regalo_navegador_v1';
const PORTADA_PROMOCION = '/campus/portadas/riego-promocion.webp';
const NOMBRE = 'Riego Eficiente y Ahorro del Agua';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const leer = clave => { try { return localStorage.getItem(clave); } catch (_) { return null; } };
const escribir = (clave, valor) => { try { localStorage.setItem(clave, valor); } catch (_) {} };

function descripcionContenido(contenido, breve = false) {
  const { clasesDisponibles, clasesTotales, materialesDisponibles, accesoAnticipado } = contenido || {};
  const cantidades = [clasesDisponibles, clasesTotales, materialesDisponibles];
  if (!cantidades.every(n => Number.isSafeInteger(n) && n >= 0) || clasesDisponibles > clasesTotales) return '';
  const materiales = materialesDisponibles + (materialesDisponibles === 1 ? ' material' : ' materiales');
  const disponibilidad = breve ? '' : (materialesDisponibles === 1 ? ' disponible' : ' disponibles');
  if (accesoAnticipado === true && clasesDisponibles < clasesTotales) {
    const restante = breve ? '' : ' Las demás clases están en preparación.';
    return `Acceso anticipado · ${clasesDisponibles} de ${clasesTotales} clases y ${materiales}${disponibilidad}.${restante}`;
  }
  return `${clasesDisponibles} ${clasesDisponibles === 1 ? 'clase' : 'clases'} y ${materiales}${disponibilidad}.`;
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
  if (movimientoReducido.matches || document.visibilityState === 'hidden' || document.querySelector('.sgi-confeti')) return;

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

  const colores = ['#f0b429', '#166534', '#22a05a', '#ffffff', '#f97316', '#fde68a'];
  const piezas = Array.from({ length: 150 }, (_, i) => ({
    x: Math.random() * ancho,
    y: -Math.random() * alto * .7,
    vx: (Math.random() - .5) * 300,
    vy: 120 + Math.random() * 240,
    angulo: Math.random() * Math.PI * 2,
    giro: (Math.random() - .5) * 18,
    ancho: 6 + Math.random() * 6,
    alto: 5 + Math.random() * 6,
    color: colores[i % colores.length]
  }));
  const inicio = performance.now();
  const duracion = 4.5;
  const desvanecer = duracion / 4;
  document.body.append(lienzo);

  function animar(ahora) {
    const t = (ahora - inicio) / 1000;
    if (t >= duracion || movimientoReducido.matches || document.visibilityState === 'hidden') {
      lienzo.remove();
      return;
    }
    dibujo.clearRect(0, 0, ancho, alto);
    dibujo.globalAlpha = Math.min(1, (duracion - t) / desvanecer);
    for (const pieza of piezas) {
      dibujo.save();
      dibujo.translate(pieza.x + pieza.vx * t, pieza.y + pieza.vy * t + 54 * t * t);
      dibujo.rotate(pieza.angulo + pieza.giro * t);
      dibujo.fillStyle = pieza.color;
      dibujo.fillRect(-pieza.ancho / 2, -pieza.alto / 2, pieza.ancho, pieza.alto);
      dibujo.restore();
    }
    requestAnimationFrame(animar);
  }
  requestAnimationFrame(animar);
}

export function regaloCurso(slug) {
  const claveReclamo = 'sinergia_regalo_reclamo_v1_' + slug;
  const detalle = `<p class="sgi-regalo-detalle" data-sgi-contenido hidden><span class="sgi-regalo-amplio"></span><span class="sgi-regalo-breve"></span></p>`;
  const dialogo = document.createElement('dialog');
  const dialogoNativo = typeof dialogo.showModal === 'function';
  dialogo.className = 'sgi-regalo';
  dialogo.setAttribute('aria-labelledby', 'sgi-regalo-titulo');
  dialogo.innerHTML = `
    <div class="sgi-regalo-foto"><img alt=""><span class="sgi-regalo-etiqueta">Curso de regalo</span></div>
    <button class="sgi-cerrar" type="button" aria-label="Cerrar">×</button>
    <div class="sgi-regalo-contenido">
      <h2 id="sgi-regalo-titulo">Llévate gratis ${NOMBRE}</h2>
      <p><span class="sgi-regalo-amplio">Aparta el regalo y paga <b data-sgi-curso></b> en este navegador.</span><span class="sgi-regalo-breve">Aparta el regalo y paga tu inscripción en este navegador.</span></p>
      ${detalle}
      <div class="sgi-tiempo"><span class="sgi-regalo-amplio">Plazo para confirmar tu pago al apartarlo</span><span class="sgi-regalo-breve">Para confirmar tu pago después de apartar</span><b>60 min</b></div>
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
      <div class="sgi-regalo-card-encabezado">
        <span class="sgi-regalo-card-etiqueta">Curso de regalo</span>
        <p class="sgi-regalo-card-titulo"><b>${NOMBRE}</b></p>
      </div>
      <p class="sgi-regalo-card-detalle" data-sgi-contenido hidden></p>
      <div class="sgi-regalo-card-acciones">
        <button class="sgi-regalo-card-btn" type="button" data-sgi-reclamar>Apartar regalo</button>
        <span class="sgi-regalo-card-plazo" data-sgi-card-plazo></span>
      </div>
      <p class="sgi-error" data-sgi-error role="status" hidden>No pudimos apartar tu regalo. Intenta de nuevo.</p>`;
  });

  const superficies = [dialogo, ...tarjetas];
  const botones = superficies.map(n => n.querySelector('[data-sgi-reclamar]'));
  const plazos = tarjetas.map(n => n.querySelector('[data-sgi-card-plazo]'));
  const detalleDialogo = dialogo.querySelector('[data-sgi-contenido]');
  const detallesTarjetas = tarjetas.map(n => n.querySelector('[data-sgi-contenido]'));
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
      const estado = { disponible: true, contenido: descripcionContenido(d.contenido), contenidoBreve: descripcionContenido(d.contenido, true) };
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
    if (estado.contenido) {
      contenido = estado.contenido;
      detalleDialogo.querySelector('.sgi-regalo-amplio').textContent = contenido;
      detalleDialogo.querySelector('.sgi-regalo-breve').textContent = estado.contenidoBreve;
      detalleDialogo.hidden = false;
      detallesTarjetas.forEach(n => {
        n.textContent = estado.contenidoBreve;
        n.hidden = false;
      });
    }
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
    tarjetas.forEach(n => { n.hidden = !mostrar; });
    const leyenda = inscripcion ? 'Paga en ' + tiempo(falta) : '1 h para pagar';
    plazos.forEach(n => {
      if (n.textContent !== leyenda) n.textContent = leyenda;
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
