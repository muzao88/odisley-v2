import { IconFlame } from '@tabler/icons-react';

export default function StreakIndicator({ streak }: { streak: number }) {
  const hasStreak = streak > 0;
  
  return (
    <div className={`streak-indicator ${hasStreak ? 'active' : ''}`} title="Dias seguidos estudando">
      <IconFlame size={20} className="streak-icon" />
      <span className="streak-count">{streak}</span>
    </div>
  );
}
