# TAMU Research Tracker - Project Context

> **Purpose:** This document provides comprehensive context about the TAMU Research Tracker application for AI coding assistants (Claude Code, Cursor, etc.) to understand the architecture, data flow, and design philosophy.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Data Flow & Pipeline](#data-flow--pipeline)
4. [Database Schema](#database-schema)
5. [User Flows](#user-flows)
6. [Page Structure](#page-structure)
7. [Design Philosophy](#design-philosophy)
8. [Known Issues & Patterns](#known-issues--patterns)

---

## Project Overview

**TAMU Research Tracker (Aggie Research Finder)** helps Texas A&M undergraduates (primarily freshmen/sophomores) discover, filter, and track research opportunities from Aggie Collaborate.

### The Problem We Solve

Students are overwhelmed by Aggie Collaborate's interface and don't know how to:
- Find opportunities relevant to their major
- Track applications across multiple stages
- Log progress once they land a position
- Stay organized throughout the research search process

### Our Solution

A streamlined interface that:
1. **Filters opportunities** by major and eligibility automatically
2. **Provides AI summaries** using Groq LLM to highlight key info
3. **Tracks applications** through a visual pipeline (Saved → Contacted → Responded → Interview → Accepted/Rejected)
4. **Enables weekly logging** once students land research positions
5. **Generates reports** (PDF exports, email templates for PIs)

### Target Users

- **Primary:** Freshmen and sophomores new to research
- **Secondary:** Juniors and seniors looking for new positions
- **User persona:** Overwhelmed by Aggie Collaborate, needs guidance, wants to stay organized

---

## Architecture & Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Animations:** Framer Motion
- **Forms:** react-hook-form with zod validation
- **State Management:** 
  - React Query (server state)
  - Zustand (client state)

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes (`app/api/*`)
- **Database:** PostgreSQL (via Railway/Vercel Postgres)
- **ORM:** Prisma
- **Authentication:** NextAuth.js with Google OAuth

### AI Features
- **LLM Provider:** Groq API (fast, free Llama models)
- **Use Cases:**
  - Summarize opportunity descriptions
  - Match opportunities to student resumes
  - Generate email templates

### Deployment
- **Hosting:** Vercel
- **Database:** Railway or Vercel Postgres
- **Environment Variables:** See `.env.example`

---

## Data Flow & Pipeline

### 1. Data Ingestion (Aggie Collaborate → Our Database)

```
Aggie Collaborate (Texas A&M Official Platform)
    ↓
Web Scraper / API Integration (runs periodically)
    ↓
Parse & Transform Data
    ↓
Store in Opportunities Table (PostgreSQL via Prisma)
    ↓
Available on /opportunities page
```

**Key Points:**
- We **pull** data from Aggie Collaborate (we don't host it originally)
- Data is **continuously synced** (scraper/integration runs on schedule)
- We store: title, department, PI name/email, description, eligibility, tags
- Opportunities are **read-only** from our perspective (we don't modify Aggie Collaborate)

### 2. User Journey (Discovery → Tracking)

```
1. DISCOVER
   Student visits /opportunities
   Sees filtered opportunities (by major)
   Uses search + filters to narrow down
   Reads AI summaries

2. SAVE
   Student clicks "Save" on interesting opportunities
   Opportunity added to Pipeline (SAVED stage)

3. APPLY
   Student contacts PI (email templates available)
   Moves to CONTACTED stage in Pipeline
   Tracks responses (RESPONDED, INTERVIEW stages)

4. ACCEPT
   Student gets accepted
   Clicks "Start Tracking" in acceptance modal
   Position becomes "Active Research"

5. LOG PROGRESS
   Student visits /research page
   Logs weekly: accomplishments, learnings, next steps
   Tracks hours worked
   Auto-save as they type

6. REPORT
   Student exports PDFs for advisors
   Uses email templates to update PI
   Reviews previous weeks in accordion
```

### 3. Data Relationships

```
User (authenticated via Google)
  ↓
  ├─ UserPositions (saved/tracked opportunities)
  │    ↓
  │    ├─ applicationStage (SAVED, CONTACTED, RESPONDED, INTERVIEW, ACCEPTED, REJECTED, WITHDRAWN)
  │    ├─ isResearchActive (boolean - true when accepted and tracking)
  │    └─ JournalEntries (weekly logs, linked by positionId)
  │
  └─ Settings (major, interests, onboarding status)

Opportunities (from Aggie Collaborate)
  ↓
  Can be linked to UserPositions (optional - for tracking original posting)
```

---

## Database Schema

### Core Models

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  major         String?   // Set during onboarding
  interests     String[]  // Research interests
  
  // Relations
  positions     UserPosition[]
  journalEntries JournalEntry[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Opportunity {
  id            String    @id @default(cuid())
  
  // From Aggie Collaborate
  title         String
  department    String
  piName        String?
  piEmail       String?
  description   String    @db.Text
  eligibility   String[]  // ["Freshman", "Sophomore", "All"]
  tags          String[]  // ["Machine Learning", "Lab Work"]
  isPaid        Boolean   @default(false)
  postedDate    DateTime?
  
  // AI-generated
  aiSummary     String?   @db.Text
  
  // Metadata
  sourceUrl     String?   // Link back to Aggie Collaborate
  scrapedAt     DateTime  @default(now())
  
  // Relations
  userPositions UserPosition[]
  
  @@index([department])
  @@index([scrapedAt])
}

model UserPosition {
  id                String            @id @default(cuid())
  userId            String
  opportunityId     String?           // Optional link to original opportunity
  
  // Application tracking
  applicationStage  ApplicationStage  @default(SAVED)
  
  // Research tracking (active research only)
  isResearchActive  Boolean           @default(false)
  researchStartDate DateTime?
  
  // Position details (copied from Opportunity or manually entered)
  title             String
  department        String?
  piName            String?
  piEmail           String?
  description       String?           @db.Text
  notes             String?           @db.Text
  
  // Timestamps
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  opportunity       Opportunity?      @relation(fields: [opportunityId], references: [id], onDelete: SetNull)
  journalEntries    JournalEntry[]
  
  @@index([userId])
  @@index([userId, applicationStage])
  @@index([userId, isResearchActive])
}

model JournalEntry {
  id              String       @id @default(cuid())
  userId          String
  positionId      String
  weekStart       DateTime     // Sunday at 00:00:00 (US week convention)
  
  // Entry fields
  accomplishments String?      @db.Text
  learnings       String?      @db.Text
  nextSteps       String?      @db.Text
  meetingNotes    String?      @db.Text
  hoursWorked     Float?
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  // Relations
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  position        UserPosition @relation(fields: [positionId], references: [id], onDelete: Cascade)
  
  @@unique([userId, positionId, weekStart])
  @@index([userId])
  @@index([positionId])
  @@index([weekStart])
}

enum ApplicationStage {
  SAVED
  CONTACTED
  RESPONDED
  INTERVIEW
  ACCEPTED
  REJECTED
  WITHDRAWN
}
```

### Important Schema Notes

1. **Week Calculation:**
   - Weeks start on **Sunday** (US convention)
   - Use `startOfWeek(date, { weekStartsOn: 0 })` from date-fns
   - Store as Sunday at 00:00:00 in `weekStart` field

2. **UserPosition vs Opportunity:**
   - `Opportunity` = read-only data from Aggie Collaborate
   - `UserPosition` = student's saved/tracked position (may or may not link to an Opportunity)
   - Students can manually add positions not from Aggie Collaborate

3. **Research Tracking:**
   - Position becomes "active research" when `isResearchActive = true`
   - Set when user clicks "Start Tracking" after accepting
   - Active research positions appear on `/research` page

---

## User Flows

### Flow 1: First-Time User Onboarding

1. User signs in with Google OAuth
2. Redirect to onboarding flow
3. Collect: major, research interests (optional)
4. Save to User record
5. Redirect to `/opportunities` with major pre-filtered

### Flow 2: Discovering Opportunities

1. User visits `/opportunities`
2. Sees opportunities filtered by their major (from onboarding)
3. Can adjust filters: major, eligibility, paid/unpaid
4. Can search by keywords
5. Clicks opportunity card → side panel opens with full details + AI summary
6. Clicks "Save" → adds to Pipeline (SAVED stage)

### Flow 3: Tracking Applications

1. User visits `/applications` (Pipeline page)
2. Sees 4 columns: SAVED, CONTACTED, RESPONDED, INTERVIEW
3. Drag-and-drop cards between stages
4. Click card → side panel with notes, email templates, stage actions
5. Move to final stage:
   - ACCEPTED → "Start Tracking" modal appears
   - REJECTED → move to Outcomes section (no tracking)
   - WITHDRAWN → move to Outcomes section

### Flow 4: Starting Research Tracking

1. User moves position to ACCEPTED in Pipeline
2. Modal appears: "Congratulations! Start tracking your research?"
3. Two options:
   - "Just Mark Accepted" → stays in Accepted, no tracking
   - "Start Tracking →" → enables research tracking
4. If "Start Tracking":
   - Set `isResearchActive = true`
   - Set `researchStartDate = now`
   - Position appears on `/research` page
5. Redirect to `/research` page

### Flow 5: Weekly Logging

1. User visits `/research` page
2. Sees list of active research positions
3. Clicks "Log This Week" on a position
4. Taken to `/research/{positionId}/log` page
5. Fills in weekly log:
   - Hours this week
   - What did you accomplish?
   - What did you learn?
   - Next steps
   - Meeting notes (optional)
6. Auto-saves as they type (debounced 500ms)
7. Shows "✓ All changes saved" indicator
8. Previous weeks shown in collapsed accordion (read-only)

### Flow 6: Exporting Reports

1. From `/research` page, click "Export PDF" on a position
2. Generates PDF with all weekly logs
3. Downloads to user's device
4. OR clicks "Email PI" → pre-filled template with weekly summary

---

## Page Structure

### `/` - Landing Page
- **Purpose:** Convert visitors to sign-ups
- **Key sections:**
  - Hero with animated gradient background + cycling opportunity cards
  - Interactive before/after comparison (Aggie Collaborate vs our app)
  - Feature tabs with live demos
  - Animated stats counter
  - Major selector CTA
- **Design:** Modern, flashy, simplistic

### `/opportunities` - Find Research
- **Purpose:** Browse and discover opportunities
- **Layout:** Split-view (filters sidebar + opportunity grid + detail panel)
- **Features:**
  - Search bar (debounced 300ms)
  - Filter sidebar (major, eligibility, paid/unpaid)
  - Opportunity cards (title, department, tags, AI summary preview)
  - Click card → side panel with full details
  - "Save" button adds to Pipeline
- **Empty state:** "No opportunities found. Try adjusting your filters."

### `/applications` - Pipeline (My Applications)
- **Purpose:** Track application progress
- **Layout:** 4-column kanban board
- **Columns:**
  1. SAVED (0) - Bookmarked opportunities
  2. CONTACTED (0) - Sent initial email
  3. RESPONDED (1) - PI responded
  4. INTERVIEW (0) - Scheduled interview
- **Below columns:** OUTCOMES section
  - Accepted (1)
  - Rejected (1)
  - Withdrawn (0)
- **Features:**
  - Drag-and-drop between stages
  - Click card → side panel (notes, stage selector, email templates)
  - "+ Add Opportunity" button (manual entry)
- **Empty states:** Minimal (just icon + message + "Find Research →" link in SAVED only)

### `/research` - My Research (Journal)
- **Purpose:** Log weekly progress for active research
- **Layout:** List of active research positions
- **Each position shows:**
  - Title, PI name, start date
  - Hours logged, weeks tracked
  - "Log This Week" button
  - "Export PDF" and "Email PI" buttons
  - "Archive" button
- **Empty state:** "No active research yet. Once you accept a position, track your progress here."

### `/research/{positionId}/log` - Weekly Log Entry
- **Purpose:** Log current week's progress
- **Layout:**
  - Back button to position
  - Week header: "Week of Feb 9-15, 2026" + "Week 1"
  - Form fields (all auto-save):
    - Hours this week (number input)
    - What did you accomplish? (bulleted textarea)
    - What did you learn? (bulleted textarea)
    - Next steps (bulleted textarea)
    - Meeting notes (optional textarea)
  - Auto-save indicator: "✓ All changes saved" or "Saving..."
  - One-line stats: "34 hours • Week 1"
  - Previous weeks accordion (collapsed, read-only)

### `/auth` - Sign In
- **Purpose:** Authentication
- **Layout:** Split-screen
  - Left: Abstract network logo animation
  - Right: Sign in form (Google SSO button + guest mode)
- **Redirect:** First-time users → onboarding, returning → `/opportunities`

---

## Design Philosophy

### Core Principles

1. **Modern flashy + simplistic**
   - Attractive but not overwhelming
   - Refined minimalism with moments of wow
   - Strategic motion, not constant distraction

2. **Trust users to understand**
   - Don't over-explain with cluttered text
   - Remove unnecessary instructional copy
   - Keep it concise

3. **Show, don't tell**
   - Interactive demos over descriptions
   - Live previews instead of static images
   - Feature tabs with real functionality

4. **Professional tone**
   - No emojis in UI labels (use in celebration modals only)
   - No cutesy language
   - Academic/professional context

5. **Student-focused UX**
   - Fast loading times
   - Mobile-friendly first
   - Respects their time
   - Clear, actionable CTAs

6. **Encouraging but realistic**
   - "Most students apply to 5-10 positions" messaging
   - Set proper expectations
   - Supportive without being patronizing

### Visual Design

**Colors:**
- Primary: Texas A&M Maroon (`#500000`)
- Hover: Darker Maroon (`#600000`)
- Accent: Orange/Gold (`#CC5500`)
- Background: White with subtle gradients
- Text: `gray-900` (headings), `gray-700` (body), `gray-600` (secondary)

**Typography:**
- Headings: Bold, large (48-60px for hero)
- Body: 16-18px, comfortable line height
- UI text: 14px
- Small text: 12-13px

**Spacing:**
- Generous whitespace
- Consistent padding (16px, 24px, 32px scale)
- Clear visual hierarchy

**Animations:**
- Subtle, purposeful motion
- 200-400ms transitions
- Ease-in-out timing
- GPU-accelerated (transforms, opacity)

---

## Known Issues & Patterns

### Auto-Save Pattern

**Always use debounced auto-save (500ms) with proper state management:**

```typescript
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

const debouncedSave = useDebouncedCallback(
  async (data) => {
    setSaveStatus('saving');
    try {
      await fetch('/api/endpoint', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
    }
  },
  500
);

// In component
<textarea 
  value={value} 
  onChange={(e) => {
    setValue(e.target.value);
    debouncedSave({ field: e.target.value });
  }} 
/>
```

### Week Calculation (CRITICAL)

**Always use Sunday as week start:**

```typescript
import { startOfWeek, endOfWeek, format } from 'date-fns';

const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // 0 = Sunday
const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

const weekLabel = `Week of ${format(weekStart, 'MMM d')}-${format(weekEnd, 'd, yyyy')}`;
// Output: "Week of Feb 9-15, 2026"
```

### Common Pitfalls

1. **❌ Don't use blocking modals** for confirmations
   - ✅ Use inline confirmations or slide-down banners

2. **❌ Don't add emojis to form labels**
   - ✅ Use emojis only in celebration modals

3. **❌ Don't show "Save" buttons**
   - ✅ Use auto-save with status indicator

4. **❌ Don't start weeks on Monday**
   - ✅ Always use Sunday (US convention)

5. **❌ Don't forget authentication checks in API routes**
   - ✅ Always verify user session and ownership

6. **❌ Don't use getDay() for week calculations**
   - ✅ Use date-fns startOfWeek with weekStartsOn: 0

### Error Handling Pattern

**Always show specific errors, never generic:**

```typescript
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Operation failed');
  }
} catch (error) {
  setError(error instanceof Error ? error.message : 'Unknown error');
  // Show specific error to user, not "Something went wrong"
}
```

---

## Environment Variables

Required in `.env`:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="random-secret-string"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Groq API (for AI features)
GROQ_API_KEY="..."

# Optional: Aggie Collaborate scraper
AGGIE_COLLABORATE_API_KEY="..." # If they provide an API
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Prisma commands
npx prisma generate          # Generate Prisma Client
npx prisma migrate dev       # Create and apply migration
npx prisma migrate status    # Check migration status
npx prisma studio            # Open database GUI
npx prisma db push           # Push schema changes (dev only)

# Build for production
npm run build

# Run production server
npm start
```

---

## Testing Checklist

When fixing bugs or adding features, always test:

### Authentication Flow:
- [ ] Sign in with Google works
- [ ] Sign out works
- [ ] Protected routes redirect to /auth
- [ ] Session persists on refresh

### Opportunities Page:
- [ ] Opportunities load and display
- [ ] Filters populate with actual data
- [ ] Filtering works (major, eligibility)
- [ ] Search works (debounced)
- [ ] Clicking card opens side panel
- [ ] "Save" button adds to Pipeline

### Pipeline Page:
- [ ] All columns show correct counts
- [ ] Drag-and-drop works
- [ ] Clicking card opens side panel
- [ ] Stage selector works
- [ ] Moving to Accepted triggers modal
- [ ] "Start Tracking" button works

### Research Page:
- [ ] Shows active research positions
- [ ] "Log This Week" opens log entry page
- [ ] Export PDF works
- [ ] Email PI template works
- [ ] Archive button works

### Journal Entry:
- [ ] Week calculation correct (Sunday start)
- [ ] Auto-save works (500ms debounce)
- [ ] "✓ All changes saved" indicator appears
- [ ] Previous weeks accordion works
- [ ] Data persists on refresh

---

## Need Help?

When working on this codebase:

1. **Read this context doc first** - It answers most questions
2. **Check Prisma schema** - Source of truth for data structure
3. **Look at existing patterns** - Follow established conventions
4. **Test thoroughly** - Use the testing checklist above
5. **Ask specific questions** - Reference line numbers and file paths

**Key files to know:**
- `prisma/schema.prisma` - Database schema
- `app/api/*` - API routes
- `app/(pages)/*` - Page components
- `components/*` - Reusable components
- `lib/utils/*` - Helper functions

---

Last updated: February 2026
