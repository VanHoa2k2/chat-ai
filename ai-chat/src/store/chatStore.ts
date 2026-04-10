import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatStore, AgentRole, Space, Session, Message, AppType, MessageState, MessageType } from '../types';

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
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response';
}

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 5)}`;

const agentDescriptions: Record<string, string> = {
  'agent-1': 'You are a Code Assistant. Help with coding tasks, debugging, and explaining programming concepts.',
  'agent-2': 'You are a Writing Assistant. Help with writing, editing, improving content.',
  'agent-3': 'You are a Research Assistant. Help with research and information gathering.',
  'agent-4': 'You are a Data Analyst. Help analyze data and provide insights.',
};

type LoadingKey = 'spaces' | 'sessions' | 'agents' | 'messages' | 'sending';

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get): ChatStore => {
      const store: ChatStore = {
        activeApp: 'agentChat' as AppType,
        activeSpace: null,
        activeSession: null,
        activeAgentRole: null,
        messages: [],
        agentRoles: [],
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
          store.addSession(newSession);
          store.setActiveSession(newSession);
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
          store.addSpace(newSpace);
          return newSpace;
        },

        sendMessage: async (content: string): Promise<{ userMessage: Message; assistantMessage: Message }> => {
          set((state) => ({ loading: { ...state.loading, sending: true } }));
          
          let { activeAgentRole } = get();
          let activeSession = get().activeSession;
          let sessionId = activeSession?.id;
          
          if (!sessionId) {
            const newSession = store.createSession(activeAgentRole?.id);
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
          
          store.addMessage(userMessage);
          
          let responseText: string;
          try {
            responseText = await fetchAIResponse(content);
          } catch (error: unknown) {
            console.error('API call failed:', error);
            responseText = 'Sorry, I encountered an error. Please try again.';
          }
          
          const assistantMessage: Message = {
            id: generateId(),
            sessionId,
            role: 'assistant',
            type: 'text',
            content: responseText,
            createdAt: new Date().toISOString(),
            state: 'done' as MessageState,
          };
          
          store.addMessage(assistantMessage);
          
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

        deleteSpace: (spaceId: string) => store.removeSpace(spaceId),
        deleteSession: (sessionId: string) => store.removeSession(sessionId),
      };
      return store;
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

export const mockAgentRoles: AgentRole[] = [
  { id: 'agent-1', name: 'Code Assistant', description: 'Helps with coding tasks and debugging', icon: 'laptop', color: '#078a52', systemPrompt: 'You are a Code Assistant.' },
  { id: 'agent-2', name: 'Writer', description: 'Helps with writing and editing content', icon: 'pencil', color: '#43089f', systemPrompt: 'You are a Writing Assistant.' },
  { id: 'agent-3', name: 'Researcher', description: 'Helps with research and information gathering', icon: 'search', color: '#3bd3fd', systemPrompt: 'You are a Research Assistant.' },
  { id: 'agent-4', name: 'Data Analyst', description: 'Helps analyze data and provide insights', icon: 'barChart', color: '#fbbd41', systemPrompt: 'You are a Data Analyst.' },
];

export const mockSpaces: Space[] = [
  { id: 'space-1', name: 'Work Projects', description: 'Work-related conversations', color: '#078a52', sessionCount: 3 },
  { id: 'space-2', name: 'Personal', description: 'Personal chats', color: '#43089f', sessionCount: 2 },
  { id: 'space-3', name: 'Research', description: 'Research and exploration', color: '#3bd3fd', sessionCount: 1 },
];

export function initializeStore() {
  const state = useChatStore.getState();
  if (state.agentRoles.length === 0) {
    state.setAgentRoles(mockAgentRoles);
  }
  if (state.spaces.length === 0) {
    state.setSpaces(mockSpaces);
  }
}