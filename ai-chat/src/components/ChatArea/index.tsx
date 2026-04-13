import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export default function ChatArea() {
  return (
    <div className="flex-1 flex flex-col h-screen bg-cream">
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col  w-full">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="sticky top-0 z-10 bg-transparent">
              <ChatHeader />
            </div>
            <div className="max-w-4xl  mx-auto">
            <MessageList />
            </div>
          </div>
          <MessageInput />
        </div>
      </div>
    </div>
  );
}