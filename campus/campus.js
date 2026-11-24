/* ═══════════════════════════════════════════════════════════
   Campus Sinergia · aplicación del alumno
   El servidor decide TODO lo que se ve: qué cursos tiene la cuenta, qué clases están publicadas,
   entrega los videos firmados y las descargas temporales, y valida el avance.
   Aquí no se guarda nada importante en el navegador.
   ═══════════════════════════════════════════════════════════ */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword,
  signInWithCustomToken, signOut, updatePassword, setPersistence, browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import { pintarAula, pintarSinCompra, pintarAvatar, abrirVisor, cerrarVisor, confeti, recomendarCursos, mostrarPreciosRecomendados } from './aula.js?v=ofertas-cursos-1';
import { API_SINERGIA, CURSO_RIEGO, CURSOS_INDIVIDUALES, landingCurso, portadaCurso, portadaPublica } from '../componentes/cursos-individuales-config.js?v=1';

import { firebaseConfig } from '../componentes/campus-firebase-config.js?v=1';
const BACKEND = API_SINERGIA;
const WHATSAPP = '5212361074058';

// Fotos reales que ya existen en el sitio (ponente / portada de cada landing). Sin foto: fondo de color.
const IMAGENES = {
  'biofertilizantes': { portada: '/biofertilizantes/assets/poster-hero.jpg', ponente: '/biofertilizantes/assets/ponente.jpg' },
  'cana-de-azucar': { portada: '/cana-de-azucar/assets/ponente.jpg', ponente: '/cana-de-azucar/assets/ponente.jpg' },
  'soluciones-nutritivas': {}
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => null);

const $app = document.getElementById('app');
const E = { usuario: null, datos: null, error: null, cargando: false, scroll: {}, reproduciendo: null, cuentaAtras: null };

// Regreso de un pago (lo deja gracias.html en esta pestaña): curso recién comprado, válido 15 minutos
function pagoReciente() {
  try { const p = JSON.parse(sessionStorage.getItem('campus_pago') || 'null'); return p && p.curso && Date.now() - p.t < 15 * 60 * 1000 ? p : null; } catch (e) { return null; }
}
const olvidarPago = () => { try { sessionStorage.removeItem('campus_pago'); } catch (e) {} };

// ── Utilidades ─────────────────────────────────────────────
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICO = {
  inicio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/></svg>',
  cursos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>',
  material: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 15h6M9 18h4"/></svg>',
  progreso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></svg>',
  certificado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/></svg>',
  cuenta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  salir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  reloj: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  bajar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/></svg>',
  hoja: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>'
};
function toast(msg, mal) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast ver' + (mal ? ' mal' : '');
  clearTimeout(t._t); t._t = setTimeout(() => { t.className = 'toast'; }, 3800);
}
async function api(ruta, opciones = {}) {
  const u = auth.currentUser;
  const headers = { 'Content-Type': 'application/json' };
  if (u) headers.Authorization = 'Bearer ' + await u.getIdToken();
  const r = await fetch(BACKEND + ruta, { method: opciones.body ? 'POST' : 'GET', headers, body: opciones.body ? JSON.stringify(opciones.body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(data.error || data.mensaje || ('Error ' + r.status)); e.status = r.status; e.datos = data; throw e; }
  return data;
}
const ruta = () => {
  const h = (location.hash || '#/').slice(1);
  const [camino, q] = h.split('?');
  return { partes: camino.split('/').filter(Boolean), q: new URLSearchParams(q || '') };
};
const ir = (h) => { if (location.hash === h) render(); else location.hash = h; };
const curso = (slug) => (E.datos ? E.datos.cursos.find((c) => c.slug === slug) : null);
const minutos = (m) => (m ? m + ' min' : '');
function todasLasClases(c) { const l = []; c.modulos.forEach((m, i) => m.clases.forEach((x) => l.push({ ...x, modulo: m, mi: i }))); return l; }
const esVista = (c, id) => c.progreso.completadas.includes(id);

// ── Sesión ─────────────────────────────────────────────────
onAuthStateChanged(auth, async (u) => {
  E.usuario = u;
  const { partes, q } = ruta();
  if (partes[0] === 'entrar' && q.get('t')) return canjearEnlace(q.get('t'), q.get('curso'));
  if (!u) {
    E.datos = null;
    const pg = pagoReciente();
    if (pg) { confeti(); return pantallaAcceso({ aviso: pg.enlaceEnviado ? '¡Pago confirmado! Ese correo ya tenía cuenta: te enviamos un enlace de acceso (revisa tu correo, también en no deseados). También puedes entrar con Google o tu contraseña.' : '¡Pago confirmado! Entra con el correo con el que pagaste para ver tu curso.' }); }
    return pantallaAcceso();
  }
  await cargarDatos();
  render();
});

async function cargarDatos() {
  E.cargando = true; E.error = null;
  try { E.datos = await api('/campus/mis-cursos'); }
  catch (e) { E.datos = null; E.error = e; }
  E.cargando = false;
}

async function canjearEnlace(t, slug) {
  $app.innerHTML = '<div class="splash"><img src="/img/logo-sinergia-256.png" alt="" width="64" height="64"><span>Abriendo tu acceso…</span></div>';
  history.replaceState(null, '', location.pathname + '#/');
  try {
    const r = await fetch(BACKEND + '/campus/canjear', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t }) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.token) throw new Error(data.mensaje || 'El enlace no es válido.');
    await signInWithCustomToken(auth, data.token);
    sessionStorage.setItem('campus_bienvenida', '1');
    location.hash = slug ? '#/curso/' + slug : '#/';
  } catch (e) {
    pantallaAcceso({ error: (e && e.message) || 'No pudimos abrir tu acceso. Pide un enlace nuevo.' });
  }
}

