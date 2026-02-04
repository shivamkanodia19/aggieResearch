# TAMU Research Application Tracker

A web application to help Texas A&M University students discover, track, and manage their research opportunity applications.

## Features

- **Research Opportunities Database**: Browse and search research positions from Aggie Collaborate
- **Application Tracking Pipeline**: Track applications through stages (Saved → First Email → Responded → Interview → Accepted/Rejected)
- **User Authentication**: Secure signup/login restricted to @tamu.edu emails
- **Notes & Timeline**: Keep notes and view timeline of application activities

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State Management**: TanStack Query (React Query)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tamu-research-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Run the SQL migration file in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor
   - Configure auth settings: enable email/password authentication
   - Get your project URL and anon key from Settings > API

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/app
  /(auth)          # Auth pages (login, signup)
  /(dashboard)     # Protected dashboard routes
    /opportunities # Browse research opportunities
    /pipeline      # Application tracking pipeline
    /settings      # User settings
  /applications    # Application detail pages
  /api             # API routes
/components        # React components
/lib
  /supabase        # Supabase client setup
  /scraper         # Aggie Collaborate scraper
  /types           # TypeScript types
/supabase
  /migrations      # Database migrations
```

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

Key tables:
- `profiles` - User profiles (extends Supabase auth.users)
- `opportunities` - Research opportunities from Aggie Collaborate
- `applications` - User-tracked applications
- `application_events` - Timeline events for applications

## Development

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test locally
4. Commit and push: `git push origin feature/your-feature`
5. Create pull request

### Scraper Implementation

The scraper in `lib/scraper/syncAggieCollaborate.ts` is currently a placeholder. To implement:

1. Use a library like `cheerio` or `puppeteer` for HTML parsing
2. Fetch and parse https://aggiecollaborate.tamu.edu/projects/
3. Extract opportunity details
4. Handle pagination and rate limiting
5. Update the sync function to upsert opportunities

### Deploying

1. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

2. **Set up cron job for scraper**
   - Use Vercel Cron or Supabase Edge Functions
   - Schedule daily sync at 2am CT

## License

MIT

## Contributing

This is a student project. Contributions welcome!
