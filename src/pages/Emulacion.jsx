import { usePlantStore } from '../store/plantStore';

const VARIABLES = [
  // CVs
  { tag: 'y1', etiqueta: 'Flujo Permeado',       tipo: 'CV', unidad: 'm³/h',  color: '#00d4ff' },
  { tag: 'y2', etiqueta: 'Conductividad',          tipo: 'CV', unidad: 'μS/cm', color: '#f472b6' },
  { tag: 'y3', etiqueta: 'Nivel Depósito',         tipo: 'CV', unidad: '%',     color: '#34d399' },
  { tag: 'y4', etiqueta: 'pH Producto',            tipo: 'CV', unidad: 'pH',    color: '#fb923c' },
  // MVs
  { tag: 'u1', etiqueta: 'Bomba Alta Presión',     tipo: 'MV', unidad: '%',     color: '#818cf8' },
  { tag: 'u2', etiqueta: 'Válvula Concentrado',    tipo: 'MV', unidad: '%',     color: '#818cf8' },
  { tag: 'u3', etiqueta: 'Bomba Impulsora P2',     tipo: 'MV', unidad: '%',     color: '#818cf8' },
  { tag: 'u4', etiqueta: 'Dosificación NaOH',      tipo: 'MV', unidad: '%',     color: '#818cf8' },
];

