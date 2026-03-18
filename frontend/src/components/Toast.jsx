import { useEffect } from "react";
import Icon from "./Icon";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "var(--gold)",
    error:   "var(--danger)",
    info:    "var(--info)",
  };

  return (
    <div className="toast">
      <Icon name={type === "error" ? "x" : "check"} size={15} color={colors[type]} />
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "0 0 0 8px" }}>
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
