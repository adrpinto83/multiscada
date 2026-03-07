import { useNavigate } from 'react-router-dom';
import { usePlantStore } from '../store/plantStore';
import { useCafeStore } from '../store/cafeStore';

function formatTiempo(s) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sg = Math.floor(s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sg}`;
}

function TarjetaPlanta({ titulo, subtitulo, icono, color, ruta, metricas, alarmas, tiempoSim, corriendo }) {
  const navigate = useNavigate();
  const criticas = alarmas.filter(a => a.prioridad === 'CRÍTICA' && a.estado === 'ACTIVA').length;
  const activas = alarmas.filter(a => a.estado !== 'BORRADA').length;

  return (
    <div
      className={`bg-navy-800 border rounded-2xl overflow-hidden flex flex-col transition-all hover:border-opacity-60 hover:shadow-2xl cursor-pointer`}
      style={{ borderColor: `${color}30` }}
      onClick={() => navigate(ruta)}
    >
      {/* Cabecera */}
      <div className="px-8 py-6 flex items-center gap-5" style={{ background: `linear-gradient(135deg, ${color}10, transparent)` }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}>
          {icono}
        </div>
        <div>
          <h2 className="font-label text-2xl font-bold text-white">{titulo}</h2>
          <p className="font-label text-sm text-gray-400">{subtitulo}</p>
        </div>
      </div>

      {/* Métricas live */}
      <div className="px-8 py-4 grid grid-cols-2 gap-4 flex-1">
        {metricas.map((m, i) => (
          <div key={i} className="bg-navy-700/50 rounded-xl p-4">
            <div className="font-label text-xs text-gray-500 mb-1">{m.etq}</div>
            <div className="font-mono text-xl font-bold" style={{ color: m.ok ? color : '#f87171' }}>
              {m.valor}
              <span className="font-label text-xs text-gray-500 ml-1 font-normal">{m.unidad}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t flex items-center justify-between" style={{ borderColor: `${color}15` }}>
        <div className="flex items-center gap-3">
          {/* Alarmas */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            criticas > 0 ? 'border-red-500/50 bg-red-500/10' :
            activas > 0  ? 'border-yellow-500/50 bg-yellow-500/10' :
                           'border-green-500/30 bg-green-500/5'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              criticas > 0 ? 'bg-red-400 animate-pulse' :
              activas > 0  ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
            <span className={`font-mono text-xs font-bold ${
              criticas > 0 ? 'text-red-400' : activas > 0 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {activas === 0 ? 'SIN ALARMAS' : `${activas} ALARMA${activas !== 1 ? 'S' : ''}`}
            </span>
          </div>
          {/* SIM time */}
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-xs text-gray-500">SIM {formatTiempo(tiempoSim)}</span>
          </div>
        </div>

        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-label font-bold text-sm transition-all hover:brightness-110"
          style={{ backgroundColor: `${color}20`, borderWidth: 1, borderColor: `${color}50`, color }}
        >
          Abrir Planta
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ProcessSelector() {
  // RO store
  const roCvs = usePlantStore(s => s.cvs);
  const roCalc = usePlantStore(s => s.calculadas);
  const roAlarmas = usePlantStore(s => s.alarmas);
  const roTiempo = usePlantStore(s => s.tiempoSim);

  // Café store
  const cafeCvs = useCafeStore(s => s.cvs);
  const cafeCalc = useCafeStore(s => s.calculadas);
  const cafeAlarmas = useCafeStore(s => s.alarmas);
  const cafeTiempo = useCafeStore(s => s.tiempoSim);

  const COLORES_GRADO = {
    VERDE: '#22c55e', LIGERO: '#a3e635', MEDIO: '#f59e0b', OSCURO: '#b45309', QUEMADO: '#7f1d1d',
  };

  const roMetricas = [
    { etq: 'Flujo Permeado',    valor: roCvs.y1.toFixed(2),  unidad: 'm³/h',  ok: roCvs.y1 >= 8 },
    { etq: 'Conductividad',     valor: roCvs.y2.toFixed(0),  unidad: 'μS/cm', ok: roCvs.y2 <= 600 },
    { etq: 'Nivel Depósito',    valor: roCvs.y3.toFixed(1),  unidad: '%',     ok: roCvs.y3 >= 20 && roCvs.y3 <= 85 },
    { etq: 'Rechazo Sal',       valor: roCalc.rechazoSal.toFixed(1), unidad: '%', ok: true },
  ];

  const cafeMetricas = [
    { etq: 'Temp Tambor',       valor: cafeCvs.y1.toFixed(0), unidad: '°C',   ok: cafeCvs.y1 >= 160 && cafeCvs.y1 <= 240 },
    { etq: 'Humedad Grano',     valor: cafeCvs.y2.toFixed(2), unidad: '%',    ok: cafeCvs.y2 <= 5 },
    { etq: 'Color Agtron',      valor: cafeCvs.y4.toFixed(0), unidad: 'Ag',   ok: cafeCvs.y4 >= 35 && cafeCvs.y4 <= 80 },
    { etq: 'Grado Tostado',     valor: cafeCalc.gradoTostado, unidad: '',     ok: cafeCalc.gradoTostado !== 'QUEMADO' },
  ];

  return (
    <div className="flex flex-col h-full bg-navy-900 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-cyan-scada/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-scada/15 border border-cyan-scada/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-cyan-scada">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-label text-2xl font-bold text-white tracking-wider">OI-MULTISCADA</h1>
            <p className="font-label text-sm text-gray-400">Sistema Multi-Proceso — Selecciona una planta</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs text-gray-400">2 simuladores activos</span>
          <span className="font-mono text-xs text-gray-600">
            {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TarjetaPlanta
            titulo="Planta OI Desalación"
            subtitulo="Ósmosis Inversa — Dos Pasos"
            ruta="/ro/visgeneral"
            color="#00d4ff"
            alarmas={roAlarmas}
            tiempoSim={roTiempo}
            metricas={roMetricas}
            icono={
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-cyan-scada">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            }
          />

          <TarjetaPlanta
            titulo="Planta Tostado Café"
            subtitulo="Tostador Industrial — 4×4 MIMO"
            ruta="/cafe/visgeneral"
            color="#f59e0b"
            alarmas={cafeAlarmas}
            tiempoSim={cafeTiempo}
            metricas={cafeMetricas}
            icono={
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-amber-500">
                <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.81 6-4.72 7.28L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95zM11 2.05C5.95 2.55 2 6.82 2 12c0 3.76 2.09 7.07 5.22 8.78L6 22h5V2.05z"/>
              </svg>
            }
          />
        </div>
      </div>

      {/* Footer status */}
      <div className="px-8 py-3 border-t border-gray-800 shrink-0 flex items-center gap-8">
        <span className="font-label text-xs text-gray-600">ESTADO SIMULADORES</span>
        {[
          { nombre: 'RO Desalación', tiempo: roTiempo, alarmas: roAlarmas.filter(a => a.estado !== 'BORRADA').length, color: '#00d4ff' },
          { nombre: 'Tostado Café',  tiempo: cafeTiempo, alarmas: cafeAlarmas.filter(a => a.estado !== 'BORRADA').length, color: '#f59e0b' },
        ].map(s => (
          <div key={s.nombre} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: s.color }} />
            <span className="font-label text-xs text-gray-500">{s.nombre}</span>
            <span className="font-mono text-xs" style={{ color: s.color }}>{formatTiempo(s.tiempo)}</span>
            {s.alarmas > 0 && (
              <span className="font-mono text-xs text-red-400">{s.alarmas}A</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
