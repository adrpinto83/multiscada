/**
 * Store Global Zustand — Estado de la Planta Tostado Café
 * Variables de proceso, controladores PID, alarmas, tendencias, emulación
 */

import { create } from 'zustand';

// ─── Definición de alarmas ISA-18.2 ──────────────────────────────────────────
const DEFINICIONES_ALARMA_CAFE = [
  { id: 'a1', tag: 'TT-001-HH', cv: 'y1',     condicion: v => v > 240,  prioridad: 'CRÍTICA', descripcion: 'TEMPERATURA TAMBOR MUY ALTA',               color: '#ff2222' },
  { id: 'a2', tag: 'TT-002-HH', cv: 'y3',     condicion: v => v > 220,  prioridad: 'CRÍTICA', descripcion: 'TEMPERATURA GASES SALIDA MUY ALTA',          color: '#ff2222' },
  { id: 'a3', tag: 'TT-001-L',  cv: 'y1',     condicion: v => v < 160,  prioridad: 'ALTA',    descripcion: 'TEMPERATURA TAMBOR BAJA',                    color: '#ff4444' },
  { id: 'a4', tag: 'MT-001-HH', cv: 'y2',     condicion: v => v > 6,    prioridad: 'ALTA',    descripcion: 'HUMEDAD GRANO MUY ALTA',                     color: '#ff4444' },
  { id: 'a5', tag: 'CT-001-LL', cv: 'y4',     condicion: v => v < 35,   prioridad: 'ALTA',    descripcion: 'COLOR AGTRON MUY BAJO — GRANO QUEMADO',      color: '#ff4444' },
  { id: 'a6', tag: 'CT-001-HH', cv: 'y4',     condicion: v => v > 80,   prioridad: 'MEDIA',   descripcion: 'COLOR AGTRON ALTO — GRANO POCO TOSTADO',     color: '#ffaa00' },
  { id: 'a7', tag: 'TT-002-H',  cv: 'y3',     condicion: v => v > 200,  prioridad: 'MEDIA',   descripcion: 'TEMPERATURA GASES SALIDA ALTA',              color: '#ffaa00' },
  { id: 'a8', tag: 'MT-001-H',  cv: 'y2',     condicion: v => v > 5,    prioridad: 'MEDIA',   descripcion: 'HUMEDAD GRANO ALTA',                         color: '#ffaa00' },
  { id: 'a9', tag: 'ET-002-H',  cv: 'energia', condicion: v => v > 1200, prioridad: 'MEDIA',  descripcion: 'CONSUMO ENERGÉTICO ELEVADO',                 color: '#ffaa00' },
];

const MAX_PUNTOS_TENDENCIA = 240; // 120 segundos a 2 Hz

// ─── Estado inicial PID ───────────────────────────────────────────────────────
// Emparejamiento: pids[0] TIC-001 y1←u1, pids[1] TIC-002 y3←u3,
//                pids[2] MIC-001 y2←u2, pids[3] CIC-001 y4←u4
const pidsIniciales = [
  { id: 0, tag: 'TIC-001', etiqueta: 'Control Temp Tambor',    cv: 'y1', mv: 'u1', unidad: '°C',  Kp: 1.5, Ki: 0.06, Kd: 0.3, sp: 220.0, pv: 220.0, mvVal: 60, modo: 'auto', spMin: 100, spMax: 280 },
  { id: 1, tag: 'TIC-002', etiqueta: 'Control Temp Gases',     cv: 'y3', mv: 'u3', unidad: '°C',  Kp: 2.0, Ki: 0.08, Kd: 0.4, sp: 170.0, pv: 170.0, mvVal: 40, modo: 'auto', spMin: 80,  spMax: 250 },
  { id: 2, tag: 'MIC-001', etiqueta: 'Control Humedad Grano',  cv: 'y2', mv: 'u2', unidad: '%',   Kp: 8.0, Ki: 0.10, Kd: 1.0, sp: 3.5,   pv: 3.5,   mvVal: 50, modo: 'auto', spMin: 0,   spMax: 10  },
  { id: 3, tag: 'CIC-001', etiqueta: 'Control Color Agtron',   cv: 'y4', mv: 'u4', unidad: 'Ag',  Kp: 5.0, Ki: 0.03, Kd: 2.0, sp: 55.0,  pv: 55.0,  mvVal: 5,  modo: 'auto', spMin: 0,   spMax: 100 },
];

