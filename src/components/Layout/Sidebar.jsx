import { NavLink } from 'react-router-dom';
import { usePlantStore } from '../../store/plantStore';

const NAV_ITEMS = [
  {
    path: '/overview',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
      </svg>
    ),
  },
  {
    path: '/trends',
    label: 'Trends',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 17l1.5 1.49z"/>
      </svg>
    ),
  },
  {
    path: '/controllers',
    label: 'Controllers',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.36.07-.73.07-1.08 0-.35-.03-.73-.07-1.08l2.32-1.8c.21-.17.27-.46.14-.7l-2.2-3.8c-.13-.23-.41-.3-.64-.23l-2.73 1.1c-.57-.44-1.18-.8-1.85-1.07L14.28 2.1C14.22 1.84 14 1.67 13.73 1.67h-4.4c-.27 0-.49.17-.55.43L8.42 4.46C7.75 4.73 7.14 5.1 6.57 5.53L3.84 4.43c-.23-.07-.51 0-.64.23l-2.2 3.8c-.14.24-.07.53.14.7l2.32 1.8c-.04.35-.07.72-.07 1.07 0 .35.03.73.07 1.08l-2.32 1.8c-.21.17-.27.46-.14.7l2.2 3.8c.13.23.41.3.64.23l2.73-1.1c.57.44 1.18.8 1.85 1.07l.36 2.36c.06.26.28.43.55.43h4.4c.27 0 .49-.17.55-.43l.36-2.36c.67-.27 1.28-.63 1.85-1.07l2.73 1.1c.23.07.51 0 .64-.23l2.2-3.8c.14-.24.07-.53-.14-.7l-2.32-1.8z"/>
      </svg>
    ),
  },
  {
    path: '/alarms',
    label: 'Alarms',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const alarms = usePlantStore(s => s.alarms);
  const cvs = usePlantStore(s => s.cvs);
  const sidebarOpen = usePlantStore(s => s.sidebarOpen);
  const toggleSidebar = usePlantStore(s => s.toggleSidebar);
  const activeAlarmCount = alarms.filter(a => a.state !== 'CLEARED').length;
  const criticalCount = alarms.filter(a => a.priority === 'CRITICAL' && a.state === 'ACTIVE').length;

  const miniIndicators = [
    { label: 'FLOW', value: cvs.y1.toFixed(1), unit: 'm³/h', ok: cvs.y1 >= 8 },
    { label: 'COND', value: cvs.y2.toFixed(0), unit: 'μS',   ok: cvs.y2 <= 600 },
    { label: 'LEVEL', value: cvs.y3.toFixed(1), unit: '%',   ok: cvs.y3 >= 20 && cvs.y3 <= 85 },
    { label: 'pH',   value: cvs.y4.toFixed(2), unit: '',     ok: cvs.y4 >= 6.5 && cvs.y4 <= 8.5 },
  ];

  return (
    <aside className={`${sidebarOpen ? 'w-48' : 'w-14'} transition-all duration-200 bg-navy-800 border-r border-cyan-scada/10 flex flex-col shrink-0 overflow-hidden`}>
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="p-3 flex items-center justify-end hover:bg-white/5 transition-colors"
        title={sidebarOpen ? 'Collapse' : 'Expand'}
      >
        <svg viewBox="0 0 24 24" className={`w-4 h-4 text-gray-400 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all font-label text-sm relative ${
                isActive
                  ? 'bg-cyan-scada/15 text-cyan-scada border border-cyan-scada/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            {item.icon}
            {sidebarOpen && <span className="font-label font-600 tracking-wide whitespace-nowrap">{item.label}</span>}
            {item.label === 'Alarms' && activeAlarmCount > 0 && (
              <span className={`${sidebarOpen ? 'ml-auto' : 'absolute -top-1 -right-1'} min-w-4 h-4 text-xs rounded-full flex items-center justify-center px-1 font-bold ${
                criticalCount > 0 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
              }`}>
                {activeAlarmCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mini PV indicators */}
      {sidebarOpen && (
        <div className="p-2 border-t border-cyan-scada/10">
          <div className="text-xs text-gray-500 font-label mb-1 px-1">PROCESS</div>
          <div className="flex flex-col gap-1">
            {miniIndicators.map(ind => (
              <div key={ind.label} className="flex items-center justify-between px-2 py-1 rounded bg-navy-600/50">
                <span className="font-label text-xs text-gray-400">{ind.label}</span>
                <span className={`font-mono text-xs font-bold ${ind.ok ? 'text-cyan-scada' : 'text-red-400'}`}>
                  {ind.value}{ind.unit && <span className="text-gray-500 font-normal ml-0.5 text-[10px]">{ind.unit}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
