import { useLocation, useNavigate } from 'react-router-dom';
import { usePlantStore } from '../../store/plantStore';
import { useCafeStore } from '../../store/cafeStore';

function formatTiempo(s) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sg = Math.floor(s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sg}`;
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSelector = location.pathname === '/';
  const isCafe = location.pathname.startsWith('/cafe');

  // RO store
  const roAlarmas = usePlantStore(s => s.alarmas);
  const roTiempo = usePlantStore(s => s.tiempoSim);
  const roEmulacion = usePlantStore(s => s.emulacion);

  // Café store
  const cafeAlarmas = useCafeStore(s => s.alarmas);
  const cafeTiempo = useCafeStore(s => s.tiempoSim);
  const cafeEmulacion = useCafeStore(s => s.emulacion);

  // Select active process data
  const alarmas = isCafe ? cafeAlarmas : roAlarmas;
  const tiempoSim = isCafe ? cafeTiempo : roTiempo;
  const emulacion = isCafe ? cafeEmulacion : roEmulacion;

  const criticas = alarmas.filter(a => a.prioridad === 'CRÍTICA' && a.estado === 'ACTIVA').length;
  const activas  = alarmas.filter(a => a.estado === 'ACTIVA' || a.estado === 'RECONOCIDA').length;
  const emuActivas = Object.values(emulacion).filter(e => e.activa).length;

  if (isSelector) {
    return (
      <nav className="h-12 bg-navy-700 border-b border-cyan-scada/20 flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-cyan-scada/20 border border-cyan-scada/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-cyan-scada">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
            </svg>
          </div>
          <span className="font-label font-bold text-white text-sm tracking-wider">OI-MULTISCADA</span>
        </div>
        <span className="font-mono text-xs text-gray-600">
          {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </nav>
    );
  }

  return (
    <nav className="h-12 bg-navy-700 border-b border-cyan-scada/20 flex items-center justify-between px-4 z-50 shrink-0">
      {/* Logo + proceso activo */}
      <div className="flex items-center gap-3">
        {/* Botón volver al selector */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-label text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-gray-700/50 hover:border-gray-500"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Selector
        </button>

        <div className="w-px h-6 bg-gray-700" />

        {/* Ícono proceso */}
        <div className={`w-7 h-7 rounded flex items-center justify-center border ${
          isCafe
            ? 'bg-amber-500/15 border-amber-500/30'
            : 'bg-cyan-scada/20 border-cyan-scada/40'
        }`}>
          {isCafe ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-amber-500">
              <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.81 6-4.72 7.28L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95zM11 2.05C5.95 2.55 2 6.82 2 12c0 3.76 2.09 7.07 5.22 8.78L6 22h5V2.05z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-cyan-scada">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          )}
        </div>

        <div>
          <span className="font-label font-bold text-white text-sm tracking-wider">
            {isCafe ? 'CAFÉ-SCADA' : 'OI-SCADA'}
          </span>
          <span className="font-label text-gray-400 text-xs ml-2">
            {isCafe ? 'Planta Tostado Café' : 'Planta Desalación — Dos Pasos'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Emulación activa */}
        {emuActivas > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded border border-purple-500/50 bg-purple-500/10">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-mono text-xs text-purple-400 font-bold">EMU {emuActivas}</span>
          </div>
        )}

        {/* Alarmas */}
        {activas > 0 && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded border ${
            criticas > 0
              ? 'border-red-500 bg-red-500/10 animate-pulse'
              : 'border-yellow-500 bg-yellow-500/10'
          }`}>
            <svg viewBox="0 0 24 24" className={`w-4 h-4 ${criticas > 0 ? 'fill-red-400' : 'fill-yellow-400'}`}>
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <span className={`font-mono text-xs font-bold ${criticas > 0 ? 'text-red-400' : 'text-yellow-400'}`}>
              {activas} ALARMA{activas !== 1 ? 'S' : ''}
            </span>
          </div>
        )}

        {/* Tiempo sim */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs text-gray-400">SIM {formatTiempo(tiempoSim)}</span>
        </div>

        {/* Fecha */}
        <span className="font-mono text-xs text-gray-600">
          {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </nav>
  );
}
