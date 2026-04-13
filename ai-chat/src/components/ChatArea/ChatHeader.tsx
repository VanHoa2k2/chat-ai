import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '@/store/chatStore';
import { getAgentIcon } from '../utils/agentIcon';

export const ChatHeader = () => {
  const { activeAgentRole, activeSession, activeSpace } = useChatStore(
    useShallow((state) => ({
      activeAgentRole: state.activeAgentRole,
      activeSession: state.activeSession,
      activeSpace: state.activeSpace,
    }))
  );
  
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
          {getAgentIcon(activeAgentRole, false)}
          <span>{activeAgentRole.name}</span>
        </div>
      )}
    </div>
  );
}