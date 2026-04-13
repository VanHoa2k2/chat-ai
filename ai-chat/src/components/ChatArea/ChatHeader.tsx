import { useChatStore } from '../../store/chatStore';
import { Laptop, Search, BarChart2, Pencil } from 'lucide-react';
import type { AgentRole } from '../../types';

const iconMap: Record<string, React.ReactNode> = {
  laptop: <Laptop className="w-5 h-5" />,
  pencil: <Pencil className="w-5 h-5" />,
  search: <Search className="w-5 h-5" />,
  barChart: <BarChart2 className="w-5 h-5" />,
};

function getAgentIcon(agent: AgentRole) {
  if (typeof agent.icon === 'string' && iconMap[agent.icon]) {
    return iconMap[agent.icon];
  }
  return <span>{agent.icon}</span>;
}

export function ChatHeader() {
  const { activeAgentRole, activeSession, activeSpace } = useChatStore();
  
  let title = 'Welcome';
  let subtitle = 'Select a chat or start a new conversation';
  
  if (activeAgentRole) {
    title = activeAgentRole.name;
    subtitle = activeAgentRole.description;
  } else if (activeSession) {
    title = activeSession.title;
    if (activeSpace) {
      subtitle = activeSpace.name;
    }
  }
  
  return (
    <div className="chat-header flex items-center justify-between px-4 py-3 min-h-[60px] sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-black m-0">{title}</h2>
          {subtitle && <p className="text-sm text-silver m-0">{subtitle}</p>}
        </div>
      </div>
      {activeAgentRole && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-oat-light rounded-full text-sm font-medium">
          <span style={{ color: activeAgentRole.color }}>{getAgentIcon(activeAgentRole)}</span>
          <span>{activeAgentRole.name}</span>
        </div>
      )}
    </div>
  );
}