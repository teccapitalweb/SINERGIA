const RUTA = '/campus/brote/chat';
const MAX_MENSAJE = 1000;
const MAX_HISTORIAL = 8;
const MAX_TEXTO_HISTORIAL = 1500;
const MAX_TURNOS_EN_PANTALLA = 12;
const MASCOTA = '/campus/portadas/brote.webp';

export function tieneBrote(datos) {
  return datos?.broteDisponible ?? Boolean(datos?.cursos?.length || datos?.compras?.some(compra => compra.monto > 0));
}

function aviso(error) {
  switch (error?.status) {
    case 401: return 'Tu sesión venció. Vuelve a entrar al Campus para continuar.';
    case 403: return 'Brote está disponible para las cuentas con acceso a un curso.';
    case 413: return 'El mensaje es demasiado largo. Acórtalo y vuelve a intentarlo.';
    case 429: return 'Espera un momento antes de enviar otro mensaje.';
    case 503: return 'Brote no está disponible en este momento. Intenta de nuevo en unos minutos.';
    default: return 'No pudimos enviar tu mensaje. Intenta de nuevo.';
  }
}

function historial(turnos) {
  return turnos.slice(-MAX_HISTORIAL / 2).flatMap(turno => [
    { rol: 'usuario', texto: turno.pregunta.texto },
    { rol: 'asistente', texto: turno.respuesta.slice(0, MAX_TEXTO_HISTORIAL) }
  ]);
}

function separarRespuesta(datos) {
  const respuesta = typeof datos?.respuesta === 'string' ? datos.respuesta.trim().slice(0, 6000) : '';
  if (datos?.ok !== true || !respuesta) return null;
  const partes = (Array.isArray(datos.partes) ? datos.partes : [])
    .filter(x => typeof x === 'string' && x.trim()).slice(0, 8).map(texto => texto.trim().slice(0, 1500));
  return {
    respuesta,
    burbujas: (partes.length ? partes : [respuesta]).map(texto => ({ rol: 'asistente', texto }))
  };
}

