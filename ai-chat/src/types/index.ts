// Domain Types for AI Chat App

import type { ReactNode } from 'react';

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool' | 'status';

export type MessageType = 'text' | 'image' | 'file' | 'error';

export type MessageState = 'pending' | 'sent' | 'streaming' | 'done' | 'error';

export type AppType = 'agentChat' | 'files' | 'mails' | 'knowledgeBase';

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  type?: MessageType;
  content: string;
  createdAt: string;
  state: MessageState;
}

export interface Session {
  id: string;
  title: string;
  spaceId: string | null;
  agentRoleId: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string | null;
}

export interface AgentRole {
  id: string;
  name: string;
  description: string;
  icon: string | React.ReactNode;
  color: string;
  systemPrompt?: string;
  transportConfig?: Record<string, unknown>;
}

export interface Space {
  id: string;
  name: string;
  description: string | null;
  color: string;
  sessionCount: number;
}

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  state: MessageState;
}

export interface LoadingState {
  spaces: boolean;
  sessions: boolean;
  agents: boolean;
  messages: boolean;
  sending: boolean;
}

export interface ChatState {
  activeApp: AppType;
  activeSpace: Space | null;
  activeSession: Session | null;
  activeAgentRole: AgentRole | null;
  mobileSidebarOpen: boolean;
  messages: Message[];
  agentRoles: AgentRole[];
  spaces: Space[];
  sessions: Session[];
  loading: LoadingState;
  error: string | null;
}

export interface ChatStore extends ChatState {
  // Actions - Selection
  setActiveApp: (app: AppType) => void;
  setActiveSpace: (space: Space | null) => void;
  setActiveSession: (session: Session | null) => void;
  setActiveAgentRole: (agent: AgentRole | null) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  
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
  setLoading: (key: keyof LoadingState, value: boolean) => void;
  setError: (error: string | null) => void;
  
  // Data operations
  createSession: (agentRoleId?: string, spaceId?: string) => Session;
  createSpace: (name: string, description?: string) => Space;
  sendMessage: (content: string) => Promise<{ userMessage: Message; assistantMessage: Message }>;
  deleteSpace: (spaceId: string) => void;
  deleteSession: (sessionId: string) => void;
}

export interface TransportConfig {
  apiURL?: string;
  apiKey?: string;
  baseURL?: string;
}

// Chat Transport Interface
export interface ChatTransport {
  listAgents(): Promise<AgentRole[]>;
  listSpaces(): Promise<Space[]>;
  listSessions(spaceId?: string): Promise<Session[]>;
  createSession(agentRoleId?: string, spaceId?: string): Promise<Session>;
  createSpace(name: string, description?: string): Promise<Space>;
  deleteSpace(spaceId: string): Promise<boolean>;
  deleteSession(sessionId: string): Promise<boolean>;
  sendMessage(sessionId: string, content: string, agentRoleId?: string): Promise<{ userMessage: Message; assistantMessage: Message }>;
  getMessages(sessionId: string): Promise<Message[]>;
}