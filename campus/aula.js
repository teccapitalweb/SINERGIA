/* ═══════════════════════════════════════════════════════════
   Campus Sinergia · aula de un curso
   Mismo sistema visual que el aula de cursos (detalle editorial, temario numerado, cards de materiales
   con visor, valoración con estrellas y solicitud de certificado), adaptado a cada curso de Sinergia.
   El servidor sigue decidiendo todo: qué clases hay, el video firmado, el avance y las descargas.
   ═══════════════════════════════════════════════════════════ */
import { CURSO_RIEGO, esCursoIndividual, landingCurso, portadaCurso, portadaPublica, mxn, validarOferta } from '../componentes/cursos-individuales-config.js?v=2';

const I = {
  casa: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
  clases: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  cert: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5"/><path d="m8.5 13-1.5 8 5-3 5 3-1.5-8"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>', check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  reloj: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  atras: '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>', flecha: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  salir: '<svg viewBox="0 0 24 24"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/></svg>',
  vivo: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M7 7a7 7 0 0 0 0 10M17 7a7 7 0 0 1 0 10"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z"/></svg>',
  escudo: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  descarga: '<svg viewBox="0 0 24 24"><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></svg>'
};
const ESTADOS_MX = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Estado de México','Guanajuato','Guerrero','Hidalgo','Jalisco','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas','Fuera de México'];

// Portadas definitivas: cuando existan, se escriben aquí (rutas del sitio). Sin portada se dibuja una de arte.
const PORTADAS = {
  'biofertilizantes': { clases: ['/campus/portadas/biofertilizantes-1.jpg', '/campus/portadas/biofertilizantes-2.jpg', '/campus/portadas/biofertilizantes-3.jpg', '/campus/portadas/biofertilizantes-4.jpg', '/campus/portadas/biofertilizantes-5.jpg'], materiales: ['/campus/portadas/mat-biofertilizantes-1.jpg', '/campus/portadas/mat-biofertilizantes-2.jpg', '/campus/portadas/mat-biofertilizantes-3.jpg', '/campus/portadas/mat-biofertilizantes-4.jpg', '/campus/portadas/mat-biofertilizantes-5.jpg'] },
  'cana-de-azucar': { clases: ['/campus/portadas/cana-de-azucar-1.jpg', '/campus/portadas/cana-de-azucar-2.jpg', '/campus/portadas/cana-de-azucar-3.jpg', '/campus/portadas/cana-de-azucar-4.jpg', '/campus/portadas/cana-de-azucar-5.jpg'], materiales: ['/campus/portadas/mat-cana-de-azucar-1.jpg', '/campus/portadas/mat-cana-de-azucar-2.jpg', '/campus/portadas/mat-cana-de-azucar-3.jpg', '/campus/portadas/mat-cana-de-azucar-4.jpg', '/campus/portadas/mat-cana-de-azucar-5.jpg'] },
  'soluciones-nutritivas': { clases: ['/campus/portadas/soluciones-nutritivas-1.jpg', '/campus/portadas/soluciones-nutritivas-2.jpg', '/campus/portadas/soluciones-nutritivas-3.jpg', '/campus/portadas/soluciones-nutritivas-4.jpg', '/campus/portadas/soluciones-nutritivas-5.jpg'], materiales: ['/campus/portadas/mat-soluciones-nutritivas-1.jpg', '/campus/portadas/mat-soluciones-nutritivas-2.jpg', '/campus/portadas/mat-soluciones-nutritivas-3.jpg', '/campus/portadas/mat-soluciones-nutritivas-4.jpg', '/campus/portadas/mat-soluciones-nutritivas-5.jpg'] }
};
const TEMA = {
  'biofertilizantes': { corto: 'Biofertilizantes', lema: 'Nutrición viva para tu suelo', motivo: 'hoja' },
  'cana-de-azucar': { corto: 'Caña de azúcar', lema: 'Del surco a la cosecha', motivo: 'cana' },
  'soluciones-nutritivas': { corto: 'Soluciones nutritivas', lema: 'La fórmula exacta para tu cultivo', motivo: 'gota' },
  [CURSO_RIEGO]: { corto: 'Riego eficiente', motivo: 'gota' }
};
const TIPO_MAT = { pptx: 'Presentación', ppt: 'Presentación', pdf: 'Documento', docx: 'Documento', doc: 'Documento', xlsx: 'Excel', xls: 'Excel', zip: 'Paquete', enlace: 'Enlace' };
const RV_FORMATO = { pdf: 'PDF', docx: 'Documento de Word', doc: 'Documento de Word', xlsx: 'Libro de Excel', xls: 'Libro de Excel', pptx: 'Presentación', ppt: 'Presentación', zip: 'Paquete' };
const RV_OFFICE = 'https://view.officeapps.live.com/op/embed.aspx?src=';
const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s) => document.querySelector(s);
const CAL = {};            // slug → estrellas elegidas sin guardar
let CERT_EDITAR = false, RV = null, X = null;   // X = contexto que pasa campus.js

// ── Portadas de arte (SVG propio, sin archivos) ─────────────
function arte(slug, etiqueta, numero) {
  const m = (TEMA[slug] || {}).motivo || 'hoja';
  const id = 'g' + Math.random().toString(36).slice(2, 8);
  const motivos = {
    hoja: '<path d="M250 150c0-58 40-104 112-112 6 70-30 124-112 112Z" fill="rgba(255,255,255,.16)"/><path d="M250 150c36-38 70-64 108-82" stroke="rgba(255,255,255,.4)" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="92" cy="150" r="54" fill="rgba(255,255,255,.07)"/><circle cx="60" cy="52" r="5" fill="var(--t3)"/><circle cx="118" cy="34" r="3" fill="rgba(255,255,255,.6)"/><circle cx="150" cy="70" r="4" fill="rgba(255,255,255,.35)"/>',
    cana: '<g stroke="rgba(255,255,255,.22)" stroke-width="13" stroke-linecap="round"><path d="M262 190V40"/><path d="M300 190V20"/><path d="M338 190V54"/></g><g stroke="rgba(0,0,0,.18)" stroke-width="2"><path d="M255 150h14M255 108h14M255 66h14M293 136h14M293 92h14M293 48h14M331 158h14M331 114h14M331 76h14"/></g><path d="M300 22c-30-10-52 2-64 22 26 4 48-2 64-22Z" fill="var(--t3)" opacity=".85"/><circle cx="84" cy="150" r="56" fill="rgba(255,255,255,.07)"/>',
    gota: '<path d="M300 34c30 40 46 66 46 90a46 46 0 0 1-92 0c0-24 16-50 46-90Z" fill="rgba(255,255,255,.17)"/><path d="M282 128a20 20 0 0 0 18 20" stroke="rgba(255,255,255,.55)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M232 96c12 16 18 26 18 36a18 18 0 0 1-36 0c0-10 6-20 18-36Z" fill="var(--t3)" opacity=".8"/><circle cx="88" cy="148" r="56" fill="rgba(255,255,255,.07)"/><circle cx="352" cy="170" r="7" fill="rgba(255,255,255,.3)"/>'
  };
  return `<svg class="sx-art" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--t1)"/><stop offset="1" stop-color="var(--t2)"/></linearGradient></defs>
    <rect width="400" height="225" fill="url(#${id})"/>
    <path d="M0 176c70-30 130 22 210-6s120-64 190-40v95H0Z" fill="rgba(0,0,0,.16)"/>
    ${motivos[m]}
    ${numero != null ? `<text x="26" y="150" font-family="Archivo,Inter,sans-serif" font-weight="800" font-size="96" fill="rgba(255,255,255,.94)" letter-spacing="-4">${esc(String(numero).padStart(2, '0'))}</text>` : ''}
    ${etiqueta && numero != null ? `<text x="28" y="186" font-family="Inter,sans-serif" font-weight="800" font-size="13" fill="rgba(255,255,255,.9)" letter-spacing="3">${esc(String(etiqueta).toUpperCase().slice(0, 30))}</text>` : ''}
    ${etiqueta && numero == null ? (() => { const t = String(etiqueta).slice(0, 44), k = t.length > 20 ? t.lastIndexOf(' ', Math.ceil(t.length / 2) + 3) : -1, l = k > 0 ? [t.slice(0, k), t.slice(k + 1)] : [t]; return `<text x="28" y="${l.length > 1 ? 96 : 110}" font-family="Archivo,Inter,sans-serif" font-weight="800" font-size="22" fill="rgba(255,255,255,.96)">${l.map((x, i) => `<tspan x="28" dy="${i ? 27 : 0}">${esc(x)}</tspan>`).join('')}</text>`; })() : ''}
  </svg>`;
}
const imgClase = (c, i) => portadaPublica(clasesDe(c)[i]?.portada) || (PORTADAS[c.slug]?.clases || [])[i] || (c.slug === CURSO_RIEGO ? portadaCurso(c) : '');
const imgMat = (c, m, i) => portadaPublica(m.portada) || (PORTADAS[c.slug]?.materiales || [])[i] || (c.slug === CURSO_RIEGO ? portadaCurso(c) : '');

