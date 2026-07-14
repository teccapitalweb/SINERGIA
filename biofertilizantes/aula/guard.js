/* ═══════════════════════════════════════════════════════════
   Guardia del aula · Biofertilizantes
   Se carga en el <head> de todas las páginas del aula EXCEPTO acceso.html.
   Corta el acceso casual: si no hay token, saca al visitante a la puerta.
   No es una barrera criptográfica — ver nota en el reporte.

   Las claves llevan sufijo del curso: una sesión de otro curso NO abre esta
   aula, y un alumno con dos cursos puede tener las dos sesiones a la vez.
   ═══════════════════════════════════════════════════════════ */
(function () {
  var CURSO = 'biofertilizantes';
  var TOKEN = 'sinergia_aula_token_' + CURSO;
  var EMAIL = 'sinergia_aula_email_' + CURSO;
  var NOMBRE = 'sinergia_aula_nombre_' + CURSO;

  var token = null;
  try { token = localStorage.getItem(TOKEN); } catch (e) { /* almacenamiento bloqueado */ }

  if (!token) {
    window.location.replace('acceso.html');
    return;
  }

  function iniciales(nombre) {
    var partes = String(nombre).trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return '?';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  function pintarAlumno() {
    var email = localStorage.getItem(EMAIL) || '';
    var nombre = localStorage.getItem(NOMBRE) || email;

    var elNombre = document.querySelector('.user-info strong');
    if (elNombre) elNombre.textContent = nombre;

    // Cualquier otro lugar donde va el nombre del alumno (p. ej. el diploma)
    document.querySelectorAll('[data-alumno-nombre]').forEach(function (el) {
      el.textContent = nombre;
    });

    var elAvatar = document.querySelector('.user-avatar');
    if (elAvatar) elAvatar.textContent = iniciales(nombre !== email ? nombre : email);

    var salir = document.querySelector('.btn-salir');
    if (salir) {
      salir.addEventListener('click', function () {
        try {
          localStorage.removeItem(TOKEN);
          localStorage.removeItem(EMAIL);
          localStorage.removeItem(NOMBRE);
        } catch (e) { /* nada que limpiar */ }
        window.location.replace('acceso.html');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pintarAlumno);
  } else {
    pintarAlumno();
  }
})();
