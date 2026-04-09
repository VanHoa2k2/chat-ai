import React, { useState } from 'react';
import { useChat } from '../../store/ChatContext';

const styles = {
  container: {
    width: 'var(--sidebar-left-width)',
    minWidth: 'var(--sidebar-left-width)',
    height: '100vh',
    background: 'var(--color-white)',
    borderRight: '1px solid var(--color-oat)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    padding: 'var(--space-16)',
    borderBottom: '1px solid var(--color-oat-light)'
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'var(--weight-heading)',
    color: 'var(--color-black)',
    margin: 0
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-12)'
  },
  section: {
    marginBottom: 'var(--space-20)'
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 'var(--weight-ui)',
    color: 'var(--color-silver)',
    textTransform: 'uppercase',
    letterSpacing: '1.08px',
    marginBottom: 'var(--space-8)',
    padding: '0 var(--space-8)'
  },
  sectionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--space-8)',
    borderRadius: 'var(--radius-standard)',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    gap: 'var(--space-8)'
  },
  itemActive: {
    background: 'var(--color-oat-light)'
  },
  itemIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  },
  itemText: {
    flex: 1,
    fontSize: '15px',
    fontWeight: 'var(--weight-ui)',
    color: 'var(--color-black)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  itemBadge: {
    background: 'var(--color-silver)',
    color: 'var(--color-white)',
    fontSize: '11px',
    fontWeight: 'var(--weight-ui)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-badge)'
  },
  preview: {
    fontSize: '13px',
    color: 'var(--color-silver)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '140px'
  },
  newButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-6)',
    padding: 'var(--space-8) var(--space-12)',
    margin: 'var(--space-8) var(--space-12)',
    background: 'var(--color-cream)',
    border: '1px dashed var(--color-oat)',
    borderRadius: 'var(--radius-standard)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'var(--weight-ui)',
    color: 'var(--color-charcoal)',
    transition: 'all 0.15s ease'
  },
  newButtonHover: {
    background: 'var(--color-oat-light)',
    border: '1px solid var(--color-oat)'
  },
  emptyState: {
    padding: 'var(--space-16)',
    textAlign: 'center',
    color: 'var(--color-silver)',
    fontSize: '14px'
  }
};

export default function SidebarLeft() {
  const { state, selectAgentRole, selectSpace, selectSession, createSession, createSpace } = useChat();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [newChatHover, setNewChatHover] = useState(false);
  const [newSpaceHover, setNewSpaceHover] = useState(false);

  const handleNewChat = async () => {
    await createSession();
  };

  const handleNewSpace = async () => {
    const name = prompt('Enter space name:');
    if (name) {
      await createSpace(name);
    }
  };

  const renderAgentRoles = () => {
    if (state.loading.agents) {
      return <div style={styles.emptyState}>Loading agents...</div>;
    }

    if (!state.agentRoles.length) {
      return <div style={styles.emptyState}>No agents available</div>;
    }

    return (
      <div style={styles.sectionContent}>
        {state.agentRoles.map(agent => (
          <div
            key={agent.id}
            style={{
              ...styles.item,
              ...(state.activeAgentRole?.id === agent.id ? styles.itemActive : {}),
              ...(hoveredItem === `agent-${agent.id}` ? { background: 'var(--color-oat-light)' } : {})
            }}
            onClick={() => selectAgentRole(agent)}
            onMouseEnter={() => setHoveredItem(`agent-${agent.id}`)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div style={styles.itemIcon}>{agent.icon}</div>
            <span style={styles.itemText}>{agent.name}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderSpaces = () => {
    if (state.loading.spaces) {
      return <div style={styles.emptyState}>Loading spaces...</div>;
    }

    if (!state.spaces.length) {
      return <div style={styles.emptyState}>No spaces</div>;
    }

    return (
      <div style={styles.sectionContent}>
        {state.spaces.map(space => (
          <div
            key={space.id}
            style={{
              ...styles.item,
              ...(state.activeSpace?.id === space.id ? styles.itemActive : {}),
              ...(hoveredItem === `space-${space.id}` ? { background: 'var(--color-oat-light)' } : {})
            }}
            onClick={() => selectSpace(space)}
            onMouseEnter={() => setHoveredItem(`space-${space.id}`)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div 
              style={{
                ...styles.itemIcon,
                background: space.color,
                borderRadius: 'var(--radius-sharp)'
              }} 
            />
            <span style={styles.itemText}>{space.name}</span>
            <span style={styles.itemBadge}>{space.sessionCount}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderSessions = () => {
    const displaySessions = state.activeSpace 
      ? state.sessions.filter(s => s.spaceId === state.activeSpace.id)
      : state.sessions.filter(s => !s.spaceId);

    if (state.loading.sessions) {
      return <div style={styles.emptyState}>Loading sessions...</div>;
    }

    if (!displaySessions.length) {
      return <div style={styles.emptyState}>No sessions</div>;
    }

    return (
      <div style={styles.sectionContent}>
        {displaySessions.map(session => (
          <div
            key={session.id}
            style={{
              ...styles.item,
              ...(state.activeSession?.id === session.id ? styles.itemActive : {}),
              ...(hoveredItem === `session-${session.id}` ? { background: 'var(--color-oat-light)' } : {})
            }}
            onClick={() => selectSession(session)}
            onMouseEnter={() => setHoveredItem(`session-${session.id}`)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div style={styles.itemIcon}>💬</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={styles.itemText}>{session.title}</div>
              {session.lastMessagePreview && (
                <div style={styles.preview}>{session.lastMessagePreview}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>AI Chat</h1>
      </div>

      <div 
        style={{
          ...styles.newButton,
          ...(newChatHover ? styles.newButtonHover : {})
        }}
        onClick={handleNewChat}
        onMouseEnter={() => setNewChatHover(true)}
        onMouseLeave={() => setNewChatHover(false)}
      >
        <span>+</span>
        <span>New Chat</span>
      </div>

      <nav style={styles.nav}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Agent Roles</div>
          {renderAgentRoles()}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Spaces</div>
          {renderSpaces()}
        </div>

        <div 
          style={{
            ...styles.newButton,
            ...(newSpaceHover ? styles.newButtonHover : {})
          }}
          onClick={handleNewSpace}
          onMouseEnter={() => setNewSpaceHover(true)}
          onMouseLeave={() => setNewSpaceHover(false)}
        >
          <span>+</span>
          <span>New Space</span>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Sessions</div>
          {renderSessions()}
        </div>
      </nav>
    </div>
  );
}