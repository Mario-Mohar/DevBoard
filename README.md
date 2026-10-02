
# DevBoard
 
**A Kanban board built for developers.**
 
Track tasks, attach code snippets, sync GitHub issues, and stay focused with a built-in Pomodoro timer — all in one place.
 
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](#tech-stack)
[![Contributors](https://img.shields.io/github/contributors/anoopcodehack/DevBoard)](https://github.com/anoopcodehack/DevBoard/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/anoopcodehack/DevBoard?style=social)](https://github.com/anoopcodehack/DevBoard/stargazers)
 
![DevBoard Screenshot](https://github.com/user-attachments/assets/a3ee8e4e-026b-4f8f-be2e-d0a2f436810c)
 
🔗 **[Live Demo](https://devboard.vercel.app)** · [Report a Bug](https://github.com/anoopcodehack/DevBoard/issues/new?labels=bug) · [Request a Feature](https://github.com/anoopcodehack/DevBoard/issues/new?labels=enhancement)
 
---
 
## Overview
 
Most task boards are built for project managers, not developers. DevBoard is different — it lets you attach code snippets directly to tasks, pull in GitHub issues as cards, and track focus time with a Pomodoro timer, without ever leaving your workflow.
 
---
 
## Features
 
- **Drag & Drop Kanban** — Move tasks across Backlog, In Progress, Review, and Done
- **Code Snippets** — Attach syntax-highlighted code to any task, with language detection
- **GitHub Issue Sync** — Import open issues from any GitHub repository as tasks
- **Pomodoro Timer** — 25/5 minute work-break cycles, tracked per task
- **JWT Authentication** — Secure register and login flow
- **Dark UI** — Designed for long coding sessions
---
 
## Tech Stack
 
| Layer       | Technology                      |
|-------------|----------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS    |
| Backend     | Node.js, Express                |
| Database    | MongoDB, Mongoose               |
| Auth        | JWT, bcryptjs                   |
| Drag & Drop | @hello-pangea/dnd               |
 
---
 
## Getting Started
 
### Prerequisites
 
- Node.js v18+
- MongoDB — [Atlas free tier](https://www.mongodb.com/atlas) or local instance
### Installation
 
```bash
# 1. Clone the repo
git clone https://github.com/anoopcodehack/devboard.git
cd devboard
 
# 2. Install all dependencies (frontend + backend)
npm run install:all
 
# 3. Set up environment variables
cp .env.example server/.env
# Edit server/.env with your MONGO_URI and JWT_SECRET
 
# 4. Start the development server
npm run dev
```
 
| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:5000 |
 
---
 
## Keyboard Shortcuts
 
| Key     | Action               |
|---------|----------------------|
| `N`     | Create a new task    |
| `Esc`   | Close modal          |
| `1`     | Set priority: High   |
| `2`     | Set priority: Medium |
| `3`     | Set priority: Low    |
| `?`     | Show shortcuts help  |
 
---
 
## Contributing
 
Contributions are welcome. This project is beginner-friendly and a good place to make your first open source contribution.
 
1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request
See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide. Issues labeled [`good first issue`](https://github.com/anoopcodehack/DevBoard/issues?q=label%3A%22good+first+issue%22) are a good starting point.
 
---
 
## Contributors
 
Thanks to everyone who has contributed to DevBoard.
 
[![Contributors](https://contrib.rocks/image?repo=anoopcodehack/DevBoard)](https://github.com/anoopcodehack/DevBoard/graphs/contributors)
 
---
 
## License
 
[MIT](./LICENSE)
