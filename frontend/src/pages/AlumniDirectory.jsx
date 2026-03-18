import { useState, useEffect } from "react";
import api from "../api";
import Icon from "../components/Icon";

function AlumniModal({ alumni, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg, var(--navy), var(--navy-mid))", padding: "28px", borderRadius: "16px 16px 0 0", display: "flex", gap: 18, alignItems: "center" }}>
          <div className="avatar" style={{ width: 68, height: 68, fontSize: 24, background: "var(--gold)", color: "var(--navy)", border: "3px solid rgba(255,255,255,0.15)" }}>{alumni.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "var(--white)" }}>{alumni.name}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>{alumni.job_title} · {alumni.company}</div>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <span className={`badge badge-${alumni.status}`}>{alumni.status}</span>
              <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Class of {alumni.batch}</span>
            </div>
          </div>
          <button className="icon-btn" style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white" }} onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="modal-body">
          {[
            ["Department", alumni.department],
            ["Email",      alumni.email],
            ["Phone",      alumni.phone || "—"],
            ["Location",   alumni.location || "—"],
            ["Bio",        alumni.bio || "—"],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", gap: 8, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ width: 110, fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0, paddingTop: 2 }}>{label}</span>
              <span style={{ fontSize: 14 }}>{val}</span>
            </div>
          ))}
          {alumni.skills?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="text-xs text-muted font-600 mb-8" style={{ letterSpacing: "0.5px", textTransform: "uppercase" }}>Skills</div>
              <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
                {alumni.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-gold btn-sm"><Icon name="mail" size={13} />Send Email</button>
        </div>
      </div>
    </div>
  );
}

function AddAlumniModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ batch: "", department: "", job_title: "", company: "", location: "", phone: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.batch || !form.department) return;
    setLoading(true);
    try {
      await onAdd(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="card-title">Add Alumni Profile</div>
            <div className="text-sm text-muted mt-8">Create a new alumni record</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Batch Year *</label><input className="form-input" value={form.batch} onChange={e => set("batch", e.target.value)} placeholder="2023" /></div>
            <div className="form-group"><label className="form-label">Department *</label><input className="form-input" value={form.department} onChange={e => set("department", e.target.value)} placeholder="Computer Science" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Job Title</label><input className="form-input" value={form.job_title} onChange={e => set("job_title", e.target.value)} placeholder="Software Engineer" /></div>
            <div className="form-group"><label className="form-label">Company</label><input className="form-input" value={form.company} onChange={e => set("company", e.target.value)} placeholder="Google" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => set("location", e.target.value)} placeholder="Bangalore" /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" /></div>
          </div>
          <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input" rows={3} value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Short bio..." style={{ resize: "vertical" }} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSubmit} disabled={loading}>
            <Icon name="plus" size={14} />{loading ? "Saving..." : "Add Alumni"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlumniDirectory({ showToast, search }) {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchAlumni = () => {
    setLoading(true);
    const params = {};
    if (filter !== "all") params.status = filter;
    if (search) params.search = search;
    api.get("/alumni", { params })
      .then(r => setAlumni(r.data))
      .catch(() => showToast("Failed to load alumni", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlumni(); }, [filter, search]);

  const handleAdd = async (form) => {
    await api.post("/alumni", form);
    showToast("Alumni added successfully!");
    fetchAlumni();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-title">Alumni Directory</div>
          <div className="section-subtitle">{loading ? "Loading..." : `${alumni.length} alumni found`}</div>
        </div>
        <button className="btn btn-gold" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={14} /> Add Alumni
        </button>
      </div>

      <div className="filter-bar">
        {["all", "active", "mentor", "donor"].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>Loading alumni...</div>
      ) : (
        <div className="alumni-grid">
          {alumni.map(a => (
            <div key={a.id} className="alumni-card" onClick={() => setSelected(a)}>
              <div className="flex gap-12 mb-16">
                <div className="avatar" style={{ width: 48, height: 48, fontSize: 16 }}>{a.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--navy)", marginBottom: 2 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.job_title || "—"}</div>
                  <div style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>{a.company || "—"}</div>
                </div>
                <span className={`badge badge-${a.status}`}>{a.status}</span>
              </div>
              <div className="flex gap-8" style={{ flexWrap: "wrap", marginBottom: 12 }}>
                {(a.skills || []).slice(0, 3).map(s => <span key={s} className="skill-chip">{s}</span>)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
                <span>📍 {a.location || "—"} · {a.batch}</span>
                <span className="text-gold font-600">{a.department}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <AlumniModal alumni={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddAlumniModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}
