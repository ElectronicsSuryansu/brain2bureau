import React, { useEffect } from 'react';
import "../styles/Toast.css";

export default function Toast({ open, message, duration = 2500, onClose }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;
  return (
    <div className="toast-root">
      <div className="toast-card">{message}</div>
    </div>
  );
}
