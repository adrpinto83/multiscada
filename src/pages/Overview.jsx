import Plant from '../components/PnID/Plant';
import AlarmBanner from '../components/Alarms/AlarmBanner';
import DisturbancePanel from '../components/Disturbances/DisturbancePanel';
import TrendPanel from '../components/Trends/TrendPanel';
import PidFaceplate from '../components/PID/PidFaceplate';
import { usePlantStore } from '../store/plantStore';

export default function Overview() {
  const activeFaceplate = usePlantStore(s => s.activeFaceplate);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Alarm banner */}
      <AlarmBanner />

      {/* Main content: P&ID + mini trends */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* P&ID — main area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Plant />
        </div>

        {/* Right panel — mini trends */}
        <div className="w-72 border-l border-cyan-scada/10 overflow-hidden flex flex-col bg-navy-800/50">
          <div className="px-3 py-2 border-b border-gray-700/50">
            <span className="font-label text-xs text-gray-400 uppercase tracking-wider">Live Trends</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <TrendPanel compact={true} />
          </div>
        </div>
      </div>

      {/* Disturbance panel (collapsible, bottom) */}
      <DisturbancePanel />

      {/* PID Faceplate modal */}
      {activeFaceplate !== null && <PidFaceplate />}
    </div>
  );
}
