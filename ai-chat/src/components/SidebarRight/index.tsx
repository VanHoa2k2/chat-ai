import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '@/store/chatStore';
import { AppButton } from './AppButton';
import type { AppType } from '@/types';
import { BookOpen, FolderOpen, MailCheck, MessageCircle } from 'lucide-react';

interface App {
  type: AppType;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

const apps: App[] = [
  { type: 'agentChat', icon: <MessageCircle className="w-5 h-5" />, label: 'Agent Chat' },
  { type: 'files', icon: <FolderOpen className="w-5 h-5" />, label: 'Files', disabled: true },
  { type: 'mails', icon: <MailCheck className="w-5 h-5" />, label: 'Mails', disabled: true },
  { type: 'knowledgeBase', icon: <BookOpen className="w-5 h-5" />, label: 'Knowledge Base', disabled: true }
];

const SidebarRight = () => {
  const { activeApp, setActiveApp } = useChatStore(
    useShallow((state) => ({
      activeApp: state.activeApp,
      setActiveApp: state.setActiveApp,
    }))
  );
  
  const handleAppClick = useCallback((app: App) => {
    if (app.disabled) return;
    setActiveApp(app.type);
  }, [setActiveApp]);
  
  return (
    <div className="w-[60px] min-w-[60px] h-[100dvh] bg-white border-l border-oat flex flex-col items-center py-3 gap-1 sticky top-0 z-20">
      {apps.map((app) => (
        <AppButton
          key={app.type}
          {...app}
          isActive={activeApp === app.type}
          onClick={() => handleAppClick(app)}
        />
      ))}
    </div>
  );
};

export default SidebarRight;