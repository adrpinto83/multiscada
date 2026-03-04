import { usePlantStore } from '../../store/plantStore';
import Pump from './Pump';
import Membrane from './Membrane';
import Tank from './Tank';
import Valve from './Valve';
import FlowLine from './FlowLine';

// Instrument bubble component
function InstrumentBubble({ x, y, tag, value, unit, ok = true, onClick }) {
  const color = ok ? '#00d4ff' : '#ff4444';
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
      <circle r={18} fill="#0f172a" stroke={color} strokeWidth={1.5} />
      <text y={-5} textAnchor="middle" fill={color} fontSize={7} fontFamily="Rajdhani, sans-serif" fontWeight="700">{tag}</text>
      <text y={5} textAnchor="middle" fill="white" fontSize={8} fontFamily="'Share Tech Mono', monospace" fontWeight="bold">
        {value}
      </text>
      <text y={13} textAnchor="middle" fill="#6b7280" fontSize={6} fontFamily="Rajdhani, sans-serif">{unit}</text>
      {/* Click ripple */}
      {onClick && <circle r={18} fill="transparent" stroke="transparent" className="hover:stroke-cyan-scada/40 hover:stroke-2 transition-colors" />}
    </g>
  );
}

// Pre-filter box
function PreFilter({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={60} height={40} rx={4} fill="#0f172a" stroke="#374151" strokeWidth={1.5} />
      <text x={30} y={16} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="Rajdhani, sans-serif" fontWeight="700">PRE</text>
      <text x={30} y={27} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="Rajdhani, sans-serif" fontWeight="700">FILTER</text>
      {/* Filter lines */}
      {[10, 18, 26, 34, 42, 50].map(xi => (
        <line key={xi} x1={xi} y1={5} x2={xi} y2={35} stroke="#1e3a5f" strokeWidth={1} />
      ))}
    </g>
  );
}

// Dosing pump (small)
function DosingPump({ x, y, speed = 0, label = 'DP' }) {
  const color = speed > 5 ? '#f97316' : '#374151';
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={12} fill="#0f172a" stroke={color} strokeWidth={1.5} />
      <text y={3} textAnchor="middle" fill={color} fontSize={8} fontFamily="Rajdhani, sans-serif" fontWeight="700">{label}</text>
      <text y={24} textAnchor="middle" fill="#9ca3af" fontSize={7} fontFamily="Rajdhani, sans-serif">NaOH</text>
    </g>
  );
}

