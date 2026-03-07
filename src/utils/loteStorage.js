/**
 * Funciones de persistencia para configuración y historial de lotes
 * Utiliza localStorage para guardar estado entre sesiones
 */

const STORAGE_KEY_CONFIG = 'multiscada_cafe_lote_config';
const STORAGE_KEY_HISTORIAL = 'multiscada_cafe_lote_historial';
const MAX_LOTES_HISTORIAL = 50;

/**
 * Guardar configuración de lote pendiente (receta e peso objetivo)
 * @param {Object} configuracion - { recetaId, pesoObjetivo }
 */
export function guardarConfiguracionLote(configuracion) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(configuracion));
  } catch (error) {
    console.warn('No se pudo guardar configuración de lote:', error);
  }
}

/**
 * Cargar configuración de lote guardada
 * @returns {Object|null} - Configuración guardada o null
 */
export function cargarConfiguracionLote() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY_CONFIG);
    return datos ? JSON.parse(datos) : null;
  } catch (error) {
    console.warn('No se pudo cargar configuración de lote:', error);
    return null;
  }
}

/**
 * Agregar lote completado al historial
 * @param {Object} lote - Datos del lote a guardar
 */
export function agregarLoteAlHistorial(lote) {
  try {
    let historial = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORIAL) || '[]');

    // Agregar nuevo lote al inicio
    historial.unshift({
      ...lote,
      timestamp: new Date().toISOString(),
    });

    // Mantener solo los últimos MAX_LOTES
    if (historial.length > MAX_LOTES_HISTORIAL) {
      historial = historial.slice(0, MAX_LOTES_HISTORIAL);
    }

    localStorage.setItem(STORAGE_KEY_HISTORIAL, JSON.stringify(historial));
  } catch (error) {
    console.warn('No se pudo guardar lote al historial:', error);
  }
}

/**
 * Obtener historial de lotes completados
 * @returns {Array} - Array de lotes completados (ordenado por más reciente primero)
 */
export function obtenerHistorialLotes() {
  try {
    const historial = localStorage.getItem(STORAGE_KEY_HISTORIAL);
    return historial ? JSON.parse(historial) : [];
  } catch (error) {
    console.warn('No se pudo cargar historial de lotes:', error);
    return [];
  }
}

/**
 * Limpiar todo el historial de lotes
 */
export function limpiarHistorialLotes() {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORIAL);
  } catch (error) {
    console.warn('No se pudo limpiar historial:', error);
  }
}

/**
 * Generar número de lote único con formato: LOTE-YYYY-NNN
 * @returns {string} - Número de lote
 */
export function generarNumeroDeLote() {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const historial = obtenerHistorialLotes();

  // Contar lotes del año actual
  const lotesDelYear = historial.filter(l => {
    const lotYear = parseInt(l.numeroLote.split('-')[1], 10);
    return lotYear === year;
  }).length;

  const numero = (lotesDelYear + 1).toString().padStart(3, '0');
  return `LOTE-${year}-${numero}`;
}
