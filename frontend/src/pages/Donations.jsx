import { useState, useEffect } from "react";
import api from "../api";
import Icon from "../components/Icon";

const PRESETS = [500, 1000, 2500, 5000, 10000];
const PURPOSES = ["Student Scholarships", "Infrastructure Development", "Research & Labs", "Sports & Culture", "General Fund"];

export default function Donations({ showToast }) {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("");
  const [purpose, setPurpose] = useState("Student Scholarships");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [donated, setDonated] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get("/donations/summary"), api.get("/donations/mine")])
      .then(([s, h]) => { setSummary(s.data); setHistory(h.data); })
      .catch(() => showToast("Failed to load donations", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const effectiveAmount = parseFloat(custom) || amount;

  const handleDonate = async () => {
    if (!effectiveAmount || effectiveAmount <= 0) { showToast("Enter a valid amount", "error"); return; }
    setDonating(true);
    try {
      await api.post("/donations", { amount: effectiveAmount, purpose, message });
      showToast(`Thank you! ₹${effectiveAmount.toLocaleString()} donated.`);
      setDonated(true);
      setCustom("");
      setAmount(1000);
      setMessage("");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Donation failed", "error");
    } finally { setDonating(false); }
  };

  const totalDonated = history.reduce((s, d) => s + d.amount, 0);

  return (
    <div>
      <div className="section-title mb-8">Donations & Giving</div>
      <div className="section-subtitle mb-24">Support scholarships, infrastructure, and student programs</div>

      {/* Summary Cards */}
      <div className="grid-2 mb-20">
        {[
          { label: "Total Raised", val: `₹${((summary?.total || 0) / 100000).toFixed(1)}L`, sub: `${summary?.count || 0} donations` },
          { label: "My Contributions", val: `₹${totalDonated.toLocaleString()}`, sub: `${history.length} donations made` },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-delta">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Donate Form */}
        <div className="card">
          <div className="card-header"><div className="card-title">Make a Donation</div></div>
          <div className="card-body">
            {donated ? (
              <div className="text-center" style={{ padding: "32px 0" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>Thank You!</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>Your donation of ₹{effectiveAmount.toLocaleString()} supports our students.</div>
                <button className="btn btn-outline" onClick={() => setDonated(false)}>Make Another Donation</button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Select Amount</label>
                  <div className="flex gap-8" style={{ flexWrap: "wrap", marginBottom: 10 }}>
                    {PRESETS.map(p => (
                      <button key={p}
                        style={{
                          padding: "9px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                          border: `1.5px solid ${amount === p && !custom ? "var(--gold)" : "var(--border)"}`,
                          background: amount === p && !custom ? "rgba(200,151,58,0.1)" : "transparent",
                          color: amount === p && !custom ? "var(--gold)" : "var(--text-primary)",
                          fontSize: 13, fontWeight: 600, transition: "all 0.2s"
                        }}
                        onClick={() => { setAmount(p); setCustom(""); }}
                      >₹{p.toLocaleString()}</button>
                    ))}
                  </div>
                  <input className="form-input" placeholder="Or enter custom amount (₹)" value={custom}
                    onChange={e => { setCustom(e.target.value); setAmount(0); }} type="number" min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose</label>
                  <select className="form-input" value={purpose} onChange={e => setPurpose(e.target.value)}>
                    {PURPOSES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message (optional)</label>
                  <textarea className="form-input" rows={2} value={message} onChange={e => setMessage(e.target.value)} placeholder="Leave a message for the institution..." style={{ resize: "none" }} />
                </div>
                <button className="btn btn-gold btn-full" onClick={handleDonate} disabled={donating}>
                  <Icon name="heart" size={14} /> {donating ? "Processing..." : `Donate ₹${effectiveAmount.toLocaleString()}`}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Top Donors */}
        <div>
          <div className="card mb-20">
            <div className="card-header">
              <div className="card-title">Top Donors</div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "var(--gold)" }}>
                ₹{((summary?.total || 0) / 100000).toFixed(1)}L total
              </span>
            </div>
            <div className="card-body" style={{ padding: "10px 22px" }}>
              {loading ? (
                <div className="text-center text-muted" style={{ padding: 20 }}>Loading...</div>
              ) : (
                (summary?.topDonors || []).map((d, i) => (
                  <div key={d.id} className="flex-between" style={{ padding: "10px 0", borderBottom: i < (summary.topDonors.length - 1) ? "1px solid var(--border)" : "none" }}>
                    <div className="flex-center gap-12">
                      <span style={{ width: 24, height: 24, background: i < 3 ? "var(--gold)" : "var(--cream-dark)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i < 3 ? "var(--navy)" : "var(--text-muted)", flexShrink: 0 }}>{i + 1}</span>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{d.avatar}</div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</span>
                    </div>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: "var(--gold)" }}>₹{d.total_donated.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Purpose Breakdown */}
          {(summary?.byPurpose || []).length > 0 && (
            <div className="card">
              <div className="card-header"><div className="card-title">By Purpose</div></div>
              <div className="card-body" style={{ padding: "10px 22px" }}>
                {(summary.byPurpose || []).map((p, i) => {
                  const pct = Math.round((p.amount / summary.total) * 100);
                  return (
                    <div key={p.purpose} style={{ padding: "8px 0" }}>
                      <div className="flex-between mb-4">
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{p.purpose}</span>
                        <span className="text-xs text-muted">₹{p.amount.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="progress-bar" style={{ width: "100%" }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My History */}
      {history.length > 0 && (
        <div className="card mt-20">
          <div className="card-header"><div className="card-title">My Donation History</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Amount</th><th>Purpose</th><th>Message</th><th>Date</th></tr></thead>
              <tbody>
                {history.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, color: "var(--gold)" }}>₹{d.amount.toLocaleString()}</td>
                    <td>{d.purpose}</td>
                    <td className="text-muted">{d.message || "—"}</td>
                    <td className="text-muted">{new Date(d.donated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
