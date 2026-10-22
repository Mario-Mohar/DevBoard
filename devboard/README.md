# 🗂️ DevBoard — Kanban for Developers

> An open source Kanban board built specifically for developers — with code snippets inside tasks, GitHub issue sync, and a built-in Pomodoro timer.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Made with MERN](https://img.shields.io/badge/Stack-MERN-blue.svg)](#tech-stack)

## ✨ Features

- 📋 **Drag & Drop Kanban** — Backlog → In Progress → Review → Done
- 💻 **Code Snippets in Tasks** — Save code directly inside a task with syntax highlighting
- 🔗 **GitHub Issue Sync** — Import GitHub issues as tasks automatically
- 🍅 **Pomodoro Timer** — Built-in 25/5 min work-break timer per task
- 🔐 **Auth** — Register/login with JWT
- 🌙 **Dark Mode UI** — Easy on the eyes

## 🛠️ Tech Stack

| Layer     | Tech                        |
|-----------|-----------------------------|
| Frontend  | React 18 + Vite + Tailwind  |
| Backend   | Node.js + Express           |
| Database  | MongoDB + Mongoose          |
| Auth      | JWT + bcryptjs              |
| Drag/Drop | @hello-pangea/dnd           |

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas (free) or local MongoDB

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/devboard.git
cd devboard
```

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Set up environment
```bash
cp .env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret
```

### 4. Run both frontend and backend
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### GitHub commit webhooks

To create tasks automatically from commit messages, set `GITHUB_WEBHOOK_SECRET` in `server/.env` to the webhook secret configured in your GitHub repository. Then add a repository webhook under **Settings > Webhooks** with:

- Payload URL: `https://<your-api-host>/api/v1/github/webhook`
- Content type: `application/json`
- Secret: the same value as `GITHUB_WEBHOOK_SECRET`
- Events: **Just the push event**

Include `#task` or `#todo` in a commit message to create a task; `#urgent` also creates one and marks it high priority. The marker is removed from the task title. Repeated deliveries of the same commit do not create duplicate tasks.

## 🤝 Contributing

We love contributions! This project is beginner-friendly.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

Look for issues labelled `good first issue` to get started!

## 📄 License

MIT — free to use, fork, and build on.

---

Built with ❤️ by the community. Star ⭐ this repo if you find it useful!
************
