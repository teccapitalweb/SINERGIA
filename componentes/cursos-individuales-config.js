export const API_SINERGIA = 'https://sinergia-webhook-production.up.railway.app';
export const CURSO_RIEGO = 'riego-eficiente-y-ahorro-del-agua';
export const PORTADA_RIEGO = '/img/cursos/mini/riego.webp';
export const REFERIDO = 'sg_desde';

export const CURSOS_INDIVIDUALES = Object.freeze({
  'biofertilizantes': { titulo: 'Elaboración y Aplicación de Biofertilizantes en Cultivos', portada: '/campus/portadas/biofertilizantes-1.jpg' },
  'cana-de-azucar': { titulo: 'Producción Rentable de Caña de Azúcar', portada: '/campus/portadas/cana-de-azucar-1.jpg' },
  'gerberas': { titulo: 'Cultivo y Manejo de Gerberas', portada: '/campus/portadas/gerberas.webp' },
  'habanero': { titulo: 'Producción y Manejo de Chile Habanero', portada: '/campus/portadas/habanero.webp' },
  'soluciones-nutritivas': { titulo: 'Elaboración de Soluciones Nutritivas para Cultivos', portada: '/campus/portadas/soluciones-nutritivas-1.jpg' }
});

export const esCursoIndividual = slug => Object.hasOwn(CURSOS_INDIVIDUALES, slug);
export const landingCurso = (destino, origen) => {
  if (!esCursoIndividual(destino)) return '';
  const camino = '/' + destino + '/';
  return esCursoIndividual(origen) && origen !== destino ? camino + '?' + REFERIDO + '=' + encodeURIComponent(origen) : camino;
};

export function portadaPublica(portada) {
  return typeof portada === 'string' && /^\/(?:campus\/portadas|img\/cursos)\/[\p{L}0-9_\/-]+\.(?:jpe?g|png|webp)$/iu.test(portada) ? portada : '';
}

export function portadaCurso(curso) {
  const primerModulo = curso.modulos?.find(modulo => modulo.clases?.length);
  return portadaPublica(primerModulo?.clases[0]?.portada) || CURSOS_INDIVIDUALES[curso.slug]?.portada ||
    portadaPublica(curso.portada) || (curso.slug === CURSO_RIEGO ? PORTADA_RIEGO : '');
}

const formateador = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });
export const mxn = centavos => formateador.format(centavos / 100) + ' MXN';

export function validarOferta(oferta, origen, destino) {
  if (!oferta || oferta.origenSlug !== origen || oferta.destinoSlug !== destino || oferta.moneda !== 'mxn') return null;
  const { precioCentavos, descuentoCentavos, totalCentavos } = oferta;
  if (![precioCentavos, descuentoCentavos, totalCentavos].every(n => Number.isSafeInteger(n) && n > 0) ||
      precioCentavos - descuentoCentavos !== totalCentavos) return null;
  return oferta;
}
