import { useState } from 'react';
import { useCafeStore } from '../../store/cafeStore';

const ESTILO_PRIORIDAD = {
  'CRÍTICA': 'bg-red-600 text-white',
  'ALTA':    'bg-red-500/80 text-white',
  'MEDIA':   'bg-yellow-500/80 text-black',
  'BAJA':    'bg-green-600/80 text-white',
};
const ESTILO_ESTADO = {
  'ACTIVA':      'text-red-400',
  'RECONOCIDA':  'text-yellow-400',
  'BORRADA':     'text-gray-500',
};

function AlarmList({ mostrarHistorial }) {
  const alarmas = useCafeStore(s => s.alarmas);
  const historial = useCafeStore(s => s.historialAlarmas);
  const reconocer = useCafeStore(s => s.reconocerAlarma);

  const datos = mostrarHistorial ? historial : alarmas;

  if (datos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500">
        <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current mb-2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span className="font-label text-sm">
          {mostrarHistorial ? 'Sin historial de alarmas' : 'Sin alarmas activas'}
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700/50">
            {['Hora', 'Tag', 'Descripción', 'Prioridad', 'Estado', mostrarHistorial ? 'Evento' : 'Acción'].map(h => (
              <th key={h} className="py-2 px-3 font-label text-xs text-gray-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((alarma, idx) => (
            <tr key={`${alarma.id}-${idx}`}
              className={`border-b border-gray-800/50 hover:bg-white/2 ${alarma.estado === 'ACTIVA' ? 'bg-red-900/10' : ''}`}
            >
              <td className="py-2 px-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                {new Date(alarma.timestamp).toLocaleTimeString('es-ES', { hour12: false })}
              </td>
              <td className="py-2 px-3 font-mono text-xs text-amber-400">{alarma.tag}</td>
              <td className="py-2 px-3 font-label text-sm text-gray-200">{alarma.descripcion}</td>
              <td className="py-2 px-3">
                <span className={`text-xs font-bold font-label px-2 py-0.5 rounded ${ESTILO_PRIORIDAD[alarma.prioridad] || 'bg-gray-700 text-gray-300'}`}>
                  {alarma.prioridad}
                </span>
              </td>
              <td className={`py-2 px-3 font-mono text-xs font-bold ${ESTILO_ESTADO[alarma.estado] || 'text-gray-400'}`}>
                {alarma.estado}
              </td>
              <td className="py-2 px-3">
                {!mostrarHistorial && alarma.estado === 'ACTIVA' && (
                  <button
                    onClick={() => reconocer(alarma.id)}
                    className="px-2 py-0.5 text-xs font-label font-bold rounded border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                  >
                    ACK
                  </button>
                )}
                {mostrarHistorial && (
                  <span className={`font-mono text-xs ${alarma.evento === 'ACTIVADA' ? 'text-red-400' : 'text-green-400'}`}>
                    {alarma.evento}
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

export default function CafeAlarmas() {
  const [tabActivo, setTabActivo] = useState('activas');
  const alarmas = useCafeStore(s => s.alarmas);
  const historial = useCafeStore(s => s.historialAlarmas);
  const reconocerTodas = useCafeStore(s => s.reconocerTodasAlarmas);

  const activas = alarmas.filter(a => a.estado !== 'BORRADA').length;
  const sinReconocer = alarmas.filter(a => a.estado === 'ACTIVA').length;

  const contadores = {
    'CRÍTICA': alarmas.filter(a => a.prioridad === 'CRÍTICA' && a.estado !== 'BORRADA').length,
    'ALTA':    alarmas.filter(a => a.prioridad === 'ALTA'    && a.estado !== 'BORRADA').length,
    'MEDIA':   alarmas.filter(a => a.prioridad === 'MEDIA'   && a.estado !== 'BORRADA').length,
  };

  const losetas = [
    { etq: 'Activas',         val: activas,             color: activas > 0 ? '#ff4444' : '#22c55e', bg: activas > 0 ? 'bg-red-900/20 border-red-500/30' : 'bg-green-900/20 border-green-500/30' },
    { etq: 'Sin Reconocer',   val: sinReconocer,        color: sinReconocer > 0 ? '#ff4444' : '#4b5563', bg: sinReconocer > 0 ? 'bg-red-900/20 border-red-500/30' : 'bg-navy-700 border-gray-700/50' },
    { etq: 'Críticas',        val: contadores['CRÍTICA'], color: contadores['CRÍTICA'] > 0 ? '#ff2222' : '#4b5563', bg: contadores['CRÍTICA'] > 0 ? 'bg-red-900/30 border-red-600/40 animate-pulse' : 'bg-navy-700 border-gray-700/50' },
    { etq: 'Alta Prioridad',  val: contadores['ALTA'],    color: contadores['ALTA'] > 0 ? '#ff8800' : '#4b5563', bg: contadores['ALTA'] > 0 ? 'bg-orange-900/20 border-orange-500/30' : 'bg-navy-700 border-gray-700/50' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-700/50 bg-navy-800/50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-label text-lg font-bold text-white">Gestión de Alarmas — Planta Café</h1>
            <p className="font-label text-xs text-gray-400">Sistema de Alarmas ISA-18.2</p>
          </div>
          {sinReconocer > 0 && (
            <button onClick={reconocerTodas}
              className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-label font-bold text-sm rounded-lg hover:bg-yellow-500/30 transition-colors">
              Reconocer Todas ({sinReconocer})
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {losetas.map(l => (
            <div key={l.etq} className={`rounded-lg border p-3 text-center ${l.bg}`}>
              <div className="font-mono text-2xl font-bold" style={{ color: l.color }}>{l.val}</div>
              <div className="font-label text-xs text-gray-400">{l.etq}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex border-b border-gray-700/50 shrink-0 bg-navy-800/30">
        {[
          { key: 'activas',   etq: 'Alarmas Activas', cnt: activas },
          { key: 'historial', etq: 'Historial',        cnt: historial.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setTabActivo(tab.key)}
            className={`px-6 py-3 font-label text-sm font-bold transition-colors border-b-2 ${
              tabActivo === tab.key ? 'text-amber-400 border-amber-400' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}>
            {tab.etq}
            {tab.cnt > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-700 rounded-full text-xs font-mono">{tab.cnt}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-navy-700 border border-gray-700/50 rounded-xl overflow-hidden">
          <AlarmList mostrarHistorial={tabActivo === 'historial'} />
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-700/50 bg-navy-800/50 px-4 py-2">
        <div className="font-label text-xs text-gray-500 mb-1">LÍMITES DE ALARMA (solo lectura)</div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-mono text-gray-600">
          <span>TT-001-HH: &gt;240°C (CRÍTICA)</span>
          <span>TT-002-HH: &gt;220°C gases (CRÍTICA)</span>
          <span>TT-001-L: &lt;160°C (ALTA)</span>
          <span>MT-001-HH: &gt;6% humid (ALTA)</span>
          <span>CT-001-LL: &lt;35 Agtron (ALTA)</span>
          <span>CT-001-HH: &gt;80 Agtron (MEDIA)</span>
          <span>TT-002-H: &gt;200°C gases (MEDIA)</span>
          <span>MT-001-H: &gt;5% humid (MEDIA)</span>
          <span>ET-002-H: &gt;1200 kcal/kg (MEDIA)</span>
        </div>
      </div>
    </div>
  );
}
