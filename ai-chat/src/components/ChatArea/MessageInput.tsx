import { useRef, useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Send } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

export const MessageInput = () => {
  const { activeSession, activeAgentRole, isSending, sendMessage } = useChatStore(
    useShallow((state) => ({
      activeSession: state.activeSession,
      activeAgentRole: state.activeAgentRole,
      isSending: state.loading.sending,
      sendMessage: state.sendMessage,
    }))
  );
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending) return;
    
    const content = input.trim();
    setInput('');
    await sendMessage(content);
  }, [input, isSending, sendMessage]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, []);
  
  if (!activeSession && !activeAgentRole) {
    return null;
  }
  
  return (
    <div className="message-input-container pb-8 px-2">
      <div className="flex items-end gap-2 bg-white border border-oat rounded-2xl px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 outline-none bg-transparent py-1 text-charcoal placeholder:text-silver text-sm"
          rows={1}
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          className="p-2 bg-matcha-600 text-white rounded-xl hover:bg-matcha-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}