import { useState, useEffect } from 'react';
import { useCafeStore } from '../../store/cafeStore';

const RANGOS_CV = {
  y1: { min: 0, max: 300,  unidad: '°C',  ok: v => v >= 160 && v <= 240 },
  y2: { min: 0, max: 15,   unidad: '%',   ok: v => v <= 5 },
  y3: { min: 0, max: 280,  unidad: '°C',  ok: v => v <= 200 },
  y4: { min: 0, max: 100,  unidad: 'Ag',  ok: v => v >= 35 && v <= 80 },
};

function Medidor({ valor, min, max, unidad, ok }) {
  const pct = Math.max(0, Math.min(1, (valor - min) / (max - min)));
  const angulo = -135 + pct * 270;
  const cx = 50, cy = 50, r = 38;
  const aI = -135 * Math.PI / 180;
  const aF = (aI + pct * 270 * Math.PI / 180);
  const x1 = cx + r * Math.cos(aI), y1 = cy + r * Math.sin(aI);
  const x2 = cx + r * Math.cos(aF), y2 = cy + r * Math.sin(aF);
  const arcoGrande = pct * 270 > 180 ? 1 : 0;
  const color = ok ? '#f59e0b' : '#ff4444';

  return (
    <svg viewBox="0 0 100 80" className="w-24 h-20">
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(135 * Math.PI / 180)} ${cy + r * Math.sin(135 * Math.PI / 180)}`}
        fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
      {pct > 0.001 && (
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${arcoGrande} 1 ${x2} ${y2}`}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
      )}
      <line x1={cx} y1={cy} x2={cx + (r - 6) * Math.cos(angulo * Math.PI / 180)} y2={cy + (r - 6) * Math.sin(angulo * Math.PI / 180)}
        stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="3" fill="white" />
      <text x={cx} y={cy + 18} textAnchor="middle" fill={color} fontSize="10" fontFamily="'Share Tech Mono',monospace">
        {typeof valor === 'number' ? valor.toFixed(valor < 10 ? 2 : 0) : '--'}
      </text>
      <text x={cx} y={cy + 27} textAnchor="middle" fill="#6b7280" fontSize="6" fontFamily="Rajdhani,sans-serif">{unidad}</text>
    </svg>
  );
}

