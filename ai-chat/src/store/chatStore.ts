import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatState, AgentRole, Space, Session, Message, AppType, MessageState, MessageType } from '../types';
import { HttpChatTransport } from '../transport/HttpChatTransport';

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 5)}`;

const agentDescriptions: Record<string, string> = {
  'agent-1': 'You are a Code Assistant. Help with coding tasks, debugging, and explaining programming concepts.',
  'agent-2': 'You are a Writing Assistant. Help with writing, editing, improving content.',
  'agent-3': 'You are a Research Assistant. Help with research and information gathering.',
  'agent-4': 'You are a Data Analyst. Help analyze data and provide insights.',
};

const chatTransport = new HttpChatTransport();

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial State
      activeApp: 'agentChat',
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

// Selection Actions
      setActiveApp: (app: AppType) => set({ activeApp: app }),
      
      setActiveSpace: (space: Space | null) => set({ 
        activeSpace: space, 
        activeSession: null, 
      }),
      
      setActiveSession: (session: Session | null) => set({ 
        activeSession: session, 
      }),
      
      setActiveAgentRole: (agent: AgentRole | null) => set({ activeAgentRole: agent }),

      // Data Setters
      setAgentRoles: (agents: AgentRole[]) => set({ agentRoles: agents }),
      setSpaces: (spaces: Space[]) => set({ spaces }),
      setSessions: (sessions: Session[]) => set({ sessions }),
      setMessages: (messages: Message[]) => set({ messages }),
      
      addMessage: (message: Message) => set((state: ChatState) => ({ 
        messages: [...state.messages, message] 
      })),
      
      addSession: (session: Session) => set((state: ChatState) => {
        const exists = state.sessions.some(s => s.id === session.id);
        if (exists) return state;
        return { sessions: [session, ...state.sessions] };
      }),
      
      addSpace: (space: Space) => set((state: ChatState) => {
        const exists = state.spaces.some(s => s.id === space.id);
        if (exists) return state;
        return { spaces: [...state.spaces, space] };
      }),

      removeSpace: (spaceId: string) => set((state: ChatState) => ({
        spaces: state.spaces.filter(s => s.id !== spaceId),
        activeSpace: state.activeSpace?.id === spaceId ? null : state.activeSpace,
      })),
      
      removeSession: (sessionId: string) => set((state: ChatState) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        activeSession: state.activeSession?.id === sessionId ? null : state.activeSession,
      })),

      updateSession: (sessionId: string, updates: Partial<Session>) => set((state: ChatState) => ({
        sessions: state.sessions.map(s => 
          s.id === sessionId ? { ...s, ...updates } : s
        ),
      })),

      updateSpace: (spaceId: string, updates: Partial<Space>) => set((state: ChatState) => ({
        spaces: state.spaces.map(s => 
          s.id === spaceId ? { ...s, ...updates } : s
        ),
      })),

      // Loading & Error
      setLoading: (key: keyof ChatState['loading'], value: boolean) => set((state: ChatState) => ({
        loading: { ...state.loading, [key]: value }
      })),
      
      setError: (error: string | null) => set({ error }),

      // Data Operations
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
        set((state: ChatState) => ({ loading: { ...state.loading, sending: true } }));
        
        let { activeAgentRole } = get();
        let activeSession = get().activeSession;
        let sessionId = activeSession?.id;
        
        // Create session if needed
        if (!sessionId) {
          const newSession = get().createSession(activeAgentRole?.id);
          activeSession = newSession;
          sessionId = newSession.id;
        }
        
        // Create user message
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
        
        // Call API via transport
        let responseText: string;
        try {
          const result = await chatTransport.sendMessage(sessionId, content, activeAgentRole?.id || undefined);
          responseText = result.assistantMessage.content;
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
        
        get().addMessage(assistantMessage);
        
        // Update session preview
        if (activeSession) {
          set((state: ChatState) => ({
            sessions: state.sessions.map(s => 
              s.id === activeSession.id 
                ? { 
                    ...s, 
                    lastMessagePreview: content.length > 50 ? content.substring(0, 50) + '...' : content,
                    updatedAt: new Date().toISOString()
                  }
                : s
            ),
          }));
        }
        
        set((state: ChatState) => ({ loading: { ...state.loading, sending: false } }));
        
        return { userMessage, assistantMessage };
      },

      deleteSpace: (spaceId: string) => {
        get().removeSpace(spaceId);
      },

      deleteSession: (sessionId: string) => {
        get().removeSession(sessionId);
      },
    }),
    {
      name: 'ai-chat-storage',
      partialize: (state) => ({
        spaces: state.spaces,
        sessions: state.sessions,
        messages: state.messages,
      }),
    }
  )
);

// Mock data for initial load
export const mockAgentRoles: AgentRole[] = [
  {
    id: 'agent-1',
    name: 'Code Assistant',
    description: 'Helps with coding tasks and debugging',
    icon: 'laptop',
    color: '#078a52',
    systemPrompt: 'You are a Code Assistant.',
  },
  {
    id: 'agent-2',
    name: 'Writer',
    description: 'Helps with writing and editing content',
    icon: 'pencil',
    color: '#43089f',
    systemPrompt: 'You are a Writing Assistant.',
  },
  {
    id: 'agent-3',
    name: 'Researcher',
    description: 'Helps with research and information gathering',
    icon: 'search',
    color: '#3bd3fd',
    systemPrompt: 'You are a Research Assistant.',
  },
  {
    id: 'agent-4',
    name: 'Data Analyst',
    description: 'Helps analyze data and provide insights',
    icon: 'barChart',
    color: '#fbbd41',
    systemPrompt: 'You are a Data Analyst.',
  },
];

export const mockSpaces: Space[] = [
  {
    id: 'space-1',
    name: 'Work Projects',
    description: 'Work-related conversations',
    color: '#078a52',
    sessionCount: 3,
  },
  {
    id: 'space-2',
    name: 'Personal',
    description: 'Personal chats',
    color: '#43089f',
    sessionCount: 2,
  },
  {
    id: 'space-3',
    name: 'Research',
    description: 'Research and exploration',
    color: '#3bd3fd',
    sessionCount: 1,
  },
];

// Initialize store with mock data helper
export function initializeStore() {
  const state = useChatStore.getState();
  
  if (state.agentRoles.length === 0) {
    state.setAgentRoles(mockAgentRoles);
  }
  
  if (state.spaces.length === 0) {
    state.setSpaces(mockSpaces);
  }
}