import { usePlantStore } from '../../store/plantStore';
import Pump from './Pump';
import Membrane from './Membrane';
import Tank from './Tank';
import Valve from './Valve';
import FlowLine from './FlowLine';

function BurbujaInstrumento({ x, y, tag, valor, unidad, ok = true, onClick, emulada = false }) {
  const color = emulada ? '#c084fc' : ok ? '#00d4ff' : '#ff4444';
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
      <circle r={20} fill="#0f172a" stroke={color} strokeWidth={emulada ? 2 : 1.5} />
      {emulada && <circle r={22} fill="none" stroke="#c084fc" strokeWidth={0.5} strokeDasharray="3 2" />}
      <text y={-6} textAnchor="middle" fill={color} fontSize={7} fontFamily="Rajdhani,sans-serif" fontWeight="700">{tag}</text>
      <text y={4} textAnchor="middle" fill="white" fontSize={8} fontFamily="'Share Tech Mono',monospace" fontWeight="bold">{valor}</text>
      <text y={13} textAnchor="middle" fill="#6b7280" fontSize={6} fontFamily="Rajdhani,sans-serif">{unidad}</text>
      {emulada && <text y={21} textAnchor="middle" fill="#c084fc" fontSize={5} fontFamily="Rajdhani,sans-serif">EMU</text>}
      {onClick && <circle r={20} fill="transparent" stroke="transparent" className="hover:stroke-cyan-scada/40 hover:stroke-2 transition-colors" />}
    </g>
  );
}

function CajaFiltro({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width={55} height={38} rx={3} fill="#0f172a" stroke="#374151" strokeWidth={1.5} />
      {[8, 16, 24, 32, 40, 48].map(xi => (
        <line key={xi} x1={xi} y1={4} x2={xi} y2={34} stroke="#1e3a5f" strokeWidth={1} />
      ))}
      <text x={27} y={14} textAnchor="middle" fill="#4b5563" fontSize={7} fontFamily="Rajdhani,sans-serif" fontWeight="700">FILTRO</text>
      <text x={27} y={24} textAnchor="middle" fill="#4b5563" fontSize={7} fontFamily="Rajdhani,sans-serif">PREVIO</text>
    </g>
  );
}

