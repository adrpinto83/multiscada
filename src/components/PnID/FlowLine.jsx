/**
 * Animated flow line using SVG stroke-dashoffset
 * Supports polyline paths for complex routing
 */
export default function FlowLine({ points, color = '#3b82f6', width = 2.5, flowing = true, animated = true }) {
  const pointStr = points.map(([x, y]) => `${x},${y}`).join(' ');
  const dashLength = 8;
  const gapLength = 5;

  return (
    <g>
      {/* Base pipe */}
      <polyline
        points={pointStr}
        fill="none"
        stroke={flowing ? color : '#1f2937'}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.3}
      />
      {/* Animated flow dashes */}
      {flowing && animated && (
        <polyline
          points={pointStr}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${dashLength} ${gapLength}`}
          style={{
            animation: 'dashFlow 0.8s linear infinite',
          }}
        />
      )}
      {/* Static line when not flowing */}
      {(!flowing || !animated) && (
        <polyline
          points={pointStr}
          fill="none"
          stroke={flowing ? color : '#374151'}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 3"
          opacity={0.5}
        />
      )}
    </g>
  );
}
