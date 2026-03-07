import { useState } from 'react';
import { usePlantStore } from '../store/plantStore';

const RANGOS_CV = {
  y1: { min: 0, max: 20,   unidad: 'm³/h',  ok: v => v >= 8 },
  y2: { min: 0, max: 1000, unidad: 'μS/cm', ok: v => v <= 600 },
  y3: { min: 0, max: 100,  unidad: '%',      ok: v => v >= 20 && v <= 85 },
  y4: { min: 0, max: 14,   unidad: 'pH',     ok: v => v >= 6.5 && v <= 8.5 },
};
const CV_KEYS = ['y1', 'y2', 'y3', 'y4'];

function TarjetaControlador({ pid }) {
  const setPidModo = usePlantStore(s => s.setPidModo);
  const setPidSP = usePlantStore(s => s.setPidSP);
  const setPidSalidaManual = usePlantStore(s => s.setPidSalidaManual);
  const ajustarPid = usePlantStore(s => s.ajustarPid);
  const cascadaActiva = usePlantStore(s => s.cascadaActiva);
  const setCascada = usePlantStore(s => s.setCascada);
  const emulacion = usePlantStore(s => s.emulacion);

  const [editandoSP, setEditandoSP] = useState(false);
  const [inputSP, setInputSP] = useState('');
  const [mvLocal, setMvLocal] = useState(pid.mvVal);
  const [editandoSint, setEditandoSint] = useState(false);
  const [sint, setSint] = useState({ Kp: pid.Kp, Ki: pid.Ki, Kd: pid.Kd });

  const cvKey = CV_KEYS[pid.id];
  const rango = RANGOS_CV[cvKey];
  const esModoAuto = pid.modo === 'auto';
  const ok = rango.ok(pid.pv);
  const error = pid.sp - pid.pv;
  const emuCV = emulacion[cvKey]?.activa;
  const emuMV = emulacion[pid.mv]?.activa;

  const pvPct = Math.max(0, Math.min(100, ((pid.pv - rango.min) / (rango.max - rango.min)) * 100));
  const spPct = Math.max(0, Math.min(100, ((pid.sp - rango.min) / (rango.max - rango.min)) * 100));

  const confirmarSP = () => {
    const v = parseFloat(inputSP);
    if (!isNaN(v)) setPidSP(pid.id, v);
    setEditandoSP(false);
  };

  return (
    <div className={`bg-navy-700 border rounded-xl overflow-hidden ${ok ? 'border-gray-700/50' : 'border-red-500/50'}`}>
      {/* Cabecera */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        esModoAuto ? 'bg-navy-800' : 'bg-orange-900/30'
      } border-gray-700/50`}>
        <div className="flex items-center gap-2">
          <div>
            <div className="font-mono text-base text-cyan-scada font-bold">{pid.tag}</div>
            <div className="font-label text-xs text-gray-400">{pid.etiqueta}</div>
          </div>
          {(emuCV || emuMV) && (
            <span className="text-xs font-label font-bold px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-400">EMU</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pid.id === 0 && (
            <button onClick={() => setCascada(!cascadaActiva)}
              className={`text-xs font-label px-2 py-0.5 rounded border transition-colors ${
                cascadaActiva ? 'border-cyan-scada text-cyan-scada bg-cyan-scada/10' : 'border-gray-600 text-gray-500 hover:border-gray-400'
              }`}>CASCADA</button>
          )}
          <button onClick={() => setPidModo(pid.id, esModoAuto ? 'manual' : 'auto')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-label font-bold border transition-all ${
              esModoAuto ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-orange-500/20 border-orange-500/50 text-orange-400'
            }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${esModoAuto ? 'bg-green-400' : 'bg-orange-400'}`} />
            {esModoAuto ? 'AUTO' : 'MANUAL'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* PV / SP / ERROR */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { etq: 'PV',     val: pid.pv,  color: emuCV ? '#c084fc' : ok ? '#00d4ff' : '#f87171' },
            { etq: 'Consigna', val: pid.sp, color: '#fbbf24', clickable: true },
            { etq: 'Error',  val: error,   color: Math.abs(error) < 0.5 ? '#4ade80' : '#fbbf24', signo: true },
          ].map(({ etq, val, color, clickable, signo }) => (
            <div key={etq} className="bg-navy-800/60 rounded-lg p-2">
              <div className="font-label text-xs text-gray-500 mb-1">{etq}</div>
              {clickable && editandoSP ? (
                <input type="number" value={inputSP} autoFocus
                  onChange={e => setInputSP(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmarSP()}
                  onBlur={confirmarSP}
                  className="w-full bg-navy-900 border border-yellow-400/50 text-yellow-400 font-mono text-lg px-1 py-0 rounded text-center outline-none"
                />
              ) : (
                <div
                  className={`font-mono text-xl font-bold ${clickable && esModoAuto ? 'cursor-pointer hover:opacity-80' : ''}`}
                  style={{ color }}
                  onClick={clickable && esModoAuto ? () => { setInputSP(pid.sp.toString()); setEditandoSP(true); } : undefined}
                >
                  {signo && val >= 0 ? '+' : ''}{val.toFixed(val < 10 ? 3 : 1)}
                </div>
              )}
              <div className="font-label text-xs text-gray-500">{rango.unidad}</div>
            </div>
          ))}
        </div>

        {/* Barra PV con marcador SP */}
        <div>
          <div className="h-4 bg-navy-800 rounded-full relative overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${emuCV ? 'bg-purple-500/40' : ok ? 'bg-cyan-scada/40' : 'bg-red-500/40'}`}
              style={{ width: `${pvPct}%` }} />
            <div className="absolute top-0 h-full w-1 bg-yellow-400 rounded-sm z-10"
              style={{ left: `${spPct}%`, transform: 'translateX(-50%)' }} />
            <div className="absolute top-0 h-full flex items-center"
              style={{ left: `${pvPct}%`, transform: 'translateX(-50%)' }}>
              <div className={`w-3 h-3 rounded-full border-2 ${emuCV ? 'border-purple-400 bg-purple-400/50' : ok ? 'border-cyan-scada bg-cyan-scada/50' : 'border-red-400 bg-red-400/50'}`} />
            </div>
          </div>
        </div>

        {/* Salida MV */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-label text-gray-400">Salida MV {emuMV && <span className="text-purple-400">(EMU)</span>}</span>
            <span className="font-mono font-bold text-white">{pid.mvVal.toFixed(1)}%</span>
          </div>
          {!esModoAuto && !emuMV ? (
            <input type="range" min={0} max={100} step={0.5} value={mvLocal}
              onChange={e => { setMvLocal(+e.target.value); setPidSalidaManual(pid.id, +e.target.value); }}
              className="w-full h-3 accent-orange-400 cursor-pointer" />
          ) : (
            <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${emuMV ? 'bg-purple-500/50' : 'bg-white/25'}`}
                style={{ width: `${pid.mvVal}%` }} />
            </div>
          )}
        </div>

        {/* Sintonización */}
        <div className="border-t border-gray-700/50 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label text-xs text-gray-500">Sintonización PID</span>
            <button onClick={() => setEditandoSint(!editandoSint)}
              className="text-xs font-label text-cyan-scada/70 hover:text-cyan-scada transition-colors">
              {editandoSint ? 'Cerrar' : 'Editar'}
            </button>
          </div>

          {editandoSint ? (
            <div className="space-y-2">
              {[
                { k: 'Kp', min: 0, max: 20, paso: 0.1 },
                { k: 'Ki', min: 0, max: 2, paso: 0.01 },
                { k: 'Kd', min: 0, max: 10, paso: 0.1 },
              ].map(({ k, min, max, paso }) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400 w-6">{k}</span>
                  <input type="range" min={min} max={max} step={paso} value={sint[k]}
                    onChange={e => {
                      const nuevoSint = { ...sint, [k]: +e.target.value };
                      setSint(nuevoSint);
                      ajustarPid(pid.id, nuevoSint);
                    }}
                    className="flex-1 h-2 accent-cyan-scada cursor-pointer" />
                  <span className="font-mono text-xs text-cyan-scada w-10 text-right">{sint[k].toFixed(2)}</span>
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

export default function Controladores() {
  const pids = usePlantStore(s => s.pids);
  const cascadaActiva = usePlantStore(s => s.cascadaActiva);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-700/50 bg-navy-800/50 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="font-label text-lg font-bold text-white">Controladores PID</h1>
          <p className="font-label text-xs text-gray-400">Haz clic en la Consigna para editarla — Arrastra MV en modo Manual</p>
        </div>
        {cascadaActiva && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-cyan-scada/30 bg-cyan-scada/10">
            <div className="w-2 h-2 rounded-full bg-cyan-scada animate-pulse" />
            <span className="font-label text-xs text-cyan-scada font-bold">CASCADA ACTIVA: LIC-401 → FIC-201</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pids.map(pid => <TarjetaControlador key={pid.id} pid={pid} />)}
        </div>
      </div>
    </div>
  );
}
