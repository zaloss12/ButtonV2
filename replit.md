# Button Clicker Game

## Overview

This is a real-time multiplayer button clicker game built with a modern web stack. Players can click a button to increase numbers, with a risk of reset, and purchase upgrades to improve their gameplay. The application supports both web browsers and Telegram Mini App platforms with real-time synchronization across devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints with WebSocket support for real-time features
- **Session Management**: Express sessions with PostgreSQL storage

### Database Strategy
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Turso/LibSQL in production)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Support for both Neon Database and Turso cloud databases

## Key Components

### Game Logic Engine
- **Reset Probability**: Exponential reset chance calculation based on current number
- **Upgrade System**: Purchasable improvements affecting click multipliers, cooldowns, and reset protection
- **Cooldown Management**: Configurable button cooldown periods
- **Special Features**: Rage mode, lucky streak protection, auto-clicker capabilities

### Real-time Synchronization
- **WebSocket Server**: Custom WebSocket implementation for live game state updates
- **Cross-platform Sync**: Game state synchronized between web and Telegram platforms
- **Connection Management**: Automatic reconnection and heartbeat mechanisms

### Platform Integration
- **Telegram Bot**: Integration with Telegram Bot API for Mini App functionality
- **Web App**: Standalone progressive web application
- **Unified Authentication**: Single user system supporting both platforms

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Game Components**: Modular UI with header, stats, main game area, and upgrades modal
- **Visual Feedback**: Button animations, progress indicators, and notification system
- **Dark Theme**: Consistent dark mode styling throughout the application

## Data Flow

1. **User Authentication**: Platform-specific login (Telegram ID or generated web user)
2. **Game State Loading**: Fetch current game state from database via REST API
3. **Real-time Updates**: WebSocket connection established for live synchronization
4. **User Actions**: Button clicks processed server-side with game logic validation
5. **State Persistence**: All game state changes saved to PostgreSQL database
6. **Cross-device Sync**: Changes broadcast to all connected user sessions

## External Dependencies

### Production Services
- **Database**: Turso (LibSQL) or Neon Database (PostgreSQL)
- **Deployment**: Railway or Replit hosting platforms
- **Telegram Integration**: Telegram Bot API for Mini App functionality

### Development Tools
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation

### Third-party Libraries
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Data Fetching**: TanStack Query for efficient server state management
- **Validation**: Zod schemas with Drizzle integration
- **Utilities**: date-fns for date manipulation, clsx for conditional styling

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR support
- **Database**: Local SQLite or cloud database connection
- **Environment Variables**: Configurable database URLs and API tokens

### Production Deployment
- **Build Process**: Optimized Vite build with esbuild backend compilation
- **Static Assets**: Frontend served from Express with production optimizations
- **Database Migrations**: Automated schema deployment with Drizzle Kit
- **Environment Configuration**: Production-specific database and API credentials

### Platform-specific Considerations
- **Telegram Webhooks**: Automated webhook setup for production environments
- **CORS Configuration**: Proper cross-origin settings for web app access
- **SSL Requirements**: HTTPS enforcement for Telegram Mini App compliance