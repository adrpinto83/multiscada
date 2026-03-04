import { usePlantStore } from '../store/plantStore';
import TrendChart from '../components/Trends/TrendChart';

export default function Trends() {
  const trendData = usePlantStore(s => s.trendData);
  const cvs = usePlantStore(s => s.cvs);
  const mvs = usePlantStore(s => s.mvs);
  const pids = usePlantStore(s => s.pids);

  const charts = [
    {
      title: 'FIC-201 — Permeate Flow',
      pvKey: 'y1', spKey: 'sp1', mvKey: 'u1',
      unit: 'm³/h', yDomain: [0, 22],
      pvColor: '#00d4ff',
      liveValue: cvs.y1.toFixed(2),
      sp: pids[0]?.sp.toFixed(2),
    },
    {
      title: 'AIC-202 — Product Conductivity',
      pvKey: 'y2', spKey: 'sp2', mvKey: 'u2',
      unit: 'μS/cm', yDomain: [0, 1000],
      pvColor: '#f472b6',
      liveValue: cvs.y2.toFixed(0),
      sp: pids[1]?.sp.toFixed(0),
    },
    {
      title: 'LIC-401 — Product Tank Level',
      pvKey: 'y3', spKey: 'sp3', mvKey: 'u3',
      unit: '%', yDomain: [0, 100],
      pvColor: '#34d399',
      liveValue: cvs.y3.toFixed(1),
      sp: pids[2]?.sp.toFixed(1),
    },
    {
      title: 'pHIC-401 — Product pH',
      pvKey: 'y4', spKey: 'sp4', mvKey: 'u4',
      unit: 'pH', yDomain: [5.5, 10],
      pvColor: '#fb923c',
      liveValue: cvs.y4.toFixed(3),
      sp: pids[3]?.sp.toFixed(3),
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-700/50 bg-navy-800/50 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-label text-lg font-bold text-white">Process Trends</h1>
          <p className="font-label text-xs text-gray-400">Last 120 seconds rolling window — 2 Hz update rate</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="w-6 h-0.5 bg-cyan-400 inline-block" />
            <span className="font-label text-gray-400">PV (Process Variable)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-6 border-t-2 border-dashed border-yellow-400 inline-block" />
            <span className="font-label text-gray-400">SP (Setpoint)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-6 h-0.5 bg-purple-400 inline-block opacity-60" />
            <span className="font-label text-gray-400">MV (Output)</span>
          </span>
        </div>
      </div>

      {/* Charts grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {charts.map(c => (
            <div key={c.pvKey} className="flex flex-col">
              {/* Live value header */}
              <div className="flex items-center gap-4 mb-1 px-1">
                <span className="font-mono text-lg font-bold" style={{ color: c.pvColor }}>
                  {c.liveValue}
                  <span className="font-label text-xs text-gray-500 ml-1 font-normal">{c.unit}</span>
                </span>
                <span className="font-label text-xs text-gray-500">
                  SP: <span className="text-yellow-400 font-mono">{c.sp} {c.unit}</span>
                </span>
                <span className="font-label text-xs text-gray-500">
                  MV: <span className="text-purple-400 font-mono">
                    {mvs[c.mvKey?.replace('u', 'u')]?.toFixed(1)}%
                  </span>
                </span>
              </div>
              <TrendChart
                data={trendData}
                pvKey={c.pvKey}
                spKey={c.spKey}
                mvKey={c.mvKey}
                title={c.title}
                unit={c.unit}
                yDomain={c.yDomain}
                pvColor={c.pvColor}
                height={220}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
