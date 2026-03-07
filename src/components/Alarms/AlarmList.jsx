import { usePlantStore } from '../../store/plantStore';

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

export default function AlarmList({ mostrarHistorial = false }) {
  const alarmas = usePlantStore(s => s.alarmas);
  const historial = usePlantStore(s => s.historialAlarmas);
  const reconocer = usePlantStore(s => s.reconocerAlarma);

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
              <td className="py-2 px-3 font-mono text-xs text-cyan-scada">{alarma.tag}</td>
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
