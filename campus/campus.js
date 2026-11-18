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

const firebaseConfig = {
  apiKey: 'AIzaSyBDuTlF5zL0wDrOBhF-jOQLZWJiUtWRfG0',
  authDomain: 'sinergia-agricola-vip.firebaseapp.com',
  projectId: 'sinergia-agricola-vip',
  storageBucket: 'sinergia-agricola-vip.firebasestorage.app',
  messagingSenderId: '788533345154',
  appId: '1:788533345154:web:4066de6561e1d54e2cad9b'
};
const BACKEND = 'https://sinergia-webhook-production.up.railway.app';
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
  if (!u) { E.datos = null; return pantallaAcceso(); }
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
        <div id="mEnlace">${opc.error ? `<div class="mensaje mal">${esc(opc.error)}</div>` : ''}</div>
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
  const nav = NAV.map(([h, i, t]) => `<a class="nav-item${activo === h ? ' activo' : ''}" href="${h}">${ICO[i]}<span>${t}</span></a>`).join('');
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
    <header class="barra-movil"><img src="/img/logo-sinergia-256.png" alt=""><b>Campus Sinergia</b></header>
    <main class="contenido" id="contenido">${html}</main>
    <nav class="nav-movil" aria-label="Menú">${movil}</nav>
  </div>`;
}

// ── Componentes ────────────────────────────────────────────
function portada(c, extra = '') {
  const img = IMAGENES[c.slug] || {};
  return `<div class="portada">${img.portada ? `<img src="${img.portada}" alt="" loading="lazy">` : `<div class="hoja">${ICO.hoja}</div>`}${extra}</div>`;
}
function tarjetaCurso(c) {
  const p = c.progreso;
  const sig = siguienteClase(c);
  const accion = !c.contenidoListo
    ? `<a class="btn btn-sec" href="#/curso/${c.slug}">Ver el temario</a>`
    : `<a class="btn btn-pri" href="${sig ? `#/curso/${c.slug}/clase/${sig.id}` : `#/curso/${c.slug}`}">${ICO.play}${p.completadas.length ? 'Continuar aprendiendo' : 'Empezar el curso'}</a>`;
  return `<article class="tarjeta">
    ${portada(c, `<div class="portada-info"><div class="chips">${c.contenidoListo ? `<span class="chip">${p.total} clases</span><span class="chip">${c.modulos.length} módulos</span>` : '<span class="chip prep">Contenido en preparación</span>'}${p.porcentaje === 100 ? '<span class="chip ok">Completado</span>' : ''}</div><h3>${esc(c.titulo)}</h3></div>`)}
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
function tarjetaLeccion(c, x, n) {
  const img = IMAGENES[c.slug] || {};
  return `<a class="leccion" href="#/curso/${c.slug}/clase/${x.id}" aria-label="Ver clase: ${esc(x.titulo)}">
    ${img.ponente ? `<img src="${img.ponente}" alt="" loading="lazy">` : ''}
    ${esVista(c, x.id) ? `<span class="visto">${ICO.check}Vista</span>` : ''}
    <div class="leccion-info"><div class="chips"><span class="chip">Clase ${n}</span>${x.duracionMin ? `<span class="chip">${ICO.reloj}${minutos(x.duracionMin)}</span>` : ''}</div><b>${esc(x.titulo)}</b></div>
    <span class="play">${ICO.play}</span>
  </a>`;
}
function listaMateriales(c, lista) {
  if (!lista.length) return '<div class="caja vacio"><b>Sin materiales por ahora</b>Cuando el equipo publique materiales de este curso aparecerán aquí.</div>';
  return `<div class="materiales">${lista.map((m) => `<button class="material" data-material="${esc(c.slug)}|${esc(m.id)}"><span class="ext ${esc(m.ext)}">${esc((m.ext || 'doc').slice(0, 4))}</span><span style="min-width:0"><b>${esc(m.nombre)}</b><span>${m.tamano ? (m.tamano < 1048576 ? Math.max(1, Math.round(m.tamano / 1024)) + ' KB' : (m.tamano / 1048576).toFixed(1) + ' MB') + ' · ' : ''}Descargar</span></span><span class="bajar">${ICO.bajar}</span></button>`).join('')}</div>`;
}

