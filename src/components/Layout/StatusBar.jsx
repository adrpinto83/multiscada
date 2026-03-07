import { useLocation } from 'react-router-dom';
import { usePlantStore } from '../../store/plantStore';
import { useCafeStore } from '../../store/cafeStore';

export default function StatusBar() {
  const location = useLocation();
  const isCafe = location.pathname.startsWith('/cafe');

  // RO
  const roCvs = usePlantStore(s => s.cvs);
  const roMvs = usePlantStore(s => s.mvs);
  const roCalc = usePlantStore(s => s.calculadas);
  const roAlarmas = usePlantStore(s => s.alarmas);
  const roEmu = usePlantStore(s => s.emulacion);

  // Café
  const cafeCvs = useCafeStore(s => s.cvs);
  const cafeMvs = useCafeStore(s => s.mvs);
  const cafeCalc = useCafeStore(s => s.calculadas);
  const cafeAlarmas = useCafeStore(s => s.alarmas);
  const cafeEmu = useCafeStore(s => s.emulacion);

  const alarmas = isCafe ? cafeAlarmas : roAlarmas;
  const emulacion = isCafe ? cafeEmu : roEmu;
  const activas = alarmas.filter(a => a.estado !== 'BORRADA').length;
  const emuActivas = Object.values(emulacion).filter(e => e.activa).length;

  const tags = isCafe ? [
    { tag: 'TT-001',  etq: 'T Tambor',     valor: cafeCvs.y1.toFixed(0), unidad: '°C',    ok: cafeCvs.y1 >= 160 && cafeCvs.y1 <= 240, emu: cafeEmu.y1?.activa },
    { tag: 'MT-001',  etq: 'Humedad',       valor: cafeCvs.y2.toFixed(2), unidad: '%',     ok: cafeCvs.y2 <= 5, emu: cafeEmu.y2?.activa },
    { tag: 'TT-002',  etq: 'T Gases',       valor: cafeCvs.y3.toFixed(0), unidad: '°C',    ok: cafeCvs.y3 <= 200, emu: cafeEmu.y3?.activa },
    { tag: 'CT-001',  etq: 'Color Agtron',  valor: cafeCvs.y4.toFixed(0), unidad: 'Ag',    ok: cafeCvs.y4 >= 35 && cafeCvs.y4 <= 80, emu: cafeEmu.y4?.activa },
    { tag: 'TASA',    etq: 'Tasa Cal.',     valor: cafeCalc.tasaCalentamiento.toFixed(1), unidad: '°/min', ok: true, emu: false },
    { tag: 'GRADO',   etq: 'Grado',         valor: cafeCalc.gradoTostado, unidad: '',       ok: cafeCalc.gradoTostado !== 'QUEMADO', emu: false },
    { tag: 'FD',      etq: 'Desarrollo',    valor: cafeCalc.factorDesarrollo.toFixed(1), unidad: '%', ok: true, emu: false },
    { tag: 'ENERGIA', etq: 'Energía',       valor: cafeCalc.consumoEnergia.toFixed(0), unidad: 'kcal/kg', ok: cafeCalc.consumoEnergia < 1200, emu: false },
  ] : [
    { tag: 'FT-201',  etq: 'Flujo Permeado', valor: roCvs.y1.toFixed(2), unidad: 'm³/h',  ok: roCvs.y1 >= 8, emu: roEmu.y1?.activa },
    { tag: 'AT-201',  etq: 'Conductividad',  valor: roCvs.y2.toFixed(0), unidad: 'μS/cm', ok: roCvs.y2 <= 600, emu: roEmu.y2?.activa },
    { tag: 'LT-401',  etq: 'Nivel Depósito', valor: roCvs.y3.toFixed(1), unidad: '%',     ok: roCvs.y3 >= 20 && roCvs.y3 <= 85, emu: roEmu.y3?.activa },
    { tag: 'pHT-401', etq: 'pH Producto',    valor: roCvs.y4.toFixed(2), unidad: 'pH',    ok: roCvs.y4 >= 6.5 && roCvs.y4 <= 8.5, emu: roEmu.y4?.activa },
    { tag: 'RR',      etq: 'Rec.',           valor: roCalc.ratioRecuperacion.toFixed(1), unidad: '%', ok: true, emu: false },
    { tag: 'RS',      etq: 'Rechazo Sal',    valor: roCalc.rechazoSal.toFixed(1), unidad: '%', ok: true, emu: false },
    { tag: 'SE',      etq: 'Energía',        valor: roCalc.energiaEspecifica.toFixed(2), unidad: 'kWh/m³', ok: roCalc.energiaEspecifica < 5, emu: false },
    { tag: 'DP-M',    etq: 'ΔP Memb.',       valor: roCalc.presionDiferencial.toFixed(1), unidad: 'bar', ok: roCalc.presionDiferencial < 10, emu: false },
  ];

  const accentColor = isCafe ? 'text-amber-400' : 'text-cyan-scada';

  return (
    <div className="h-8 bg-navy-800 border-t border-cyan-scada/10 flex items-center px-4 gap-6 shrink-0 overflow-x-auto">
      {tags.map(t => (
        <div key={t.tag} className="flex items-center gap-1.5 shrink-0">
          {t.emu && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
          <span className="font-label text-[11px] text-gray-500">{t.tag}</span>
          <span className={`font-mono text-[11px] font-bold ${t.emu ? 'text-purple-400' : t.ok ? accentColor : 'text-red-400'}`}>
            {t.valor} <span className="text-gray-600 font-normal">{t.unidad}</span>
          </span>
        </div>
      ))}

      <div className="ml-auto flex items-center gap-3 shrink-0">
        {emuActivas > 0 && (
          <span className="font-mono text-[11px] text-purple-400">EMU:{emuActivas}</span>
        )}
        <div className={`w-2 h-2 rounded-full ${activas > 0 ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
        <span className="font-label text-[11px] text-gray-400">
          {activas > 0 ? `${activas} ALARMA${activas !== 1 ? 'S' : ''} ACTIVA${activas !== 1 ? 'S' : ''}` : 'PROCESO NORMAL'}
        </span>
      </div>
    </div>
  );
}
