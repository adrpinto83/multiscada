import { usePlantStore } from '../../store/plantStore';

export default function Navbar() {
  const alarms = usePlantStore(s => s.alarms);
  const criticalCount = alarms.filter(a => a.priority === 'CRITICAL' && a.state !== 'ACK').length;
  const activeCount = alarms.filter(a => a.state === 'ACTIVE' || a.state === 'ACK').length;
  const simTime = usePlantStore(s => s.simTime);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  return (
    <nav className="h-12 bg-navy-700 border-b border-cyan-scada/20 flex items-center justify-between px-4 z-50 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-cyan-scada/20 border border-cyan-scada/40 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-cyan-scada">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div>
          <span className="font-label font-700 text-white text-sm tracking-wider">RO SCADA</span>
          <span className="font-label text-gray-400 text-xs ml-2">Two-Pass Desalination Plant</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Sim time */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs text-gray-400">SIM {formatTime(simTime)}</span>
        </div>

        {/* Alarm indicator */}
        {activeCount > 0 && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded border ${
            criticalCount > 0 ? 'border-red-500 bg-red-500/10 animate-pulse' : 'border-yellow-500 bg-yellow-500/10'
          }`}>
            <svg viewBox="0 0 24 24" className={`w-4 h-4 ${criticalCount > 0 ? 'fill-red-400' : 'fill-yellow-400'}`}>
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <span className={`font-mono text-xs font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-yellow-400'}`}>
              {activeCount} ALARM{activeCount !== 1 ? 'S' : ''}
            </span>
          </div>
        )}

        {/* Date/time */}
        <span className="font-mono text-xs text-gray-500">
          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </nav>
  );
}
