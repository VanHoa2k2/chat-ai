import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore, mockAgentRoles, mockSpaces } from '../store/chatStore';
import type { Space, Session, AgentRole } from '../types';

// API Configuration
const API_URL = 'https://api.dision.tech/llm/v1/chat/completions';
const API_KEY = 'fPgoo2jhzd7lMVU4VWFGTN728orMMPsq';
const MODEL = 'chat';

// Fetch wrapper
async function fetchAI(prompt: string, systemPrompt: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response';
}

// Query Keys
export const queryKeys = {
  agents: ['agents'] as const,
  spaces: ['spaces'] as const,
  sessions: (spaceId?: string) => ['sessions', spaceId] as const,
  messages: (sessionId: string) => ['messages', sessionId] as const,
};

// Hooks

export function useAgents() {
  return useQuery({
    queryKey: queryKeys.agents,
    queryFn: async () => {
      // In a real app, this would fetch from API
      // For now, return mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockAgentRoles;
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
      return spaces.length > 0 ? spaces : mockSpaces;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSessions(spaceId?: string) {
  const sessions = useChatStore((state) => state.sessions);
  
  return useQuery({
    queryKey: queryKeys.sessions(spaceId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      if (spaceId) {
        return sessions.filter(s => s.spaceId === spaceId);
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
      return allMessages.filter(m => m.sessionId === sessionId);
    },
    enabled: !!sessionId,
    staleTime: 0,
  });
}

// Mutations

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { activeSession, activeAgentRole, addMessage, setActiveSession, createSession } = useChatStore();
  
  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      // Get system prompt
      const agentDescriptions: Record<string, string> = {
        'agent-1': 'You are a Code Assistant. Help with coding tasks, debugging, and explaining programming concepts.',
        'agent-2': 'You are a Writing Assistant. Help with writing, editing, and improving content.',
        'agent-3': 'You are a Research Assistant. Help with research and information gathering.',
        'agent-4': 'You are a Data Analyst. Help analyze data and provide insights.',
      };
      
      const systemPrompt = activeAgentRole?.id 
        ? agentDescriptions[activeAgentRole.id] 
        : 'You are a helpful AI assistant.';
      
      // Try to get AI response
      let responseText: string;
      try {
        responseText = await fetchAI(content, systemPrompt);
      } catch (error) {
        console.warn('API call failed, using fallback:', error);
        const fallbackResponses: Record<string, string> = {
          'agent-1': `I can help you with coding! What specific programming task or concept would you like help with?`,
          'agent-2': `I'd be happy to help with your writing! What kind of content would you like to create or improve?`,
          'agent-3': `I'm ready to help with your research! What topic or information would you like to explore?`,
          'agent-4': `I can help analyze your data! What kind of analysis would you like to perform?`,
        };
        responseText = activeAgentRole?.id 
          ? fallbackResponses[activeAgentRole.id] 
          : `Thanks for your message! How can I help you today?`;
      }
      
      return { content, responseText };
    },
    onMutate: ({ content }) => {
      // Create session if needed and add user message immediately
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
      // Add assistant message after response arrives
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
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useCreateSession() {
  const { createSession, setActiveSession, setActiveAgentRole } = useChatStore();
  
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