// ─── Estado inicial emulación ─────────────────────────────────────────────────
const emulacionInicial = {
  y1: { activa: false, valor: 220.0, min: 0,   max: 300,  paso: 0.5  },
  y2: { activa: false, valor: 3.5,   min: 0,   max: 15,   paso: 0.1  },
  y3: { activa: false, valor: 170.0, min: 0,   max: 280,  paso: 0.5  },
  y4: { activa: false, valor: 55.0,  min: 0,   max: 100,  paso: 0.5  },
  u1: { activa: false, valor: 60,    min: 0,   max: 100,  paso: 0.5  },
  u2: { activa: false, valor: 50,    min: 0,   max: 100,  paso: 0.5  },
  u3: { activa: false, valor: 40,    min: 0,   max: 100,  paso: 0.5  },
  u4: { activa: false, valor: 5,     min: 0,   max: 100,  paso: 0.5  },
};

export const useCafeStore = create((set, get) => ({
  // ── Simulación ──────────────────────────────────────────────────────────────
  tiempoSim: 0,
  corriendo: true,

  // ── Variables de proceso (CVs) ─────────────────────────────────────────────
  cvs: { y1: 220.0, y2: 3.5, y3: 170.0, y4: 55.0 },

  // ── Variables manipuladas (MVs) ────────────────────────────────────────────
  mvs: { u1: 60, u2: 50, u3: 40, u4: 5 },

  // ── Variables calculadas ───────────────────────────────────────────────────
  calculadas: {
    tasaCalentamiento: 0.0,    // °C/min
    consumoEnergia: 800.0,     // kcal/kg
    gradoTostado: 'MEDIO',     // VERDE/LIGERO/MEDIO/OSCURO/QUEMADO
    factorDesarrollo: 0.0,     // 0-100%
  },

  // ── Controladores PID ──────────────────────────────────────────────────────
  pids: pidsIniciales,

  // ── Perturbaciones ─────────────────────────────────────────────────────────
  perturbaciones: { d1: 11, d2: 20 },
  perturbacionesPendientes: { d1: 11, d2: 20 },

  // ── Emulación por variable ─────────────────────────────────────────────────
  emulacion: emulacionInicial,

  // ── Tendencias ─────────────────────────────────────────────────────────────
  datosTendencia: [],

  // ── Alarmas ────────────────────────────────────────────────────────────────
  alarmas: [],
  historialAlarmas: [],

  // ── UI ─────────────────────────────────────────────────────────────────────
  faceplateActivo: null,
  sidebarAbierto: true,
  panelPerturbacionAbierto: false,

  // ── Acciones ───────────────────────────────────────────────────────────────

  /**
   * Llamado por el scheduler en cada tick con datos frescos de simulación
   */
  alActualizarSim: (snapshot) => {
    const { cvs, mvs, pids, tiempoSim, perturbaciones, calculadas } = snapshot;
    const estado = get();
    const emulacion = estado.emulacion;

    const cvsFinales = {
      y1: emulacion.y1.activa ? emulacion.y1.valor : cvs.y1,
      y2: emulacion.y2.activa ? emulacion.y2.valor : cvs.y2,
      y3: emulacion.y3.activa ? emulacion.y3.valor : cvs.y3,
      y4: emulacion.y4.activa ? emulacion.y4.valor : cvs.y4,
    };

    const mvsFinales = {
      u1: emulacion.u1.activa ? emulacion.u1.valor : mvs.u1,
      u2: emulacion.u2.activa ? emulacion.u2.valor : mvs.u2,
      u3: emulacion.u3.activa ? emulacion.u3.valor : mvs.u3,
      u4: emulacion.u4.activa ? emulacion.u4.valor : mvs.u4,
    };

    // Evaluar alarmas
    const alarmasActuales = [...estado.alarmas];
    const nuevoHistorial = [...estado.historialAlarmas];
    const ahora = new Date();

    const valoresParaAlarma = {
      ...cvsFinales,
      energia: calculadas.consumoEnergia,
    };

    DEFINICIONES_ALARMA_CAFE.forEach(def => {
      const valor = valoresParaAlarma[def.cv];
      if (valor === undefined) return;
      const estaActiva = def.condicion(valor);
      const indiceExistente = alarmasActuales.findIndex(a => a.id === def.id);
      const existente = indiceExistente >= 0 ? alarmasActuales[indiceExistente] : null;

      if (estaActiva && !existente) {
        const evento = {
          id: def.id, tag: def.tag, descripcion: def.descripcion,
          prioridad: def.prioridad, color: def.color,
          estado: 'ACTIVA', timestamp: ahora.toISOString(), valor,
        };
        alarmasActuales.push(evento);
        nuevoHistorial.unshift({ ...evento, evento: 'ACTIVADA' });
      } else if (!estaActiva && existente && existente.estado !== 'BORRADA') {
        const actualizada = { ...existente, estado: 'BORRADA', borradaEn: ahora.toISOString() };
        alarmasActuales.splice(indiceExistente, 1);
        nuevoHistorial.unshift({ ...actualizada, evento: 'BORRADA' });
      }
    });

    // Actualizar snapshots PID
    const pidsActualizados = estado.pids.map((cfg, i) => {
      const snap = pids[i];
      return { ...cfg, pv: snap.pv, mvVal: snap.mv, modo: snap.mode, Kp: snap.Kp, Ki: snap.Ki, Kd: snap.Kd, sp: snap.sp };
    });

    // Punto de tendencia
    const punto = {
      t: Math.round(tiempoSim),
      y1: cvsFinales.y1, y2: cvsFinales.y2, y3: cvsFinales.y3, y4: cvsFinales.y4,
      u1: mvsFinales.u1, u2: mvsFinales.u2, u3: mvsFinales.u3, u4: mvsFinales.u4,
      sp1: pidsActualizados[0].sp, sp2: pidsActualizados[1].sp,
      sp3: pidsActualizados[2].sp, sp4: pidsActualizados[3].sp,
      tasa: calculadas.tasaCalentamiento,
      energia: calculadas.consumoEnergia,
    };

    const nuevaTendencia = [...estado.datosTendencia, punto];
    if (nuevaTendencia.length > MAX_PUNTOS_TENDENCIA) {
      nuevaTendencia.splice(0, nuevaTendencia.length - MAX_PUNTOS_TENDENCIA);
    }

    set({
      tiempoSim, cvs: cvsFinales, mvs: mvsFinales,
      pids: pidsActualizados, perturbaciones, calculadas,
      datosTendencia: nuevaTendencia,
      alarmas: alarmasActuales,
      historialAlarmas: nuevoHistorial.slice(0, 300),
    });
  },

  // ── Acciones PID ───────────────────────────────────────────────────────────
  setPidModo: (idx, modo) => set(s => ({
    pids: s.pids.map((p, i) => i === idx ? { ...p, modo } : p),
  })),
  setPidSP: (idx, valor) => set(s => ({
    pids: s.pids.map((p, i) => i === idx ? { ...p, sp: valor } : p),
  })),
  setPidSalidaManual: (idx, valor) => set(s => ({
    pids: s.pids.map((p, i) => i === idx ? { ...p, mvVal: valor } : p),
  })),
  ajustarPid: (idx, params) => set(s => ({
    pids: s.pids.map((p, i) => i === idx ? { ...p, ...params } : p),
  })),

  // ── Acciones Perturbaciones ────────────────────────────────────────────────
  setPerturbacionPendiente: (d1, d2) => set({ perturbacionesPendientes: { d1, d2 } }),
  aplicarPerturbacion: () => {
    const { perturbacionesPendientes } = get();
    set({ perturbaciones: { ...perturbacionesPendientes } });
  },
  restablecerPerturbaciones: () => set({
    perturbaciones: { d1: 11, d2: 20 },
    perturbacionesPendientes: { d1: 11, d2: 20 },
  }),

  // ── Acciones Emulación ─────────────────────────────────────────────────────
  setEmulacion: (tag, campo, valor) => set(s => ({
    emulacion: { ...s.emulacion, [tag]: { ...s.emulacion[tag], [campo]: valor } },
  })),
  toggleEmulacion: (tag) => set(s => ({
    emulacion: { ...s.emulacion, [tag]: { ...s.emulacion[tag], activa: !s.emulacion[tag].activa } },
  })),
  resetearEmulaciones: () => set({ emulacion: emulacionInicial }),

  // ── Acciones Alarmas ───────────────────────────────────────────────────────
  reconocerAlarma: (id) => set(s => ({
    alarmas: s.alarmas.map(a => a.id === id ? { ...a, estado: 'RECONOCIDA' } : a),
  })),
  reconocerTodasAlarmas: () => set(s => ({
    alarmas: s.alarmas.map(a => ({ ...a, estado: 'RECONOCIDA' })),
  })),

  // ── Acciones UI ────────────────────────────────────────────────────────────
  setFaceplateActivo: (id) => set({ faceplateActivo: id }),
  cerrarFaceplate: () => set({ faceplateActivo: null }),
  toggleSidebar: () => set(s => ({ sidebarAbierto: !s.sidebarAbierto })),
  togglePanelPerturbacion: () => set(s => ({ panelPerturbacionAbierto: !s.panelPerturbacionAbierto })),
}));

export { DEFINICIONES_ALARMA_CAFE };
