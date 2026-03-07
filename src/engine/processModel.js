/**
 * Modelo de Proceso MIMO 4×4 — Planta OI de Dos Pasos
 *
 * Variables Controladas (CV):
 *   y1: Flujo permeado (m³/h)         SP=12.0
 *   y2: Conductividad producto (μS/cm) SP=450
 *   y3: Nivel depósito producto (%)    SP=60
 *   y4: pH producto                    SP=7.4
 *
 * Variables Manipuladas (MV):
 *   u1: Velocidad bomba alta presión (0-100%)
 *   u2: Apertura válvula concentrado (0-100%)
 *   u3: Velocidad bomba impulsora paso 2 (0-100%)
 *   u4: Caudal dosificación NaOH (0-100%)
 *
 * Punto operación: u1=65, u2=40, u3=55, u4=30 → y1=12, y2=450, y3=60, y4=7.4
 */

import { FOPDTElement, DisturbanceFOPDT } from './fopdt.js';

export const SP_CVS    = { y1: 12.0, y2: 450, y3: 60, y4: 7.4 };
export const OP_MVS    = { u1: 65,   u2: 40,  u3: 55, u4: 30  };
export const DIST_NOM  = { d1: 35,   d2: 22  };
export const DIST_RANGO = { d1: { min: 30, max: 45 }, d2: { min: 15, max: 35 } };

// Matriz G [CV][MV]: { K, tau, theta }
const G_PARAMS = [
//   u1                    u2                    u3                    u4
  [{ K:  3.2, tau:  5, theta: 1 }, { K: -1.8, tau:  8, theta: 3 }, { K:  0.9, tau:  6, theta: 2 }, { K:  0.1, tau:  4, theta: 1 }], // y1
  [{ K: -4.5, tau: 12, theta: 2 }, { K:  5.1, tau: 20, theta: 4 }, { K: -2.3, tau: 15, theta: 3 }, { K:  0.2, tau:  5, theta: 1 }], // y2
  [{ K:  2.1, tau:  3, theta: 1 }, { K: -0.9, tau:  6, theta: 2 }, { K:  0.7, tau:  4, theta: 2 }, { K:  0.0, tau:  1, theta: 0 }], // y3
  [{ K:  0.3, tau:  8, theta: 2 }, { K:  0.1, tau: 10, theta: 3 }, { K:  0.4, tau:  7, theta: 2 }, { K:  6.8, tau:  3, theta: 1 }], // y4
];

// Perturbaciones d1=salinidad, d2=temperatura
const PARAMS_DIST = {
  d1: { y1: { K: -0.3, tau: 10 }, y2: { K: 0.8,  tau: 15 } },
  d2: { y1: { K:  0.5, tau:  8 }, y2: { K: -1.2, tau: 12 } },
};

export class ModeloProceso {
  constructor(dt = 0.5) {
    this.dt = dt;

    // Red 4×4 de elementos FOPDT
    this.elementos = G_PARAMS.map(fila =>
      fila.map(p => new FOPDTElement(p.K, p.tau, p.theta, dt))
    );

    // Elementos de perturbación
    this.elemDisturbancia = {
      d1_y1: new DisturbanceFOPDT(PARAMS_DIST.d1.y1.K, PARAMS_DIST.d1.y1.tau, dt),
      d1_y2: new DisturbanceFOPDT(PARAMS_DIST.d1.y2.K, PARAMS_DIST.d1.y2.tau, dt),
      d2_y1: new DisturbanceFOPDT(PARAMS_DIST.d2.y1.K, PARAMS_DIST.d2.y1.tau, dt),
      d2_y2: new DisturbanceFOPDT(PARAMS_DIST.d2.y2.K, PARAMS_DIST.d2.y2.tau, dt),
    };

    // Factor de ensuciamiento de membrana (0=limpio, 1=ensuciado)
    this.factorEnsuciamiento = 0.0;
    // Velocidad de ensuciamiento: 0→100% en ~14 horas de operación continua
    this.velocidadEnsuciamiento = 0.00002;

    // Variables calculadas
    this.calculadas = {
      ratioRecuperacion: 35.0,
      rechazoSal: 99.1,
      energiaEspecifica: 3.2,
      presionDiferencial: 4.5,
      factorEnsuciamiento: 0.0,
      flujoAlimentacion: 34.3,
      flujoConcentrado: 22.3,
    };

    this.cvs = { ...SP_CVS };
    this.perturbaciones = { ...DIST_NOM };
  }

  reiniciarEstacionario() {
    this.elementos.forEach(fila => fila.forEach(el => el.reset(0)));
    Object.values(this.elemDisturbancia).forEach(el => el.reset(0));
  }

  limpiarMembranas() {
    this.factorEnsuciamiento = 0.0;
  }

