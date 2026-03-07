import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const TooltipPersonalizado = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <div className="text-gray-400 mb-1">t = {label}s</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }} className="flex gap-2">
          <span>{p.name}:</span>
          <span className="font-bold">{typeof p.value === 'number' ? p.value.toFixed(3) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({
  data, pvKey, spKey, mvKey,
  titulo, unidad,
  pvColor = '#00d4ff', spColor = '#fbbf24', mvColor = '#a78bfa',
  dominio, altura = 180,
}) {
  return (
    <div className="bg-navy-700 border border-gray-700/50 rounded-lg overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 py-2 bg-navy-800 border-b border-gray-700/50">
        <span className="font-label text-sm font-bold text-white tracking-wide">{titulo}</span>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 inline-block" style={{ background: pvColor }} />
            <span className="font-label text-gray-400">PV</span>
          </span>
          {spKey && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-yellow-400 inline-block" />
              <span className="font-label text-gray-400">SP</span>
            </span>
          )}
          {mvKey && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-purple-400 inline-block" />
              <span className="font-label text-gray-400">MV</span>
            </span>
          )}
          <span className="font-mono text-gray-500">{unidad}</span>
        </div>
      </div>

      {/* Gráfico */}
      <div style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="#1a2235" strokeDasharray="2 4" />
            <XAxis dataKey="t"
              tick={{ fill: '#4b5563', fontSize: 9, fontFamily: "'Share Tech Mono', monospace" }}
              tickLine={false} axisLine={{ stroke: '#1f2937' }}
              tickFormatter={v => `${v}s`} minTickGap={40}
            />
            <YAxis domain={dominio || ['auto', 'auto']}
              tick={{ fill: '#4b5563', fontSize: 9, fontFamily: "'Share Tech Mono', monospace" }}
              tickLine={false} axisLine={false} width={44}
            />
            <Tooltip content={<TooltipPersonalizado />} />

            {spKey && (
              <Line type="monotone" dataKey={spKey} stroke={spColor}
                strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="SP" isAnimationActive={false} />
            )}
            {mvKey && (
              <Line type="monotone" dataKey={mvKey} stroke={mvColor}
                strokeWidth={1} dot={false} name="MV" isAnimationActive={false} opacity={0.6} />
            )}
            <Line type="monotone" dataKey={pvKey} stroke={pvColor}
              strokeWidth={2} dot={false} name="PV" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
