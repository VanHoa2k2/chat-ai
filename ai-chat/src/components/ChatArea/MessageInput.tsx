import { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export function MessageInput() {
  const activeSession = useChatStore((state) => state.activeSession);
  const activeAgentRole = useChatStore((state) => state.activeAgentRole);
  const isSending = useChatStore((state) => state.loading.sending);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    
    const content = input.trim();
    setInput('');
    await sendMessage(content);
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
      <div className="flex items-end gap-2 bg-cream border border-oat rounded-2xl px-3 py-2">
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