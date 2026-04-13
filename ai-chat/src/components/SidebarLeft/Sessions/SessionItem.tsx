import { useState, useMemo, memo } from 'react';
import { MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenuWrapper } from '@/components/DropdownMenu';
import type { Session } from '@/types';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
  onRename: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const SessionItem = memo(({ 
  session, 
  isActive, 
  onClick, 
  onRename, 
  onDelete 
}: SessionItemProps) => {
  const [hovered, setHovered] = useState(false);

  const items = useMemo(() => [
    { label: 'Rename', icon: <Pencil className="w-4 h-4" />, onClick: onRename, danger: false },
    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, danger: true }
  ], [onRename, onDelete]);

  return (
    <div
      className={`relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-oat-light border border-oat' 
          : 'hover:bg-oat-light'
      }`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MessageCircle className="w-5 h-5 text-silver" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-charcoal truncate">{session.title}</div>
        {session.lastMessagePreview && (
          <div className="text-xs text-silver truncate">{session.lastMessagePreview}</div>
        )}
      </div>
      <DropdownMenuWrapper items={items} hovered={hovered} />
    </div>
  );
});