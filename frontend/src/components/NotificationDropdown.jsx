import { useState, useRef, useEffect } from "react";
import { X, ChevronRight, Clock, MapPin, Bell } from "lucide-react";
import RiskBadge from "./RiskBadge.jsx";
import { alerts } from "../data/alerts.js";

export default function NotificationDropdown({ onOpenProject }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = alerts.filter((a) => !a.reviewed).length;

  const handleNotificationClick = (alert) => {
    if (alert.projectId && onOpenProject) {
      onOpenProject(alert.projectId);
    }
    setIsOpen(false);
  };

  const formatTime = (timeStr) => timeStr;

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className="icon-btn notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread}`}
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown card">
          <div className="notification-header">
            <h3>Notifications</h3>
            <span className="notification-count">{alerts.length} total</span>
          </div>
          <div className="notification-list">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                className={`notification-item ${alert.reviewed ? "read" : "unread"}`}
                onClick={() => handleNotificationClick(alert)}
              >
                <div className="notification-content">
                  <div className="notification-header-row">
                    <RiskBadge level={alert.severity} />
                    <h4 className="notification-title">{alert.title}</h4>
                  </div>
                  <p className="notification-desc">{alert.description}</p>
                  <div className="notification-meta">
                    <span>
                      <MapPin size={12} aria-hidden="true" />
                      {alert.location}
                    </span>
                    <span>
                      <Clock size={12} aria-hidden="true" />
                      {alert.time}
                    </span>
                    <span>Ref · {alert.id}</span>
                  </div>
                  {alert.recommendedAction && (
                    <p className="notification-action">
                      <b>Recommended:</b> {alert.recommendedAction}
                    </p>
                  )}
                </div>
                {!alert.reviewed && <span className="unread-dot" />}
              </button>
            ))}
          </div>
          <div className="notification-footer">
            <button className="btn btn-outline" onClick={() => setIsOpen(false)}>
              View All Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}