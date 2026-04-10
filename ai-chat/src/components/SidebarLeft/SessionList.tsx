import { useState } from 'react';
import { MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useDeleteSession } from '../../hooks/useChat';
import { DropdownMenuWrapper } from '../DropdownMenu';
import type { Session } from '../../types';

export function SessionList() {
  const { sessions, activeSpace, activeSession } = useChatStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const deleteSessionMutation = useDeleteSession();

  const filteredSessions = sessions.filter((s: Session) => 
    activeSpace ? s.spaceId === activeSpace.id : !s.spaceId
  );

  const handleClick = (sessionId: string) => {
    const session = sessions.find((s: Session) => s.id === sessionId);
    if (session) {
      useChatStore.getState().setActiveSession(session);
    }
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Delete this session?')) {
      await deleteSessionMutation.mutateAsync({ sessionId });
    }
  };

  const handleRename = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const session = sessions.find((s: Session) => s.id === sessionId);
    if (!session) return;
    const newTitle = prompt('Enter new title:', session.title);
    if (newTitle && newTitle.trim() !== session.title) {
      useChatStore.getState().updateSession(session.id, { title: newTitle.trim() });
    }
  };

  return (
    <div>
      <div className="text-xs font-medium text-silver uppercase tracking-wide mb-2 px-2">
        Sessions
      </div>
      <div className="space-y-1">
        {filteredSessions.length === 0 ? (
          <div className="text-center text-silver text-sm py-4">No sessions</div>
        ) : (
          filteredSessions.map((session: Session) => (
            <div
              key={session.id}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeSession?.id === session.id 
                  ? 'bg-oat-light border border-oat' 
                  : 'hover:bg-oat-light'
              }`}
              onClick={() => handleClick(session.id)}
              onMouseEnter={() => setHoveredId(`session-${session.id}`)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <MessageCircle className="w-5 h-5 text-silver" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-charcoal truncate">{session.title}</div>
                {session.lastMessagePreview && (
                  <div className="text-xs text-silver truncate">{session.lastMessagePreview}</div>
                )}
              </div>
              <DropdownMenuWrapper
                items={[
                  { label: 'Rename', icon: <Pencil className="w-4 h-4" />, onClick: (e) => handleRename(e, session.id) },
                  { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: (e) => handleDelete(e, session.id), danger: true }
                ]}
                hovered={hoveredId === `session-${session.id}`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}