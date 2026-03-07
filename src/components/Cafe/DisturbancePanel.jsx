import { useState } from 'react';
import { useCafeStore } from '../../store/cafeStore';
import { calcularRGACafe } from '../../engine/cafeProcessModel';

const rgaMatrix = calcularRGACafe();

function PanelRGA() {
  if (!rgaMatrix) return <div className="text-xs text-gray-500">RGA no disponible</div>;
  const etqCV = ['y1 TambTemp', 'y2 Humid', 'y3 GasTemp', 'y4 Color'];
  const etqMV = ['u1 Quem', 'u2 Tambor', 'u3 Aire', 'u4 Enfr'];
  return (
    <div className="overflow-x-auto">
      <div className="text-xs font-label text-gray-400 mb-1 font-bold">Matriz RGA — Método de Bristol</div>
      <table className="text-xs font-mono border-collapse">
        <thead>
          <tr>
            <th className="px-1 py-0.5 text-gray-600 text-right text-[10px]"></th>
            {etqMV.map(l => <th key={l} className="px-2 py-0.5 text-gray-500 text-center text-[9px]">{l}</th>)}
          </tr>
        </thead>
        <tbody>
          {rgaMatrix.map((fila, i) => (
            <tr key={i}>
              <td className="px-1 py-0.5 text-gray-500 text-right text-[9px]">{etqCV[i]}</td>
              {fila.map((val, j) => {
                const esDiag = i === j;
                const esBueno = Math.abs(val - 1) < 0.3;
                const color = esDiag && esBueno ? '#00d4ff' : esDiag ? '#fbbf24' : '#4b5563';
                return (
                  <td key={j} className="px-2 py-0.5 text-center text-[10px]"
                    style={{ color, fontWeight: esDiag ? 'bold' : 'normal' }}>
                    {val.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-[9px] text-gray-600 mt-1">Diagonal ≈ 1.0 → emparejamiento favorable (cian). Lejos de 1.0 → riesgo de interacción (amarillo).</div>
    </div>
  );
}

export default function DisturbancePanel() {
  const perturbaciones = useCafeStore(s => s.perturbaciones);
  const pendientes = useCafeStore(s => s.perturbacionesPendientes);
  const setPendiente = useCafeStore(s => s.setPerturbacionPendiente);
  const aplicar = useCafeStore(s => s.aplicarPerturbacion);
  const restablecer = useCafeStore(s => s.restablecerPerturbaciones);
  const panelAbierto = useCafeStore(s => s.panelPerturbacionAbierto);
  const toggle = useCafeStore(s => s.togglePanelPerturbacion);
  const calculadas = useCafeStore(s => s.calculadas);

  const [mostrarRGA, setMostrarRGA] = useState(false);

  const perturbacionActiva = perturbaciones.d1 !== 11 || perturbaciones.d2 !== 20;

  const COLORES_GRADO = {
    VERDE: '#22c55e', LIGERO: '#a3e635', MEDIO: '#f59e0b', OSCURO: '#b45309', QUEMADO: '#7f1d1d',
  };

  return (
    <div className="bg-navy-800 border-t border-amber-700/30 shrink-0">
      {/* Toggle cabecera */}
      <button onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/3 transition-colors">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-amber-500">
            <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.81 6-4.72 7.28L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95zM11 2.05C5.95 2.55 2 6.82 2 12c0 3.76 2.09 7.07 5.22 8.78L6 22h5V2.05z"/>
          </svg>
          <span className="font-label text-sm font-bold text-white">Perturbaciones &amp; Análisis</span>
          {perturbacionActiva && (
            <span className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-label px-2 py-0.5 rounded">ACTIVA</span>
          )}
          {/* Variables calculadas resumen */}
          <div className="flex items-center gap-3 ml-2">
            <span className="font-mono text-xs text-gray-500">
              Tasa: <span className="text-amber-400">{calculadas.tasaCalentamiento.toFixed(1)}°C/min</span>
            </span>
            <span className="font-mono text-xs text-gray-500">
              Energía: <span className={calculadas.consumoEnergia > 1200 ? 'text-red-400' : 'text-green-400'}>
                {calculadas.consumoEnergia.toFixed(0)} kcal/kg
              </span>
            </span>
            <span className="font-mono text-xs text-gray-500">
              Grado: <span style={{ color: COLORES_GRADO[calculadas.gradoTostado] || '#fff' }}>{calculadas.gradoTostado}</span>
            </span>
          </div>
        </div>
        <svg viewBox="0 0 24 24" className={`w-4 h-4 fill-gray-400 transition-transform ${panelAbierto ? 'rotate-180' : ''}`}>
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {panelAbierto && (
        <div className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Humedad grano verde */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-label text-sm text-gray-300">Humedad Grano Verde</label>
                <span className="font-mono text-sm text-amber-400 font-bold">{pendientes.d1.toFixed(1)} g/kg</span>
              </div>
              <input type="range" min={8} max={14} step={0.1} value={pendientes.d1}
                onChange={e => setPendiente(+e.target.value, pendientes.d2)}
                className="w-full h-2 accent-amber-500 cursor-pointer" />
              <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                <span>8 g/kg</span><span className="text-gray-500">nominal: 11</span><span>14 g/kg</span>
              </div>
              <div className="text-xs text-gray-500 font-label">
                Activa: <span className="text-yellow-400 font-mono">{perturbaciones.d1.toFixed(1)} g/kg</span>
              </div>
            </div>

            {/* Temperatura ambiente */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-label text-sm text-gray-300">Temperatura Ambiente</label>
                <span className="font-mono text-sm text-amber-400 font-bold">{pendientes.d2.toFixed(1)} °C</span>
              </div>
              <input type="range" min={10} max={35} step={0.5} value={pendientes.d2}
                onChange={e => setPendiente(pendientes.d1, +e.target.value)}
                className="w-full h-2 accent-amber-500 cursor-pointer" />
              <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                <span>10°C</span><span className="text-gray-500">nominal: 20</span><span>35°C</span>
              </div>
              <div className="text-xs text-gray-500 font-label">
                Activa: <span className="text-yellow-400 font-mono">{perturbaciones.d2.toFixed(1)} °C</span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col justify-center gap-2">
              <button onClick={aplicar}
                className="py-2 px-4 bg-amber-500/20 border border-amber-500/50 text-amber-400 font-label font-bold text-sm rounded-lg hover:bg-amber-500/30 transition-colors">
                Aplicar Perturbación Escalón
              </button>
              <button onClick={restablecer}
                className="py-2 px-4 bg-gray-700/50 border border-gray-600/50 text-gray-300 font-label text-sm rounded-lg hover:bg-gray-700 transition-colors">
                Restablecer Nominal
              </button>
              <button onClick={() => setMostrarRGA(!mostrarRGA)}
                className="py-1 px-3 text-xs font-label text-gray-400 border border-gray-700 rounded-lg hover:text-gray-200 hover:border-gray-500 transition-colors">
                {mostrarRGA ? 'Ocultar' : 'Mostrar'} RGA
              </button>
            </div>
          </div>

          {/* Factor de desarrollo */}
          <div className="mt-3 p-3 bg-navy-900/40 rounded-lg border border-gray-700/50 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1">
              <span className="font-label text-xs text-gray-400">Factor de Desarrollo:</span>
              <div className="flex-1 h-3 bg-navy-800 rounded-full overflow-hidden max-w-48">
                <div className={`h-full rounded-full transition-all duration-500`}
                  style={{
                    width: `${calculadas.factorDesarrollo}%`,
                    backgroundColor: COLORES_GRADO[calculadas.gradoTostado] || '#f59e0b',
                  }} />
              </div>
              <span className="font-mono text-sm font-bold" style={{ color: COLORES_GRADO[calculadas.gradoTostado] || '#f59e0b' }}>
                {calculadas.factorDesarrollo.toFixed(1)}%
              </span>
            </div>
            <div className="flex gap-3 text-xs font-mono text-gray-500">
              <span>Grado: <span className="font-bold" style={{ color: COLORES_GRADO[calculadas.gradoTostado] }}>{calculadas.gradoTostado}</span></span>
              <span>Tasa: <span className="text-white">{calculadas.tasaCalentamiento.toFixed(1)} °C/min</span></span>
              <span>Energía: <span className={calculadas.consumoEnergia > 1200 ? 'text-red-400' : 'text-white'}>{calculadas.consumoEnergia.toFixed(0)} kcal/kg</span></span>
            </div>
          </div>

          {mostrarRGA && (
            <div className="mt-3 p-3 bg-navy-900/50 rounded-lg border border-gray-700/50">
              <PanelRGA />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
