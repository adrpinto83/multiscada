/**
 * Animated pump SVG component
 * Shows spinning animation speed based on pump speed %
 */
export default function Pump({ x, y, speed = 0, label = 'P', running = true, onClick, size = 40 }) {
  const r = size / 2;
  const animClass = !running || speed < 5
    ? ''
    : speed < 40
    ? 'animate-spin-slow'
    : speed < 70
    ? 'animate-spin-medium'
    : 'animate-spin-fast';

  const strokeColor = speed < 5 ? '#374151' : speed < 40 ? '#fbbf24' : '#00d4ff';

  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
      {/* Outer casing */}
      <circle r={r} fill="#0f172a" stroke={strokeColor} strokeWidth="2" />

      {/* Spinning impeller */}
      <g className={animClass} style={{ transformOrigin: '0 0' }}>
        {/* 4-blade impeller */}
        {[0, 90, 180, 270].map(angle => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path
              d={`M 0 0 L ${r * 0.3} ${-r * 0.7} Q ${r * 0.5} ${-r * 0.85} ${r * 0.4} ${-r * 0.5} Z`}
              fill={strokeColor}
              opacity="0.8"
            />
          </g>
        ))}
        {/* Center hub */}
        <circle r={r * 0.18} fill={strokeColor} />
      </g>

      {/* Label */}
      <text
        y={r + 12}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize={9}
        fontFamily="Rajdhani, sans-serif"
        fontWeight="600"
      >
        {label}
      </text>

      {/* Speed indicator */}
      <text
        y={r + 21}
        textAnchor="middle"
        fill={strokeColor}
        fontSize={8}
        fontFamily="'Share Tech Mono', monospace"
      >
        {speed.toFixed(0)}%
      </text>

      {/* Hover highlight */}
      {onClick && (
        <circle r={r + 4} fill="transparent" stroke="transparent" className="hover:stroke-cyan-scada/30 hover:stroke-2 transition-colors" />
      )}
    </g>
  );
}
