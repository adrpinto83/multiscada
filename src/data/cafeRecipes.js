/**
 * Definición de 5 recetas predefinidas para la planta tostadora de café
 * Cada receta contiene setpoints para los 4 controladores PID y parámetros de sintonía
 */

export const RECETAS_CAFE = [
  {
    id: 'arabica-ligero',
    nombre: 'Arábica Ligero',
    descripcion: 'Tueste ligero para arábica de alta altitud. Realza acidez brillante y notas florales.',
    nivel: 'LIGERO',
    color: '#a3e635',
    setpoints: {
      y1: 210.0,   // Temp tambor (°C)
      y2: 3.5,     // Humedad (%)
      y3: 160.0,   // Temp gases (°C)
      y4: 70.0     // Color Agtron (claro)
    },
    pidParams: [
      { id: 0, Kp: 1.2, Ki: 0.05, Kd: 0.25 },  // TIC-001 - Temp tambor
      { id: 1, Kp: 1.6, Ki: 0.065, Kd: 0.35 }, // TIC-002 - Temp gases
      { id: 2, Kp: 7.5, Ki: 0.09, Kd: 0.9 },   // MIC-001 - Humedad
      { id: 3, Kp: 4.5, Ki: 0.025, Kd: 1.8 }   // CIC-001 - Color
    ],
    duracionEstimada: 12,
    consumoEnergiaEstimado: 700,
  },
  {
    id: 'arabica-medio',
    nombre: 'Arábica Medio',
    descripcion: 'Tostado medio (perfil por defecto). Balance óptimo entre acidez y cuerpo.',
    nivel: 'MEDIO',
    color: '#f59e0b',
    setpoints: {
      y1: 220.0,
      y2: 3.5,
      y3: 170.0,
      y4: 55.0
    },
    pidParams: [
      { id: 0, Kp: 1.5, Ki: 0.06, Kd: 0.3 },   // TIC-001
      { id: 1, Kp: 2.0, Ki: 0.08, Kd: 0.4 },   // TIC-002
      { id: 2, Kp: 8.0, Ki: 0.10, Kd: 1.0 },   // MIC-001
      { id: 3, Kp: 5.0, Ki: 0.03, Kd: 2.0 }    // CIC-001
    ],
    duracionEstimada: 14,
    consumoEnergiaEstimado: 800,
  },
  {
    id: 'robusta-oscuro',
    nombre: 'Robusta Oscuro',
    descripcion: 'Tostado oscuro para robusta. Cuerpo intenso, bajo en acidez, amargo potente.',
    nivel: 'OSCURO',
    color: '#b45309',
    setpoints: {
      y1: 235.0,
      y2: 3.2,
      y3: 185.0,
      y4: 40.0
    },
    pidParams: [
      { id: 0, Kp: 1.7, Ki: 0.07, Kd: 0.35 },  // TIC-001
      { id: 1, Kp: 2.2, Ki: 0.09, Kd: 0.45 },  // TIC-002
      { id: 2, Kp: 7.0, Ki: 0.085, Kd: 0.85 }, // MIC-001
      { id: 3, Kp: 5.5, Ki: 0.035, Kd: 2.2 }   // CIC-001
    ],
    duracionEstimada: 16,
    consumoEnergiaEstimado: 950,
  },
  {
    id: 'mezcla-espresso',
    nombre: 'Mezcla Espresso',
    descripcion: 'Blend 70% arábica / 30% robusta. Crema rica y cuerpo para espresso.',
    nivel: 'MEDIO',
    color: '#d97706',
    setpoints: {
      y1: 225.0,
      y2: 3.4,
      y3: 175.0,
      y4: 48.0
    },
    pidParams: [
      { id: 0, Kp: 1.55, Ki: 0.062, Kd: 0.32 }, // TIC-001
      { id: 1, Kp: 2.05, Ki: 0.083, Kd: 0.42 }, // TIC-002
      { id: 2, Kp: 7.8, Ki: 0.095, Kd: 0.95 },  // MIC-001
      { id: 3, Kp: 5.2, Ki: 0.032, Kd: 2.1 }    // CIC-001
    ],
    duracionEstimada: 15,
    consumoEnergiaEstimado: 850,
  },
  {
    id: 'descafeinado-suave',
    nombre: 'Descafeinado Suave',
    descripcion: 'Temperatura moderada para descafeinado. Perfil suave que preserva notas delicadas.',
    nivel: 'LIGERO',
    color: '#d4a574',
    setpoints: {
      y1: 205.0,
      y2: 3.6,
      y3: 155.0,
      y4: 68.0
    },
    pidParams: [
      { id: 0, Kp: 1.1, Ki: 0.048, Kd: 0.23 },  // TIC-001
      { id: 1, Kp: 1.5, Ki: 0.06, Kd: 0.33 },   // TIC-002
      { id: 2, Kp: 7.2, Ki: 0.088, Kd: 0.88 },  // MIC-001
      { id: 3, Kp: 4.2, Ki: 0.023, Kd: 1.7 }    // CIC-001
    ],
    duracionEstimada: 13,
    consumoEnergiaEstimado: 750,
  },
];

/**
 * Obtener receta por ID
 * @param {string} id - ID de la receta
 * @returns {Object|null} - Receta o null si no existe
 */
export function obtenerRecetaPorId(id) {
  return RECETAS_CAFE.find(r => r.id === id) || null;
}

/**
 * Obtener lista simplificada de recetas disponibles
 * @returns {Array} - Array con nombre, id, nivel y color
 */
export function obtenerRecetasDisponibles() {
  return RECETAS_CAFE.map(r => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    nivel: r.nivel,
    color: r.color,
    temp: r.setpoints.y1,
    agtron: r.setpoints.y4,
  }));
}
