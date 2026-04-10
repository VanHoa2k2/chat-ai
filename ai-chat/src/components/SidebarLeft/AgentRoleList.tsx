import { Laptop, Search, BarChart2, Pencil } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import type { AgentRole } from '../../types';

const iconMap: Record<string, React.ReactNode> = {
  laptop: <Laptop className="w-5 h-5" />,
  pencil: <Pencil className="w-5 h-5" />,
  search: <Search className="w-5 h-5" />,
  barChart: <BarChart2 className="w-5 h-5" />,
};

function getAgentIcon(agent: AgentRole) {
  if (typeof agent.icon === 'string' && iconMap[agent.icon]) {
    return <span style={{ color: agent.color }}>{iconMap[agent.icon]}</span>;
  }
  return <span className="text-lg">{agent.icon}</span>;
}

export function AgentRoleList() {
  const { agentRoles, activeAgentRole, setActiveAgentRole } = useChatStore();

  const handleClick = (agent: AgentRole) => {
    if (activeAgentRole?.id === agent.id) {
      setActiveAgentRole(null);
    } else {
      setActiveAgentRole(agent);
    }
  };

  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-silver uppercase tracking-wide mb-2 px-2">
        Agent Roles
      </div>
      <div className="space-y-1">
        {agentRoles.map((agent) => (
          <div
            key={agent.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeAgentRole?.id === agent.id 
                ? 'bg-oat-light border border-oat' 
                : 'hover:bg-oat-light'
            }`}
            onClick={() => handleClick(agent)}
          >
            {getAgentIcon(agent)}
            <span className="text-sm text-charcoal">{agent.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}