import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '@/store/chatStore';
import { AgentRoleItem } from './AgentRoleItem';

export const AgentRoleList = () => {
  const { agentRoles, activeAgentRole, setActiveAgentRole } = useChatStore(
    useShallow((state) => ({
      agentRoles: state.agentRoles,
      activeAgentRole: state.activeAgentRole,
      setActiveAgentRole: state.setActiveAgentRole,
    }))
  );

  const handleClick = useCallback((agent: AgentRole) => {
    if (activeAgentRole?.id === agent.id) {
      setActiveAgentRole(null);
    } else {
      setActiveAgentRole(agent);
    }
  }, [activeAgentRole, setActiveAgentRole]);

  const agentItems = useMemo(() => 
    agentRoles.map((agent: AgentRole) => ({
      agent,
      isActive: activeAgentRole?.id === agent.id,
      onClick: () => handleClick(agent),
    })), 
    [agentRoles, activeAgentRole, handleClick]
  );

  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-silver uppercase tracking-wide mb-2 px-2">
        Agent Roles
      </div>
      <div className="space-y-1">
        {agentItems.map((item) => (
          <AgentRoleItem
            key={item.agent.id}
            agent={item.agent}
            isActive={item.isActive}
            onClick={item.onClick}
          />
        ))}
      </div>
    </div>
  );
}