import { ChatTransport } from './ChatTransport';
import { mockAgentRoles, mockSpaces, mockSessions, mockMessages } from '../domain/mockData';

const STORAGE_KEY = 'ai-chat-data';
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 5)}`;

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Remove duplicates by ID
      if (parsed.spaces) {
        const seen = new Set();
        parsed.spaces = parsed.spaces.filter(s => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
      }
      if (parsed.sessions) {
        const seen = new Set();
        parsed.sessions = parsed.sessions.filter(s => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export class HttpChatTransport extends ChatTransport {
  constructor(config = {}) {
    super();
    // Behest AI - Direct call (origin already allowed in dashboard)
    this.apiURL = 'https://spicy-jade-485.behest.app/v1/chat/completions';
    this.defaultModel = 'default';
    this._apiKey = 'behest_sk_live_2b529a0e093140bdba5a25aec44aee1e';
    
    const stored = loadFromStorage();
    this._mockSpaces = stored?.spaces || [...mockSpaces];
    this._mockSessions = stored?.sessions || [...mockSessions];
    this._mockMessages = stored?.messages || { ...mockMessages };
  }

  _persist() {
    saveToStorage({
      spaces: this._mockSpaces,
      sessions: this._mockSessions,
      messages: this._mockMessages
    });
  }

  setApiKey(key) {
    this._apiKey = key;
  }

  hasApiKey() {
    return !!this._apiKey;
  }

  _persist() {
    saveToStorage({
      spaces: this._mockSpaces,
      sessions: this._mockSessions,
      messages: this._mockMessages
    });
  }

  async _callPuterChat(content, systemPrompt) {
    // Dynamic import Puter.js
    const puter = await import('https://js.puter.com/v2/');
    const response = await puter.ai.chat(content, {
      systemPrompt: systemPrompt
    });
    return response;
  }

  async listAgents() {
    await this._delay(300);
    return mockAgentRoles;
  }

  async createSession(agentRoleId = null, spaceId = null) {
    await this._delay(200);
    const newSession = {
      id: generateId(),
      title: 'New Chat',
      spaceId,
      agentRoleId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessagePreview: null
    };
    this._mockSessions.unshift(newSession);
    this._mockMessages[newSession.id] = [];
    this._persist();
    return newSession;
  }

  async sendMessage(sessionId, content, agentRoleId = null) {
    const userMessage = {
      id: generateId(),
      sessionId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      state: 'done'
    };
    
    if (!this._mockMessages[sessionId]) {
      this._mockMessages[sessionId] = [];
    }
    this._mockMessages[sessionId].push(userMessage);
    
    const agentDescriptions = {
      'agent-1': 'You are a Code Assistant. Help with coding tasks, debugging, and explaining programming concepts.',
      'agent-2': 'You are a Writing Assistant. Help with writing, editing, and improving content.',
      'agent-3': 'You are a Research Assistant. Help with research and information gathering.',
      'agent-4': 'You are a Data Analyst. Help analyze data and provide insights.'
    };
    
    const systemPrompt = agentRoleId ? agentDescriptions[agentRoleId] : 'You are a helpful AI assistant.';
    let responseText = null;
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (this._apiKey) {
        headers['Authorization'] = `Bearer ${this._apiKey}`;
      }
      
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content }
          ],
          max_tokens: 1000
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        responseText = data?.choices?.[0]?.message?.content || null;
      } else {
        console.warn('API response not ok:', response.status);
      }
    } catch (error) {
      console.warn('Behest API call failed:', error.message);
    }
    
    if (!responseText) {
      const fallbackResponses = {
        'agent-1': `I can help you with coding! What specific programming task or concept would you like help with?`,
        'agent-2': `I'd be happy to help with your writing! What kind of content would you like to create or improve?`,
        'agent-3': `I'm ready to help with your research! What topic or information would you like to explore?`,
        'agent-4': `I can help analyze your data! What kind of analysis would you like to perform?`
      };
      responseText = agentRoleId ? fallbackResponses[agentRoleId] : `Thanks for your message! How can I help you today?`;
    }
    
    const assistantMessage = {
      id: generateId(),
      sessionId,
      role: 'assistant',
      content: responseText,
      createdAt: new Date().toISOString(),
      state: 'done'
    };
    
    this._mockMessages[sessionId].push(assistantMessage);
    
    const session = this._mockSessions.find(s => s.id === sessionId);
    if (session) {
      session.lastMessagePreview = content.length > 50 ? content.substring(0, 50) + '...' : content;
      session.updatedAt = new Date().toISOString();
    }
    
    this._persist();
    return { userMessage, assistantMessage };
  }

  async getMessages(sessionId) {
    await this._delay(200);
    return this._mockMessages[sessionId] || [];
  }

  async listSpaces() {
    await this._delay(200);
    return this._mockSpaces;
  }

  async listSessions(spaceId = null) {
    await this._delay(200);
    if (spaceId) {
      return this._mockSessions.filter(s => s.spaceId === spaceId);
    }
    return this._mockSessions;
  }

  async createSpace(name, description = null) {
    await this._delay(200);
    const newSpace = {
      id: generateId(),
      name,
      description,
      color: this._getRandomColor(),
      sessionCount: 0
    };
    this._mockSpaces.push(newSpace);
    this._persist();
    return newSpace;
  }

  _getRandomColor() {
    const colors = ['#078a52', '#43089f', '#3bd3fd', '#fbbd41', '#fc7981'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
