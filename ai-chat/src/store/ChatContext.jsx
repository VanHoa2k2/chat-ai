import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { HttpChatTransport } from '../transport/HttpChatTransport';
import { AppType } from '../domain/types';

const ChatContext = createContext(null);

const initialState = {
  activeApp: AppType.AGENT_CHAT,
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
    sending: false
  },
  error: null
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_APP':
      return { ...state, activeApp: action.payload };
      
    case 'SET_ACTIVE_SPACE':
      return { ...state, activeSpace: action.payload, activeSession: null, activeAgentRole: null, messages: [] };
      
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.payload.session, activeAgentRole: action.payload.agentRole, messages: [] };
      
    case 'SET_ACTIVE_AGENT_ROLE':
      return { ...state, activeAgentRole: action.payload, activeSession: null, activeSpace: null, messages: [] };
      
    case 'SET_AGENT_ROLES':
      return { ...state, agentRoles: action.payload };
      
    case 'SET_SPACES':
      return { ...state, spaces: action.payload };
      
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
      
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
      
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
      
    case 'ADD_SESSION':
      const sessionExists = state.sessions.some(s => s.id === action.payload.id);
      if (sessionExists) return state;
      return { ...state, sessions: [action.payload, ...state.sessions] };
      
    case 'ADD_SPACE':
      const exists = state.spaces.some(s => s.id === action.payload.id);
      if (exists) return state;
      return { ...state, spaces: [...state.spaces, action.payload] };
      
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.key]: action.value } };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [transport] = React.useState(() => new HttpChatTransport());

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    dispatch({ type: 'SET_LOADING', key: 'agents', value: true });
    dispatch({ type: 'SET_LOADING', key: 'spaces', value: true });
    dispatch({ type: 'SET_LOADING', key: 'sessions', value: true });
    
    try {
      const [agents, spaces, sessions] = await Promise.all([
        transport.listAgents(),
        transport.listSpaces(),
        transport.listSessions()
      ]);
      
      dispatch({ type: 'SET_AGENT_ROLES', payload: agents });
      dispatch({ type: 'SET_SPACES', payload: spaces });
      dispatch({ type: 'SET_SESSIONS', payload: sessions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'agents', value: false });
      dispatch({ type: 'SET_LOADING', key: 'spaces', value: false });
      dispatch({ type: 'SET_LOADING', key: 'sessions', value: false });
    }
  }

  async function selectAgentRole(agent) {
    dispatch({ type: 'SET_ACTIVE_AGENT_ROLE', payload: agent });
  }

  async function selectSpace(space) {
    dispatch({ type: 'SET_ACTIVE_SPACE', payload: space });
    const sessions = await transport.listSessions(space.id);
    dispatch({ type: 'SET_SESSIONS', payload: sessions });
  }

  async function selectSession(session) {
    const agentRole = session.agentRoleId 
      ? state.agentRoles.find(a => a.id === session.agentRoleId) 
      : null;
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: { session, agentRole } });
    dispatch({ type: 'SET_LOADING', key: 'messages', value: true });
    
    try {
      const messages = await transport.getMessages(session.id);
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'messages', value: false });
    }
  }

  async function createSession(agentRoleId = null) {
    dispatch({ type: 'SET_LOADING', key: 'sending', value: true });
    
    try {
      const newSession = await transport.createSession(agentRoleId, state.activeSpace?.id);
      dispatch({ type: 'ADD_SESSION', payload: newSession });
      await selectSession(newSession);
      return newSession;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'sending', value: false });
    }
  }

  async function sendMessage(content) {
    if (!state.activeSession && !state.activeAgentRole) {
      dispatch({ type: 'SET_ERROR', payload: 'No active session or agent' });
      return;
    }

    dispatch({ type: 'SET_LOADING', key: 'sending', value: true });
    
    try {
      const sessionId = state.activeSession?.id;
      const agentRoleId = state.activeAgentRole?.id;
      
      if (!sessionId) {
        const newSession = await createSession(agentRoleId);
        const result = await transport.sendMessage(newSession.id, content, agentRoleId);
        
        const messages = await transport.getMessages(newSession.id);
        dispatch({ type: 'SET_MESSAGES', payload: messages });
        return;
      }
      
      const result = await transport.sendMessage(sessionId, content, agentRoleId);
      
      const messages = await transport.getMessages(sessionId);
      dispatch({ type: 'SET_MESSAGES', payload: messages });
      
      // Update session in list
      const sessions = await transport.listSessions(state.activeSpace?.id);
      dispatch({ type: 'SET_SESSIONS', payload: sessions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'sending', value: false });
    }
  }

  async function createSpace(name, description = null) {
    try {
      const newSpace = await transport.createSpace(name, description);
      dispatch({ type: 'ADD_SPACE', payload: newSpace });
      return newSpace;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }

  function setActiveApp(app) {
    dispatch({ type: 'SET_ACTIVE_APP', payload: app });
  }

  function clearError() {
    dispatch({ type: 'CLEAR_ERROR' });
  }

  const value = {
    state,
    selectAgentRole,
    selectSpace,
    selectSession,
    createSession,
    sendMessage,
    createSpace,
    setActiveApp,
    clearError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}