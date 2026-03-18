import { useState, useEffect } from "react";
import api from "../api";
import Icon from "../components/Icon";

export default function Mentorship({ showToast }) {
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/mentorship/mentors"),
      api.get("/mentorship/requests"),
    ]).then(([m, r]) => {
      setMentors(m.data);
      setRequests(r.data);
    }).catch(() => showToast("Failed to load mentors", "error"))
      .finally(() => setLoading(false));
  }, []);

  const hasRequested = (mentorId) =>
    requests.some(r => r.mentor_id === mentorId && r.status === "pending");

  const sendRequest = async (mentor) => {
    setSending(mentor.user_id);
    try {
      await api.post("/mentorship/request", { mentor_id: mentor.user_id, message: "I'd love to connect for guidance!" });
      showToast(`Request sent to ${mentor.name}!`);
      const { data } = await api.get("/mentorship/requests");
      setRequests(data);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to send request", "error");
    } finally {
      setSending(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-title">Mentorship Program</div>
          <div className="section-subtitle">Connect with industry experts from our alumni network</div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div className="card" style={{ padding: 22, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 52, height: 52, background: "var(--navy)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="award" size={22} color="#C8973A" />
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: "var(--navy)" }}>{mentors.length}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Active Mentors</div>
            <div className="text-xs text-muted">Available for sessions</div>
          </div>
        </div>
        <div className="card" style={{ padding: 22, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 52, height: 52, background: "var(--navy)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="calendar" size={22} color="#C8973A" />
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: "var(--navy)" }}>{requests.length}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>My Requests</div>
            <div className="text-xs text-muted">Sent & received</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>Loading mentors...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mentors.map(m => {
            const requested = hasRequested(m.user_id);
            return (
              <div key={m.id} className="card" style={{ padding: 22, display: "flex", gap: 16 }}>
                <div className="avatar" style={{ width: 52, height: 52, fontSize: 18 }}>{m.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex-center gap-12 mb-4">
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--navy)" }}>{m.name}</div>
                    <div className="flex-center gap-8">
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)", animation: "pulse 2s infinite" }} />
                      <span style={{ fontSize: 11, color: "var(--success)" }}>Available</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                    {m.job_title} at <span className="text-gold font-600">{m.company}</span>
                  </div>
                  <div className="flex gap-8" style={{ flexWrap: "wrap", marginBottom: 6 }}>
                    {(m.skills || []).map(s => <span key={s} className="skill-chip">{s}</span>)}
                  </div>
                  <div className="text-xs text-muted">📍 {m.location} · Class of {m.batch}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button
                    className={`btn btn-sm ${requested ? "btn-outline" : "btn-gold"}`}
                    disabled={requested || sending === m.user_id}
                    onClick={() => sendRequest(m)}
                  >
                    {sending === m.user_id ? "Sending..." : requested ? "✓ Requested" : "Request Session"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {requests.length > 0 && (
        <div className="card mt-20">
          <div className="card-header"><div className="card-title">My Mentorship Requests</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Mentor</th><th>Mentee</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td><div className="flex-center gap-8"><div className="avatar" style={{ width: 28, height: 28, fontSize: 10 }}>{r.mentor_avatar}</div>{r.mentor_name}</div></td>
                    <td><div className="flex-center gap-8"><div className="avatar" style={{ width: 28, height: 28, fontSize: 10 }}>{r.mentee_avatar}</div>{r.mentee_name}</div></td>
                    <td><span className={`badge badge-${r.status === "accepted" ? "active" : r.status === "rejected" ? "closed" : "upcoming"}`}>{r.status}</span></td>
                    <td className="text-muted">{new Date(r.requested_at).toLocaleDateString()}</td>
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
