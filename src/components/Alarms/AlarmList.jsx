import { usePlantStore } from '../../store/plantStore';

const PRIORITY_STYLES = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH:     'bg-red-500/80 text-white',
  MEDIUM:   'bg-yellow-500/80 text-black',
  LOW:      'bg-green-600/80 text-white',
};

const STATE_STYLES = {
  ACTIVE:  'text-red-400',
  ACK:     'text-yellow-400',
  CLEARED: 'text-gray-500',
};

export default function AlarmList({ showHistory = false }) {
  const alarms = usePlantStore(s => s.alarms);
  const alarmHistory = usePlantStore(s => s.alarmHistory);
  const acknowledgeAlarm = usePlantStore(s => s.acknowledgeAlarm);

  const data = showHistory ? alarmHistory : alarms;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500">
        <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current mb-2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span className="font-label text-sm">No {showHistory ? 'alarm history' : 'active alarms'}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700/50">
            {['Time', 'Tag', 'Description', 'Priority', 'State', showHistory ? 'Event' : 'Action'].map(h => (
              <th key={h} className="py-2 px-3 font-label text-xs text-gray-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((alarm, idx) => (
            <tr
              key={`${alarm.id}-${idx}`}
              className={`border-b border-gray-800/50 hover:bg-white/2 ${
                alarm.state === 'ACTIVE' ? 'bg-red-900/10' : ''
              }`}
            >
              <td className="py-2 px-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                {new Date(alarm.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
              </td>
              <td className="py-2 px-3 font-mono text-xs text-cyan-scada">{alarm.tag}</td>
              <td className="py-2 px-3 font-label text-sm text-gray-200">{alarm.description}</td>
              <td className="py-2 px-3">
                <span className={`text-xs font-bold font-label px-2 py-0.5 rounded ${PRIORITY_STYLES[alarm.priority]}`}>
                  {alarm.priority}
                </span>
              </td>
              <td className={`py-2 px-3 font-mono text-xs font-bold ${STATE_STYLES[alarm.state] || 'text-gray-400'}`}>
                {alarm.state}
              </td>
              <td className="py-2 px-3">
                {!showHistory && alarm.state === 'ACTIVE' && (
                  <button
                    onClick={() => acknowledgeAlarm(alarm.id)}
                    className="px-2 py-0.5 text-xs font-label font-bold rounded border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                  >
                    ACK
                  </button>
                )}
                {showHistory && (
                  <span className={`font-mono text-xs ${alarm.event === 'RAISED' ? 'text-red-400' : 'text-green-400'}`}>
                    {alarm.event}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
