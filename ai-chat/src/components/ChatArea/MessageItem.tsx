import { useMemo, memo } from 'react';
import { User, Bot } from 'lucide-react';
import type { Message } from '@/types';

interface MessageItemProps {
  message: Message;
}

export const MessageItem = memo(({ message }: MessageItemProps) => {
  const formattedTime = useMemo(() => 
    new Date(message.createdAt).toLocaleTimeString()
  , [message.createdAt]);
  
  return (
    <div 
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
          {formattedTime}
        </div>
      </div>
    </div>
  );
});