export default function PidFaceplate() {
  const faceplateActivo = useCafeStore(s => s.faceplateActivo);
  const pids = useCafeStore(s => s.pids);
  const cerrar = useCafeStore(s => s.cerrarFaceplate);
  const setPidModo = useCafeStore(s => s.setPidModo);
  const setPidSP = useCafeStore(s => s.setPidSP);
  const setPidSalidaManual = useCafeStore(s => s.setPidSalidaManual);
  const ajustarPid = useCafeStore(s => s.ajustarPid);
  const emulacion = useCafeStore(s => s.emulacion);
  const toggleEmulacion = useCafeStore(s => s.toggleEmulacion);
  const setEmulacion = useCafeStore(s => s.setEmulacion);

  const [editandoSP, setEditandoSP] = useState(false);
  const [inputSP, setInputSP] = useState('');
  const [mvLocal, setMvLocal] = useState(50);
  const [tab, setTab] = useState('control');
  const [sintonizacion, setSintonizacion] = useState({ Kp: 0, Ki: 0, Kd: 0 });

  const pid = pids.find(p => p.id === faceplateActivo);

  useEffect(() => {
    if (pid) {
      setMvLocal(pid.mvVal);
      setSintonizacion({ Kp: pid.Kp, Ki: pid.Ki, Kd: pid.Kd });
    }
  }, [faceplateActivo]);

  if (!pid) return null;

  const cvKey = pid.cv;
  const mvKey = pid.mv;
  const rango = RANGOS_CV[cvKey];
  const esModoAuto = pid.modo === 'auto';
  const emuCV = emulacion[cvKey] || {};
  const emuMV = emulacion[mvKey] || {};
  const pvReal = pid.pv;
  const ok = rango.ok(pvReal);

  const pvPct = Math.max(0, Math.min(100, ((pvReal - rango.min) / (rango.max - rango.min)) * 100));
  const spPct = Math.max(0, Math.min(100, ((pid.sp - rango.min) / (rango.max - rango.min)) * 100));

  const confirmarSP = () => {
    const v = parseFloat(inputSP);
    if (!isNaN(v)) setPidSP(pid.id, v);
    setEditandoSP(false);
  };

  const TABS = ['control', 'sintonía', 'emulación'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={cerrar}>
      <div className="bg-navy-700 border border-amber-500/30 rounded-xl shadow-2xl w-84 overflow-hidden" style={{ width: 340 }} onClick={e => e.stopPropagation()}>

        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3 bg-navy-800 border-b border-amber-500/20">
          <div>
            <div className="font-mono text-sm text-amber-400 font-bold">{pid.tag}</div>
            <div className="font-label text-xs text-gray-400">{pid.etiqueta}</div>
          </div>
          <div className="flex items-center gap-2">
            {(emuCV.activa || emuMV.activa) && (
              <span className="text-xs font-label font-bold px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-400">EMU</span>
            )}
            <button onClick={cerrar} className="text-gray-400 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700/50">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-label font-bold uppercase tracking-wider transition-colors ${
                tab === t ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-500 hover:text-gray-300'
              }`}>{t}</button>
          ))}
        </div>

        {/* ── TAB CONTROL ── */}
        {tab === 'control' && (
          <div className="p-4 space-y-4">
            <div className="flex justify-center">
              <Medidor valor={pvReal} min={rango.min} max={rango.max} unidad={rango.unidad} ok={ok} />
            </div>

            {/* Barra PV */}
            <div>
              <div className="flex justify-between text-xs font-label text-gray-400 mb-1">
                <span>PV {emuCV.activa && <span className="text-purple-400">(EMU)</span>}</span>
                <span className={`font-mono font-bold ${emuCV.activa ? 'text-purple-400' : ok ? 'text-amber-400' : 'text-red-400'}`}>
                  {pvReal.toFixed(pvReal < 10 ? 2 : 1)} {rango.unidad}
                </span>
              </div>
              <div className="h-3 bg-navy-800 rounded-full relative overflow-hidden">
                <div className={`h-full rounded-full transition-all ${emuCV.activa ? 'bg-purple-500' : ok ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${pvPct}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-yellow-400" style={{ left: `${spPct}%` }} />
              </div>
            </div>

            {/* SP */}
            <div className="flex items-center justify-between">
              <span className="font-label text-xs text-gray-400">Consigna (SP)</span>
              {editandoSP ? (
                <div className="flex items-center gap-1">
                  <input type="number" value={inputSP} autoFocus
                    onChange={e => setInputSP(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmarSP()}
                    onBlur={confirmarSP}
                    className="w-20 bg-navy-800 border border-amber-500/50 text-amber-400 font-mono text-xs px-2 py-0.5 rounded text-right outline-none"
                  />
                  <span className="font-label text-xs text-gray-500">{rango.unidad}</span>
                </div>
              ) : (
                <button onClick={() => { setInputSP(pid.sp.toString()); setEditandoSP(true); }}
                  disabled={!esModoAuto}
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded border transition-colors ${
                    esModoAuto ? 'text-yellow-400 border-yellow-400/40 hover:bg-yellow-400/10 cursor-pointer' : 'text-gray-600 border-gray-700 cursor-not-allowed'
                  }`}>
                  {pid.sp.toFixed(pid.sp < 10 ? 2 : 1)} {rango.unidad}
                </button>
              )}
            </div>

            {/* MV */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs text-gray-400">Salida MV {emuMV.activa && <span className="text-purple-400">(EMU)</span>}</span>
                <span className="font-mono text-xs font-bold text-white">{pid.mvVal.toFixed(1)}%</span>
              </div>
              {!esModoAuto && !emuMV.activa ? (
                <input type="range" min="0" max="100" step="0.5" value={mvLocal}
                  onChange={e => { setMvLocal(+e.target.value); setPidSalidaManual(pid.id, +e.target.value); }}
                  className="w-full h-2 accent-amber-500" />
              ) : (
                <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${emuMV.activa ? 'bg-purple-500/50' : 'bg-amber-500/50'}`}
                    style={{ width: `${pid.mvVal}%` }} />
                </div>
              )}
            </div>

            {/* Modo */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
              <span className="font-label text-xs text-gray-400">Modo Control</span>
              <button onClick={() => setPidModo(pid.id, esModoAuto ? 'manual' : 'auto')}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-label font-bold border transition-all ${
                  esModoAuto ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${esModoAuto ? 'bg-green-400' : 'bg-orange-400'}`} />
                {esModoAuto ? 'AUTO' : 'MANUAL'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB SINTONÍA ── */}
        {tab === 'sintonía' && (
          <div className="p-4 space-y-4">
            <div className="text-xs font-label text-gray-400 text-center">Parámetros PID — ISA Estándar</div>
            {[
              { k: 'Kp', etq: 'Ganancia Proporcional (Kp)', min: 0, max: 20, paso: 0.1 },
              { k: 'Ki', etq: 'Ganancia Integral (Ki)',      min: 0, max: 2,  paso: 0.01 },
              { k: 'Kd', etq: 'Ganancia Derivativa (Kd)',    min: 0, max: 10, paso: 0.1 },
            ].map(({ k, etq, min, max, paso }) => (
              <div key={k} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label text-xs text-gray-400">{etq}</span>
                  <span className="font-mono text-xs text-amber-400">{sintonizacion[k].toFixed(2)}</span>
                </div>
                <input type="range" min={min} max={max} step={paso} value={sintonizacion[k]}
                  onChange={e => setSintonizacion(s => ({ ...s, [k]: +e.target.value }))}
                  className="w-full h-2 accent-amber-500" />
              </div>
            ))}
            <button onClick={() => ajustarPid(pid.id, sintonizacion)}
              className="w-full py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 font-label font-bold text-sm hover:bg-amber-500/30 transition-colors">
              Aplicar Sintonización
            </button>
            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-700/50">
              {[{ k: 'Kp', v: pid.Kp }, { k: 'Ki', v: pid.Ki }, { k: 'Kd', v: pid.Kd }].map(({ k, v }) => (
                <div key={k} className="text-center">
                  <div className="font-label text-xs text-gray-500">{k} activo</div>
                  <div className="font-mono text-xs text-yellow-400">{v.toFixed(3)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB EMULACIÓN ── */}
        {tab === 'emulación' && (
          <div className="p-4 space-y-4">
            <div className="text-xs font-label text-gray-400 text-center">
              Emulación — sobreescribe el valor real del proceso para pruebas
            </div>

            {/* Emulación CV */}
            <div className="space-y-2 p-3 bg-navy-800/60 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between">
                <span className="font-label text-sm font-bold text-gray-300">Variable Controlada ({cvKey.toUpperCase()})</span>
                <button onClick={() => toggleEmulacion(cvKey)}
                  className={`px-3 py-1 text-xs font-label font-bold rounded-full border transition-all ${
                    emuCV.activa ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:border-gray-400'
                  }`}>
                  {emuCV.activa ? 'EMULADO ●' : 'INACTIVO ○'}
                </button>
              </div>
              <div className="flex items-center justify-between text-xs font-label text-gray-500">
                <span>Valor real: <span className="font-mono text-amber-400">{pvReal.toFixed(pvReal < 10 ? 2 : 1)} {rango.unidad}</span></span>
                <span>Emulado: <span className="font-mono text-purple-400">{emuCV.valor?.toFixed(1)} {rango.unidad}</span></span>
              </div>
              <input type="range"
                min={emuCV.min ?? rango.min} max={emuCV.max ?? rango.max} step={emuCV.paso ?? 0.5}
                value={emuCV.valor ?? pvReal}
                onChange={e => setEmulacion(cvKey, 'valor', +e.target.value)}
                className={`w-full h-2 ${emuCV.activa ? 'accent-purple-500' : 'accent-gray-600'}`}
                disabled={!emuCV.activa}
              />
              <div className="flex items-center gap-2">
                <input type="number"
                  value={emuCV.valor ?? pvReal}
                  onChange={e => setEmulacion(cvKey, 'valor', +e.target.value)}
                  disabled={!emuCV.activa}
                  className="flex-1 bg-navy-900 border border-gray-700 text-purple-400 font-mono text-xs px-2 py-1 rounded outline-none disabled:opacity-40"
                />
                <span className="font-label text-xs text-gray-500">{rango.unidad}</span>
              </div>
            </div>

            {/* Emulación MV */}
            <div className="space-y-2 p-3 bg-navy-800/60 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between">
                <span className="font-label text-sm font-bold text-gray-300">Variable Manipulada ({mvKey.toUpperCase()})</span>
                <button onClick={() => toggleEmulacion(mvKey)}
                  className={`px-3 py-1 text-xs font-label font-bold rounded-full border transition-all ${
                    emuMV.activa ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:border-gray-400'
                  }`}>
                  {emuMV.activa ? 'EMULADO ●' : 'INACTIVO ○'}
                </button>
              </div>
              <div className="text-xs font-label text-gray-500">
                Valor PID: <span className="font-mono text-white">{pid.mvVal.toFixed(1)}%</span>
                <span className="mx-2">→</span>
                Emulado: <span className="font-mono text-purple-400">{emuMV.valor?.toFixed(1)}%</span>
              </div>
              <input type="range" min={0} max={100} step={0.5}
                value={emuMV.valor ?? pid.mvVal}
                onChange={e => setEmulacion(mvKey, 'valor', +e.target.value)}
                className={`w-full h-2 ${emuMV.activa ? 'accent-purple-500' : 'accent-gray-600'}`}
                disabled={!emuMV.activa}
              />
            </div>

            <div className="text-xs text-gray-600 font-label text-center">
              Los valores emulados se usan como PV/MV real en toda la simulación y activan alarmas.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
