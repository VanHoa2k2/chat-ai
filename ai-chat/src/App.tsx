import { useChatStore } from './store/chatStore';
import SidebarLeft from './components/SidebarLeft';
import ChatArea from './components/ChatArea';
import SidebarRight from './components/SidebarRight';
import { Menu } from 'lucide-react';

function App() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useChatStore();
  
  return (
    <div className="flex h-screen w-full bg-cream">
      <div 
        className={`sidebar-left-overlay ${mobileSidebarOpen ? 'visible' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <SidebarLeft />
      <div className="flex-1 flex flex-col">
        <div className="md:hidden p-2 flex items-center">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 hover:bg-oat-light rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-charcoal" />
          </button>
        </div>
        <ChatArea />
      </div>
      <SidebarRight />
    </div>
  );
}

export default App;