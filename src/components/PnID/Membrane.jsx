/**
 * RO Membrane element SVG - elongated cylinder with flow animation
 */
export default function Membrane({ x, y, width = 80, height = 24, label = 'RO', flowActive = true, flowColor = '#3b82f6' }) {
  const rx = height / 2;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Membrane body */}
      <rect
        x={rx} y={0}
        width={width - rx * 2} height={height}
        fill="#0f172a"
        stroke={flowActive ? flowColor : '#374151'}
        strokeWidth="1.5"
      />
      {/* Left cap (ellipse) */}
      <ellipse cx={rx} cy={height / 2} rx={rx} ry={height / 2}
        fill="#1a2235" stroke={flowActive ? flowColor : '#374151'} strokeWidth="1.5"
      />
      {/* Right cap */}
      <ellipse cx={width - rx} cy={height / 2} rx={rx} ry={height / 2}
        fill="#1a2235" stroke={flowActive ? flowColor : '#374151'} strokeWidth="1.5"
      />

      {/* Animated flow stripes inside */}
      {flowActive && (
        <g clipPath={`url(#mem-clip-${label})`}>
          <clipPath id={`mem-clip-${label}`}>
            <rect x={rx} y={1} width={width - rx * 2 - 1} height={height - 2} />
          </clipPath>
          {[-20, 0, 20, 40, 60, 80, 100].map(offset => (
            <line
              key={offset}
              x1={rx + offset} y1={2}
              x2={rx + offset + 12} y2={height - 2}
              stroke={flowColor}
              strokeWidth="2"
              strokeOpacity="0.3"
              className="animate-dash-flow"
            />
          ))}
        </g>
      )}

      {/* Label */}
      <text
        x={width / 2} y={height / 2 + 4}
        textAnchor="middle"
        fill={flowActive ? '#e2e8f0' : '#374151'}
        fontSize={9}
        fontFamily="Rajdhani, sans-serif"
        fontWeight="700"
      >
        {label}
      </text>
    </g>
  );
}
