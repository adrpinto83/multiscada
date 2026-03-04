/**
 * Global Zustand Store — RO SCADA Plant State
 * Contains all PVs, MVs, setpoints, PID params, alarms, trends
 */

import { create } from 'zustand';

// Alarm definitions
const ALARM_DEFS = [
  { id: 'a1', tag: 'FT-201-LL', cv: 'y1', condition: v => v < 8,   priority: 'HIGH',     description: 'LOW PERMEATE FLOW', color: '#ff4444' },
  { id: 'a2', tag: 'AT-201-HH', cv: 'y2', condition: v => v > 800, priority: 'CRITICAL', description: 'HIGH CONDUCTIVITY - PRODUCT OFF SPEC', color: '#ff2222' },
  { id: 'a3', tag: 'AT-201-H',  cv: 'y2', condition: v => v > 600, priority: 'HIGH',     description: 'CONDUCTIVITY WARNING', color: '#ffaa00' },
  { id: 'a4', tag: 'LT-401-LL', cv: 'y3', condition: v => v < 20,  priority: 'HIGH',     description: 'LOW PRODUCT TANK LEVEL', color: '#ff4444' },
  { id: 'a5', tag: 'LT-401-HH', cv: 'y3', condition: v => v > 85,  priority: 'MEDIUM',   description: 'HIGH PRODUCT TANK LEVEL', color: '#ffaa00' },
  { id: 'a6', tag: 'pHT-401-L', cv: 'y4', condition: v => v < 6.5, priority: 'HIGH',     description: 'LOW pH - CORROSION RISK', color: '#ff4444' },
  { id: 'a7', tag: 'pHT-401-H', cv: 'y4', condition: v => v > 8.5, priority: 'MEDIUM',   description: 'HIGH pH', color: '#ffaa00' },
];

const MAX_TREND_POINTS = 240; // 120 seconds at 2Hz

const initialPids = [
  { id: 0, tag: 'FIC-201', label: 'Flow Control',        cv: 'y1', mv: 'u1', unit: 'm³/h',  Kp: 2.5, Ki: 0.08, Kd: 0.5,  sp: 12.0,  pv: 12.0,  mvVal: 65, mode: 'auto', spMin: 0,  spMax: 25  },
  { id: 1, tag: 'AIC-202', label: 'Conductivity Control', cv: 'y2', mv: 'u2', unit: 'μS/cm', Kp: 1.8, Ki: 0.05, Kd: 0.8,  sp: 450.0, pv: 450.0, mvVal: 40, mode: 'auto', spMin: 0,  spMax: 1000 },
  { id: 2, tag: 'LIC-401', label: 'Level Control',        cv: 'y3', mv: 'u3', unit: '%',     Kp: 3.0, Ki: 0.12, Kd: 0.3,  sp: 60.0,  pv: 60.0,  mvVal: 55, mode: 'auto', spMin: 0,  spMax: 100 },
  { id: 3, tag: 'pHIC-401',label: 'pH Control',           cv: 'y4', mv: 'u4', unit: 'pH',    Kp: 4.2, Ki: 0.15, Kd: 1.0,  sp: 7.4,   pv: 7.4,   mvVal: 30, mode: 'auto', spMin: 0,  spMax: 14  },
];

