# Rest Express Application

A modern full-stack application built with Express, React, and Drizzle ORM.

## Features

- **Frontend**: React with Vite, Tailwind CSS, and Radix UI components.
- **Backend**: Express.js server.
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: Passport.js for local authentication.
- **AI Integration**: Built-in AI service capabilities.

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL database

## Easy Installation

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd <project-directory>
npm install
```

### 2. Configure Environment
Create a `.env` file or set the following environment variables:
- `DATABASE_URL`: Your PostgreSQL connection string.

### 3. Initialize Database
```bash
npm run db:push
```

### 4. Run Application
```bash
# For development
npm run dev

# For production
npm run build
npm run start
```

The application will be available at `http://localhost:5000`.

## Scripts

- `npm run dev`: Starts the development server with hot reload.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run check`: Runs TypeScript type checking.
- `npm run db:push`: Syncs the Drizzle schema with the database.

## Tech Stack

- **Framework**: Express.js
- **Frontend**: React, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form, Zod
