import { useState } from 'react';
import { usePlantStore } from '../store/plantStore';

function ControllerCard({ pid, onOpenFaceplate }) {
  const setPidMode = usePlantStore(s => s.setPidMode);
  const setPidSP = usePlantStore(s => s.setPidSP);
  const setPidManualOutput = usePlantStore(s => s.setPidManualOutput);
  const tunePid = usePlantStore(s => s.tunePid);
  const cascadeEnabled = usePlantStore(s => s.cascadeEnabled);
  const setCascade = usePlantStore(s => s.setCascade);

  const [editingSP, setEditingSP] = useState(false);
  const [spInput, setSpInput] = useState('');
  const [localMv, setLocalMv] = useState(pid.mvVal);
  const [editingTune, setEditingTune] = useState(false);
  const [tuning, setTuning] = useState({ Kp: pid.Kp, Ki: pid.Ki, Kd: pid.Kd });

  const cvRanges = {
    y1: { min: 0, max: 20,   unit: 'm³/h',  ok: pid.pv >= 8 },
    y2: { min: 0, max: 1000, unit: 'μS/cm', ok: pid.pv <= 600 },
    y3: { min: 0, max: 100,  unit: '%',      ok: pid.pv >= 20 && pid.pv <= 85 },
    y4: { min: 0, max: 14,   unit: 'pH',     ok: pid.pv >= 6.5 && pid.pv <= 8.5 },
  };
  const cvKeys = ['y1', 'y2', 'y3', 'y4'];
  const cvKey = cvKeys[pid.id];
  const range = cvRanges[cvKey];

  const pvPct = Math.max(0, Math.min(100, ((pid.pv - range.min) / (range.max - range.min)) * 100));
  const spPct = Math.max(0, Math.min(100, ((pid.sp - range.min) / (range.max - range.min)) * 100));
  const error = pid.sp - pid.pv;
  const isAutoMode = pid.mode === 'auto';

  const handleMvSlider = (v) => {
    setLocalMv(v);
    if (!isAutoMode) setPidManualOutput(pid.id, v);
  };

  return (
    <div className={`bg-navy-700 border rounded-xl overflow-hidden ${
      range.ok ? 'border-gray-700/50' : 'border-red-500/50'
    }`}>
      {/* Card header */}
      <div className={`flex items-center justify-between px-4 py-3 ${
        isAutoMode ? 'bg-navy-800' : 'bg-orange-900/30'
      } border-b border-gray-700/50`}>
        <div>
          <div className="font-mono text-base text-cyan-scada font-bold">{pid.tag}</div>
          <div className="font-label text-xs text-gray-400">{pid.label}</div>
        </div>
        <div className="flex items-center gap-2">
          {pid.id === 0 && (
            <button
              onClick={() => setCascade(!cascadeEnabled)}
              className={`text-xs font-label px-2 py-0.5 rounded border transition-colors ${
                cascadeEnabled ? 'border-cyan-scada text-cyan-scada bg-cyan-scada/10' : 'border-gray-600 text-gray-500 hover:border-gray-400 hover:text-gray-300'
              }`}
            >
              CASCADE
            </button>
          )}
          <button
            onClick={() => setPidMode(pid.id, isAutoMode ? 'manual' : 'auto')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-label font-bold border transition-all ${
              isAutoMode
                ? 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
                : 'bg-orange-500/20 border-orange-500/50 text-orange-400 hover:bg-orange-500/30'
            }`}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${isAutoMode ? 'bg-green-400' : 'bg-orange-400'}`} />
            {isAutoMode ? 'AUTO' : 'MANUAL'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* PV/SP display */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-navy-800/60 rounded-lg p-2">
            <div className="font-label text-xs text-gray-500 mb-1">PV</div>
            <div className={`font-mono text-xl font-bold ${range.ok ? 'text-cyan-scada' : 'text-red-400'}`}>
              {pid.pv.toFixed(pid.pv < 10 ? 3 : 1)}
            </div>
            <div className="font-label text-xs text-gray-500">{range.unit}</div>
          </div>
          <div className="bg-navy-800/60 rounded-lg p-2">
            <div className="font-label text-xs text-gray-500 mb-1">SP</div>
            {editingSP ? (
              <input
                type="number"
                value={spInput}
                onChange={e => setSpInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const v = parseFloat(spInput);
                    if (!isNaN(v)) setPidSP(pid.id, v);
                    setEditingSP(false);
                  }
                }}
                onBlur={() => {
                  const v = parseFloat(spInput);
                  if (!isNaN(v)) setPidSP(pid.id, v);
                  setEditingSP(false);
                }}
                autoFocus
                className="w-full bg-navy-900 border border-yellow-400/50 text-yellow-400 font-mono text-lg px-1 py-0 rounded text-center outline-none"
              />
            ) : (
              <button
                onClick={() => { setSpInput(pid.sp.toString()); setEditingSP(true); }}
                disabled={!isAutoMode}
                className={`font-mono text-xl font-bold w-full ${isAutoMode ? 'text-yellow-400 hover:text-yellow-300 cursor-pointer' : 'text-gray-600 cursor-not-allowed'}`}
              >
                {pid.sp.toFixed(pid.sp < 10 ? 3 : 1)}
              </button>
            )}
            <div className="font-label text-xs text-gray-500">{range.unit}</div>
          </div>
          <div className="bg-navy-800/60 rounded-lg p-2">
            <div className="font-label text-xs text-gray-500 mb-1">ERROR</div>
            <div className={`font-mono text-xl font-bold ${Math.abs(error) < 0.5 ? 'text-green-400' : 'text-yellow-400'}`}>
              {error >= 0 ? '+' : ''}{error.toFixed(pid.sp < 10 ? 3 : 1)}
            </div>
            <div className="font-label text-xs text-gray-500">{range.unit}</div>
          </div>
        </div>

        {/* PV bar with SP marker */}
        <div>
          <div className="flex justify-between text-xs font-label text-gray-500 mb-1">
            <span>{range.min} {range.unit}</span>
            <span>PV Position</span>
            <span>{range.max} {range.unit}</span>
          </div>
          <div className="h-4 bg-navy-800 rounded-full relative overflow-visible">
            <div
              className={`h-full rounded-full transition-all duration-300 ${range.ok ? 'bg-cyan-scada/40' : 'bg-red-500/40'}`}
              style={{ width: `${pvPct}%` }}
            />
            {/* SP marker */}
            <div
              className="absolute top-0 h-full w-1 bg-yellow-400 rounded-sm z-10"
              style={{ left: `${spPct}%`, transform: 'translateX(-50%)' }}
            />
            {/* PV value text */}
            <div
              className="absolute top-0 h-full flex items-center"
              style={{ left: `${pvPct}%`, transform: 'translateX(-50%)' }}
            >
              <div className={`w-3 h-3 rounded-full border-2 ${range.ok ? 'border-cyan-scada bg-cyan-scada/50' : 'border-red-400 bg-red-400/50'}`} />
            </div>
          </div>
        </div>

        {/* MV output */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-label text-gray-400">MV Output</span>
            <span className="font-mono font-bold text-white">{pid.mvVal.toFixed(1)}%</span>
          </div>
          {isAutoMode ? (
            <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/25 rounded-full transition-all duration-300"
                style={{ width: `${pid.mvVal}%` }}
              />
            </div>
          ) : (
            <input
              type="range"
              min={0} max={100} step={0.5}
              value={localMv}
              onChange={e => handleMvSlider(Number(e.target.value))}
              className="w-full h-3 accent-orange-400 cursor-pointer"
            />
          )}
        </div>

        {/* Tuning parameters */}
        <div className="border-t border-gray-700/50 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label text-xs text-gray-500">PID Tuning</span>
            <button
              onClick={() => setEditingTune(!editingTune)}
              className="text-xs font-label text-cyan-scada/70 hover:text-cyan-scada transition-colors"
            >
              {editingTune ? 'Done' : 'Edit'}
            </button>
          </div>

          {editingTune ? (
            <div className="space-y-2">
              {[
                { key: 'Kp', label: 'Kp', min: 0, max: 20, step: 0.1 },
                { key: 'Ki', label: 'Ki', min: 0, max: 2, step: 0.01 },
                { key: 'Kd', label: 'Kd', min: 0, max: 10, step: 0.1 },
              ].map(({ key, label, min, max, step }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400 w-6">{label}</span>
                  <input
                    type="range"
                    min={min} max={max} step={step}
                    value={tuning[key]}
                    onChange={e => {
                      const newTune = { ...tuning, [key]: Number(e.target.value) };
                      setTuning(newTune);
                      tunePid(pid.id, newTune);
                    }}
                    className="flex-1 h-2 accent-cyan-scada cursor-pointer"
                  />
                  <span className="font-mono text-xs text-cyan-scada w-10 text-right">{tuning[key].toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ l: 'Kp', v: pid.Kp }, { l: 'Ki', v: pid.Ki }, { l: 'Kd', v: pid.Kd }].map(({ l, v }) => (
                <div key={l} className="bg-navy-800/40 rounded px-2 py-1">
                  <div className="font-mono text-xs text-gray-500">{l}</div>
                  <div className="font-mono text-sm text-cyan-scada/80">{v.toFixed(3)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Controllers() {
  const pids = usePlantStore(s => s.pids);
  const setActiveFaceplate = usePlantStore(s => s.setActiveFaceplate);
  const cascadeEnabled = usePlantStore(s => s.cascadeEnabled);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-700/50 bg-navy-800/50 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="font-label text-lg font-bold text-white">PID Controllers</h1>
          <p className="font-label text-xs text-gray-400">Click SP value to edit — drag MV slider in Manual mode</p>
        </div>
        {cascadeEnabled && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-cyan-scada/30 bg-cyan-scada/10">
            <div className="w-2 h-2 rounded-full bg-cyan-scada animate-pulse" />
            <span className="font-label text-xs text-cyan-scada font-bold">CASCADE ACTIVE: LIC-401 → FIC-201</span>
          </div>
        )}
      </div>

      {/* 2×2 grid of PID cards */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pids.map(pid => (
            <ControllerCard
              key={pid.id}
              pid={pid}
              onOpenFaceplate={() => setActiveFaceplate(pid.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
