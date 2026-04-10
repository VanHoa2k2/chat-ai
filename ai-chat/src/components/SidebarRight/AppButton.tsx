import type { AppType } from '../../types';

interface AppButtonProps {
  type: AppType;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function AppButton({ icon, label, isActive, disabled, onClick }: AppButtonProps) {
  return (
    <button
      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl cursor-pointer transition-all border-0 ${
        isActive 
          ? 'bg-cream' 
          : 'bg-transparent opacity-40 hover:opacity-100'
      } ${disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? `${label} (Coming soon)` : label}
    >
      {icon}
    </button>
  );
}