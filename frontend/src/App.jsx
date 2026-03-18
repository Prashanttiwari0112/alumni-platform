import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Toast from "./components/Toast";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AlumniDirectory from "./pages/AlumniDirectory";
import Events from "./pages/Events";
import Mentorship from "./pages/Mentorship";
import Jobs from "./pages/Jobs";
import Donations from "./pages/Donations";

// ── Toast context helper ─────────────────────────────────────────────────────
export let globalToast = () => {};

// ── Protected layout ─────────────────────────────────────────────────────────
function AppLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, key: Date.now() });
  }, []);

  globalToast = showToast;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      <div className="main">
        <Topbar
          onToggleSidebar={() => setCollapsed(p => !p)}
          searchValue={search}
          onSearchChange={setSearch}
        />
        <div className="content">
          <Routes>
            <Route path="/dashboard"  element={<Dashboard  showToast={showToast} />} />
            <Route path="/alumni"     element={<AlumniDirectory showToast={showToast} search={search} />} />
            <Route path="/events"     element={<Events     showToast={showToast} />} />
            <Route path="/mentorship" element={<Mentorship showToast={showToast} />} />
            <Route path="/jobs"       element={<Jobs       showToast={showToast} />} />
            <Route path="/donations"  element={<Donations  showToast={showToast} />} />
            <Route path="*"           element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
      {toast && (
        <Toast
          key={toast.key}
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginGate />} />
        <Route path="/*"     element={<AppLayout />} />
      </Routes>
    </AuthProvider>
  );
}

function LoginGate() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login />;
}