// ── Pantalla de acceso ─────────────────────────────────────
function pantallaAcceso(opc = {}) {
  const pre = new URLSearchParams(location.search).get('curso');
  $app.className = '';
  $app.innerHTML = `
  <div class="acceso">
    <div class="acceso-arte">
      <div class="marca" style="padding:0"><img src="/img/logo-sinergia-256.png" alt=""><div><b>SINERGIA AGRÍCOLA</b><span>Campus</span></div></div>
      <div>
        <h1>Tus cursos, cuando quieras y desde cualquier dispositivo.</h1>
        <p>Entra con el correo con el que compraste tu curso. Tu avance se guarda en tu cuenta.</p>
      </div>
      <ul>
        <li>${ICO.ok} Clases en video por módulos</li>
        <li>${ICO.ok} Materiales descargables del curso</li>
        <li>${ICO.ok} Tu progreso en computadora y celular</li>
      </ul>
    </div>
    <div class="acceso-form">
      <div class="caja">
        <h2>Entrar a mis cursos</h2>
        <p class="sub" style="font-size:14px">¿Ya compraste? Escribe el correo de tu compra y te mandamos un enlace para entrar. No necesitas contraseña.</p>
        <form id="fEnlace" style="margin-top:16px" novalidate>
          <div class="campo"><label for="eEmail">Correo de compra</label><input id="eEmail" type="email" autocomplete="email" inputmode="email" required placeholder="tu@correo.com"></div>
          <button class="btn btn-pri" style="width:100%" id="bEnlace">Enviarme mi enlace de acceso</button>
        </form>
        <div id="mEnlace">${opc.error ? `<div class="mensaje mal">${esc(opc.error)}</div>` : opc.aviso ? `<div class="mensaje ok">${esc(opc.aviso)}</div>` : ''}</div>
        <div class="separador">o entra con tu cuenta</div>
        <button class="btn btn-google" id="bGoogle"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="">Continuar con Google</button>
        <details class="otra"><summary>Tengo correo y contraseña</summary>
          <form id="fClave" style="margin-top:12px" novalidate>
            <div class="campo"><label for="cEmail">Correo</label><input id="cEmail" type="email" autocomplete="email" required></div>
            <div class="campo"><label for="cClave">Contraseña</label><input id="cClave" type="password" autocomplete="current-password" required></div>
            <button class="btn btn-sec" style="width:100%">Entrar</button>
            <p class="ayuda">¿La olvidaste? Usa «Enviarme mi enlace de acceso» de arriba.</p>
          </form>
        </details>
        <p class="ayuda">¿Compraste con otro correo o no te llega el enlace? <a href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, compré un curso de Sinergia y necesito ayuda para entrar al campus')}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a>.</p>
        ${pre ? `<p class="ayuda">¿Aún no lo compras? <a href="/${esc(pre)}/">Ver el curso</a></p>` : ''}
      </div>
    </div>
  </div>`;
  const m = document.getElementById('mEnlace');
  document.getElementById('fEnlace').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = document.getElementById('eEmail').value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { m.innerHTML = '<div class="mensaje mal">Escribe un correo válido.</div>'; return; }
    const b = document.getElementById('bEnlace'); b.disabled = true; b.textContent = 'Enviando…';
    try {
      const r = await fetch(BACKEND + '/campus/enlace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, curso: pre || undefined }) });
      const d = await r.json().catch(() => ({}));
      m.innerHTML = `<div class="mensaje ${r.ok ? 'ok' : 'mal'}">${esc(d.mensaje || 'Intenta de nuevo en unos minutos.')}</div>`;
    } catch (e) { m.innerHTML = '<div class="mensaje mal">No pudimos conectar. Revisa tu internet.</div>'; }
    b.disabled = false; b.textContent = 'Enviarme mi enlace de acceso';
  });
  document.getElementById('bGoogle').addEventListener('click', async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e) { if (e && e.code !== 'auth/popup-closed-by-user') m.innerHTML = '<div class="mensaje mal">No se pudo entrar con Google. Intenta con tu enlace de acceso.</div>'; }
  });
  document.getElementById('fClave').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try { await signInWithEmailAndPassword(auth, document.getElementById('cEmail').value.trim(), document.getElementById('cClave').value); }
    catch (e) { m.innerHTML = '<div class="mensaje mal">Correo o contraseña incorrectos. Si no recuerdas tu contraseña, pide tu enlace de acceso.</div>'; }
  });
}

