import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatState, AgentRole, Space, Session, Message, AppType } from '../types';

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 5)}`;

interface ChatStore extends ChatState {
  // Actions - Selection
  setActiveApp: (app: AppType) => void;
  setActiveSpace: (space: Space | null) => void;
  setActiveSession: (session: Session | null) => void;
  setActiveAgentRole: (agent: AgentRole | null) => void;
  
  // Actions - Data
  setAgentRoles: (agents: AgentRole[]) => void;
  setSpaces: (spaces: Space[]) => void;
  setSessions: (sessions: Session[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  addSession: (session: Session) => void;
  addSpace: (space: Space) => void;
  removeSpace: (spaceId: string) => void;
  removeSession: (sessionId: string) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  updateSpace: (spaceId: string, updates: Partial<Space>) => void;
  
  // Actions - Loading & Error
  setLoading: (key: keyof ChatState['loading'], value: boolean) => void;
  setError: (error: string | null) => void;
  
  // Data operations
  createSession: (agentRoleId?: string, spaceId?: string) => Session;
  createSpace: (name: string, description?: string) => Space;
  sendMessage: (content: string) => { userMessage: Message; assistantMessage: Message };
  deleteSpace: (spaceId: string) => void;
  deleteSession: (sessionId: string) => void;
}

const agentDescriptions: Record<string, string> = {
  'agent-1': 'You are a Code Assistant. Help with coding tasks, debugging, and explaining programming concepts.',
  'agent-2': 'You are a Writing Assistant. Help with writing, editing, and improving content.',
  'agent-3': 'You are a Research Assistant. Help with research and information gathering.',
  'agent-4': 'You are a Data Analyst. Help analyze data and provide insights.',
};

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
      setActiveApp: (app) => set({ activeApp: app }),
      
      setActiveSpace: (space) => set({ 
        activeSpace: space, 
        activeSession: null, 
      }),
      
      setActiveSession: (session) => set({ 
        activeSession: session, 
      }),
      
      setActiveAgentRole: (agent) => set({ activeAgentRole: agent }),

      // Data Actions
      setAgentRoles: (agents) => set({ agentRoles: agents }),
      setSpaces: (spaces) => set({ spaces }),
      setSessions: (sessions) => set({ sessions }),
      setMessages: (messages) => set({ messages }),
      
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      
      addSession: (session) => set((state) => {
        console.log('[chatStore] addSession called, current sessions:', state.sessions.length);
        const exists = state.sessions.some(s => s.id === session.id);
        if (exists) return state;
        const newState = { sessions: [session, ...state.sessions] };
        console.log('[chatStore] after addSession, sessions:', newState.sessions.length);
        return newState;
      }),
      
      addSpace: (space) => set((state) => {
        const exists = state.spaces.some(s => s.id === space.id);
        if (exists) return state;
        return { spaces: [...state.spaces, space] };
      }),
      
      removeSpace: (spaceId) => set((state) => ({
        spaces: state.spaces.filter(s => s.id !== spaceId),
        activeSpace: state.activeSpace?.id === spaceId ? null : state.activeSpace,
      })),
      
      removeSession: (sessionId) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        activeSession: state.activeSession?.id === sessionId ? null : state.activeSession,
      })),

      updateSession: (sessionId, updates) => set((state) => ({
        sessions: state.sessions.map(s => 
          s.id === sessionId ? { ...s, ...updates } : s
        ),
      })),

      updateSpace: (spaceId, updates) => set((state) => ({
        spaces: state.spaces.map(s => 
          s.id === spaceId ? { ...s, ...updates } : s
        ),
      })),

      // Loading & Error
      setLoading: (key, value) => set((state) => ({
        loading: { ...state.loading, [key]: value }
      })),
      
      setError: (error) => set({ error }),

      // Data Operations
      createSession: (agentRoleId, spaceId) => {
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

      createSpace: (name, description) => {
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

      sendMessage: (content) => {
        const { activeSession, activeAgentRole } = get();
        const sessionId = activeSession?.id || generateId();
        
        // Create user message
        const userMessage: Message = {
          id: generateId(),
          sessionId,
          role: 'user',
          content,
          createdAt: new Date().toISOString(),
          state: 'done',
        };
        
        get().addMessage(userMessage);
        
        // Get system prompt based on agent
        const systemPrompt = activeAgentRole?.id 
          ? agentDescriptions[activeAgentRole.id] || 'You are a helpful AI assistant.'
          : 'You are a helpful AI assistant.';
        
        // Simulate AI response (in real app, this would call the API)
        const responses: Record<string, string> = {
          'agent-1': `I can help you with coding! What specific programming task or concept would you like help with?`,
          'agent-2': `I'd be happy to help with your writing! What kind of content would you like to create or improve?`,
          'agent-3': `I'm ready to help with your research! What topic or information would you like to explore?`,
          'agent-4': `I can help analyze your data! What kind of analysis would you like to perform?`,
        };
        
        const responseText = activeAgentRole?.id 
          ? responses[activeAgentRole.id] || `Thanks for your message! How can I help you today?`
          : `Thanks for your message! How can I help you today?`;
        
        const assistantMessage: Message = {
          id: generateId(),
          sessionId,
          role: 'assistant',
          content: responseText,
          createdAt: new Date().toISOString(),
          state: 'done',
        };
        
        get().addMessage(assistantMessage);
        
        // Update session preview
        if (activeSession) {
          set((state) => ({
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
        
        return { userMessage, assistantMessage };
      },

      deleteSpace: (spaceId) => {
        get().removeSpace(spaceId);
      },

      deleteSession: (sessionId) => {
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
    icon: '💻',
    color: '#078a52',
    systemPrompt: 'You are a Code Assistant.',
  },
  {
    id: 'agent-2',
    name: 'Writer',
    description: 'Helps with writing and editing content',
    icon: '✍️',
    color: '#43089f',
    systemPrompt: 'You are a Writing Assistant.',
  },
  {
    id: 'agent-3',
    name: 'Researcher',
    description: 'Helps with research and information gathering',
    icon: '🔍',
    color: '#3bd3fd',
    systemPrompt: 'You are a Research Assistant.',
  },
  {
    id: 'agent-4',
    name: 'Data Analyst',
    description: 'Helps analyze data and provide insights',
    icon: '📊',
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