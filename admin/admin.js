/* ═══════════════════════════════════════════════════════════
   Panel de administración · auth + llamadas al API
   ═══════════════════════════════════════════════════════════
   La lista blanca de este archivo es SOLO para no enseñar el panel a quien
   no toca. NO protege nada: cualquiera puede editar este JS en su navegador.
   Lo que protege de verdad es la lista blanca del BACKEND, que verifica el
   ID Token de Firebase en cada llamada y responde 403 si no eres tú.
   ═══════════════════════════════════════════════════════════ */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Config del cliente: es PÚBLICA por diseño (va en el HTML de cualquier app
// de Firebase). Mismo proyecto que ya usa el panel VIP.
const firebaseConfig = {
  apiKey: "AIzaSyBDuTlF5zL0wDrOBhF-jOQLZWJiUtWRfG0",
  authDomain: "sinergia-agricola-vip.firebaseapp.com",
  projectId: "sinergia-agricola-vip",
  storageBucket: "sinergia-agricola-vip.firebasestorage.app",
  messagingSenderId: "788533345154",
  appId: "1:788533345154:web:4066de6561e1d54e2cad9b"
};

export const BACKEND = 'https://sinergia-webhook-production.up.railway.app';
export const CURSOS = ['gerberas', 'biofertilizantes', 'habanero', 'cana-de-azucar', 'soluciones-nutritivas'];

const ADMINS = ['teccapitalweb@gmail.com'];   // solo cosmético — ver cabecera

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);   // sesión persistente

let usuario = null;

// ── Arranque: engancha login/logout y espera a Firebase ──────────────
export function iniciarPanel(alEntrar) {
  const pantallaLogin = document.getElementById('pantallaLogin');
  const panel = document.getElementById('panel');
  const error = document.getElementById('loginError');
  const btnEntrar = document.getElementById('btnEntrar');
  const btnSalir = document.getElementById('btnSalir');

  const mostrarError = (msg) => {
    if (!error) return;
    error.textContent = msg;
    error.classList.add('visible');
  };

  if (btnEntrar) {
    btnEntrar.addEventListener('click', async () => {
      error?.classList.remove('visible');
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') {
          mostrarError('No pudimos iniciar sesión. Inténtalo de nuevo.');
        }
      }
    });
  }

  if (btnSalir) {
    btnSalir.addEventListener('click', () => signOut(auth));
  }

  onAuthStateChanged(auth, async (u) => {
    if (!u) {
      usuario = null;
      panel?.classList.remove('visible');
      pantallaLogin?.classList.add('visible');
      return;
    }

    const email = (u.email || '').toLowerCase();

    if (!ADMINS.includes(email)) {
      // Cosmético: el backend le responderá 403 igualmente.
      await signOut(auth);
      pantallaLogin?.classList.add('visible');
      panel?.classList.remove('visible');
      mostrarError(`No tienes acceso a este panel (${email}).`);
      return;
    }

    usuario = u;
    pantallaLogin?.classList.remove('visible');
    panel?.classList.add('visible');

    const elEmail = document.getElementById('emailAdmin');
    if (elEmail) elEmail.textContent = email;

    try {
      await alEntrar();
    } catch (e) {
      console.error('[panel] Error cargando:', e);
      aviso('No pudimos cargar los datos: ' + e.message, true);
    }
  });
}

// ── Llamada autenticada al backend ──────────────────────────────────
async function token() {
  if (!usuario) throw new Error('Sin sesión');
  return usuario.getIdToken();
}

export async function api(ruta, opciones = {}) {
  const t = await token();
  const r = await fetch(BACKEND + ruta, {
    ...opciones,
    headers: {
      ...(opciones.headers || {}),
      'Authorization': 'Bearer ' + t,
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {})
    }
  });

  if (r.status === 403) throw new Error('El backend te negó el acceso (403)');
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

// El CSV necesita el header de auth, así que no vale un <a href>: se pide
// por fetch y se descarga como blob.
export async function descargarCsv() {
  const t = await token();
  const r = await fetch(BACKEND + '/admin/panel/alumnos/exportar', {
    headers: { 'Authorization': 'Bearer ' + t }
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);

  const blob = await r.blob();
  const cabecera = r.headers.get('Content-Disposition') || '';
  const m = cabecera.match(/filename="(.+?)"/);
  const nombre = m ? m[1] : 'alumnos-sinergia.csv';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return nombre;
}

// ── Utilidades compartidas ──────────────────────────────────────────
export function pesos(centavos) {
  return '$' + ((centavos || 0) / 100).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function fecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function nombreCurso(slug) {
  return String(slug || '').replace(/-/g, ' ');
}

// El nombre y el correo del alumno los escribe él en Stripe: nunca van
// crudos al HTML.
export function esc(txt) {
  return String(txt === null || txt === undefined ? '' : txt)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function telefonoWa(tel) {
  const limpio = String(tel || '').replace(/\D/g, '');
  return limpio ? 'https://wa.me/' + limpio : null;
}

export function aviso(msg, esError) {
  let el = document.getElementById('avisoFlotante');
  if (!el) {
    el = document.createElement('div');
    el.id = 'avisoFlotante';
    el.className = 'aviso';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'aviso visible' + (esError ? ' error' : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('visible'), 3500);
}

export function barraProgreso(pct) {
  const p = Math.max(0, Math.min(100, pct || 0));
  return `<div class="prog">
    <span class="prog-pista"><span class="prog-relleno" style="width:${p}%"></span></span>
    <span class="prog-pct tnum">${p}%</span>
  </div>`;
}
