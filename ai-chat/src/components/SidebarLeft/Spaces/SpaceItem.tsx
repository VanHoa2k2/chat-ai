import { useState, useMemo, memo } from 'react';
import { Folder, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenuWrapper } from '@/components/DropdownMenu';
import type { Space } from '@/types';

interface SpaceItemProps {
  space: Space;
  sessionCount: number;
  isActive: boolean;
  onClick: () => void;
  onRename: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const SpaceItem = memo(({ 
  space, 
  sessionCount,
  isActive, 
  onClick, 
  onRename, 
  onDelete 
}: SpaceItemProps) => {
  const [hovered, setHovered] = useState(false);

  const items = useMemo(() => [
    { label: 'Rename', icon: <Pencil className="w-4 h-4" />, onClick: onRename, danger: false },
    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, danger: true }
  ], [onRename, onDelete]);

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-oat-light border border-oat' 
          : 'hover:bg-oat-light'
      }`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Folder className="w-4 h-4 text-silver" />
      <span className="text-sm text-charcoal flex-1 truncate">{space.name}</span>
      <span className="text-xs text-silver">{sessionCount}</span>
      <DropdownMenuWrapper items={items} hovered={hovered} />
    </div>
  );
});