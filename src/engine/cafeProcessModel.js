/**
 * Modelo de Proceso MIMO 4×4 — Planta Tostado Café
 *
 * Variables Controladas (CV):
 *   y1: Temperatura tambor (°C)         SP=220
 *   y2: Humedad grano (%)               SP=3.5
 *   y3: Temperatura gases salida (°C)   SP=170
 *   y4: Índice color Agtron (0-100)     SP=55
 *
 * Variables Manipuladas (MV):
 *   u1: Potencia quemador (0-100%)
 *   u2: Velocidad tambor (0-100%)
 *   u3: Caudal aire entrada (0-100%)
 *   u4: Aire enfriamiento (0-100%)
 *
 * Punto operación: u1=60, u2=50, u3=40, u4=5 → y1=220, y2=3.5, y3=170, y4=55
 * Perturbaciones nominales: d1=11 g/kg (humedad grano verde), d2=20°C (temp ambiente)
 */

import { FOPDTElement, DisturbanceFOPDT } from './fopdt.js';

export const SP_CVS    = { y1: 220.0, y2: 3.5,  y3: 170.0, y4: 55.0 };
export const OP_MVS    = { u1: 60,    u2: 50,   u3: 40,    u4: 5    };
export const DIST_NOM  = { d1: 11,    d2: 20   };
export const DIST_RANGO = { d1: { min: 8, max: 14 }, d2: { min: 10, max: 35 } };

// Matriz G [CV][MV]: { K, tau, theta }
const G_PARAMS = [
//   u1 quemador                   u2 tambor                    u3 aire                      u4 enfriamiento
  [{ K:  3.5, tau:  8, theta: 1 }, { K: -0.5, tau:  5, theta: 0.5 }, { K: -2.0, tau:  6, theta: 1   }, { K: -3.0, tau:  3, theta: 0.5 }], // y1 temp
  [{ K: -0.08,tau: 45, theta: 8 }, { K: -0.02,tau: 30, theta: 5   }, { K: -0.05,tau: 35, theta: 6   }, { K:  0.02,tau: 15, theta: 3   }], // y2 humid
  [{ K:  2.5, tau:  4, theta: 0.5},{ K:  0.2, tau:  3, theta: 0.3 }, { K:  1.5, tau:  3, theta: 0.3 }, { K: -1.5, tau:  2, theta: 0.3 }], // y3 gases
  [{ K: -0.5, tau: 90, theta: 15}, { K:  0.1, tau: 60, theta: 10  }, { K:  0.12,tau: 70, theta: 12  }, { K:  0.8, tau: 30, theta: 5   }], // y4 color
];

// Perturbaciones d1=humedad grano verde, d2=temperatura ambiente
const PARAMS_DIST = {
  d1: { y1: { K: -0.5, tau: 12 }, y2: { K: 0.15, tau: 20 } },
  d2: { y1: { K:  0.8, tau:  6 }, y3: { K: 0.5,  tau:  4 } },
};

export class ModeloCafe {
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
      d2_y3: new DisturbanceFOPDT(PARAMS_DIST.d2.y3.K, PARAMS_DIST.d2.y3.tau, dt),
    };

    this.cvs = { ...SP_CVS };
    this.perturbaciones = { ...DIST_NOM };

    // Variables calculadas
    this.calculadas = {
      tasaCalentamiento: 0.0,
      consumoEnergia: 800.0,
      gradoTostado: 'MEDIO',
      factorDesarrollo: 0.0,
    };

    this._y1Prev = SP_CVS.y1;
    this._tiempoDesarrollo = 0; // segundos en temp >= 190°C
  }

  reiniciarEstacionario() {
    this.elementos.forEach(fila => fila.forEach(el => el.reset(0)));
    Object.values(this.elemDisturbancia).forEach(el => el.reset(0));
    this._y1Prev = SP_CVS.y1;
    this._tiempoDesarrollo = 0;
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
    cvDes[1] += this.elemDisturbancia.d1_y2.step(dDes1);
    cvDes[2] += this.elemDisturbancia.d2_y3.step(dDes2);

    // Ruido de proceso realista
    const ruido = [
      (Math.random() - 0.5) * 0.4,   // temp tambor ±0.2°C
      (Math.random() - 0.5) * 0.04,  // humedad ±0.02%
      (Math.random() - 0.5) * 0.3,   // temp gases ±0.15°C
      (Math.random() - 0.5) * 0.2,   // color ±0.1 Agtron
    ];

    this.cvs = {
      y1: Math.max(0, SP_CVS.y1 + cvDes[0] + ruido[0]),
      y2: Math.max(0, Math.min(15, SP_CVS.y2 + cvDes[1] + ruido[1])),
      y3: Math.max(0, SP_CVS.y3 + cvDes[2] + ruido[2]),
      y4: Math.max(0, Math.min(100, SP_CVS.y4 + cvDes[3] + ruido[3])),
    };

    // ── Variables calculadas ──────────────────────────────────────────────
    // Tasa de calentamiento (°C/min) — derivada filtrada de y1
    const dy1 = (this.cvs.y1 - this._y1Prev) / this.dt; // °C/s
    const tasaCalentamiento = dy1 * 60; // °C/min
    this._y1Prev = this.cvs.y1;

    // Tiempo de desarrollo (tiempo a temperatura >= 190°C)
    if (this.cvs.y1 >= 190) {
      this._tiempoDesarrollo += this.dt;
    }
    const factorDesarrollo = Math.min(100, (this._tiempoDesarrollo / 600) * 100); // 600s=10min máx

    // Consumo energético (kcal/kg) — estimado del quemador
    const potenciaQuemador = (mvs.u1 / 100) * 1500; // kcal/h
    const consumoEnergia = potenciaQuemador * (this._tiempoDesarrollo / 3600 + 0.1);

    // Grado de tostado según índice Agtron
    const agtron = this.cvs.y4;
    let gradoTostado;
    if (agtron > 80)       gradoTostado = 'VERDE';
    else if (agtron > 65)  gradoTostado = 'LIGERO';
    else if (agtron > 45)  gradoTostado = 'MEDIO';
    else if (agtron > 30)  gradoTostado = 'OSCURO';
    else                   gradoTostado = 'QUEMADO';

    this.calculadas = {
      tasaCalentamiento: Math.max(-50, Math.min(50, tasaCalentamiento)),
      consumoEnergia: Math.max(0, Math.min(2000, consumoEnergia)),
      gradoTostado,
      factorDesarrollo,
    };

    return { cvs: { ...this.cvs }, calculadas: { ...this.calculadas } };
  }
}

/**
 * Cálculo de Matriz de Ganancias Relativas (RGA) — Método de Bristol
 */
export function calcularRGACafe() {
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
