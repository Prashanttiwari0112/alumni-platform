import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEMO_ACCOUNTS = [
  { role: "Admin",   email: "admin@alumni.edu",   label: "Admin" },
  { role: "Alumni",  email: "priya@alumni.edu",   label: "Alumni" },
  { role: "Student", email: "student@alumni.edu", label: "Student" },
];

export default function Login() {
  const [mode, setMode] = useState("login");     // login | register
  const [role, setRole] = useState("Alumni");
  const [form, setForm] = useState({ name: "", email: "priya@alumni.edu", password: "password123" });
  const [error, setError] = useState("");
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fillDemo = (acc) => {
    setRole(acc.role);
    setForm(p => ({ ...p, email: acc.email, password: "password123" }));
  };

  const handleSubmit = async () => {
    setError("");
    let res;
    if (mode === "login") {
      res = await login(form.email, form.password);
    } else {
      if (!form.name) { setError("Name is required"); return; }
      res = await register(form.name, form.email, form.password, role.toLowerCase());
    }
    if (res.success) navigate("/dashboard");
    else setError(res.error);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">A</div>
        <div className="login-title">Alumni Connect</div>
        <div className="login-sub">
          {mode === "login" ? "Sign in to your institutional portal" : "Create a new account"}
        </div>

        {/* Demo Quickfill */}
        {mode === "login" && (
          <>
            <div style={{ marginBottom: 6, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>Quick Demo Login</div>
            <div className="login-roles" style={{ marginBottom: 20 }}>
              {DEMO_ACCOUNTS.map(a => (
                <div
                  key={a.role}
                  className={`login-role ${role === a.role ? "selected" : ""}`}
                  onClick={() => fillDemo(a)}
                >
                  {a.label}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Register only */}
        {mode === "register" && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your full name" />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@alumni.edu" />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>

        {error && (
          <div style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--danger)", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? `Sign In` : "Create Account"}
        </button>

        <div className="divider"><span className="divider-text">or</span></div>

        <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          {mode === "login" ? (
            <>Don't have an account? <span className="link" onClick={() => setMode("register")}>Register here</span></>
          ) : (
            <>Already have an account? <span className="link" onClick={() => setMode("login")}>Sign in</span></>
          )}
        </div>
      </div>
    </div>
  );
}
