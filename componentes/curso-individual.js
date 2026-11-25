import { API_SINERGIA, CURSOS_INDIVIDUALES, REFERIDO, esCursoIndividual, mxn, validarOferta } from './cursos-individuales-config.js?v=1';
import { actividadCurso } from './actividad-curso-individual.js?v=1';
import { regaloCurso } from './regalo-curso-individual.js?v=6';

let cargaAuth;
function cargarAuth() {
  cargaAuth ||= Promise.all([
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'),
    import('./campus-firebase-config.js?v=1')
  ]).then(async ([appSdk, authSdk, { firebaseConfig }]) => {
    // Firebase comparte la sesión persistida con el Campus mediante el mismo nombre de app.
    const app = appSdk.getApps().find(a => a.name === '[DEFAULT]' && a.options.projectId === firebaseConfig.projectId) ||
      appSdk.initializeApp(firebaseConfig);
    const auth = authSdk.getAuth(app);
    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady();
    } else {
      await new Promise(resolve => {
        const cancelar = authSdk.onAuthStateChanged(auth, () => { cancelar(); resolve(); }, resolve);
      });
    }
    return auth;
  }).catch(() => { cargaAuth = null; return null; });
  return cargaAuth;
}

async function usuarioVerificado() {
  let tic;
  let auth;
  try {
    auth = await Promise.race([cargarAuth(), new Promise(resolve => { tic = setTimeout(resolve, 1700); })]);
  } finally { clearTimeout(tic); }
  const usuario = auth?.currentUser;
  if (!usuario?.emailVerified) return null;
  let limite;
  try {
    const token = await Promise.race([usuario.getIdToken(), new Promise(resolve => { limite = setTimeout(resolve, 1700); })]);
    return token && auth.currentUser?.uid === usuario.uid ? { uid: usuario.uid, token } : null;
  } catch (_) { return null; }
  finally { clearTimeout(limite); }
}

