/**
 * ISA Standard PID Controller
 * Features:
 * - Anti-windup via conditional integration
 * - Bumpless transfer Auto <-> Manual
 * - Derivative on PV (not error) to avoid derivative kick
 * - Output clamping [uMin, uMax]
 */

export class PidController {
  constructor({ id, tag, Kp, Ki, Kd, sp, uMin = 0, uMax = 100, dt = 0.5 }) {
    this.id = id;
    this.tag = tag;
    this.Kp = Kp;
    this.Ki = Ki;
    this.Kd = Kd;
    this.sp = sp;
    this.uMin = uMin;
    this.uMax = uMax;
    this.dt = dt;

    // Runtime state
    this.pv = sp;         // process variable
    this.mv = 50;         // manipulated variable output
    this.mode = 'auto';   // 'auto' | 'manual'

    // Internal controller state
    this.integral = 0;
    this.prevPv = sp;     // previous PV for derivative
    this.prevError = 0;
    this.saturated = false;
    this.satDir = 0;      // +1 high, -1 low saturation

    // Cascade flag
    this.isCascadeSlave = false;
    this.cascadeSp = null; // external SP from master
  }

  /**
   * Update PV and compute new MV
   * Call once per dt
   */
  update(pv) {
    this.pv = pv;

    if (this.mode === 'manual') {
      this.prevPv = pv;
      return this.mv;
    }

    const sp = this.isCascadeSlave && this.cascadeSp !== null
      ? this.cascadeSp
      : this.sp;

    const error = sp - pv;

    // Proportional
    const pTerm = this.Kp * error;

    // Integral with anti-windup (conditional integration)
    const canIntegrate = !this.saturated ||
      (this.satDir > 0 && error < 0) ||
      (this.satDir < 0 && error > 0);

    if (canIntegrate) {
      this.integral += error * this.dt;
    }
    const iTerm = this.Ki * this.integral;

    // Derivative on PV (not error) to avoid derivative kick
    const dpv = pv - this.prevPv;
    const dTerm = -this.Kd * (dpv / this.dt);

    let output = pTerm + iTerm + dTerm;

    // Clamp output
    if (output >= this.uMax) {
      output = this.uMax;
      this.saturated = true;
      this.satDir = 1;
    } else if (output <= this.uMin) {
      output = this.uMin;
      this.saturated = true;
      this.satDir = -1;
    } else {
      this.saturated = false;
      this.satDir = 0;
    }

    this.mv = output;
    this.prevPv = pv;
    this.prevError = error;

    return this.mv;
  }

  /**
   * Switch to Auto mode — bumpless transfer
   * Initialize integral so that output tracks current MV
   */
  setAuto() {
    if (this.mode === 'manual') {
      const sp = this.sp;
      const error = sp - this.pv;
      const pTerm = this.Kp * error;
      // Solve: mv = pTerm + Ki*integral  =>  integral = (mv - pTerm) / Ki
      if (this.Ki !== 0) {
        this.integral = (this.mv - pTerm) / this.Ki;
      } else {
        this.integral = 0;
      }
      this.prevPv = this.pv;
      this.mode = 'auto';
    }
  }

  /**
   * Switch to Manual mode — track current MV
   */
  setManual() {
    this.mode = 'manual';
  }

  /**
   * Set manual output (when in manual mode)
   */
  setManualOutput(value) {
    if (this.mode === 'manual') {
      this.mv = Math.max(this.uMin, Math.min(this.uMax, value));
    }
  }

  /**
   * Set setpoint
   */
  setSP(value) {
    this.sp = value;
  }

  /**
   * Tune PID parameters
   */
  tune({ Kp, Ki, Kd }) {
    if (Kp !== undefined) this.Kp = Kp;
    if (Ki !== undefined) this.Ki = Ki;
    if (Kd !== undefined) this.Kd = Kd;
  }

  /**
   * Get controller status snapshot
   */
  getSnapshot() {
    return {
      id: this.id,
      tag: this.tag,
      pv: this.pv,
      sp: this.sp,
      mv: this.mv,
      mode: this.mode,
      Kp: this.Kp,
      Ki: this.Ki,
      Kd: this.Kd,
      error: this.sp - this.pv,
      integral: this.integral,
      saturated: this.saturated,
      isCascadeSlave: this.isCascadeSlave,
    };
  }
}
