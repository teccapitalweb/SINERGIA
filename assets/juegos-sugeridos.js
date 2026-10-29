// Mini juegos sugeridos para cada clase de los 10 cursos (borradores para revisar en el admin: Videoteca → Editar curso → «Sugerir juegos»).
// Se escribieron a partir del título de cada clase y del tema del curso, no del contenido exacto del video: conviene revisarlos y ajustar lo que haga falta.
// Un juego sugerido no se guarda solo: se carga en el formulario y se publica al pulsar «Guardar cambios».
window.SINERGIA_JUEGOS_SUGERIDOS = [
  {
    titulo: 'Administración y Operación de Viveros',
    juegos: [
      { tipo: 'sopa', titulo: 'Sopa del vivero', palabras: ['VIVERO', 'SUSTRATO', 'PLANTULA', 'ESPECIE', 'MERCADO'] },
      { tipo: 'memoria', titulo: 'Memoria de la infraestructura', parejas: [
        { a: 'Invernadero', b: 'Protege y controla el clima' },
        { a: 'Malla sombra', b: 'Reduce el exceso de sol' },
        { a: 'Charola', b: 'Germina semillas en celdas' },
        { a: 'Mesa de cultivo', b: 'Eleva la planta del suelo' } ] },
      { tipo: 'conecta', titulo: 'Conecta la propagación', pares: [
        { izq: 'Semilla', der: 'Propagación sexual' },
        { izq: 'Estaca', der: 'Propagación asexual' },
        { izq: 'Injerto', der: 'Une dos plantas en una' },
        { izq: 'Turba', der: 'Sustrato que retiene humedad' } ] },
      { tipo: 'crucigrama', titulo: 'Crucigrama de administración', palabras: [
        { palabra: 'COSTO', pista: 'Gasto necesario para producir cada planta' },
        { palabra: 'MARGEN', pista: 'Ganancia que queda sobre el costo' },
        { palabra: 'INVENTARIO', pista: 'Lista de las plantas que hay en el vivero' },
        { palabra: 'REGISTRO', pista: 'Anotación escrita de lo que se hace' } ] },
      { tipo: 'rompecabezas', titulo: 'Arma el vivero', imagen: 'https://sinergiamexico.it.com/assets/course-covers/viveros.webp', filas: 2, columnas: 3 }
    ]
  },
  {
    titulo: 'Certificación Orgánica',
    juegos: [
      { tipo: 'sopa', titulo: 'Sopa orgánica', palabras: ['ORGANICO', 'NORMA', 'AUDITORIA', 'SELLO', 'INSPECTOR'] },
      { tipo: 'memoria', titulo: 'Memoria del marco legal', parejas: [
        { a: 'Ley de Productos Orgánicos', b: 'Ley mexicana que regula lo orgánico' },
        { a: 'SENASICA', b: 'Autoridad que supervisa la producción orgánica' },
        { a: 'Organismo de certificación', b: 'Evalúa y certifica la producción' },
        { a: 'Lineamientos', b: 'Reglas que se deben cumplir' } ] },
      { tipo: 'conecta', titulo: 'Conecta los requisitos', pares: [
        { izq: 'Transición', der: 'Periodo para dejar de usar insumos prohibidos' },
        { izq: 'Zona de amortiguamiento', der: 'Franja que protege de contaminación vecina' },
        { izq: 'Composta', der: 'Fertilización orgánica permitida' },
        { izq: 'Semilla sin transgénicos', der: 'Material de siembra aceptado' } ] },
      { tipo: 'crucigrama', titulo: 'Crucigrama de trazabilidad', palabras: [
        { palabra: 'BITACORA', pista: 'Registro diario de las labores del huerto' },
        { palabra: 'LOTE', pista: 'Parte de la producción con una identificación' },
        { palabra: 'AUDITORIA', pista: 'Revisión que hace el certificador' },
        { palabra: 'REGISTRO', pista: 'Evidencia escrita de lo que se hace' } ] }
    ]
  },
  {
    titulo: 'Elaboración de Bioinsumos',
    juegos: [
      { tipo: 'sopa', titulo: 'Sopa de bioinsumos', palabras: ['BIOINSUMO', 'BACTERIA', 'HONGO', 'ABONO', 'COMPOST'] },
      { tipo: 'memoria', titulo: 'Memoria de la fermentación', parejas: [
        { a: 'Melaza', b: 'Alimento azucarado para los microbios' },
        { a: 'Recipiente tapado', b: 'Fermenta con poco oxígeno' },
        { a: 'Agua sin cloro', b: 'No mata a los microorganismos' },
        { a: 'Sombra', b: 'Protege la fermentación del calor' } ] },
      { tipo: 'conecta', titulo: 'Conecta el bioinsumo', pares: [
        { izq: 'Bocashi', der: 'Abono orgánico fermentado sólido' },
        { izq: 'Biol', der: 'Fermentado líquido sin aire' },
        { izq: 'Té de compost', der: 'Extracto líquido y aireado de compost' },
        { izq: 'Caldo sulfocálcico', der: 'Preparado mineral contra plagas y hongos' } ] },
      { tipo: 'crucigrama', titulo: 'Crucigrama de ingredientes', palabras: [
        { palabra: 'LEVADURA', pista: 'Hongo que acelera la fermentación' },
        { palabra: 'MELAZA', pista: 'Miel de caña que alimenta a los microbios' },
        { palabra: 'ESTIERCOL', pista: 'Base animal de muchos abonos' },
        { palabra: 'CENIZA', pista: 'Aporta minerales como el potasio' } ] },
      { tipo: 'rompecabezas', titulo: 'Arma los bioinsumos', imagen: 'https://sinergiamexico.it.com/assets/course-covers/bioinsumos.webp', filas: 2, columnas: 3 }
    ]
  },
  {
    titulo: 'Fertirriego',
    juegos: [
      { tipo: 'sopa', titulo: 'Sopa de la salinidad', palabras: ['SALINIDAD', 'SODIO', 'LAVADO', 'DRENAJE', 'RAIZ'] },
      { tipo: 'memoria', titulo: 'Memoria del sistema de riego', parejas: [
        { a: 'Gotero', b: 'Entrega el agua en el punto exacto' },
        { a: 'Filtro', b: 'Evita que se tapen los emisores' },
        { a: 'Inyector', b: 'Mezcla el fertilizante con el agua' },
        { a: 'Tensiómetro', b: 'Ayuda a saber cuánta humedad hay' } ] },
      { tipo: 'conecta', titulo: 'Conecta el diagnóstico', pares: [
        { izq: 'Conductividad eléctrica', der: 'Mide la cantidad de sales' },
        { izq: 'pH', der: 'Indica acidez o alcalinidad' },
        { izq: 'Análisis de agua', der: 'Revisa sales antes de regar' },
        { izq: 'Fracción de lavado', der: 'Agua extra que saca las sales de la raíz' } ] },
      { tipo: 'crucigrama', titulo: 'Crucigrama del taller', palabras: [
        { palabra: 'EMISOR', pista: 'Pieza que libera el agua en la línea' },
        { palabra: 'PRESION', pista: 'Fuerza con que circula el agua' },
        { palabra: 'DOSIS', pista: 'Cantidad de fertilizante por aplicación' },
        { palabra: 'TANQUE', pista: 'Depósito de la solución nutritiva' } ] },
      { tipo: 'rompecabezas', titulo: 'Arma el sistema de fertirriego', imagen: 'https://sinergiamexico.it.com/assets/course-covers/fertirriego.webp', filas: 2, columnas: 3 }
    ]
  },
  {
    titulo: 'Fitohormonas y Estimuladores de Crecimiento',
    juegos: [
      { tipo: 'sopa', titulo: 'Sopa de fitohormonas', palabras: ['HORMONA', 'AUXINA', 'CITOCININA', 'GIBERELINA', 'ETILENO'] },
      { tipo: 'memoria', titulo: 'Memoria de las auxinas', parejas: [
        { a: 'Auxina', b: 'Favorece el enraizamiento' },
        { a: 'Dominancia apical', b: 'La yema principal frena a las laterales' },
        { a: 'Callo', b: 'Tejido que se forma en un corte antes de la raíz' },
        { a: 'AIB', b: 'Auxina usada para enraizar estacas' } ] },
      { tipo: 'conecta', titulo: 'Conecta el bioestimulante', pares: [
        { izq: 'Extracto de algas', der: 'Fuente natural de hormonas y minerales' },
        { izq: 'Ácidos húmicos', der: 'Mejoran el suelo y la absorción de nutrientes' },
        { izq: 'Aminoácidos', der: 'Apoyan a la planta en etapas de estrés' },
        { izq: 'Quitosano', der: 'Estimula las defensas de la planta' } ] },
      { tipo: 'crucigrama', titulo: 'Crucigrama de microorganismos', palabras: [
        { palabra: 'MICORRIZA', pista: 'Hongo aliado que se une a la raíz' },
        { palabra: 'RIZOSFERA', pista: 'Zona del suelo alrededor de la raíz' },
        { palabra: 'BACILLUS', pista: 'Bacteria benéfica muy usada en el campo' },
        { palabra: 'PGPR', pista: 'Siglas de bacterias promotoras del crecimiento' } ] },
      { tipo: 'rompecabezas', titulo: 'Arma el cultivo', imagen: 'https://sinergiamexico.it.com/assets/course-covers/fitohormonas.webp', filas: 2, columnas: 3 }
    ]
  },
  {
    titulo: 'Gestión Estratégica de Clientes y Ventas Agro',
    juegos: [
      { tipo: 'sopa', titulo: 'Sopa del cliente agro', palabras: ['CLIENTE', 'SEGMENTO', 'PERFIL', 'NECESIDAD', 'COMPRA'] },
      { tipo: 'memoria', titulo: 'Memoria de la gestión de clientes', parejas: [
        { a: 'CRM', b: 'Sistema para ordenar contactos y seguimiento' },
        { a: 'Seguimiento', b: 'Contacto después de la venta' },
        { a: 'Cartera', b: 'Conjunto de clientes de la empresa' },
        { a: 'Valor de vida', b: 'Lo que un cliente aporta con el tiempo' } ] },
      { tipo: 'conecta', titulo: 'Conecta la prospección', pares: [
        { izq: 'Prospecto', der: 'Posible cliente' },
        { izq: 'Referido', der: 'Cliente que llega por recomendación' },
        { izq: 'Llamada en frío', der: 'Primer contacto sin cita previa' },
        { izq: 'Embudo', der: 'Etapas desde el interés hasta la compra' } ] },
      { tipo: 'crucigrama', titulo: 'Crucigrama de negociación', palabras: [
        { palabra: 'OBJECION', pista: 'Duda o razón que pone el cliente' },
        { palabra: 'ESCUCHA', pista: 'Primer paso para entender al cliente' },
        { palabra: 'ACUERDO', pista: 'Resultado de una buena negociación' },
        { palabra: 'PRECIO', pista: 'Valor que se pide por el producto' } ] },
      { tipo: 'rompecabezas', titulo: 'Arma la venta', imagen: 'https://sinergiamexico.it.com/assets/course-covers/ventas-agro.webp', filas: 2, columnas: 3 }
    ]
  },
  {
    titulo: 'Inocuidad Alimentaria y Buenas Prácticas Agroalimentarias',
    juegos: [
      { tipo: 'sopa', titulo: 'Sopa de inocuidad', palabras: ['INOCUIDAD', 'PELIGRO', 'RIESGO', 'ALIMENTO', 'HIGIENE'] },
      { tipo: 'memoria', titulo: 'Memoria de las buenas prácticas', parejas: [
        { a: 'Agua de riego', b: 'Debe ser de buena calidad para no contaminar' },
        { a: 'Sanitarios', b: 'Cercanos y limpios para el personal' },
        { a: 'Lavado de manos', b: 'Evita pasar microbios al producto' },
        { a: 'Estiércol sin tratar', b: 'Fuente de microbios peligrosos' } ] },
      { tipo: 'conecta', titulo: 'Conecta la limpieza', pares: [
        { izq: 'Limpieza', der: 'Quita la suciedad visible' },
        { izq: 'Desinfección', der: 'Reduce los microbios que quedan' },
        { izq: 'Cloro', der: 'Desinfectante que se usa en dosis controlada' },
        { izq: 'Instalaciones', der: 'Pisos y paredes fáciles de lavar' } ] },
      { tipo: 'crucigrama', titulo: 'Crucigrama del HACCP', palabras: [
        { palabra: 'HACCP', pista: 'Sistema que controla los puntos críticos' },
        { palabra: 'CONTROL', pista: 'Medida para evitar el peligro' },
        { palabra: 'CRITICO', pista: 'Tipo de punto que exige vigilancia' },
        { palabra: 'MONITOREO', pista: 'Vigilar que se cumpla el límite' } ] },
      { tipo: 'rompecabezas', titulo: 'Arma la cadena segura', imagen: 'https://sinergiamexico.it.com/assets/course-covers/inocuidad.webp', filas: 2, columnas: 3 }
    ]
  },
  {
    titulo: 'Lombricomposta',
    juegos: [
      { tipo: 'sopa', titulo: 'Sopa de la lombricomposta', palabras: ['LOMBRIZ', 'HUMUS', 'COMPOSTA', 'LECHO', 'ORGANICO'] },
      { tipo: 'memoria', titulo: 'Memoria de la cosecha', parejas: [
        { a: 'Tamiz', b: 'Separa el humus de lo que no se descompone' },
        { a: 'Trampa de alimento', b: 'Atrae a las lombrices para separarlas' },
        { a: 'Humus', b: 'Producto final rico en nutrientes' },
        { a: 'Conos con luz', b: 'Las lombrices huyen de la luz y bajan' } ] },
      { tipo: 'conecta', titulo: 'Conecta el manejo', pares: [
        { izq: 'Humedad', der: 'Como una esponja exprimida' },
        { izq: 'Temperatura', der: 'Ni muy fría ni muy caliente' },
        { izq: 'Alimento', der: 'Residuos vegetales, sin carne ni lácteos' },
        { izq: 'Cítricos y picante', der: 'Se dan en muy poca cantidad' } ] },
      { tipo: 'crucigrama', titulo: 'Crucigrama del humus', palabras: [
        { palabra: 'ABONO', pista: 'Material que nutre al suelo' },
        { palabra: 'LIXIVIADO', pista: 'Líquido que escurre del lecho' },
        { palabra: 'ESTIERCOL', pista: 'Alimento que se deja madurar antes' },
        { palabra: 'SUELO', pista: 'Donde se aplica el humus' } ] },
      { tipo: 'rompecabezas', titulo: 'Arma la lombricomposta', imagen: 'https://sinergiamexico.it.com/assets/course-covers/lombricomposta.webp', filas: 2, columnas: 3 }
    ]
  },
  {
    titulo: 'Del Cacao al Chocolate',
    juegos: [
      { tipo: 'sopa', titulo: 'Sopa del cacao', palabras: ['CACAO', 'MAZORCA', 'CHOCOLATE', 'ALMENDRA', 'SOMBRA'] },
      { tipo: 'memoria', titulo: 'Memoria de la cosecha', parejas: [
        { a: 'Mazorca madura', b: 'Cambia de color al madurar' },
        { a: 'Tijera de podar', b: 'Corta sin dañar el árbol' },
        { a: 'Mazorca enferma', b: 'Se retira para no contagiar' },
        { a: 'Desgrane', b: 'Sacar las almendras de la mazorca' } ] },
      { tipo: 'conecta', titulo: 'Conecta la fermentación', pares: [
        { izq: 'Cajón', der: 'Recipiente de madera para fermentar' },
        { izq: 'Remover', der: 'Airea la masa para fermentar parejo' },
        { izq: 'Mucílago', der: 'La baba blanca que rodea la almendra' },
        { izq: 'Temperatura', der: 'Sube durante los días de fermentación' } ] },
      { tipo: 'crucigrama', titulo: 'Crucigrama del secado', palabras: [
        { palabra: 'HUMEDAD', pista: 'Debe bajar para guardar el grano' },
        { palabra: 'SECADO', pista: 'Paso que conserva el grano' },
        { palabra: 'ALMACEN', pista: 'Lugar ventilado para guardar el cacao' },
        { palabra: 'MOHO', pista: 'Hongo que sale si se guarda húmedo' } ] },
      { tipo: 'rompecabezas', titulo: 'Arma el cacao', imagen: 'https://sinergiamexico.it.com/assets/course-covers/del-cacao-al-chocolate.webp', filas: 2, columnas: 3 }
    ]
  },
  {
    titulo: 'Fertilización de Árboles Frutales',
    juegos: [
      { tipo: 'sopa', titulo: 'Sopa de nutrientes', palabras: ['NITROGENO', 'FOSFORO', 'POTASIO', 'CALCIO', 'ARBOL'] },
      { tipo: 'memoria', titulo: 'Memoria de los nutrientes', parejas: [
        { a: 'Nitrógeno', b: 'Impulsa hojas y brotes' },
        { a: 'Fósforo', b: 'Favorece raíces y floración' },
        { a: 'Potasio', b: 'Mejora tamaño y calidad del fruto' },
        { a: 'Calcio', b: 'Da firmeza al fruto' } ] },
      { tipo: 'conecta', titulo: 'Conecta la fertilización', pares: [
        { izq: 'Análisis de suelo', der: 'Dice qué nutrientes faltan' },
        { izq: 'Riego por goteo', der: 'Aplica el fertilizante cerca de la raíz' },
        { izq: 'Época de aplicación', der: 'Brotación, floración y llenado del fruto' },
        { izq: 'Materia orgánica', der: 'Mejora el suelo y retiene agua' } ] }
    ]
  }
];
