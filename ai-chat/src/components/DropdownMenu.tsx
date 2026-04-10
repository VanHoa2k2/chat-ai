import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Pencil, Trash2 } from 'lucide-react';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  hovered: boolean;
}

export function DropdownMenuWrapper({ items, hovered }: DropdownMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button 
          className={`text-silver hover:text-charcoal p-1 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
          title="Options"
        >
          ⋮
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="bg-white border border-oat rounded-xl shadow-lg py-1 z-10 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
          align="start"
          sideOffset={8}
          style={{
            boxShadow: '0px 1px 1px rgba(0,0,0,0.1), 0px -1px 1px inset rgba(0,0,0,0.04), 0px -0.5px 1px rgba(0,0,0,0.05)',
          }}
        >
          {items.map((item, index) => (
            <DropdownMenu.Item 
              key={index}
              className={`px-4 py-2.5 text-sm hover:bg-oat-light cursor-pointer outline-none flex items-center gap-3 rounded-lg mx-1 ${
                item.danger ? 'text-red-500 hover:bg-red-50' : 'text-charcoal'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick(e);
              }}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              <span>{item.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}