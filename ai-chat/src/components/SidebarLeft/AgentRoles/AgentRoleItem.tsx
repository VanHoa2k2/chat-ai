import { memo } from 'react';
import type { AgentRole } from '@/types';
import { getAgentIcon } from '@/components/utils/agentIcon';

interface AgentRoleItemProps {
  agent: AgentRole;
  isActive: boolean;
  onClick: () => void;
}

export const AgentRoleItem = memo(({ 
  agent, 
  isActive, 
  onClick 
}: AgentRoleItemProps) => {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-oat-light border border-oat' 
          : 'hover:bg-oat-light'
      }`}
      onClick={onClick}
    >
      {getAgentIcon(agent)}
      <span className="text-sm text-charcoal">{agent.name}</span>
    </div>
  );
});