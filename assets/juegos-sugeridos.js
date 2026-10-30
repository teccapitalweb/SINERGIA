// Mini juegos sugeridos para las clases (borradores para revisar en el admin: Videoteca → Editar curso → «Sugerir juegos»).
// Se escribieron con el MATERIAL de cada curso (los PDF y presentaciones del curso); solo hay juego donde el material cubre esa clase.
// Viveros no tiene material escrito, por eso no trae juegos. Hay que confirmar que cada juego corresponda a lo que se ve en el video de esa clase.
// Un juego sugerido no se guarda solo: se carga en el formulario y se publica al pulsar «Guardar cambios».
window.SINERGIA_JUEGOS_SUGERIDOS = [
  {
    titulo: "Certificación Orgánica",
    juegos: [
      {"tipo":"memoria","titulo":"LPO, NOP y quién certifica","parejas":[{"a":"LPO","b":"Ley federal mexicana de productos orgánicos"},{"a":"NOP","b":"Programa federal de EE. UU. (USDA) con sello USDA Organic"},{"a":"SENASICA","b":"Mantiene el padrón de organismos de certificación"},{"a":"EMA","b":"Acredita a los organismos certificadores (ISO/IEC 17065)"}]},
      {"tipo":"conecta","titulo":"Marco legal: conceptos clave","pares":[{"izq":"7 CFR Part 205","der":"Reglamento federal en que se regula el NOP"},{"izq":"OSP","der":"Plan del Sistema Orgánico: describe prácticas, insumos y parcelas"},{"izq":"National List","der":"Lista de sustancias sintéticas permitidas y no sintéticas prohibidas"},{"izq":"DNPO","der":"Distintivo Nacional de Productos Orgánicos (México)"}]},
      {"tipo":"sopa","titulo":"Suelo y manejo orgánico","palabras":["COMPOST","CONVERSIÓN","ROTACIÓN","AZUFRE","COBERTURA"]},
      {"tipo":"crucigrama","titulo":"Registros y auditoría","palabras":[{"palabra":"AUDITORÍA","pista":"Revisión inicial en campo que hace el organismo certificador"},{"palabra":"REGISTROS","pista":"Se conservan al menos 5 años y sostienen la auditoría"},{"palabra":"LOTES","pista":"Se identifican claramente para lograr la trazabilidad"},{"palabra":"OSP","pista":"Plan del Sistema Orgánico, por sus siglas en inglés"}]}
    ]
  },
  {
    titulo: "Elaboración de Bioinsumos",
    juegos: [
      {"tipo":"conecta","titulo":"Bioinsumos según su función","pares":[{"izq":"Biopesticida M5","der":"Insecticida, nematicida y fungicida"},{"izq":"Sulfocalcio","der":"Acaricida-fungicida"},{"izq":"Bioestimulante de ortiga","der":"Estimula la raíz y da vigor"},{"izq":"Adherente de sábila","der":"Sirve de pega al mezclar con otros bioles"}]},
      {"tipo":"sopa","titulo":"Biofermentos y bioles","palabras":["BIOL","MELAZA","SUERO","SÁBILA","BOTELLA","MANGUERA"]},
      {"tipo":"memoria","titulo":"Microorganismos de montaña (MM)","parejas":[{"a":"Hongos","b":"Se forman a los 4 días en el MM líquido"},{"a":"Bacterias","b":"Se forman a los 8 días en el MM líquido"},{"a":"Levaduras","b":"Se forman a los 15 días en el MM líquido"},{"a":"Prueba del puño","b":"Con 40 % de humedad la mezcla hace un terrón"}]},
      {"tipo":"crucigrama","titulo":"Ingredientes del Bokashi","palabras":[{"palabra":"BOKASHI","pista":"Abono rico en microorganismos que fermenta en sacos"},{"palabra":"GALLINAZA","pista":"Aporta el nitrógeno; se usa con secado previo"},{"palabra":"ARENA","pista":"De tajo o de río, aporta los minerales"},{"palabra":"MELAZA","pista":"Aporta la energía a la mezcla"}]},
      {"tipo":"conecta","titulo":"Manejo orgánico de plagas","pares":[{"izq":"Bicarbonato","der":"Control de mildiu polvoso y botritis"},{"izq":"Caldo bordelés","der":"Tizón y roya; aplicar solo en hojas"},{"izq":"Reina de la Noche","der":"Mosca blanca; usar con cuidado con lombrices"},{"izq":"Insecticida APICHI","der":"Broca del café y trips"}]}
    ]
  },
  {
    titulo: "Fertirriego",
    juegos: [
      null,
      {"tipo":"memoria","titulo":"Sistemas de inyección del fertilizante","parejas":[{"a":"Gravedad","b":"El tanque fertilizante va más alto que el canal"},{"a":"Venturi","b":"Chupa la solución del tanque con el flujo de agua"},{"a":"Presión diferencial","b":"Tanque metálico hermético y válvula mariposa"},{"a":"Presión positiva","b":"Bombas de inyección con relación predeterminada"}]},
      null,
      null,
      {"tipo":"conecta","titulo":"Errores comunes en fertirriego","pares":[{"izq":"Sobredosificación","der":"Toxicidad, quema de raíces y contaminación del agua"},{"izq":"Mezclas incompatibles","der":"Calcio con sulfatos o fosfatos forma precipitados"},{"izq":"Falta de lixiviación","der":"Se acumulan sales por no dar riegos de limpieza"},{"izq":"Mala calibración","der":"Unas plantas reciben mucho y otras poco"}]}
    ]
  },
  {
    titulo: "Fitohormonas y Estimuladores de Crecimiento",
    juegos: [
      {"tipo":"sopa","titulo":"Las hormonas de la planta","palabras":["HORMONAS","AUXINAS","ETILENO","JASMONATOS","ABA"]},
      {"tipo":"memoria","titulo":"Qué hace cada fitohormona","parejas":[{"a":"Auxinas","b":"Forma activa: ácido indolacético (IAA)"},{"a":"Citoquininas","b":"Retrasan la senescencia y favorecen ramificación lateral"},{"a":"Etileno","b":"Maduración de la fruta y abscisión de órganos"},{"a":"Ácido abscísico","b":"Cierre estomático y tolerancia al estrés hídrico o salino"}]},
      {"tipo":"conecta","titulo":"Bioestimulantes y sustancias naturales","pares":[{"izq":"Aminoácidos","der":"El más usado es el ácido glutámico"},{"izq":"Ácidos húmicos","der":"Mejoran la estructura del suelo y la asimilación radical"},{"izq":"Extracto de algas","der":"Aporta 27 sustancias naturales similares a reguladores"},{"izq":"Fertilizantes","der":"Reponen nutrientes como nitrógeno, fósforo y potasio"}]},
      {"tipo":"crucigrama","titulo":"Microorganismos promotores","palabras":[{"palabra":"PGPR","pista":"Rizobacteria promotora del crecimiento vegetal"},{"palabra":"KLOEPPER","pista":"Quien definió las PGPR en 1978"},{"palabra":"FÓSFORO","pista":"Nutriente que las PGPR solubilizan"},{"palabra":"NITRÓGENO","pista":"Las PGPR fijan el atmosférico"}]},
      {"tipo":"conecta","titulo":"Métodos de aplicación","pares":[{"izq":"Pulverización foliar","der":"Se aplica sobre las hojas; absorción rápida y eficiente"},{"izq":"Tratamiento de semillas","der":"Recubrimiento antes de la siembra"},{"izq":"Riego por goteo","der":"Se añade al agua de riego; absorción gradual"},{"izq":"Inyección radicular","der":"Directo al sistema radicular; absorción precisa y rápida"}]}
    ]
  },
  {
    titulo: "Gestión Estratégica de Clientes y Ventas Agro",
    juegos: [
      {"tipo":"memoria","titulo":"Perfiles del cliente agro","parejas":[{"a":"Productor agrícola","b":"Busca rendimiento, economía y soporte técnico"},{"a":"Distribuidor","b":"Compra por volumen y necesita margen de ganancia claro"},{"a":"Consumidor final","b":"Demanda calidad uniforme, inocuidad y trazabilidad"},{"a":"Cliente ideal","b":"Necesita, valora y está dispuesto a pagar tu producto"}]},
      {"tipo":"sopa","titulo":"Gestión de la cartera","palabras":["CARTERA","SEGMENTA","CRM","POSTVENTA","RECOMPRA"]},
      {"tipo":"conecta","titulo":"Herramientas de prospección","pares":[{"izq":"Visitas a campo","der":"Genera confianza inmediata y muestra problemas reales"},{"izq":"Ferias agrícolas","der":"Contactas muchos productores en poco tiempo"},{"izq":"Referidos","der":"Alta tasa de conversión; es gratis y muy efectiva"},{"izq":"Base de datos","der":"No olvidas a nadie y contactas en el momento correcto"}]},
      {"tipo":"crucigrama","titulo":"Objeciones y cierre","palabras":[{"palabra":"OBJECIÓN","pista":"Duda del cliente, como \"Está muy caro\""},{"palabra":"CIERRE","pista":"Estrategia para concretar la venta"},{"palabra":"ESCASEZ","pista":"Cierre que crea oportunidad limitada"},{"palabra":"MUESTRA","pista":"Cierre por prueba: se entrega una pequeña cantidad"}]},
      {"tipo":"memoria","titulo":"Generar confianza","parejas":[{"a":"Habla el idioma del productor","b":"Usa ejemplos sencillos y reales"},{"a":"Educa, no presiones","b":"Da información útil aunque no compre hoy"},{"a":"Muestra resultados reales","b":"Casos de éxito, fotos de antes y después"},{"a":"Cumple lo que prometes","b":"Puntualidad, respeto y seguimiento"}]}
    ]
  },
  {
    titulo: "Inocuidad Alimentaria y Buenas Prácticas Agroalimentarias",
    juegos: [
      {"tipo":"memoria","titulo":"Conceptos básicos de inocuidad","parejas":[{"a":"Inocuidad","b":"Garantiza que el alimento no dañará al consumidor"},{"a":"Contaminación cruzada","b":"Viene de otra etapa, proceso o producto distinto"},{"a":"Peligro","b":"Agente biológico, químico o físico que daña la salud"},{"a":"Rastreabilidad","b":"Poder seguir el desplazamiento de un alimento"}]},
      {"tipo":"conecta","titulo":"Buenas prácticas en el campo","pares":[{"izq":"Ruta fecal-oral","der":"Vía más común si no se lavan las manos tras ir al baño"},{"izq":"Trabajador enfermo","der":"Se excluye si tiene diarrea, vómito, fiebre o tos frecuente"},{"izq":"Agroquímicos","der":"Van en envases originales, etiquetados y lejos del cultivo"},{"izq":"Agua de uso agrícola","der":"Debe ser inocua y de calidad sanitaria adecuada"}]},
      {"tipo":"crucigrama","titulo":"Limpieza e instalaciones","palabras":[{"palabra":"LIMPIEZA","pista":"Quita la suciedad; va antes de desinfectar"},{"palabra":"PLAGAS","pista":"Vectores de patógenos; se vigilan con trampas"},{"palabra":"DRENAJE","pista":"Los pisos van inclinados para facilitarlo"},{"palabra":"INOXIDABLE","pista":"Tipo de acero de los equipos fáciles de limpiar"}]},
      {"tipo":"sopa","titulo":"Sopa de BPM y HACCP","palabras":["HACCP","MONITOREO","FIFO","FEFO","SSOP","PCC"]},
      {"tipo":"conecta","titulo":"Trazabilidad y auditorías","pares":[{"izq":"Trazabilidad hacia atrás","der":"Sigue el origen del producto"},{"izq":"Trazabilidad interna","der":"Sigue los procesos dentro de la empresa"},{"izq":"Trazabilidad hacia adelante","der":"Sigue el destino del producto"},{"izq":"Auditoría de tercera parte","der":"La hace una organización independiente y externa"}]}
    ]
  },
  {
    titulo: "Lombricomposta",
    juegos: [
      {"tipo":"sopa","titulo":"Sopa de la lombricultura","palabras":["LOMBRIZ","EISENIA","CLITELIUM","HUMUS","LECHO","ANELIDO"]},
      {"tipo":"memoria","titulo":"Cosecha del humus","parejas":[{"a":"Antes de cosechar","b":"Se deja de dar alimento una semana"},{"a":"Cordones de estiércol","b":"Atraen a las lombrices; se separan a los 5 días"},{"a":"Humus retirado","b":"Se orea hasta tener 50% de humedad"},{"a":"Recogidas al año","b":"Marzo, septiembre y diciembre"}]},
      {"tipo":"conecta","titulo":"Condiciones de la lombriz","pares":[{"izq":"Temperatura","der":"Rango óptimo de crecimiento: 12 a 25 °C"},{"izq":"pH","der":"El valor óptimo es 7"},{"izq":"Aireación","der":"Si falta, baja el consumo de alimento y la reproducción"},{"izq":"Pájaros","der":"Depredadores; se cubre el lecho con ramas o mallas"}]},
      {"tipo":"crucigrama","titulo":"Abonos orgánicos","palabras":[{"palabra":"BOCASHI","pista":"Abono fermentado que dura hasta 3 meses"},{"palabra":"COMPOSTA","pista":"Abono de pila en capas de carbono y nitrógeno"},{"palabra":"PURIN","pista":"Abono líquido que se diluye 1:10 en agua sin cloro"},{"palabra":"MELAZA","pista":"Se mezcla con levadura para hacer bocashi"}]},
      {"tipo":"memoria","titulo":"Preparados y aplicación","parejas":[{"a":"Té de composta","b":"2 kg de composta en 20 L de agua con bomba de aire"},{"a":"Purín","b":"Se diluye 1:10 en agua sin cloro"},{"a":"Súper magro","b":"Abono líquido que reactiva la vida del suelo"},{"a":"Agroplus en suelos","b":"1 parte con 3 de agua, cada 10 días"}]}
    ]
  },
  {
    titulo: "Del Cacao al Chocolate",
    juegos: [
      {"tipo":"sopa","titulo":"Introducción al cacao","palabras":["CRIOLLO","FORASTERO","TRINITARIO","TABASCO","OLMECA"]},
      null,
      null,
      {"tipo":"memoria","titulo":"Secado y almacenamiento","parejas":[{"a":"Secado inicial","b":"Días 1 a 3: lento, libera ácidos volátiles"},{"a":"Secado final","b":"Desde el día 4, hasta 6 a 7 % de humedad"},{"a":"Zarandas","b":"Separan granos por tamaño y quitan impurezas"},{"a":"Tarimas","b":"Mantienen los sacos a 15 cm del suelo"}]},
      null
    ]
  },
  {
    titulo: "Fertilización de Árboles Frutales",
    juegos: [
      {"tipo":"sopa","titulo":"Sopa del diagnóstico del huerto","palabras":["POMOLOGIA","FOLIAR","DRENAJE","SALINIDAD","TEXTURA"]},
      {"tipo":"memoria","titulo":"Memoria de los nutrientes","parejas":[{"a":"Nitrógeno","b":"Crecimiento vegetativo; forma proteínas y clorofila"},{"a":"Fósforo","b":"Fotosíntesis, raíces y formación de frutos"},{"a":"Potasio","b":"Calidad del fruto y resistencia al estrés"},{"a":"Calcio","b":"Paredes celulares: frutos más firmes y de mayor vida útil"}]},
      {"tipo":"conecta","titulo":"Conecta la deficiencia con su síntoma","pares":[{"izq":"Nitrógeno","der":"Hojas pálidas o amarillentas (clorosis)"},{"izq":"Fósforo","der":"Hojas violáceas o rojizas"},{"izq":"Potasio","der":"Quemaduras en los bordes de las hojas"},{"izq":"Hierro","der":"Hojas amarillas con las venas verdes"}]}
    ]
  }
];
