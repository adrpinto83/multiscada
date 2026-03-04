/**
 * Product tank SVG with animated liquid level
 */
export default function Tank({ x, y, width = 60, height = 80, level = 60, label = 'TK', tag = '' }) {
  const liquidHeight = (level / 100) * (height - 4);
  const liquidY = height - 2 - liquidHeight;

  const levelColor = level < 20 ? '#ef4444' : level > 85 ? '#f59e0b' : '#00d4ff';

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Tank outline */}
      <rect x={0} y={0} width={width} height={height}
        rx={3} ry={3}
        fill="#0a0e1a"
        stroke="#374151"
        strokeWidth="2"
      />

      {/* Liquid fill - animated */}
      <rect
        x={2} y={liquidY}
        width={width - 4} height={liquidHeight}
        rx={1}
        fill={levelColor}
        fillOpacity={0.35}
        className="transition-all duration-500"
      />

      {/* Liquid surface shimmer */}
      {level > 2 && (
        <rect
          x={2} y={liquidY}
          width={width - 4} height={3}
          rx={1}
          fill={levelColor}
          fillOpacity={0.8}
          className="transition-all duration-500"
        />
      )}

      {/* Level markings */}
      {[25, 50, 75].map(pct => {
        const markY = height - 2 - (pct / 100) * (height - 4);
        return (
          <g key={pct}>
            <line x1={2} y1={markY} x2={8} y2={markY} stroke="#374151" strokeWidth="1" />
            <line x1={width - 8} y1={markY} x2={width - 2} y2={markY} stroke="#374151" strokeWidth="1" />
            <text x={width + 4} y={markY + 3} fill="#4b5563" fontSize={7} fontFamily="'Share Tech Mono', monospace">{pct}%</text>
          </g>
        );
      })}

      {/* Level text */}
      <text
        x={width / 2} y={height / 2 + 4}
        textAnchor="middle"
        fill={levelColor}
        fontSize={12}
        fontFamily="'Share Tech Mono', monospace"
        fontWeight="bold"
        className="transition-all duration-500"
      >
        {level.toFixed(1)}%
      </text>

      {/* Label */}
      <text
        x={width / 2} y={height + 12}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize={9}
        fontFamily="Rajdhani, sans-serif"
        fontWeight="600"
      >
        {label}
      </text>
      {tag && (
        <text
          x={width / 2} y={height + 21}
          textAnchor="middle"
          fill="#4b5563"
          fontSize={7}
          fontFamily="'Share Tech Mono', monospace"
        >
          {tag}
        </text>
      )}
    </g>
  );
}
