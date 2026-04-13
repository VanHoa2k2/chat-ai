import { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '@/store/chatStore';
import { useDeleteSpace } from '@/hooks/useChat';
import { SpaceItem } from './SpaceItem';
import type { Space, Session } from '@/types';

export const SpaceList = () => {
  const { spaces, sessions, activeSpace } = useChatStore(
    useShallow((state) => ({
      spaces: state.spaces,
      sessions: state.sessions,
      activeSpace: state.activeSpace,
    }))
  );
  const deleteSpaceMutation = useDeleteSpace();

  const sessionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    spaces.forEach((s: Space) => {
      counts[s.id] = sessions.filter((sess: Session) => sess.spaceId === s.id).length;
    });
    return counts;
  }, [spaces, sessions]);

  const handleClick = useCallback((spaceId: string) => {
    const space = spaces.find((s: Space) => s.id === spaceId);
    if (space) {
      useChatStore.getState().setActiveSpace(space);
    }
  }, [spaces]);

  const handleDelete = useCallback(async (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    if (confirm('Delete this space and all its sessions?')) {
      await deleteSpaceMutation.mutateAsync({ spaceId });
    }
  }, [deleteSpaceMutation]);

  const handleRename = useCallback((e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    const space = spaces.find((s: Space) => s.id === spaceId);
    if (!space) return;
    const newName = prompt('Enter space name:', space.name);
    if (newName && newName.trim() !== space.name) {
      useChatStore.getState().updateSpace(space.id, { name: newName.trim() });
    }
  }, [spaces]);

  const spaceItems = useMemo(() => 
    spaces.map((space: Space) => ({
      space,
      sessionCount: sessionCounts[space.id] || 0,
      isActive: activeSpace?.id === space.id,
      onClick: () => handleClick(space.id),
      onRename: (e: React.MouseEvent) => handleRename(e, space.id),
      onDelete: (e: React.MouseEvent) => handleDelete(e, space.id),
    })), 
    [spaces, sessionCounts, activeSpace, handleClick, handleRename, handleDelete]
  );

  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-silver uppercase tracking-wide mb-2 px-2 flex items-center justify-between">
        <span>Spaces</span>
      </div>
      <div className="space-y-1">
        {spaceItems.map((item) => (
          <SpaceItem
            key={item.space.id}
            space={item.space}
            sessionCount={item.sessionCount}
            isActive={item.isActive}
            onClick={item.onClick}
            onRename={item.onRename}
            onDelete={item.onDelete}
          />
        ))}
      </div>
    </div>
  );
}