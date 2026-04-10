// Domain Types for AI Chat App

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool' | 'status';

export type MessageState = 'pending' | 'sent' | 'streaming' | 'done' | 'error';

export type AppType = 'agentChat' | 'files' | 'mails' | 'knowledgeBase';

export interface AgentRole {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  systemPrompt?: string;
  transportConfig?: Record<string, unknown>;
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
  messages: Message[];
  agentRoles: AgentRole[];
  spaces: Space[];
  sessions: Session[];
  loading: LoadingState;
  error: string | null;
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