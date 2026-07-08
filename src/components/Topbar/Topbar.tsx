import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import SearchInput from './SearchInput';
import StreakIndicator from './StreakIndicator';
import NotificationsDropdown from './NotificationsDropdown';
import './topbar.css';

interface TopbarData {
  nome: string;
  streak: number;
  unreadCount: number;
  notifications: any[];
}

interface TopbarProps {
  onNavigate: (page: any) => void;
  onSelectConteudo: (id: string, nome: string) => void;
}

export default function Topbar({ onNavigate, onSelectConteudo }: TopbarProps) {
  const { isLoggedIn, user, token } = useAuth();
  const [data, setData] = useState<TopbarData | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    fetch('/api/user/topbar-data', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(json => {
      if (!json.error) setData(json);
    })
    .catch(console.error);

  }, [isLoggedIn, token]);

  if (!isLoggedIn) return null;

  const nome = data?.nome || user?.nome || 'Aluno';
  const primeiroNome = nome.split(' ')[0];

  const hora = new Date().getHours();
  let saudacao = 'Boa noite';
  if (hora >= 5 && hora < 12) saudacao = 'Bom dia';
  else if (hora >= 12 && hora < 18) saudacao = 'Boa tarde';

  return (
    <div className="topbar-container">
      <div className="topbar-left">
        <h2 className="topbar-greeting">
          Olá, {primeiroNome} <span className="wave-emoji">👋</span>
        </h2>
        <p className="topbar-subtitle">
          {saudacao}! {data?.streak === 0 ? 'Vamos começar a estudar?' : 'Pronto para manter a ofensiva?'}
        </p>
      </div>

      <div className="topbar-right">
        <SearchInput onNavigate={onNavigate} onSelectConteudo={onSelectConteudo} />
        <StreakIndicator streak={data?.streak || 0} />
        <NotificationsDropdown 
          initialCount={data?.unreadCount || 0} 
          initialNotifications={data?.notifications || []} 
        />
      </div>
    </div>
  );
}
