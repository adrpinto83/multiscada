import { usePlantStore } from '../../store/plantStore';

export default function AlarmBanner() {
  const alarms = usePlantStore(s => s.alarms);
  const acknowledgeAlarm = usePlantStore(s => s.acknowledgeAlarm);
  const acknowledgeAllAlarms = usePlantStore(s => s.acknowledgeAllAlarms);

  const active = alarms.filter(a => a.state === 'ACTIVE');
  const critical = active.filter(a => a.priority === 'CRITICAL');

  if (active.length === 0) return null;

  return (
    <div className={`border-b flex items-center gap-2 px-4 py-1.5 shrink-0 ${
      critical.length > 0
        ? 'bg-red-900/40 border-red-500/60 animate-pulse'
        : 'bg-yellow-900/30 border-yellow-500/40'
    }`}>
      {/* Flashing icon */}
      <svg viewBox="0 0 24 24" className={`w-4 h-4 shrink-0 ${critical.length > 0 ? 'fill-red-400' : 'fill-yellow-400'}`}>
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>

      {/* Alarm ticker */}
      <div className="flex-1 overflow-hidden flex items-center gap-4">
        {active.slice(0, 3).map(a => (
          <div key={a.id} className="flex items-center gap-2 shrink-0">
            <span className={`font-label text-xs font-bold px-1.5 py-0.5 rounded ${
              a.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
              a.priority === 'HIGH'     ? 'bg-red-500/80 text-white' :
                                          'bg-yellow-500/80 text-black'
            }`}>
              {a.priority}
            </span>
            <span className="font-mono text-xs text-gray-200">{a.tag}</span>
            <span className="font-label text-xs text-gray-300">{a.description}</span>
          </div>
        ))}
        {active.length > 3 && (
          <span className="font-mono text-xs text-gray-400 shrink-0">+{active.length - 3} more</span>
        )}
      </div>

      {/* ACK All button */}
      <button
        onClick={acknowledgeAllAlarms}
        className="shrink-0 px-3 py-0.5 text-xs font-label font-bold rounded border border-gray-400/40 text-gray-300 hover:bg-white/10 transition-colors"
      >
        ACK ALL
      </button>
    </div>
  );
}