// ── Vistas ─────────────────────────────────────────────────
function vistaInicio() {
  const d = E.datos;
  const nombre = (d.alumno.nombre || d.alumno.email).split(' ')[0];
  const bienvenida = sessionStorage.getItem('campus_bienvenida'); sessionStorage.removeItem('campus_bienvenida');
  const enCurso = d.cursos.filter((c) => c.contenidoListo && c.progreso.porcentaje < 100);
  let h = `<div class="encabezado"><div><span class="eyebrow">Campus Sinergia</span><h1 class="titulo">Hola, <span>${esc(nombre)}</span></h1><p class="sub">${d.cursos.length ? 'Aquí están tus cursos. Tu avance se guarda en tu cuenta y lo ves igual en la computadora y en el celular.' : ''}</p></div></div>`;
  if (bienvenida) h += '<div class="aviso azul">Listo, ya entraste. Para la próxima puedes volver a pedir tu enlace, entrar con Google o crear una contraseña en «Mi cuenta».</div>';
  if (!d.cursos.length) return h + sinCursos();
  if (enCurso.length) {
    const c = enCurso[0], sig = siguienteClase(c);
    h += `<div class="caja continuar"><div><span class="eyebrow">Continúa donde te quedaste</span><h2>${esc(sig ? sig.titulo : c.titulo)}</h2><p class="sub" style="font-size:14px">${esc(c.titulo)} · ${c.progreso.porcentaje}% completado</p></div>${sig ? `<a class="btn btn-pri" href="#/curso/${c.slug}/clase/${sig.id}">${ICO.play}Seguir</a>` : ''}</div>`;
  }
  h += `<h2 class="sec">Mis cursos</h2><div class="rejilla">${d.cursos.map(tarjetaCurso).join('')}</div>`;
  if (d.otros.length) h += `<h2 class="sec">Otros cursos de Sinergia</h2><div class="materiales">${d.otros.map((o) => `<a class="material" href="${esc(o.landing)}" target="_blank" rel="noopener"><span class="ext">${ICO.hoja}</span><span><b>${esc(o.titulo)}</b><span>Conocer el curso</span></span></a>`).join('')}</div>`;
  return h;
}
function sinCursos() {
  return `<div class="caja vacio"><b>No encontramos cursos en esta cuenta</b>Entraste como <b>${esc(E.datos.alumno.email)}</b>. Si compraste con otro correo, cierra sesión y pide tu enlace con ese correo.<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px"><button class="btn btn-sec" data-salir>Usar otro correo</button><a class="btn btn-txt" href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">Pedir ayuda por WhatsApp</a></div></div>`;
}
function vistaCursos() {
  const d = E.datos;
  return `<div class="encabezado"><div><span class="eyebrow">Mi biblioteca</span><h1 class="titulo"><span>Mis cursos</span></h1><p class="sub">Solo aparecen los cursos de tu cuenta.</p></div></div>${d.cursos.length ? `<div class="rejilla">${d.cursos.map(tarjetaCurso).join('')}</div>` : sinCursos()}`;
}
function vistaCurso(slug) {
  const c = curso(slug);
  if (!c) return noTiene();
  const p = c.progreso, sig = siguienteClase(c);
  let n = 0;
  let h = `<nav class="migas" aria-label="Ubicación"><a href="#/cursos">Mis cursos</a><span>›</span><span>${esc(c.titulo)}</span></nav>
  <div class="tarjeta" style="margin-bottom:24px">${portada(c, `<div class="portada-info"><div class="chips">${c.contenidoListo ? `<span class="chip">${c.modulos.length} módulos</span><span class="chip">${p.total} clases</span>` : '<span class="chip prep">Contenido en preparación</span>'}</div><h3 style="font-size:clamp(20px,3vw,30px)">${esc(c.titulo)}</h3></div>`).replace('class="portada"', 'class="portada" style="aspect-ratio:21/7;min-height:180px"')}
    <div class="tarjeta-cuerpo" style="flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:space-between">
      <div style="min-width:220px;flex:1">${c.ponente ? `<div class="ponente">Imparte: <b>${esc(c.ponente)}</b></div>` : ''}${c.contenidoListo ? `<div class="barra" style="margin-top:10px;max-width:420px"><i style="width:${p.porcentaje}%"></i></div><div class="barra-txt" style="max-width:420px;margin-top:6px"><span>${p.completadas.length} de ${p.total} clases vistas</span><b>${p.porcentaje}%</b></div>` : ''}</div>
      ${sig ? `<a class="btn btn-pri" href="#/curso/${c.slug}/clase/${sig.id}">${ICO.play}${p.completadas.length ? 'Continuar aprendiendo' : 'Empezar el curso'}</a>` : ''}
    </div></div>`;
  if (c.descripcion) h += `<p class="sub" style="margin-bottom:20px">${esc(c.descripcion)}</p>`;
  if (!c.contenidoListo) h += '<div class="aviso">Tu curso ya está en tu cuenta. El equipo está preparando las grabaciones: en cuanto se publiquen las verás aquí, sin hacer nada más.</div>';
  c.modulos.forEach((m, i) => {
    h += `<section class="modulo"><div class="modulo-head"><span class="modulo-num">${i + 1}</span><div><h3>${esc(m.titulo)}</h3>${m.descripcion ? `<p>${esc(m.descripcion)}</p>` : ''}</div></div><div class="lecciones">${m.clases.map((x) => tarjetaLeccion(c, x, ++n)).join('')}</div></section>`;
  });
  if (c.enPreparacion.length) h += `<h2 class="sec">Próximamente</h2><div class="prep-lista">${c.enPreparacion.map((m) => `<div class="prep-item"><span class="chip prep">${ICO.reloj}En preparación</span><div><b>${esc(m.titulo)}</b>${m.descripcion ? `<p>${esc(m.descripcion)}</p>` : ''}</div></div>`).join('')}</div>`;
  h += `<h2 class="sec">Materiales del curso</h2>${listaMateriales(c, c.materiales)}`;
  return h;
}
function noTiene() {
  return `<div class="caja vacio"><b>Este curso no está en tu cuenta</b>Si lo compraste con otro correo, cierra sesión y entra con ese correo.<div style="margin-top:14px"><a class="btn btn-sec" href="#/cursos">Ver mis cursos</a></div></div>`;
}
function vistaClase(slug, claseId) {
  const c = curso(slug);
  if (!c) return noTiene();
  const todas = todasLasClases(c);
  const i = todas.findIndex((x) => x.id === claseId);
  if (i < 0) return `<div class="caja vacio"><b>Esta clase no está disponible</b>Puede que el equipo la esté actualizando.<div style="margin-top:14px"><a class="btn btn-sec" href="#/curso/${slug}">Volver al curso</a></div></div>`;
  const x = todas[i], ant = todas[i - 1], sig = todas[i + 1];
  const mats = c.materiales.filter((m) => m.moduloId === x.modulo.id);
  const vista = esVista(c, x.id);
  const temario = c.modulos.map((m, mi) => `<div class="mod-sep">Módulo ${mi + 1}</div>` + m.clases.map((k) => `<a href="#/curso/${slug}/clase/${k.id}" class="${k.id === x.id ? 'actual' : ''}"><span class="ico ${esVista(c, k.id) ? 'ok' : ''}">${esVista(c, k.id) ? ICO.check : ''}</span><span>${esc(k.titulo)}${k.duracionMin ? `<br><small style="color:var(--gris-500)">${minutos(k.duracionMin)}</small>` : ''}</span></a>`).join('')).join('');
  return `<nav class="migas" aria-label="Ubicación"><a href="#/cursos">Mis cursos</a><span>›</span><a href="#/curso/${slug}">${esc(c.titulo)}</a><span>›</span><span>Módulo ${x.mi + 1}</span></nav>
  <div class="clase-grid">
    <div>
      <div class="reproductor" id="reproductor"><div class="estado">Cargando el video…</div></div>
      <div style="margin-top:16px"><span class="eyebrow">Módulo ${x.mi + 1} · ${esc(x.modulo.titulo)}</span><h1 class="titulo" style="font-size:clamp(22px,2.6vw,30px)">${esc(x.titulo)}</h1></div>
      <div class="clase-acciones">
        ${vista ? `<span class="chip ok">${ICO.check}Clase vista</span>` : `<button class="btn btn-azul" id="bVista" disabled>${ICO.check}Marcar como vista</button><span class="nota" id="nVista"></span>`}
        <span style="flex:1"></span>
        ${ant ? `<a class="btn btn-sec" href="#/curso/${slug}/clase/${ant.id}">← Anterior</a>` : ''}
        ${sig ? `<a class="btn btn-pri" href="#/curso/${slug}/clase/${sig.id}">Siguiente →</a>` : `<a class="btn btn-sec" href="#/curso/${slug}">Volver al curso</a>`}
      </div>
      ${x.descripcion ? `<div class="clase-desc">${esc(x.descripcion)}</div>` : ''}
      ${mats.length ? `<h2 class="sec">Materiales de este módulo</h2>${listaMateriales(c, mats)}` : ''}
    </div>
    <aside class="panel-lado" aria-label="Clases del curso"><h4>Contenido del curso</h4><div class="temario">${temario}</div></aside>
  </div>`;
}
async function montarClase(slug, claseId) {
  clearInterval(E.cuentaAtras);
  const caja = document.getElementById('reproductor');
  if (!caja) return;
  try {
    const r = await api('/campus/video', { body: { curso: slug, claseId } });
    caja.innerHTML = `<iframe src="${esc(r.url)}" loading="lazy" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video de la clase"></iframe>`;
    const b = document.getElementById('bVista'), n = document.getElementById('nVista');
    if (b && !E.datos.alumno.esAdmin) {
      let resta = r.minimoSegundos;
      const tic = () => {
        if (resta <= 0) { b.disabled = false; n.textContent = ''; clearInterval(E.cuentaAtras); return; }
        n.textContent = 'Disponible al avanzar en la clase (' + Math.floor(resta / 60) + ':' + String(resta % 60).padStart(2, '0') + ')';
        resta--;
      };
      tic(); E.cuentaAtras = setInterval(tic, 1000);
      b.onclick = async () => {
        b.disabled = true;
        try {
          await api('/campus/progreso', { body: { curso: slug, claseId, accion: 'completar' } });
          const c = curso(slug); if (!c.progreso.completadas.includes(claseId)) c.progreso.completadas.push(claseId);
          c.progreso.porcentaje = c.progreso.total ? Math.round(c.progreso.completadas.length * 100 / c.progreso.total) : 0;
          toast('¡Clase vista! Tu avance quedó guardado.');
          const cont = document.getElementById('contenido'); const y = window.scrollY;
          cont.innerHTML = vistaClase(slug, claseId); window.scrollTo(0, y);
          montarClase(slug, claseId);
        } catch (e) {
          if (e.datos && e.datos.faltanSegundos) { toast('Aún te faltan ' + Math.ceil(e.datos.faltanSegundos / 60) + ' min de la clase.', true); }
          else toast(e.message, true);
          b.disabled = false;
        }
      };
    } else if (b) { b.disabled = true; n.textContent = 'Vista del equipo: el avance no se guarda.'; }
    const c = curso(slug); if (c) c.progreso.ultimaClase = claseId;
  } catch (e) {
    caja.innerHTML = `<div class="estado"><b style="color:#fff">No pudimos abrir el video</b><span>${esc(e.message)}</span></div>`;
  }
}
function vistaMateriales() {
  const d = E.datos;
  let h = '<div class="encabezado"><div><span class="eyebrow">Descargas</span><h1 class="titulo"><span>Materiales</span></h1><p class="sub">Los archivos de tus cursos. Cada descarga se prepara al momento solo para tu cuenta.</p></div></div>';
  if (!d.cursos.length) return h + sinCursos();
  d.cursos.forEach((c) => { h += `<h2 class="sec">${esc(c.titulo)}</h2>${listaMateriales(c, c.materiales)}`; });
  return h;
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
  let h = '<div class="encabezado"><div><span class="eyebrow">Reconocimiento</span><h1 class="titulo"><span>Certificados</span></h1><p class="sub">El certificado con folio verificable lo emite Sinergia cuando terminas el curso completo.</p></div></div>';
  if (!d.cursos.length) return h + sinCursos();
  d.cursos.forEach((c) => {
    const listo = c.contenidoListo && c.progreso.porcentaje === 100 && !c.enPreparacion.length;
    const texto = encodeURIComponent(`Hola, terminé el curso «${c.titulo}» en el Campus Sinergia (${d.alumno.email}) y quiero solicitar mi certificado.`);
    h += `<div class="caja" style="margin-bottom:14px;display:flex;gap:16px;align-items:center;flex-wrap:wrap"><span class="ext" style="background:var(--verde-100);color:var(--verde-700)">${ICO.certificado}</span><div style="flex:1;min-width:200px"><b style="font-family:var(--f-tit)">${esc(c.titulo)}</b><p class="sub" style="font-size:14px">${listo ? 'Terminaste todas las clases. Solicita tu certificado y te lo enviamos con su folio.' : !c.contenidoListo || c.enPreparacion.length ? 'Disponible cuando el curso tenga todas sus clases publicadas y las termines.' : `Llevas ${c.progreso.porcentaje}%. Termina todas las clases para solicitarlo.`}</p></div>${listo ? `<a class="btn btn-pri" href="https://wa.me/${WHATSAPP}?text=${texto}" target="_blank" rel="noopener">Solicitar mi certificado</a>` : `<a class="btn btn-sec" href="#/curso/${c.slug}">Ir al curso</a>`}</div>`;
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
  let activo = '#/', html;
  if (partes[0] === 'cursos') { activo = '#/cursos'; html = vistaCursos(); }
  else if (partes[0] === 'curso' && partes[2] === 'clase') { activo = '#/cursos'; html = vistaClase(partes[1], partes[3]); }
  else if (partes[0] === 'curso') { activo = '#/cursos'; html = vistaCurso(partes[1]); }
  else if (partes[0] === 'materiales') { activo = '#/materiales'; html = vistaMateriales(); }
  else if (partes[0] === 'progreso') { activo = '#/progreso'; html = vistaProgreso(); }
  else if (partes[0] === 'certificado') { activo = '#/certificado'; html = vistaCertificado(); }
  else if (partes[0] === 'cuenta') { activo = '#/cuenta'; html = vistaCuenta(); }
  else html = vistaInicio();
  $app.innerHTML = marco(activo, html);
  const clave = location.hash;
  window.scrollTo(0, E.scroll[clave] || 0);
  if (partes[0] === 'curso' && partes[2] === 'clase') montarClase(partes[1], partes[3]);
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
  const m = e.target.closest('[data-material]');
  if (m) {
    const [slug, id] = m.dataset.material.split('|');
    const ventana = window.open('', '_blank');
    try { const r = await api('/campus/material', { body: { curso: slug, id } }); if (ventana) ventana.location = r.url; else location.href = r.url; }
    catch (err) { if (ventana) ventana.close(); toast(err.message, true); }
  }
});
// El enlace del correo puede abrir el campus con ?curso=… para volver a la landing correcta
export { render, ir };