function iniciar() {
  const slug = document.body.dataset.cursoIndividual;
  if (!esCursoIndividual(slug)) return;
  const origen = new URLSearchParams(location.search).get(REFERIDO);
  const referido = esCursoIndividual(origen) && origen !== slug ? origen : null;
  const regalo = regaloCurso(slug);
  const actividad = actividadCurso(slug, referido, async () => (await usuarioVerificado())?.token);
  let ofertaEnCurso = null, cartel = null, notaPago = null;
  let revision = 0;

  async function cotizar(usuario) {
    if (!referido || !usuario) return null;
    if (ofertaEnCurso?.uid === usuario.uid && Date.now() - ofertaEnCurso.ahora < 45000) return ofertaEnCurso.oferta;
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 3500);
    try {
      const r = await fetch(API_SINERGIA + '/publico/cursos/promociones/cotizar', {
        method: 'POST', cache: 'no-store', signal: controlador.signal,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + usuario.token },
        body: JSON.stringify({ origenSlug: referido, destinoSlug: slug })
      });
      const d = await r.json();
      if (!r.ok) return d.codigo === 'correo_no_verificado' ? { correoPendiente: true } : null;
      const oferta = validarOferta(d.oferta, referido, slug);
      if (oferta) ofertaEnCurso = { uid: usuario.uid, ahora: Date.now(), oferta };
      return oferta;
    } catch (_) { return null; }
    finally { clearTimeout(limite); }
  }

  function pintarPrecio(contenedor, oferta) {
    const linea = document.createElement('p');
    linea.className = 'sgi-precio-totales';
    const antes = document.createElement('s');
    antes.textContent = mxn(oferta.precioCentavos);
    const ahora = document.createElement('strong');
    ahora.textContent = mxn(oferta.totalCentavos);
    linea.append(antes, ahora);
    contenedor.append(linea);
  }

  async function mostrarOferta() {
    if (!referido) return;
    const turno = ++revision;
    const usuario = await usuarioVerificado();
    const consulta = await cotizar(usuario);
    const verificar = !usuario || consulta?.correoPendiente;
    const oferta = verificar ? null : consulta;
    if (turno !== revision) return;
    cartel?.remove();
    if (!oferta && !verificar) return;
    const ancla = document.querySelector('.js-buy');
    if (!ancla) return;
    cartel = document.createElement('aside');
    cartel.className = 'sgi-precio';
    const titulo = document.createElement('b');
    titulo.textContent = oferta ? 'Precio de alumno de Sinergia' : 'Precio especial para alumnos';
    cartel.append(titulo);
    if (oferta) pintarPrecio(cartel, oferta);
    const descripcion = document.createElement('p');
    descripcion.textContent = oferta ?
      'Ahorras ' + mxn(oferta.descuentoCentavos) + ' por haber tomado ' + CURSOS_INDIVIDUALES[referido].titulo + '.' :
      'Entra con la cuenta con la que compraste ' + CURSOS_INDIVIDUALES[referido].titulo + ' para confirmar tu descuento.';
    cartel.append(descripcion);
    if (verificar) {
      const enlace = document.createElement('a');
      const historial = referido === 'gerberas' || referido === 'habanero';
      enlace.href = '/campus/?curso=' + encodeURIComponent(referido) + (historial ? '#/cursos' : '#/curso/' + encodeURIComponent(referido) + '/clases');
      enlace.textContent = 'Entrar al Campus';
      cartel.append(enlace);
    }
    ancla.before(cartel);
  }

  const cajaPago = () => document.getElementById('payBody');
  function estadoPago() {
    notaPago?.remove();
    notaPago = document.createElement('div');
    notaPago.className = 'sgi-pago-nota';
    notaPago.setAttribute('role', 'status');
    cajaPago()?.prepend(notaPago);
    return notaPago;
  }

  window.SinergiaCurso = {
    abrirPago() { actividad.abrirPago(); regalo?.sincronizar(); },
    cerrarPago() { notaPago?.remove(); notaPago = null; actividad.cerrarPago(); regalo?.sincronizar(); },
    async datosPago() {
      const analitica = actividad.datosCheckout();
      const usuario = referido || analitica.visitaId ? await usuarioVerificado() : null;
      const oferta = await cotizar(usuario);
      return {
        headers: { 'Content-Type': 'application/json', ...(usuario ? { Authorization: 'Bearer ' + usuario.token } : {}) },
        body: { ...actividad.datosCheckout(), ...(await regalo?.datosCheckout()), ...(oferta?.totalCentavos ? { promocionOrigen: referido } : {}) }
      };
    },
    montarPago(data, intento) {
      actividad.montarPago(data.sessionId, intento?.body?.visitaId);
      const oferta = referido && validarOferta(data.oferta, referido, slug);
      if (!oferta && !data.regaloReservado && !intento?.body?.regaloToken && !intento?.body?.promocionOrigen) return;
      const nota = estadoPago();
      if (oferta) pintarPrecio(nota, oferta);
      if (intento?.body?.promocionOrigen && !oferta) {
        const linea = document.createElement('p');
        linea.textContent = 'El descuento no está disponible para esta sesión. Revisa el total de Stripe antes de pagar.';
        nota.append(linea);
      }
      if (data.regaloReservado) {
        const linea = document.createElement('p');
        nota.append(linea);
        regalo?.confirmarPago(data.regaloReservado, linea);
      } else if (intento?.body?.regaloToken) {
        const linea = document.createElement('p');
        linea.textContent = 'La reserva de Riego Eficiente ya no está disponible para esta sesión.';
        nota.append(linea);
      }
    },
    errorPago(intento, reintentar, continuar) {
      if (!intento?.body?.regaloToken && !intento?.body?.promocionOrigen) return false;
      const nota = estadoPago();
      const aviso = document.createElement('p');
      aviso.textContent = 'No pudimos abrir el pago con tu beneficio. Puedes intentarlo otra vez o ir al pago regular.';
      const acciones = document.createElement('div');
      acciones.className = 'sgi-pago-acciones';
      const deNuevo = document.createElement('button');
      deNuevo.type = 'button';
      deNuevo.textContent = 'Reintentar';
      deNuevo.onclick = () => { nota.remove(); reintentar(); };
      const regular = document.createElement('button');
      regular.type = 'button';
      regular.textContent = 'Ir al pago regular';
      regular.onclick = continuar;
      acciones.append(deNuevo, regular);
      nota.append(aviso, acciones);
      return true;
    }
  };

  if (referido) {
    mostrarOferta();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') mostrarOferta();
    });
  }

  const entrada = new URL(location.href);
  if (entrada.searchParams.get('inscribir') === '1') {
    entrada.searchParams.delete('inscribir');
    history.replaceState(history.state, '', entrada);
    document.querySelector('.js-buy')?.click();
  }
}

iniciar();
