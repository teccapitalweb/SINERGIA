"""Inyecta el carrusel de testimonios (3 filas, sin botón de pausa) en las landings de cursos de Sinergia.

Reemplaza la sección estática <!-- TESTIMONIOS --> por el carrusel, con estilos, código y
datos incrustados en la propia página (no depende de archivos externos). Solo publica
reseñas con autorizado:true y fuente (desde data/testimonios/<curso>.json); sin reseñas
autorizadas, la sección queda oculta — nunca se publican reseñas inventadas.

Uso: python3 componentes/inyectar-testimonios.py   (idempotente)
"""
import json, re, pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CURSOS = {
    'biofertilizantes': 'Opiniones de alumnos del curso de biofertilizantes',
    'cana-de-azucar': 'Opiniones de alumnos del curso de caña de azúcar',
    'soluciones-nutritivas': 'Opiniones de alumnos del curso de soluciones nutritivas',
}
CSS = (RAIZ / 'componentes/testimonios-carrusel.css').read_text(encoding='utf-8')
JS = (RAIZ / 'componentes/testimonios-carrusel.js').read_text(encoding='utf-8')

for slug, sub in CURSOS.items():
    p = RAIZ / slug / 'index.html'
    s = p.read_text(encoding='utf-8')
    s = re.sub(r'<!-- TESTIMONIOS-VT:INICIO -->.*?<!-- TESTIMONIOS-VT:FIN -->\n?', '', s, flags=re.S)

    datos_p = RAIZ / 'data/testimonios' / f'{slug}.json'
    if not datos_p.exists():
        datos_p.write_text(json.dumps({
            'curso': slug,
            '_nota': 'Agrega aquí solo opiniones reales de alumnos de ESTE curso. Cada una necesita autorizado:true y fuente (dónde se obtuvo y cómo se autorizó). Sin ellas no se publica. Después corre: python3 componentes/inyectar-testimonios.py',
            '_ejemplo': {'texto': 'Palabras originales del alumno', 'nombre': 'Nombre e inicial, como lo autorizó', 'contexto': 'Ocupación o curso', 'ubicacion': 'Estado (opcional)', 'autorizado': True, 'fuente': 'Mensaje de WhatsApp del 20-nov-2026, autorización por WhatsApp'},
            'testimonios': []
        }, ensure_ascii=False, indent=2), encoding='utf-8')
    datos = datos_p.read_text(encoding='utf-8').replace('</', '<\\/')

    nuevo = f'''<!-- TESTIMONIOS-VT:INICIO (generado por componentes/inyectar-testimonios.py — edita data/testimonios/{slug}.json y re-corre el script) -->
<style>{CSS}</style>
<section class="vt" data-testimonios="{slug}" aria-label="Testimonios de alumnos" hidden
         style="--vt-accent:#2e7d32;--vt-bg:#f9f9f9;--vt-ink:#102015;--vt-soft:#4f6656;--vt-font:'Inter',sans-serif">
  <div class="vt__head">
    <h2 class="section-title">Lo que opinan nuestros alumnos</h2>
    <p class="section-subtitle">{sub}</p>
  </div>
  <div class="vt__rows"></div>
</section>
<script type="application/json" id="vt-datos-{slug}">
{datos}
</script>
<script>
{JS}
</script>
<!-- TESTIMONIOS-VT:FIN -->'''

    # Sustituir la sección estática completa (incluye las reseñas y el «4.8/5 basado en 847 reseñas verificadas»)
    patron = re.compile(r'<!-- ============ TESTIMONIOS ============ -->.*?(?=<!-- ============ FAQ ============ -->)', re.S)
    if patron.search(s):
        s = patron.sub(nuevo + '\n\n', s, count=1)
    else:
        i = s.rindex('</body>')
        s = s[:i] + nuevo + '\n' + s[i:]
    p.write_text(s, encoding='utf-8')
    quedan = len(re.findall(r'basado en \d+ reseñas', s))
    print(slug, 'ok · secciones vt:', s.count('data-testimonios='), '· claims de reseñas restantes:', quedan)
