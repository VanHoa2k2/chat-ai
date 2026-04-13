import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Bot } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { MessageItem } from './MessageItem';
import type { Message } from '@/types';

export const MessageList = () => {
  const { activeSession, activeAgentRole, allMessages, isSending } = useChatStore(
    useShallow((state) => ({
      activeSession: state.activeSession,
      activeAgentRole: state.activeAgentRole,
      allMessages: state.messages,
      isSending: state.loading.sending,
    }))
  );
  
  const messages = useMemo(() => {
    if (!activeSession) return [];
    return allMessages.filter((m: Message) => m.sessionId === activeSession.id);
  }, [allMessages, activeSession]);
  
  const scrollToBottom = useCallback(() => {
    const messagesEndRef = document.getElementById('messages-end');
    messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useCallback(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);
  
  if (!activeSession && !activeAgentRole) {
    return (
      <div className="h-[calc(100dvh-180px)] flex items-center justify-center p-8">
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
    <div className="flex-1 p-4 space-y-4 pt-0 pb-4">
      {messages.map((message: Message) => (
        <MessageItem key={message.id} message={message} />
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
      <div id="messages-end" />
    </div>
  );
}