  /**
   * Avanzar un paso de simulación
   * @param {Object} mvs  { u1, u2, u3, u4 } en unidades reales
   * @param {Object} dist { d1, d2 } en unidades reales
   * @returns {{ cvs, calculadas }}
   */
  paso(mvs, dist) {
    // Desviaciones desde punto de operación
    const uDes = [
      mvs.u1 - OP_MVS.u1,
      mvs.u2 - OP_MVS.u2,
      mvs.u3 - OP_MVS.u3,
      mvs.u4 - OP_MVS.u4,
    ];
    const dDes1 = dist.d1 - DIST_NOM.d1;
    const dDes2 = dist.d2 - DIST_NOM.d2;

    // Sumar contribuciones de cada MV en cada CV
    const cvDes = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        cvDes[i] += this.elementos[i][j].step(uDes[j]);
      }
    }

    // Contribuciones de perturbaciones
    cvDes[0] += this.elemDisturbancia.d1_y1.step(dDes1) + this.elemDisturbancia.d2_y1.step(dDes2);
    cvDes[1] += this.elemDisturbancia.d1_y2.step(dDes1) + this.elemDisturbancia.d2_y2.step(dDes2);

    // Efecto de ensuciamiento sobre flujo y conductividad
    const degradFlujo = -this.factorEnsuciamiento * 4.0;      // hasta -4 m³/h al 100%
    const degradCond  =  this.factorEnsuciamiento * 120.0;    // hasta +120 μS/cm al 100%
    cvDes[0] += degradFlujo;
    cvDes[1] += degradCond;

    // Ruido de proceso realista
    const ruido = [
      (Math.random() - 0.5) * 0.025,
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.06,
      (Math.random() - 0.5) * 0.003,
    ];

    this.cvs = {
      y1: Math.max(0, SP_CVS.y1 + cvDes[0] + ruido[0]),
      y2: Math.max(0, SP_CVS.y2 + cvDes[1] + ruido[1]),
      y3: Math.max(0, Math.min(100, SP_CVS.y3 + cvDes[2] + ruido[2])),
      y4: Math.max(0, SP_CVS.y4 + cvDes[3] + ruido[3]),
    };

    // Actualizar ensuciamiento (solo si bombas corriendo)
    if (mvs.u1 > 10) {
      this.factorEnsuciamiento = Math.min(1.0,
        this.factorEnsuciamiento + this.velocidadEnsuciamiento * this.dt
      );
    }

    // ── Variables calculadas ──────────────────────────────────────────────
    const flujoAlim = Math.max(0.1, this.cvs.y1 / Math.max(0.1, (mvs.u2 / 100) * 0.7 + 0.3));
    const flujoConc = Math.max(0, flujoAlim - this.cvs.y1);
    const rr = (this.cvs.y1 / Math.max(0.1, flujoAlim)) * 100;

    // Conductividad alimentación = f(salinidad)
    const condAlim = dist.d1 * 1500;  // aprox: 35 g/L → ~52,500 μS/cm (usamos escala comprimida)
    const condAlimEscalada = dist.d1 * 150;
    const rechazoSal = condAlim > 0
      ? Math.max(90, 100 - (this.cvs.y2 / condAlimEscalada) * 100)
      : 99.0;

    // Presión diferencial membrana (aumenta con ensuciamiento y flujo)
    const presionBase = 2.0 + mvs.u1 * 0.08;
    const presionFouling = this.factorEnsuciamiento * 8.0;
    const presionDif = Math.max(0, presionBase + presionFouling + (Math.random() - 0.5) * 0.1);

    // Consumo energético específico kWh/m³
    const potenciaBomba = (mvs.u1 / 100) * 45 + (mvs.u3 / 100) * 15; // kW
    const energiaEsp = this.cvs.y1 > 0.5 ? potenciaBomba / this.cvs.y1 : 0;

    this.calculadas = {
      ratioRecuperacion:   Math.min(100, Math.max(0, rr)),
      rechazoSal:          Math.min(100, Math.max(0, rechazoSal)),
      energiaEspecifica:   Math.min(20, Math.max(0, energiaEsp)),
      presionDiferencial:  presionDif,
      factorEnsuciamiento: this.factorEnsuciamiento * 100,
      flujoAlimentacion:   flujoAlim,
      flujoConcentrado:    flujoConc,
    };

    return { cvs: { ...this.cvs }, calculadas: { ...this.calculadas } };
  }
}

/**
 * Cálculo de Matriz de Ganancias Relativas (RGA) — Método de Bristol
 */
export function calcularRGA() {
  const G = G_PARAMS.map(fila => fila.map(p => p.K));
  try {
    const Ginv = invertirMatriz(G);
    return G.map((fila, i) => fila.map((gij, j) => gij * Ginv[j][i]));
  } catch {
    return null;
  }
}

function invertirMatriz(m) {
  const n = m.length;
  const a = m.map(f => [...f]);
  const inv = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  for (let col = 0; col < n; col++) {
    let maxFila = col;
    for (let fila = col + 1; fila < n; fila++) {
      if (Math.abs(a[fila][col]) > Math.abs(a[maxFila][col])) maxFila = fila;
    }
    [a[col], a[maxFila]] = [a[maxFila], a[col]];
    [inv[col], inv[maxFila]] = [inv[maxFila], inv[col]];
    const pivote = a[col][col];
    if (Math.abs(pivote) < 1e-10) throw new Error('Matriz singular');
    for (let j = 0; j < n; j++) { a[col][j] /= pivote; inv[col][j] /= pivote; }
    for (let fila = 0; fila < n; fila++) {
      if (fila !== col) {
        const f = a[fila][col];
        for (let j = 0; j < n; j++) { a[fila][j] -= f * a[col][j]; inv[fila][j] -= f * inv[col][j]; }
      }
    }
  }
  return inv;
}
