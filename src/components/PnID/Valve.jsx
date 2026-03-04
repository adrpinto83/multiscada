/**
 * Control valve SVG with position indicator
 */
export default function Valve({ x, y, opening = 50, label = 'VCV', vertical = false, onClick }) {
  const size = 16;
  const openColor = opening > 80 ? '#22c55e' : opening > 20 ? '#00d4ff' : '#ef4444';

  // Valve body: two triangles pointing inward (butterfly valve symbol)
  const transform = vertical ? `translate(${x},${y}) rotate(90, 0, 0)` : `translate(${x},${y})`;

  return (
    <g transform={transform} onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
      {/* Valve body triangles */}
      <polygon
        points={`${-size},${-size} 0,0 ${-size},${size}`}
        fill="#0f172a"
        stroke={openColor}
        strokeWidth="1.5"
      />
      <polygon
        points={`${size},${-size} 0,0 ${size},${size}`}
        fill="#0f172a"
        stroke={openColor}
        strokeWidth="1.5"
      />

      {/* Opening indicator bar */}
      <rect
        x={-size + 2}
        y={size + 3}
        width={(size * 2 - 4) * (opening / 100)}
        height={4}
        rx={1}
        fill={openColor}
        className="transition-all duration-300"
      />
      <rect x={-size + 2} y={size + 3} width={size * 2 - 4} height={4} rx={1}
        fill="none" stroke="#374151" strokeWidth="1"
      />

      {/* Actuator stem */}
      <line x1={0} y1={-size} x2={0} y2={-size - 10} stroke="#374151" strokeWidth="2" />
      <rect x={-8} y={-size - 18} width={16} height={8} rx={2} fill="#1a2235" stroke="#374151" strokeWidth="1" />

      {/* Label */}
      <text
        y={size + 20}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize={8}
        fontFamily="Rajdhani, sans-serif"
        fontWeight="600"
      >
        {label}
      </text>
      <text
        y={size + 29}
        textAnchor="middle"
        fill={openColor}
        fontSize={7}
        fontFamily="'Share Tech Mono', monospace"
      >
        {opening.toFixed(0)}%
      </text>
    </g>
  );
}
