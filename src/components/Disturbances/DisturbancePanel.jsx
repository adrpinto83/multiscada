import { useState } from 'react';
import { usePlantStore } from '../../store/plantStore';
import { computeRGA } from '../../engine/processModel';

// Compute RGA once (static)
const rgaMatrix = computeRGA();

function RGADisplay() {
  if (!rgaMatrix) return <div className="text-xs text-gray-500">RGA unavailable</div>;

  const cvLabels = ['y1 Flow', 'y2 Cond', 'y3 Level', 'y4 pH'];
  const mvLabels = ['u1 HP', 'u2 VCV', 'u3 Boost', 'u4 NaOH'];

  return (
    <div className="overflow-x-auto">
      <div className="text-xs font-label text-gray-400 mb-1 font-bold">RGA Matrix (Bristol Method)</div>
      <table className="text-xs font-mono border-collapse">
        <thead>
          <tr>
            <th className="px-1 py-0.5 text-gray-600 text-right text-[10px]"></th>
            {mvLabels.map(l => (
              <th key={l} className="px-2 py-0.5 text-gray-500 text-center text-[9px]">{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rgaMatrix.map((row, i) => (
            <tr key={i}>
              <td className="px-1 py-0.5 text-gray-500 text-right text-[9px]">{cvLabels[i]}</td>
              {row.map((val, j) => {
                const isDiag = i === j;
                const isGood = Math.abs(val - 1) < 0.3;
                const color = isDiag && isGood ? '#00d4ff' : isDiag ? '#fbbf24' : '#4b5563';
                return (
                  <td
                    key={j}
                    className="px-2 py-0.5 text-center text-[10px]"
                    style={{ color, fontWeight: isDiag ? 'bold' : 'normal' }}
                  >
                    {val.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-[9px] text-gray-600 mt-1">Diagonal ≈ 1.0 → favorable pairing (cyan). Far from 1.0 → interaction risk (yellow).</div>
    </div>
  );
}

export default function DisturbancePanel() {
  const disturbances = usePlantStore(s => s.disturbances);
  const pendingDisturbances = usePlantStore(s => s.pendingDisturbances);
  const setPendingDisturbance = usePlantStore(s => s.setPendingDisturbance);
  const applyDisturbance = usePlantStore(s => s.applyDisturbance);
  const disturbancePanelOpen = usePlantStore(s => s.disturbancePanelOpen);
  const toggleDisturbancePanel = usePlantStore(s => s.toggleDisturbancePanel);

  const [showRGA, setShowRGA] = useState(false);

  const handleApply = () => {
    applyDisturbance();
  };

  return (
    <div className="bg-navy-800 border-t border-cyan-scada/20 shrink-0">
      {/* Collapse header */}
      <button
        onClick={toggleDisturbancePanel}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-cyan-scada">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
          </svg>
          <span className="font-label text-sm font-bold text-white">Disturbances &amp; RGA</span>
          {/* Active disturbance indicator */}
          {(disturbances.d1 !== 35 || disturbances.d2 !== 22) && (
            <span className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-label px-2 py-0.5 rounded">
              ACTIVE
            </span>
          )}
        </div>
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 fill-gray-400 transition-transform ${disturbancePanelOpen ? 'rotate-180' : ''}`}
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {/* Panel content */}
      {disturbancePanelOpen && (
        <div className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Salinity slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-label text-sm text-gray-300">Feed Water Salinity</label>
                <span className="font-mono text-sm text-cyan-scada font-bold">{pendingDisturbances.d1.toFixed(1)} g/L</span>
              </div>
              <input
                type="range"
                min={30} max={45} step={0.1}
                value={pendingDisturbances.d1}
                onChange={e => setPendingDisturbance(Number(e.target.value), pendingDisturbances.d2)}
                className="w-full h-2 accent-cyan-scada cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                <span>30 g/L</span>
                <span className="text-gray-500">nominal: 35</span>
                <span>45 g/L</span>
              </div>
              <div className="text-xs text-gray-500 font-label">Active: <span className="text-yellow-400 font-mono">{disturbances.d1.toFixed(1)} g/L</span></div>
            </div>

            {/* Temperature slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-label text-sm text-gray-300">Feed Water Temperature</label>
                <span className="font-mono text-sm text-cyan-scada font-bold">{pendingDisturbances.d2.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min={15} max={35} step={0.5}
                value={pendingDisturbances.d2}
                onChange={e => setPendingDisturbance(pendingDisturbances.d1, Number(e.target.value))}
                className="w-full h-2 accent-cyan-scada cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                <span>15°C</span>
                <span className="text-gray-500">nominal: 22</span>
                <span>35°C</span>
              </div>
              <div className="text-xs text-gray-500 font-label">Active: <span className="text-yellow-400 font-mono">{disturbances.d2.toFixed(1)} °C</span></div>
            </div>

            {/* Apply + Reset */}
            <div className="flex flex-col justify-center gap-2">
              <button
                onClick={handleApply}
                className="py-2 px-4 bg-cyan-scada/20 border border-cyan-scada/50 text-cyan-scada font-label font-bold text-sm rounded-lg hover:bg-cyan-scada/30 transition-colors"
              >
                Apply Step Disturbance
              </button>
              <button
                onClick={() => {
                  setPendingDisturbance(35, 22);
                  setTimeout(() => applyDisturbance(), 0);
                }}
                className="py-2 px-4 bg-gray-700/50 border border-gray-600/50 text-gray-300 font-label text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset to Nominal
              </button>
              <button
                onClick={() => setShowRGA(!showRGA)}
                className="py-1 px-3 text-xs font-label text-gray-400 border border-gray-700 rounded-lg hover:text-gray-200 hover:border-gray-500 transition-colors"
              >
                {showRGA ? 'Hide' : 'Show'} RGA Matrix
              </button>
            </div>
          </div>

          {/* RGA Matrix */}
          {showRGA && (
            <div className="mt-4 p-3 bg-navy-900/50 rounded-lg border border-gray-700/50">
              <RGADisplay />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
