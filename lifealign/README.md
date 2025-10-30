# LifeAlign Task Manager MVP

A task manager that helps users connect daily work to long-term strategy.

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM**
- **PostgreSQL**
- **NextAuth.js**

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lifealign
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials and secrets.

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
lifealign/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages (login, register)
│   └── (dashboard)/       # Protected dashboard pages
├── components/            # React components
│   ├── tasks/            # Task-related components
│   ├── objectives/       # Objective-related components
│   ├── layout/           # Layout components
│   ├── ui/               # Reusable UI components
│   └── shared/           # Shared components
├── lib/                  # Utility functions
├── prisma/               # Database schema
├── styles/               # Global styles
└── types/                # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Features

- Task management with CRUD operations
- Objectives with progress tracking
- Multiple views (Today, All Tasks, Objectives, Inbox)
- Mobile-first responsive design
- Authentication with NextAuth.js
- RESTful API

## License

Private project - All rights reserved
