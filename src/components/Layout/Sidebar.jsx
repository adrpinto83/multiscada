import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { usePlantStore } from '../../store/plantStore';
import { useCafeStore } from '../../store/cafeStore';

const NAV_RO = [
  {
    path: '/ro/visgeneral',
    etiqueta: 'Vista General',
    icono: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  },
  {
    path: '/ro/tendencias',
    etiqueta: 'Tendencias',
    icono: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 17z"/></svg>,
  },
  {
    path: '/ro/controladores',
    etiqueta: 'Controladores',
    icono: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.36.07-.73.07-1.08 0-.35-.03-.73-.07-1.08l2.32-1.8c.21-.17.27-.46.14-.7l-2.2-3.8c-.13-.23-.41-.3-.64-.23l-2.73 1.1c-.57-.44-1.18-.8-1.85-1.07L14.28 2.1C14.22 1.84 14 1.67 13.73 1.67h-4.4c-.27 0-.49.17-.55.43L8.42 4.46C7.75 4.73 7.14 5.1 6.57 5.53L3.84 4.43c-.23-.07-.51 0-.64.23l-2.2 3.8c-.14.24-.07.53.14.7l2.32 1.8c-.04.35-.07.72-.07 1.07 0 .35.03.73.07 1.08l-2.32 1.8c-.21.17-.27.46-.14.7l2.2 3.8c.13.23.41.3.64.23l2.73-1.1c.57.44 1.18.8 1.85 1.07l.36 2.36c.06.26.28.43.55.43h4.4c.27 0 .49-.17.55-.43l.36-2.36c.67-.27 1.28-.63 1.85-1.07l2.73 1.1c.23.07.51 0 .64-.23l2.2-3.8c.14-.24.07-.53-.14-.7z"/></svg>,
  },
  {
    path: '/ro/emulacion',
    etiqueta: 'Emulación',
    icono: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>,
  },
  {
    path: '/ro/alarmas',
    etiqueta: 'Alarmas',
    icono: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>,
  },
];

