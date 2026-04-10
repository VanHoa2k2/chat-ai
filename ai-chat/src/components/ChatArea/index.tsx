import { useRef, useState, useEffect, useMemo } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSendMessage } from '../../hooks/useChat';

function ChatHeader() {
  const { activeAgentRole, activeSession, activeSpace } = useChatStore();
  
  let title = 'Welcome';
  let subtitle = 'Select a chat or start a new conversation';
  
  if (activeAgentRole) {
    title = activeAgentRole.name;
    subtitle = activeAgentRole.description;
  } else if (activeSession) {
    title = activeSession.title;
    if (activeSpace) {
      subtitle = activeSpace.name;
    }
  }
  
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-oat bg-white min-h-[60px]">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-black m-0">{title}</h2>
          {subtitle && <p className="text-sm text-silver m-0">{subtitle}</p>}
        </div>
      </div>
      {activeAgentRole && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-oat-light rounded-full text-sm font-medium">
          <span>{activeAgentRole.icon}</span>
          <span>{activeAgentRole.name}</span>
        </div>
      )}
    </div>
  );
}

function MessageList({ sendMessageMutation }: { sendMessageMutation: any }) {
  const activeSession = useChatStore((state) => state.activeSession);
  const activeAgentRole = useChatStore((state) => state.activeAgentRole);
  const allMessages = useChatStore((state) => state.messages);
  const messages = useMemo(() => {
    if (!activeSession) return [];
    return allMessages.filter(m => m.sessionId === activeSession.id);
  }, [allMessages, activeSession]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (!activeSession && !activeAgentRole) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">Start a conversation</h3>
          <p className="text-silver text-sm max-w-md">
            Select an agent role from the sidebar or create a new chat to begin.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-3">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-matcha-600 text-white' 
                : 'bg-ube-800 text-white'
            }`}
          >
            {message.role === 'user' ? '👤' : '🤖'}
          </div>
          <div className="flex-1 min-w-0">
            <div 
              className={`px-4 py-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-matcha-600 text-white' 
                  : 'bg-white border border-oat text-charcoal'
              }`}
            >
              <p className="whitespace-pre-wrap break-words m-0">{message.content}</p>
            </div>
            <div className="text-xs text-silver mt-1">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
      {sendMessageMutation.isPending && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 bg-ube-800 text-white">
            🤖
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageInput({ sendMessageMutation }: { sendMessageMutation: any }) {
  const activeSession = useChatStore((state) => state.activeSession);
  const activeAgentRole = useChatStore((state) => state.activeAgentRole);
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSend = async () => {
    if (!input.trim() || sendMessageMutation.isPending) return;
    
    const content = input.trim();
    setInput('');
    await sendMessageMutation.mutateAsync({ content });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };
  
  if (!activeSession && !activeAgentRole) {
    return null;
  }
  
  return (
    <div className="p-4 bg-white border-t border-oat">
      <div className="flex gap-3 items-end bg-white border border-oat rounded-xl p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 min-h-[40px] max-h-[200px] resize-none border-0 outline-none bg-transparent p-2 text-charcoal placeholder:text-silver"
          rows={1}
          disabled={sendMessageMutation.isPending}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sendMessageMutation.isPending}
          className="px-4 py-2 bg-matcha-600 text-white rounded-lg font-medium hover:bg-matcha-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sendMessageMutation.isPending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default function ChatArea() {
  const sendMessageMutation = useSendMessage();
  
  return (
    <div className="flex-1 flex flex-col h-screen bg-cream">
      <ChatHeader />
      <MessageList sendMessageMutation={sendMessageMutation} />
      <MessageInput sendMessageMutation={sendMessageMutation} />
    </div>
  );
}