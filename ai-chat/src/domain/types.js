export const AgentRole = {
  id: null,
  name: null,
  description: null,
  icon: null,
  color: null,
  systemPrompt: null,
  transportConfig: null
};

export const Session = {
  id: null,
  title: null,
  spaceId: null,
  agentRoleId: null,
  createdAt: null,
  updatedAt: null,
  lastMessagePreview: null
};

export const Space = {
  id: null,
  name: null,
  description: null,
  color: null,
  sessionCount: 0
};

export const Message = {
  id: null,
  sessionId: null,
  role: null,
  content: null,
  createdAt: null,
  state: null
};

export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  TOOL: 'tool',
  STATUS: 'status'
};

export const MessageState = {
  PENDING: 'pending',
  SENT: 'sent',
  STREAMING: 'streaming',
  DONE: 'done',
  ERROR: 'error'
};

export const AppType = {
  AGENT_CHAT: 'agentChat',
  FILES: 'files',
  MAILS: 'mails',
  KNOWLEDGE_BASE: 'knowledgeBase'
};