// ── Marco del campus ───────────────────────────────────────
const NAV = [
  ['#/', 'inicio', 'Mi inicio'], ['#/cursos', 'cursos', 'Mis cursos'], ['#/materiales', 'material', 'Materiales'],
  ['#/progreso', 'progreso', 'Mi progreso'], ['#/certificado', 'certificado', 'Certificados'], ['#/cuenta', 'cuenta', 'Mi cuenta']
];
function marco(activo, html) {
  const nav = NAV.map(([h, i, t]) => `<a class="nav-item${activo === h ? ' activo' : ''}" href="${h}" ${activo === h ? 'aria-current="page"' : ''}>${ICO[i]}<span>${t}</span></a>`).join('');
  const movil = NAV.filter(([h]) => h !== '#/progreso').map(([h, i, t]) => `<a class="${activo === h ? 'activo' : ''}" href="${h}">${ICO[i]}<span>${t.replace('Mis ', '').replace('Mi ', '')}</span></a>`).join('');
  return `${E.datos && E.datos.alumno.esAdmin ? '<div class="vista-equipo">Vista del equipo: ves todos los cursos y las clases ocultas también se pueden reproducir. Tu avance no se guarda.</div>' : ''}
  <div class="campus">
    <aside class="lateral" aria-label="Menú del campus">
      <div class="marca"><img src="/img/logo-sinergia-256.png" alt=""><div><b>SINERGIA</b><span>Campus</span></div></div>
      ${nav}
      <div class="espacio"></div>
      <a class="nav-item" href="/">${ICO.hoja}<span>Sitio de Sinergia</span></a>
      <button class="nav-item salir" data-salir>${ICO.salir}<span>Cerrar sesión</span></button>
    </aside>
    <header class="barra-movil"><img src="/img/logo-sinergia-256.png" alt=""><b>Campus Sinergia</b><a class="campus-avatar" href="#/cuenta" aria-label="Mi cuenta"></a></header>
    <main class="contenido" id="contenido">${html}</main>
    <nav class="nav-movil" aria-label="Menú">${movil}</nav>
  </div>`;
}

