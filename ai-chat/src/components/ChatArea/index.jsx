import React, { useRef, useEffect } from 'react';
import { useChat } from '../../store/ChatContext';

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'var(--color-cream)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-12) var(--space-16)',
    borderBottom: '1px solid var(--color-oat)',
    background: 'var(--color-white)',
    minHeight: '60px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-12)'
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: 'var(--weight-heading)',
    color: 'var(--color-black)',
    margin: 0
  },
  headerSubtitle: {
    fontSize: '13px',
    color: 'var(--color-silver)'
  },
  agentBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-6)',
    padding: 'var(--space-4) var(--space-8)',
    background: 'var(--color-oat-light)',
    borderRadius: 'var(--radius-pill)',
    fontSize: '13px',
    fontWeight: 'var(--weight-ui)'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-16)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-16)'
  },
  messageGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  },
  messageRow: {
    display: 'flex',
    gap: 'var(--space-12)',
    alignItems: 'flex-start'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0
  },
  avatarUser: {
    background: 'var(--color-matcha-600)',
    color: 'var(--color-white)'
  },
  avatarAssistant: {
    background: 'var(--color-ube-800)',
    color: 'var(--color-white)'
  },
  messageContent: {
    flex: 1,
    maxWidth: '700px'
  },
  messageRole: {
    fontSize: '12px',
    fontWeight: 'var(--weight-ui)',
    color: 'var(--color-silver)',
    marginBottom: 'var(--space-2)',
    textTransform: 'capitalize'
  },
  messageText: {
    fontSize: '15px',
    lineHeight: '1.60',
    color: 'var(--color-black)',
    whiteSpace: 'pre-wrap'
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-32)',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: 'var(--space-16)',
    opacity: 0.5
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: 'var(--weight-heading)',
    color: 'var(--color-black)',
    marginBottom: 'var(--space-8)'
  },
  emptyText: {
    fontSize: '15px',
    color: 'var(--color-silver)',
    maxWidth: '400px'
  },
  loadingDots: {
    display: 'flex',
    gap: 'var(--space-4)',
    padding: 'var(--space-12)'
  },
  dot: {
    width: '8px',
    height: '8px',
    background: 'var(--color-silver)',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out'
  }
};

function ChatHeader() {
  const { state } = useChat();
  
  let title = 'Welcome';
  let subtitle = 'Select a chat or start a new conversation';
  
  if (state.activeAgentRole) {
    title = state.activeAgentRole.name;
    subtitle = state.activeAgentRole.description;
  } else if (state.activeSession) {
    title = state.activeSession.title;
    if (state.activeSpace) {
      subtitle = state.activeSpace.name;
    }
  }
  
  return (
    <div style={styles.header}>
      <div style={styles.headerLeft}>
        <div>
          <h2 style={styles.headerTitle}>{title}</h2>
          {subtitle && <p style={styles.headerSubtitle}>{subtitle}</p>}
        </div>
      </div>
      {state.activeAgentRole && (
        <div style={styles.agentBadge}>
          <span>{state.activeAgentRole.icon}</span>
          <span>{state.activeAgentRole.name}</span>
        </div>
      )}
    </div>
  );
}

function MessageList() {
  const { state } = useChat();
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);
  
  if (!state.activeSession && !state.activeAgentRole) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>💬</div>
        <h3 style={styles.emptyTitle}>Start a conversation</h3>
        <p style={styles.emptyText}>
          Select an agent role from the sidebar or create a new chat to begin.
        </p>
      </div>
    );
  }
  
  if (state.loading.messages) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.loadingDots}>
          <div style={{...styles.dot, animationDelay: '0s'}} />
          <div style={{...styles.dot, animationDelay: '0.2s'}} />
          <div style={{...styles.dot, animationDelay: '0.4s'}} />
        </div>
      </div>
    );
  }
  
  if (state.messages.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>👋</div>
        <h3 style={styles.emptyTitle}>No messages yet</h3>
        <p style={styles.emptyText}>
          Send a message to start the conversation.
        </p>
      </div>
    );
  }
  
  return (
    <div style={styles.messagesContainer}>
      {state.messages.map((message, index) => {
        const isUser = message.role === 'user';
        const showAvatar = index === 0 || state.messages[index - 1].role !== message.role;
        
        return (
          <div key={message.id} style={styles.messageGroup}>
            <div style={styles.messageRow}>
              {showAvatar && (
                <div style={{
                  ...styles.avatar,
                  ...(isUser ? styles.avatarUser : styles.avatarAssistant)
                }}>
                  {isUser ? '👤' : '🤖'}
                </div>
              )}
              {!showAvatar && <div style={{ width: '32px' }} />}
              <div style={styles.messageContent}>
                <div style={styles.messageRole}>{message.role}</div>
                <div style={styles.messageText}>{message.content}</div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageInput() {
  const { state, sendMessage } = useChat();
  const [input, setInput] = React.useState('');
  const textareaRef = useRef(null);
  
  const handleSend = async () => {
    if (!input.trim() || state.loading.sending) return;
    
    const content = input.trim();
    setInput('');
    await sendMessage(content);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleInput = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };
  
  if (!state.activeSession && !state.activeAgentRole) {
    return null;
  }
  
  return (
    <div style={{
      padding: 'var(--space-12) var(--space-16)',
      background: 'var(--color-white)',
      borderTop: '1px solid var(--color-oat)'
    }}>
      <div style={{
        display: 'flex',
        gap: 'var(--space-12)',
        alignItems: 'flex-end',
        background: 'var(--color-white)',
        border: '1px solid var(--color-oat)',
        borderRadius: 'var(--radius-feature)',
        padding: 'var(--space-8) var(--space-12)'
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'var(--font-primary)',
            fontSize: '15px',
            lineHeight: '1.50',
            background: 'transparent',
            maxHeight: '200px'
          }}
          disabled={state.loading.sending}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || state.loading.sending}
          style={{
            padding: 'var(--space-8) var(--space-16)',
            background: input.trim() && !state.loading.sending ? 'var(--color-black)' : 'var(--color-oat-light)',
            color: input.trim() && !state.loading.sending ? 'var(--color-white)' : 'var(--color-silver)',
            border: 'none',
            borderRadius: 'var(--radius-standard)',
            cursor: input.trim() && !state.loading.sending ? 'pointer' : 'not-allowed',
            fontWeight: 'var(--weight-ui)',
            transition: 'all 0.2s ease'
          }}
        >
          {state.loading.sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default function ChatArea() {
  return (
    <div style={styles.container}>
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}