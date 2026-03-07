import { useCafeStore } from '../../store/cafeStore';

function InstrumentBubble({ x, y, tag, valor, unidad, color, onClick, alarm }) {
  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <circle cx={x} cy={y} r={22} fill="#0f172a" stroke={alarm ? '#ff4444' : color} strokeWidth={alarm ? 2 : 1.5}
        className={alarm ? 'animate-pulse' : ''} />
      <text x={x} y={y - 5} textAnchor="middle" fill={color} fontSize="7.5" fontFamily="'Share Tech Mono',monospace" fontWeight="bold">{tag}</text>
      <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="9" fontFamily="'Share Tech Mono',monospace">{valor}</text>
      <text x={x} y={y + 14} textAnchor="middle" fill="#6b7280" fontSize="6" fontFamily="Rajdhani,sans-serif">{unidad}</text>
    </g>
  );
}

function FlameAnim({ x, y, intensity }) {
  const h = Math.max(5, intensity * 0.3);
  return (
    <g>
      {[0, 1, 2, 3, 4].map(i => (
        <ellipse key={i} cx={x - 16 + i * 8} cy={y} rx={4} ry={h + (i % 2) * 3}
          fill={i % 2 === 0 ? '#f97316' : '#fbbf24'} opacity={0.7 + intensity * 0.003}>
          <animate attributeName="ry" values={`${h};${h + 4};${h}`} dur={`${0.4 + i * 0.1}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
    </g>
  );
}

export default function Plant() {
  const cvs = useCafeStore(s => s.cvs);
  const mvs = useCafeStore(s => s.mvs);
  const alarmas = useCafeStore(s => s.alarmas);
  const setFaceplateActivo = useCafeStore(s => s.setFaceplateActivo);
  const calculadas = useCafeStore(s => s.calculadas);

  const alarmasActivas = new Set(alarmas.filter(a => a.estado !== 'BORRADA').map(a => a.cv));

  const COLORES_GRADO = {
    VERDE: '#22c55e', LIGERO: '#a3e635', MEDIO: '#f59e0b', OSCURO: '#b45309', QUEMADO: '#7f1d1d',
  };
  const colorGrano = COLORES_GRADO[calculadas.gradoTostado] || '#f59e0b';

  // Animación del tambor según u2 (velocidad)
  const rotDuracion = Math.max(1, 6 - mvs.u2 * 0.05); // 6s a 0% → 1s a 100%

  return (
    <div className="flex-1 overflow-hidden bg-navy-900 p-2">
      <svg viewBox="0 0 1200 560" className="w-full h-full" style={{ maxHeight: '100%' }}>

        {/* ── FONDO ── */}
        <rect width="1200" height="560" fill="#0a0f1e" rx="8" />

        {/* Título */}
        <text x="600" y="24" textAnchor="middle" fill="#6b7280" fontSize="11" fontFamily="Rajdhani,sans-serif" fontWeight="bold">
          P&amp;ID — PLANTA TOSTADO CAFÉ — 4×4 MIMO FOPDT
        </text>

        {/* ── TOLVA GRANO VERDE (izquierda) ── */}
        {/* Tolva */}
        <polygon points="60,60 160,60 145,140 75,140" fill="#1e3a1e" stroke="#22c55e" strokeWidth="1.5" />
        {/* Fondo tolva redondo */}
        <ellipse cx="110" cy="140" rx="35" ry="8" fill="#166534" stroke="#22c55e" strokeWidth="1" />
        {/* Granos (pequeños círculos verdes) */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <circle key={i} cx={75 + (i % 4) * 18} cy={75 + Math.floor(i / 4) * 18} r="6" fill="#15803d" stroke="#22c55e" strokeWidth="0.5" />
        ))}
        <text x="110" y="170" textAnchor="middle" fill="#22c55e" fontSize="9" fontFamily="Rajdhani,sans-serif" fontWeight="bold">TOLVA</text>
        <text x="110" y="181" textAnchor="middle" fill="#16a34a" fontSize="8" fontFamily="Rajdhani,sans-serif">GRANO VERDE</text>

        {/* Cinta transportadora */}
        <line x1="145" y1="125" x2="230" y2="195" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
        <line x1="147" y1="121" x2="232" y2="191" stroke="#4b5563" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" values="0;-20" dur="0.8s" repeatCount="indefinite" />
        </line>
        <text x="175" y="185" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="Rajdhani,sans-serif">conveyor</text>

        {/* ── TAMBOR TOSTADOR (centro) ── */}
        {/* Cuerpo del tambor */}
        <ellipse cx="500" cy="270" rx="180" ry="80" fill="#1c1917" stroke="#78716c" strokeWidth="2" />
        {/* Tapas del tambor */}
        <ellipse cx="320" cy="270" rx="25" ry="80" fill="#292524" stroke="#78716c" strokeWidth="1.5" />
        <ellipse cx="680" cy="270" rx="25" ry="80" fill="#292524" stroke="#78716c" strokeWidth="1.5" />

        {/* Aletas internas del tambor (animadas con rotación) */}
        <g transform="translate(500,270)">
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0"
            dur={`${rotDuracion}s`} repeatCount="indefinite" additive="sum" />
          {[0, 60, 120, 180, 240, 300].map((ang, i) => (
            <line key={i}
              x1={40 * Math.cos(ang * Math.PI / 180)} y1={40 * Math.sin(ang * Math.PI / 180)}
              x2={75 * Math.cos(ang * Math.PI / 180)} y2={75 * Math.sin(ang * Math.PI / 180)}
              stroke={colorGrano} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          ))}
          {/* Granos en rotación */}
          {[30, 90, 150, 210, 270, 330].map((ang, i) => (
            <circle key={`g${i}`}
              cx={60 * Math.cos(ang * Math.PI / 180)} cy={60 * Math.sin(ang * Math.PI / 180)}
              r="6" fill={colorGrano} opacity="0.9" />
          ))}
        </g>

        {/* Etiqueta tambor */}
        <text x="500" y="268" textAnchor="middle" fill="#a8a29e" fontSize="14" fontFamily="Rajdhani,sans-serif" fontWeight="bold">TAMBOR</text>
        <text x="500" y="285" textAnchor="middle" fill="#78716c" fontSize="10" fontFamily="Rajdhani,sans-serif">
          {mvs.u2.toFixed(0)}% vel
        </text>

        {/* ── QUEMADOR (debajo del tambor) ── */}
        <rect x="400" y="360" width="200" height="25" rx="4" fill="#1c0a00" stroke="#92400e" strokeWidth="1.5" />
        <text x="500" y="376" textAnchor="middle" fill="#f97316" fontSize="10" fontFamily="Rajdhani,sans-serif" fontWeight="bold">QUEMADOR</text>
        {/* Llamas */}
        <FlameAnim x={500} y={355} intensity={mvs.u1} />

        {/* Pie quemador */}
        <rect x="440" y="385" width="120" height="15" rx="3" fill="#111" stroke="#78350f" strokeWidth="1" />
        <text x="500" y="397" textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="'Share Tech Mono',monospace">
          {mvs.u1.toFixed(0)}% potencia
        </text>

        {/* ── CONDUCTO GASES SALIDA (arriba) ── */}
        {/* Conducto principal */}
        <path d="M 500 190 L 500 120 L 750 120 L 750 80" fill="none" stroke="#6b7280" strokeWidth="12" strokeLinejoin="round" />
        {/* Partículas de gas animadas */}
        <circle r="4" fill="#9ca3af" opacity="0.6">
          <animateMotion dur="2s" repeatCount="indefinite" path="M 500 190 L 500 120 L 750 120 L 750 80" />
        </circle>
        <circle r="3" fill="#9ca3af" opacity="0.4">
          <animateMotion dur="2s" begin="0.7s" repeatCount="indefinite" path="M 500 190 L 500 120 L 750 120 L 750 80" />
        </circle>

        {/* Ciclón cascarilla */}
        <ellipse cx="800" cy="100" rx="35" ry="50" fill="#1e293b" stroke="#4b5563" strokeWidth="1.5" />
        <polygon points="780,130 820,130 800,175" fill="#0f172a" stroke="#4b5563" strokeWidth="1" />
        <text x="800" y="98" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="Rajdhani,sans-serif" fontWeight="bold">CICLÓN</text>
        <text x="800" y="109" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="Rajdhani,sans-serif">cascarilla</text>

        {/* Chimenea */}
        <rect x="830" y="40" width="20" height="70" fill="#1e293b" stroke="#4b5563" strokeWidth="1" />
        <rect x="825" y="35" width="30" height="8" rx="2" fill="#374151" stroke="#4b5563" strokeWidth="1" />
        {/* Humo */}
        {[0, 1, 2].map(i => (
          <circle key={i} cx={840 + (i - 1) * 4} cy={25 - i * 8} r={4 + i * 2} fill="#374151" opacity={0.4 - i * 0.1}>
            <animate attributeName="cy" values={`${25 - i * 8};${15 - i * 8}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values={`${0.4 - i * 0.1};0`} dur="2s" repeatCount="indefinite" />
          </circle>
        ))}

        {/* ── BANDEJA ENFRIAMIENTO (derecha) ── */}
        {/* Salida grano del tambor */}
        <path d="M 680 270 Q 750 270 750 310" fill="none" stroke="#78716c" strokeWidth="8" strokeLinecap="round" />
        {/* Bandeja */}
        <rect x="730" y="310" width="220" height="60" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="840" y="338" textAnchor="middle" fill="#7dd3fc" fontSize="12" fontFamily="Rajdhani,sans-serif" fontWeight="bold">BANDEJA</text>
        <text x="840" y="354" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="Rajdhani,sans-serif">ENFRIAMIENTO</text>

        {/* Granos en bandeja (color según grado) */}
        {[0,1,2,3,4,5,6].map(i => (
          <circle key={i} cx={745 + i * 28} cy={338} r="7" fill={colorGrano} opacity="0.85" />
        ))}

        {/* Flechas de aire frío cuando u4 > 5 */}
        {mvs.u4 > 5 && (
          <g fill="#38bdf8" opacity="0.8">
            {[750, 790, 830, 870, 910].map(x => (
              <g key={x}>
                <path d={`M ${x} 390 L ${x} 370 L ${x-5} 377 M ${x} 370 L ${x+5} 377`} fill="none" stroke="#38bdf8" strokeWidth="1.5">
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.8s" repeatCount="indefinite" />
                </path>
              </g>
            ))}
            <text x="840" y="405" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="Rajdhani,sans-serif">
              AIRE {mvs.u4.toFixed(0)}%
            </text>
          </g>
        )}

        {/* Depósito producto terminado */}
        <rect x="980" y="280" width="140" height="100" rx="6" fill="#1c1917" stroke={colorGrano} strokeWidth="2" />
        <ellipse cx="1050" cy="280" rx="70" ry="12" fill="#292524" stroke={colorGrano} strokeWidth="1.5" />
        {/* Nivel producto */}
        <rect x="982" y={280 + 100 - calculadas.factorDesarrollo} width="136" height={calculadas.factorDesarrollo}
          rx="4" fill={colorGrano} opacity="0.4" />
        <text x="1050" y="330" textAnchor="middle" fill={colorGrano} fontSize="11" fontFamily="Rajdhani,sans-serif" fontWeight="bold">PRODUCTO</text>
        <text x="1050" y="345" textAnchor="middle" fill="#a8a29e" fontSize="9" fontFamily="Rajdhani,sans-serif">{calculadas.gradoTostado}</text>
        <text x="1050" y="360" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="'Share Tech Mono',monospace">
          {calculadas.factorDesarrollo.toFixed(1)}% dev
        </text>

        {/* Línea bandeja → depósito */}
        <path d="M 950 340 L 980 330" fill="none" stroke={colorGrano} strokeWidth="6" strokeLinecap="round" />

        {/* ── BURBUJAS INSTRUMENTACIÓN ── */}
        {/* TT-001 — Temp Tambor (y1) → PID 0 */}
        <line x1="500" y1="200" x2="500" y2="430" stroke="#78716c" strokeWidth="0.5" strokeDasharray="4 3" />
        <InstrumentBubble x={440} y={465} tag="TT-001" valor={cvs.y1.toFixed(0)} unidad="°C"
          color="#f59e0b" alarm={alarmasActivas.has('y1')}
          onClick={() => setFaceplateActivo(0)} />
        <line x1="440" y1="443" x2="440" y2="430" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="440" cy="430" r="3" fill="#f59e0b" opacity="0.7" />

        {/* MT-001 — Humedad grano (y2) → PID 2 */}
        <InstrumentBubble x={560} y={465} tag="MT-001" valor={cvs.y2.toFixed(2)} unidad="%H"
          color="#34d399" alarm={alarmasActivas.has('y2')}
          onClick={() => setFaceplateActivo(2)} />
        <line x1="560" y1="443" x2="560" y2="430" stroke="#34d399" strokeWidth="1" />
        <circle cx="560" cy="430" r="3" fill="#34d399" opacity="0.7" />

        {/* TT-002 — Temp gases salida (y3) → PID 1 */}
        <line x1="750" y1="120" x2="720" y2="120" stroke="#6b7280" strokeWidth="0.5" strokeDasharray="4 3" />
        <InstrumentBubble x={685} y={120} tag="TT-002" valor={cvs.y3.toFixed(0)} unidad="°C"
          color="#f472b6" alarm={alarmasActivas.has('y3')}
          onClick={() => setFaceplateActivo(1)} />

        {/* CT-001 — Color Agtron (y4) → PID 3 */}
        <InstrumentBubble x={840} y={450} tag="CT-001" valor={cvs.y4.toFixed(0)} unidad="Ag"
          color={colorGrano} alarm={alarmasActivas.has('y4')}
          onClick={() => setFaceplateActivo(3)} />
        <line x1="840" y1="428" x2="840" y2="370" stroke={colorGrano} strokeWidth="1" />
        <circle cx="840" cy="370" r="3" fill={colorGrano} opacity="0.7" />

        {/* ── PANEL RESUMEN (inferior izquierdo) ── */}
        <rect x="20" y="400" width="170" height="140" rx="6" fill="#0f172a" stroke="#374151" strokeWidth="1" />
        <text x="105" y="418" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="Rajdhani,sans-serif" fontWeight="bold">VARIABLES PROCESO</text>

        {[
          { etq: 'T Tambor',  val: `${cvs.y1.toFixed(0)}°C`,  color: '#f59e0b' },
          { etq: 'Humedad',   val: `${cvs.y2.toFixed(2)}%`,   color: '#34d399' },
          { etq: 'T Gases',   val: `${cvs.y3.toFixed(0)}°C`,  color: '#f472b6' },
          { etq: 'Agtron',    val: `${cvs.y4.toFixed(0)} Ag`, color: colorGrano },
          { etq: 'Tasa Cal.', val: `${calculadas.tasaCalentamiento.toFixed(1)}°/min`, color: '#e2e8f0' },
        ].map((item, i) => (
          <g key={i}>
            <text x="30" y={434 + i * 20} fill="#6b7280" fontSize="8" fontFamily="Rajdhani,sans-serif">{item.etq}</text>
            <text x="180" y={434 + i * 20} textAnchor="end" fill={item.color} fontSize="9" fontFamily="'Share Tech Mono',monospace" fontWeight="bold">{item.val}</text>
          </g>
        ))}

        {/* ── LEYENDA PIDs ── */}
        <rect x="20" y="260" width="150" height="130" rx="6" fill="#0f172a" stroke="#374151" strokeWidth="1" />
        <text x="95" y="277" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="Rajdhani,sans-serif" fontWeight="bold">LAZOS DE CONTROL</text>
        {[
          { tag: 'TIC-001', desc: 'T Tambor←Quemador', color: '#f59e0b' },
          { tag: 'TIC-002', desc: 'T Gases←Aire',      color: '#f472b6' },
          { tag: 'MIC-001', desc: 'Humid←Tambor',       color: '#34d399' },
          { tag: 'CIC-001', desc: 'Color←Enfriam.',     color: colorGrano },
        ].map((pid, i) => (
          <g key={i}>
            <circle cx={32} cy={290 + i * 23} r={4} fill={pid.color} />
            <text x={40} y={294 + i * 23} fill={pid.color} fontSize="8" fontFamily="'Share Tech Mono',monospace" fontWeight="bold">{pid.tag}</text>
            <text x={40} y={304 + i * 23} fill="#4b5563" fontSize="7" fontFamily="Rajdhani,sans-serif">{pid.desc}</text>
          </g>
        ))}

        {/* ── INSTRUCCIÓN CLICK ── */}
        <text x="600" y="545" textAnchor="middle" fill="#374151" fontSize="9" fontFamily="Rajdhani,sans-serif">
          Haz clic en las burbujas de instrumentación para abrir el faceplate del controlador PID
        </text>
      </svg>
    </div>
  );
}
