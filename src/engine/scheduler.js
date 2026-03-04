/**
 * Real-time Simulation Scheduler
 * Runs at 500ms intervals (2 Hz)
 * Orchestrates: ProcessModel → PID Controllers → Store updates → Alarm evaluation
 */

import { ProcessModel, MV_OPERATING, DISTURBANCE_DEFAULTS } from './processModel.js';
import { PidController } from './pidController.js';

const DT = 0.5; // seconds

// Default PID tuning parameters
const PID_DEFAULTS = [
  { id: 0, tag: 'FIC-201', Kp: 2.5,  Ki: 0.08, Kd: 0.5,  sp: 12.0,  mvInit: MV_OPERATING.u1 },
  { id: 1, tag: 'AIC-202', Kp: 1.8,  Ki: 0.05, Kd: 0.8,  sp: 450.0, mvInit: MV_OPERATING.u2 },
  { id: 2, tag: 'LIC-401', Kp: 3.0,  Ki: 0.12, Kd: 0.3,  sp: 60.0,  mvInit: MV_OPERATING.u3 },
  { id: 3, tag: 'pHIC-401',Kp: 4.2,  Ki: 0.15, Kd: 1.0,  sp: 7.4,   mvInit: MV_OPERATING.u4 },
];

export class Scheduler {
  constructor(onUpdate) {
    this.onUpdate = onUpdate; // callback(state) called each step
    this.model = new ProcessModel(DT);
    this.interval = null;
    this.running = false;
    this.cascadeEnabled = false;

    // Initialize PID controllers
    this.pids = PID_DEFAULTS.map(p => {
      const pid = new PidController({
        id: p.id,
        tag: p.tag,
        Kp: p.Kp,
        Ki: p.Ki,
        Kd: p.Kd,
        sp: p.sp,
        uMin: 0,
        uMax: 100,
        dt: DT,
      });
      pid.mv = p.mvInit;
      pid.integral = p.mvInit / (p.Ki || 0.01); // pre-load integral
      return pid;
    });

    // Disturbances current values
    this.disturbances = { ...DISTURBANCE_DEFAULTS };

    // Current CVs
    this.cvs = {
      y1: 12.0,
      y2: 450.0,
      y3: 60.0,
      y4: 7.4,
    };

    // Simulation time (seconds)
    this.simTime = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.interval = setInterval(() => this._tick(), DT * 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.running = false;
  }

  _tick() {
    this.simTime += DT;

    // Get current MVs from PID controllers
    const mvs = {
      u1: this.pids[0].mv,
      u2: this.pids[1].mv,
      u3: this.pids[2].mv,
      u4: this.pids[3].mv,
    };

    // Step process model
    const newCvs = this.model.step(mvs, this.disturbances);
    this.cvs = newCvs;

    // Cascade: LIC-401 (pid[2]) output → FIC-201 (pid[0]) setpoint
    if (this.cascadeEnabled) {
      // LIC-401 output (0-100) maps to FIC-201 SP range (6-18 m³/h)
      const cascadeSp = 6 + (this.pids[2].mv / 100) * 12;
      this.pids[0].isCascadeSlave = true;
      this.pids[0].cascadeSp = cascadeSp;
    } else {
      this.pids[0].isCascadeSlave = false;
      this.pids[0].cascadeSp = null;
    }

    // Update PIDs with current CVs
    const cvArray = [newCvs.y1, newCvs.y2, newCvs.y3, newCvs.y4];
    const newMvs = {};
    this.pids.forEach((pid, i) => {
      const mv = pid.update(cvArray[i]);
      newMvs[`u${i + 1}`] = mv;
    });

    // Build state snapshot for store
    const snapshot = {
      simTime: this.simTime,
      cvs: { ...newCvs },
      mvs: { ...newMvs },
      pids: this.pids.map(p => p.getSnapshot()),
      disturbances: { ...this.disturbances },
    };

    this.onUpdate(snapshot);
  }

  /**
   * Apply disturbance change
   */
  setDisturbance(d1, d2) {
    this.disturbances.d1 = d1;
    this.disturbances.d2 = d2;
  }

  /**
   * Set PID mode
   */
  setPidMode(pidIndex, mode) {
    if (mode === 'auto') {
      this.pids[pidIndex].setAuto();
    } else {
      this.pids[pidIndex].setManual();
    }
  }

  /**
   * Set PID manual output
   */
  setPidManualOutput(pidIndex, value) {
    this.pids[pidIndex].setManualOutput(value);
  }

  /**
   * Set PID setpoint
   */
  setPidSP(pidIndex, value) {
    this.pids[pidIndex].setSP(value);
  }

  /**
   * Tune PID
   */
  tunePid(pidIndex, params) {
    this.pids[pidIndex].tune(params);
  }

  /**
   * Toggle cascade control
   */
  setCascade(enabled) {
    this.cascadeEnabled = enabled;
    if (!enabled) {
      this.pids[0].isCascadeSlave = false;
      this.pids[0].cascadeSp = null;
    }
  }
}
