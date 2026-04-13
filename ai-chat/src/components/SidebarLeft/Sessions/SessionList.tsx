import { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '@/store/chatStore';
import { useDeleteSession } from '@/hooks/useChat';
import { SessionItem } from './SessionItem';
import type { Session } from '@/types';

export const SessionList = () => {
  const { sessions, activeSpace, activeSession } = useChatStore(
    useShallow((state) => ({
      sessions: state.sessions,
      activeSpace: state.activeSpace,
      activeSession: state.activeSession,
    }))
  );
  const deleteSessionMutation = useDeleteSession();

  const filteredSessions = useMemo(() => sessions.filter((s: Session) => 
    activeSpace ? s.spaceId === activeSpace.id : !s.spaceId
  ), [sessions, activeSpace]);

  const handleClick = useCallback((sessionId: string) => {
    const session = sessions.find((s: Session) => s.id === sessionId);
    if (session) {
      useChatStore.getState().setActiveSession(session);
    }
  }, [sessions]);

  const handleDelete = useCallback(async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Delete this session?')) {
      await deleteSessionMutation.mutateAsync({ sessionId });
    }
  }, [deleteSessionMutation]);

  const handleRename = useCallback((e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const session = sessions.find((s: Session) => s.id === sessionId);
    if (!session) return;
    const newTitle = prompt('Enter new title:', session.title);
    if (newTitle && newTitle.trim() !== session.title) {
      useChatStore.getState().updateSession(session.id, { title: newTitle.trim() });
    }
  }, [sessions]);

  const sessionItems = useMemo(() => 
    filteredSessions.map((session: Session) => ({
      session,
      isActive: activeSession?.id === session.id,
      onClick: () => handleClick(session.id),
      onRename: (e: React.MouseEvent) => handleRename(e, session.id),
      onDelete: (e: React.MouseEvent) => handleDelete(e, session.id),
    })), 
    [filteredSessions, activeSession, handleClick, handleRename, handleDelete]
  );

  return (
    <div>
      <div className="text-xs font-medium text-silver uppercase tracking-wide mb-2 px-2">
        Sessions
      </div>
      <div className="space-y-1">
        {sessionItems.length === 0 ? (
          <div className="text-center text-silver text-sm py-4">No sessions</div>
        ) : (
          sessionItems.map((item) => (
            <SessionItem
              key={item.session.id}
              session={item.session}
              isActive={item.isActive}
              onClick={item.onClick}
              onRename={item.onRename}
              onDelete={item.onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}