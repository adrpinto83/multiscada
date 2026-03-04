import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { usePlantStore } from './store/plantStore';
import { Scheduler } from './engine/scheduler';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import StatusBar from './components/Layout/StatusBar';
import Overview from './pages/Overview';
import Trends from './pages/Trends';
import Controllers from './pages/Controllers';
import Alarms from './pages/Alarms';

export default function App() {
  const onSimUpdate = usePlantStore(s => s.onSimUpdate);
  const setPidMode = usePlantStore(s => s.setPidMode);
  const setPidSP = usePlantStore(s => s.setPidSP);
  const setPidManualOutput = usePlantStore(s => s.setPidManualOutput);
  const tunePid = usePlantStore(s => s.tunePid);
  const setCascade = usePlantStore(s => s.setCascade);
  const applyDisturbance = usePlantStore(s => s.applyDisturbance);

  const schedulerRef = useRef(null);

  // Bridge store actions to scheduler
  const pids = usePlantStore(s => s.pids);
  const cascadeEnabled = usePlantStore(s => s.cascadeEnabled);
  const disturbances = usePlantStore(s => s.disturbances);

  useEffect(() => {
    const scheduler = new Scheduler(onSimUpdate);
    schedulerRef.current = scheduler;
    scheduler.start();

    return () => {
      scheduler.stop();
    };
  }, []); // only run once

  // Sync store PID mode changes to scheduler
  useEffect(() => {
    if (!schedulerRef.current) return;
    pids.forEach((pid, i) => {
      const schPid = schedulerRef.current.pids[i];
      if (schPid.mode !== pid.mode) {
        schedulerRef.current.setPidMode(i, pid.mode);
      }
      if (Math.abs(schPid.sp - pid.sp) > 0.001) {
        schedulerRef.current.setPidSP(i, pid.sp);
      }
      if (pid.mode === 'manual' && Math.abs(schPid.mv - pid.mvVal) > 0.1) {
        schedulerRef.current.setPidManualOutput(i, pid.mvVal);
      }
      // Sync tuning
      if (Math.abs(schPid.Kp - pid.Kp) > 0.001 || Math.abs(schPid.Ki - pid.Ki) > 0.001 || Math.abs(schPid.Kd - pid.Kd) > 0.001) {
        schedulerRef.current.tunePid(i, { Kp: pid.Kp, Ki: pid.Ki, Kd: pid.Kd });
      }
    });
  }, [pids]);

  // Sync cascade
  useEffect(() => {
    if (!schedulerRef.current) return;
    schedulerRef.current.setCascade(cascadeEnabled);
  }, [cascadeEnabled]);

  // Sync disturbances
  useEffect(() => {
    if (!schedulerRef.current) return;
    schedulerRef.current.setDisturbance(disturbances.d1, disturbances.d2);
  }, [disturbances]);

  return (
    <div className="flex flex-col h-screen bg-navy-900 text-white overflow-hidden">
      {/* Top navbar */}
      <Navbar />

      {/* Main area: sidebar + content */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar />

        {/* Page content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/controllers" element={<Controllers />} />
            <Route path="/alarms" element={<Alarms />} />
          </Routes>
        </main>
      </div>

      {/* Bottom status bar */}
      <StatusBar />
    </div>
  );
}
