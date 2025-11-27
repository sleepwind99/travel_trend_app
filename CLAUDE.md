# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application that provides AI-powered travel recommendations using Anthropic's Claude AI. The app is a Korean-language travel planner ("AI 여행 플래너") that analyzes user transaction history and demographics to suggest personalized destinations.

## Technology Stack

- **Framework**: Next.js 15.5.5 (App Router)
- **React**: 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **AI Integration**: Anthropic Claude (Claude Sonnet 4.5)
- **Search Engine**: Serper API (Google Search & Images)
- **Build Tool**: Turbopack
- **Data Storage**: JSON files (development)

## Development Commands

```bash
# Development server with Turbopack and Hot Reload
yarn dev

# Build for production with Turbopack
yarn build

# Start production server
yarn start

# Lint codebase
yarn lint
```

The dev server runs on http://localhost:3000

## Architecture

### Component Structure (Modular Architecture)

The application follows a modular component architecture:

#### Type Definitions (`src/types/`)
- `index.ts` - Common types shared across components
  - `Recommendation`, `PartialRecommendation`
  - `Transaction`, `UserData`, `NewUser`

#### Presentation Components (`src/components/`)
- `Header.tsx` - App header with logo
- `Footer.tsx` - App footer
- `SearchForm.tsx` - Search form with destination, user selection, and action buttons
- `RecommendationCard.tsx` - Individual recommendation card with all details
- `RecommendationsGrid.tsx` - Grid layout with infinite scroll and loading states
- `UserInfoModal.tsx` - Modal for viewing/editing user information and transactions
- `AddUserModal.tsx` - Modal for adding new users

#### Container Component (`src/app/page.tsx`)
- Main page with business logic
- State management for recommendations, users, and modals
- API calls and streaming handlers
- Reduced from 1200+ lines to ~450 lines

### Data Flow

1. User selects/manages users via `SearchForm` component
2. User can view/edit user info through `UserInfoModal`
3. User can add new users through `AddUserModal`
4. User submits search form with destination and user ID
5. Request sent to `/api/recommend` with user transaction history
6. **Server Search**: Serper API performs 2 parallel Google searches:
   - Latest travel trends and popular places
   - Hidden gems and local restaurants
7. API constructs prompt for Claude AI including:
   - User transaction history analysis
   - Search results
   - User demographics
8. Claude Sonnet 4.5 analyzes data and streams recommendations
9. Each recommendation includes: `title`, `location`, `description`, `activities`, `priceRange`, `bestTime`, `imageUrl`, `link`
10. Google Images are fetched via Serper API for accurate visuals
11. Results displayed in `RecommendationsGrid` with infinite scroll

### API Structure

#### User Management APIs (`src/app/api/users/`)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user with auto-generated ID (user_XXX)
- `GET /api/users/[userId]` - Get specific user details
- `PUT /api/users/[userId]` - Update user information and transactions
- `DELETE /api/users/[userId]` - Delete user

Data stored in `/data/users.json` (development environment)

#### Recommendation API (`src/app/api/recommend/route.ts`)
- Reads user data including transaction history
- Performs real-time web search via Serper API
- Analyzes user spending patterns
- Streams recommendations using Server-Sent Events
- Fetches images from Google Images via Serper API

### AI Integration Details

#### Serper API Integration
- API: Serper API (Google Search & Images)
- Purpose: Real-time web search and accurate image retrieval
- Search queries: 2 parallel searches per request
  - Latest hotspots and trending destinations
  - Hidden gems and local restaurants
- Image search: Google Images for destination-specific visuals
- Requires `SERPER_API_KEY` environment variable
- Pricing: $50 free credit, $1/1,000 queries

#### Claude AI Integration
- Model: `claude-sonnet-4-5-20250929` (Claude Sonnet 4.5)
- Purpose: Analyzes transaction history and search results to generate personalized recommendations
- Response format: Streaming JSON via Server-Sent Events
- Requires `CLAUDE_API_KEY` environment variable
- Generation config: max_tokens=6144, temperature=0.8
- Workflow:
  1. Receives user transaction history
  2. Receives real-time search context from Serper
  3. Analyzes spending patterns (categories, amounts, preferences)
  4. Generates personalized recommendations based on user profile
  5. Streams results in real-time for better UX

### TypeScript Configuration

- Path alias: `@/*` maps to `./src/*`
- Target: ES2017
- Strict mode enabled
- Module resolution: bundler

## Environment Variables

Required in `.env.local`:
- `CLAUDE_API_KEY` - Anthropic Claude API key (required)
- `SERPER_API_KEY` - Serper API key for Google Search & Images (required)
- `PEXELS_API_KEY` - Pexels image API key (optional, for image fallback)
- `PIXABAY_API_KEY` - Pixabay image API key (optional, for image fallback)

### Getting API Keys

1. **Claude API** (필수): Visit https://console.anthropic.com/ and create an API key
2. **Serper API** (필수): Visit https://serper.dev/ and sign up ($50 free credit, 50,000 queries)
3. **Pexels** (optional): Visit https://www.pexels.com/api/
4. **Pixabay** (optional): Visit https://pixabay.com/api/docs/

## UI/UX Features

### User Management
- User list dropdown with profile information (name, gender, age)
- Blue button to view/edit user info and transactions
- Green button to add new users
- Red button in modal to delete users
- Transaction management: add, edit, delete individual transactions
- All changes persist to `/data/users.json`

### Search Experience
- All user-facing text is in Korean
- Form includes:
  - Destination text input (예: 파리, 일본, 뉴욕)
  - User selection dropdown
  - User management buttons (info, add)
- Loading states with spinner animation
- Error handling with user-friendly Korean messages

### Recommendations Display
- Streaming updates for real-time feedback
- Skeleton UI during loading
- Clickable cards with:
  - Google Image-based visuals
  - Detailed descriptions
  - Activity suggestions
  - Price estimates
  - Best visiting times
  - Google search links
- Infinite scroll (up to 21 recommendations)
- Responsive grid layout (1/2/3 columns)

### Modals
- User Info Modal:
  - Edit name, gender, age
  - View and manage transaction history
  - Add/delete transactions
  - Save changes
  - Delete user
- Add User Modal:
  - Enter name, gender, age
  - Auto-generated user ID
  - Empty transaction history by default

## Development Notes

### Component Best Practices
- Keep components focused and single-purpose
- Use TypeScript interfaces from `/src/types`
- Props should be explicitly typed
- Avoid business logic in presentation components
- Use callback props for event handling

### State Management
- Container component (`page.tsx`) manages all state
- Pass state and handlers down as props
- Use `useCallback` for handlers to prevent re-renders
- Keep modal state separate and controlled

### API Development
- Use Next.js API Routes for backend logic
- File-based routing in `/src/app/api`
- Return proper HTTP status codes
- Handle errors gracefully with Korean messages
- Use try-catch blocks for all file operations

### File Operations
- Users stored in `/data/users.json`
- Read with `fs.readFileSync`
- Write with `fs.writeFileSync` with pretty-print (indent: 2)
- Always validate JSON before parsing
- Handle file not found errors

---

IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
