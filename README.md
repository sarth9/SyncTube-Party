# SyncTube Party - Real-Time YouTube Watch Party

SyncTube Party is a full-stack real-time YouTube Watch Party application where users can create rooms, invite others, watch YouTube videos together in sync, chat live, and manage participant roles.

The project is built with a production-style architecture using React, TypeScript, Node.js, Express, Socket.IO, MongoDB Atlas, and the YouTube IFrame API.

---

## Features

### Room Management

- Create a new watch party room.
- Join an existing room using a room code or clean invite link.
- Room creator automatically becomes Host.
- Shared invite link does not expose the host username.
- Participants enter their own name before joining.
- Room existence is validated before joining.

### Real-Time YouTube Sync

- Play sync.
- Pause sync.
- Seek/timeline sync.
- Video change sync.
- New joiners receive latest video state.
- Host/Moderator controls playback directly from the native YouTube player.
- Participant is watch-only.

### Role-Based Access Control

The app supports three roles:

#### Host

- Controls YouTube playback.
- Changes video.
- Promotes users to Moderator.
- Demotes users to Participant.
- Removes participants.

#### Moderator

- Controls playback.
- Changes video.

#### Participant

- Watch-only.
- Can send chat messages.
- Cannot control playback.
- Cannot change video.
- Cannot manage users.

### Real-Time Chat

- Live room chat using Socket.IO.
- Chat messages are persisted in MongoDB Atlas.
- New joiners receive recent chat history.
- Messages include username, timestamp, and sender identity.

### Cloud Database

MongoDB Atlas is used to persist:

- Room data.
- Current video state.
- Chat history.

If the backend restarts, the room and chat history can still be restored from the database.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Socket.IO Client
- YouTube IFrame API
- Lucide React Icons

### Backend

- Node.js
- Express.js
- TypeScript
- Socket.IO
- MongoDB Atlas
- Mongoose
- CORS
- Dotenv

---

## Architecture

The backend follows a production-style **MVC + Service + Socket** architecture.

```txt
backend/src
│
├── classes
│   ├── Participant.ts
│   ├── Room.ts
│   └── RoomManager.ts
│
├── config
│   ├── cors.config.ts
│   └── env.config.ts
│
├── controllers
│   └── room.controller.ts
│
├── db
│   └── connect.ts
│
├── models
│   ├── ChatMessageModel.ts
│   └── RoomModel.ts
│
├── routes
│   └── room.routes.ts
│
├── services
│   └── room.service.ts
│
├── socket
│   └── socketHandler.ts
│
├── types
│   └── index.ts
│
├── utils
│   └── roomCode.ts
│
├── app.ts
└── server.ts