import { usePlantStore } from '../../store/plantStore';
import TrendChart from './TrendChart';

export default function TrendPanel({ compact = false }) {
  const datosTendencia = usePlantStore(s => s.datosTendencia);
  const emulacion = usePlantStore(s => s.emulacion);

  const graficos = [
    { titulo: 'FIC-201 — Flujo Permeado',    pvKey: 'y1', spKey: 'sp1', mvKey: 'u1', unidad: 'm³/h',  dominio: [0, 20],   color: '#00d4ff' },
    { titulo: 'AIC-202 — Conductividad',      pvKey: 'y2', spKey: 'sp2', mvKey: 'u2', unidad: 'μS/cm', dominio: [0, 1000], color: '#f472b6' },
    { titulo: 'LIC-401 — Nivel Depósito',     pvKey: 'y3', spKey: 'sp3', mvKey: 'u3', unidad: '%',     dominio: [0, 100],  color: '#34d399' },
    { titulo: 'pHIC-401 — pH Producto',       pvKey: 'y4', spKey: 'sp4', mvKey: 'u4', unidad: 'pH',    dominio: [6, 9],    color: '#fb923c' },
  ];

  const alturaGrafico = compact ? 120 : 195;

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto p-3">
      {graficos.map(g => (
        <TrendChart
          key={g.pvKey}
          data={datosTendencia}
          pvKey={g.pvKey}
          spKey={g.spKey}
          mvKey={!compact ? g.mvKey : undefined}
          titulo={g.titulo}
          unidad={g.unidad}
          dominio={g.dominio}
          pvColor={emulacion[g.pvKey]?.activa ? '#c084fc' : g.color}
          altura={alturaGrafico}
        />
      ))}
    </div>
  );
}
