import { useState } from 'react';
import { useCafeStore } from '../../store/cafeStore';
import { obtenerRecetasDisponibles, obtenerRecetaPorId } from '../../data/cafeRecipes';

const COLORES_FASE = {
  configuracion: '#6b7280',
  precalentamiento: '#f59e0b',
  tostado: '#f97316',
  enfriamiento: '#38bdf8',
  completado: '#22c55e',
  emergencia: '#ff0000',
};

const ETIQUETAS_FASE = {
  configuracion: 'Config',
  precalentamiento: 'Precalentamiento',
  tostado: 'Tostado',
  enfriamiento: 'Enfriamiento',
  completado: 'Completado',
};

export default function BatchConfigPanel() {
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [mostrarRGA, setMostrarRGA] = useState(false);

  // State del store - Suscripción única para evitar problemas de re-renderización
  const {
    lote,
    configuracionLotePendiente,
    setConfiguracionLote,
    iniciarLote,
    detenerLote,
    resetearLote,
    pausarLote,
    reanudarLote,
    paradasEmergencia,
    resetearEmergencia,
    aplicarParametrosReceta,
  } = useCafeStore(s => ({
    lote: s.lote,
    configuracionLotePendiente: s.configuracionLotePendiente,
    setConfiguracionLote: s.setConfiguracionLote,
    iniciarLote: s.iniciarLote,
    detenerLote: s.detenerLote,
    resetearLote: s.resetearLote,
    pausarLote: s.pausarLote,
    reanudarLote: s.reanudarLote,
    paradasEmergencia: s.paradasEmergencia,
    resetearEmergencia: s.resetearEmergencia,
    aplicarParametrosReceta: s.aplicarParametrosReceta,
  }));

  const recetas = obtenerRecetasDisponibles();
  const recetaActual = obtenerRecetaPorId(lote.activo ? lote.recetaId : configuracionLotePendiente.recetaId);

  // Debug logging
  console.log('BatchConfigPanel - lote state:', {
    activo: lote.activo,
    pausado: lote.pausado,
    emergenciaActiva: lote.emergenciaActiva,
    fase: lote.fase,
  });

  const manejarSeleccionReceta = (recetaId) => {
    if (!lote.activo) {
      setConfiguracionLote(recetaId, configuracionLotePendiente.pesoObjetivo);
    }
  };

  const manejarCambioPeso = (valor) => {
    const peso = Math.max(10, Math.min(500, valor));
    if (!lote.activo) {
      setConfiguracionLote(configuracionLotePendiente.recetaId, peso);
    }
  };

  const manejarInputPeso = (e) => {
    const valor = parseInt(e.target.value, 10);
    if (!isNaN(valor)) {
      manejarCambioPeso(valor);
    }
  };

  return (
    <div className="bg-navy-800 border-t border-amber-700/30 shrink-0">
      {/* Cabecera colapsable */}
      <button
        onClick={() => setPanelAbierto(!panelAbierto)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-cyan-500">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span className="font-label text-sm font-bold text-white">Configuración Lote / Receta</span>

          {lote.activo && (
            <>
              <span
                className="ml-2 text-xs font-mono font-bold px-2 py-1 rounded"
                style={{ backgroundColor: `${COLORES_FASE[lote.fase]}20`, color: COLORES_FASE[lote.fase] }}
              >
                {lote.numeroLote}
              </span>
              <span
                className={`text-xs font-label px-2 py-1 rounded ${lote.pausado ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: `${COLORES_FASE[lote.fase]}20`, color: COLORES_FASE[lote.fase] }}
              >
                {ETIQUETAS_FASE[lote.fase]} {lote.pausado && '(PAUSADO)'}
              </span>
              {lote.emergenciaActiva && (
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-red-600/40 text-red-400 animate-pulse">
                  🛑 EMERGENCIA
                </span>
              )}
            </>
          )}

          {!lote.activo && recetaActual && (
            <div className="flex items-center gap-3 ml-2">
              <span
                className="text-xs font-label px-2 py-1 rounded"
                style={{ backgroundColor: `${recetaActual.color}20`, color: recetaActual.color }}
              >
                {recetaActual.nombre}
              </span>
              <span className="text-xs font-mono text-gray-500">
                {configuracionLotePendiente.pesoObjetivo} kg
              </span>
            </div>
          )}
        </div>

        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 fill-gray-400 transition-transform ${panelAbierto ? 'rotate-180' : ''}`}
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {panelAbierto && (
        <div className="px-4 pb-4 pt-3">
          <div className="grid grid-cols-3 gap-4">
            {/* COLUMNA 1: Selector de Recetas */}
            <div className="space-y-2">
              <h3 className="font-label text-xs text-gray-400 uppercase tracking-wider font-bold">Recetas</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {recetas.map(receta => (
                  <button
                    key={receta.id}
                    onClick={() => manejarSeleccionReceta(receta.id)}
                    disabled={lote.activo}
                    className={`w-full text-left p-2 rounded-lg transition-all ${
                      (lote.activo ? lote.recetaId : configuracionLotePendiente.recetaId) === receta.id
                        ? 'border-2'
                        : 'border border-gray-700/30'
                    } ${lote.activo ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}`}
                    style={{
                      borderColor:
                        (lote.activo ? lote.recetaId : configuracionLotePendiente.recetaId) === receta.id ? receta.color : undefined,
                      backgroundColor:
                        (lote.activo ? lote.recetaId : configuracionLotePendiente.recetaId) === receta.id
                          ? `${receta.color}15`
                          : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border-2"
                        style={{
                          borderColor: receta.color,
                          backgroundColor:
                            (lote.activo ? lote.recetaId : configuracionLotePendiente.recetaId) === receta.id
                              ? receta.color
                              : 'transparent',
                        }}
                      />
                      <span className="font-label text-sm font-bold" style={{ color: receta.color }}>
                        {receta.nombre}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-label ml-5 mt-1">{receta.descripcion}</div>
                    <div className="text-xs text-gray-600 font-mono ml-5 mt-0.5">
                      {receta.temp}°C • Ag {receta.agtron}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* COLUMNA 2: Parámetros y Progreso */}
            <div className="space-y-3">
              <h3 className="font-label text-xs text-gray-400 uppercase tracking-wider font-bold">Parámetros</h3>

              {recetaActual && (
                <div className="bg-navy-700/30 rounded-lg p-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">T Tambor:</span>
                      <span className="font-mono font-bold text-amber-400">{recetaActual.setpoints.y1}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">T Gases:</span>
                      <span className="font-mono font-bold text-pink-400">{recetaActual.setpoints.y3}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Humedad:</span>
                      <span className="font-mono font-bold text-green-400">{recetaActual.setpoints.y2}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Color Ag:</span>
                      <span className="font-mono font-bold text-yellow-400">{recetaActual.setpoints.y4}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duración:</span>
                      <span className="font-mono font-bold text-cyan-400">{recetaActual.duracionEstimada} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Energía:</span>
                      <span className="font-mono font-bold text-purple-400">{recetaActual.consumoEnergiaEstimado} kcal/kg</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Control de Peso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-label text-xs text-gray-400">Peso Objetivo</label>
                  <span className="font-mono text-sm text-amber-400 font-bold">
                    {lote.activo ? lote.pesoObjetivo : configuracionLotePendiente.pesoObjetivo} kg
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={lote.activo ? lote.pesoObjetivo : configuracionLotePendiente.pesoObjetivo}
                  onChange={e => manejarCambioPeso(parseInt(e.target.value, 10))}
                  disabled={lote.activo}
                  className="w-full h-2 accent-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                  <span>10 kg</span>
                  <span className="text-gray-500">250 kg</span>
                  <span>500 kg</span>
                </div>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={lote.activo ? lote.pesoObjetivo : configuracionLotePendiente.pesoObjetivo}
                  onChange={manejarInputPeso}
                  disabled={lote.activo}
                  className="w-full px-2 py-1 bg-navy-900 border border-gray-700 rounded text-sm text-white font-mono disabled:opacity-50"
                />
              </div>

              {/* Progreso (si lote activo) */}
              {lote.activo && (
                <div className="bg-navy-900/40 rounded-lg p-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Progreso:</span>
                    <span className="font-mono font-bold" style={{ color: COLORES_FASE[lote.fase] }}>
                      {lote.progresoLote.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-navy-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${lote.progresoLote}%`,
                        backgroundColor: COLORES_FASE[lote.fase],
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                    <span>{lote.pesoProcesado.toFixed(1)} / {lote.pesoObjetivo} kg</span>
                    <span className="text-gray-500">
                      {lote.tiempoEstimadoRestante} min restante
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* COLUMNA 3: Acciones y Estado */}
            <div className="space-y-2">
              <h3 className="font-label text-xs text-gray-400 uppercase tracking-wider font-bold">Acciones</h3>

              {/* Botones de control */}
              <div className="space-y-2">
                {/* Estado: Antes de iniciar */}
                {!lote.activo && (
                  <button
                    onClick={iniciarLote}
                    className="w-full py-3 px-4 bg-green-500/20 border-2 border-green-500 text-green-400 font-label font-bold text-sm rounded-lg hover:bg-green-500/40 transition-all active:scale-95"
                  >
                    ▶ ARRANQUE
                  </button>
                )}

                {/* Estado: Lote activo - No emergencia */}
                {lote.activo && !lote.emergenciaActiva && (
                  <>
                    {/* Fila 1: Pausa/Reanuda + Parada */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => lote.pausado ? reanudarLote() : pausarLote()}
                        className="flex-1 py-2 px-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-label font-bold text-xs rounded-lg hover:bg-yellow-500/30 transition-colors"
                      >
                        {lote.pausado ? '▶ REANUDAR' : '⏸ PAUSA'}
                      </button>
                      <button
                        onClick={detenerLote}
                        className="flex-1 py-2 px-3 bg-orange-500/20 border border-orange-500/50 text-orange-400 font-label font-bold text-xs rounded-lg hover:bg-orange-500/30 transition-colors"
                      >
                        ⏹ PARADA
                      </button>
                    </div>

                    {/* Fila 2: Emergencia + Recargar */}
                    <div className="flex gap-2">
                      <button
                        onClick={paradasEmergencia}
                        className="flex-1 py-2 px-3 bg-red-600/40 border-2 border-red-500 text-red-400 font-label font-bold text-xs rounded-lg hover:bg-red-600/60 transition-all active:scale-95 animate-pulse"
                      >
                        🛑 EMERGENCIA
                      </button>
                      <button
                        onClick={aplicarParametrosReceta}
                        className="flex-1 py-2 px-3 bg-blue-500/20 border border-blue-500/50 text-blue-400 font-label font-bold text-xs rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        ⚙ RECARGAR PIDs
                      </button>
                    </div>
                  </>
                )}

                {/* Estado: Emergencia activa */}
                {lote.emergenciaActiva && (
                  <div className="space-y-1">
                    <div className="bg-red-500/30 border-2 border-red-500 rounded-lg p-2 text-center">
                      <div className="text-red-400 font-label font-bold text-xs">⚠ PARADA DE EMERGENCIA</div>
                      <div className="text-red-300 font-mono text-xs mt-1">Lote suspendido</div>
                    </div>
                    <button
                      onClick={resetearEmergencia}
                      className="w-full py-2 px-4 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-label font-bold text-sm rounded-lg hover:bg-yellow-500/30 transition-colors"
                    >
                      ↻ RESETEAR EMERGENCIA
                    </button>
                  </div>
                )}

                {/* Estado: Lote completado */}
                {!lote.activo && lote.fase === 'completado' && (
                  <button
                    onClick={resetearLote}
                    className="w-full py-3 px-4 bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 font-label font-bold text-sm rounded-lg hover:bg-cyan-500/40 transition-all active:scale-95"
                  >
                    ↻ NUEVO LOTE
                  </button>
                )}
              </div>

              {/* Panel de Estado */}
              {lote.activo && (
                <div className={`rounded-lg p-2 space-y-1 text-xs border ${
                  lote.emergenciaActiva
                    ? 'bg-red-500/20 border-red-500 border-2'
                    : 'bg-navy-900/40 border-gray-700/50'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lote:</span>
                    <span className="font-mono font-bold text-cyan-400">{lote.numeroLote}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estado:</span>
                    <span className="font-mono font-bold" style={{ color: COLORES_FASE[lote.fase] }}>
                      {lote.fase.toUpperCase()} {lote.pausado && '(PAUSADO)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Receta:</span>
                    <span className="font-mono font-bold text-gray-300">{recetaActual?.nombre}</span>
                  </div>
                  {lote.emergenciaActiva && (
                    <div className="mt-2 pt-2 border-t border-red-500 text-red-400 text-center font-bold">
                      ⚠ EMERGENCIA ACTIVA
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
