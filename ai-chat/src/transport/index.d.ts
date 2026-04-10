// Transport type declarations
import type { Message } from '../types';

export interface SendMessageResult {
  userMessage: Message;
  assistantMessage: Message;
}

export interface ChatTransport {
  listAgents(): Promise<any[]>;
  listSpaces(): Promise<any[]>;
  listSessions(spaceId?: string): Promise<any[]>;
  createSession(agentRoleId?: string, spaceId?: string): Promise<any>;
  createSpace(name: string, description?: string): Promise<any>;
  deleteSpace(spaceId: string): Promise<boolean>;
  deleteSession(sessionId: string): Promise<boolean>;
  sendMessage(sessionId: string, content: string, agentRoleId?: string): Promise<SendMessageResult>;
  getMessages(sessionId: string): Promise<Message[]>;
}