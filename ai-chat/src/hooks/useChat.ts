import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/store/chatStore';
import type { Space, Session, AgentRole, Message } from '@/types';
import { CONFIG } from '@/config';

async function fetchAI(prompt: string, systemPrompt: string): Promise<string> {
  const response = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.API_KEY}`,
    },
    body: JSON.stringify({
      model: CONFIG.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response';
}

export const queryKeys = {
  agents: ['agents'] as const,
  spaces: ['spaces'] as const,
  sessions: (spaceId?: string) => ['sessions', spaceId] as const,
  messages: (sessionId: string) => ['messages', sessionId] as const,
};

export function useAgents() {
  const agentRoles = useChatStore((state) => state.agentRoles);
  
  return useQuery({
    queryKey: queryKeys.agents,
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return agentRoles;
    },
    staleTime: Infinity,
  });
}

export function useSpaces() {
  const spaces = useChatStore((state) => state.spaces);
  
  return useQuery({
    queryKey: queryKeys.spaces,
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return spaces;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSessions(spaceId?: string) {
  const sessions = useChatStore((state) => state.sessions);
  
  return useQuery({
    queryKey: queryKeys.sessions(spaceId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      if (spaceId) {
        return sessions.filter((s: Session) => s.spaceId === spaceId);
      }
      return sessions;
    },
    staleTime: 1000 * 60,
  });
}

export function useMessages(sessionId: string | null) {
  const allMessages = useChatStore((state) => state.messages);
  
  return useQuery({
    queryKey: queryKeys.messages(sessionId || ''),
    queryFn: async () => {
      if (!sessionId) return [];
      await new Promise(resolve => setTimeout(resolve, 200));
      return allMessages.filter((m: Message) => m.sessionId === sessionId);
    },
    enabled: !!sessionId,
    staleTime: 0,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { activeSession, activeAgentRole, addMessage, setActiveSession, createSession } = useChatStore();
  
  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const agentDescriptions: Record<string, string> = {
        'agent-1': 'You are a Code Assistant. Help with coding tasks, debugging, and explaining programming concepts.',
        'agent-2': 'You are a Writing Assistant. Help with writing, editing, and improving content.',
        'agent-3': 'You are a Research Assistant. Help with research and information gathering.',
        'agent-4': 'You are a Data Analyst. Help analyze data and provide insights.',
      };
      
      const systemPrompt = activeAgentRole?.id 
        ? agentDescriptions[activeAgentRole.id] 
        : 'You are a helpful AI assistant.';
      
      let responseText: string;
      try {
        responseText = await fetchAI(content, systemPrompt);
      } catch (error) {
        console.warn('API call failed:', error);
        throw error;
      }
      
      return { content, responseText };
    },
    onMutate: ({ content }) => {
      let sessionId = activeSession?.id;
      if (!sessionId) {
        const newSession = createSession(activeAgentRole?.id);
        sessionId = newSession.id;
      }
      
      const userMessage = {
        id: `msg-${Date.now()}-user`,
        sessionId,
        role: 'user' as const,
        content,
        createdAt: new Date().toISOString(),
        state: 'done' as const,
      };
      addMessage(userMessage);
      
      return { sessionId };
    },
    onSuccess: ({ content, responseText }, variables, context) => {
      const sessionId = context?.sessionId || activeSession?.id;
      if (!sessionId) return;
      
      const assistantMessage = {
        id: `msg-${Date.now()}-assistant`,
        sessionId,
        role: 'assistant' as const,
        content: responseText,
        createdAt: new Date().toISOString(),
        state: 'done' as const,
      };
      addMessage(assistantMessage);
      
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useCreateSession() {
  const { createSession, setActiveSession } = useChatStore();
  
  return useMutation({
    mutationFn: async ({ agentRoleId, spaceId }: { agentRoleId?: string; spaceId?: string }) => {
      const session = createSession(agentRoleId, spaceId);
      return session;
    },
    onSuccess: (session) => {
      setActiveSession(session);
    },
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  const { createSpace } = useChatStore();
  
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const space = createSpace(name, description);
      return space;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();
  const { deleteSpace } = useChatStore();
  
  return useMutation({
    mutationFn: async ({ spaceId }: { spaceId: string }) => {
      deleteSpace(spaceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  const { deleteSession } = useChatStore();
  
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      deleteSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useSelectSpace() {
  const { setActiveSpace } = useChatStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ space }: { space: Space | null }) => {
      setActiveSpace(space);
      if (space) {
        await queryClient.prefetchQuery({
          queryKey: queryKeys.sessions(space.id),
        });
      }
    },
  });
}

export function useSelectSession() {
  const { setActiveSession, setActiveAgentRole } = useChatStore();
  
  return useMutation({
    mutationFn: async ({ session, agentRole }: { session: Session | null; agentRole?: AgentRole | null }) => {
      setActiveSession(session);
      if (agentRole && typeof agentRole === 'object' && agentRole !== null && 'id' in agentRole) {
        setActiveAgentRole(agentRole as AgentRole);
      }
    },
  });
}