export const usePlantStore = create((set, get) => ({
  // ── Simulation state ──────────────────────────────────────────────
  simTime: 0,
  running: true,

  // ── Process Variables ─────────────────────────────────────────────
  cvs: { y1: 12.0, y2: 450.0, y3: 60.0, y4: 7.4 },
  mvs: { u1: 65, u2: 40, u3: 55, u4: 30 },

  // ── PID Controllers ───────────────────────────────────────────────
  pids: initialPids,

  // ── Cascade ───────────────────────────────────────────────────────
  cascadeEnabled: false,

  // ── Disturbances ──────────────────────────────────────────────────
  disturbances: { d1: 35, d2: 22 },
  pendingDisturbances: { d1: 35, d2: 22 },

  // ── Trend Data ────────────────────────────────────────────────────
  trendData: [], // array of { t, y1, y2, y3, y4, u1, u2, u3, u4, sp1, sp2, sp3, sp4 }

  // ── Alarms ────────────────────────────────────────────────────────
  alarms: [],         // active alarms list
  alarmHistory: [],   // all alarm events ever

  // ── UI State ──────────────────────────────────────────────────────
  activeFaceplate: null,   // PID id or null
  sidebarOpen: true,
  disturbancePanelOpen: false,

  // ── Actions ───────────────────────────────────────────────────────

  /**
   * Called by scheduler each tick with fresh simulation data
   */
  onSimUpdate: (snapshot) => {
    const { cvs, mvs, pids, simTime, disturbances } = snapshot;
    const state = get();

    // Evaluate alarms
    const currentAlarms = [...state.alarms];
    const newHistory = [...state.alarmHistory];
    const now = new Date();

    ALARM_DEFS.forEach(def => {
      const value = cvs[def.cv];
      const isActive = def.condition(value);
      const existingIndex = currentAlarms.findIndex(a => a.id === def.id);
      const existing = existingIndex >= 0 ? currentAlarms[existingIndex] : null;

      if (isActive && !existing) {
        const alarmEvent = {
          id: def.id,
          tag: def.tag,
          description: def.description,
          priority: def.priority,
          color: def.color,
          state: 'ACTIVE',
          timestamp: now.toISOString(),
          value: value,
        };
        currentAlarms.push(alarmEvent);
        newHistory.unshift({ ...alarmEvent, event: 'RAISED' });
      } else if (!isActive && existing && existing.state !== 'CLEARED') {
        // Clear the alarm
        const updated = { ...existing, state: 'CLEARED', clearedAt: now.toISOString() };
        currentAlarms.splice(existingIndex, 1);
        newHistory.unshift({ ...updated, event: 'CLEARED' });
      }
    });

    // Update PID snapshots
    const updatedPids = state.pids.map((pidConfig, i) => {
      const snap = pids[i];
      return {
        ...pidConfig,
        pv: snap.pv,
        mvVal: snap.mv,
        mode: snap.mode,
        Kp: snap.Kp,
        Ki: snap.Ki,
        Kd: snap.Kd,
        sp: snap.sp,
      };
    });

    // Append trend data
    const newPoint = {
      t: Math.round(simTime),
      y1: cvs.y1, y2: cvs.y2, y3: cvs.y3, y4: cvs.y4,
      u1: mvs.u1, u2: mvs.u2, u3: mvs.u3, u4: mvs.u4,
      sp1: updatedPids[0].sp, sp2: updatedPids[1].sp,
      sp3: updatedPids[2].sp, sp4: updatedPids[3].sp,
    };

    const newTrend = [...state.trendData, newPoint];
    if (newTrend.length > MAX_TREND_POINTS) {
      newTrend.splice(0, newTrend.length - MAX_TREND_POINTS);
    }

    set({
      simTime,
      cvs,
      mvs,
      pids: updatedPids,
      disturbances,
      trendData: newTrend,
      alarms: currentAlarms,
      alarmHistory: newHistory.slice(0, 200),
    });
  },

  setPidMode: (pidIndex, mode) => {
    set(state => ({
      pids: state.pids.map((p, i) =>
        i === pidIndex ? { ...p, mode } : p
      ),
    }));
  },

  setPidSP: (pidIndex, value) => {
    set(state => ({
      pids: state.pids.map((p, i) =>
        i === pidIndex ? { ...p, sp: value } : p
      ),
    }));
  },

  setPidManualOutput: (pidIndex, value) => {
    set(state => ({
      pids: state.pids.map((p, i) =>
        i === pidIndex ? { ...p, mvVal: value } : p
      ),
    }));
  },

  tunePid: (pidIndex, params) => {
    set(state => ({
      pids: state.pids.map((p, i) =>
        i === pidIndex ? { ...p, ...params } : p
      ),
    }));
  },

  setCascade: (enabled) => set({ cascadeEnabled: enabled }),

  setPendingDisturbance: (d1, d2) => {
    set({ pendingDisturbances: { d1, d2 } });
  },

  applyDisturbance: () => {
    const { pendingDisturbances } = get();
    set({ disturbances: { ...pendingDisturbances } });
  },

  acknowledgeAlarm: (alarmId) => {
    set(state => ({
      alarms: state.alarms.map(a =>
        a.id === alarmId ? { ...a, state: 'ACK' } : a
      ),
    }));
  },

  acknowledgeAllAlarms: () => {
    set(state => ({
      alarms: state.alarms.map(a => ({ ...a, state: 'ACK' })),
    }));
  },

  setActiveFaceplate: (id) => set({ activeFaceplate: id }),
  closeFaceplate: () => set({ activeFaceplate: null }),
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  toggleDisturbancePanel: () => set(state => ({ disturbancePanelOpen: !state.disturbancePanelOpen })),
}));

export { ALARM_DEFS };
