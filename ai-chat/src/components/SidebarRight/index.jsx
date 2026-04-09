import React from 'react';
import { useChat } from '../../store/ChatContext';
import { AppType } from '../../domain/types';

const styles = {
  container: {
    width: 'var(--sidebar-right-width)',
    minWidth: 'var(--sidebar-right-width)',
    height: '100vh',
    background: 'var(--color-white)',
    borderLeft: '1px solid var(--color-oat)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--space-12) 0',
    gap: 'var(--space-4)'
  },
  appButton: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-standard)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    border: 'none',
    background: 'transparent'
  },
  appButtonActive: {
    background: 'var(--color-cream)'
  },
  appButtonInactive: {
    opacity: 0.4
  },
  appButtonDisabled: {
    opacity: 0.2,
    cursor: 'not-allowed'
  },
  tooltip: {
    position: 'absolute',
    left: '100%',
    marginLeft: 'var(--space-8)',
    background: 'var(--color-black)',
    color: 'var(--color-white)',
    padding: 'var(--space-4) var(--space-8)',
    borderRadius: 'var(--radius-sharp)',
    fontSize: '12px',
    fontWeight: 'var(--weight-ui)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.15s ease'
  },
  appButtonWithTooltip: {
    position: 'relative'
  }
};

const apps = [
  { type: AppType.AGENT_CHAT, icon: '💬', label: 'Agent Chat' },
  { type: AppType.FILES, icon: '📁', label: 'Files', disabled: true },
  { type: AppType.MAILS, icon: '✉️', label: 'Mails', disabled: true },
  { type: AppType.KNOWLEDGE_BASE, icon: '📚', label: 'Knowledge Base', disabled: true }
];

export default function SidebarRight() {
  const { state, setActiveApp } = useChat();
  
  const handleAppClick = (app) => {
    if (app.disabled) return;
    setActiveApp(app.type);
  };
  
  return (
    <div style={styles.container}>
      {apps.map(app => {
        const isActive = state.activeApp === app.type;
        const isDisabled = app.disabled;
        
        return (
          <button
            key={app.type}
            style={{
              ...styles.appButton,
              ...(isActive ? styles.appButtonActive : styles.appButtonInactive),
              ...(isDisabled ? styles.appButtonDisabled : {})
            }}
            onClick={() => handleAppClick(app)}
            disabled={isDisabled}
            title={isDisabled ? `${app.label} (Coming soon)` : app.label}
          >
            {app.icon}
          </button>
        );
      })}
    </div>
  );
}