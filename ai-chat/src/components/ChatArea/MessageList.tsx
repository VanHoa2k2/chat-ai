import { useRef, useEffect, useMemo } from 'react';
import { User, Bot } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import type { Message } from '../../types';

export function MessageList() {
  const activeSession = useChatStore((state) => state.activeSession);
  const activeAgentRole = useChatStore((state) => state.activeAgentRole);
  const allMessages = useChatStore((state) => state.messages);
  const isSending = useChatStore((state) => state.loading.sending);
  
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
          <Bot className="w-12 h-12 text-silver mx-auto mb-4" />
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
      {messages.map((message: Message) => (
        <div 
          key={message.id} 
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-oat-light text-charcoal' 
                : 'bg-ube-800 text-white'
            }`}
          >
            {message.role === 'user' 
              ? <User className="w-4 h-4" /> 
              : <Bot className="w-4 h-4" />
            }
          </div>
          <div className="min-w-0 max-w-[70%]">
            <div className={`px-4 py-3 rounded-2xl ${
              message.role === 'user' 
                ? 'bg-white border border-oat' 
                : 'bg-ube-50 border border-ube-100'
            } text-charcoal`}>
              <p className="whitespace-pre-wrap break-words m-0 text-sm">{message.content}</p>
            </div>
            <div className={`text-xs text-silver mt-1.5 ${message.role === 'user' ? 'mr-1 text-right' : 'ml-1'}`}>
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
      {isSending && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-ube-800 text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 pt-2">
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