// ── Componentes ────────────────────────────────────────────
function portada(c, extra = '') {
  const imagen = portadaCurso(c) || IMAGENES[c.slug]?.portada;
  return `<div class="portada">${imagen ? `<img src="${esc(imagen)}" alt="" loading="lazy">` : `<div class="hoja">${ICO.hoja}</div>`}${extra}</div>`;
}
function tarjetaCurso(c) {
  const p = c.progreso;
  const sig = siguienteClase(c);
  const aula = '#/curso/' + encodeURIComponent(c.slug);
  const accion = !c.contenidoListo
    ? `<a class="btn btn-sec" href="${aula}">Ver el temario</a>`
    : `<div class="acciones-curso">
        <a class="btn btn-pri" href="${sig ? aula + '/clase/' + encodeURIComponent(sig.id) : aula}">${ICO.play}${p.completadas.length ? 'Continuar aprendiendo' : 'Empezar el curso'}</a>
        ${sig ? `<a class="btn btn-sec" href="${aula}">Ver curso</a>` : ''}
      </div>`;
  return `<article class="tarjeta" data-curso="${esc(c.slug)}">
    ${portada(c, `<div class="portada-info"><div class="chips">${c.origen === 'regalo' ? '<span class="chip prep">Regalo incluido</span>' : ''}${c.contenidoListo ? `<span class="chip">${p.total} clases</span><span class="chip">${c.modulos.length} módulos</span>` : '<span class="chip prep">Contenido en preparación</span>'}${p.porcentaje === 100 ? '<span class="chip ok">Completado</span>' : ''}</div><h3>${esc(c.titulo)}</h3></div>`)}
    <div class="tarjeta-cuerpo">
      ${c.ponente ? `<div class="ponente">Imparte: <b>${esc(c.ponente)}</b></div>` : ''}
      ${c.contenidoListo ? `<div><div class="barra"><i style="width:${p.porcentaje}%"></i></div><div class="barra-txt" style="margin-top:6px"><span>${p.completadas.length} de ${p.total} clases vistas</span><b>${p.porcentaje}%</b></div></div>`
        : '<p class="sub" style="font-size:13.5px">Tu curso ya está en tu cuenta. Las grabaciones se publicarán aquí en cuanto estén listas.</p>'}
      ${accion}
    </div>
  </article>`;
}
function siguienteClase(c) {
  const todas = todasLasClases(c);
  if (c.progreso.ultimaClase) {
    const i = todas.findIndex((x) => x.id === c.progreso.ultimaClase);
    if (i >= 0 && !esVista(c, todas[i].id)) return todas[i];
    const sig = todas.slice(i + 1).find((x) => !esVista(c, x.id));
    if (sig) return sig;
  }
  return todas.find((x) => !esVista(c, x.id)) || todas[0] || null;
}
function listaMateriales(c) {
  if (!c.materiales.length) return '<div class="caja vacio"><b>Sin materiales por ahora</b>Cuando el equipo publique materiales de este curso aparecerán aquí.</div>';
  return `<div class="materiales">${c.materiales.map((m) => {
    const ext = (m.ext || 'doc').toLowerCase().replace(/^\./, '');
    const imagen = portadaPublica(m.portada) || (c.slug === CURSO_RIEGO ? portadaCurso(c) : '');
    return `<button type="button" class="material" data-curso-material="${esc(c.slug)}" data-material="${esc(m.id)}">
      ${imagen ? `<img class="material-portada" src="${esc(imagen)}" alt="" loading="lazy">` : `<span class="ext ${esc(ext)}" aria-hidden="true">${esc(ext === 'enlace' ? 'URL' : ext.slice(0, 4))}</span>`}
      <span class="material-nombre"><b>${esc(m.nombre)}</b><span>Abrir archivo</span></span>
      <span class="bajar" aria-hidden="true">${ICO.bajar}</span>
    </button>`;
  }).join('')}</div>`;
}

function otrosCursos(otros = []) {
  const disponibles = otros.filter(c => landingCurso(c.slug));
  if (!disponibles.length) return '';
  return `<section><h2 class="sec">Otros cursos de Sinergia</h2>
    <div class="materiales">${disponibles.map((c) => `<a class="material" href="${esc(landingCurso(c.slug))}">
      <span class="ext" aria-hidden="true">${ICO.hoja}</span><span class="material-nombre"><b>${esc(c.titulo)}</b><span>Conocer el curso</span></span>
    </a>`).join('')}</div></section>`;
}

