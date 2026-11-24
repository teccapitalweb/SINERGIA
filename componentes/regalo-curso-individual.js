import { API_SINERGIA, CURSO_RIEGO, PORTADA_RIEGO, CURSOS_INDIVIDUALES } from './cursos-individuales-config.js?v=1';

const CLAVE_NAVEGADOR = 'sinergia_regalo_navegador_v1';
const leer = clave => { try { return localStorage.getItem(clave); } catch (_) { return null; } };
const escribir = (clave, valor) => { try { localStorage.setItem(clave, valor); } catch (_) {} };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function regaloCurso(slug) {
  const claveReclamo = 'sinergia_regalo_reclamo_v1_' + slug;
  const dialogo = document.createElement('dialog');
  if (typeof dialogo.showModal !== 'function') return null;

  dialogo.className = 'sgi-regalo';
  dialogo.setAttribute('aria-labelledby', 'sgi-regalo-titulo');
  dialogo.innerHTML = `
    <img src="${PORTADA_RIEGO}" alt="">
    <button class="sgi-cerrar" type="button" aria-label="Cerrar">×</button>
    <div class="sgi-regalo-contenido">
      <p class="sgi-tag">Curso de regalo</p>
      <h2 id="sgi-regalo-titulo">Riego Eficiente y Ahorro del Agua</h2>
      <p>Activa el regalo y paga <b data-sgi-curso></b> en este navegador. Tienes hasta una hora desde la primera activación para que se confirme el pago.</p>
      <div class="sgi-tiempo"><span>Plazo al activar</span><b>60 minutos</b></div>
      <button class="sgi-btn" type="button" data-sgi-reclamar>Quiero mi lugar</button>
      <p class="sgi-error" data-sgi-error aria-live="polite" hidden>No pudimos activar tu regalo. Intenta de nuevo.</p>
      <button class="sgi-omitir" type="button">Ahora no</button>
    </div>`;
  dialogo.querySelector('[data-sgi-curso]').textContent = CURSOS_INDIVIDUALES[slug].titulo;
  const cinta = document.createElement('aside');
  cinta.className = 'sgi-cinta';
  cinta.hidden = true;
  cinta.innerHTML = '<span><b>¡Riego Eficiente apartado!</b> Confirma tu pago en <strong role="timer" data-sgi-reloj></strong> para recibirlo.</span><button type="button">Inscribirme</button>';
  document.body.prepend(cinta);
  document.body.append(dialogo);
  const reloj = cinta.querySelector('[data-sgi-reloj]');
  const activar = dialogo.querySelector('[data-sgi-reclamar]');
  const mensajeError = dialogo.querySelector('[data-sgi-error]');
  const nombreRegalo = 'Riego Eficiente y Ahorro del Agua';
  let navegadorId, reserva = null, reclamo = leerReclamo(), rechazo = false;
  let listo = false, consultado = false, solicitando = false, disponible = false, presentado = false, tic = null, notaPago = null;

  function leerReclamo() {
    try {
      const dato = JSON.parse(leer(claveReclamo));
      return dato && UUID.test(dato.navegadorId) && typeof dato.token === 'string' && dato.token &&
        Number.isFinite(dato.vence) && Number.isFinite(dato.desfase) ? dato : null;
    } catch (_) { return null; }
  }

  function recordarReclamo() {
    const { token, vence, desfase, navegadorId } = reserva;
    reclamo = { token, vence, desfase, navegadorId };
    escribir(claveReclamo, JSON.stringify(reclamo));
  }

  function idNavegador() {
    if (navegadorId) return navegadorId;
    const id = leer(CLAVE_NAVEGADOR);
    navegadorId = reclamo?.navegadorId || (UUID.test(id) ? id : globalThis.crypto?.randomUUID?.());
    if (navegadorId) escribir(CLAVE_NAVEGADOR, navegadorId);
    return navegadorId;
  }

  function restante(dato) {
    if (!dato) return 0;
    const porReloj = dato.vence - Date.now() - dato.desfase;
    return Math.max(0, Math.min(porReloj, dato.limite === undefined ? porReloj : dato.limite - performance.now()));
  }

  async function apartar(id, soloConsultar = false) {
    const cancelar = new AbortController();
    const timeout = setTimeout(() => cancelar.abort(), 4500);
    const desde = performance.now();
    try {
      const r = await fetch(API_SINERGIA + '/publico/cursos/regalo/apartar', {
        method: 'POST', cache: 'no-store', signal: cancelar.signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoSlug: slug, navegadorId: id, ...(soloConsultar ? { soloConsultar: true } : {}) })
      });
      if (!r.ok) {
        rechazo = r.status >= 400 && r.status < 500 && ![408, 429].includes(r.status);
        return null;
      }
      const d = await r.json();
      if (d.regaloDisponible === false) { rechazo = true; return null; }
      if (d.regaloDisponible !== true || d.regaloSlug !== CURSO_RIEGO) return null;
      if (soloConsultar) {
        const disponible = !d.venceEn || d.activo === true;
        rechazo = !disponible;
        return { disponible };
      }
      if (d.activo === false) { rechazo = true; return null; }
      if (d.activo !== true) return null;
      rechazo = false;
      const vence = Date.parse(d.venceEn);
      const ahora = Date.parse(d.ahora);
      if (!d.token || typeof d.token !== 'string' || !Number.isFinite(vence) || !Number.isFinite(ahora)) return null;
      return { token: d.token, navegadorId: id, vence, limite: desde + vence - ahora, desfase: ahora + (performance.now() - desde) - Date.now() };
    } catch (_) {
      return null;
    } finally { clearTimeout(timeout); }
  }

  const pagoAbierto = () => document.getElementById('payOverlay')?.classList.contains('open');
  function pintar() {
    const falta = restante(reserva);
    const reclamado = reclamo && reserva && reclamo.navegadorId === reserva.navegadorId;
    cinta.hidden = !(falta > 0 && reclamado && !pagoAbierto());
    if (dialogo.open && (rechazo || (reserva && !falta) || reclamado || pagoAbierto())) dialogo.close();
    if (notaPago && !notaPago.nodo.isConnected) notaPago = null;
    if (notaPago) {
      const ms = restante(notaPago.dato);
      notaPago.nodo.textContent = ms ?
        'Tu pago debe confirmarse antes de que venza el plazo para recibir ' + nombreRegalo + '.' :
        'Terminó el plazo del regalo. Puedes continuar con tu inscripción.';
      if (!ms) notaPago = null;
    }
    clearTimeout(tic);
    const seg = Math.ceil(falta / 1000);
    reloj.textContent = String(Math.floor(seg / 60)).padStart(2, '0') + ':' + String(seg % 60).padStart(2, '0');
    const espera = falta || (notaPago ? restante(notaPago.dato) : 0);
    if (espera) tic = setTimeout(pintar, Math.min(1000, espera));
  }

  async function presentar() {
    if (!listo || pagoAbierto() || document.visibilityState === 'hidden' || solicitando) return;
    if (!consultado) {
      const id = idNavegador();
      if (!id) return;
      consultado = solicitando = true;
      const soloConsultar = !reclamo;
      const resultado = await apartar(id, soloConsultar);
      solicitando = false;
      if (id !== navegadorId) return presentar();
      if (soloConsultar) disponible = resultado?.disponible === true;
      else {
        reserva = resultado;
        if (reserva && reclamo?.navegadorId === id) recordarReclamo();
      }
      pintar();
    }
    if (presentado || reclamo || !disponible || pagoAbierto() || document.visibilityState === 'hidden') return;
    presentado = true;
    dialogo.showModal();
  }

  function sincronizar() { pintar(); presentar(); }

  for (const boton of dialogo.querySelectorAll('.sgi-cerrar, .sgi-omitir')) boton.addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('click', ev => { if (ev.target === dialogo) dialogo.close(); });
  activar.addEventListener('click', async () => {
    if (!dialogo.open || !disponible || activar.disabled) return;
    activar.disabled = true;
    activar.textContent = 'Activando…';
    mensajeError.hidden = true;
    const id = idNavegador();
    const nueva = await apartar(id);
    activar.disabled = false;
    activar.textContent = 'Quiero mi lugar';
    if (id !== navegadorId) return;
    reserva = nueva;
    if (restante(reserva)) recordarReclamo();
    else mensajeError.hidden = false;
    pintar();
    if (!cinta.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  cinta.querySelector('button').addEventListener('click', () => document.querySelector('.js-buy')?.click());
  document.addEventListener('visibilitychange', sincronizar);
  window.addEventListener('pageshow', sincronizar);
  window.addEventListener('online', () => {
    if (!reserva && !rechazo && !solicitando) consultado = false;
    sincronizar();
  });
  window.addEventListener('storage', ev => {
    if (ev.key !== claveReclamo) return;
    reclamo = leerReclamo();
    if (reclamo && reclamo.navegadorId !== navegadorId) {
      navegadorId = reclamo.navegadorId;
      consultado = rechazo = false;
      disponible = false;
      reserva = null;
    }
    sincronizar();
  });
  setTimeout(() => { listo = true; presentar(); }, 1500);

  return {
    sincronizar,
    datosCheckout() {
      const dato = !rechazo && reclamo && (reserva || reclamo);
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