// ── Adaptadores del modelo de Sinergia ─────────────────────
function clasesDe(c) { const l = []; c.modulos.forEach((m, mi) => m.clases.forEach((x) => l.push({ ...x, modulo: m, mi }))); return l; }
const vista = (c, id) => c.progreso.completadas.includes(id);
function siguiente(c) {
  const t = clasesDe(c);
  if (c.progreso.ultimaClase) {
    const i = t.findIndex((x) => x.id === c.progreso.ultimaClase);
    if (i >= 0 && !vista(c, t[i].id)) return t[i];
    const s = t.slice(i + 1).find((x) => !vista(c, x.id)); if (s) return s;
  }
  return t.find((x) => !vista(c, x.id)) || t[0] || null;
}
const tipoDe = (m) => String(m.ext || '').toLowerCase().replace(/^\./, '') || 'pdf';
const peso = (b) => (!b ? '' : b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1) + ' MB');
const contar = (n, unidad) => n + ' ' + unidad + (n === 1 ? '' : 's');
const estrellas = (n) => { let h = ''; for (let i = 1; i <= 5; i++) h += i <= Math.round(n) ? '★' : '<i>★</i>'; return `<span class="mc__st" aria-label="${n} de 5">${h}</span>`; };
const fecha = (iso) => { try { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (_) { return ''; } };
const base = (slug) => '#/curso/' + slug;
function toast(m, err) { const t = $('#mc-toast'); if (!t) return; t.textContent = m; t.className = 'mc__toast on' + (err ? ' err' : ''); clearTimeout(t._t); t._t = setTimeout(() => { t.className = 'mc__toast'; }, 3600); }
function estadoCertTexto(c) { const so = c.solicitudCertificado; return so ? ({ pendiente: 'Solicitado', en_proceso: 'En proceso', emitido: 'Emitido', rechazado: 'Revisión' })[so.estado] || 'Solicitado' : 'Sin solicitar'; }

// ── Marco del aula ─────────────────────────────────────────
const TABS = [
  { id: '', t: 'Inicio', lado: 'Mi curso', i: 'casa' },
  { id: 'clases', t: 'Clases', lado: 'Temario', i: 'clases' },
  { id: 'materiales', t: 'Materiales', lado: 'Materiales', i: 'doc' },
  { id: 'certificado', t: 'Certificado', lado: 'Mi certificado', i: 'cert' }
];

export function pintarAvatar(elemento, usuario, alumno) {
  const nombre = usuario.displayName?.trim() || alumno.nombre?.trim() || usuario.email?.trim() || alumno.email?.trim() || '?';
  elemento.textContent = Array.from(nombre)[0].toLocaleUpperCase('es-MX');
  const fotoGoogle = usuario.providerData?.find(p => p.providerId === 'google.com')?.photoURL;
  const foto = fotoGoogle || usuario.photoURL;
  if (!foto || !/^https:\/\//i.test(foto)) return;

  const imagen = document.createElement('img');
  imagen.alt = '';
  imagen.hidden = true;
  imagen.referrerPolicy = 'no-referrer';
  imagen.addEventListener('load', () => { imagen.hidden = false; }, { once: true });
  imagen.addEventListener('error', () => imagen.remove(), { once: true });
  elemento.append(imagen);
  imagen.src = foto;
}

function marco(c, activa) {
  const d = X.E.datos;
  const href = (t) => base(c.slug) + (t.id ? '/' + t.id : '');
  const pend = !c.solicitudCertificado;
  const wa = `https://wa.me/${X.WHATSAPP}?text=${encodeURIComponent('Hola, soy alumno de ' + c.titulo + ' en el Campus Sinergia y necesito ayuda')}`;
  return `<div class="mc" id="mi-curso" data-curso="${esc(c.slug)}">
    ${d.alumno.esAdmin ? '<div class="mc__equipo">Vista del equipo: ves todo el curso. Tu avance, valoración y solicitudes no se guardan.</div>' : ''}
    <header class="mc__top">
      <div class="mc__brand"><img src="/img/logo-sinergia-256.png" alt=""><div><small>Campus Sinergia · Aula</small><b id="mc-titulo">${esc(c.titulo)}</b></div></div>
      <a class="mc__me" id="mc-me" href="#/cuenta" aria-label="Mi cuenta"></a>
      <a class="mc__x" id="mc-cerrar" href="#/cursos" aria-label="Volver a mis cursos">${I.atras}<span>Mis cursos</span></a>
    </header>
    <div class="mc__shell">
      <aside class="mc__side" id="mc-side" aria-label="Menú del curso">
        <div class="mc__glabel">Aprendizaje</div>
        ${TABS.map((t) => `<a class="mc__ni ${t.id === activa ? 'on' : ''}" href="${href(t)}" ${t.id === activa ? 'aria-current="page"' : ''}>${I[t.i]}${t.lado}</a>`).join('')}
        <div class="mc__glabel">Campus Sinergia</div>
        <a class="mc__ni" href="#/cursos">${I.clases}Mis cursos</a>
        <a class="mc__ni" href="#/cuenta">${I.user}Mi cuenta</a>
        <a class="mc__ni" href="${wa}" target="_blank" rel="noopener">${I.wa}Soporte WhatsApp</a>
        <div class="mc__side-foot"><button type="button" class="mc__ni" data-salir>${I.salir}Cerrar sesión</button></div>
      </aside>
      <main class="mc__main" id="mc-body"><div class="mc__wrap" id="mc-view"></div></main>
    </div>
    <nav class="mc__tabs" id="mc-tabs" aria-label="Navegación del curso">${TABS.map((t) => `<a class="mc__tab ${t.id === activa ? 'on' : ''}" href="${href(t)}" data-tab="${t.id || 'inicio'}" ${t.id === activa ? 'aria-current="page"' : ''}>${I[t.i]}${t.t}${t.id === 'certificado' && pend && activa !== 'certificado' ? '<span class="dot"></span>' : ''}</a>`).join('')}</nav>
    <div class="mc__toast" id="mc-toast" role="status" aria-live="polite"></div>
  </div>`;
}

// ── Bloques ────────────────────────────────────────────────
function miniClase(c, i, cls) {
  const src = imgClase(c, i);
  return src ? `<img class="${cls}" src="${esc(src)}" alt="" loading="lazy">` : `<span class="${cls} art">${arte(c.slug, '', i + 1)}</span>`;
}
function filaClase(c, x, i, sig) {
  const v = vista(c, x.id), es = sig && sig.id === x.id && !v;
  const em = v ? 'Completada' : es ? 'Tu siguiente clase' : 'Disponible';
  // El círculo ya muestra el número; el título completo se conserva en el reproductor.
  const titulo = String(x.titulo ?? '').replace(/^Clase\s+\d+\s*[·:–—-]\s*(?=\S)/iu, '');
  const sub = (x.duracionMin ? x.duracionMin + ' min · ' : '') + (v ? 'Disponible para repasar' : 'Disponible ahora');
  const accion = v ? `<span class="mc__chip mc__chip--line">${I.check}<span>Repasar</span></span>` : es ? `<span class="mc__chip mc__chip--gold">${I.play}<span>Ver clase</span></span>` : `<span class="mc__chip mc__chip--line">${I.play}<span>Ver</span></span>`;
  return `<a class="mc__l conimg ${v ? 'vista' : ''} ${es ? 'sig' : ''}" href="${base(c.slug)}/clase/${esc(x.id)}">
    <span class="mc__ln">${v ? I.check : String(i + 1).padStart(2, '0')}</span>
    ${miniClase(c, i, 'mc__lth')}
    <span class="mc__lt"><em>${em}</em><strong>${esc(titulo)}</strong><small>${esc(sub)}</small></span>
    <span class="mc__la">${accion}</span>
  </a>`;
}
function bloqueTemario(c) {
  const sig = siguiente(c);
  let n = 0;
  const filas = c.modulos.map((m, mi) => {
    const grupo = m.clases.length > 1 ? `<div class="mc__mod"><span>Módulo ${mi + 1}</span><b>${esc(m.titulo)}</b></div>` : '';
    return grupo + m.clases.map((x) => filaClase(c, x, n++, sig)).join('');
  }).join('');
  const temario = filas ? `<div class="mc__tem">${filas}</div>`
    : '<div class="mc__card mc__empty"><h2>Las grabaciones aún no están publicadas</h2><p>Tu curso ya está en tu cuenta. En cuanto el equipo publique las clases aparecerán aquí, sin que hagas nada más.</p></div>';
  const programa = c.modulos.length ? `<details class="mc__programa">
    <summary>Contenido por módulo</summary>
    <ol>${c.modulos.map((m) => `<li><strong>${esc(m.titulo)}</strong>${m.descripcion ? `<p>${esc(m.descripcion)}</p>` : ''}</li>`).join('')}</ol>
  </details>` : '';
  return `${temario}${programa}
    ${c.enPreparacion.length ? `<span class="mc__eyebrow mute" style="margin-top:18px">Próximamente</span><div class="mc__prox">${c.enPreparacion.map((m) => `<div>${I.reloj}<span><b>${esc(m.titulo)}</b><small>${esc(m.descripcion || 'En preparación')}</small></span></div>`).join('')}</div>` : ''}`;
}
function panelAprendizaje(c) {
  const p = c.progreso, wa = `https://wa.me/${X.WHATSAPP}?text=${encodeURIComponent('Hola, soy alumno de ' + c.titulo + ' y tengo una duda')}`;
  return `<div class="mc__card mc__panel"><span class="mc__eyebrow mute">Tu aprendizaje</span>
    <div style="display:flex;gap:16px;align-items:center">
      <div class="mc__ring" style="--p:${p.porcentaje}"><div>${p.porcentaje}%<small>avance</small></div></div>
      <div style="min-width:0"><b style="font-family:'Archivo',sans-serif;font-size:1.02rem">${p.porcentaje >= 100 ? '¡Curso completado!' : 'Sigue avanzando'}</b>
      <p style="font-size:.78rem;color:var(--soft);margin-top:3px">${p.completadas.length} de ${p.total} clases completadas</p></div>
    </div>
    <div class="mc__bar"><i style="width:${p.porcentaje}%"></i></div>
    <div class="mc__pstat"><span>● Completadas ${p.completadas.length}</span><span>${Math.max(p.total - p.completadas.length, 0)} pendientes</span></div>
    <div class="mc__bene">
      <span>${I.escudo} Certificado con folio al concluir</span>
      <span>${I.doc} ${contar(c.materiales.length, 'recurso')} de apoyo</span>
      <span>${I.reloj} Avanza a tu propio ritmo</span>
    </div></div>
  <div class="mc__card mc__wa"><b>¿Dudas con tu curso?</b><p>Escríbenos y te ayudamos en minutos.</p>
    <a class="mc__btn mc__btn--p mc__btn--sm" href="${wa}" target="_blank" rel="noopener">${I.wa} WhatsApp directo</a></div>`;
}
function nombreModulo(c, m) { const i = c.modulos.findIndex((x) => x.id === m.moduloId); return i >= 0 ? 'Módulo ' + (i + 1) : 'Material general'; }
function matCard(c, m, i) {
  const src = imgMat(c, m, i), tipo = TIPO_MAT[tipoDe(m)] || 'Documento';
  return `<article class="mc__mc">
    <button type="button" class="mc__mcov" data-mat="${esc(m.id)}" aria-label="Abrir ${esc(m.nombre)}">
      ${arte(c.slug, '')}${src ? `<img src="${esc(src)}" alt="" loading="lazy">` : ''}
      <span class="tag">${esc(tipo)}</span><span class="num">${String(i + 1).padStart(2, '0')}</span>
    </button>
    <div class="mc__mbody">
      <span class="mc__mcat">${esc(nombreModulo(c, m))}</span>
      <h3>${esc(m.nombre)}</h3>
      <p>${esc([RV_FORMATO[tipoDe(m)] || 'Archivo', peso(m.tamano)].filter(Boolean).join(' · '))}</p>
      <div class="mc__mfol">${I.doc} Material del curso · ${esc((TEMA[c.slug] || {}).corto || c.titulo)}</div>
      <div class="mc__mfoot"><span class="mc__mown">${I.check} Incluido</span>
        <button type="button" class="mc__mopen" data-mat="${esc(m.id)}">Abrir</button></div>
    </div>
  </article>`;
}
function matFila(c, m) {
  const i = c.materiales.indexOf(m), src = imgMat(c, m, i);
  return `<button class="mc__m" type="button" data-mat="${esc(m.id)}">${src ? `<img class="mc__mth" src="${esc(src)}" alt="" loading="lazy">` : `<span class="mc__mth art">${arte(c.slug, '', i + 1)}</span>`}<span><b>${esc(m.nombre)}</b><small>${esc((TIPO_MAT[tipoDe(m)] || 'Documento') + ' · ' + nombreModulo(c, m))}</small></span>${I.descarga}</button>`;
}
function bloqueCalifica(c) {
  const k = c.calificaciones || { promedio: 0, total: 0, mia: null };
  const sel = CAL[c.slug] || (k.mia ? k.mia.estrellas : 0);
  const ETQ = ['', 'Puede mejorar', 'Regular', 'Buen curso', 'Muy buen curso', 'Excelente curso'];
  return `<span class="mc__eyebrow">Tu experiencia importa</span>
  <div class="mc__sh" style="margin-top:4px"><h2>Califica este curso</h2></div>
  <p class="mc__msnota">Tu opinión nos ayuda a mejorar cada curso. El comentario es opcional.</p>
  <div class="mc__card mc__cal">
    <div class="mc__calprom">${k.total ? `${estrellas(k.promedio)}<b>${k.promedio}</b><small>/ 5 · ${k.total} ${k.total === 1 ? 'valoración' : 'valoraciones'}</small>` : '<b>— / 5</b><small>Sé el primero en valorar este curso</small>'}</div>
    <span style="font-size:.78rem;font-weight:700;color:var(--soft)">Tu calificación</span>
    <div class="mc__stars" id="mc-stars" role="radiogroup" aria-label="Tu calificación">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-star="${i}" class="${i <= sel ? 'on' : ''}" aria-label="${i} estrellas">★</button>`).join('')}</div>
    <div class="mc__callbl" id="mc-callbl">${sel ? '● ' + ETQ[sel] : 'Elige una calificación'}</div>
    <textarea id="mc-calcom" maxlength="1000" placeholder="Cuéntanos qué te gustó o qué podríamos mejorar…">${esc(k.mia?.comentario || '')}</textarea>
    <div class="mc__calfoot"><small id="mc-calcnt">${(k.mia?.comentario || '').length} / 1000</small>
    <button type="button" class="mc__btn mc__btn--d mc__btn--sm" id="mc-calguardar">${k.mia ? 'Actualizar valoración' : 'Guardar valoración'}</button></div>
  </div>`;
}
function ligarCalifica(c) {
  const stars = $('#mc-stars'); if (!stars) return;
  const ETQ = ['', 'Puede mejorar', 'Regular', 'Buen curso', 'Muy buen curso', 'Excelente curso'];
  if (!CAL[c.slug] && c.calificaciones?.mia) CAL[c.slug] = c.calificaciones.mia.estrellas;
  stars.querySelectorAll('[data-star]').forEach((b) => b.onclick = () => {
    CAL[c.slug] = Number(b.dataset.star);
    stars.querySelectorAll('[data-star]').forEach((s) => s.classList.toggle('on', Number(s.dataset.star) <= CAL[c.slug]));
    $('#mc-callbl').textContent = '● ' + ETQ[CAL[c.slug]];
  });
  const ta = $('#mc-calcom'), cnt = $('#mc-calcnt'); ta.oninput = () => { cnt.textContent = ta.value.length + ' / 1000'; };
  $('#mc-calguardar').onclick = async () => {
    if (!CAL[c.slug]) return toast('Elige de 1 a 5 estrellas', true);
    const b = $('#mc-calguardar'); b.disabled = true;
    try {
      const r = await X.api('/campus/calificacion', { body: { curso: c.slug, estrellas: CAL[c.slug], comentario: ta.value } });
      if (r.vistaAdmin) { toast('Vista del equipo: la valoración no se guarda'); b.disabled = false; return; }
      c.calificaciones = r.calificaciones; toast('¡Gracias! Guardamos tu valoración'); X.render();
    } catch (e) { b.disabled = false; toast(e.message || 'No pudimos guardar tu valoración', true); }
  };
}
function prepararPortadas(contenedor) {
  contenedor.querySelectorAll('.mc__banner img, .mc__mcov img, img.mc__lth, img.mc__mth').forEach(imagen => {
    const sinPortada = () => {
      if (imagen.matches('.mc__banner img, .mc__mcov img')) {
        imagen.remove();
        return;
      }
      const respaldo = document.createElement('span');
      respaldo.className = imagen.className + ' mc__imagen-vacia';
      respaldo.setAttribute('aria-hidden', 'true');
      respaldo.innerHTML = imagen.classList.contains('mc__lth') ? I.play : I.doc;
      imagen.replaceWith(respaldo);
    };
    if (imagen.complete && !imagen.naturalWidth) sinPortada();
    else imagen.addEventListener('error', sinPortada, { once: true });
  });
}


function ligar(c) {
  prepararPortadas($('#mc-view'));
  document.querySelectorAll('#mi-curso [data-mat]').forEach((b) => b.onclick = () => abrirVisor(c, b.dataset.mat, X.api));
  ligarCalifica(c);
}

// ── Vistas ─────────────────────────────────────────────────
function vistaInicio(c) {
  const p = c.progreso, sig = siguiente(c), cl = clasesDe(c);
  const minTot = cl.reduce((a, x) => a + (x.duracionMin || 0), 0);
  const dur = minTot ? (minTot >= 90 ? (Math.round(minTot / 6) / 10) + ' horas' : minTot + ' min') : '—';
  const estado = !c.contenidoListo ? 'En preparación' : p.porcentaje >= 100 ? 'Completado' : p.completadas.length ? 'En progreso' : 'Por empezar';
  const port = portadaCurso(c);
  const regalo = X.E.datos.cursos.find(x => x.origen === 'regalo' && x.regaloDe === c.slug && x.slug === CURSO_RIEGO);
  $('#mc-view').innerHTML = `<section class="mc__hero" aria-labelledby="mc-curso-nombre">
    <div class="mc__head">
      <span class="mc__eyebrow">${I.escudo} Aula del curso</span>
      <h1 id="mc-curso-nombre">${esc(c.titulo)}</h1>
      ${c.descripcion ? `<p class="mc__desc">${esc(c.descripcion)}</p>` : ''}
      <div class="mc__meta">
        ${c.ponente ? `<span>${I.user} ${esc(c.ponente)}</span>` : ''}
        <span>${I.clases} ${contar(c.modulos.length + c.enPreparacion.length, 'módulo')}</span>
      </div>
      <div class="mc__ctafila">
        ${sig ? `<a class="mc__btn mc__btn--p" href="${base(c.slug)}/clase/${esc(sig.id)}">${p.completadas.length || c.progreso.ultimaClase ? 'Continuar curso' : 'Comenzar curso'} ${I.flecha}</a>` : ''}
        <span class="mc__chip ${p.completadas.length ? 'mc__chip--ok' : ''}">${p.completadas.length ? I.play : I.reloj} ${estado}</span>
        ${c.origen === 'regalo' ? '<span class="mc__chip mc__chip--gold">Regalo incluido</span>' : ''}
      </div>
      <div class="mc__prog"><span>Tu avance</span><div class="mc__bar" role="progressbar" aria-label="Tu avance" aria-valuenow="${p.porcentaje}"><i style="width:${p.porcentaje}%"></i></div><b>${p.porcentaje}%</b></div>
    </div>
    <div class="mc__banner">${arte(c.slug, '')}${port ? `<img src="${esc(port)}" alt="">` : ''}</div>
  </section>
  <div class="mc__cols"><div>
    <div class="mc__stats">
      <div>${I.reloj}<small>Duración</small><b>${esc(dur)}</b></div>
      <div>${I.clases}<small>Contenido</small><b>${contar(cl.length, 'clase')}</b></div>
      <div>${I.doc}<small>Material de apoyo</small><b>${contar(c.materiales.length, 'recurso')}</b></div>
    </div>
    <div class="mc__sec">
      <span class="mc__eyebrow">Ruta de aprendizaje</span>
      <div class="mc__sh" style="margin-top:4px"><h2>Temario del curso</h2><b>${contar(cl.length, 'clase')}</b></div>
      ${bloqueTemario(c)}
    </div>
    ${c.materiales.length ? `<div class="mc__sec">
      <span class="mc__eyebrow">Recursos incluidos</span>
      <div class="mc__sh" style="margin-top:4px"><h2>Material del curso</h2><b>${contar(c.materiales.length, 'recurso')}</b></div>
      <p class="mc__msnota">Abre cada archivo para verlo en pantalla o descargarlo.</p>
      <div class="mc__mgrid">${c.materiales.map((m, i) => matCard(c, m, i)).join('')}</div>
    </div>` : ''}
    ${regalo ? `<section class="mc__sec mc__regalo"><img src="${esc(portadaCurso(regalo))}" alt="" loading="lazy"><div><span class="mc__eyebrow">Tu curso de regalo</span><h2>${esc(regalo.titulo)}</h2></div><a class="mc__btn mc__btn--p" href="${base(regalo.slug)}">Abrir curso ${I.flecha}</a></section>` : ''}
    <div class="mc__sec">${bloqueCalifica(c)}</div>
  </div>
  <aside class="mc__aside">${panelAprendizaje(c)}</aside></div>`;
  ligar(c);
}
export function recomendarCursos(datos, c, encabezado = 'Porque adquiriste este curso te podría interesar') {
  if (!esCursoIndividual(c.slug) || c.origen === 'regalo' ||
      !(datos.compras || []).some(x => x.curso === c.slug && x.monto > 0)) return '';
  const pendientes = (datos.otros || []).filter(x => landingCurso(x.slug) && x.slug !== c.slug);
  if (!pendientes.length) return '';
  return `<section class="mc__sec mc__recomendados">
    <h2>${esc(encabezado)}</h2>
    <div class="mc__recomendados-grid">${pendientes.map(x => `
      <a class="mc__recomendado" data-origen="${esc(c.slug)}" data-destino="${esc(x.slug)}" href="${esc(landingCurso(x.slug, c.slug))}">
        <img src="${esc(portadaCurso(x))}" alt="" loading="lazy">
        <div><h3>${esc(x.titulo)}</h3><p data-precio-alumno hidden></p><span>Ver curso ${I.flecha}</span></div>
      </a>`).join('')}</div>
  </section>`;
}

export function mostrarPreciosRecomendados(app, api) {
  for (const tarjeta of app.querySelectorAll('.mc__recomendado')) {
    const { origen: origenSlug, destino: destinoSlug } = tarjeta.dataset;
    api('/publico/cursos/promociones/cotizar', { body: { origenSlug, destinoSlug } })
      .then(({ oferta }) => {
        const precio = validarOferta(oferta, origenSlug, destinoSlug);
        if (!tarjeta.isConnected || !precio) return;
        const nodo = tarjeta.querySelector('[data-precio-alumno]');
        nodo.innerHTML = `<s>${mxn(precio.precioCentavos)}</s> <b>${mxn(precio.totalCentavos)}</b>`;
        nodo.hidden = false;
      })
      .catch(() => {});
  }
}

function vistaClases(c) {
  $('#mc-view').innerHTML = `<div class="mc__cols"><div>
    <span class="mc__eyebrow">Ruta de aprendizaje</span>
    <div class="mc__sh" style="margin-top:4px"><h2>Temario del curso</h2><b>${contar(clasesDe(c).length, 'clase')}</b></div>
    ${bloqueTemario(c)}
    ${recomendarCursos(X.E.datos, c)}
  </div><aside class="mc__aside">${panelAprendizaje(c)}</aside></div>`;
  mostrarPreciosRecomendados(X.app, X.api);
  ligar(c);
}
function vistaMateriales(c) {
  const n = c.materiales.length;
  $('#mc-view').innerHTML = `<section class="mc__mhero">
      <h2>Materiales del curso</h2>
      <p>Abre las guías, formatos y presentaciones o descárgalos para estudiar.</p>
      <div class="box"><b>${n}</b><div><span>${n === 1 ? 'recurso disponible' : 'recursos disponibles'}</span></div></div>
    </section>
    ${n ? `<div class="mc__mgrid mc__sec">${c.materiales.map((m, i) => matCard(c, m, i)).join('')}</div>
      <div class="mc__mnote">${I.escudo}<span>Cada archivo se prepara al momento y solo para tu cuenta. Puedes abrirlo las veces que quieras.</span></div>`
    : '<div class="mc__card mc__empty"><h2>Sin materiales por ahora</h2><p>Cuando el equipo publique las guías y herramientas del curso, aparecerán aquí.</p></div>'}`;
  ligar(c);
}
function vistaCertificado(c) {
  const so = c.solicitudCertificado, p = c.progreso, u = X.E.datos.alumno;
  const emitido = so?.estado === 'emitido';
  const pasos = `<aside class="mc__card mc__pasos" aria-label="Avance y emisión del certificado">
    <div class="mc__rowstat"><span>Avance del curso</span><b>${p.porcentaje}%</b></div>
    <div class="mc__bar" role="progressbar" aria-label="Avance del curso" aria-valuenow="${p.porcentaje}"><i style="width:${p.porcentaje}%"></i></div>
    <details class="mc__cert-detalle"><summary>Cómo funciona</summary><div>
    <div class="mc__paso ${so ? 'ok' : ''}"><b>${so ? '✓' : '1'}</b><span>Envías tus datos tal como deben aparecer en el certificado.</span></div>
    <div class="mc__paso ${so?.estado === 'en_proceso' || emitido ? 'ok' : ''}"><b>${so?.estado === 'en_proceso' || emitido ? '✓' : '2'}</b><span>El equipo de Sinergia revisa tu solicitud y emite el certificado con folio verificable.</span></div>
    <div class="mc__paso ${emitido ? 'ok' : ''}"><b>${emitido ? '✓' : '3'}</b><span>Te lo enviamos a tu correo y WhatsApp.</span></div>
    </div></details></aside>`;
  let cuerpo;
  if (emitido) {
    cuerpo = `<div class="mc__cfh"><i>${I.cert}</i><div><h2>Tu certificado está listo</h2><p>${so.folio ? `Folio <b>${esc(so.folio)}</b> · ` : ''}verificable en línea.</p></div></div>
      <div class="mc__estado"><p>Te lo enviamos a tu correo y WhatsApp. Si no lo encuentras, escríbenos y te lo reenviamos.</p>
      ${so.folio ? `<a class="mc__btn mc__btn--p" href="/validar-certificado.html?folio=${encodeURIComponent(so.folio)}" target="_blank" rel="noopener">${I.cert} Verificar mi certificado</a>` : ''}</div>`;
  } else if (so && !CERT_EDITAR) {
    const txt = ({ pendiente: 'Recibimos tu solicitud', en_proceso: 'Tu certificado está en proceso', rechazado: 'Necesitamos revisar tus datos' })[so.estado] || 'Recibimos tu solicitud';
    cuerpo = `<div class="mc__cfh"><i>${I.cert}</i><div><h2>${txt}</h2><p>${fecha(so.fechaSolicitud) ? 'Enviada el ' + esc(fecha(so.fechaSolicitud)) + '. ' : ''}${so.estado === 'rechazado' && so.nota ? esc(so.nota) : 'Te avisaremos por correo y WhatsApp cuando esté emitido.'}</p></div></div>
      <div class="mc__estado"><dl>
        <dt>Nombre en el certificado</dt><dd><b>${esc(so.nombreCompleto)}</b></dd>
        <dt>WhatsApp</dt><dd>${esc(so.whatsapp || '—')}</dd>
        <dt>Ubicación</dt><dd>${esc([so.ciudad, so.estadoRep].filter(Boolean).join(', ') || '—')}</dd>
        <dt>Correo</dt><dd>${esc(u.email || '—')}</dd>
      </dl>
      ${so.estado !== 'en_proceso' ? '<button type="button" class="mc__btn mc__btn--l mc__btn--sm" id="mc-cert-editar">Corregir mis datos</button>' : ''}</div>`;
  } else {
    const v = so || {};
    cuerpo = `<div class="mc__cfh"><i aria-hidden="true">${I.cert}</i><div><h2>Solicitar mi certificado</h2><p>Escribe tu nombre tal como debe aparecer en el certificado.</p></div></div>
      <form class="mc__form" id="mc-cert-form" novalidate>
        <label class="mc__field">Nombre completo<input id="cf-nombre" autocomplete="name" maxlength="120" value="${esc(v.nombreCompleto || u.nombre || '')}" placeholder="Nombre y apellidos" required></label>
        <div class="mc__grid2">
          <label class="mc__field">WhatsApp<input id="cf-wa" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" value="${esc(v.whatsapp || '')}" placeholder="10 dígitos" required></label>
          <label class="mc__field">Estado<select id="cf-estado" required><option value="">Selecciona…</option>${ESTADOS_MX.map((e) => `<option ${v.estadoRep === e ? 'selected' : ''}>${e}</option>`).join('')}</select></label>
        </div>
        <dl class="mc__cert-correo"><dt>Correo de entrega</dt><dd>${esc(u.email || '—')}</dd></dl>
        <details class="mc__cert-detalle" id="cf-opcionales"><summary>Datos opcionales</summary><div>
          <label class="mc__field">Ciudad o municipio<input id="cf-ciudad" maxlength="80" value="${esc(v.ciudad || '')}" autocomplete="address-level2"></label>
          <label class="mc__field">Ocupación<input id="cf-ocup" maxlength="80" value="${esc(v.ocupacion || '')}"></label>
          <label class="mc__field">Comentarios<textarea id="cf-com" maxlength="400">${esc(v.comentario || v.comentarios || '')}</textarea></label>
        </div></details>
        <p class="mc__msg" id="cf-error" role="alert" tabindex="-1" hidden></p>
        <div class="mc__cert-acciones">
          <button class="mc__btn mc__btn--p" type="submit" id="cf-enviar">${I.cert} Solicitar mi certificado</button>
          ${CERT_EDITAR ? '<button type="button" class="mc__btn mc__btn--l" id="cf-cancelar">Cancelar</button>' : ''}
        </div>
      </form>`;
  }
  $('#mc-view').innerHTML = `<section class="mc__cert" aria-labelledby="mc-cert-titulo">
    <header class="mc__cert-titulo"><h1 id="mc-cert-titulo">Mi certificado</h1><span class="mc__chip${emitido ? ' mc__chip--ok' : ''}">${estadoCertTexto(c)}</span></header>
    <div class="mc__cf"><div class="mc__card mc__cert-card">${cuerpo}</div>${pasos}</div>
  </section>`;
  const ed = $('#mc-cert-editar'); if (ed) ed.onclick = () => { CERT_EDITAR = true; vistaCertificado(c); };
  const ca = $('#cf-cancelar'); if (ca) ca.onclick = () => { CERT_EDITAR = false; vistaCertificado(c); };
  const f = $('#mc-cert-form');
  const err = (m) => {
    const aviso = $('#cf-error');
    aviso.textContent = m;
    aviso.hidden = false;
    aviso.focus();
  };
  if (f) f.onsubmit = async (ev) => {
    ev.preventDefault();
    const nombre = $('#cf-nombre').value.trim(), wa = $('#cf-wa').value.trim(), est = $('#cf-estado').value;
    if (nombre.split(/\s+/).filter(Boolean).length < 2) return err('Escribe tu nombre completo (nombre y apellidos).');
    if (wa.replace(/\D/g, '').length < 10) return err('Escribe un WhatsApp de 10 dígitos.');
    if (!est) return err('Selecciona tu estado.');
    $('#cf-error').hidden = true;
    const b = $('#cf-enviar'); b.disabled = true; b.textContent = 'Enviando…';
    try {
      const r = await X.api('/campus/certificado/solicitar', { body: { curso: c.slug, nombreCompleto: nombre, whatsapp: wa, estadoRep: est, ciudad: $('#cf-ciudad').value, ocupacion: $('#cf-ocup').value, comentario: $('#cf-com').value } });
      if (r.vistaAdmin) { toast('Vista del equipo: la solicitud no se guarda'); b.disabled = false; b.innerHTML = I.cert + ' Solicitar mi certificado'; return; }
      c.solicitudCertificado = r.solicitudCertificado; CERT_EDITAR = false;
      X.render(); toast('¡Listo! Recibimos tu solicitud de certificado');
    } catch (e) { b.disabled = false; b.innerHTML = I.cert + ' Solicitar mi certificado'; err(e.message || 'No pudimos enviar tu solicitud'); }
  };
}
async function vistaClase(c, id) {
  const todas = clasesDe(c), idx = todas.findIndex((x) => x.id === id), x = todas[idx];
  if (!x) { $('#mc-view').innerHTML = `<div class="mc__card mc__empty"><h2>Esta clase no está disponible</h2><p>Puede que el equipo la esté actualizando.</p><div class="mc__acts"><a class="mc__btn mc__btn--p" href="${base(c.slug)}/clases">Volver al temario</a></div></div>`; return; }
  const prev = todas[idx - 1], next = todas[idx + 1], v = vista(c, id), p = c.progreso;
  const mats = c.materiales.filter((m) => m.moduloId === x.modulo.id);
  $('#mc-view').innerHTML = `<a class="mc__back" href="${base(c.slug)}/clases"><span>${I.atras}</span> ${esc(c.titulo)}</a>
  <div class="mc__pl"><div>
    <div class="mc__player" id="mc-player"><div class="mc__pst"><div class="mc__spin"></div><span>Preparando la clase…</span></div></div>
    <div class="mc__lh"><span class="mc__eyebrow">Módulo ${x.mi + 1} · Clase ${idx + 1} de ${todas.length}</span>
      <h1>${esc(x.titulo)}</h1>
      <div class="mc__lmeta">
        <span class="mc__chip">${p.completadas.length} de ${p.total} vistas · ${p.porcentaje}%</span>
        <span class="mc__chip ${v ? 'mc__chip--ok' : ''}" id="mc-chip">${v ? I.check + ' Ya vista · continúa' : (x.duracionMin ? I.reloj + ' ' + x.duracionMin + ' min' : 'En curso')}</span>
      </div></div>
    <div class="mc__nav">
      ${prev ? `<a class="mc__btn mc__btn--l" href="${base(c.slug)}/clase/${esc(prev.id)}">${I.atras} Anterior</a>` : ''}
      <button class="mc__btn ${v ? 'mc__btn--l' : 'mc__btn--g'}" id="mc-vista" disabled>${I.check} ${v ? 'Clase vista' : 'Marcar como vista'}</button>
      ${next ? `<a class="mc__btn mc__btn--p" href="${base(c.slug)}/clase/${esc(next.id)}">Siguiente ${I.flecha}</a>` : ''}
    </div>
    <p class="mc__nota" id="mc-nota"></p>
    ${x.descripcion ? `<div class="mc__sec mc__card mc__resumen"><span class="mc__eyebrow">Resumen de la clase</span><h3>Lo que vas a aprender</h3><p>${esc(x.descripcion)}</p>
      <div class="mc__verif">${I.escudo} Contenido verificado por el equipo de Sinergia Agrícola</div></div>` : ''}
    ${next ? `<div class="mc__sec"><span class="mc__eyebrow mute">A continuación · Clase ${idx + 2}</span>
      <a class="mc__card mc__next" style="margin-top:8px" href="${base(c.slug)}/clase/${esc(next.id)}">
        ${miniClase(c, idx + 1, '')}
        <span style="min-width:0;text-align:left;flex:1"><b>${esc(next.titulo)}</b><small>${next.duracionMin ? next.duracionMin + ' min · ' : ''}Lista para continuar</small></span>
        <span class="mc__go">${I.flecha}</span></a></div>` : ''}
    ${mats.length ? `<div class="mc__sec"><span class="mc__eyebrow">Tu espacio de estudio</span>
      <div class="mc__sh" style="margin-top:4px"><h2>Recursos de este módulo</h2><b>${mats.length}</b></div>
      <div class="mc__ms">${mats.map((m) => matFila(c, m)).join('')}</div></div>` : ''}
    <div class="mc__sec">${bloqueCalifica(c)}</div>
  </div>
  <aside class="mc__card mc__list" aria-label="Clases del curso"><h3>${esc(c.titulo)}</h3><p>${p.completadas.length} de ${p.total} clases vistas</p>
    ${todas.map((k, i) => `<a class="mc__li ${k.id === id ? 'on' : ''} ${vista(c, k.id) ? 'vista' : ''}" href="${base(c.slug)}/clase/${esc(k.id)}"><span>${vista(c, k.id) ? I.check : i + 1}</span><span>${esc(k.titulo)}<small>${k.duracionMin ? k.duracionMin + ' min' : 'Grabación'}</small></span></a>`).join('')}
  </aside></div>`;
  ligar(c);
  const esAdmin = X.E.datos.alumno.esAdmin;
  try {
    const r = await X.api('/campus/video', { body: { curso: c.slug, claseId: id } });
    const pl = $('#mc-player'); if (!pl || location.hash.indexOf('/clase/' + id) < 0) return;
    pl.innerHTML = `<iframe src="${esc(r.url)}" title="${esc(x.titulo)}" loading="lazy" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    c.progreso.ultimaClase = id;
    const b = $('#mc-vista'), n = $('#mc-nota');
    if (v || !b) return;
    if (esAdmin) { n.textContent = 'Vista del equipo: el avance no se guarda.'; return; }
    let resta = Number(r.minimoSegundos) || 0;
    const tic = () => {
      if (resta <= 0) { b.disabled = false; n.textContent = ''; clearInterval(X.E.cuentaAtras); return; }
      n.textContent = 'Podrás marcarla como vista al avanzar en la clase (' + Math.floor(resta / 60) + ':' + String(resta % 60).padStart(2, '0') + ')';
      resta--;
    };
    clearInterval(X.E.cuentaAtras); tic(); X.E.cuentaAtras = setInterval(tic, 1000);
    b.onclick = async () => {
      b.disabled = true;
      try {
        await X.api('/campus/progreso', { body: { curso: c.slug, claseId: id, accion: 'completar' } });
        if (!c.progreso.completadas.includes(id)) c.progreso.completadas.push(id);
        c.progreso.porcentaje = c.progreso.total ? Math.round(c.progreso.completadas.length * 100 / c.progreso.total) : 0;
        b.className = 'mc__btn mc__btn--l'; b.innerHTML = I.check + ' Clase vista';
        const ch = $('#mc-chip'); if (ch) { ch.className = 'mc__chip mc__chip--ok'; ch.innerHTML = I.check + ' Ya vista · continúa'; }
        toast('¡Clase vista! Tu avance quedó guardado.');
      } catch (e) {
        if (e.datos && e.datos.faltanSegundos) toast('Aún te faltan ' + Math.ceil(e.datos.faltanSegundos / 60) + ' min de la clase.', true);
        else toast(e.message || 'No pudimos guardar tu avance', true);
        b.disabled = false;
      }
    };
  } catch (e) {
    const pl = $('#mc-player'); if (pl) pl.innerHTML = `<div class="mc__pst">${I.lock}<b>${esc(e.message || 'No pudimos abrir el video')}</b></div>`;
  }
}

