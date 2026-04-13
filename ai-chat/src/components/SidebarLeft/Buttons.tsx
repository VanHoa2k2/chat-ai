import { Plus } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '@/store/chatStore';
import { useCreateSession, useCreateSpace } from '@/hooks/useChat';

export const NewChatButton = () => {
  const { activeAgentRole, activeSpace } = useChatStore(
    useShallow((state) => ({
      activeAgentRole: state.activeAgentRole,
      activeSpace: state.activeSpace,
    }))
  );
  const createSessionMutation = useCreateSession();

  const handleClick = async () => {
    await createSessionMutation.mutateAsync({ 
      agentRoleId: activeAgentRole?.id,
      spaceId: activeSpace?.id
    });
  };

  return (
    <button
      className="mx-3 mt-3 px-3 py-2 flex items-center gap-2 rounded-lg border border-dashed cursor-pointer text-sm font-medium transition-colors bg-cream border-oat hover:bg-oat-light"
      onClick={handleClick}
    >
      <Plus className="w-4 h-4" />
      <span>New Chat</span>
    </button>
  );
}

export const NewSpaceButton = () => {
  const createSpaceMutation = useCreateSpace();

  const handleClick = async () => {
    const name = prompt('Enter space name:');
    if (name) {
      await createSpaceMutation.mutateAsync({ name });
    }
  };

  return (
    <button
      className="w-full px-3 py-2 flex items-center gap-2 rounded-lg border border-dashed cursor-pointer text-sm font-medium transition-colors mb-4 bg-cream border-oat hover:bg-oat-light"
      onClick={handleClick}
    >
      <Plus className="w-4 h-4" />
      <span>New Space</span>
    </button>
  );
}