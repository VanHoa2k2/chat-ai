import { useState } from 'react';
import { Folder, Pencil, Trash2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useDeleteSpace } from '../../hooks/useChat';
import { DropdownMenuWrapper } from '../DropdownMenu';

export function SpaceList() {
  const { spaces, sessions, activeSpace } = useChatStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const deleteSpaceMutation = useDeleteSpace();

  const handleClick = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    if (space) {
      useChatStore.getState().setActiveSpace(space);
    }
  };

  const handleDelete = async (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    if (confirm('Delete this space and all its sessions?')) {
      await deleteSpaceMutation.mutateAsync({ spaceId });
    }
  };

  const handleRename = (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return;
    const newName = prompt('Enter space name:', space.name);
    if (newName && newName.trim() !== space.name) {
      useChatStore.getState().updateSpace(space.id, { name: newName.trim() });
    }
  };

  const getSessionCount = (spaceId: string) => sessions.filter(s => s.spaceId === spaceId).length;

  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-silver uppercase tracking-wide mb-2 px-2 flex items-center justify-between">
        <span>Spaces</span>
      </div>
      <div className="space-y-1">
        {spaces.map((space) => (
          <div
            key={space.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeSpace?.id === space.id 
                ? 'bg-oat-light border border-oat' 
                : 'hover:bg-oat-light'
            }`}
            onClick={() => handleClick(space.id)}
            onMouseEnter={() => setHoveredId(`space-${space.id}`)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Folder className="w-4 h-4 text-silver" />
            <span className="text-sm text-charcoal flex-1 truncate">{space.name}</span>
            <span className="text-xs text-silver">{getSessionCount(space.id)}</span>
            <DropdownMenuWrapper
              items={[
                { label: 'Rename', icon: <Pencil className="w-4 h-4" />, onClick: (e) => handleRename(e, space.id) },
                { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: (e) => handleDelete(e, space.id), danger: true }
              ]}
              hovered={hoveredId === `space-${space.id}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}