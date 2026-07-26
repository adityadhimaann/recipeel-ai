# ReciPeel

AI-powered recipe import, dietary safety & smart meal planning.

## Tech Stack

- **Framework**: Next.js 15 App Router (React 19)
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: Better Auth (Email & Password authentication)
- **Styling**: Tailwind CSS v4, Lucide Icons, Sonner Toasts

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and provide your configuration:
   ```bash
   cp .env.example .env
   ```

3. Run database migrations:
   ```bash
   npm run db:push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.
