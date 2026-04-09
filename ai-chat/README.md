# AI Agent Chat App

A Slack-like AI Agent Chat web app with 3-column layout, built with React and following the Clay design system.

## Features

- **3-Column Layout**: Left sidebar (navigation), center (chat), right (app switcher)
- **Agent Roles**: Predefined agent personas (Code Assistant, Writer, Researcher, Analyst)
- **Sessions**: Generic chats without special topics
- **Spaces**: Grouped collections of related sessions
- **HTTP Transport**: OpenAI API-compatible integration (mock mode for development)
- **NATS-ready Architecture**: Transport abstraction allows easy addition of NATS transport later

## Getting Started

```bash
cd ai-chat
npm install
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── SidebarLeft/      # Navigation (agents, spaces, sessions)
│   ├── ChatArea/         # Chat messages and input
│   └── SidebarRight/     # App switcher
├── store/
│   └── ChatContext.jsx   # State management
├── domain/
│   ├── types.js          # Domain entity types
│   └── mockData.js       # Mock data for development
├── transport/
│   ├── ChatTransport.js  # Transport interface
│   └── HttpChatTransport.js  # HTTP implementation
└── index.css             # Design system variables
```

## Design System

Following Clay design system with:
- Warm cream background (`#faf9f7`)
- Oat-toned borders (`#dad4c8`)
- Roobert font with OpenType stylistic sets
- Swatch palette: Matcha, Slushie, Lemon, Ube, Pomegranate

## Adding a New Agent Role

Edit `src/domain/mockData.js` to add new agents:

```javascript
{
  id: 'agent-5',
  name: 'Your Agent',
  description: 'Description',
  icon: '🎯',
  color: '#color',
  systemPrompt: 'System prompt'
}
```

## Adding NATS Transport

1. Create `src/transport/NatsChatTransport.js` implementing `ChatTransport` interface
2. In `ChatContext.jsx`, swap `HttpChatTransport` for `NatsChatTransport`

No UI changes required - transport is abstracted from presentation layer.