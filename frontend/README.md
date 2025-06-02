# Tape Head Frontend

A Next.js frontend application for the Tape Head project.

## Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env.local` file in the root directory with the following content:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- The project uses TypeScript for type safety
- Tailwind CSS for styling
- ESLint and Prettier for code quality
- shadcn/ui for UI components

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Project Structure

- `/app` - Next.js app directory (pages and layouts)
- `/components` - Reusable UI components
- `/lib` - Utility functions and API helpers 