function TarjetaEmulacion({ variable }) {
  const emulacion = usePlantStore(s => s.emulacion);
  const toggleEmulacion = usePlantStore(s => s.toggleEmulacion);
  const setEmulacion = usePlantStore(s => s.setEmulacion);
  const cvs = usePlantStore(s => s.cvs);
  const mvs = usePlantStore(s => s.mvs);

  const emu = emulacion[variable.tag] || {};
  const valorReal = variable.tipo === 'CV' ? cvs[variable.tag] : mvs[variable.tag];

  return (
    <div className={`bg-navy-700 border rounded-xl overflow-hidden transition-all ${
      emu.activa ? 'border-purple-500/50 shadow-purple-900/20 shadow-lg' : 'border-gray-700/50'
    }`}>
      {/* Cabecera */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${
        emu.activa ? 'bg-purple-900/20 border-purple-700/30' : 'bg-navy-800 border-gray-700/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${emu.activa ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`} />
          <div>
            <div className="font-mono text-sm font-bold" style={{ color: emu.activa ? '#c084fc' : variable.color }}>
              {variable.tag.toUpperCase()}
            </div>
            <div className="font-label text-xs text-gray-400">{variable.etiqueta}</div>
          </div>
          <span className={`text-xs font-label px-2 py-0.5 rounded border ${
            variable.tipo === 'CV'
              ? 'border-cyan-scada/30 text-cyan-scada/70'
              : 'border-indigo-400/30 text-indigo-400/70'
          }`}>{variable.tipo}</span>
        </div>

        {/* Toggle emulación */}
        <button
          onClick={() => toggleEmulacion(variable.tag)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full border-2 transition-colors ${
            emu.activa ? 'bg-purple-500 border-purple-400' : 'bg-gray-700 border-gray-600'
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
            emu.activa ? 'translate-x-7' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Cuerpo */}
      <div className="p-4 space-y-3">
        {/* Comparativa real vs emulado */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-navy-800/60 rounded-lg p-3 text-center">
            <div className="font-label text-xs text-gray-500 mb-1">Valor Real (Simulado)</div>
            <div className="font-mono text-lg font-bold" style={{ color: variable.color }}>
              {typeof valorReal === 'number' ? valorReal.toFixed(valorReal < 10 ? 3 : 1) : '--'}
            </div>
            <div className="font-label text-xs text-gray-500">{variable.unidad}</div>
          </div>
          <div className={`rounded-lg p-3 text-center border ${
            emu.activa ? 'bg-purple-900/20 border-purple-500/30' : 'bg-navy-800/40 border-gray-700/30'
          }`}>
            <div className="font-label text-xs text-gray-500 mb-1">Valor Emulado</div>
            <div className={`font-mono text-lg font-bold ${emu.activa ? 'text-purple-400' : 'text-gray-600'}`}>
              {emu.valor !== undefined ? emu.valor.toFixed(emu.valor < 10 ? 3 : 1) : '--'}
            </div>
            <div className="font-label text-xs text-gray-500">{variable.unidad}</div>
          </div>
        </div>

        {/* Slider + input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-label text-gray-400">
            <span>{emu.min ?? 0} {variable.unidad}</span>
            <span className={`font-mono font-bold ${emu.activa ? 'text-purple-400' : 'text-gray-600'}`}>
              {emu.valor !== undefined ? emu.valor.toFixed(2) : '--'} {variable.unidad}
            </span>
            <span>{emu.max ?? 100} {variable.unidad}</span>
          </div>
          <input
            type="range"
            min={emu.min ?? 0}
            max={emu.max ?? 100}
            step={emu.paso ?? 0.5}
            value={emu.valor ?? valorReal ?? 0}
            onChange={e => setEmulacion(variable.tag, 'valor', +e.target.value)}
            className={`w-full h-3 rounded-full cursor-pointer ${emu.activa ? 'accent-purple-500' : 'accent-gray-600'}`}
            disabled={!emu.activa}
          />

          {/* Input numérico */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={emu.valor !== undefined ? emu.valor : (valorReal ?? 0)}
              onChange={e => setEmulacion(variable.tag, 'valor', +e.target.value)}
              disabled={!emu.activa}
              step={emu.paso ?? 0.1}
              min={emu.min ?? 0}
              max={emu.max ?? 100}
              className={`flex-1 bg-navy-900 border font-mono text-sm px-3 py-1.5 rounded-lg outline-none transition-colors ${
                emu.activa
                  ? 'border-purple-500/50 text-purple-400 focus:border-purple-400'
                  : 'border-gray-700 text-gray-600 opacity-50'
              }`}
            />
            <span className="font-label text-sm text-gray-500 w-14 shrink-0">{variable.unidad}</span>

            {/* Botones rápidos */}
            {emu.activa && (
              <div className="flex gap-1">
                {[
                  { etq: '↑10', delta: +10 },
                  { etq: '↓10', delta: -10 },
                ].map(({ etq, delta }) => (
                  <button key={etq}
                    onClick={() => setEmulacion(variable.tag, 'valor',
                      Math.max(emu.min ?? 0, Math.min(emu.max ?? 100, (emu.valor ?? valorReal ?? 0) + delta))
                    )}
                    className="text-xs font-mono px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors"
                  >{etq}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Descripción del efecto */}
        {emu.activa && (
          <div className="text-xs font-label text-purple-400/70 bg-purple-900/10 border border-purple-500/20 rounded-lg px-3 py-2">
            ⚡ Emulación activa — Este valor sobreescribe la simulación y es visible en tendencias y alarmas.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Emulacion() {
  const emulacion = usePlantStore(s => s.emulacion);
  const resetearEmulaciones = usePlantStore(s => s.resetearEmulaciones);
  const emuActivas = Object.values(emulacion).filter(e => e.activa).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Cabecera */}
      <div className="px-6 py-3 border-b border-gray-700/50 bg-navy-800/50 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="font-label text-lg font-bold text-white">Panel de Emulación</h1>
          <p className="font-label text-xs text-gray-400">
            Sobrescribe variables de proceso para pruebas de alarmas y lógica de control
          </p>
        </div>
        <div className="flex items-center gap-3">
          {emuActivas > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/40">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-label text-sm font-bold text-purple-400">
                {emuActivas} variable{emuActivas !== 1 ? 's' : ''} emulada{emuActivas !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          <button
            onClick={resetearEmulaciones}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 text-gray-300 font-label font-bold text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            Resetear Todo
          </button>
        </div>
      </div>

      {/* Advertencia */}
      {emuActivas > 0 && (
        <div className="px-6 py-2 bg-purple-900/20 border-b border-purple-500/30 shrink-0 flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-purple-400 shrink-0">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <span className="font-label text-sm text-purple-300">
            <strong>MODO EMULACIÓN</strong> — Los valores emulados son visibles en toda la aplicación: P&ID, tendencias, alarmas y controladores.
          </span>
        </div>
      )}

      {/* Grid de tarjetas */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h2 className="font-label text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Variables Controladas (CV)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {VARIABLES.filter(v => v.tipo === 'CV').map(v => (
              <TarjetaEmulacion key={v.tag} variable={v} />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-label text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Variables Manipuladas (MV)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {VARIABLES.filter(v => v.tipo === 'MV').map(v => (
              <TarjetaEmulacion key={v.tag} variable={v} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
