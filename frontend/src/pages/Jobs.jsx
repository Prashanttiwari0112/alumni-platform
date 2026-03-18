import { useState, useEffect } from "react";
import api from "../api";
import Icon from "../components/Icon";

function PostJobModal({ onClose, onPost }) {
  const [form, setForm] = useState({ title: "", company: "", description: "", location: "", type: "Full-time", skills: "" });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.company) return;
    setLoading(true);
    try {
      await onPost({ ...form, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean) });
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><div className="card-title">Post an Opportunity</div><div className="text-sm text-muted mt-8">Share a job or internship from your company</div></div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Job Title *</label><input className="form-input" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Frontend Developer" /></div>
            <div className="form-group"><label className="form-label">Company *</label><input className="form-input" value={form.company} onChange={e => set("company", e.target.value)} placeholder="Google" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => set("location", e.target.value)} placeholder="Bangalore" /></div>
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => set("type", e.target.value)}>
                <option>Full-time</option><option>Internship</option><option>Part-time</option><option>Contract</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Skills (comma-separated)</label><input className="form-input" value={form.skills} onChange={e => set("skills", e.target.value)} placeholder="React, TypeScript, Node.js" /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Role description..." style={{ resize: "vertical" }} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSubmit} disabled={loading}><Icon name="plus" size={14} />{loading ? "Posting..." : "Post Job"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Jobs({ showToast }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [applying, setApplying] = useState(null);
  const [showPost, setShowPost] = useState(false);

  const fetchJobs = () => {
    setLoading(true);
    api.get("/jobs")
      .then(r => setJobs(r.data))
      .catch(() => showToast("Failed to load jobs", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const filtered = filter === "all" ? jobs : jobs.filter(j => j.type === filter);

  const applyJob = async (id) => {
    setApplying(id);
    try {
      await api.post(`/jobs/${id}/apply`);
      showToast("Application submitted successfully!");
      setJobs(prev => prev.map(j => j.id === id ? { ...j, applied: true } : j));
    } catch (err) {
      showToast(err.response?.data?.error || "Application failed", "error");
    } finally { setApplying(null); }
  };

  const postJob = async (form) => {
    await api.post("/jobs", form);
    showToast("Job posted successfully!");
    fetchJobs();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-title">Jobs & Internships</div>
          <div className="section-subtitle">Opportunities shared by our alumni network</div>
        </div>
        <button className="btn btn-gold" onClick={() => setShowPost(true)}><Icon name="plus" size={14} /> Post Opportunity</button>
      </div>

      <div className="filter-bar">
        {["all", "Full-time", "Internship", "Part-time", "Contract"].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>Loading jobs...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(j => (
            <div key={j.id} className="card" style={{ padding: "20px 24px", display: "flex", gap: 18 }}>
              <div style={{ flex: 1 }}>
                <div className="flex-between gap-8 mb-8">
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--navy)" }}>{j.title}</div>
                  <span className={`badge ${j.type === "Internship" ? "badge-mentor" : "badge-active"}`}>{j.type}</span>
                </div>
                <div className="text-gold font-600 mb-8">{j.company}</div>
                <div className="text-xs text-muted mb-8">
                  Posted by <span className="font-600" style={{ color: "var(--text-secondary)" }}>{j.poster_name}</span>
                  · {new Date(j.created_at).toLocaleDateString()}
                </div>
                {j.description && <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>{j.description}</div>}
                <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
                  {j.location && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>📍 {j.location}</span>}
                  {(j.skills || []).map(s => <span key={s} className="skill-chip">{s}</span>)}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {j.applied ? (
                  <button className="btn btn-sm btn-outline" disabled><Icon name="check" size={12} /> Applied</button>
                ) : (
                  <button className="btn btn-gold btn-sm" disabled={applying === j.id} onClick={() => applyJob(j.id)}>
                    {applying === j.id ? "Applying..." : "Apply Now"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>No opportunities found.</div>
          )}
        </div>
      )}

      {showPost && <PostJobModal onClose={() => setShowPost(false)} onPost={postJob} />}
    </div>
  );
}
