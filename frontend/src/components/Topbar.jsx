import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const TITLES = {
  "/dashboard":  "Dashboard",
  "/alumni":     "Alumni Directory",
  "/events":     "Events & Programs",
  "/mentorship": "Mentorship Program",
  "/jobs":       "Jobs & Internships",
  "/donations":  "Donations & Giving",
};

export default function Topbar({ onToggleSidebar, searchValue, onSearchChange }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = TITLES[pathname] || "Alumni Connect";

  return (
    <div className="topbar">
      <button className="icon-btn" onClick={onToggleSidebar}>
        <Icon name="menu" size={16} />
      </button>
      <div className="topbar-title" style={{ flex: 1 }}>{title}</div>

      <div className="search-box">
        <Icon name="search" size={14} color="var(--text-muted)" />
        <input
          placeholder="Search..."
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className="icon-btn" title="Notifications">
        <Icon name="bell" size={16} />
        <div className="notif-dot" />
      </div>

      <div className="topbar-avatar" title={user?.name}>
        {user?.avatar || "??"}
      </div>
    </div>
  );
}
