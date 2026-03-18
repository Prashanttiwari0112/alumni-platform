import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const NAV_ITEMS = [
  { to: "/dashboard",   label: "Dashboard",         icon: "dashboard" },
  { to: "/alumni",      label: "Alumni Directory",   icon: "users" },
  { to: "/events",      label: "Events",             icon: "calendar" },
  { to: "/mentorship",  label: "Mentorship",         icon: "award" },
  { to: "/jobs",        label: "Jobs & Internships", icon: "briefcase" },
  { to: "/donations",   label: "Donations",          icon: "heart" },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">A</div>
        {!collapsed && (
          <div>
            <div className="logo-title">Alumni Connect</div>
            <div className="logo-sub">Alumni Portal</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="nav-section">
        {!collapsed && <div className="nav-label">Main Menu</div>}
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            title={collapsed ? label : undefined}
          >
            <Icon name={icon} size={18} />
            {!collapsed && <span className="nav-text">{label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div className="user-card" onClick={handleLogout} title="Logout">
          <div className="user-avatar-sm">{user?.avatar || "??"}</div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div className="user-name">{user?.name}</div>
                <div className="user-role" style={{ textTransform: "capitalize" }}>{user?.role}</div>
              </div>
              <Icon name="logout" size={15} color="rgba(255,255,255,0.3)" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
