import { useChatStore } from '../../store/chatStore';
import type { AppType } from '../../types';

interface App {
  type: AppType;
  icon: string;
  label: string;
  disabled?: boolean;
}

const apps: App[] = [
  { type: 'agentChat', icon: '💬', label: 'Agent Chat' },
  { type: 'files', icon: '📁', label: 'Files', disabled: true },
  { type: 'mails', icon: '✉️', label: 'Mails', disabled: true },
  { type: 'knowledgeBase', icon: '📚', label: 'Knowledge Base', disabled: true }
];

export default function SidebarRight() {
  const { activeApp, setActiveApp } = useChatStore();
  
  const handleAppClick = (app: App) => {
    if (app.disabled) return;
    setActiveApp(app.type);
  };
  
  return (
    <div className="w-[60px] min-w-[60px] h-screen bg-white border-l border-oat flex flex-col items-center py-3 gap-1">
      {apps.map((app) => {
        const isActive = activeApp === app.type;
        const isDisabled = app.disabled;
        
        return (
          <button
            key={app.type}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl cursor-pointer transition-all border-0 ${
              isActive 
                ? 'bg-cream' 
                : 'bg-transparent opacity-40 hover:opacity-100'
            } ${isDisabled ? 'opacity-20 cursor-not-allowed' : ''}`}
            onClick={() => handleAppClick(app)}
            disabled={isDisabled}
            title={isDisabled ? `${app.label} (Coming soon)` : app.label}
          >
            {app.icon}
          </button>
        );
      })}
    </div>
  );
}