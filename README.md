# SSAT Training Website

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/anerky2016s-projects/v0-ssat-training-website)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/etA1IweHpwQ)

## Overview

A comprehensive SSAT (Secondary School Admission Test) training platform designed to help middle school students prepare for standardized admissions testing. The platform offers interactive math tutorials, vocabulary building with AI-powered stories, verbal reasoning exercises, progress tracking, and personalized learning paths.

**Live Site**: [https://midssat.com](https://midssat.com)

## Tech Stack

- **Framework**: Next.js 14.2 (App Router) + React 18 + TypeScript 5
- **Styling**: Tailwind CSS 4 + Shadcn/ui components (Radix UI primitives)
- **Authentication**: Firebase Authentication (email, Google, Apple, Facebook OAuth)
- **Database**: Supabase (user tracking & data storage)
- **AI Services**: OpenAI API (vocabulary stories & tips generation)
- **Text-to-Speech**: Volcengine TTS, Google Cloud TTS
- **Analytics**: Google Analytics
- **Deployment**: Vercel + Docker support
- **Key Libraries**:
  - React Hook Form + Zod (form management & validation)
  - Framer Motion (animations)
  - Recharts (data visualization)
  - React Markdown + KaTeX (content rendering)
  - Lucide React (icons)
  - Sonner (toast notifications)

## Core Features

- **Math Practice**: 30+ interactive topics (fractions, geometry, exponents, equations, decimals, etc.)
- **Vocabulary Building**:
  - AI-generated stories with custom word selection
  - Interactive flashcards with spaced repetition
  - Vocabulary quizzes and sentence completion (3,622+ questions)
  - Word lists by difficulty level (Wordly Wise Levels 3-7, SSAT vocabulary)
  - Text-to-speech audio for all vocabulary words
- **SSAT Test Prep**: Synonyms, analogies, and official test questions
- **Verbal Reasoning**: Exercises, tactics, and practice tests
- **User Features**:
  - Progress tracking dashboard with study history
  - Bookmarks and notes functionality
  - Activity calendar and statistics
  - Email notifications and study reminders
- **Accessibility**: Multi-modal learning (text, audio, visual)

## Repository Structure

```
app/                    # Next.js pages (App Router)
├── math/              # 30+ math topics (fractions, geometry, etc.)
├── vocabulary/        # Flashcards, quizzes, AI stories, word lists
│   ├── flashcards/   # Interactive flashcard deck
│   ├── quiz/         # Vocabulary quiz
│   ├── stories/      # AI-generated stories
│   ├── word-lists/   # Curated vocabulary lists
│   ├── sentence-completion/
│   └── review-session/
├── ssat/              # Test prep (synonyms, analogies)
│   ├── synonyms/
│   ├── analogies/
│   └── generate-synonyms/
├── verbal/            # Verbal reasoning exercises
├── api/               # API routes
│   ├── vocabulary/    # Story & tip generation
│   ├── ssat/         # Synonym generation
│   ├── tts/          # Text-to-speech API
│   ├── notifications/ # Email & push notifications
│   └── cron/         # Scheduled tasks
├── about/
├── contact/
├── progress/          # User progress dashboard
└── [other pages]

components/            # React components (88 files)
├── ui/               # Shadcn/ui library (buttons, cards, dialogs, etc.)
├── ssat/             # Quiz question components
│   ├── SynonymQuestion.tsx
│   ├── AnalogyQuestion.tsx
│   └── WordSelector.tsx
├── auth/             # Authentication components
├── providers/        # React context providers
├── header.tsx
├── footer.tsx
├── hero.tsx
├── notes-dialog.tsx
├── settings-dialog.tsx
├── sign-in-dialog.tsx
└── [other components]

lib/                   # Services & utilities (31 files)
├── firebase.ts       # Firebase client initialization
├── firebase-auth.ts  # Auth service layer
├── firebase-admin.ts # Admin SDK utilities
├── supabase.ts       # Supabase client
├── vocabulary-levels.ts        # Vocabulary data management
├── story-types.ts              # AI story templates
├── story-history.ts            # Story history tracking
├── ssat-progress.ts            # SSAT progress tracking
├── sentence-completion-progress.ts
├── vocabulary-review-schedule.ts
├── vocabulary-memory-tips.ts
├── audio-cache.ts              # TTS audio caching
├── notifications.ts            # Push notification service
├── notes.ts                    # User notes storage
├── bookmark.ts                 # Bookmark functionality
├── study-history.ts            # Study session tracking
├── types/                      # TypeScript interfaces
└── utils/                      # Utility functions

data/                  # JSON datasets (~30+ MB, 72 files)
├── vocabulary-words.json                # 1,000+ SSAT words
├── combined-sentence-completion.json    # 3,622 questions
├── wordly-wise-level-*.json            # Levels 3-7
├── ssat-test8-questions.json           # Official test questions
└── [60+ math exercise files]

scripts/               # Data processing scripts (41 files)
├── transform-combined-data.js
├── combine-chapter-data.js
├── remove-invalid-questions.js
├── enrich-words-*.js
├── generate-synonyms-antonyms-*.js
├── generate-kid-friendly-examples-*.js
├── fetch-cefr-levels.js
└── [other data processing]

contexts/              # React context definitions
public/               # Static assets (images, audio, reference materials)
styles/               # Global CSS
docker/               # Docker configuration
supabase/             # Supabase migrations
docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys and configuration
```

### Environment Variables

Required environment variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI/TTS Services
OPENAI_API_KEY=
VOLCENGINE_TTS_APP_ID=

# Email Notifications
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Scheduled Tasks
CRON_SECRET=

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### Development

```bash
# Start development server (runs on port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Docker Deployment

```bash
# Using included deployment scripts
./deploy-docker.sh
./deploy-remote.sh
```

## Data Content

- **SSAT Vocabulary**: 1,000+ words with pronunciations, definitions, examples
- **Wordly Wise**: Complete curriculum (Levels 3-7)
- **Sentence Completion**: 3,622 cleaned and validated questions
- **Math Exercises**: 30+ topic sets with practice problems
- **Test Questions**: Official SSAT Test 8 questions

## Key Architecture Highlights

### Authentication Flow
1. Firebase Authentication (email, social OAuth)
2. Supabase tracking for login analytics
3. Context-based auth state management

### State Management
- React Context for auth, bookmarks, study history, location sync
- Local storage for client-side persistence
- Supabase for server-side data storage

### AI-Powered Features
- Custom vocabulary story generation with OpenAI
- Memory tips generation for difficult words
- SSAT synonym question generation
- Story templates: Adventure, Fantasy, Mystery, Science Fiction, etc.

### Performance Optimizations
- Image optimization for user-uploaded content
- SWC minification enabled
- Font optimization with Geist fonts
- Audio caching for TTS

## Deployment

This repository automatically syncs with [v0.app](https://v0.app) deployments and is hosted on Vercel.

**Production**: [https://vercel.com/anerky2016s-projects/v0-ssat-training-website](https://vercel.com/anerky2016s-projects/v0-ssat-training-website)

**Build on v0**: [https://v0.app/chat/projects/etA1IweHpwQ](https://v0.app/chat/projects/etA1IweHpwQ)

### How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Contributing

The codebase follows standard Next.js project structure with TypeScript. Key patterns:

- **Components**: Reusable UI components in `components/` directory
- **Services**: Business logic and API integrations in `lib/` directory
- **Pages**: Next.js App Router pages in `app/` directory
- **Data**: Static datasets in `data/` directory as JSON files
- **Scripts**: Data processing and enrichment in `scripts/` directory

## License

All rights reserved.