// ── Vistas ─────────────────────────────────────────────────
function vistaInicio() {
  const d = E.datos;
  const nombre = (d.alumno.nombre || d.alumno.email).split(' ')[0];
  const bienvenida = sessionStorage.getItem('campus_bienvenida'); sessionStorage.removeItem('campus_bienvenida');
  const enCurso = d.cursos.filter((c) => c.contenidoListo && c.progreso.porcentaje < 100);
  let h = `<div class="encabezado"><div><span class="eyebrow">Campus Sinergia</span><h1 class="titulo">Hola, <span>${esc(nombre)}</span></h1><p class="sub">${d.cursos.length ? 'Aquí están tus cursos. Tu avance se guarda en tu cuenta y lo ves igual en la computadora y en el celular.' : ''}</p></div></div>`;
  if (bienvenida) h += '<div class="aviso azul">Listo, ya entraste. Para la próxima puedes volver a pedir tu enlace, entrar con Google o crear una contraseña en «Mi cuenta».</div>';
  if (!d.cursos.length) {
    const tuvoCompra = (d.compras || []).some(x => landingCurso(x.curso) && x.monto > 0);
    return h + (tuvoCompra ? '<a class="btn btn-pri" href="#/cursos">Ver mis cursos</a>' : sinCursos()) + otrosCursos(d.otros);
  }
  if (enCurso.length) {
    const c = enCurso[0], sig = siguienteClase(c);
    h += `<div class="caja continuar"><div><span class="eyebrow">Continúa donde te quedaste</span><h2>${esc(sig ? sig.titulo : c.titulo)}</h2><p class="sub" style="font-size:14px">${esc(c.titulo)} · ${c.progreso.porcentaje}% completado</p></div>${sig ? `<a class="btn btn-pri" href="#/curso/${c.slug}/clase/${sig.id}">${ICO.play}Seguir</a>` : ''}</div>`;
  }
  h += `<h2 class="sec">Mis cursos</h2><div class="rejilla">${d.cursos.map(tarjetaCurso).join('')}</div>`;
  return h + otrosCursos(d.otros);
}
function sinCursos() {
  return `<div class="caja vacio"><b>No encontramos cursos en esta cuenta</b>Entraste como <b>${esc(E.datos.alumno.email)}</b>. Si compraste con otro correo, cierra sesión y pide tu enlace con ese correo.<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px"><button class="btn btn-sec" data-salir>Usar otro correo</button><a class="btn btn-txt" href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">Pedir ayuda por WhatsApp</a></div></div>`;
}
function vistaCursos() {
  const d = E.datos;
  const compras = (d.compras || []).filter(x => landingCurso(x.curso) && x.monto > 0 && !curso(x.curso));
  const anteriores = [...new Set(compras.map(x => x.curso))];
  return `<div class="encabezado"><div><span class="eyebrow">Mi biblioteca</span><h1 class="titulo"><span>Mis cursos</span></h1><p class="sub">Entra a las clases y materiales de tus cursos.</p></div></div>
    ${d.cursos.length ? `<div class="rejilla">${d.cursos.map(tarjetaCurso).join('')}</div>` : (!anteriores.length ? sinCursos() : '')}
    ${anteriores.map(slug => recomendarCursos(d, { slug }, 'Por tu compra de ' + CURSOS_INDIVIDUALES[slug].titulo)).join('')}
    ${anteriores.length ? '' : otrosCursos(d.otros)}`;
}
function noTiene() {
  return `<div class="caja vacio"><b>Este curso no está en tu cuenta</b>Si lo compraste con otro correo, cierra sesión y entra con ese correo.<div style="margin-top:14px"><a class="btn btn-sec" href="#/cursos">Ver mis cursos</a></div></div>`;
}
function vistaMateriales() {
  const d = E.datos;
  const h = '<div class="encabezado"><div><h1 class="titulo">Materiales</h1><p class="sub">Abre o descarga los archivos de tus cursos.</p></div></div>';
  return h + (d.cursos.length ? d.cursos.map((c) => `<section>
    <div class="materiales-encabezado">
      <h2 class="sec">${esc(c.titulo)}</h2>
      <a class="btn btn-txt" href="#/curso/${encodeURIComponent(c.slug)}/materiales">Ver en el curso</a>
    </div>
    ${listaMateriales(c)}
  </section>`).join('') : sinCursos());
}
function vistaProgreso() {
  const d = E.datos;
  const total = d.cursos.reduce((n, c) => n + c.progreso.total, 0), vistas = d.cursos.reduce((n, c) => n + c.progreso.completadas.length, 0);
  let h = `<div class="encabezado"><div><span class="eyebrow">Tu avance</span><h1 class="titulo"><span>Mi progreso</span></h1><p class="sub">Se guarda en tu cuenta: lo ves igual en cualquier dispositivo.</p></div></div>
  <div class="datos"><div class="dato"><b>${d.cursos.length}</b><span>cursos en tu cuenta</span></div><div class="dato"><b>${vistas} / ${total}</b><span>clases vistas</span></div><div class="dato"><b>${d.cursos.filter((c) => c.contenidoListo && c.progreso.porcentaje === 100).length}</b><span>cursos completados</span></div></div>`;
  d.cursos.forEach((c) => {
    const pend = todasLasClases(c).filter((x) => !esVista(c, x.id));
    h += `<h2 class="sec">${esc(c.titulo)}</h2><div class="caja">${c.contenidoListo ? `<div class="barra"><i style="width:${c.progreso.porcentaje}%"></i></div><div class="barra-txt" style="margin:6px 0 14px"><span>${c.progreso.completadas.length} de ${c.progreso.total} clases vistas</span><b>${c.progreso.porcentaje}%</b></div>
      ${pend.length ? `<p style="font-weight:700;margin-bottom:6px">Te faltan:</p><table class="tabla-simple">${pend.slice(0, 8).map((x) => `<tr><td>Módulo ${x.mi + 1}</td><td><a class="btn-txt" href="#/curso/${c.slug}/clase/${x.id}">${esc(x.titulo)}</a></td></tr>`).join('')}</table>${pend.length > 8 ? `<p class="ayuda">Y ${pend.length - 8} más.</p>` : ''}` : '<p class="chip ok" style="display:inline-flex">¡Viste todas las clases publicadas!</p>'}`
      : '<p class="sub">Las clases de este curso todavía se están preparando.</p>'}${c.progreso.actualizado ? `<p class="ayuda">Última actividad: ${new Date(c.progreso.actualizado).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</p>` : ''}</div>`;
  });
  return h;
}
function vistaCertificado() {
  const d = E.datos;
  let h = '<div class="encabezado"><div><span class="eyebrow">Reconocimiento</span><h1 class="titulo"><span>Certificados</span></h1><p class="sub">Solicita tu certificado con tus datos; Sinergia lo emite con folio verificable al concluir el curso.</p></div></div>';
  if (!d.cursos.length) return h + sinCursos();
  const TXT = { pendiente: 'Solicitud recibida. Te avisaremos cuando esté emitido.', en_proceso: 'Tu certificado está en proceso.', emitido: 'Tu certificado ya fue emitido.', rechazado: 'Necesitamos revisar tus datos.' };
  d.cursos.forEach((c) => {
    const so = c.solicitudCertificado;
    h += `<div class="caja" style="margin-bottom:14px;display:flex;gap:16px;align-items:center;flex-wrap:wrap"><span class="ext" style="background:var(--verde-100);color:var(--verde-700)">${ICO.certificado}</span><div style="flex:1;min-width:200px"><b style="font-family:var(--f-tit)">${esc(c.titulo)}</b><p class="sub" style="font-size:14px">${so ? TXT[so.estado] || TXT.pendiente : `Llevas ${c.progreso.porcentaje}% del curso. Envía tus datos para tu certificado.`}</p></div><a class="btn ${so ? 'btn-sec' : 'btn-pri'}" href="#/curso/${c.slug}/certificado">${so ? 'Ver mi solicitud' : 'Solicitar mi certificado'}</a></div>`;
  });
  return h;
}
function vistaCuenta() {
  const d = E.datos, u = E.usuario;
  const proveedores = (u.providerData || []).map((p) => p.providerId);
  return `<div class="encabezado"><div><span class="eyebrow">Tu cuenta</span><h1 class="titulo"><span>Mi cuenta</span></h1></div></div>
  <div class="datos"><div class="dato"><span>Nombre</span><b style="font-size:18px">${esc(d.alumno.nombre || '—')}</b></div><div class="dato"><span>Correo</span><b style="font-size:16px;word-break:break-all">${esc(d.alumno.email)}</b></div></div>
  <h2 class="sec">Mis compras</h2>
  <div class="caja">${d.compras.length ? `<table class="tabla-simple">${d.compras.map((c) => `<tr><td><b>${esc((curso(c.curso) || { titulo: c.curso }).titulo)}</b></td><td>${c.fecha ? new Date(c.fecha).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : ''}</td><td style="text-align:right">${c.monto != null ? '$' + c.monto.toLocaleString('es-MX') : ''}</td></tr>`).join('')}</table>` : '<p class="sub">No hay compras registradas con este correo.</p>'}</div>
  <h2 class="sec">Formas de entrar</h2>
  <div class="caja">
    <p class="sub" style="font-size:14px;margin-bottom:14px">Siempre puedes entrar pidiendo tu enlace al correo${proveedores.includes('google.com') ? ' o con Google' : ''}. Si prefieres, crea una contraseña:</p>
    <form id="fNueva" style="max-width:380px" novalidate>
      <div class="campo"><label for="nClave">Nueva contraseña (mínimo 8 caracteres)</label><input id="nClave" type="password" autocomplete="new-password" minlength="8"></div>
      <button class="btn btn-sec">Guardar contraseña</button>
    </form>
  </div>
  <div style="margin-top:20px"><button class="btn btn-sec" data-salir>${ICO.salir}Cerrar sesión</button></div>`;
}

// ── Render y eventos ───────────────────────────────────────
function render() {
  if (!E.usuario) return pantallaAcceso();
  $app.className = '';
  clearInterval(E.cuentaAtras);
  if (E.error) {
    const datos = E.error.datos || {};
    if (datos.codigo === 'correo-sin-verificar') {
      $app.innerHTML = `<div class="acceso-form" style="min-height:100vh"><div class="caja"><h2>Confirma tu correo</h2><p class="sub" style="font-size:14.5px">Entraste como <b>${esc(datos.email || '')}</b>, pero ese correo no está confirmado. Para proteger tu curso te mandamos un enlace a ese correo: ábrelo y listo.</p><button class="btn btn-pri" id="bConf" style="width:100%;margin-top:16px">Enviarme el enlace</button><div id="mConf"></div><button class="btn btn-txt" data-salir style="margin-top:10px">Usar otro correo</button></div></div>`;
      document.getElementById('bConf').onclick = async () => {
        const r = await fetch(BACKEND + '/campus/enlace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: datos.email }) }).then((x) => x.json()).catch(() => ({}));
        document.getElementById('mConf').innerHTML = `<div class="mensaje ok">${esc(r.mensaje || 'Revisa tu correo.')}</div>`;
      };
      return;
    }
    $app.innerHTML = `<div class="acceso-form" style="min-height:100vh"><div class="caja vacio"><b>No pudimos cargar tus cursos</b>${esc(E.error.message)}<div style="margin-top:14px;display:flex;gap:10px;justify-content:center"><button class="btn btn-pri" id="bReint">Reintentar</button><button class="btn btn-sec" data-salir>Cerrar sesión</button></div></div></div>`;
    document.getElementById('bReint').onclick = async () => { await cargarDatos(); render(); };
    return;
  }
  if (!E.datos) return;
  const { partes } = ruta();
  cerrarVisor();
  const pg = pagoReciente();
  if (pg && !curso(pg.curso) && !E.datos.alumno.esAdmin && (E.esperaPago = (E.esperaPago || 0) + 1) <= 6) {
    // Acaba de pagar y el curso todavía se está anotando en su cuenta: se espera en vez de decirle que no lo tiene
    $app.innerHTML = '<div class="splash"><img src="/img/logo-sinergia-256.png" alt="" width="64" height="64"><span>Pago confirmado. Activando tu acceso…</span></div>';
    setTimeout(async () => { await cargarDatos(); render(); }, 1800);
    return;
  }
  // «Ya compré» entra al aula cuando el servidor ya asignó ese curso a la cuenta.
  const entrada = !partes.length ? new URL(location.href) : null;
  const slugEntrada = entrada?.searchParams.get('curso');
  if (slugEntrada && curso(slugEntrada)) {
    entrada.searchParams.delete('curso');
    entrada.hash = '#/curso/' + encodeURIComponent(slugEntrada);
    history.replaceState(history.state, '', entrada);
    hashAnterior = location.hash;
    return render();
  }
  if (partes[0] === 'curso' && curso(partes[1])) {
    pintarAula({ app: $app, E, api, render, WHATSAPP }, curso(partes[1]), partes); window.scrollTo(0, 0);
    if (pg && pg.curso === partes[1]) { olvidarPago(); confeti(); setTimeout(() => { const t = document.getElementById('mc-toast'); if (t) { t.textContent = '¡Bienvenido! Tu curso ya está activo'; t.className = 'mc__toast on'; setTimeout(() => { t.className = 'mc__toast'; }, 3800); } }, 400); }
    return;
  }
  // Llegó desde «Ya compré» de una landing (o abrió un curso) y esa cuenta no lo tiene: no entra al campus, se le manda a inscribirse.
  const pedido = partes[0] === 'curso' ? partes[1] : (!partes.length && !E.pedidoAtendido ? new URLSearchParams(location.search).get('curso') : null);
  const ajeno = pedido && landingCurso(pedido) && !curso(pedido) && !E.datos.alumno.esAdmin ?
    (E.datos.otros || []).find((o) => o.slug === pedido) : null;
  if (ajeno) {
    pintarSinCompra({ app: $app, E, api, render, WHATSAPP, verMisCursos: () => { E.pedidoAtendido = true; ir('#/cursos'); } }, ajeno);
    window.scrollTo(0, 0); return;
  }
  let activo = '#/', html;
  if (partes[0] === 'cursos') { activo = '#/cursos'; html = vistaCursos(); }
  else if (partes[0] === 'curso') { activo = '#/cursos'; html = noTiene(); }
  else if (partes[0] === 'materiales') { activo = '#/materiales'; html = vistaMateriales(); }
  else if (partes[0] === 'progreso') { activo = '#/progreso'; html = vistaProgreso(); }
  else if (partes[0] === 'certificado') { activo = '#/certificado'; html = vistaCertificado(); }
  else if (partes[0] === 'cuenta') { activo = '#/cuenta'; html = vistaCuenta(); }
  else html = vistaInicio();
  $app.innerHTML = marco(activo, html);
  if (activo === '#/cursos') mostrarPreciosRecomendados($app, api);
  pintarAvatar($app.querySelector('.campus-avatar'), E.usuario, E.datos.alumno);
  const clave = location.hash;
  window.scrollTo(0, E.scroll[clave] || 0);
  const fn = document.getElementById('fNueva');
  if (fn) fn.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const v = document.getElementById('nClave').value;
    if (v.length < 8) { toast('La contraseña debe tener al menos 8 caracteres.', true); return; }
    try { await updatePassword(auth.currentUser, v); toast('Contraseña guardada.'); document.getElementById('nClave').value = ''; }
    catch (e) { toast(e && e.code === 'auth/requires-recent-login' ? 'Por seguridad, pide un enlace nuevo y vuelve a intentarlo.' : 'No se pudo guardar la contraseña.', true); }
  });
}

let hashAnterior = location.hash;
window.addEventListener('hashchange', () => { E.scroll[hashAnterior] = window.scrollY; hashAnterior = location.hash; const { partes, q } = ruta(); if (partes[0] === 'entrar' && q.get('t')) return canjearEnlace(q.get('t'), q.get('curso')); render(); });
document.addEventListener('click', async (e) => {
  if (e.target.closest('[data-salir]')) { clearInterval(E.cuentaAtras); await signOut(auth); location.hash = '#/'; return; }
  const m = e.target.closest('[data-curso-material][data-material]');
  if (m) {
    const c = curso(m.dataset.cursoMaterial);
    if (c) abrirVisor(c, m.dataset.material, api);
  }
});
// El enlace del correo puede abrir el campus con ?curso=… para volver a la landing correcta
export { render, ir };
