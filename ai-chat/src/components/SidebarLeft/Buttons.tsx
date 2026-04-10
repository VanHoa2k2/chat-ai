import { Plus } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useCreateSession, useCreateSpace } from '../../hooks/useChat';

export function NewChatButton() {
  const { activeAgentRole, activeSpace } = useChatStore();
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

export function NewSpaceButton() {
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