export default function Plant() {
  const cvs = usePlantStore(s => s.cvs);
  const mvs = usePlantStore(s => s.mvs);
  const setActiveFaceplate = usePlantStore(s => s.setActiveFaceplate);

  const isFlowing = mvs.u1 > 5;
  const isPass2 = mvs.u3 > 5;

  // Alarm status
  const flowOk = cvs.y1 >= 8;
  const condOk = cvs.y2 <= 600;
  const levelOk = cvs.y3 >= 20 && cvs.y3 <= 85;
  const phOk = cvs.y4 >= 6.5 && cvs.y4 <= 8.5;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 1200 600"
        className="w-full h-full"
        style={{ maxHeight: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a2235" strokeWidth="0.5" />
          </pattern>
          <style>{`
            @keyframes dashFlow {
              0% { stroke-dashoffset: 26; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .spin-slow { animation: spin 3s linear infinite; transform-origin: 0 0; }
            .spin-med  { animation: spin 1.5s linear infinite; transform-origin: 0 0; }
            .spin-fast { animation: spin 0.7s linear infinite; transform-origin: 0 0; }
          `}</style>
        </defs>
        <rect width="1200" height="600" fill="#0a0e1a" />
        <rect width="1200" height="600" fill="url(#grid)" />

        {/* === TITLE === */}
        <text x={600} y={28} textAnchor="middle" fill="#374151" fontSize={14} fontFamily="Rajdhani, sans-serif" fontWeight="700">
          TWO-PASS REVERSE OSMOSIS DESALINATION PLANT — P&amp;ID
        </text>

        {/* ============================================================
            FEED WATER SECTION (left)
        ============================================================= */}
        {/* Feed water source */}
        <g transform="translate(30, 220)">
          <rect width={50} height={80} rx={4} fill="#0f172a" stroke="#1e40af" strokeWidth={2} />
          <text x={25} y={30} textAnchor="middle" fill="#3b82f6" fontSize={8} fontFamily="Rajdhani, sans-serif" fontWeight="700">FEED</text>
          <text x={25} y={42} textAnchor="middle" fill="#3b82f6" fontSize={8} fontFamily="Rajdhani, sans-serif" fontWeight="700">WATER</text>
          {/* Animated wave */}
          <path d="M 5 55 Q 12 48 20 55 Q 28 62 35 55 Q 42 48 45 55" fill="none" stroke="#1e40af" strokeWidth={1.5} />
          <path d="M 5 64 Q 12 57 20 64 Q 28 71 35 64 Q 42 57 45 64" fill="none" stroke="#1e40af" strokeWidth={1} opacity={0.5} />
        </g>

        {/* Feed line to pre-filter */}
        <FlowLine
          points={[[80, 260], [120, 260]]}
          color="#3b82f6"
          flowing={true}
        />

        {/* Pre-filter */}
        <PreFilter x={120} y={240} />

        {/* Line from prefilter to HP pump */}
        <FlowLine
          points={[[180, 260], [230, 260]]}
          color="#3b82f6"
          flowing={true}
        />

        {/* ============================================================
            HP PUMP — P-201
        ============================================================= */}
        <Pump
          x={260} y={260}
          speed={mvs.u1}
          label="P-201"
          running={mvs.u1 > 5}
          onClick={() => setActiveFaceplate(0)}
          size={36}
        />

        {/* PT-201 Pressure indicator above pump */}
        <line x1={260} y1={224} x2={260} y2={200} stroke="#374151" strokeWidth={1} strokeDasharray="2 2" />
        <InstrumentBubble
          x={260} y={182}
          tag="PT-201"
          value={(mvs.u1 * 0.55 + 5).toFixed(1)}
          unit="bar"
          ok={mvs.u1 > 10}
        />

        {/* HP line from pump to RO-201 membranes */}
        <FlowLine
          points={[[296, 260], [360, 260]]}
          color="#3b82f6"
          flowing={isFlowing}
        />

        {/* FT-201 Flow indicator */}
        <line x1={328} y1={260} x2={328} y2={210} stroke="#374151" strokeWidth={1} strokeDasharray="2 2" />
        <InstrumentBubble
          x={328} y={192}
          tag="FT-201"
          value={cvs.y1.toFixed(1)}
          unit="m³/h"
          ok={flowOk}
          onClick={() => setActiveFaceplate(0)}
        />

        {/* ============================================================
            PASS 1 RO MEMBRANES — RO-201A/B/C
        ============================================================= */}
        <text x={460} y={120} textAnchor="middle" fill="#374151" fontSize={10} fontFamily="Rajdhani, sans-serif" fontWeight="700">PASS 1 — RO-201</text>
        {/* Header pipe in */}
        <FlowLine
          points={[[360, 260], [380, 260], [380, 150], [380, 260], [380, 310], [380, 370]]}
          color="#3b82f6"
          flowing={isFlowing}
          width={2}
        />

        {/* 3 Membranes in parallel */}
        {[150, 250, 350].map((my, i) => (
          <g key={i}>
            {/* Inlet line */}
            <FlowLine
              points={[[380, my + 12], [400, my + 12]]}
              color="#3b82f6"
              flowing={isFlowing}
              width={2}
            />
            <Membrane
              x={400} y={my}
              width={110} height={24}
              label={`RO-201${String.fromCharCode(65 + i)}`}
              flowActive={isFlowing}
              flowColor="#3b82f6"
            />
            {/* Permeate outlet (bottom) */}
            <FlowLine
              points={[[455, my + 24], [455, my + 45]]}
              color="#22c55e"
              flowing={isFlowing}
              width={1.5}
            />
          </g>
        ))}

        {/* Permeate collector header */}
        <FlowLine
          points={[[455, 195], [455, 395]]}
          color="#22c55e"
          flowing={isFlowing}
          width={2}
        />

        {/* Concentrate header (right side of membranes) */}
        <FlowLine
          points={[[510, 150], [510, 162], [510, 250], [510, 262], [510, 350], [510, 362]]}
          color="#ef4444"
          flowing={isFlowing}
          width={2}
        />
        {[162, 262, 362].map((cy, i) => (
          <FlowLine key={i}
            points={[[510, cy], [530, cy]]}
            color="#ef4444" flowing={isFlowing} width={2}
          />
        ))}

        {/* AT-201 conductivity on permeate line */}
        <line x1={455} y1={395} x2={490} y2={395} stroke="#374151" strokeWidth={1} strokeDasharray="2 2" />
        <InstrumentBubble
          x={510} y={395}
          tag="AT-201"
          value={cvs.y2.toFixed(0)}
          unit="μS/cm"
          ok={condOk}
          onClick={() => setActiveFaceplate(1)}
        />

        {/* ============================================================
            CONCENTRATE VALVE — VCV-202
        ============================================================= */}
        {/* Concentrate line going right to valve */}
        <FlowLine
          points={[[530, 162], [560, 162], [560, 255]]}
          color="#ef4444"
          flowing={isFlowing}
          width={2}
        />

        <Valve
          x={560} y={280}
          opening={mvs.u2}
          label="VCV-202"
          onClick={() => setActiveFaceplate(1)}
        />

        {/* Concentrate reject to drain */}
        <FlowLine
          points={[[560, 320], [560, 430], [620, 430]]}
          color="#ef4444"
          flowing={isFlowing}
          width={2}
        />
        <text x={635} y={434} fill="#ef4444" fontSize={9} fontFamily="Rajdhani, sans-serif" fontWeight="600">REJECT/BRINE</text>

        {/* ============================================================
            PASS 2 BOOSTER PUMP — P-301
        ============================================================= */}
        {/* Permeate line from Pass 1 going to booster pump */}
        <FlowLine
          points={[[455, 415], [455, 460], [640, 460]]}
          color="#22c55e"
          flowing={isFlowing}
          width={2}
        />

        <Pump
          x={680} y={460}
          speed={mvs.u3}
          label="P-301"
          running={mvs.u3 > 5}
          onClick={() => setActiveFaceplate(2)}
          size={28}
        />

        {/* Line from booster pump to Pass 2 membranes */}
        <FlowLine
          points={[[708, 460], [760, 460], [760, 260]]}
          color="#22c55e"
          flowing={isPass2}
          width={2}
        />

        {/* ============================================================
            PASS 2 RO MEMBRANES — RO-301A/B
        ============================================================= */}
        <text x={840} y={120} textAnchor="middle" fill="#374151" fontSize={10} fontFamily="Rajdhani, sans-serif" fontWeight="700">PASS 2 — RO-301</text>

        <FlowLine
          points={[[760, 200], [760, 320]]}
          color="#22c55e"
          flowing={isPass2}
          width={2}
        />

        {[200, 310].map((my, i) => (
          <g key={i}>
            <FlowLine
              points={[[760, my + 10], [780, my + 10]]}
              color="#22c55e" flowing={isPass2} width={2}
            />
            <Membrane
              x={780} y={my}
              width={100} height={20}
              label={`RO-301${String.fromCharCode(65 + i)}`}
              flowActive={isPass2}
              flowColor="#22c55e"
            />
            {/* Product permeate */}
            <FlowLine
              points={[[830, my + 20], [830, my + 40]]}
              color="#a3e635"
              flowing={isPass2}
              width={1.5}
            />
          </g>
        ))}

        {/* Product collector */}
        <FlowLine
          points={[[830, 240], [830, 390]]}
          color="#a3e635"
          flowing={isPass2}
          width={2}
        />

        {/* Pass 2 concentrate back to Pass 1 inlet (recycle) */}
        <FlowLine
          points={[[880, 210], [920, 210], [920, 180], [380, 180], [380, 248]]}
          color="#f97316"
          flowing={isPass2}
          width={1.5}
        />
        <text x={650} y={172} textAnchor="middle" fill="#f97316" fontSize={8} fontFamily="Rajdhani, sans-serif">PASS2 REJECT (RECYCLE)</text>

        {/* ============================================================
            NaOH DOSING SYSTEM
        ============================================================= */}
        <g transform="translate(830, 420)">
          <rect x={-5} y={-5} width={30} height={40} rx={3} fill="#0f172a" stroke="#f97316" strokeWidth={1.5} />
          <text x={10} y={12} textAnchor="middle" fill="#f97316" fontSize={8} fontFamily="Rajdhani, sans-serif" fontWeight="700">NaOH</text>
          <text x={10} y={22} textAnchor="middle" fill="#f97316" fontSize={6} fontFamily="Rajdhani, sans-serif">TANK</text>
        </g>

        <DosingPump x={900} y={450} speed={mvs.u4} label="DP-401" />

        {/* Dosing injection line to product */}
        <FlowLine
          points={[[900, 438], [900, 390], [830, 390]]}
          color="#f97316"
          flowing={mvs.u4 > 5}
          width={1.5}
        />

        {/* ============================================================
            PRODUCT TANK — TK-401
        ============================================================= */}
        {/* Product line to tank */}
        <FlowLine
          points={[[830, 350], [990, 350], [990, 170]]}
          color="#a3e635"
          flowing={isPass2}
          width={2.5}
        />

        <Tank
          x={970} y={140}
          width={70} height={160}
          level={cvs.y3}
          label="TK-401"
          tag="Product Tank"
        />

        {/* LT-401 Level transmitter */}
        <line x1={1040} y1={220} x2={1080} y2={220} stroke="#374151" strokeWidth={1} strokeDasharray="2 2" />
        <InstrumentBubble
          x={1100} y={220}
          tag="LT-401"
          value={cvs.y3.toFixed(1)}
          unit="%"
          ok={levelOk}
          onClick={() => setActiveFaceplate(2)}
        />

        {/* pH transmitter */}
        <line x1={1005} y1={310} x2={1005} y2={350} stroke="#374151" strokeWidth={1} strokeDasharray="2 2" />
        <InstrumentBubble
          x={1005} y={368}
          tag="pHT-401"
          value={cvs.y4.toFixed(2)}
          unit="pH"
          ok={phOk}
          onClick={() => setActiveFaceplate(3)}
        />

        {/* Product outlet */}
        <FlowLine
          points={[[1040, 300], [1130, 300], [1130, 340]]}
          color="#a3e635"
          flowing={isPass2 && cvs.y3 > 5}
          width={2.5}
        />
        <text x={1150} y={344} fill="#a3e635" fontSize={9} fontFamily="Rajdhani, sans-serif" fontWeight="600">PRODUCT</text>
        <text x={1150} y={355} fill="#a3e635" fontSize={9} fontFamily="Rajdhani, sans-serif" fontWeight="600">WATER</text>

        {/* ============================================================
            LEGEND
        ============================================================= */}
        <g transform="translate(30, 490)">
          <text fill="#4b5563" fontSize={9} fontFamily="Rajdhani, sans-serif" fontWeight="700" y={0}>LEGEND</text>
          {[
            { color: '#3b82f6', label: 'Feed / HP Water' },
            { color: '#22c55e', label: 'Pass 1 Permeate' },
            { color: '#a3e635', label: 'Product Water' },
            { color: '#ef4444', label: 'Concentrate / Reject' },
            { color: '#f97316', label: 'Chemical (NaOH)' },
          ].map(({ color, label }, i) => (
            <g key={i} transform={`translate(${i * 175}, 10)`}>
              <line x1={0} y1={0} x2={20} y2={0} stroke={color} strokeWidth={2.5} />
              <text x={25} y={4} fill="#6b7280" fontSize={8} fontFamily="Rajdhani, sans-serif">{label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