// ── Visor de materiales dentro del aula ────────────────────
const RV_I = {
  file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  full: '<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  x: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};
export function cerrarVisor() {
  if (!RV) return; const k = RV; RV = null;
  try { k.destroy && k.destroy(); } catch (_) {}
  if (k.blobUrl) URL.revokeObjectURL(k.blobUrl);
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  k.root.classList.remove('on'); document.body.classList.remove('mcrv-lock');
  document.removeEventListener('keydown', k.onKey, true);
  setTimeout(() => k.root.remove(), 200);
}
export function abrirVisor(c, id, api) {
  const m = c.materiales.find((x) => x.id === id); if (!m) return;
  if (RV) cerrarVisor();
  const tipo = tipoDe(m), formato = RV_FORMATO[tipo] || 'Archivo';
  const root = document.createElement('div');
  root.className = 'mcrv'; root.id = 'mc-visor'; root.dataset.curso = c.slug; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', m.nombre);
  root.innerHTML = `<header class="mcrv__bar"><span class="mcrv__ic">${RV_I.file}</span>
    <div class="mcrv__id"><strong>${esc(m.nombre)}</strong><small>${esc(['Materiales del curso', nombreModulo(c, m), formato].join(' · '))}</small></div>
    <div class="mcrv__tools">
      <a class="mcrv__b" id="mcrv-dl" hidden title="Descargar" aria-label="Descargar">${RV_I.down}<span>Descargar</span></a>
      <button type="button" class="mcrv__b" id="mcrv-full" title="Pantalla completa" aria-label="Pantalla completa">${RV_I.full}</button>
      <button type="button" class="mcrv__b mcrv__b--x" id="mcrv-x" aria-label="Cerrar">${RV_I.x}<span>Cerrar</span></button>
    </div></header><div class="mcrv__stage"></div>`;
  document.body.appendChild(root); document.body.classList.add('mcrv-lock');
  requestAnimationFrame(() => root.classList.add('on'));
  const ctx = { root, onKey: (e) => { if (e.key === 'Escape' && !document.fullscreenElement) { e.stopPropagation(); cerrarVisor(); } } };
  document.addEventListener('keydown', ctx.onKey, true); RV = ctx;
  const stage = root.querySelector('.mcrv__stage');
  const estado = (html) => { stage.classList.remove('pdf'); stage.innerHTML = `<div class="mcrv__st"><div>${html}</div></div>`; };
  const descarga = (url, txt, nombre) => `<a class="mcrv__b" href="${esc(url)}" ${nombre ? 'download="' + esc(nombre) + '"' : 'target="_blank" rel="noopener"'}>${RV_I.down}<span style="display:inline">${txt}</span></a>`;
  root.querySelector('#mcrv-x').onclick = cerrarVisor;
  root.querySelector('#mcrv-full').onclick = () => {
    if (document.fullscreenElement) { document.exitFullscreen && document.exitFullscreen(); return; }
    if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
    else if (ctx.viewerUrl) window.open(ctx.viewerUrl, '_blank', 'noopener');
  };
  estado('<div class="mcrv__spin"></div><h3>Preparando tu material…</h3><p>Un momento, estamos verificando tu acceso.</p>');
  api('/campus/material', { body: { curso: c.slug, id } }).then(async (r) => {
    if (RV !== ctx) return;
    let url = r.url, nombreDescarga = '';
    if (typeof r.archivo?.base64 === 'string' && r.archivo.base64) {
      const bytes = Uint8Array.from(atob(r.archivo.base64), c => c.charCodeAt(0));
      ctx.blobUrl = URL.createObjectURL(new Blob([bytes], { type: tipo === 'pdf' ? 'application/pdf' : 'application/octet-stream' }));
      url = ctx.blobUrl;
      nombreDescarga = r.archivo.nombreArchivo || m.nombre;
    }
    if (!url) throw new Error('El archivo todavía no está disponible.');
    const dl = root.querySelector('#mcrv-dl');
    dl.href = url;
    dl.hidden = false;
    if (nombreDescarga) dl.download = nombreDescarga;
    else { dl.target = '_blank'; dl.rel = 'noopener'; }
    if (/^(pptx?|docx?|xlsx?)$/.test(tipo)) {
      if (ctx.blobUrl) {
        estado(`<h3>Tu archivo está listo</h3><p>Descárgalo y ábrelo con una aplicación de Office en tu dispositivo.</p>${descarga(url, 'Descargar', nombreDescarga)}`);
        return;
      }
      ctx.viewerUrl = RV_OFFICE + encodeURIComponent(url);
      stage.innerHTML = `<div class="mcrv__st" id="mcrv-wait"><div><div class="mcrv__spin"></div><h3>Abriendo el visor…</h3><p>Los archivos de Office tardan unos segundos en mostrarse.</p></div></div>
        <iframe class="mcrv__frame" title="${esc(m.nombre)}" src="${esc(ctx.viewerUrl)}" allowfullscreen></iframe>`;
      const frame = stage.querySelector('iframe'), wait = stage.querySelector('#mcrv-wait');
      frame.style.visibility = 'hidden';
      const listo = () => { frame.style.visibility = ''; if (wait.isConnected) wait.remove(); };
      frame.addEventListener('load', listo); setTimeout(listo, 12000);
      return;
    }
    if (tipo === 'pdf') {
      estado('<div class="mcrv__spin"></div><h3>Abriendo el documento…</h3><p>Cargando las páginas.</p>');
      try {
        const lib = await import(PDFJS); lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        const pdf = await lib.getDocument({ url, disableRange: true, disableStream: true, withCredentials: false }).promise;
        if (RV !== ctx) { pdf.destroy(); return; }
        ctx.destroy = () => pdf.destroy();
        ctx.viewerUrl = url;
        stage.classList.add('pdf'); stage.innerHTML = '<div class="mcrv__pages"></div>';
        const cont = stage.querySelector('.mcrv__pages');
        const ancho = Math.min(stage.clientWidth - 12, 980), ratio = Math.min(window.devicePixelRatio || 1, 2);
        for (let n = 1; n <= pdf.numPages; n++) {
          if (RV !== ctx) return;
          const page = await pdf.getPage(n), v1 = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: (ancho / v1.width) * ratio });
          const caja = document.createElement('div'); caja.className = 'mcrv__p';
          const cv = document.createElement('canvas'); cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
          caja.appendChild(cv); cont.appendChild(caja);
          await page.render({ canvasContext: cv.getContext('2d', { alpha: false }), viewport: vp }).promise;
        }
      } catch (e) {
        if (RV !== ctx) return;
        estado(`<h3>Tu documento está listo</h3><p>Ábrelo o descárgalo para verlo en tu equipo.</p>${descarga(url, 'Abrir PDF')}`);
      }
      return;
    }
    estado(`<h3>Listo para ${tipo === 'enlace' ? 'abrir' : 'descargar'}</h3><p>Este recurso se abre mejor fuera del aula.</p>${descarga(url, tipo === 'enlace' ? 'Abrir recurso' : 'Descargar', nombreDescarga)}`);
  }).catch((e) => {
    if (RV !== ctx) return;
    estado(`<h3>No pudimos abrirlo</h3><p>${esc(e.message || 'Intenta de nuevo en unos segundos.')}</p><button type="button" class="mcrv__b" id="mcrv-retry"><span style="display:inline">Intentar de nuevo</span></button>`);
    const b = root.querySelector('#mcrv-retry'); if (b) b.onclick = () => abrirVisor(c, id, api);
  });
}