const NAV_CAFE = [
  {
    path: '/cafe/visgeneral',
    etiqueta: 'Vista General',
    icono: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  },
  {
    path: '/cafe/tendencias',
    etiqueta: 'Tendencias',
    icono: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 17z"/></svg>,
  },
  {
    path: '/cafe/controladores',
    etiqueta: 'Controladores',
    icono: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.36.07-.73.07-1.08 0-.35-.03-.73-.07-1.08l2.32-1.8c.21-.17.27-.46.14-.7l-2.2-3.8c-.13-.23-.41-.3-.64-.23l-2.73 1.1c-.57-.44-1.18-.8-1.85-1.07L14.28 2.1C14.22 1.84 14 1.67 13.73 1.67h-4.4c-.27 0-.49.17-.55.43L8.42 4.46C7.75 4.73 7.14 5.1 6.57 5.53L3.84 4.43c-.23-.07-.51 0-.64.23l-2.2 3.8c-.14.24-.07.53.14.7l2.32 1.8c-.04.35-.07.72-.07 1.07 0 .35.03.73.07 1.08l-2.32 1.8c-.21.17-.27.46-.14.7l2.2 3.8c.13.23.41.3.64.23l2.73-1.1c.57.44 1.18.8 1.85 1.07l.36 2.36c.06.26.28.43.55.43h4.4c.27 0 .49-.17.55-.43l.36-2.36c.67-.27 1.28-.63 1.85-1.07l2.73 1.1c.23.07.51 0 .64-.23l2.2-3.8c.14-.24.07-.53-.14-.7z"/></svg>,
  },
  {
    path: '/cafe/emulacion',
    etiqueta: 'Emulación',
    icono: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>,
  },
  {
    path: '/cafe/alarmas',
    etiqueta: 'Alarmas',
    icono: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCafe = location.pathname.startsWith('/cafe');
  const nav = isCafe ? NAV_CAFE : NAV_RO;
  const accentColor = isCafe ? 'amber' : 'cyan-scada';

  // RO store
  const roAlarmas = usePlantStore(s => s.alarmas);
  const roCvs = usePlantStore(s => s.cvs);
  const roCalc = usePlantStore(s => s.calculadas);
  const roSidebarAbierto = usePlantStore(s => s.sidebarAbierto);
  const roToggle = usePlantStore(s => s.toggleSidebar);
  const roEmulacion = usePlantStore(s => s.emulacion);

  // Café store
  const cafeAlarmas = useCafeStore(s => s.alarmas);
  const cafeCvs = useCafeStore(s => s.cvs);
  const cafeCalc = useCafeStore(s => s.calculadas);
  const cafeSidebarAbierto = useCafeStore(s => s.sidebarAbierto);
  const cafeToggle = useCafeStore(s => s.toggleSidebar);
  const cafeEmulacion = useCafeStore(s => s.emulacion);

  const alarmas = isCafe ? cafeAlarmas : roAlarmas;
  const emulacion = isCafe ? cafeEmulacion : roEmulacion;
  const sidebarAbierto = isCafe ? cafeSidebarAbierto : roSidebarAbierto;
  const toggleSidebar = isCafe ? cafeToggle : roToggle;

  const alarmasActivas = alarmas.filter(a => a.estado !== 'BORRADA').length;
  const criticas = alarmas.filter(a => a.prioridad === 'CRÍTICA' && a.estado === 'ACTIVA').length;
  const emuActivas = Object.values(emulacion).filter(e => e.activa).length;

  // Mini indicadores según proceso activo
  const indicadores = isCafe ? [
    { etq: 'T TAMB',  valor: cafeCvs.y1.toFixed(0),  unidad: '°C',   ok: cafeCvs.y1 >= 160 && cafeCvs.y1 <= 240, emu: cafeEmulacion.y1?.activa },
    { etq: 'HUMID',   valor: cafeCvs.y2.toFixed(2),  unidad: '%',    ok: cafeCvs.y2 <= 5, emu: cafeEmulacion.y2?.activa },
    { etq: 'T GAS',   valor: cafeCvs.y3.toFixed(0),  unidad: '°C',   ok: cafeCvs.y3 <= 200, emu: cafeEmulacion.y3?.activa },
    { etq: 'COLOR',   valor: cafeCvs.y4.toFixed(0),  unidad: 'Ag',   ok: cafeCvs.y4 >= 35 && cafeCvs.y4 <= 80, emu: cafeEmulacion.y4?.activa },
    { etq: 'GRADO',   valor: cafeCalc.gradoTostado,  unidad: '',     ok: cafeCalc.gradoTostado !== 'QUEMADO', emu: false },
  ] : [
    { etq: 'FLUJO',  valor: roCvs.y1.toFixed(1),  unidad: 'm³/h', ok: roCvs.y1 >= 8, emu: roEmulacion.y1?.activa },
    { etq: 'COND',   valor: roCvs.y2.toFixed(0),  unidad: 'μS',   ok: roCvs.y2 <= 600, emu: roEmulacion.y2?.activa },
    { etq: 'NIVEL',  valor: roCvs.y3.toFixed(1),  unidad: '%',    ok: roCvs.y3 >= 20 && roCvs.y3 <= 85, emu: roEmulacion.y3?.activa },
    { etq: 'pH',     valor: roCvs.y4.toFixed(2),  unidad: '',     ok: roCvs.y4 >= 6.5 && roCvs.y4 <= 8.5, emu: roEmulacion.y4?.activa },
    { etq: 'RR',     valor: roCalc.ratioRecuperacion.toFixed(1), unidad: '%', ok: true, emu: false },
  ];

  const activeLinkClass = isCafe
    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
    : 'bg-cyan-scada/15 text-cyan-scada border border-cyan-scada/30';
  const inactiveLinkClass = 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent';

  return (
    <aside className={`${sidebarAbierto ? 'w-48' : 'w-14'} transition-all duration-200 bg-navy-800 border-r border-cyan-scada/10 flex flex-col shrink-0 overflow-hidden`}>
      {/* Toggle */}
      <button onClick={toggleSidebar} className="p-3 flex items-center justify-end hover:bg-white/5 transition-colors">
        <svg viewBox="0 0 24 24" className={`w-4 h-4 text-gray-400 transition-transform ${sidebarAbierto ? '' : 'rotate-180'}`} fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>

      {/* Cambiar planta */}
      {sidebarAbierto && (
        <div className="px-2 pb-1">
          <button onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-label text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors border border-gray-700/50">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Cambiar Planta
          </button>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {nav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all font-label text-sm relative ${
                isActive ? activeLinkClass : inactiveLinkClass
              }`
            }
          >
            {item.icono}
            {sidebarAbierto && <span className="font-label font-semibold tracking-wide whitespace-nowrap">{item.etiqueta}</span>}

            {/* Badge alarmas */}
            {item.etiqueta === 'Alarmas' && alarmasActivas > 0 && (
              <span className={`${sidebarAbierto ? 'ml-auto' : 'absolute -top-1 -right-1'} min-w-4 h-4 text-xs rounded-full flex items-center justify-center px-1 font-bold ${
                criticas > 0 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
              }`}>{alarmasActivas}</span>
            )}
            {/* Badge emulación */}
            {item.etiqueta === 'Emulación' && emuActivas > 0 && (
              <span className={`${sidebarAbierto ? 'ml-auto' : 'absolute -top-1 -right-1'} min-w-4 h-4 text-xs rounded-full flex items-center justify-center px-1 font-bold bg-purple-500 text-white`}>
                {emuActivas}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mini indicadores de proceso */}
      {sidebarAbierto && (
        <div className="p-2 border-t border-cyan-scada/10">
          <div className="text-xs text-gray-500 font-label mb-1 px-1">PROCESO</div>
          <div className="flex flex-col gap-1">
            {indicadores.map(ind => (
              <div key={ind.etq} className="flex items-center justify-between px-2 py-1 rounded bg-navy-600/50">
                <div className="flex items-center gap-1">
                  {ind.emu && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" title="Emulado" />}
                  <span className="font-label text-xs text-gray-400">{ind.etq}</span>
                </div>
                <span className={`font-mono text-xs font-bold ${
                  ind.emu ? 'text-purple-400' :
                  ind.ok ? (isCafe ? 'text-amber-400' : 'text-cyan-scada') : 'text-red-400'
                }`}>
                  {ind.valor}{ind.unidad && <span className="text-gray-500 font-normal ml-0.5 text-[10px]">{ind.unidad}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
