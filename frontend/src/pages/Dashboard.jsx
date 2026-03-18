import { useState, useEffect } from "react";
import api from "../api";
import Icon from "../components/Icon";

function StatCard({ label, value, delta, icon, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon name={icon} size={52} color={accent} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? "—"}</div>
      {delta && <div className="stat-delta">↑ {delta}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/stats/dashboard")
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading dashboard...</div>;

  const byDept = stats?.byDept || [];
  const maxDept = Math.max(...byDept.map(d => d.count), 1);

  return (
    <div>
      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard label="Total Alumni"    value={stats?.totalAlumni}    delta="Registered"        icon="users"     accent="rgba(200,151,58,0.8)" />
        <StatCard label="Active Members"  value={stats?.activeAlumni}   delta="Currently active"  icon="trending"  accent="rgba(46,139,87,0.8)" />
        <StatCard label="Upcoming Events" value={stats?.upcomingEvents} delta="Scheduled"          icon="calendar"  accent="rgba(36,113,163,0.8)" />
        <StatCard label="Total Donations" value={`₹${((stats?.totalDonations || 0) / 100000).toFixed(1)}L`} delta="Raised so far" icon="heart" accent="rgba(192,57,43,0.8)" />
      </div>

      <div className="grid-2 mb-20">
        {/* Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Alumni by Department</div>
            <span className="text-xs text-muted">{byDept.length} departments</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 130, marginTop: 10 }}>
              {byDept.map(d => (
                <div key={d.department} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--navy)" }}>{d.count}</span>
                  <div style={{
                    width: "100%", borderRadius: "5px 5px 0 0",
                    background: "linear-gradient(to top, var(--navy), var(--navy-light))",
                    height: `${Math.max((d.count / maxDept) * 100, 8)}px`,
                    transition: "height 0.5s"
                  }} />
                  <span style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.2 }}>
                    {d.department.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-header"><div className="card-title">Network Overview</div></div>
          <div className="card-body" style={{ padding: "12px 22px" }}>
            {[
              { label: "Active Mentors",      val: stats?.mentors,      icon: "award",     color: "var(--gold)" },
              { label: "Open Job Listings",   val: stats?.totalJobs,    icon: "briefcase", color: "var(--info)" },
              { label: "Total Events Held",   val: stats?.totalEvents,  icon: "calendar",  color: "var(--success)" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 40, height: 40, background: "var(--cream)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={item.icon} size={18} color={item.color} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>{item.val ?? "—"}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alumni Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Alumni</div>
          <span className="text-xs text-muted">Latest registrations</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Batch</th><th>Department</th><th>Company</th><th>Status</th></tr>
            </thead>
            <tbody>
              {(stats?.recentAlumni || []).map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="flex-center gap-8">
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{a.avatar}</div>
                      <span className="font-600">{a.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{a.batch}</td>
                  <td>{a.department}</td>
                  <td className="text-gold font-600">{a.company || "—"}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