// ── Entrada desde campus.js ────────────────────────────────
// ctx: { app, E, api, render, WHATSAPP };  partes: ['curso', slug, sub?, id?]
export function pintarAula(ctx, c, partes) {
  X = ctx; cerrarVisor();
  const sub = partes[2] || '', activa = sub === 'clase' ? 'clases' : (TABS.some((t) => t.id === sub) ? sub : '');
  ctx.app.innerHTML = marco(c, activa);
  pintarAvatar($('#mc-me'), ctx.E.usuario, ctx.E.datos.alumno);
  const cuerpo = $('#mc-body'); if (cuerpo) cuerpo.scrollTop = 0;
  if (sub !== 'certificado') CERT_EDITAR = false;
  if (sub === 'clase') return vistaClase(c, partes[3]);
  if (sub === 'clases') return vistaClases(c);
  if (sub === 'materiales') return vistaMateriales(c);
  if (sub === 'certificado') return vistaCertificado(c);
  return vistaInicio(c);
}

// ── Sin compra: la cuenta no tiene este curso → se le manda a inscribirse ──
// info: { slug, titulo }
export function pintarSinCompra(ctx, info) {
  X = ctx; cerrarVisor();
  const d = ctx.E.datos, email = d.alumno.email;
  const wa = `https://wa.me/${ctx.WHATSAPP}?text=${encodeURIComponent('Hola, pagué ' + info.titulo + ' y no puedo entrar a mis clases (' + email + ')')}`;
  ctx.app.innerHTML = `<div class="mc solo" id="mi-curso" data-curso="${esc(info.slug)}">
    <header class="mc__top">
      <div class="mc__brand"><img src="/img/logo-sinergia-256.png" alt=""><div><small>Campus Sinergia · Aula</small><b id="mc-titulo">${esc(info.titulo)}</b></div></div>
      <a class="mc__x" id="mc-cerrar" href="/${esc(info.slug)}/" aria-label="Volver a la página del curso"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg><span>Volver</span></a>
    </header>
    <div class="mc__shell"><main class="mc__main" id="mc-body"><div class="mc__wrap" id="mc-view">
      <div class="mc__card mc__auth" id="mc-sin-compra">
        <h2>Aún no tienes este curso</h2>
        <p class="mc__sub">No encontramos una compra de <b>${esc(info.titulo)}</b> con <b>${esc(email)}</b>. Si pagaste con otro correo, entra con ese. Si todavía no lo compras, inscríbete ahora y entras de inmediato.</p>
        <div class="mc__acts">
          <a class="mc__btn mc__btn--g" id="mc-pagar" href="/${esc(info.slug)}/?inscribir=1">Inscribirme al curso ${I.flecha}</a>
          <button type="button" class="mc__btn mc__btn--l" id="mc-otra" data-salir>Entrar con otro correo</button>
          ${d.cursos.length ? '<button type="button" class="mc__btn mc__btn--l" id="mc-mis">Ver mis cursos</button>' : ''}
        </div>
        <p class="mc__help">¿Ya pagaste y no aparece? <a class="mc__link" href="${wa}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a> con tu comprobante.</p>
      </div>
    </div></main></div>
  </div>`;
  const mis = $('#mc-mis'); if (mis) mis.onclick = () => ctx.verMisCursos();
}

// ── Confeti (bienvenida tras el pago) ──
export function confeti(){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.getElementById('sx-confeti'))return;var c=document.createElement('canvas');c.id='sx-confeti';c.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483647';document.body.appendChild(c);var x=c.getContext('2d'),d=Math.min(window.devicePixelRatio||1,2);c.width=innerWidth*d;c.height=innerHeight*d;var col=['#f2b632','#22A05A','#1D6FD1','#ffffff','#ff7043','#86efac'],P=[];for(var i=0;i<160;i++)P.push({x:Math.random()*c.width,y:-Math.random()*c.height*.7,vx:(Math.random()-.5)*5*d,vy:(2+Math.random()*4)*d,w:(6+Math.random()*6)*d,h:(5+Math.random()*6)*d,r:Math.random()*6.28,vr:(Math.random()-.5)*.3,c:col[i%col.length]});var t0=performance.now();(function f(t){var k=(t-t0)/5000;x.clearRect(0,0,c.width,c.height);x.globalAlpha=k>.75?Math.max(0,1-(k-.75)*4):1;P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.vy+=.03*d;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore()});if(k<1)requestAnimationFrame(f);else c.remove()})(t0)}catch(e){}}
