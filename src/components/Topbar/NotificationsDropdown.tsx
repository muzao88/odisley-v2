import { useState, useRef, useEffect } from 'react';
import { IconBell } from '@tabler/icons-react';
import { useAuth } from '../AuthContext';

export default function NotificationsDropdown({ 
  initialCount, 
  initialNotifications 
}: { 
  initialCount: number; 
  initialNotifications: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [notifications, setNotifications] = useState(initialNotifications);
  const { token } = useAuth();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCount(initialCount);
    setNotifications(initialNotifications);
  }, [initialCount, initialNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && count > 0 && token) {
      // Mark as read
      fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        setCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
      }).catch(console.error);
    }
  };

  return (
    <div className="notifications-wrapper" ref={wrapperRef}>
      <button className="notifications-btn" onClick={handleOpen}>
        <IconBell size={20} />
        {count > 0 && <span className="notifications-badge" />}
      </button>

      {isOpen && (
        <div className="notifications-dropdown glass-panel">
          <div className="notifications-header">
            <h3>Notificações</h3>
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="notifications-empty">Nenhuma notificação por enquanto.</div>
            ) : (
              notifications.map((notif, idx) => (
                <div key={notif._id || idx} className={`notification-item ${!notif.lida ? 'unread' : ''}`}>
                  <h4>{notif.titulo}</h4>
                  <p>{notif.mensagem}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
