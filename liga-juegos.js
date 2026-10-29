/* ==========================================================================
   liga-juegos.js  -  Liga del Campo (SINERGIA Agrícola)
   Retos breves y educativos: Detective Agrícola, Rescate del Cultivo, Desafío SINERGIA,
   Reto del día local y mini reto opcional por clase. JavaScript clásico, sin dependencias.
   Expone window.SinergiaLiga.

   - Seis formatos reutilizables: Encuentra el error, Une las parejas, Ordena los pasos,
     Tú decides, Mito o realidad y Completa la idea (más el formato propio del Detective).
   - Sin cronómetros, vidas ni penalizaciones. Todo caso es ficticio y no sustituye asesoría técnica.
   - Progreso de demostración en localStorage ('sinergia_juegos_progreso'), por cuenta:
     el XP se entrega una sola vez por juego cada semana (reinicia el lunes); el histórico
     y las insignias se conservan. Sin membresía se puede ver y probar un ejemplo, pero no hay XP.
   - Toda cadena se inserta con textContent / nodos de texto.
   ========================================================================== */
(function () {
  'use strict';

  var CLAVE = 'sinergia_juegos_progreso';
  var PRINCIPALES = ['detective', 'rescate', 'desafio'];
  var MSG_OK = '¡Muy bien! Identificaste una práctica importante.';
  var MSG_AYUDA = 'Casi. Revisa esta idea y vuelve a intentarlo.';
  var MSG_REPETIDO = 'Puedes practicar las veces que quieras. El XP de esta semana ya fue entregado.';
  var MSG_REPETIDO_DIA = 'Puedes practicar las veces que quieras. El XP de hoy ya fue entregado.';
  var NOTA_CLASE = 'Puedes intentarlo otra vez; aprender también es practicar.';

  var JUEGOS = {
    detective: { id: 'detective', titulo: 'Detective Agrícola', desc: 'Observa el escenario y encuentra dos prácticas que necesitan atención.', duracion: '1–2 min', xp: 20, img: 'img/retos/detective-agricola.webp', w: 640, h: 585 },
    rescate: { id: 'rescate', titulo: 'Rescate del Cultivo', desc: 'Toma tres decisiones para ayudar a un cultivo ficticio a recuperarse.', duracion: '2–3 min', xp: 30, img: 'img/retos/rescate-del-cultivo.webp', w: 640, h: 640 },
    desafio: { id: 'desafio', titulo: 'Desafío SINERGIA', desc: 'Combina lo aprendido en varias clases para completar el desafío.', duracion: '3–4 min', xp: 40, img: 'img/retos/desafio-sinergia.webp', w: 640, h: 585 }
  };
  var XP_DIARIO = 10, XP_CLASE = 10;

  /* =======================================================================
     1. CONTENIDO (ejemplos ficticios; cada juego puede tener varias variantes)
     ======================================================================= */
  var AVISO_FICTICIO = 'Caso ficticio para aprender. No sustituye la asesoría técnica real.';

  var BANCO = {
    detective: [
      { contexto: 'Escena ficticia: una huerta de hortalizas.', ejercicios: [{ formato: 'detective', pregunta: 'Marca las dos prácticas que necesitan atención.', items: [
        { t: 'Las cubetas de cosecha se lavan al terminar el día y se guardan lejos del suelo.', atencion: false, porque: 'Es una buena práctica: el equipo limpio evita contaminar lo que se cosecha.' },
        { t: 'Las personas cosechan sin lavarse las manos después de ir al baño.', atencion: true, porque: 'Las manos limpias son una de las barreras más importantes de la inocuidad. Conviene tener agua, jabón y con qué secarse.' },
        { t: 'El agua de lavado de la fruta se reutiliza varios días sin cambiarla.', atencion: true, porque: 'El agua de lavado se ensucia con el uso y puede pasar contaminantes de una fruta a otra. Debe cambiarse y ser de buena calidad.' }] }] },
      { contexto: 'Escena ficticia: un sistema de riego por goteo.', ejercicios: [{ formato: 'detective', pregunta: 'Marca las dos prácticas que necesitan atención.', items: [
        { t: 'Antes de regar se revisan las mangueras: no hay fugas ni goteros tapados.', atencion: false, porque: 'Revisar el sistema ayuda a que el agua llegue pareja a todas las plantas.' },
        { t: 'Se riega siempre al mediodía con sol fuerte, sin revisar si el suelo aún está húmedo.', atencion: true, porque: 'Regar por costumbre puede desperdiciar agua. Conviene observar la humedad del suelo y, cuando se pueda, elegir horas más frescas.' },
        { t: 'El fertilizante se mezcla “a ojo”, sin medir cuánto se pone en el tanque.', atencion: true, porque: 'Medir las cantidades evita aplicar de más o de menos. Lo adecuado depende del cultivo y se aprende en las clases.' }] }] },
      { contexto: 'Escena ficticia: un criadero de lombrices.', ejercicios: [{ formato: 'detective', pregunta: 'Marca las dos prácticas que necesitan atención.', items: [
        { t: 'El lecho se mantiene húmedo, como una esponja bien exprimida.', atencion: false, porque: 'Esa humedad es la que las lombrices necesitan para respirar y moverse.' },
        { t: 'El lecho está bajo el sol directo todo el día, sin sombra.', atencion: true, porque: 'Las lombrices son sensibles a la luz y al calor: necesitan un lugar fresco y con sombra.' },
        { t: 'Se agregan de golpe grandes cantidades de cítricos y cebolla.', atencion: true, porque: 'Los alimentos muy ácidos o fuertes, en exceso, pueden alterar el lecho. Conviene alimentar en capas y con moderación.' }] }] }
    ],
    rescate: [
      { contexto: 'Huerto escolar ficticio: las plántulas del semillero se doblan y se caen después de varios días de lluvia.', ejercicios: [
        { formato: 'decide', escenario: 'Decisión 1 de 3 · ¿Qué haces primero?', opciones: [
          { t: 'Revisar si el semillero drena bien y cuánta agua tiene.', ok: true, consecuencia: 'Observar antes de actuar te da pistas: el exceso de agua es una causa común de este problema.' },
          { t: 'Echar más fertilizante para fortalecerlas.', ok: false, consecuencia: 'El fertilizante no corrige un exceso de humedad y puede dañar plántulas tiernas.' },
          { t: 'Esperar a ver si se arregla solo.', ok: false, consecuencia: 'Esperar puede dejar que el problema avance. Observar y actuar a tiempo ayuda.' }] },
        { formato: 'decide', escenario: 'Decisión 2 de 3 · El semillero está muy mojado y casi sin ventilación. ¿Qué haces?', opciones: [
          { t: 'Reducir el riego y mejorar el drenaje y la ventilación.', ok: true, consecuencia: 'Menos agua y más aire bajan la humedad que favorece a los hongos del semillero.' },
          { t: 'Regar más seguido para que no se sequen.', ok: false, consecuencia: 'Más agua empeora el exceso de humedad en la base de las plántulas.' },
          { t: 'Cubrir el semillero para que no le llegue aire.', ok: false, consecuencia: 'Sin aire la humedad se queda atrapada y el ambiente se vuelve más favorable para las enfermedades.' }] },
        { formato: 'decide', escenario: 'Decisión 3 de 3 · Para el próximo semillero…', opciones: [
          { t: 'Usar sustrato limpio, recipientes desinfectados y buen drenaje.', ok: true, consecuencia: 'Prevenir con limpieza y drenaje es más fácil que corregir después.' },
          { t: 'Reutilizar el mismo sustrato sin limpiarlo.', ok: false, consecuencia: 'Un sustrato usado puede conservar microorganismos que dañan a las plántulas.' },
          { t: 'Sembrar más junto para ahorrar espacio.', ok: false, consecuencia: 'Las plántulas muy juntas tienen menos aire entre ellas y se mantienen húmedas por más tiempo.' }] }],
        aprendiste: ['Observar antes de actuar ayuda a elegir mejor.', 'El exceso de agua y la poca ventilación afectan a las plántulas.', 'Prevenir con sustrato y recipientes limpios y buen drenaje es más fácil que corregir.'] },
      { contexto: 'Lombricomposta ficticia: el lecho huele mal y hay muchas moscas.', ejercicios: [
        { formato: 'decide', escenario: 'Decisión 1 de 3 · ¿Qué revisas primero?', opciones: [
          { t: 'La humedad y qué residuos se han agregado.', ok: true, consecuencia: 'Casi siempre el olor tiene relación con demasiada humedad o con comida acumulada.' },
          { t: 'Agregar más residuos frescos para que las moscas se vayan.', ok: false, consecuencia: 'Más comida fresca atrae más moscas y aumenta el olor.' },
          { t: 'Tapar el lecho con plástico bien sellado.', ok: false, consecuencia: 'Sin aire las lombrices se estresan y el lecho se pone peor.' }] },
        { formato: 'decide', escenario: 'Decisión 2 de 3 · Está muy mojado y con mucha comida sin consumir. ¿Qué haces?', opciones: [
          { t: 'Dejar de alimentar un tiempo, agregar material seco (cartón u hojas) y remover con cuidado.', ok: true, consecuencia: 'El material seco absorbe humedad y la aireación ayuda a equilibrar el lecho.' },
          { t: 'Agregar más agua para diluir el olor.', ok: false, consecuencia: 'El agua extra aumenta el problema: el lecho ya está demasiado mojado.' },
          { t: 'Sacar a las lombrices y tirarlas.', ok: false, consecuencia: 'Las lombrices no son la causa: son parte de la solución cuando el lecho se equilibra.' }] },
        { formato: 'decide', escenario: 'Decisión 3 de 3 · ¿Cómo evitas que se repita?', opciones: [
          { t: 'Alimentar poco, enterrar los residuos y vigilar la humedad.', ok: true, consecuencia: 'Alimentar en pequeñas cantidades y cubrir los residuos mantiene el lecho sano.' },
          { t: 'Alimentar una vez al mes con mucha cantidad.', ok: false, consecuencia: 'Mucha comida junta se pudre antes de que las lombrices la consuman.' },
          { t: 'Agregar carne y grasa porque aportan más.', ok: false, consecuencia: 'La carne y la grasa generan malos olores y atraen plagas: no se recomiendan en la lombricomposta.' }] }],
        aprendiste: ['El olor fuerte suele avisar que el lecho tiene demasiada humedad o comida.', 'El material seco y la aireación ayudan a equilibrar el lecho.', 'Alimentar poco y con frecuencia, y vigilar la humedad, evita el problema.'] },
      { contexto: 'Parcela ficticia con riego por goteo: algunas plantas del final de la línea se ven más pequeñas que las del inicio.', ejercicios: [
        { formato: 'decide', escenario: 'Decisión 1 de 3 · ¿Qué piensas revisar?', opciones: [
          { t: 'Si el agua llega con presión parecida y sin tapones a todos los goteros.', ok: true, consecuencia: 'Que el riego sea parejo es lo primero que conviene comprobar en un sistema de goteo.' },
          { t: 'Cambiar de cultivo.', ok: false, consecuencia: 'Cambiar de cultivo no resuelve una posible falla del sistema: primero hay que observar.' },
          { t: 'Aplicar el doble de fertilizante a esas plantas.', ok: false, consecuencia: 'Más fertilizante no sustituye al agua que no está llegando y puede dañar las raíces.' }] },
        { formato: 'decide', escenario: 'Decisión 2 de 3 · Encuentras goteros tapados al final de la línea. ¿Qué haces?', opciones: [
          { t: 'Limpiar o cambiar los goteros y revisar los filtros.', ok: true, consecuencia: 'Los filtros y goteros limpios devuelven el riego parejo a toda la línea.' },
          { t: 'Abrir la llave al máximo para que el agua empuje.', ok: false, consecuencia: 'Subir la presión de golpe puede dañar el sistema y no destapa los goteros.' },
          { t: 'Regar a mano solo esas plantas, siempre.', ok: false, consecuencia: 'Puede ayudar un momento, pero el problema del sistema seguiría ahí.' }] },
        { formato: 'decide', escenario: 'Decisión 3 de 3 · Para que no se repita…', opciones: [
          { t: 'Dar mantenimiento periódico y limpiar los filtros.', ok: true, consecuencia: 'El mantenimiento a tiempo evita que los taponamientos lleguen a afectar a las plantas.' },
          { t: 'No revisar nada hasta la siguiente temporada.', ok: false, consecuencia: 'Sin revisar, un problema pequeño puede crecer sin que lo notes.' },
          { t: 'Apagar el riego por semanas.', ok: false, consecuencia: 'Sin riego las plantas sufren por falta de agua; lo importante es que el sistema funcione bien.' }] }],
        aprendiste: ['Si el riego no es parejo, la causa puede estar en el sistema y no en la planta.', 'Revisar filtros y goteros es parte del cuidado del riego.', 'El mantenimiento periódico previene problemas.'] }
    ],
    desafio: [
      { contexto: 'Curso: Inocuidad alimentaria y buenas prácticas.', ejercicios: [
        { formato: 'parejas', pregunta: 'Une cada término con su idea.', pares: [['BPA', 'Prácticas para producir de forma segura en el campo'], ['Trazabilidad', 'Poder seguir el recorrido del producto, del campo a la mesa'], ['HACCP', 'Identificar y controlar los puntos críticos de peligro'], ['Desinfección', 'Reducir los microorganismos después de limpiar']], porque: 'Estos cuatro conceptos trabajan juntos para que lo que producimos sea seguro.' },
        { formato: 'orden', pregunta: 'Ordena los pasos para limpiar una superficie.', pasos: ['Retirar los residuos visibles', 'Lavar con agua y detergente', 'Enjuagar', 'Desinfectar', 'Dejar secar'], porque: 'Primero se limpia y después se desinfecta: la suciedad le quita fuerza al desinfectante.' },
        { formato: 'mito', afirmacion: 'Si una superficie se ve limpia, ya está desinfectada.', mito: true, porque: 'Limpiar quita la suciedad visible; desinfectar reduce los microorganismos que no se ven. Son dos pasos distintos.' }] },
      { contexto: 'Curso: Lombricomposta.', ejercicios: [
        { formato: 'completa', frase: 'Las lombrices rojas prefieren un lecho húmedo, ___ y con sombra.', opciones: ['aireado', 'compactado', 'encharcado'], correcta: 0, porque: 'Necesitan aire para respirar: un lecho compactado o encharcado les quita oxígeno.' },
        { formato: 'orden', pregunta: 'Ordena los pasos para empezar y cuidar una lombricomposta.', pasos: ['Preparar el lecho con material húmedo', 'Colocar las lombrices', 'Alimentar en capas y con poca cantidad', 'Mantener la humedad y la sombra', 'Cosechar el humus cuando esté listo'], porque: 'Un buen inicio y un cuidado constante hacen que el proceso funcione.' },
        { formato: 'mito', afirmacion: 'Las lombrices pueden comer cualquier residuo, incluso carne y grasa.', mito: true, porque: 'La carne y la grasa generan malos olores y atraen plagas. Funcionan mejor los residuos vegetales.' }] },
      { contexto: 'Curso: Fertirriego.', ejercicios: [
        { formato: 'parejas', pregunta: 'Une cada nutriente con su función.', pares: [['Nitrógeno', 'Impulsa el crecimiento de hojas y tallos'], ['Fósforo', 'Apoya el desarrollo de raíces y la floración'], ['Potasio', 'Ayuda a la calidad del fruto'], ['Calcio', 'Fortalece las paredes de las células']], porque: 'Cada nutriente tiene un papel distinto, por eso el equilibrio importa.' },
        { formato: 'completa', frase: 'En el fertirriego, los nutrientes se aplican ___ en el agua de riego.', opciones: ['disueltos', 'en bloques sólidos', 'al final de la temporada'], correcta: 0, porque: 'Disueltos llegan junto con el agua a la zona de las raíces.' },
        { formato: 'mito', afirmacion: 'Aplicar más fertilizante siempre da más cosecha.', mito: true, porque: 'El exceso puede dañar raíces, acumular sales y desperdiciar dinero. La dosis depende de lo que el cultivo necesita.' }] }
    ]
  };

  // Reto del día local (se usa cuando no hay juego del día publicado en el servidor). Uno por día, estable durante el día.
  var DIARIOS = [
    { id: 'memoria-suelo', titulo: 'Memoria del suelo', ejercicio: { formato: 'parejas', pregunta: 'Une cada elemento del suelo con lo que hace.', pares: [['Arena', 'Drena rápido y retiene poca agua'], ['Arcilla', 'Retiene agua y puede compactarse'], ['Materia orgánica', 'Mejora la estructura y alimenta la vida del suelo'], ['Lombrices', 'Mezclan y airean el suelo']], porque: 'Conocer cómo es tu suelo ayuda a entender cuánta agua retiene y cómo cuidarlo.' } },
    { id: 'mito-riego', titulo: 'Mito o realidad: el riego', ejercicio: { formato: 'mito', afirmacion: 'Regar más siempre ayuda a que las plantas crezcan mejor.', mito: true, porque: 'El exceso de agua deja sin aire a las raíces y favorece enfermedades. Lo importante es regar según lo que necesita el cultivo y el suelo.' } },
    { id: 'completa-materia', titulo: 'Completa la idea: materia orgánica', ejercicio: { formato: 'completa', frase: 'La materia orgánica ayuda al suelo a retener ___ y alimenta a los microorganismos.', opciones: ['humedad', 'piedras', 'sal'], correcta: 0, porque: 'La materia orgánica funciona como una esponja y como alimento para la vida del suelo.' } },
    { id: 'orden-abono', titulo: 'Ordena: del residuo al abono', ejercicio: { formato: 'orden', pregunta: 'Ordena los pasos para hacer composta.', pasos: ['Reunir residuos vegetales y material seco', 'Armar capas alternando verde y seco', 'Mantener la humedad y airear de vez en cuando', 'Esperar a que se vea y huela a tierra de bosque'], porque: 'El equilibrio entre humedad, aire y materiales es lo que permite que la composta madure.' } },
    { id: 'error-cosecha', titulo: 'Encuentra el error: higiene en la cosecha', ejercicio: { formato: 'error', pregunta: '¿Cuál de estas prácticas es un error?', opciones: ['Lavarse las manos antes de cosechar', 'Usar cubetas limpias para la fruta', 'Poner la fruta cosechada directo en el suelo', 'Mantener a los animales fuera del área de empaque'], correcta: 2, porque: 'La fruta en el suelo puede contaminarse. Conviene usar envases limpios y elevados.' } }
  ];

  // Minijuegos opcionales por clase: clave = título del curso normalizado + número de clase.
  // Cada actividad acepta varias variantes (se elige una distinta a la última que se jugó). Máximo 3 ejercicios.
  var CLASES = {
    'lombricomposta|1': { titulo: 'Introducción a la lombricomposta', variantes: [
      { ejercicios: [{ formato: 'mito', afirmacion: 'La lombricomposta produce un abono natural a partir de residuos orgánicos.', mito: false, porque: 'Las lombrices transforman residuos orgánicos en humus, un abono rico en nutrientes.' },
        { formato: 'completa', frase: 'Las lombrices necesitan un lecho ___ para vivir bien.', opciones: ['húmedo', 'seco', 'muy caliente'], correcta: 0, porque: 'La humedad les permite respirar por la piel y moverse.' }] },
      { ejercicios: [{ formato: 'parejas', pregunta: 'Une cada palabra con su idea.', pares: [['Lecho', 'El espacio donde viven las lombrices'], ['Humus', 'El abono que producen'], ['Residuos orgánicos', 'Su alimento']], porque: 'Estas tres ideas resumen cómo funciona la lombricomposta.' },
        { formato: 'error', pregunta: '¿Cuál es el error?', opciones: ['Mantener el lecho húmedo', 'Darle sombra al lecho', 'Dejar el lecho bajo el sol directo todo el día'], correcta: 2, porque: 'Las lombrices son sensibles al sol y al calor: necesitan sombra.' }] }] },
    'inocuidad alimentaria y buenas practicas agroalimentarias|2': { titulo: 'Buenas prácticas agrícolas (BPA)', variantes: [
      { ejercicios: [{ formato: 'mito', afirmacion: 'Lavarse las manos antes de cosechar es una buena práctica agrícola.', mito: false, porque: 'Las manos limpias evitan pasar contaminantes a lo que se cosecha.' },
        { formato: 'completa', frase: 'El agua que entra en contacto con la fruta debe ser de buena ___.', opciones: ['calidad', 'cantidad', 'temperatura'], correcta: 0, porque: 'El agua de mala calidad puede llevar microorganismos a la fruta.' }] },
      { ejercicios: [{ formato: 'error', pregunta: '¿Cuál es el error?', opciones: ['Usar equipo limpio', 'Capacitar a las personas que cosechan', 'Dejar los envases de cosecha en el suelo del corral'], correcta: 2, porque: 'Los envases en el suelo se contaminan: conviene guardarlos limpios y elevados.' },
        { formato: 'orden', pregunta: 'Ordena los pasos antes de cosechar.', pasos: ['Revisar que el equipo y los envases estén limpios', 'Lavarse las manos', 'Cosechar con cuidado', 'Colocar la cosecha en envases limpios'], porque: 'Empezar con todo limpio protege la cosecha desde el primer momento.' }] }] },
    'fertirriego|2': { titulo: 'Fundamentos del fertirriego', variantes: [
      { ejercicios: [{ formato: 'mito', afirmacion: 'En el fertirriego, el agua de riego también lleva los nutrientes.', mito: false, porque: 'Esa es la idea del fertirriego: regar y nutrir al mismo tiempo.' },
        { formato: 'completa', frase: 'Se aplican los nutrientes en la dosis y el momento que el ___ necesita.', opciones: ['cultivo', 'vecino', 'mercado'], correcta: 0, porque: 'La dosis y el momento dependen de lo que necesita el cultivo.' }] },
      { ejercicios: [{ formato: 'parejas', pregunta: 'Une cada palabra con su idea.', pares: [['Nutriente', 'Elemento que la planta necesita para crecer'], ['Fertirriego', 'Aplicar nutrientes junto con el riego'], ['Goteo', 'Sistema que entrega el agua gota a gota']], porque: 'Con estas tres ideas se entiende cómo trabajan juntos el agua y los nutrientes.' },
        { formato: 'orden', pregunta: 'Ordena los pasos.', pasos: ['Revisar que el sistema de riego funcione bien', 'Preparar la solución con las cantidades indicadas', 'Aplicar los nutrientes con el riego', 'Observar cómo responde el cultivo'], porque: 'Primero se revisa el sistema y al final se observa para ajustar.' }] }] }
  };

  /* =======================================================================
     2. FECHAS Y PROGRESO (localStorage)
     ======================================================================= */
  var relojFijo = null;
  function ahora() { return relojFijo ? new Date(relojFijo) : new Date(); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function diaISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  // Semana ISO (empieza el lunes): 'AAAA-Wnn'
  function semanaId(f) {
    var d = new Date(f.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    var s1 = new Date(d.getFullYear(), 0, 4);
    var n = 1 + Math.round(((d.getTime() - s1.getTime()) / 86400000 - 3 + ((s1.getDay() + 6) % 7)) / 7);
    return d.getFullYear() + '-W' + pad(n);
  }
  function ayerDe(f) { var d = new Date(f.getTime()); d.setDate(d.getDate() - 1); return diaISO(d); }

  function leer() {
    try { var o = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (o && typeof o === 'object' && o.usuarios && typeof o.usuarios === 'object') return o; } catch (e) { /* sin datos */ }
    return { v: 1, usuarios: {} };
  }
  function escribir(o) { try { localStorage.setItem(CLAVE, JSON.stringify(o)); } catch (e) { /* almacenamiento no disponible */ } }
  function uid() { return (window.currentUser && window.currentUser.uid) || 'local'; }
  // Usuario normalizado; si cambió la semana se reinician solo los puntos y recompensas semanales
  function usuario(o) {
    var f = ahora(), u = o.usuarios[uid()];
    if (!u || typeof u !== 'object') u = o.usuarios[uid()] = {};
    u.historico = u.historico || { xp: 0, juegos: 0 };
    u.racha = u.racha || { dias: 0, ultimo: null };
    u.insignias = u.insignias || {};
    u.ultimaVariante = u.ultimaVariante || {};
    var sem = semanaId(f);
    if (!u.semana || u.semana.id !== sem) u.semana = { id: sem, xp: 0, recompensas: {} };
    var hoy = diaISO(f);
    if (!u.hoy || u.hoy.fecha !== hoy) u.hoy = { fecha: hoy, juegos: 0, diarioXp: false };
    return u;
  }
  function rachaVigente(r) {
    var f = ahora();
    return (r.ultimo === diaISO(f) || r.ultimo === ayerDe(f)) ? (r.dias || 0) : 0;
  }
  function nombreInsignia(id, sem) {
    if (id === 'desafio-sinergia') return 'Desafío SINERGIA';
    if (id.indexOf('liga-') === 0) return 'Liga del campo · semana ' + String(sem || id.slice(5)).split('-W')[1].replace(/^0/, '');
    return id;
  }
  function estado() {
    var o = leer(), u = usuario(o), rec = u.semana.recompensas;
    return {
      racha: rachaVigente(u.racha),
      xpSemana: u.semana.xp,
      xpHistorico: u.historico.xp,
      juegosHoy: u.hoy.juegos,
      semana: u.semana.id,
      mision: { hechos: PRINCIPALES.filter(function (k) { return !!rec[k]; }).length, total: PRINCIPALES.length },
      recibido: rec,
      diarioHecho: !!u.hoy.diarioXp,
      insignias: Object.keys(u.insignias).map(function (id) { return { id: id, nombre: nombreInsignia(id), en: u.insignias[id].en }; })
    };
  }

  // Registra que se terminó un juego. Sin membresía no se guarda nada (no hay XP real).
  // tipo: 'principal' | 'clase' (XP una vez por semana y por juego) | 'diario' (una vez al día)
  function registrarFin(clave, xp, tipo, miembro) {
    var res = { xp: 0, repetido: false, insignias: [], bloqueado: !miembro, racha: 0 };
    if (!miembro) return res;
    var o = leer(), u = usuario(o), f = ahora(), hoy = diaISO(f);
    // Racha: sube al completar algo en un día distinto al último
    if (u.racha.ultimo !== hoy) {
      u.racha.dias = (u.racha.ultimo === ayerDe(f)) ? (u.racha.dias || 0) + 1 : 1;
      u.racha.ultimo = hoy;
    }
    u.historico.juegos += 1;
    u.hoy.juegos += 1;
    u.ultimaActividad = f.toISOString();
    var entrega = tipo === 'diario' ? !u.hoy.diarioXp : !u.semana.recompensas[clave];
    if (entrega) {
      res.xp = xp;
      u.semana.xp += xp;
      u.historico.xp += xp;
      if (tipo === 'diario') u.hoy.diarioXp = true; else u.semana.recompensas[clave] = xp;
    } else {
      res.repetido = true;
    }
    if (clave === 'desafio' && !u.insignias['desafio-sinergia']) {
      u.insignias['desafio-sinergia'] = { en: f.toISOString() };
      res.insignias.push({ id: 'desafio-sinergia', nombre: nombreInsignia('desafio-sinergia') });
    }
    var idSem = 'liga-' + u.semana.id;
    if (PRINCIPALES.every(function (k) { return !!u.semana.recompensas[k]; }) && !u.insignias[idSem]) {
      u.insignias[idSem] = { en: f.toISOString() };
      res.insignias.push({ id: idSem, nombre: nombreInsignia(idSem, u.semana.id) });
    }
    res.racha = rachaVigente(u.racha);
    escribir(o);
    return res;
  }
  // Variante distinta a la última que se jugó (si hay más de una)
  function elegirVariante(clave, n) {
    if (n <= 1) return 0;
    var o = leer(), u = usuario(o), ult = u.ultimaVariante[clave], i;
    do { i = Math.floor(Math.random() * n); } while (i === ult);
    u.ultimaVariante[clave] = i;
    escribir(o);
    return i;
  }

  /* =======================================================================
     3. AYUDANTES DE DOM
     ======================================================================= */
  function h(tag, props, hijos) {
    var e = document.createElement(tag), k;
    if (props) for (k in props) {
      if (!Object.prototype.hasOwnProperty.call(props, k) || props[k] == null) continue;
      if (k === 'class') e.className = props[k];
      else if (k === 'text') e.textContent = props[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), props[k]);
      else e.setAttribute(k, props[k]);
    }
    (hijos || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function barajar(a) {
    var r = a.slice(), i, j, t;
    for (i = r.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = r[i]; r[i] = r[j]; r[j] = t; }
    return r;
  }
  // Baraja sin dejar el mismo orden que el original (para que no salga resuelto)
  function barajarDistinto(a) {
    var r = barajar(a), n = 0;
    while (a.length > 1 && r.every(function (x, i) { return x === a[i]; }) && n++ < 10) r = barajar(a);
    return r;
  }
  function boton(texto, clase, fn) { return h('button', { type: 'button', class: 'lg-btn' + (clase ? ' ' + clase : ''), text: texto, onclick: fn }); }

  /* =======================================================================
     4. FORMATOS REUTILIZABLES
     ctx.msg(tipo, texto) pone el mensaje; ctx.hecho(porque) cierra el ejercicio y ofrece continuar.
     ======================================================================= */
  function opcionesComoBotones(lista, onElegir) {
    var caja = h('div', { class: 'lg-opciones', role: 'group' });
    lista.forEach(function (t, i) {
      var b = h('button', { type: 'button', class: 'lg-op', text: t });
      b.addEventListener('click', function () { if (!b.disabled) onElegir(i, b); });
      caja.appendChild(b);
    });
    return caja;
  }

  var FORMATOS = {
    // Encuentra el error: una lista y una sola opción incorrecta
    error: function (ex, cont, ctx) {
      cont.appendChild(h('p', { class: 'lg-preg', text: ex.pregunta }));
      var caja = opcionesComoBotones(ex.opciones, function (i, b) {
        if (i === ex.correcta) {
          b.classList.add('es-ok');
          Array.prototype.forEach.call(caja.children, function (x) { x.disabled = true; });
          ctx.msg('ok', MSG_OK);
          ctx.hecho(ex.porque);
        } else {
          b.classList.add('es-no'); b.disabled = true;
          ctx.msg('ayuda', MSG_AYUDA);
        }
      });
      cont.appendChild(caja);
    },
    // Une las parejas: toca un elemento de la izquierda y su pareja de la derecha
    parejas: function (ex, cont, ctx) {
      cont.appendChild(h('p', { class: 'lg-preg', text: ex.pregunta }));
      var izq = ex.pares.map(function (p, i) { return { t: p[0], i: i }; });
      var der = barajarDistinto(ex.pares.map(function (p, i) { return { t: p[1], i: i }; }));
      var colI = h('div', { class: 'lg-col' }), colD = h('div', { class: 'lg-col' });
      var selI = null, hechas = 0;
      function limpiar() { selI = null; Array.prototype.forEach.call(colI.children, function (b) { b.classList.remove('es-sel'); }); }
      izq.forEach(function (x) {
        var b = h('button', { type: 'button', class: 'lg-op', text: x.t });
        b.addEventListener('click', function () {
          if (b.disabled) return;
          limpiar(); selI = { i: x.i, b: b }; b.classList.add('es-sel');
        });
        colI.appendChild(b);
      });
      der.forEach(function (x) {
        var b = h('button', { type: 'button', class: 'lg-op', text: x.t });
        b.addEventListener('click', function () {
          if (b.disabled || !selI) { if (!selI) ctx.msg('ayuda', 'Primero toca un elemento de la izquierda.'); return; }
          if (selI.i === x.i) {
            selI.b.classList.remove('es-sel'); selI.b.classList.add('es-ok'); b.classList.add('es-ok');
            selI.b.disabled = true; b.disabled = true; selI = null; hechas++;
            if (hechas === ex.pares.length) { ctx.msg('ok', MSG_OK); ctx.hecho(ex.porque); } else ctx.msg('', '');
          } else {
            ctx.msg('ayuda', MSG_AYUDA); limpiar();
          }
        });
        colD.appendChild(b);
      });
      cont.appendChild(h('div', { class: 'lg-parejas' }, [colI, colD]));
    },
    // Ordena los pasos: toca los pasos en el orden correcto
    orden: function (ex, cont, ctx) {
      cont.appendChild(h('p', { class: 'lg-preg', text: ex.pregunta }));
      var siguiente = 0;
      var tuOrden = h('ol', { class: 'lg-tuorden', 'aria-label': 'Tu orden' });
      var caja = h('div', { class: 'lg-opciones', role: 'group' });
      barajarDistinto(ex.pasos).forEach(function (p) {
        var b = h('button', { type: 'button', class: 'lg-op', text: p });
        b.addEventListener('click', function () {
          if (b.disabled) return;
          if (p === ex.pasos[siguiente]) {
            b.disabled = true; b.classList.add('es-ok'); siguiente++;
            tuOrden.appendChild(h('li', { text: p }));
            if (siguiente === ex.pasos.length) { ctx.msg('ok', MSG_OK); ctx.hecho(ex.porque); } else ctx.msg('', '');
          } else {
            ctx.msg('ayuda', MSG_AYUDA);
          }
        });
        caja.appendChild(b);
      });
      cont.appendChild(caja);
      cont.appendChild(h('p', { class: 'lg-sub', text: 'Tu orden:' }));
      cont.appendChild(tuOrden);
    },
    // Tú decides: un escenario con opciones y una consecuencia educativa para cada una
    decide: function (ex, cont, ctx) {
      cont.appendChild(h('p', { class: 'lg-preg', text: ex.escenario }));
      var consec = h('p', { class: 'lg-consec', hidden: 'hidden' });
      var caja = h('div', { class: 'lg-opciones', role: 'group' });
      ex.opciones.forEach(function (op) {
        var b = h('button', { type: 'button', class: 'lg-op', text: op.t });
        b.addEventListener('click', function () {
          if (b.disabled) return;
          consec.hidden = false; consec.textContent = op.consecuencia;
          if (op.ok) {
            b.classList.add('es-ok');
            Array.prototype.forEach.call(caja.children, function (x) { x.disabled = true; });
            ctx.msg('ok', MSG_OK);
            ctx.hecho(null);
          } else {
            b.classList.add('es-no'); b.disabled = true;
            ctx.msg('ayuda', MSG_AYUDA);
          }
        });
        caja.appendChild(b);
      });
      cont.appendChild(caja);
      cont.appendChild(consec);
    },
    // Mito o realidad
    mito: function (ex, cont, ctx) {
      cont.appendChild(h('p', { class: 'lg-preg', text: 'Mito o realidad' }));
      cont.appendChild(h('p', { class: 'lg-afirma', text: '“' + ex.afirmacion + '”' }));
      var caja = h('div', { class: 'lg-opciones lg-dos', role: 'group' });
      [['Mito', true], ['Realidad', false]].forEach(function (par) {
        var b = h('button', { type: 'button', class: 'lg-op', text: par[0] });
        b.addEventListener('click', function () {
          if (b.disabled) return;
          if (par[1] === ex.mito) {
            b.classList.add('es-ok');
            Array.prototype.forEach.call(caja.children, function (x) { x.disabled = true; });
            ctx.msg('ok', MSG_OK);
            ctx.hecho(ex.porque);
          } else {
            b.classList.add('es-no'); b.disabled = true;
            ctx.msg('ayuda', MSG_AYUDA);
          }
        });
        caja.appendChild(b);
      });
      cont.appendChild(caja);
    },
    // Completa la idea
    completa: function (ex, cont, ctx) {
      cont.appendChild(h('p', { class: 'lg-preg', text: 'Completa la idea' }));
      var partes = ex.frase.split('___');
      var hueco = h('span', { class: 'lg-hueco', text: '______' });
      cont.appendChild(h('p', { class: 'lg-afirma' }, [partes[0], hueco, partes[1] || '']));
      var caja = opcionesComoBotones(ex.opciones, function (i, b) {
        if (i === ex.correcta) {
          hueco.textContent = ex.opciones[i]; hueco.classList.add('es-ok'); b.classList.add('es-ok');
          Array.prototype.forEach.call(caja.children, function (x) { x.disabled = true; });
          ctx.msg('ok', MSG_OK);
          ctx.hecho(ex.porque);
        } else {
          b.classList.add('es-no'); b.disabled = true;
          ctx.msg('ayuda', MSG_AYUDA);
        }
      });
      cont.appendChild(caja);
    },
    // Detective Agrícola: de tres prácticas, marca las dos que necesitan atención
    detective: function (ex, cont, ctx) {
      cont.appendChild(h('p', { class: 'lg-preg', text: ex.pregunta }));
      var sel = {}, tarjetas = [];
      var caja = h('div', { class: 'lg-detec' });
      var revisar = boton('Revisar', 'lg-btn--main', function () {
        if (revisar.hidden) return;
        var elegidas = Object.keys(sel).filter(function (k) { return sel[k]; });
        var acierto = ex.items.every(function (it, i) { return !!sel[i] === it.atencion; });
        tarjetas.forEach(function (t, i) {
          var it = ex.items[i];
          t.b.disabled = true;
          t.b.classList.toggle('es-ok', it.atencion && !!sel[i]);
          t.b.classList.toggle('es-no', !it.atencion && !!sel[i] || it.atencion && !sel[i]);
          t.exp.hidden = false;
          t.exp.textContent = (it.atencion ? 'Requiere atención. ' : 'Está bien. ') + it.porque;
        });
        revisar.hidden = true;
        if (acierto) { ctx.msg('ok', MSG_OK); ctx.hecho(null); }
        else {
          ctx.msg('ayuda', MSG_AYUDA);
          var otra = boton('Intentar otra vez', '', function () {
            sel = {}; otra.remove(); revisar.hidden = false; revisar.disabled = true;
            tarjetas.forEach(function (t) { t.b.disabled = false; t.b.className = 'lg-op lg-tarj'; t.b.setAttribute('aria-pressed', 'false'); t.exp.hidden = true; });
            ctx.msg('', '');
          });
          ctx.acciones.insertBefore(otra, ctx.acciones.firstChild);
        }
      });
      revisar.disabled = true;
      ex.items.forEach(function (it, i) {
        var b = h('button', { type: 'button', class: 'lg-op lg-tarj', 'aria-pressed': 'false', text: it.t });
        var exp = h('p', { class: 'lg-exp', hidden: 'hidden' });
        b.addEventListener('click', function () {
          if (b.disabled) return;
          var n = Object.keys(sel).filter(function (k) { return sel[k]; }).length;
          if (!sel[i] && n >= 2) { ctx.msg('ayuda', 'Elige solo dos: desmarca una para cambiar.'); return; }
          sel[i] = !sel[i];
          b.classList.toggle('es-sel', !!sel[i]);
          b.setAttribute('aria-pressed', sel[i] ? 'true' : 'false');
          revisar.disabled = Object.keys(sel).filter(function (k) { return sel[k]; }).length !== 2;
          ctx.msg('', '');
        });
        tarjetas.push({ b: b, exp: exp });
        caja.appendChild(h('div', { class: 'lg-tarjeta' }, [b, exp]));
      });
      cont.appendChild(caja);
      ctx.acciones.appendChild(revisar);
    }
  };

  /* =======================================================================
     5. VENTANA DEL JUEGO
     def: { clave, titulo, kicker, contexto, ejercicios, aprendiste, tipo, xp, insigniaDesafio }
     opts: { miembro, sinXp, onFin }
     ======================================================================= */
  var abierto = null;

  function cerrar() {
    if (!abierto) return;
    document.removeEventListener('keydown', abierto.tecla);
    abierto.ov.remove();
    document.body.style.overflow = abierto.overflow;
    var foco = abierto.foco; abierto = null;
    try { if (foco && foco.focus) foco.focus(); } catch (e) { /* sin foco */ }
  }
  function irAMembresia() {
    cerrar();
    if (typeof window.__irASuscripcion === 'function') window.__irASuscripcion();
    else if (typeof window.showVipUpsell === 'function') window.showVipUpsell('webinar');
  }
  var ICONO_MEDALLA = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="28" r="18" fill="#E7C873" stroke="#B8923A" stroke-width="2.5"/><circle cx="32" cy="28" r="12" fill="none" stroke="#B8923A" stroke-width="1.6"/><path d="m32 19 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.2 6-.9z" fill="#FFF6D6" stroke="#B8923A" stroke-width="1.2" stroke-linejoin="round"/><path d="m22 43-4 14 9-4 5 7 3-10M42 43l4 14-9-4-5 7" fill="#1AA888" stroke="#0E6B58" stroke-width="1.6" stroke-linejoin="round" opacity=".9"/></svg>';

  function abrir(def, opts) {
    opts = opts || {};
    cerrar();
    var ejemplo = !opts.miembro && !opts.sinXp;   // juego premium sin membresía: solo se ve el primer ejercicio
    var lista = ejemplo ? def.ejercicios.slice(0, 1) : def.ejercicios;
    var total = lista.length, idx = 0;

    var cuerpo = h('div', { class: 'lg-body' });
    var retro = h('div', { class: 'lg-retro', role: 'status', 'aria-live': 'polite' });
    var acciones = h('div', { class: 'lg-acc' });
    var puntos = h('div', { class: 'lg-puntos', 'aria-hidden': 'true' });
    var cab = h('div', { class: 'lg-cab' }, [
      def.imagen ? h('img', { class: 'lg-cab-img', src: def.imagen, alt: '', width: '56', height: '56' }) : null,
      h('div', { class: 'lg-cab-tx' }, [h('span', { class: 'lg-kick', text: def.kicker || 'Liga del campo' }), h('h2', { id: 'lgTit', text: def.titulo })]),
      h('button', { type: 'button', class: 'lg-x', 'aria-label': 'Cerrar', text: '×', onclick: cerrar })
    ]);
    var caja = h('div', { class: 'lg-box', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'lgTit' }, [
      cab, puntos, cuerpo, retro, acciones
    ]);
    var ov = h('div', { class: 'lg-ov' }, [caja]);
    ov.addEventListener('click', function (e) { if (e.target === ov) cerrar(); });
    var tecla = function (e) { if (e.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', tecla);
    abierto = { ov: ov, tecla: tecla, overflow: document.body.style.overflow, foco: document.activeElement };
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';

    function msg(tipo, texto) {
      retro.className = 'lg-retro' + (tipo ? ' lg-retro--' + tipo : '');
      retro.textContent = texto || '';
    }
    function pintarPuntos() {
      puntos.innerHTML = '';
      puntos.appendChild(h('span', { class: 'lg-prog', text: total > 1 ? 'Ejercicio ' + (idx + 1) + ' de ' + total : (def.avisoCaso ? '' : 'Un ejercicio') }));
      for (var i = 0; i < total; i++) puntos.appendChild(h('i', { class: i < idx ? 'es-hecho' : (i === idx ? 'es-actual' : '') }));
    }

    function mostrar() {
      cuerpo.innerHTML = ''; acciones.innerHTML = ''; msg('', '');
      pintarPuntos();
      var ex = lista[idx];
      if (idx === 0 && def.contexto) cuerpo.appendChild(h('p', { class: 'lg-contexto', text: def.contexto }));
      if (idx === 0 && def.avisoCaso) cuerpo.appendChild(h('p', { class: 'lg-aviso', text: AVISO_FICTICIO }));
      var zona = h('div', { class: 'lg-zona' });
      cuerpo.appendChild(zona);
      var explica = h('div', { class: 'lg-porque', hidden: 'hidden' });
      cuerpo.appendChild(explica);
      var ctx = {
        msg: msg, acciones: acciones,
        hecho: function (porque) {
          if (porque) { explica.hidden = false; explica.innerHTML = ''; explica.appendChild(h('b', { text: 'Para recordar' })); explica.appendChild(h('span', { text: porque })); }
          var ultimo = idx === total - 1;
          var sig = boton(ultimo ? (ejemplo ? 'Terminar el ejemplo' : 'Terminar') : 'Continuar', 'lg-btn--main', function () {
            if (ultimo) final(); else { idx++; mostrar(); }
          });
          acciones.appendChild(sig);
          try { sig.focus(); } catch (e) { /* sin foco */ }
        }
      };
      FORMATOS[ex.formato](ex, zona, ctx);
    }

    function final() {
      cuerpo.innerHTML = ''; acciones.innerHTML = ''; msg('', ''); puntos.innerHTML = '';
      if (ejemplo) {
        cuerpo.appendChild(h('div', { class: 'lg-fin' }, [
          h('h3', { text: 'Así se juega' }),
          h('p', { text: 'Esto fue un ejemplo. Con membresía terminas el reto completo, sumas XP y desbloqueas insignias.' })
        ]));
        acciones.appendChild(boton('Cerrar', '', cerrar));
        acciones.appendChild(boton('Ver membresía', 'lg-btn--main', irAMembresia));
        return;
      }
      var res = registrarFin(def.clave, def.xp, def.tipo, !!opts.miembro);
      var fin = h('div', { class: 'lg-fin' });
      fin.appendChild(h('h3', { text: res.xp > 0 ? '¡Reto superado! Sumaste ' + res.xp + ' XP.' : '¡Reto superado!' }));
      if (res.xp <= 0 && res.repetido) fin.appendChild(h('p', { text: def.tipo === 'diario' ? MSG_REPETIDO_DIA : MSG_REPETIDO }));
      if (res.bloqueado) fin.appendChild(h('p', { text: 'Con membresía este reto suma XP a tu semana.' }));
      if (def.clave === 'desafio' && !res.bloqueado) {
        var med = h('div', { class: 'lg-medalla' });
        med.innerHTML = ICONO_MEDALLA;
        fin.appendChild(med);
        fin.appendChild(h('p', { class: 'lg-insig', text: 'Insignia: Desafío SINERGIA' }));
      }
      res.insignias.forEach(function (i) { if (i.id !== 'desafio-sinergia') fin.appendChild(h('p', { class: 'lg-insig', text: 'Nueva insignia: ' + i.nombre })); });
      if (def.aprendiste && def.aprendiste.length) {
        var ul = h('ul', { class: 'lg-lista' });
        def.aprendiste.forEach(function (t) { ul.appendChild(h('li', { text: t })); });
        fin.appendChild(h('div', { class: 'lg-aprendiste' }, [h('b', { text: 'Lo importante que aprendiste' }), ul]));
      }
      if (def.avisoCaso) fin.appendChild(h('p', { class: 'lg-aviso', text: AVISO_FICTICIO }));
      cuerpo.appendChild(fin);
      acciones.appendChild(boton('Cerrar', '', cerrar));
      acciones.appendChild(boton('Practicar de nuevo', 'lg-btn--main', function () { jugarDef(def, opts); }));
      if (opts.onFin) { try { opts.onFin(res); } catch (e) { /* sin aviso */ } }
      if (res.bloqueado) acciones.appendChild(boton('Ver membresía', '', irAMembresia));
    }

    mostrar();
    var x = ov.querySelector('.lg-x'); if (x) { try { x.focus(); } catch (e) { /* sin foco */ } }
  }

  // Cada vez que se juega se elige una variante distinta a la anterior
  function jugarDef(def, opts) {
    var nueva = def.reconstruir ? def.reconstruir() : def;
    abrir(nueva, opts);
  }

  function defPrincipal(id) {
    var j = JUEGOS[id], variantes = BANCO[id];
    function construir() {
      var v = variantes[elegirVariante(id, variantes.length)];
      return {
        clave: id, tipo: 'principal', xp: j.xp, titulo: j.titulo, kicker: 'Centro de retos', imagen: j.img,
        contexto: v.contexto, ejercicios: v.ejercicios, aprendiste: v.aprendiste || null,
        avisoCaso: id === 'rescate' || id === 'detective', reconstruir: construir
      };
    }
    return construir();
  }
  function diarioDelDia() {
    var f = ahora();
    return DIARIOS[Math.floor(Date.UTC(f.getFullYear(), f.getMonth(), f.getDate()) / 86400000) % DIARIOS.length];
  }
  function defDiario() {
    var d = diarioDelDia();
    return { clave: 'diario', tipo: 'diario', xp: XP_DIARIO, titulo: d.titulo, kicker: 'Reto del día', contexto: 'Repasa conceptos vistos en clase y suma puntos para tu racha.', ejercicios: [d.ejercicio], reconstruir: function () { return defDiario(); } };
  }
  function normalizar(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function claseClave(cursoTitulo, numero) { return normalizar(cursoTitulo) + '|' + numero; }
  function defClase(cursoTitulo, numero) {
    var k = claseClave(cursoTitulo, numero), c = CLASES[k];
    if (!c) return null;
    function construir() {
      var v = c.variantes[elegirVariante('clase:' + k, c.variantes.length)];
      return { clave: 'clase:' + k, tipo: 'clase', xp: XP_CLASE, titulo: 'Pon a prueba lo aprendido', kicker: 'Clase ' + numero + ' · ' + c.titulo, contexto: NOTA_CLASE, ejercicios: v.ejercicios.slice(0, 3), reconstruir: construir };
    }
    return construir();
  }

  // opts: { miembro, onFin }
  function jugar(id, opts) {
    opts = opts || {};
    if (id === 'diario') { abrir(defDiario(), { miembro: !!opts.miembro, sinXp: !opts.miembro, onFin: opts.onFin }); return; }
    if (!JUEGOS[id]) return;
    abrir(defPrincipal(id), { miembro: !!opts.miembro, onFin: opts.onFin });
  }
  function jugarClase(cursoTitulo, numero, opts) {
    opts = opts || {};
    var d = defClase(cursoTitulo, numero);
    if (d) abrir(d, { miembro: !!opts.miembro, sinXp: !opts.miembro, onFin: opts.onFin });
  }

  var ICONO_CLASE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>';
  // Tarjeta opcional "Pon a prueba lo aprendido" para la pantalla de la clase (vacía si la clase no tiene mini reto)
  function claseTarjetaHtml(cursoTitulo, numero) {
    var c = CLASES[claseClave(cursoTitulo, numero)];
    if (!c) return '';
    return '<div class="cv-juego lg-clase"><div class="cv-juego-fila"><span class="cv-juego-ico">' + ICONO_CLASE + '</span><div>' +
      '<span class="cred-eyebrow">Pon a prueba lo aprendido</span><h3>Mini reto de la clase</h3>' +
      '<p><b>1 minuto aproximado</b> · Opcional</p><p>' + NOTA_CLASE + '</p></div></div>' +
      '<button type="button" class="cred-btn cred-btn--sec" data-lg-clase="' + numero + '">Probar el mini reto</button></div>';
  }

  window.SinergiaLiga = {
    JUEGOS: JUEGOS,
    PRINCIPALES: PRINCIPALES,
    estado: estado,
    jugar: jugar,
    jugarClase: jugarClase,
    claseTarjetaHtml: claseTarjetaHtml,
    tieneClase: function (cursoTitulo, numero) { return !!CLASES[claseClave(cursoTitulo, numero)]; },
    diarioDelDia: function () { var d = diarioDelDia(); return { id: d.id, titulo: d.titulo }; },
    XP_DIARIO: XP_DIARIO,
    // Solo para pruebas: fija la fecha y hora que usa el progreso (null = reloj real)
    __fijarAhora: function (ms) { relojFijo = ms == null ? null : ms; },
    __clave: CLAVE
  };
})();
