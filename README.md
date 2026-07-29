# Portfolio Hub

Portfolio Hub is a unified full-stack web application built with **Next.js 15 (App Router)** and **Turso LibSQL Database** (`@libsql/client`).

## Architecture Overview

```mermaid
graph LR
    Browser([User's Browser]) -->|HTTP / API Requests| NextJS[Next.js App Router API Routes]
    NextJS -->|@libsql/client| Turso[(Turso / Local SQLite DB)]
```

- **Frontend & Backend**: Next.js App Router (React 19, TypeScript, Tailwind CSS, NextAuth).
- **Database**: Turso DB (LibSQL) with automatic local SQLite (`file:local.db`) fallback when cloud credentials are not supplied.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Demo Account
- **Username**: `student`
- **Password**: `password123`
