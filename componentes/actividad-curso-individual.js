import { API_SINERGIA } from './cursos-individuales-config.js?v=1';

function dispositivoActual() {
  const ua = navigator.userAgent || '';
  const plataforma = navigator.userAgentData?.platform || '';
  const android = /Android/i.test(ua) || /^Android$/i.test(plataforma);
  const movil = /Mobile/i.test(ua) || navigator.userAgentData?.mobile === true;
  const ipadEscritorio = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  if (ipadEscritorio || /iPad|Tablet|PlayBook|Silk/i.test(ua) || (android && !movil)) return 'tableta';
  if (movil || /iPhone|iPod|Windows Phone|IEMobile/i.test(ua)) return 'telefono';
  if (/Windows NT|Macintosh|X11|CrOS/i.test(ua) || /^(Windows|macOS|Linux|Chrome OS)$/i.test(plataforma)) return 'computadora';
  return 'desconocido';
}

function permiteEstadisticas() {
  const permiso = window.sinergiaCookies?.consentimiento();
  return navigator.doNotTrack !== '1' && window.doNotTrack !== '1' && navigator.msDoNotTrack !== '1' &&
    permiso?.estadisticas === true && permiso.cursosIndividuales === true;
}

export function actividadCurso(destinoSlug, origenSlug, obtenerToken) {
  const uuid = () => globalThis.crypto?.randomUUID?.();
  const dispositivo = dispositivoActual();
  let visitaId, pagina, referido, checkout, reproduccion, identidad, pagoAbierto = false;
  const relojes = new Set();

  function datosCheckout() {
    if (!permiteEstadisticas()) return {};
    visitaId ||= uuid();
    return visitaId ? { visitaId, dispositivo, ...(origenSlug ? { atribucionOrigen: origenSlug } : {}) } : {};
  }

  async function enviar(token, tipo, eventoId, datos = {}) {
    if (!eventoId || !visitaId || !permiteEstadisticas()) return false;
    const credencial = await token;
    if (!permiteEstadisticas()) return false;
    const body = JSON.stringify({ destinoSlug, ...(origenSlug ? { origenSlug } : {}),
      visitaId, dispositivo, tipo, eventoId, ...datos });
    try {
      const r = await fetch(API_SINERGIA + '/publico/cursos/actividad', {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', ...(credencial ? { Authorization: 'Bearer ' + credencial } : {}) }, body
      });
      return r.ok;
    } catch (_) { return false; }
  }

  function medir(inicio, tiempo, eventoId, datos = {}) {
    const token = identidad ||= obtenerToken();
    let acumulado = 0, desde = null, enviado = 0;
    const registrado = enviar(token, inicio, eventoId, datos);
    const reloj = {
      cambiar(activo) {
        const ahora = performance.now();
        if (desde !== null) acumulado += ahora - desde;
        desde = activo ? ahora : null;
      },
      actualizar() {
        const duracionSeg = Math.min(3600, Math.floor((acumulado + (desde === null ? 0 : performance.now() - desde)) / 1000));
        if (duracionSeg <= enviado) return;
        enviado = duracionSeg;
        registrado.then(ok => {
          if (ok) return enviar(token, tiempo, eventoId, { duracionSeg, ...(datos.sessionId ? { sessionId: datos.sessionId } : {}) });
        });
      },
      cerrar() {
        reloj.cambiar(false);
        reloj.actualizar();
        relojes.delete(reloj);
      }
    };
    relojes.add(reloj);
    return reloj;
  }

  const video = document.querySelector('.hero-video-wrapper video, #heroVideo, #hn2-vid');
  let visible = false, reproduciendo = Boolean(video && !video.paused && video.readyState >= 3);
  let intentoManual = -Infinity, modo = 'automatico';
  function sincronizar() {
    const acepta = Boolean(datosCheckout().visitaId);
    const mirando = acepta && document.visibilityState !== 'hidden';
    if (acepta && !pagina) {
      pagina = medir('pagina_visitada', 'pagina_tiempo', visitaId);
      if (origenSlug) referido = medir('enlace_abierto', 'enlace_tiempo', uuid());
    }
    const enLanding = mirando && !pagoAbierto;
    const videoActivo = enLanding && visible && reproduciendo;
    if (videoActivo && !reproduccion) reproduccion = medir('video_reproducido', 'video_tiempo', uuid(), { modo });
    pagina?.cambiar(enLanding);
    referido?.cambiar(enLanding);
    reproduccion?.cambiar(videoActivo);
    checkout?.cambiar(mirando && pagoAbierto);
    relojes.forEach(r => r.actualizar());
  }
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entrada]) => {
      visible = entrada.intersectionRatio >= .35;
      sincronizar();
    }, { threshold: [.35] }).observe(video);
    function intencion(ev) { if (ev.isTrusted && video.paused) intentoManual = performance.now(); }
    video.addEventListener('pointerdown', intencion, true);
    video.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') intencion(ev); }, true);
    document.getElementById('soundBtn')?.addEventListener('click', intencion, true);
    video.addEventListener('play', () => {
      modo = performance.now() - intentoManual <= 1800 ? 'manual' : 'automatico';
      intentoManual = -Infinity;
    });
    video.addEventListener('playing', () => { reproduciendo = true; sincronizar(); });
    video.addEventListener('waiting', () => { reproduciendo = false; sincronizar(); });
    for (const evento of ['pause', 'ended', 'emptied']) video.addEventListener(evento, () => {
      reproduciendo = false;
      reproduccion?.cerrar();
      reproduccion = null;
    });
  }

  document.addEventListener('visibilitychange', sincronizar);
  document.addEventListener('click', ev => {
    if (!ev.target.closest?.('a.ya-compre, a.hn2-ya, a.sgi-campus-link') || !datosCheckout().visitaId) return;
    enviar(identidad || Promise.resolve(null), 'ya_pague', uuid());
  });
  window.addEventListener('sinergia:cookies', sincronizar);
  window.addEventListener('pageshow', sincronizar);
  window.addEventListener('pagehide', () => relojes.forEach(r => { r.cambiar(false); r.actualizar(); }));
  const tic = setInterval(() => relojes.forEach(r => r.actualizar()), 15000);
  window.addEventListener('pagehide', ev => { if (!ev.persisted) clearInterval(tic); });
  sincronizar();

  return {
    datosCheckout,
    abrirPago() { pagoAbierto = true; sincronizar(); },
    montarPago(sessionId, visitaCheckout) {
      if (!sessionId || visitaCheckout !== visitaId || !permiteEstadisticas()) return;
      checkout?.cerrar();
      checkout = medir('checkout_montado', 'checkout_tiempo', sessionId, { sessionId });
      sincronizar();
    },
    cerrarPago() { pagoAbierto = false; checkout?.cerrar(); checkout = null; sincronizar(); }
  };
}
