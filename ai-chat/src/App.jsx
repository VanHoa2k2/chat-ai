import { ChatProvider } from './store/ChatContext';
import SidebarLeft from './components/SidebarLeft';
import ChatArea from './components/ChatArea';
import SidebarRight from './components/SidebarRight';

function App() {
  return (
    <ChatProvider>
      <div style={styles.container}>
        <SidebarLeft />
        <ChatArea />
        <SidebarRight />
      </div>
    </ChatProvider>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100%',
    background: 'var(--color-cream)',
  },
};

export default App;