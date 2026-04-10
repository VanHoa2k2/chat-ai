import { useChatStore } from './store/chatStore';
import SidebarLeft from './components/SidebarLeft';
import ChatArea from './components/ChatArea';
import SidebarRight from './components/SidebarRight';

function App() {
  return (
    <div className="flex h-screen w-full bg-cream">
      <SidebarLeft />
      <ChatArea />
      <SidebarRight />
    </div>
  );
}

export default App;