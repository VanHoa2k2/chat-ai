import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatStore, AgentRole, Space, Session, Message, AppType, MessageState } from '../types';

const API_URL = 'https://api.dision.tech/llm/v1/chat/completions';
const API_KEY = 'fPgoo2jhzd7lMVU4VWFGTN728orMMPsq';
const MODEL = 'chat';

async function fetchAIResponse(prompt: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
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

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 5)}`;

const defaultAgentRoles: AgentRole[] = [
  { id: 'agent-1', name: 'Code Assistant', description: 'Helps with coding tasks and debugging', icon: 'laptop', color: '#078a52', systemPrompt: 'You are a Code Assistant.' },
  { id: 'agent-2', name: 'Writer', description: 'Helps with writing and editing content', icon: 'pencil', color: '#43089f', systemPrompt: 'You are a Writing Assistant.' },
  { id: 'agent-3', name: 'Researcher', description: 'Helps with research and information gathering', icon: 'search', color: '#3bd3fd', systemPrompt: 'You are a Research Assistant.' },
  { id: 'agent-4', name: 'Data Analyst', description: 'Helps analyze data and provide insights', icon: 'barChart', color: '#fbbd41', systemPrompt: 'You are a Data Analyst.' },
];

type LoadingKey = 'spaces' | 'sessions' | 'agents' | 'messages' | 'sending';

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get): ChatStore => {
      return {
        activeApp: 'agentChat' as AppType,
        activeSpace: null,
        activeSession: null,
        activeAgentRole: null,
        mobileSidebarOpen: false,
        messages: [],
        agentRoles: defaultAgentRoles,
        spaces: [],
        sessions: [],
        loading: {
          spaces: false,
          sessions: false,
          agents: false,
          messages: false,
          sending: false,
        },
        error: null,

        setActiveApp: (app: AppType) => set({ activeApp: app }),
        setActiveSpace: (space: Space | null) => set({ activeSpace: space, activeSession: null }),
        setActiveSession: (session: Session | null) => set({ activeSession: session }),
        setActiveAgentRole: (agent: AgentRole | null) => set({ activeAgentRole: agent }),
        setMobileSidebarOpen: (open: boolean) => set({ mobileSidebarOpen: open }),
        setAgentRoles: (agents: AgentRole[]) => set({ agentRoles: agents }),
        setSpaces: (spaces: Space[]) => set({ spaces }),
        setSessions: (sessions: Session[]) => set({ sessions }),
        setMessages: (messages: Message[]) => set({ messages }),
        addMessage: (message: Message) => set((state) => ({ messages: [...state.messages, message] })),
        addSession: (session: Session) => set((state) => {
          const exists = state.sessions.some(s => s.id === session.id);
          if (exists) return state;
          return { sessions: [session, ...state.sessions] };
        }),
        addSpace: (space: Space) => set((state) => {
          const exists = state.spaces.some(s => s.id === space.id);
          if (exists) return state;
          return { spaces: [...state.spaces, space] };
        }),
        removeSpace: (spaceId: string) => set((state) => ({
          spaces: state.spaces.filter(s => s.id !== spaceId),
          activeSpace: state.activeSpace?.id === spaceId ? null : state.activeSpace,
        })),
        removeSession: (sessionId: string) => set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          activeSession: state.activeSession?.id === sessionId ? null : state.activeSession,
        })),
        updateSession: (sessionId: string, updates: Partial<Session>) => set((state) => ({
          sessions: state.sessions.map(s => s.id === sessionId ? { ...s, ...updates } : s),
        })),
        updateSpace: (spaceId: string, updates: Partial<Space>) => set((state) => ({
          spaces: state.spaces.map(s => s.id === spaceId ? { ...s, ...updates } : s),
        })),
        setLoading: (key: LoadingKey, value: boolean) => set((state) => ({
          loading: { ...state.loading, [key]: value }
        })),
        setError: (error: string | null) => set({ error }),

        createSession: (agentRoleId?: string, spaceId?: string): Session => {
          const newSession: Session = {
            id: generateId(),
            title: 'New Chat',
            spaceId: spaceId || null,
            agentRoleId: agentRoleId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessagePreview: null,
          };
          get().addSession(newSession);
          get().setActiveSession(newSession);
          return newSession;
        },

        createSpace: (name: string, description?: string): Space => {
          const colors = ['#078a52', '#43089f', '#3bd3fd', '#fbbd41', '#fc7981'];
          const newSpace: Space = {
            id: generateId(),
            name,
            description: description || null,
            color: colors[Math.floor(Math.random() * colors.length)],
            sessionCount: 0,
          };
          get().addSpace(newSpace);
          return newSpace;
        },

        sendMessage: async (content: string): Promise<{ userMessage: Message; assistantMessage: Message }> => {
          set((state) => ({ 
            loading: { ...state.loading, sending: true },
            error: null 
          }));
          
          let { activeAgentRole } = get();
          let activeSession = get().activeSession;
          let sessionId = activeSession?.id;
          
          if (!sessionId) {
            const newSession = get().createSession(activeAgentRole?.id);
            activeSession = newSession;
            sessionId = newSession.id;
          }
          
          const userMessage: Message = {
            id: generateId(),
            sessionId,
            role: 'user',
            type: 'text',
            content,
            createdAt: new Date().toISOString(),
            state: 'done' as MessageState,
          };
          
          get().addMessage(userMessage);
          
          let responseText: string;
          let errorMessage: string | null = null;
          
          try {
            responseText = await fetchAIResponse(content);
          } catch (error: unknown) {
            console.error('API call failed:', error);
            const isNetworkError = error instanceof TypeError && error.message.includes('Failed to fetch');
            errorMessage = isNetworkError 
              ? 'Unable to connect. Please check your internet connection and try again.'
              : 'Something went wrong. Please try again later.';
            responseText = isNetworkError
              ? "I apologize, but I'm having trouble connecting to the service. Please check your internet connection and try again."
              : "I apologize, but something went wrong on my end. Please try again in a moment.";
          }
          
          const assistantMessage: Message = {
            id: generateId(),
            sessionId,
            role: 'assistant',
            type: 'text',
            content: responseText,
            createdAt: new Date().toISOString(),
            state: errorMessage ? 'error' as MessageState : 'done' as MessageState,
          };
          
          get().addMessage(assistantMessage);
          
          if (activeSession) {
            set((state) => ({
              sessions: state.sessions.map(s => 
                s.id === activeSession!.id 
                  ? { ...s, lastMessagePreview: content.length > 50 ? content.substring(0, 50) + '...' : content, updatedAt: new Date().toISOString() }
                  : s
              ),
            }));
          }
          
          set((state) => ({ loading: { ...state.loading, sending: false } }));
          
          return { userMessage, assistantMessage };
        },

        deleteSpace: (spaceId: string) => get().removeSpace(spaceId),
        deleteSession: (sessionId: string) => get().removeSession(sessionId),
      };
    },
    {
      name: 'ai-chat-storage',
      partialize: (state: ChatStore) => ({
        spaces: state.spaces,
        sessions: state.sessions,
        messages: state.messages,
      }),
    }
  )
);