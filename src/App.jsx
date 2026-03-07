import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { usePlantStore } from './store/plantStore';
import { useCafeStore } from './store/cafeStore';
import { Planificador } from './engine/scheduler';
import { PlanificadorCafe } from './engine/cafeScheduler';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import StatusBar from './components/Layout/StatusBar';

// RO pages
import Overview from './pages/Overview';
import Tendencias from './pages/Tendencias';
import Controladores from './pages/Controladores';
import Alarmas from './pages/Alarmas';
import Emulacion from './pages/Emulacion';

// Café pages
import CafeOverview from './pages/cafe/Overview';
import CafeTendencias from './pages/cafe/Tendencias';
import CafeControladores from './pages/cafe/Controladores';
import CafeAlarmas from './pages/cafe/Alarmas';
import CafeEmulacion from './pages/cafe/Emulacion';

// Selector
import ProcessSelector from './pages/ProcessSelector';

function AppLayout({ children }) {
  const location = useLocation();
  const isSelector = location.pathname === '/';

  if (isSelector) {
    return <div className="flex flex-col h-screen bg-navy-900 text-white overflow-hidden">{children}</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-navy-900 text-white overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}

export default function App() {
  // ── RO store bindings ──────────────────────────────────────────────────────
  const alActualizarSim = usePlantStore(s => s.alActualizarSim);
  const pids = usePlantStore(s => s.pids);
  const cascadaActiva = usePlantStore(s => s.cascadaActiva);
  const perturbaciones = usePlantStore(s => s.perturbaciones);
  const emulacion = usePlantStore(s => s.emulacion);
  const limpiarMembranasSolicitado = usePlantStore(s => s.limpiarMembranasSolicitado);
  const confirmarLimpiezaMembranas = usePlantStore(s => s.confirmarLimpiezaMembranas);

  // ── Café store bindings ────────────────────────────────────────────────────
  const alActualizarCafeSim = useCafeStore(s => s.alActualizarSim);
  const cafePids = useCafeStore(s => s.pids);
  const cafePerturbaciones = useCafeStore(s => s.perturbaciones);
  const cafeEmulacion = useCafeStore(s => s.emulacion);

  const planificadorRef = useRef(null);
  const planificadorCafeRef = useRef(null);

  // ── Iniciar ambos planificadores ───────────────────────────────────────────
  useEffect(() => {
    const ro = new Planificador(alActualizarSim);
    const cafe = new PlanificadorCafe(alActualizarCafeSim);
    planificadorRef.current = ro;
    planificadorCafeRef.current = cafe;
    ro.iniciar();
    cafe.iniciar();
    return () => { ro.detener(); cafe.detener(); };
  }, []);

  // ── Sincronizar RO ─────────────────────────────────────────────────────────
  useEffect(() => {
    const pl = planificadorRef.current;
    if (!pl) return;
    pids.forEach((pid, i) => {
      const schPid = pl.pids[i];
      if (schPid.mode !== pid.modo) pl.setPidModo(i, pid.modo);
      if (Math.abs(schPid.sp - pid.sp) > 0.001) pl.setPidSP(i, pid.sp);
      if (pid.modo === 'manual' && Math.abs(schPid.mv - pid.mvVal) > 0.1)
        pl.setPidSalidaManual(i, pid.mvVal);
      if (
        Math.abs(schPid.Kp - pid.Kp) > 0.001 ||
        Math.abs(schPid.Ki - pid.Ki) > 0.001 ||
        Math.abs(schPid.Kd - pid.Kd) > 0.001
      ) pl.ajustarPid(i, { Kp: pid.Kp, Ki: pid.Ki, Kd: pid.Kd });
    });
  }, [pids]);

  useEffect(() => {
    planificadorRef.current?.setCascada(cascadaActiva);
  }, [cascadaActiva]);

  useEffect(() => {
    planificadorRef.current?.setPerturbacion(perturbaciones.d1, perturbaciones.d2);
  }, [perturbaciones]);

  useEffect(() => {
    planificadorRef.current?.setEmulacion(emulacion);
  }, [emulacion]);

  useEffect(() => {
    if (limpiarMembranasSolicitado) {
      planificadorRef.current?.limpiarMembranas();
      confirmarLimpiezaMembranas();
    }
  }, [limpiarMembranasSolicitado]);

  // ── Sincronizar Café ───────────────────────────────────────────────────────
  useEffect(() => {
    const pl = planificadorCafeRef.current;
    if (!pl) return;
    cafePids.forEach((pid, i) => {
      const schPid = pl.pids[i];
      if (schPid.mode !== pid.modo) pl.setPidModo(i, pid.modo);
      if (Math.abs(schPid.sp - pid.sp) > 0.001) pl.setPidSP(i, pid.sp);
      if (pid.modo === 'manual' && Math.abs(schPid.mv - pid.mvVal) > 0.1)
        pl.setPidSalidaManual(i, pid.mvVal);
      if (
        Math.abs(schPid.Kp - pid.Kp) > 0.001 ||
        Math.abs(schPid.Ki - pid.Ki) > 0.001 ||
        Math.abs(schPid.Kd - pid.Kd) > 0.001
      ) pl.ajustarPid(i, { Kp: pid.Kp, Ki: pid.Ki, Kd: pid.Kd });
    });
  }, [cafePids]);

  useEffect(() => {
    planificadorCafeRef.current?.setPerturbacion(cafePerturbaciones.d1, cafePerturbaciones.d2);
  }, [cafePerturbaciones]);

  useEffect(() => {
    planificadorCafeRef.current?.setEmulacion(cafeEmulacion);
  }, [cafeEmulacion]);

  return (
    <Routes>
      <Route path="/" element={
        <AppLayout>
          <ProcessSelector />
        </AppLayout>
      } />

      {/* ── RO routes ── */}
      <Route path="/ro/visgeneral"    element={<AppLayout><Overview /></AppLayout>} />
      <Route path="/ro/tendencias"    element={<AppLayout><Tendencias /></AppLayout>} />
      <Route path="/ro/controladores" element={<AppLayout><Controladores /></AppLayout>} />
      <Route path="/ro/emulacion"     element={<AppLayout><Emulacion /></AppLayout>} />
      <Route path="/ro/alarmas"       element={<AppLayout><Alarmas /></AppLayout>} />

      {/* ── Café routes ── */}
      <Route path="/cafe/visgeneral"    element={<AppLayout><CafeOverview /></AppLayout>} />
      <Route path="/cafe/tendencias"    element={<AppLayout><CafeTendencias /></AppLayout>} />
      <Route path="/cafe/controladores" element={<AppLayout><CafeControladores /></AppLayout>} />
      <Route path="/cafe/emulacion"     element={<AppLayout><CafeEmulacion /></AppLayout>} />
      <Route path="/cafe/alarmas"       element={<AppLayout><CafeAlarmas /></AppLayout>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
