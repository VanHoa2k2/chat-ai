export class ChatTransport {
  async listAgents() {
    throw new Error('Not implemented');
  }

  async createSession(agentRoleId = null, spaceId = null) {
    throw new Error('Not implemented');
  }

  async sendMessage(sessionId, content, agentRoleId = null) {
    throw new Error('Not implemented');
  }

  async getMessages(sessionId) {
    throw new Error('Not implemented');
  }

  async listSpaces() {
    throw new Error('Not implemented');
  }

  async listSessions(spaceId = null) {
    throw new Error('Not implemented');
  }

  async createSpace(name, description = null) {
    throw new Error('Not implemented');
  }
}