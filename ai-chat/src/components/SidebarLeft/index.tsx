import { AgentRoleList } from './AgentRoleList';
import { SpaceList } from './SpaceList';
import { SessionList } from './SessionList';
import { NewChatButton, NewSpaceButton } from './Buttons';
import { useChatStore } from '../../store/chatStore';
import { X } from 'lucide-react';

export default function SidebarLeft() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useChatStore();
  
  return (
    <div className={`sidebar-left w-60 min-w-[240px] h-[100dvh] bg-white border-r border-oat flex flex-col sticky top-0 ${mobileSidebarOpen ? 'open' : ''}`}>
      <div className="p-4 border-b border-oat flex items-center justify-between">
        <h1 className="text-lg font-semibold text-charcoal">AI Chat</h1>
        <button 
          className="md:hidden p-1 hover:bg-oat-light rounded"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <NewChatButton />

      <nav className="flex-1 overflow-y-auto p-3">
        <AgentRoleList />
        <NewSpaceButton />
        <SpaceList />
        <SessionList />
      </nav>
    </div>
  );
}