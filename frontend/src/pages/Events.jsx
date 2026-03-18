import { useState, useEffect } from "react";
import api from "../api";
import Icon from "../components/Icon";

export default function Events({ showToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchEvents = () => {
    setLoading(true);
    const params = {};
    if (filter !== "all") params.status = filter;
    api.get("/events", { params })
      .then(r => setEvents(r.data))
      .catch(() => showToast("Failed to load events", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [filter]);

  const toggleRegistration = async (id) => {
    try {
      const { data } = await api.post(`/events/${id}/register`);
      showToast(data.registered ? "Registered for event!" : "Unregistered from event");
      setEvents(prev => prev.map(e =>
        e.id === id
          ? { ...e, registered: data.registered, attendees: data.registered ? e.attendees + 1 : e.attendees - 1 }
          : e
      ));
    } catch (err) {
      showToast(err.response?.data?.error || "Action failed", "error");
    }
  };

  const filtered = filter === "all" ? events : events;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-title">Events & Programs</div>
          <div className="section-subtitle">Institutional events, seminars, and alumni meets</div>
        </div>
        <button className="btn btn-gold"><Icon name="plus" size={14} /> Create Event</button>
      </div>

      <div className="filter-bar">
        {["all", "upcoming", "completed"].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>Loading events...</div>
      ) : (
        filtered.map(ev => {
          const d = new Date(ev.event_date);
          const pct = Math.min(Math.round((ev.attendees / ev.capacity) * 100), 100);
          return (
            <div key={ev.id} className="event-card">
              <div className="event-date-box">
                <div className="day">{d.getDate()}</div>
                <div className="month">{d.toLocaleString("default", { month: "short" })}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex-between gap-8 mb-8">
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--navy)" }}>{ev.title}</div>
                  <span className={`badge badge-${ev.status}`}>{ev.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>{ev.description}</div>
                <div className="flex gap-16" style={{ flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>📍 {ev.location}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>🎯 {ev.type}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>👥 {ev.attendees}/{ev.capacity}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <div className="progress-bar" style={{ width: 120 }}>
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{pct}% full</span>
                </div>
              </div>
              {ev.status === "upcoming" && (
                <div style={{ display: "flex", alignItems: "flex-start", paddingTop: 2 }}>
                  <button
                    className={`btn btn-sm ${ev.registered ? "btn-danger" : "btn-gold"}`}
                    onClick={() => toggleRegistration(ev.id)}
                  >
                    {ev.registered ? "Unregister" : "Register"}
                  </button>
                </div>
              )}
              {ev.status === "completed" && ev.registered && (
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <span className="badge badge-active"><Icon name="check" size={11} /> Attended</span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
