import Plant from '../../components/Cafe/Plant';
import AlarmBanner from '../../components/Cafe/AlarmBanner';
import DisturbancePanel from '../../components/Cafe/DisturbancePanel';
import BatchConfigPanel from '../../components/Cafe/BatchConfigPanel';
import PidFaceplate from '../../components/Cafe/PidFaceplate';
import { useCafeStore } from '../../store/cafeStore';
import { usePlantStore } from '../../store/plantStore';
import TrendPanel from '../../components/Trends/TrendPanel';

// Mini TrendPanel usando datos del cafeStore
function CafeTrendPanel() {
  const datos = useCafeStore(s => s.datosTendencia);

  if (datos.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-xs font-label">
        Acumulando datos...
      </div>
    );
  }

  const ultimo = datos[datos.length - 1];
  const graficos = [
    { etq: 'T Tambor',  key: 'y1', color: '#f59e0b', unidad: '°C',  sp: 'sp1' },
    { etq: 'Humedad',   key: 'y2', color: '#34d399', unidad: '%',   sp: 'sp3' },
    { etq: 'T Gases',   key: 'y3', color: '#f472b6', unidad: '°C',  sp: 'sp2' },
    { etq: 'Color Ag',  key: 'y4', color: '#fbbf24', unidad: 'Ag',  sp: 'sp4' },
  ];

  return (
    <div className="flex flex-col gap-3 p-2 overflow-y-auto">
      {graficos.map(g => {
        const vals = datos.map(d => d[g.key]).filter(v => v != null);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const rng = Math.max(0.1, max - min);
        const spVal = ultimo[g.sp];

        return (
          <div key={g.key} className="bg-navy-700/50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-label text-xs text-gray-400">{g.etq}</span>
              <span className="font-mono text-xs font-bold" style={{ color: g.color }}>
                {ultimo[g.key]?.toFixed(g.key === 'y2' ? 2 : 0)} {g.unidad}
              </span>
            </div>
            <svg viewBox={`0 0 200 40`} className="w-full h-10">
              <polyline
                points={datos.slice(-60).map((d, i, arr) => {
                  const x = (i / (arr.length - 1)) * 200;
                  const y = 38 - ((d[g.key] - min) / rng) * 36;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none" stroke={g.color} strokeWidth="1.5" strokeLinejoin="round" />
              {spVal != null && (
                <line x1="0" x2="200" y1={38 - ((spVal - min) / rng) * 36}
                  y2={38 - ((spVal - min) / rng) * 36}
                  stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="4 3" />
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export default function CafeOverview() {
  const faceplateActivo = useCafeStore(s => s.faceplateActivo);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AlarmBanner />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <Plant />
        </div>

        <div className="w-72 border-l border-amber-700/20 overflow-hidden flex flex-col bg-navy-800/50">
          <div className="px-3 py-2 border-b border-gray-700/50">
            <span className="font-label text-xs text-gray-400 uppercase tracking-wider">Tendencias en Vivo</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <CafeTrendPanel />
          </div>
        </div>
      </div>

      <BatchConfigPanel />

      <DisturbancePanel />

      {faceplateActivo !== null && <PidFaceplate />}
    </div>
  );
}
