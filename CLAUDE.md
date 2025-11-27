# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application that provides AI-powered travel recommendations using Anthropic's Claude AI. The app is a Korean-language travel planner ("AI 여행 플래너") that suggests user-friendly destinations based on user demographics (destination, gender, age).

## Technology Stack

- **Framework**: Next.js 15.5.5 (App Router)
- **React**: 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **AI Integration**: Anthropic Claude (Claude 3.5 Haiku)
- **Build Tool**: Turbopack

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Lint codebase
npm run lint
```

The dev server runs on http://localhost:3000

## Architecture

### App Structure

The application uses Next.js App Router with the following structure:

- `src/app/layout.tsx` - Root layout with Geist font configuration
- `src/app/page.tsx` - Main client component with travel recommendation form
- `src/app/api/recommend/route.ts` - API route handler for Gemini AI integration
- `src/app/globals.css` - Global Tailwind styles

### Data Flow

1. User submits form from `page.tsx` (client component) with destination, gender, and age
2. Request is sent to `/api/recommend` endpoint
3. **Real-time web search**: Tavily AI searches for latest travel trends, SNS hotspots, and hidden gems
4. API route constructs a system and user prompt in Korean for Claude AI, including search results
5. Claude Sonnet 4.5 analyzes search results and returns structured JSON with 6 personalized travel recommendations
6. Each recommendation includes: `title`, `location`, `description`, `activities`, `priceRange`, `bestTime`, `imageUrl`, `link`
7. Results are displayed as clickable cards on the frontend

### AI Integration Details

The application combines **real-time web search** with **AI reasoning** for accurate, up-to-date recommendations:

#### Tavily AI Search Integration
- API: Tavily AI (`@tavily/core`)
- Purpose: Real-time web search for latest travel trends and SNS hotspots
- Search queries: 3 parallel searches per request
  - Latest hotspots and Instagram-popular places
  - Age/gender-specific trending destinations
  - Hidden gems and local restaurants
- Search depth: Advanced mode with max 5 results per query
- Requires `TAVILY_API_KEY` environment variable
- Free tier: 1,000 searches/month

#### Claude AI Integration
- Model: `claude-sonnet-4-5-20250929` (Claude Sonnet 4.5 - world's best coding model)
- Purpose: Analyzes search results and generates personalized recommendations
- Response format: JSON (parsed from text response)
- Requires `CLAUDE_API_KEY` environment variable
- Generation config: max_tokens=6144, temperature=0.8
- Workflow:
  1. Receives real-time search context from Tavily
  2. Analyzes search results for accuracy and relevance
  3. Generates 6 structured recommendations with detailed information
  4. Focuses on safety, accessibility, and age/gender-appropriate suggestions

### TypeScript Configuration

- Path alias: `@/*` maps to `./src/*`
- Target: ES2017
- Strict mode enabled
- Module resolution: bundler

## Environment Variables

Required in `.env.local`:
- `CLAUDE_API_KEY` - Anthropic Claude API key (required)
- `TAVILY_API_KEY` - Tavily AI Search API key (required for real-time search)
- `PEXELS_API_KEY` - Pexels image API key (optional, for image fallback)
- `PIXABAY_API_KEY` - Pixabay image API key (optional, for image fallback)

### Getting API Keys

1. **Claude API** (필수): Visit https://console.anthropic.com/ and create an API key
2. **Serper API** (권장): Visit https://serper.dev/ and sign up ($50 free credit, 50,000 queries)
3. **Tavily AI** (대체): Visit https://tavily.com/ and sign up for free (1,000 searches/month)
4. **Pexels** (optional): Visit https://www.pexels.com/api/
5. **Pixabay** (optional): Visit https://pixabay.com/api/docs/

### Search Mode Configuration

The app supports two search modes via `SEARCH_MODE` environment variable:

#### Mode 1: Server Search (Default, Recommended) ⭐
```bash
SEARCH_MODE="server"
```
- ✅ **Fast**: ~20-25 seconds total
- ✅ **Simple**: Server searches → Results to Claude
- ✅ **Predictable**: Fixed search cost
- ✅ **Cheap**: $1/1,000 queries with Serper

**How it works:**
1. Server makes 2 parallel Serper API calls
2. Search results added to Claude prompt
3. Claude generates recommendations

#### Mode 2: Claude Tool Use (Flexible) 🔧
```bash
SEARCH_MODE="claude_tools"
```
- ✅ **Flexible**: Claude decides when/what to search
- ✅ **Smart**: Claude optimizes search queries
- ✅ **Adaptive**: Can search multiple times if needed
- ⚠️ **Slower**: ~40-50 seconds total (multiple API rounds)
- ⚠️ **Variable cost**: Claude API calls increase 2-3x

**How it works:**
1. Claude receives search tool
2. Claude decides to search (or not)
3. Claude calls Serper via tool
4. Claude analyzes results
5. Claude may search again if needed
6. Claude generates recommendations

## UI/UX Notes

- All user-facing text is in Korean
- Form includes destination (text input), gender select (남성/여성/기타), and age range select (10대 through 50s+)
- Loading states with spinner animation
- Error handling with user-friendly Korean messages
- Recommendations displayed as clickable cards with external links
