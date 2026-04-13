import { AgentRoleList } from './AgentRoleList';
import { SpaceList } from './SpaceList';
import { SessionList } from './SessionList';
import { NewChatButton, NewSpaceButton } from './Buttons';

export default function SidebarLeft() {
  return (
    <div className="w-60 min-w-[240px] h-screen bg-white border-r border-oat flex flex-col sticky top-0">
      <div className="p-4 border-b border-oat">
        <h1 className="text-lg font-semibold text-charcoal">AI Chat</h1>
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