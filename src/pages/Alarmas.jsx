import { useState } from 'react';
import { usePlantStore } from '../store/plantStore';
import AlarmList from '../components/Alarms/AlarmList';

export default function Alarmas() {
  const [tabActivo, setTabActivo] = useState('activas');
  const alarmas = usePlantStore(s => s.alarmas);
  const historial = usePlantStore(s => s.historialAlarmas);
  const reconocerTodas = usePlantStore(s => s.reconocerTodasAlarmas);

  const activas = alarmas.filter(a => a.estado !== 'BORRADA').length;
  const sinReconocer = alarmas.filter(a => a.estado === 'ACTIVA').length;

  const contadores = {
    'CRÍTICA': alarmas.filter(a => a.prioridad === 'CRÍTICA' && a.estado !== 'BORRADA').length,
    'ALTA':    alarmas.filter(a => a.prioridad === 'ALTA'    && a.estado !== 'BORRADA').length,
    'MEDIA':   alarmas.filter(a => a.prioridad === 'MEDIA'   && a.estado !== 'BORRADA').length,
  };

  const losetas = [
    { etq: 'Activas',         val: activas,     color: activas > 0 ? '#ff4444' : '#22c55e', bg: activas > 0 ? 'bg-red-900/20 border-red-500/30' : 'bg-green-900/20 border-green-500/30' },
    { etq: 'Sin Reconocer',   val: sinReconocer, color: sinReconocer > 0 ? '#ff4444' : '#4b5563', bg: sinReconocer > 0 ? 'bg-red-900/20 border-red-500/30' : 'bg-navy-700 border-gray-700/50' },
    { etq: 'Críticas',        val: contadores['CRÍTICA'], color: contadores['CRÍTICA'] > 0 ? '#ff2222' : '#4b5563', bg: contadores['CRÍTICA'] > 0 ? 'bg-red-900/30 border-red-600/40 animate-pulse' : 'bg-navy-700 border-gray-700/50' },
    { etq: 'Alta Prioridad',  val: contadores['ALTA'],    color: contadores['ALTA']    > 0 ? '#ff8800' : '#4b5563', bg: contadores['ALTA']    > 0 ? 'bg-orange-900/20 border-orange-500/30' : 'bg-navy-700 border-gray-700/50' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Cabecera */}
      <div className="px-6 py-3 border-b border-gray-700/50 bg-navy-800/50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-label text-lg font-bold text-white">Gestión de Alarmas</h1>
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

      {/* Tabs */}
      <div className="flex border-b border-gray-700/50 shrink-0 bg-navy-800/30">
        {[
          { key: 'activas',  etq: 'Alarmas Activas', cnt: activas },
          { key: 'historial', etq: 'Historial', cnt: historial.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setTabActivo(tab.key)}
            className={`px-6 py-3 font-label text-sm font-bold transition-colors border-b-2 ${
              tabActivo === tab.key ? 'text-cyan-scada border-cyan-scada' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}>
            {tab.etq}
            {tab.cnt > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-700 rounded-full text-xs font-mono">{tab.cnt}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-navy-700 border border-gray-700/50 rounded-xl overflow-hidden">
          <AlarmList mostrarHistorial={tabActivo === 'historial'} />
        </div>
      </div>

      {/* Referencia de límites */}
      <div className="shrink-0 border-t border-gray-700/50 bg-navy-800/50 px-4 py-2">
        <div className="font-label text-xs text-gray-500 mb-1">LÍMITES DE ALARMA (solo lectura)</div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-mono text-gray-600">
          <span>FT-201 LL: &lt;8 m³/h (ALTA)</span>
          <span>AT-201 HH: &gt;800 μS/cm (CRÍTICA)</span>
          <span>AT-201 H: &gt;600 μS/cm (ALTA)</span>
          <span>LT-401 LL: &lt;20% (ALTA)</span>
          <span>LT-401 HH: &gt;85% (MEDIA)</span>
          <span>pHT-401 L: &lt;6.5 pH (ALTA)</span>
          <span>pHT-401 H: &gt;8.5 pH (MEDIA)</span>
          <span>PT-201 H: &gt;12 bar ΔP (ALTA)</span>
        </div>
      </div>
    </div>
  );
}