export function crearBrote(api) {
  const conversaciones = new Map();
  let uid = null;
  let quitarVista = null;

  function desmontar() {
    quitarVista?.();
    quitarVista = null;
  }

  function cambiarCuenta(nuevaCuenta) {
    if (uid === nuevaCuenta) return;
    desmontar();
    for (const c of conversaciones.values()) {
      c.envio?.controlador.abort();
      c.envio = null;
    }
    conversaciones.clear();
    uid = nuevaCuenta;
  }

  async function enviar(conversacion, curso, texto) {
    const mensaje = texto.trim().slice(0, MAX_MENSAJE);
    if (!uid || !mensaje || conversacion.envio) return;
    const controlador = new AbortController();
    const pregunta = { rol: 'usuario', texto: mensaje };
    const turnoPendiente = { controlador, pregunta };
    const cuenta = uid;
    conversacion.envio = turnoPendiente;
    conversacion.borrador = '';
    conversacion.error = '';
    conversacion.actualizar?.();

    const vigente = () => uid === cuenta && conversacion.envio === turnoPendiente;
    const limite = setTimeout(() => controlador.abort(), 45000);
    try {
      const datos = await api(RUTA, {
        body: { curso, mensaje, historial: historial(conversacion.turnos) },
        signal: controlador.signal, cache: 'no-store'
      });
      if (!vigente()) return;
      const contestacion = separarRespuesta(datos);
      if (!contestacion) throw new Error('respuesta');
      conversacion.turnos.push({ pregunta, ...contestacion });
      if (conversacion.turnos.length > MAX_TURNOS_EN_PANTALLA) conversacion.turnos.shift();
      conversacion.modo = datos.modo;
    } catch (error) {
      if (!vigente()) return;
      conversacion.error = controlador.signal.aborted ? 'La respuesta tardó demasiado. Intenta de nuevo.' : aviso(error);
      if (!conversacion.borrador.trim()) conversacion.borrador = mensaje;
    } finally {
      clearTimeout(limite);
      if (vigente()) {
        conversacion.envio = null;
        conversacion.actualizar?.();
      }
    }
  }

  function montar(host, curso = null) {
    desmontar();
    if (!host || !uid) return;
    const clave = curso?.slug || '';
    if (!conversaciones.has(clave)) conversaciones.set(clave, { turnos: [], borrador: '', error: '', envio: null, modo: null });
    const conversacion = conversaciones.get(clave);
    host.innerHTML = `
      <section class="brote-chat" aria-labelledby="brote-titulo">
        <header class="brote-cabecera">
          <span class="brote-avatar"><img src="${MASCOTA}" width="60" height="60" alt=""></span>
          <div><h1 id="brote-titulo" tabindex="-1">Soy Brote</h1><p data-brote-contexto></p></div>
          <button class="brote-reiniciar" type="button">Nueva conversación</button>
        </header>
        <div class="brote-historial" role="log" aria-label="Conversación con Brote" aria-relevant="additions" tabindex="0"></div>
        <form class="brote-form">
          <p class="brote-estado" role="status" hidden></p>
          <p class="brote-error" role="alert" hidden></p>
          <label class="brote-sr" for="brote-pregunta">Tu mensaje para Brote</label>
          <div class="brote-entrada">
            <textarea id="brote-pregunta" rows="2" maxlength="${MAX_MENSAJE}" placeholder="Escribe tu pregunta…" enterkeyhint="send" autocomplete="off" aria-describedby="brote-privacidad"></textarea>
            <button type="submit">Enviar</button>
          </div>
          <p class="brote-privacidad" id="brote-privacidad">Evita compartir datos personales. Brote usa tu mensaje y parte de la conversación reciente para responder con IA.</p>
        </form>
      </section>`;
    const panel = host.querySelector('.brote-chat');
    const titulo = panel.querySelector('h1');
    const log = panel.querySelector('.brote-historial');
    const entrada = panel.querySelector('textarea');
    const formulario = panel.querySelector('form');
    const boton = formulario.querySelector('[type="submit"]');
    const reiniciar = panel.querySelector('.brote-reiniciar');
    const estado = formulario.querySelector('.brote-estado');
    const error = formulario.querySelector('.brote-error');
    const imagen = panel.querySelector('.brote-avatar img');
    imagen.addEventListener('error', () => imagen.remove(), { once: true });
    panel.querySelector('[data-brote-contexto]').textContent = curso?.titulo || 'Tu asistente en el Campus Sinergia';
    const saludo = { rol: 'asistente', texto: 'Cuéntame qué quieres repasar de tus cursos o aplicar en campo. ¿Por dónde empezamos?' };
    const dibujados = new Map();

    function controles() {
      boton.disabled = Boolean(conversacion.envio) || !entrada.value.trim();
      reiniciar.disabled = !conversacion.turnos.length && !conversacion.envio && !conversacion.borrador && !conversacion.error;
    }

    function pintar() {
      const mensajes = [saludo, ...conversacion.turnos.flatMap(turno => [turno.pregunta, ...turno.burbujas])];
      if (conversacion.envio) mensajes.push(conversacion.envio.pregunta);
      for (const [mensaje, nodo] of dibujados) {
        if (!mensajes.includes(mensaje)) { nodo.remove(); dibujados.delete(mensaje); }
      }
      for (const mensaje of mensajes) {
        if (dibujados.has(mensaje)) continue;
        const nuevo = document.createElement('p');
        nuevo.className = 'brote-mensaje ' + (mensaje.rol === 'usuario' ? 'brote-mensaje-propio' : 'brote-mensaje-brote');
        const quien = document.createElement('span');
        quien.className = 'brote-sr';
        quien.textContent = mensaje.rol === 'usuario' ? 'Tú: ' : 'Brote: ';
        nuevo.append(quien, document.createTextNode(mensaje.texto));
        log.append(nuevo);
        dibujados.set(mensaje, nuevo);
      }
      if (entrada.value !== conversacion.borrador) entrada.value = conversacion.borrador;
      estado.textContent = conversacion.envio ? 'Brote está escribiendo…' :
        (conversacion.modo === 'orientacion' ? 'Respuesta de la guía del Campus.' : '');
      estado.hidden = !estado.textContent;
      error.textContent = conversacion.error;
      error.hidden = !conversacion.error;
      controles();
      requestAnimationFrame(() => { if (log.isConnected) log.scrollTop = log.scrollHeight; });
    }

    entrada.addEventListener('input', () => {
      conversacion.borrador = entrada.value;
      controles();
    });
    entrada.addEventListener('keydown', evento => {
      if (evento.key !== 'Enter' || evento.shiftKey || evento.isComposing || evento.keyCode === 229) return;
      evento.preventDefault();
      if (!boton.disabled) formulario.requestSubmit();
    });
    formulario.addEventListener('submit', evento => {
      evento.preventDefault();
      if (boton.disabled) return;
      enviar(conversacion, curso?.slug || null, entrada.value);
      entrada.focus({ preventScroll: true });
    });
    reiniciar.addEventListener('click', () => {
      const anterior = conversacion.envio;
      conversacion.envio = null;
      anterior?.controlador.abort();
      conversacion.turnos = [];
      conversacion.borrador = '';
      conversacion.error = '';
      conversacion.modo = null;
      pintar();
      entrada.focus({ preventScroll: true });
    });

    const ajustar = () => {
      const altura = window.visualViewport.height;
      panel.style.setProperty('--brote-vista', altura + 'px');
      panel.classList.toggle('brote-compacto', altura < 560);
    };
    if (window.visualViewport) {
      ajustar();
      window.visualViewport.addEventListener('resize', ajustar);
    }
    conversacion.actualizar = pintar;
    quitarVista = () => {
      conversacion.actualizar = null;
      window.visualViewport?.removeEventListener('resize', ajustar);
    };
    pintar();
    titulo.focus({ preventScroll: true });
  }

  return { montar, desmontar, cambiarCuenta };
}
