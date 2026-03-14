# Rest Express

A full-stack web application built with Express, React, and PostgreSQL.

## Requirements

Before you start, make sure you have:

- **Node.js v18 or later** — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)
- **A PostgreSQL database**

---

## Quick Start (Recommended)

### 1. Clone the repository
```bash
git clone https://github.com/ttsimonerd/Design-To-Web.git
cd Design-To-Web
```

### 2. Run the installer
```bash
bash install.sh
```

The installer will:
- Check your Node.js version
- Install all dependencies
- Ask for your database URL and create the `.env` file
- Set up the database automatically

### 3. Start the app
```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Manual Installation

If you prefer to do it step by step:

### 1. Clone the repository
```bash
git clone https://github.com/ttsimonerd/Design-To-Web.git
cd Design-To-Web
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment
Create a `.env` file in the project root:
```
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
```

### 4. Set up the database
```bash
npm run db:push
```

### 5. Start the app
```bash
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Sync database schema |

---

## Tech Stack

- **Backend**: Express.js
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: PostgreSQL + Drizzle ORM
- **State**: TanStack Query
- **Forms**: React Hook Form + Zod
