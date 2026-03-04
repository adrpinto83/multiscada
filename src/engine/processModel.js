/**
 * 4x4 MIMO Process Model for Two-Pass RO Desalination Plant
 *
 * CVs (controlled variables):
 *   y1: Permeate flow (m³/h)     SP=12.0
 *   y2: Product conductivity (μS/cm)  SP=450
 *   y3: Product tank level (%)   SP=60
 *   y4: Product pH               SP=7.4
 *
 * MVs (manipulated variables):
 *   u1: HP Pump speed (0-100%)
 *   u2: Concentrate valve (0-100%)
 *   u3: Booster Pump Pass 2 (0-100%)
 *   u4: NaOH dosing flow (0-100%)
 *
 * Operating point (steady state):
 *   u1=65, u2=40, u3=55, u4=30 → y1=12, y2=450, y3=60, y4=7.4
 */

import { FOPDTElement, DisturbanceFOPDT } from './fopdt.js';

// Engineering unit conversions from normalized deviation to engineering units
export const CV_SETPOINTS = { y1: 12.0, y2: 450, y3: 60, y4: 7.4 };
export const MV_OPERATING = { u1: 65, u2: 40, u3: 55, u4: 30 };

// G matrix: G[i][j] = FOPDT(K, tau, theta) for CV[i] from MV[j]
// G[cv][mv] = { K, tau, theta }
const G_PARAMS = [
  // u1            u2             u3             u4
  [{ K: 3.2,  tau: 5,  theta: 1 }, { K: -1.8, tau: 8,  theta: 3 }, { K: 0.9,  tau: 6,  theta: 2 }, { K: 0.1,  tau: 4,  theta: 1 }], // y1
  [{ K: -4.5, tau: 12, theta: 2 }, { K: 5.1,  tau: 20, theta: 4 }, { K: -2.3, tau: 15, theta: 3 }, { K: 0.2,  tau: 5,  theta: 1 }], // y2
  [{ K: 2.1,  tau: 3,  theta: 1 }, { K: -0.9, tau: 6,  theta: 2 }, { K: 0.7,  tau: 4,  theta: 2 }, { K: 0,    tau: 1,  theta: 0 }], // y3
  [{ K: 0.3,  tau: 8,  theta: 2 }, { K: 0.1,  tau: 10, theta: 3 }, { K: 0.4,  tau: 7,  theta: 2 }, { K: 6.8,  tau: 3,  theta: 1 }], // y4
];

// CV scaling: how much a unit change in normalized CV output maps to engineering units
// These are approximate gains to keep deviations in engineering unit scale
const CV_SCALE = {
  y1: 1.0,   // m³/h per normalized unit
  y2: 1.0,   // μS/cm per normalized unit
  y3: 1.0,   // % per normalized unit
  y4: 1.0,   // pH per normalized unit
};

// Disturbance models
// d1 (salinity): affects y2 (K=0.8, τ=15) and y1 (K=-0.3, τ=10)
// d2 (temp):     affects y1 (K=0.5, τ=8) and y2 (K=-1.2, τ=12)
const DIST_PARAMS = {
  d1: {
    y1: { K: -0.3, tau: 10 },
    y2: { K: 0.8,  tau: 15 },
  },
  d2: {
    y1: { K: 0.5,  tau: 8  },
    y2: { K: -1.2, tau: 12 },
  },
};

export const DISTURBANCE_DEFAULTS = { d1: 35, d2: 22 };
export const DISTURBANCE_NOMINAL = { d1: 35, d2: 22 };

export class ProcessModel {
  constructor(dt = 0.5) {
    this.dt = dt;

    // Create 4x4 FOPDT element grid
    this.elements = G_PARAMS.map((row, i) =>
      row.map((p, j) => {
        const el = new FOPDTElement(p.K, p.tau, p.theta, dt);
        return el;
      })
    );

    // Disturbance FOPDT elements
    this.distElements = {
      d1_y1: new DisturbanceFOPDT(DIST_PARAMS.d1.y1.K, DIST_PARAMS.d1.y1.tau, dt),
      d1_y2: new DisturbanceFOPDT(DIST_PARAMS.d1.y2.K, DIST_PARAMS.d1.y2.tau, dt),
      d2_y1: new DisturbanceFOPDT(DIST_PARAMS.d2.y1.K, DIST_PARAMS.d2.y1.tau, dt),
      d2_y2: new DisturbanceFOPDT(DIST_PARAMS.d2.y2.K, DIST_PARAMS.d2.y2.tau, dt),
    };

    // Initialize at operating point (all deviations = 0)
    this.initSteadyState();

    // Current CV values in engineering units
    this.cvs = { ...CV_SETPOINTS };

    // Disturbance state
    this.disturbances = { ...DISTURBANCE_DEFAULTS };
  }

