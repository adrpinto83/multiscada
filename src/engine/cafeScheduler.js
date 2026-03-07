/**
 * Planificador de Simulación en Tiempo Real — Planta Tostado Café
 * Frecuencia: 500ms (2 Hz)
 * Orquesta: ModeloCafe → Controladores PID → Actualización Store
 *
 * Emparejamiento PID→CV→MV:
 *   pids[0] TIC-001: y1 (temp tambor) → u1 (quemador)
 *   pids[1] TIC-002: y3 (temp gases)  → u3 (aire entrada)
 *   pids[2] MIC-001: y2 (humedad)     → u2 (tambor)
 *   pids[3] CIC-001: y4 (color)       → u4 (enfriamiento)
 */

import { ModeloCafe, OP_MVS, DIST_NOM } from './cafeProcessModel.js';
import { PidController } from './pidController.js';

const DT = 0.5;

const PIDS_DEFECTO = [
  { id: 0, tag: 'TIC-001', Kp: 1.5, Ki: 0.06, Kd: 0.3, sp: 220.0, mvInicial: OP_MVS.u1 },
  { id: 1, tag: 'TIC-002', Kp: 2.0, Ki: 0.08, Kd: 0.4, sp: 170.0, mvInicial: OP_MVS.u3 },
  { id: 2, tag: 'MIC-001', Kp: 8.0, Ki: 0.10, Kd: 1.0, sp: 3.5,   mvInicial: OP_MVS.u2 },
  { id: 3, tag: 'CIC-001', Kp: 5.0, Ki: 0.03, Kd: 2.0, sp: 55.0,  mvInicial: OP_MVS.u4 },
];

export class PlanificadorCafe {
  constructor(alActualizar) {
    this.alActualizar = alActualizar;
    this.modelo = new ModeloCafe(DT);
    this.intervalo = null;
    this.corriendo = false;
    this.emulacion = {};
    this.tiempoSim = 0;

    // Inicializar PIDs
    this.pids = PIDS_DEFECTO.map(p => {
      const pid = new PidController({
        id: p.id, tag: p.tag,
        Kp: p.Kp, Ki: p.Ki, Kd: p.Kd,
        sp: p.sp, uMin: 0, uMax: 100, dt: DT,
      });
      pid.mv = p.mvInicial;
      pid.integral = p.Ki !== 0 ? p.mvInicial / p.Ki : 0;
      return pid;
    });

    this.perturbaciones = { ...DIST_NOM };
    this.cvs = { y1: 220.0, y2: 3.5, y3: 170.0, y4: 55.0 };
  }

  iniciar() {
    if (this.corriendo) return;
    this.corriendo = true;
    this.intervalo = setInterval(() => this._tick(), DT * 1000);
  }

  detener() {
    if (this.intervalo) { clearInterval(this.intervalo); this.intervalo = null; }
    this.corriendo = false;
  }

  _tick() {
    this.tiempoSim += DT;

    // MVs actuales (con emulación)
    // pids[0]→u1, pids[1]→u3, pids[2]→u2, pids[3]→u4
    const mvs = {
      u1: this.emulacion.u1?.activa ? this.emulacion.u1.valor : this.pids[0].mv,
      u2: this.emulacion.u2?.activa ? this.emulacion.u2.valor : this.pids[2].mv,
      u3: this.emulacion.u3?.activa ? this.emulacion.u3.valor : this.pids[1].mv,
      u4: this.emulacion.u4?.activa ? this.emulacion.u4.valor : this.pids[3].mv,
    };

    // Paso del modelo de proceso
    const { cvs: cvsSim, calculadas } = this.modelo.paso(mvs, this.perturbaciones);

    // Aplicar emulación de CVs (override total para el PID)
    const cvsParaPID = {
      y1: this.emulacion.y1?.activa ? this.emulacion.y1.valor : cvsSim.y1,
      y2: this.emulacion.y2?.activa ? this.emulacion.y2.valor : cvsSim.y2,
      y3: this.emulacion.y3?.activa ? this.emulacion.y3.valor : cvsSim.y3,
      y4: this.emulacion.y4?.activa ? this.emulacion.y4.valor : cvsSim.y4,
    };
    this.cvs = cvsParaPID;

    // Actualizar PIDs con sus CVs correspondientes
    // pids[0] (TIC-001) ← y1, pids[1] (TIC-002) ← y3, pids[2] (MIC-001) ← y2, pids[3] (CIC-001) ← y4
    this.pids[0].update(cvsParaPID.y1);
    this.pids[1].update(cvsParaPID.y3);
    this.pids[2].update(cvsParaPID.y2);
    this.pids[3].update(cvsParaPID.y4);

    // Snapshot para el store
    this.alActualizar({
      tiempoSim: this.tiempoSim,
      cvs: cvsParaPID,
      mvs,
      pids: this.pids.map(p => p.getSnapshot()),
      perturbaciones: { ...this.perturbaciones },
      calculadas,
    });
  }

  // ── Métodos de control externo ─────────────────────────────────────────────
  setPerturbacion(d1, d2) { this.perturbaciones = { d1, d2 }; }
  setPidModo(idx, modo) {
    modo === 'auto' ? this.pids[idx].setAuto() : this.pids[idx].setManual();
  }
  setPidSalidaManual(idx, valor) { this.pids[idx].setManualOutput(valor); }
  setPidSP(idx, valor) { this.pids[idx].setSP(valor); }
  ajustarPid(idx, params) { this.pids[idx].tune(params); }
  setEmulacion(snapEmulacion) { this.emulacion = snapEmulacion || {}; }
}
