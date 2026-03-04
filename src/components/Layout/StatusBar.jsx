import { usePlantStore } from '../../store/plantStore';

export default function StatusBar() {
  const cvs = usePlantStore(s => s.cvs);
  const mvs = usePlantStore(s => s.mvs);
  const alarms = usePlantStore(s => s.alarms);
  const activeCount = alarms.filter(a => a.state !== 'CLEARED').length;

  const tags = [
    { tag: 'FT-201', label: 'Permeate Flow', value: cvs.y1.toFixed(2), unit: 'm³/h',  ok: cvs.y1 >= 8 },
    { tag: 'AT-201', label: 'Conductivity',  value: cvs.y2.toFixed(0), unit: 'μS/cm', ok: cvs.y2 <= 600 },
    { tag: 'LT-401', label: 'Tank Level',    value: cvs.y3.toFixed(1), unit: '%',      ok: cvs.y3 >= 20 && cvs.y3 <= 85 },
    { tag: 'pHT-401',label: 'Product pH',    value: cvs.y4.toFixed(2), unit: 'pH',    ok: cvs.y4 >= 6.5 && cvs.y4 <= 8.5 },
    { tag: 'HP-P201', label: 'HP Pump',      value: mvs.u1.toFixed(1), unit: '%',      ok: true },
    { tag: 'VCV-202', label: 'Conc. Valve',  value: mvs.u2.toFixed(1), unit: '%',      ok: true },
  ];

  return (
    <div className="h-8 bg-navy-800 border-t border-cyan-scada/10 flex items-center px-4 gap-6 shrink-0 overflow-x-auto">
      {tags.map(t => (
        <div key={t.tag} className="flex items-center gap-2 shrink-0">
          <span className="font-label text-[11px] text-gray-500">{t.tag}</span>
          <span className={`font-mono text-[11px] font-bold ${t.ok ? 'text-cyan-scada' : 'text-red-400'}`}>
            {t.value} <span className="text-gray-500 font-normal">{t.unit}</span>
          </span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <div className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
        <span className="font-label text-[11px] text-gray-400">
          {activeCount > 0 ? `${activeCount} ACTIVE ALARM${activeCount !== 1 ? 'S' : ''}` : 'ALL NORMAL'}
        </span>
      </div>
    </div>
  );
}