  initSteadyState() {
    // At operating point, deviations are 0, so initialize all elements at 0
    this.elements.forEach(row => row.forEach(el => el.reset(0)));
    Object.values(this.distElements).forEach(el => el.reset(0));
  }

  /**
   * Step the process model
   * @param {Object} mvs - { u1, u2, u3, u4 } in engineering units (0-100%)
   * @param {Object} disturbances - { d1, d2 } in engineering units
   * @returns {Object} - { y1, y2, y3, y4 } in engineering units
   */
  step(mvs, disturbances) {
    // Compute MV deviations from operating point
    const uDev = [
      mvs.u1 - MV_OPERATING.u1,
      mvs.u2 - MV_OPERATING.u2,
      mvs.u3 - MV_OPERATING.u3,
      mvs.u4 - MV_OPERATING.u4,
    ];

    // Compute disturbance deviations from nominal
    const d1Dev = (disturbances.d1 - DISTURBANCE_NOMINAL.d1);
    const d2Dev = (disturbances.d2 - DISTURBANCE_NOMINAL.d2);

    // Step all FOPDT elements and sum contributions per CV
    const cvDevs = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        cvDevs[i] += this.elements[i][j].step(uDev[j]);
      }
    }

    // Add disturbance contributions
    const d1y1 = this.distElements.d1_y1.step(d1Dev);
    const d1y2 = this.distElements.d1_y2.step(d1Dev);
    const d2y1 = this.distElements.d2_y1.step(d2Dev);
    const d2y2 = this.distElements.d2_y2.step(d2Dev);

    cvDevs[0] += d1y1 + d2y1;
    cvDevs[1] += d1y2 + d2y2;

    // Add small process noise for realism
    const noise = [
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.002,
    ];

    // Convert deviations to engineering units (add setpoints)
    this.cvs = {
      y1: Math.max(0, CV_SETPOINTS.y1 + cvDevs[0] + noise[0]),
      y2: Math.max(0, CV_SETPOINTS.y2 + cvDevs[1] + noise[1]),
      y3: Math.max(0, Math.min(100, CV_SETPOINTS.y3 + cvDevs[2] + noise[2])),
      y4: Math.max(0, CV_SETPOINTS.y4 + cvDevs[3] + noise[3]),
    };

    return { ...this.cvs };
  }
}

/**
 * Relative Gain Array (RGA) for the 4x4 process
 * Based on steady-state gains at nominal operating point
 * Bristol method: RGA = G .* (G^-1)^T (element-wise multiply)
 */
export function computeRGA() {
  // Steady-state gain matrix (K values only)
  const G = G_PARAMS.map(row => row.map(p => p.K));

  // Compute G^-1 using simple 4x4 matrix inversion (numerical)
  try {
    const Ginv = invertMatrix(G);
    const rga = G.map((row, i) =>
      row.map((gij, j) => gij * Ginv[j][i])
    );
    return rga;
  } catch {
    return null;
  }
}

function invertMatrix(m) {
  const n = m.length;
  const a = m.map(row => [...row]);
  const inv = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[maxRow][col])) maxRow = row;
    }
    [a[col], a[maxRow]] = [a[maxRow], a[col]];
    [inv[col], inv[maxRow]] = [inv[maxRow], inv[col]];

    const pivot = a[col][col];
    if (Math.abs(pivot) < 1e-10) throw new Error('Singular matrix');

    for (let j = 0; j < n; j++) {
      a[col][j] /= pivot;
      inv[col][j] /= pivot;
    }
    for (let row = 0; row < n; row++) {
      if (row !== col) {
        const factor = a[row][col];
        for (let j = 0; j < n; j++) {
          a[row][j] -= factor * a[col][j];
          inv[row][j] -= factor * inv[col][j];
        }
      }
    }
  }
  return inv;
}
