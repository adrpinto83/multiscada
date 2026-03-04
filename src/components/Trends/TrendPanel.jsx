import { usePlantStore } from '../../store/plantStore';
import TrendChart from './TrendChart';

export default function TrendPanel({ compact = false }) {
  const trendData = usePlantStore(s => s.trendData);
  const pids = usePlantStore(s => s.pids);

  const charts = [
    {
      title: `FIC-201 — Permeate Flow`,
      pvKey: 'y1', spKey: 'sp1', mvKey: 'u1',
      unit: 'm³/h',
      yDomain: [0, 20],
    },
    {
      title: `AIC-202 — Conductivity`,
      pvKey: 'y2', spKey: 'sp2', mvKey: 'u2',
      unit: 'μS/cm',
      yDomain: [0, 1000],
      pvColor: '#f472b6',
    },
    {
      title: `LIC-401 — Tank Level`,
      pvKey: 'y3', spKey: 'sp3', mvKey: 'u3',
      unit: '%',
      yDomain: [0, 100],
      pvColor: '#34d399',
    },
    {
      title: `pHIC-401 — Product pH`,
      pvKey: 'y4', spKey: 'sp4', mvKey: 'u4',
      unit: 'pH',
      yDomain: [6, 9],
      pvColor: '#fb923c',
    },
  ];

  const chartHeight = compact ? 130 : 200;

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto p-3">
      {charts.map(c => (
        <TrendChart
          key={c.pvKey}
          data={trendData}
          pvKey={c.pvKey}
          spKey={c.spKey}
          mvKey={!compact ? c.mvKey : undefined}
          title={c.title}
          unit={c.unit}
          yDomain={c.yDomain}
          pvColor={c.pvColor || '#00d4ff'}
          height={chartHeight}
        />
      ))}
    </div>
  );
}
