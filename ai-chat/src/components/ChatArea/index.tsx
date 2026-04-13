import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

const ChatArea = () => {
  return (
    <div className="flex-1 flex flex-col h-[100dvh] bg-cream">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
          <div className="sticky top-0 z-10 bg-transparent">
            <ChatHeader />
          </div>
          <div className="max-w-4xl mx-auto">
            <MessageList />
          </div>
        </div>
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatArea;