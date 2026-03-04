import { useState, useRef, useEffect } from 'react';
import { usePlantStore } from '../../store/plantStore';

const TAGS = ['FIC-201', 'AIC-202', 'LIC-401', 'pHIC-401'];

function Gauge({ value, min, max, unit, label, ok }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -135 + pct * 270;
  const cx = 50, cy = 50, r = 38;
  // Arc
  const startAngle = -135 * (Math.PI / 180);
  const endAngle = (startAngle + pct * 270 * Math.PI / 180);
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = pct * 270 > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 80" className="w-24 h-20">
        {/* Background arc */}
        <path
          d={`M ${cx + r * Math.cos(-135 * Math.PI / 180)} ${cy + r * Math.sin(-135 * Math.PI / 180)} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(135 * Math.PI / 180)} ${cy + r * Math.sin(135 * Math.PI / 180)}`}
          fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0.001 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={ok ? '#00d4ff' : '#ff4444'}
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={cx + (r - 6) * Math.cos(angle * Math.PI / 180)}
          y2={cy + (r - 6) * Math.sin(angle * Math.PI / 180)}
          stroke="white" strokeWidth="1.5" strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="3" fill="white" />
        {/* Value text */}
        <text x={cx} y={cy + 18} textAnchor="middle" className="font-mono" fill={ok ? '#00d4ff' : '#ff4444'} fontSize="10" fontFamily="'Share Tech Mono', monospace">
          {typeof value === 'number' ? value.toFixed(value < 10 ? 2 : 0) : '--'}
        </text>
        <text x={cx} y={cy + 27} textAnchor="middle" fill="#6b7280" fontSize="6" fontFamily="Rajdhani, sans-serif">
          {unit}
        </text>
      </svg>
      <span className="font-label text-xs text-gray-400">{label}</span>
    </div>
  );
}

