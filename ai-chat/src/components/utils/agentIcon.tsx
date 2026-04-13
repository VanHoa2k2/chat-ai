import { Laptop, Search, BarChart2, Pencil } from 'lucide-react';
import type { AgentRole } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  laptop: <Laptop className="w-5 h-5" />,
  pencil: <Pencil className="w-5 h-5" />,
  search: <Search className="w-5 h-5" />,
  barChart: <BarChart2 className="w-5 h-5" />,
};

export const getAgentIcon = (agent: AgentRole, wrapInSpan = true) => {
  if (typeof agent.icon === 'string' && iconMap[agent.icon]) {
    const icon = iconMap[agent.icon];
    return wrapInSpan ? <span style={{ color: agent.color }}>{icon}</span> : icon;
  }
  return <span className="text-lg">{agent.icon}</span>;
};