import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import AuthForm from "./pages/AuthForm";
import Overview from "./pages/Overview";
import Resources from "./pages/Resources";
import DependencyMap from "./pages/DependencyMap";
import Predictions from "./pages/Predictions";
import Anomalies from "./pages/Anomalies";
import Bottlenecks from "./pages/Bottlenecks";
import Simulator from "./pages/Simulator";
import Recommendations from "./pages/Recommendations";
import Actions from "./pages/Actions";
import Cost from "./pages/Cost";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import LiveMetrics from "./pages/LiveMetrics";
import { AuthProvider } from "./context/AuthContext";
import { api } from "./api/client";

const TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/metrics": "Live metrics",
  "/app/resources": "Resources",
  "/app/dependency": "Dependency map",
  "/app/predictions": "Predictions",
  "/app/anomalies": "Anomalies",
  "/app/bottlenecks": "Bottlenecks",
  "/app/simulator": "Simulator",
  "/app/recommendations": "Recommendations",
  "/app/actions": "Actions",
  "/app/cost": "Cost intelligence",
  "/app/activity": "Activity",
  "/app/settings": "Settings",
};

function AppShell() {
  const location = useLocation();
  const [mode, setMode] = useState("demo");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.health().then((h) => setMode(h.mode)).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar 
          title={TITLES[location.pathname] || "CloudFlip"} 
          mode={mode} 
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <div className="flex-1 overflow-y-auto p-4 sm:p-7">

          <Routes>
            <Route index element={<Overview />} />
            <Route path="metrics" element={<LiveMetrics />} />
            <Route path="resources" element={<Resources />} />
            <Route path="dependency" element={<DependencyMap />} />
            <Route path="predictions" element={<Predictions />} />
            <Route path="anomalies" element={<Anomalies />} />
            <Route path="bottlenecks" element={<Bottlenecks />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="actions" element={<Actions />} />
            <Route path="cost" element={<Cost />} />
            <Route path="activity" element={<Activity />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<AuthForm mode="login" />} />
        <Route path="/signup" element={<AuthForm mode="signup" />} />
        <Route path="/app/*" element={<AppShell />} />
      </Routes>
    </AuthProvider>
  );
}
