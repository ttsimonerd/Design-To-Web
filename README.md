# Rest Express

A full-stack web application built with Express, React, and PostgreSQL.

## One-Command Install

```bash
bash install.sh
```

That's it. The installer will:
- Check your Node.js version
- Install all dependencies
- Create your `.env` file
- Set up the database

Then start the app with:

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Manual Installation

If you prefer to install step by step:

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
Create a `.env` file in the project root:
```
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
```

### 3. Set up the database
```bash
npm run db:push
```

### 4. Start the app
```bash
npm run dev
```

---

## Requirements

- Node.js v18 or later — [nodejs.org](https://nodejs.org)
- A PostgreSQL database

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
