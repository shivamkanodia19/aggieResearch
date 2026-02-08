# Database migrations

Apply these migrations to your Supabase project so all features work (e.g. research tracking / “Start Tracking”).

## Option 1: Supabase Dashboard (recommended for production)

1. Open your project at [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Run each migration file in order (by number). For **research tracking** (“Start Tracking” from the pipeline), run:
   - **`migrations/007_research_journal.sql`** — creates `research_positions` and `weekly_logs` and RLS.

Copy the contents of `007_research_journal.sql` into the SQL Editor and run it.

## Option 2: Supabase CLI

From the project root:

```bash
npx supabase link   # if not already linked
npx supabase db push
```

Or run a single migration via the CLI if your setup supports it.

## After running 007

- The error “Could not find the table 'public.research_positions' in the schema cache” will stop.
- “Start Tracking” in the Congratulations modal will create a research position and redirect to the research page.