export default function PidFaceplate() {
  const activeFaceplate = usePlantStore(s => s.activeFaceplate);
  const pids = usePlantStore(s => s.pids);
  const closeFaceplate = usePlantStore(s => s.closeFaceplate);
  const setPidMode = usePlantStore(s => s.setPidMode);
  const setPidSP = usePlantStore(s => s.setPidSP);
  const setPidManualOutput = usePlantStore(s => s.setPidManualOutput);
  const tunePid = usePlantStore(s => s.tunePid);
  const cascadeEnabled = usePlantStore(s => s.cascadeEnabled);
  const setCascade = usePlantStore(s => s.setCascade);

  const [editingSP, setEditingSP] = useState(false);
  const [spInput, setSpInput] = useState('');
  const [localMv, setLocalMv] = useState(50);
  const [activeTab, setActiveTab] = useState('control'); // 'control' | 'tuning'
  const [tuning, setTuning] = useState({ Kp: 0, Ki: 0, Kd: 0 });

  const pid = pids.find(p => p.id === activeFaceplate);

  useEffect(() => {
    if (pid) {
      setLocalMv(pid.mvVal);
      setTuning({ Kp: pid.Kp, Ki: pid.Ki, Kd: pid.Kd });
    }
  }, [activeFaceplate]);

  if (!pid) return null;

  const isAutoMode = pid.mode === 'auto';

  // CV ranges for gauge
  const cvRanges = {
    y1: { min: 0, max: 20,   unit: 'm³/h', ok: pid.pv >= 8 },
    y2: { min: 0, max: 1000, unit: 'μS/cm', ok: pid.pv <= 600 },
    y3: { min: 0, max: 100,  unit: '%',     ok: pid.pv >= 20 && pid.pv <= 85 },
    y4: { min: 0, max: 14,   unit: 'pH',    ok: pid.pv >= 6.5 && pid.pv <= 8.5 },
  };
  const cvKeys = ['y1', 'y2', 'y3', 'y4'];
  const cvKey = cvKeys[pid.id];
  const range = cvRanges[cvKey];

  const pvPct = Math.max(0, Math.min(100, ((pid.pv - range.min) / (range.max - range.min)) * 100));
  const spPct = Math.max(0, Math.min(100, ((pid.sp - range.min) / (range.max - range.min)) * 100));

  const handleModeToggle = () => {
    const newMode = isAutoMode ? 'manual' : 'auto';
    setPidMode(pid.id, newMode);
  };

  const handleSpClick = () => {
    setSpInput(pid.sp.toString());
    setEditingSP(true);
  };

  const handleSpSubmit = () => {
    const val = parseFloat(spInput);
    if (!isNaN(val)) {
      setPidSP(pid.id, val);
    }
    setEditingSP(false);
  };

  const handleMvChange = (v) => {
    setLocalMv(v);
    if (!isAutoMode) {
      setPidManualOutput(pid.id, v);
    }
  };

  const handleTuningApply = () => {
    tunePid(pid.id, tuning);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeFaceplate}>
      <div
        className="bg-navy-700 border border-cyan-scada/30 rounded-xl shadow-2xl w-80 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-navy-800 border-b border-cyan-scada/20">
          <div>
            <div className="font-mono text-sm text-cyan-scada font-bold">{pid.tag}</div>
            <div className="font-label text-xs text-gray-400">{pid.label}</div>
          </div>
          <div className="flex items-center gap-2">
            {pid.id === 0 && (
              <button
                onClick={() => setCascade(!cascadeEnabled)}
                className={`text-xs font-label px-2 py-0.5 rounded border transition-colors ${
                  cascadeEnabled ? 'border-cyan-scada text-cyan-scada bg-cyan-scada/10' : 'border-gray-600 text-gray-400 hover:border-gray-400'
                }`}
              >
                CASCADE
              </button>
            )}
            <button onClick={closeFaceplate} className="text-gray-400 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-700/50">
          {['control', 'tuning'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-label font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab ? 'text-cyan-scada border-b-2 border-cyan-scada' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'control' && (
          <div className="p-4 space-y-4">
            {/* Gauge */}
            <div className="flex justify-center">
              <Gauge value={pid.pv} min={range.min} max={range.max} unit={range.unit} label="PV" ok={range.ok} />
            </div>

            {/* PV/SP/MV bar */}
            <div className="space-y-2">
              {/* PV bar */}
              <div>
                <div className="flex justify-between text-xs font-label text-gray-400 mb-1">
                  <span>PV</span>
                  <span className={`font-mono font-bold ${range.ok ? 'text-cyan-scada' : 'text-red-400'}`}>
                    {pid.pv.toFixed(2)} {range.unit}
                  </span>
                </div>
                <div className="h-3 bg-navy-800 rounded-full relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${range.ok ? 'bg-cyan-scada' : 'bg-red-500'}`}
                    style={{ width: `${pvPct}%` }}
                  />
                  {/* SP marker */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-yellow-400"
                    style={{ left: `${spPct}%` }}
                  />
                </div>
              </div>

              {/* SP row */}
              <div className="flex items-center justify-between">
                <span className="font-label text-xs text-gray-400">SP</span>
                {editingSP ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={spInput}
                      onChange={e => setSpInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSpSubmit()}
                      onBlur={handleSpSubmit}
                      autoFocus
                      className="w-20 bg-navy-800 border border-cyan-scada/50 text-cyan-scada font-mono text-xs px-2 py-0.5 rounded text-right outline-none"
                    />
                    <span className="font-label text-xs text-gray-500">{range.unit}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSpClick}
                    disabled={!isAutoMode}
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded border transition-colors ${
                      isAutoMode
                        ? 'text-yellow-400 border-yellow-400/40 hover:bg-yellow-400/10 cursor-pointer'
                        : 'text-gray-600 border-gray-700 cursor-not-allowed'
                    }`}
                  >
                    {pid.sp.toFixed(2)} {range.unit}
                  </button>
                )}
              </div>

              {/* MV row */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label text-xs text-gray-400">MV (Output)</span>
                  <span className="font-mono text-xs font-bold text-white">{pid.mvVal.toFixed(1)}%</span>
                </div>
                {!isAutoMode && (
                  <input
                    type="range"
                    min="0" max="100" step="0.5"
                    value={localMv}
                    onChange={e => handleMvChange(Number(e.target.value))}
                    className="w-full h-2 accent-cyan-scada"
                  />
                )}
                {isAutoMode && (
                  <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                    <div className="h-full bg-white/30 rounded-full transition-all" style={{ width: `${pid.mvVal}%` }} />
                  </div>
                )}
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
              <span className="font-label text-xs text-gray-400">Control Mode</span>
              <button
                onClick={handleModeToggle}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-label font-bold border transition-all ${
                  isAutoMode
                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                    : 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isAutoMode ? 'bg-green-400' : 'bg-orange-400'} animate-pulse`} />
                {isAutoMode ? 'AUTO' : 'MANUAL'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tuning' && (
          <div className="p-4 space-y-4">
            <div className="text-xs font-label text-gray-400 text-center">PID Parameters</div>
            {[
              { key: 'Kp', label: 'Proportional Gain (Kp)', min: 0, max: 20, step: 0.1 },
              { key: 'Ki', label: 'Integral Gain (Ki)', min: 0, max: 2,  step: 0.01 },
              { key: 'Kd', label: 'Derivative Gain (Kd)', min: 0, max: 10, step: 0.1 },
            ].map(({ key, label, min, max, step }) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label text-xs text-gray-400">{label}</span>
                  <span className="font-mono text-xs text-cyan-scada">{tuning[key].toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={min} max={max} step={step}
                  value={tuning[key]}
                  onChange={e => setTuning(t => ({ ...t, [key]: Number(e.target.value) }))}
                  className="w-full h-2 accent-cyan-scada"
                />
              </div>
            ))}
            <button
              onClick={handleTuningApply}
              className="w-full py-2 bg-cyan-scada/20 border border-cyan-scada/40 rounded-lg text-cyan-scada font-label font-bold text-sm hover:bg-cyan-scada/30 transition-colors"
            >
              Apply Tuning
            </button>
            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-700/50">
              {[
                { k: 'Kp', v: pid.Kp },
                { k: 'Ki', v: pid.Ki },
                { k: 'Kd', v: pid.Kd },
              ].map(({ k, v }) => (
                <div key={k} className="text-center">
                  <div className="font-label text-xs text-gray-500">{k} (active)</div>
                  <div className="font-mono text-xs text-yellow-400">{v.toFixed(3)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
