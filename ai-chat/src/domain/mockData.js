import { AgentRole, Session, Space, Message } from './types';

export const mockAgentRoles = [
  {
    id: 'agent-1',
    name: 'Code Assistant',
    description: 'Helps with coding tasks and debugging',
    icon: '💻',
    color: '#078a52',
    systemPrompt: 'You are a helpful coding assistant.',
  },
  {
    id: 'agent-2',
    name: 'Writer',
    description: 'Helps with writing and editing content',
    icon: '✍️',
    color: '#43089f',
    systemPrompt: 'You are a professional writer.',
  },
  {
    id: 'agent-3',
    name: 'Researcher',
    description: 'Helps with research and information gathering',
    icon: '🔍',
    color: '#3bd3fd',
    systemPrompt: 'You are a research specialist.',
  },
  {
    id: 'agent-4',
    name: 'Analyst',
    description: 'Helps analyze data and provide insights',
    icon: '📊',
    color: '#fbbd41',
    systemPrompt: 'You are a data analyst.',
  }
];

export const mockSpaces = [
  {
    id: 'space-1',
    name: 'Work Projects',
    description: 'Work-related conversations',
    color: '#078a52',
    sessionCount: 3
  },
  {
    id: 'space-2',
    name: 'Personal',
    description: 'Personal chats',
    color: '#43089f',
    sessionCount: 2
  },
  {
    id: 'space-3',
    name: 'Research',
    description: 'Research and exploration',
    color: '#3bd3fd',
    sessionCount: 1
  }
];

export const mockSessions = [
  {
    id: 'session-1',
    title: 'React Hooks Tutorial',
    spaceId: 'space-1',
    agentRoleId: 'agent-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    lastMessagePreview: 'How do I use useEffect properly?'
  },
  {
    id: 'session-2',
    title: 'Blog Post Draft',
    spaceId: 'space-2',
    agentRoleId: 'agent-2',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T11:00:00Z',
    lastMessagePreview: 'Can you improve this paragraph?'
  },
  {
    id: 'session-3',
    title: 'Market Research',
    spaceId: 'space-3',
    agentRoleId: 'agent-3',
    createdAt: '2024-01-13T15:00:00Z',
    updatedAt: '2024-01-13T16:00:00Z',
    lastMessagePreview: 'Find information about AI trends'
  },
  {
    id: 'session-4',
    title: 'Data Analysis',
    spaceId: 'space-1',
    agentRoleId: 'agent-4',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T12:00:00Z',
    lastMessagePreview: 'Analyze this dataset'
  },
  {
    id: 'session-5',
    title: 'Quick Question',
    spaceId: null,
    agentRoleId: null,
    createdAt: '2024-01-11T08:00:00Z',
    updatedAt: '2024-01-11T08:30:00Z',
    lastMessagePreview: 'What is React?'
  }
];

export const mockMessages = {
  'session-1': [
    {
      id: 'msg-1',
      sessionId: 'session-1',
      role: 'user',
      content: 'How do I use useEffect in React?',
      createdAt: '2024-01-15T10:00:00Z',
      state: 'done'
    },
    {
      id: 'msg-2',
      sessionId: 'session-1',
      role: 'assistant',
      content: 'useEffect is a hook that lets you perform side effects in function components. It runs after every render by default. Here\'s a basic example:\n\n```jsx\nuseEffect(() => {\n  // Effect code here\n  console.log(\'Component rendered!\');\n});\n```\n\nYou can also control when it runs by providing a dependency array as the second argument.',
      createdAt: '2024-01-15T10:01:00Z',
      state: 'done'
    },
    {
      id: 'msg-3',
      sessionId: 'session-1',
      role: 'user',
      content: 'How do I use useEffect properly?',
      createdAt: '2024-01-15T14:30:00Z',
      state: 'done'
    }
  ],
  'session-5': [
    {
      id: 'msg-4',
      sessionId: 'session-5',
      role: 'user',
      content: 'What is React?',
      createdAt: '2024-01-11T08:00:00Z',
      state: 'done'
    },
    {
      id: 'msg-5',
      sessionId: 'session-5',
      role: 'assistant',
      content: 'React is a JavaScript library for building user interfaces. It was developed by Facebook and is now maintained by Meta and a community of developers. React uses a component-based architecture and a virtual DOM to efficiently update the UI.',
      createdAt: '2024-01-11T08:01:00Z',
      state: 'done'
    }
  ]
};