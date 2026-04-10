import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export default function ChatArea() {
  return (
    <div className="flex-1 flex flex-col h-screen bg-cream">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}