export default function Plant() {
  const cvs = usePlantStore(s => s.cvs);
  const mvs = usePlantStore(s => s.mvs);
  const calculadas = usePlantStore(s => s.calculadas);
  const emulacion = usePlantStore(s => s.emulacion);
  const setFaceplateActivo = usePlantStore(s => s.setFaceplateActivo);

  const enFlujo = mvs.u1 > 5;
  const enPaso2 = mvs.u3 > 5;

  const flowOk   = cvs.y1 >= 8;
  const condOk   = cvs.y2 <= 600;
  const nivelOk  = cvs.y3 >= 20 && cvs.y3 <= 85;
  const phOk     = cvs.y4 >= 6.5 && cvs.y4 <= 8.5;

  const emuY1 = emulacion.y1?.activa;
  const emuY2 = emulacion.y2?.activa;
  const emuY3 = emulacion.y3?.activa;
  const emuY4 = emulacion.y4?.activa;

  // Color de fouling en membranas
  const fouling = calculadas.factorEnsuciamiento;
  const colorMembrana = fouling > 50 ? '#ef4444' : fouling > 25 ? '#f59e0b' : '#3b82f6';

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 1200 580" className="w-full h-full" style={{ maxHeight: '100%' }}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a2235" strokeWidth="0.5" />
          </pattern>
          <style>{`
            @keyframes dashFlow { 0% { stroke-dashoffset: 26; } 100% { stroke-dashoffset: 0; } }
          `}</style>
        </defs>

        <rect width="1200" height="580" fill="#0a0e1a" />
        <rect width="1200" height="580" fill="url(#grid)" />

        {/* Título */}
        <text x={600} y={22} textAnchor="middle" fill="#374151" fontSize={12} fontFamily="Rajdhani,sans-serif" fontWeight="700">
          PLANTA DESALACIÓN OI DOS PASOS — DIAGRAMA P&amp;ID
        </text>

        {/* Variables calculadas en cabecera */}
        <g transform="translate(20, 12)">
          {[
            { etq: 'Rec.', val: `${calculadas.ratioRecuperacion.toFixed(1)}%`, color: '#34d399' },
            { etq: 'R.Sal', val: `${calculadas.rechazoSal.toFixed(1)}%`, color: '#34d399' },
            { etq: 'Energía', val: `${calculadas.energiaEspecifica.toFixed(2)} kWh/m³`, color: '#fbbf24' },
            { etq: 'Fouling', val: `${fouling.toFixed(1)}%`, color: fouling > 30 ? '#ef4444' : '#34d399' },
          ].map((item, i) => (
            <g key={i} transform={`translate(${i * 170}, 0)`}>
              <rect width={160} height={18} rx={2} fill="#111827" stroke="#1e293b" />
              <text x={6} y={12} fill="#4b5563" fontSize={7} fontFamily="Rajdhani,sans-serif">{item.etq}:</text>
              <text x={60} y={12} fill={item.color} fontSize={8} fontFamily="'Share Tech Mono',monospace" fontWeight="bold">{item.val}</text>
            </g>
          ))}
        </g>

        {/* ── AGUA DE ALIMENTACIÓN ── */}
        <g transform="translate(25, 220)">
          <rect width={45} height={75} rx={3} fill="#0f172a" stroke="#1e40af" strokeWidth={2} />
          <text x={22} y={28} textAnchor="middle" fill="#3b82f6" fontSize={7} fontFamily="Rajdhani,sans-serif" fontWeight="700">AGUA</text>
          <text x={22} y={38} textAnchor="middle" fill="#3b82f6" fontSize={7} fontFamily="Rajdhani,sans-serif" fontWeight="700">ALIM.</text>
          <path d="M 5 52 Q 12 45 20 52 Q 28 59 35 52 Q 42 45 42 52" fill="none" stroke="#1e40af" strokeWidth={1.5} />
        </g>

        <FlowLine points={[[70, 257], [110, 257]]} color="#3b82f6" flowing={true} />
        <CajaFiltro x={110} y={238} />
        <FlowLine points={[[165, 257], [215, 257]]} color="#3b82f6" flowing={true} />

        {/* ── BOMBA ALTA PRESIÓN P-201 ── */}
        <Pump x={248} y={257} speed={mvs.u1} label="P-201" running={enFlujo} onClick={() => setFaceplateActivo(0)} size={34} />

        {/* PT-201 */}
        <line x1={248} y1={223} x2={248} y2={200} stroke="#374151" strokeWidth={1} strokeDasharray="2 2" />
        <BurbujaInstrumento x={248} y={182} tag="PT-201"
          valor={(mvs.u1 * 0.52 + 5).toFixed(1)} unidad="bar" ok={mvs.u1 > 10} />

        {/* Línea HP hacia membranas P1 */}
        <FlowLine points={[[282, 257], [355, 257]]} color="#3b82f6" flowing={enFlujo} />

        {/* FT-201 */}
        <line x1={318} y1={257} x2={318} y2={207} stroke="#374151" strokeWidth={1} strokeDasharray="2 2" />
        <BurbujaInstrumento x={318} y={189} tag="FT-201"
          valor={cvs.y1.toFixed(1)} unidad="m³/h" ok={flowOk}
          onClick={() => setFaceplateActivo(0)} emulada={emuY1} />

        {/* ── PASO 1 — MEMBRANAS RO-201 ── */}
        <text x={455} y={105} textAnchor="middle" fill="#374151" fontSize={9} fontFamily="Rajdhani,sans-serif" fontWeight="700">
          PASO 1 — RO-201 ({fouling.toFixed(0)}% fouling)
        </text>

        {/* Colector entrada */}
        <FlowLine points={[[355, 257], [372, 257], [372, 148], [372, 257], [372, 310], [372, 365]]} color="#3b82f6" flowing={enFlujo} width={2} />

        {[148, 248, 348].map((my, i) => (
          <g key={i}>
            <FlowLine points={[[372, my + 12], [392, my + 12]]} color="#3b82f6" flowing={enFlujo} width={2} />
            <Membrane x={392} y={my} width={108} height={22} label={`RO-201${String.fromCharCode(65 + i)}`}
              flowActive={enFlujo} flowColor={colorMembrana} />
            <FlowLine points={[[446, my + 22], [446, my + 42]]} color="#22c55e" flowing={enFlujo} width={1.5} />
          </g>
        ))}

        {/* Colector permeado P1 */}
        <FlowLine points={[[446, 190], [446, 390]]} color="#22c55e" flowing={enFlujo} width={2} />

        {/* Colector concentrado P1 */}
        <FlowLine points={[[500, 148], [500, 160], [500, 248], [500, 260], [500, 348], [500, 360]]} color="#ef4444" flowing={enFlujo} width={2} />
        {[160, 260, 360].map((cy, i) => (
          <FlowLine key={i} points={[[500, cy], [520, cy]]} color="#ef4444" flowing={enFlujo} width={2} />
        ))}

        {/* AT-201 */}
        <line x1={446} y1={390} x2={480} y2={390} stroke="#374151" strokeWidth={1} strokeDasharray="2 2" />
        <BurbujaInstrumento x={500} y={390} tag="AT-201"
          valor={cvs.y2.toFixed(0)} unidad="μS/cm" ok={condOk}
          onClick={() => setFaceplateActivo(1)} emulada={emuY2} />

        {/* ── VÁLVULA CONCENTRADO VCV-202 ── */}
        <FlowLine points={[[520, 160], [550, 160], [550, 248]]} color="#ef4444" flowing={enFlujo} width={2} />
        <Valve x={550} y={270} opening={mvs.u2} label="VCV-202" onClick={() => setFaceplateActivo(1)} />
        <FlowLine points={[[550, 313], [550, 420], [610, 420]]} color="#ef4444" flowing={enFlujo} width={2} />
        <text x={625} y={424} fill="#ef4444" fontSize={8} fontFamily="Rajdhani,sans-serif" fontWeight="600">SALMUERA/RECHAZO</text>

        {/* ── BOMBA IMPULSORA P-301 (Paso 2) ── */}
        <FlowLine points={[[446, 412], [446, 450], [628, 450]]} color="#22c55e" flowing={enFlujo} width={2} />
        <Pump x={660} y={450} speed={mvs.u3} label="P-301" running={enPaso2}
          onClick={() => setFaceplateActivo(2)} size={26} />
        <FlowLine points={[[686, 450], [745, 450], [745, 258]]} color="#22c55e" flowing={enPaso2} width={2} />

        {/* ── PASO 2 — MEMBRANAS RO-301 ── */}
        <text x={825} y={105} textAnchor="middle" fill="#374151" fontSize={9} fontFamily="Rajdhani,sans-serif" fontWeight="700">PASO 2 — RO-301</text>
        <FlowLine points={[[745, 200], [745, 318]]} color="#22c55e" flowing={enPaso2} width={2} />
        {[200, 308].map((my, i) => (
          <g key={i}>
            <FlowLine points={[[745, my + 10], [765, my + 10]]} color="#22c55e" flowing={enPaso2} width={2} />
            <Membrane x={765} y={my} width={98} height={20} label={`RO-301${String.fromCharCode(65 + i)}`}
              flowActive={enPaso2} flowColor="#22c55e" />
            <FlowLine points={[[814, my + 20], [814, my + 40]]} color="#a3e635" flowing={enPaso2} width={1.5} />
          </g>
        ))}

        {/* Colector producto P2 */}
        <FlowLine points={[[814, 240], [814, 388]]} color="#a3e635" flowing={enPaso2} width={2} />

        {/* Recirculación rechazo P2 → entrada P1 */}
        <FlowLine points={[[863, 210], [905, 210], [905, 178], [372, 178], [372, 246]]}
          color="#f97316" flowing={enPaso2} width={1.5} />
        <text x={640} y={171} textAnchor="middle" fill="#f97316" fontSize={7} fontFamily="Rajdhani,sans-serif">RECHAZO P2 (RECIRCULACIÓN)</text>

        {/* ── DOSIFICACIÓN NaOH ── */}
        <g transform="translate(814, 415)">
          <rect x={-5} y={-5} width={28} height={36} rx={3} fill="#0f172a" stroke="#f97316" strokeWidth={1.5} />
          <text x={9} y={10} textAnchor="middle" fill="#f97316" fontSize={7} fontFamily="Rajdhani,sans-serif" fontWeight="700">NaOH</text>
          <text x={9} y={20} textAnchor="middle" fill="#f97316" fontSize={6} fontFamily="Rajdhani,sans-serif">DEPÓSITO</text>
        </g>
        <g transform="translate(870, 440)" onClick={() => setFaceplateActivo(3)} className="cursor-pointer">
          <circle r={13} fill="#0f172a" stroke={mvs.u4 > 5 ? '#f97316' : '#374151'} strokeWidth={1.5} />
          <text y={4} textAnchor="middle" fill={mvs.u4 > 5 ? '#f97316' : '#374151'} fontSize={8} fontFamily="Rajdhani,sans-serif" fontWeight="700">DP-401</text>
        </g>

        <FlowLine points={[[870, 427], [870, 390], [814, 390]]} color="#f97316" flowing={mvs.u4 > 5} width={1.5} />

        {/* ── DEPÓSITO PRODUCTO TK-401 ── */}
        <FlowLine points={[[814, 355], [970, 355], [970, 178]]} color="#a3e635" flowing={enPaso2} width={2.5} />
        <Tank x={950} y={138} width={65} height={155} level={cvs.y3} label="TK-401" tag="Depósito Producto" />

        {/* LT-401 */}
        <line x1={1015} y1={215} x2={1060} y2={215} stroke="#374151" strokeWidth={1} strokeDasharray="2 2" />
        <BurbujaInstrumento x={1082} y={215} tag="LT-401"
          valor={cvs.y3.toFixed(1)} unidad="%" ok={nivelOk}
          onClick={() => setFaceplateActivo(2)} emulada={emuY3} />

        {/* pHT-401 */}
        <line x1={982} y1={300} x2={982} y2={338} stroke="#374151" strokeWidth={1} strokeDasharray="2 2" />
        <BurbujaInstrumento x={982} y={358} tag="pHT-401"
          valor={cvs.y4.toFixed(2)} unidad="pH" ok={phOk}
          onClick={() => setFaceplateActivo(3)} emulada={emuY4} />

        {/* Salida producto */}
        <FlowLine points={[[1015, 290], [1120, 290], [1120, 330]]} color="#a3e635"
          flowing={enPaso2 && cvs.y3 > 5} width={2.5} />
        <text x={1135} y={334} fill="#a3e635" fontSize={8} fontFamily="Rajdhani,sans-serif" fontWeight="600">AGUA</text>
        <text x={1135} y={345} fill="#a3e635" fontSize={8} fontFamily="Rajdhani,sans-serif" fontWeight="600">PRODUCTO</text>

        {/* ── LEYENDA ── */}
        <g transform="translate(25, 498)">
          <text fill="#4b5563" fontSize={8} fontFamily="Rajdhani,sans-serif" fontWeight="700" y={0}>LEYENDA</text>
          {[
            { color: '#3b82f6', etq: 'Alimentación / Alta Presión' },
            { color: '#22c55e', etq: 'Permeado Paso 1' },
            { color: '#a3e635', etq: 'Agua Producto' },
            { color: '#ef4444', etq: 'Concentrado / Rechazo' },
            { color: '#f97316', etq: 'Químico (NaOH)' },
            { color: '#c084fc', etq: 'Variable Emulada' },
          ].map(({ color, etq }, i) => (
            <g key={i} transform={`translate(${i * 170}, 10)`}>
              <line x1={0} y1={0} x2={20} y2={0} stroke={color} strokeWidth={i === 5 ? 1 : 2.5}
                strokeDasharray={i === 5 ? '3 2' : undefined} />
              <text x={25} y={4} fill="#6b7280" fontSize={7} fontFamily="Rajdhani,sans-serif">{etq}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
