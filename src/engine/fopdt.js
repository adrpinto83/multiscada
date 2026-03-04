/**
 * FOPDT (First Order Plus Dead Time) Process Element
 * Transfer function: G(s) = K * exp(-theta*s) / (tau*s + 1)
 * Euler integration with dt=0.5s, dead time via circular buffer
 */

export class FOPDTElement {
  constructor(K, tau, theta, dt = 0.5) {
    this.K = K;
    this.tau = tau;
    this.theta = theta;
    this.dt = dt;

    // Dead time buffer: stores past inputs
    this.deadSteps = Math.max(1, Math.round(theta / dt));
    this.buffer = new Array(this.deadSteps).fill(0);
    this.bufferIndex = 0;

    // State variable (first-order filter output)
    this.x = 0; // internal state
    this.y = 0; // output
  }

  /**
   * Initialize at steady state given input u0
   */
  initSteadyState(u0) {
    const u0Dev = u0; // deviation from operating point
    const steadyOutput = this.K * u0Dev;
    this.x = steadyOutput;
    this.y = steadyOutput;
    this.buffer.fill(u0Dev);
  }

  /**
   * Step the element with input u (deviation variable)
   * Returns output y (deviation variable)
   */
  step(u) {
    // Write current input to dead time buffer
    this.buffer[this.bufferIndex] = u;

    // Read delayed input (theta steps ago)
    const delayedIndex = (this.bufferIndex + 1) % this.deadSteps;
    const uDelayed = this.buffer[delayedIndex];

    // Advance buffer pointer
    this.bufferIndex = (this.bufferIndex + 1) % this.deadSteps;

    // Euler integration: tau * dx/dt = K*uDelayed - x
    // dx/dt = (K*uDelayed - x) / tau
    if (this.tau > 0) {
      const dxdt = (this.K * uDelayed - this.x) / this.tau;
      this.x += dxdt * this.dt;
    } else {
      this.x = this.K * uDelayed;
    }

    this.y = this.x;
    return this.y;
  }

  reset(value = 0) {
    this.x = value;
    this.y = value;
    this.buffer.fill(0);
    this.bufferIndex = 0;
  }
}

/**
 * FOPDT element for disturbance channels
 */
export class DisturbanceFOPDT extends FOPDTElement {
  constructor(K, tau, dt = 0.5) {
    super(K, tau, 0, dt); // no dead time for disturbances
    this.deadSteps = 1;
    this.buffer = [0];
  }
}
