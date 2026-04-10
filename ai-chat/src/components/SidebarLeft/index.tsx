import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useChatStore } from '../../store/chatStore';
import { useCreateSession, useCreateSpace, useDeleteSpace, useDeleteSession, useSelectSpace, useSelectSession } from '../../hooks/useChat';
import type { AgentRole, Space, Session } from '../../types';

export default function SidebarLeft() {
  const { 
    agentRoles,
    activeAgentRole,
    activeSpace,
    activeSession,
    sessions,
    spaces,
    setActiveAgentRole 
  } = useChatStore();
  
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [newChatHover, setNewChatHover] = useState(false);
  const [newSpaceHover, setNewSpaceHover] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openSpaceMenuId, setOpenSpaceMenuId] = useState<string | null>(null);
  
  const createSessionMutation = useCreateSession();
  const createSpaceMutation = useCreateSpace();
  const deleteSpaceMutation = useDeleteSpace();
  const deleteSessionMutation = useDeleteSession();
  const selectSpaceMutation = useSelectSpace();
  const selectSessionMutation = useSelectSession();

  const handleNewChat = async () => {
    await createSessionMutation.mutateAsync({ 
      agentRoleId: activeAgentRole?.id 
    });
  };

  const handleNewSpace = async () => {
    const name = prompt('Enter space name:');
    if (name) {
      await createSpaceMutation.mutateAsync({ name });
    }
  };

  const handleAgentRoleClick = (agent: AgentRole) => {
    if (activeAgentRole?.id === agent.id) {
      setActiveAgentRole(null);
    } else {
      setActiveAgentRole(agent);
    }
  };

  const handleDeleteSpace = async (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    if (confirm('Delete this space and all its sessions?')) {
      await deleteSpaceMutation.mutateAsync({ spaceId });
    }
    setOpenSpaceMenuId(null);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Delete this session?')) {
      await deleteSessionMutation.mutateAsync({ sessionId });
    }
    setOpenMenuId(null);
  };

  const handleRenameSession = async (e: React.MouseEvent, session: Session) => {
    e.stopPropagation();
    const newTitle = prompt('Enter new title:', session.title);
    if (newTitle && newTitle.trim() !== session.title) {
      useChatStore.getState().updateSession(session.id, { title: newTitle.trim() });
    }
    setOpenMenuId(null);
  };

  const handleRenameSpace = async (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    const newName = prompt('Enter space name:', space.name);
    if (newName && newName.trim() !== space.name) {
      useChatStore.getState().updateSpace(space.id, { name: newName.trim() });
    }
    setOpenSpaceMenuId(null);
  };

  const handleToggleMenu = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === sessionId ? null : sessionId);
  };

  const handleSpaceClick = (space: Space) => {
    selectSpaceMutation.mutate({ space });
  };

  const handleSessionClick = (session: Session) => {
    selectSessionMutation.mutate({ session, agentRole: null });
  };

  return (
    <div className="w-60 min-w-[240px] h-screen bg-white border-r border-oat flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-oat">
        <h1 className="text-lg font-semibold text-charcoal">AI Chat</h1>
      </div>

      {/* New Chat Button */}
      <button
        className={`mx-3 mt-3 px-3 py-2 flex items-center gap-2 rounded-lg border border-dashed cursor-pointer text-sm font-medium transition-colors ${
          newChatHover 
            ? 'bg-oat-light border-oat' 
            : 'bg-cream border-oat hover:bg-oat-light'
        }`}
        onClick={handleNewChat}
        onMouseEnter={() => setNewChatHover(true)}
        onMouseLeave={() => setNewChatHover(false)}
      >
        <span>+</span>
        <span>New Chat</span>
      </button>

      <nav className="flex-1 overflow-y-auto p-3">
        {/* Agent Roles */}
        <div className="mb-4">
          <div className="text-xs font-medium text-silver uppercase tracking-wide mb-2 px-2">
            Agent Roles
          </div>
          <div className="space-y-1">
            {agentRoles.map((agent: AgentRole) => (
              <div
                key={agent.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeAgentRole?.id === agent.id 
                    ? 'bg-oat-light border border-oat' 
                    : 'hover:bg-oat-light'
                }`}
                onClick={() => handleAgentRoleClick(agent)}
                onMouseEnter={() => setHoveredItem(`agent-${agent.id}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className="text-lg">{agent.icon}</span>
                <span className="text-sm text-charcoal">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spaces */}
        <div className="mb-4">
          <div className="text-xs font-medium text-silver uppercase tracking-wide mb-2 px-2 flex items-center justify-between">
            <span>Spaces</span>
          </div>
          <div className="space-y-1">
            {spaces.map((space: Space) => (
              <div
                key={space.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeSpace?.id === space.id 
                    ? 'bg-oat-light border border-oat' 
                    : 'hover:bg-oat-light'
                }`}
                onClick={() => handleSpaceClick(space)}
                onMouseEnter={() => setHoveredItem(`space-${space.id}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: space.color }}
                />
                <span className="text-sm text-charcoal flex-1 truncate">{space.name}</span>
                <span className="text-xs text-silver">{space.sessionCount}</span>
                <DropdownMenu.Root onOpenChange={(open) => setOpenSpaceMenuId(open ? space.id : null)}>
                  <DropdownMenu.Trigger asChild>
                    <button 
                      className={`text-silver hover:text-charcoal p-1 ${hoveredItem === `space-${space.id}` ? 'opacity-100' : 'opacity-0'}`}
                      onClick={(e) => e.stopPropagation()}
                      title="Options"
                    >
                      ⋮
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content 
                      className="bg-white border border-oat rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
                      align="start"
                      sideOffset={5}
                    >
                      <DropdownMenu.Item 
                        className="px-3 py-2 text-sm text-charcoal hover:bg-oat-light cursor-pointer outline-none"
                        onClick={(e) => handleRenameSpace(e, space)}
                      >
                        Rename
                      </DropdownMenu.Item>
                      <DropdownMenu.Item 
                        className="px-3 py-2 text-sm text-red-500 hover:bg-oat-light cursor-pointer outline-none"
                        onClick={(e) => handleDeleteSpace(e, space.id)}
                      >
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            ))}
          </div>
        </div>

        {/* New Space Button */}
        <button
        className={`w-full px-3 py-2 flex items-center gap-2 rounded-lg border border-dashed cursor-pointer text-sm font-medium transition-colors mb-4 ${
          newSpaceHover 
            ? 'bg-oat-light border-oat' 
            : 'bg-cream border-oat hover:bg-oat-light'
        }`}
          onClick={handleNewSpace}
          onMouseEnter={() => setNewSpaceHover(true)}
          onMouseLeave={() => setNewSpaceHover(false)}
        >
          <span>+</span>
          <span>New Space</span>
        </button>

        {/* Sessions */}
        <div>
          <div className="text-xs font-medium text-silver uppercase tracking-wide mb-2 px-2">
            Sessions
          </div>
          <div className="space-y-1">
            {sessions
              .filter((s: Session) => activeSpace ? s.spaceId === activeSpace.id : !s.spaceId)
              .map((session: Session) => (
                <div
                  key={session.id}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeSession?.id === session.id 
                      ? 'bg-oat-light border border-oat' 
                      : 'hover:bg-oat-light'
                  }`}
                  onClick={() => handleSessionClick(session)}
                  onMouseEnter={() => setHoveredItem(`session-${session.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className="text-lg">💬</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-charcoal truncate">{session.title}</div>
                    {session.lastMessagePreview && (
                      <div className="text-xs text-silver truncate">{session.lastMessagePreview}</div>
                    )}
                  </div>
                  <DropdownMenu.Root onOpenChange={(open) => setOpenMenuId(open ? session.id : null)}>
                      <DropdownMenu.Trigger asChild>
                        <button 
                          className={`text-silver hover:text-charcoal p-1 ${hoveredItem === `session-${session.id}` ? 'opacity-100' : 'opacity-0'}`}
                          onClick={(e) => e.stopPropagation()}
                          title="Options"
                        >
                          ⋮
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content 
                          className="bg-white border border-oat rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
                          align="start"
                          sideOffset={5}
                        >
                          <DropdownMenu.Item 
                            className="px-3 py-2 text-sm text-charcoal hover:bg-oat-light cursor-pointer outline-none"
                            onClick={(e) => handleRenameSession(e, session)}
                          >
                            Rename
                          </DropdownMenu.Item>
                          <DropdownMenu.Item 
                            className="px-3 py-2 text-sm text-red-500 hover:bg-oat-light cursor-pointer outline-none"
                            onClick={(e) => handleDeleteSession(e, session.id)}
                          >
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
              ))}
            {sessions.filter((s: Session) => activeSpace ? s.spaceId === activeSpace.id : !s.spaceId).length === 0 && (
              <div className="text-center text-silver text-sm py-4">No sessions</div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}