import { useCafeStore } from '../../store/cafeStore';
import TrendChart from '../../components/Trends/TrendChart';

export default function CafeTendencias() {
  const datosTendencia = useCafeStore(s => s.datosTendencia);
  const cvs = useCafeStore(s => s.cvs);
  const mvs = useCafeStore(s => s.mvs);
  const pids = useCafeStore(s => s.pids);
  const calculadas = useCafeStore(s => s.calculadas);
  const emulacion = useCafeStore(s => s.emulacion);

  const graficos = [
    {
      titulo: 'TIC-001 — Temperatura Tambor',
      pvKey: 'y1', spKey: 'sp1', mvKey: 'u1',
      unidad: '°C', dominio: [100, 280], color: '#f59e0b',
      liveVal: cvs.y1.toFixed(1), sp: pids[0]?.sp.toFixed(0), emu: emulacion.y1?.activa,
    },
    {
      titulo: 'TIC-002 — Temperatura Gases Salida',
      pvKey: 'y3', spKey: 'sp2', mvKey: 'u3',
      unidad: '°C', dominio: [80, 250], color: '#f472b6',
      liveVal: cvs.y3.toFixed(1), sp: pids[1]?.sp.toFixed(0), emu: emulacion.y3?.activa,
    },
    {
      titulo: 'MIC-001 — Humedad Grano',
      pvKey: 'y2', spKey: 'sp3', mvKey: 'u2',
      unidad: '%', dominio: [0, 10], color: '#34d399',
      liveVal: cvs.y2.toFixed(2), sp: pids[2]?.sp.toFixed(1), emu: emulacion.y2?.activa,
    },
    {
      titulo: 'CIC-001 — Índice Color Agtron',
      pvKey: 'y4', spKey: 'sp4', mvKey: 'u4',
      unidad: 'Ag', dominio: [0, 100], color: '#fbbf24',
      liveVal: cvs.y4.toFixed(0), sp: pids[3]?.sp.toFixed(0), emu: emulacion.y4?.activa,
    },
    {
      titulo: 'Tasa de Calentamiento',
      pvKey: 'tasa', spKey: null, mvKey: null,
      unidad: '°C/min', dominio: [-10, 30], color: '#fb923c',
      liveVal: calculadas.tasaCalentamiento.toFixed(1), sp: null, emu: false,
    },
    {
      titulo: 'Consumo Energético',
      pvKey: 'energia', spKey: null, mvKey: null,
      unidad: 'kcal/kg', dominio: [0, 2000], color: '#a78bfa',
      liveVal: calculadas.consumoEnergia.toFixed(0), sp: null, emu: false,
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-700/50 bg-navy-800/50 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="font-label text-lg font-bold text-white">Tendencias — Planta Tostado Café</h1>
          <p className="font-label text-xs text-gray-400">Ventana deslizante de 120 segundos — Frecuencia 2 Hz</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="w-6 h-0.5 bg-amber-400 inline-block" />
            <span className="font-label text-gray-400">PV (Variable Proceso)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-6 border-t-2 border-dashed border-yellow-400 inline-block" />
            <span className="font-label text-gray-400">SP (Consigna)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-6 h-0.5 bg-purple-400 inline-block opacity-60" />
            <span className="font-label text-gray-400">MV (Salida)</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {graficos.map(g => (
            <div key={g.pvKey} className="flex flex-col">
              <div className="flex items-center gap-4 mb-1 px-1">
                <div className="flex items-center gap-2">
                  {g.emu && <div className="w-2 h-2 rounded-full bg-purple-400" title="Emulado" />}
                  <span className="font-mono text-lg font-bold" style={{ color: g.emu ? '#c084fc' : g.color }}>
                    {g.liveVal}
                    <span className="font-label text-xs text-gray-500 ml-1 font-normal">{g.unidad}</span>
                  </span>
                </div>
                {g.sp && (
                  <span className="font-label text-xs text-gray-500">
                    SP: <span className="text-yellow-400 font-mono">{g.sp} {g.unidad}</span>
                  </span>
                )}
                {g.mvKey && (
                  <span className="font-label text-xs text-gray-500">
                    MV: <span className="text-purple-400 font-mono">{mvs[g.mvKey]?.toFixed(1)}%</span>
                  </span>
                )}
              </div>
              <TrendChart
                data={datosTendencia}
                pvKey={g.pvKey}
                spKey={g.spKey}
                mvKey={g.mvKey}
                titulo={g.titulo}
                unidad={g.unidad}
                dominio={g.dominio}
                pvColor={g.emu ? '#c084fc' : g.color}
                altura={200}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
