import { useState } from 'react';
import { usePlantStore } from '../store/plantStore';
import AlarmList from '../components/Alarms/AlarmList';

export default function Alarms() {
  const [activeTab, setActiveTab] = useState('active');
  const alarms = usePlantStore(s => s.alarms);
  const alarmHistory = usePlantStore(s => s.alarmHistory);
  const acknowledgeAllAlarms = usePlantStore(s => s.acknowledgeAllAlarms);

  const activeCount = alarms.filter(a => a.state !== 'CLEARED').length;
  const unackedCount = alarms.filter(a => a.state === 'ACTIVE').length;

  const priorityCounts = {
    CRITICAL: alarms.filter(a => a.priority === 'CRITICAL' && a.state !== 'CLEARED').length,
    HIGH:     alarms.filter(a => a.priority === 'HIGH'     && a.state !== 'CLEARED').length,
    MEDIUM:   alarms.filter(a => a.priority === 'MEDIUM'   && a.state !== 'CLEARED').length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-700/50 bg-navy-800/50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-label text-lg font-bold text-white">Alarm Management</h1>
            <p className="font-label text-xs text-gray-400">ISA-18.2 Alarm Management System</p>
          </div>
          {unackedCount > 0 && (
            <button
              onClick={acknowledgeAllAlarms}
              className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-label font-bold text-sm rounded-lg hover:bg-yellow-500/30 transition-colors"
            >
              Acknowledge All ({unackedCount})
            </button>
          )}
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Active', value: activeCount, color: activeCount > 0 ? '#ff4444' : '#22c55e', bg: activeCount > 0 ? 'bg-red-900/20 border-red-500/30' : 'bg-green-900/20 border-green-500/30' },
            { label: 'Unacknowledged', value: unackedCount, color: unackedCount > 0 ? '#ff4444' : '#4b5563', bg: unackedCount > 0 ? 'bg-red-900/20 border-red-500/30' : 'bg-navy-700 border-gray-700/50' },
            { label: 'Critical', value: priorityCounts.CRITICAL, color: priorityCounts.CRITICAL > 0 ? '#ff2222' : '#4b5563', bg: priorityCounts.CRITICAL > 0 ? 'bg-red-900/30 border-red-600/40 animate-pulse' : 'bg-navy-700 border-gray-700/50' },
            { label: 'High', value: priorityCounts.HIGH, color: priorityCounts.HIGH > 0 ? '#ff8800' : '#4b5563', bg: priorityCounts.HIGH > 0 ? 'bg-orange-900/20 border-orange-500/30' : 'bg-navy-700 border-gray-700/50' },
          ].map(tile => (
            <div key={tile.label} className={`rounded-lg border p-3 text-center ${tile.bg}`}>
              <div className="font-mono text-2xl font-bold" style={{ color: tile.color }}>{tile.value}</div>
              <div className="font-label text-xs text-gray-400">{tile.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700/50 shrink-0 bg-navy-800/30">
        {[
          { key: 'active', label: 'Active Alarms', count: activeCount },
          { key: 'history', label: 'Alarm History', count: alarmHistory.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 font-label text-sm font-bold transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'text-cyan-scada border-cyan-scada'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-700 rounded-full text-xs font-mono">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Alarm list */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'active' ? (
          <div className="bg-navy-700 border border-gray-700/50 rounded-xl overflow-hidden">
            <AlarmList showHistory={false} />
          </div>
        ) : (
          <div className="bg-navy-700 border border-gray-700/50 rounded-xl overflow-hidden">
            <AlarmList showHistory={true} />
          </div>
        )}
      </div>

      {/* Alarm definitions reference */}
      <div className="shrink-0 border-t border-gray-700/50 bg-navy-800/50 px-4 py-3">
        <div className="font-label text-xs text-gray-500 mb-2">ALARM SETPOINTS (read-only)</div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-mono text-gray-600">
          <span>FT-201 LL: &lt;8 m³/h (HIGH)</span>
          <span>AT-201 HH: &gt;800 μS/cm (CRITICAL)</span>
          <span>AT-201 H: &gt;600 μS/cm (HIGH)</span>
          <span>LT-401 LL: &lt;20% (HIGH)</span>
          <span>LT-401 HH: &gt;85% (MEDIUM)</span>
          <span>pHT-401 L: &lt;6.5 (HIGH)</span>
          <span>pHT-401 H: &gt;8.5 (MEDIUM)</span>
        </div>
      </div>
    </div>
  );
}
