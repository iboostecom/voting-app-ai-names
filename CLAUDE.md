# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based voting application for selecting AI service names with real-time collaboration features. The app allows users to vote on predefined names across different categories, submit their own suggestions, and see live activity from other users.

## Architecture

The project contains two versions:
- **v2.0.0 (Current)**: Real-time collaborative version using Firebase (`voting-app/`)
- **v1.0.0 (Legacy)**: Standalone local version (`naming-voting-app.tsx`)

### Main Application Structure (v2.0.0)

Located in `voting-app/src/`:
- `FirebaseVotingApp.tsx` - Main React component with real-time features
- `firebase.ts` - Firebase configuration and database paths
- `App.tsx` - Application entry point
- `main.tsx` - Vite entry point

### Key Components (v2.0.0)

The main application (`FirebaseVotingApp.tsx`) includes:

1. **Real-time Voting System**: 
   - `votesByPerson` - Tracks all votes by user across categories
   - Live synchronization via Firebase Realtime Database
   - Vote keys: `{categoryId}-{name}` for predefined, `{categoryId}-user-{name}` for user submissions

2. **Collaborative Features**:
   - `activeUsers` - Live tracking of users currently voting
   - `notifications` - Real-time activity feed showing votes and submissions
   - Instant visual feedback with confetti and animations

3. **Category Organization**: 7 categories with themed names:
   - Hispanic/Latina culture (`hispanic`)
   - Speed-focused (`speed`)
   - Modular/adaptable (`modular`) 
   - LATAM regional tech (`regional`)
   - Futuristic AI (`futuristic`)
   - Value-focused Spanish (`spanish_values`)
   - Value-focused English (`english_values`)

4. **User Management**:
   - `currentVoter`/`confirmedVoter` - User identification system
   - `userSubmissions` - Category-based custom name submissions
   - User activity tracking for presence detection

## Development Commands

Navigate to `voting-app/` directory first:

```bash
cd voting-app
```

### Setup and Development
- `npm install` - Install dependencies
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Firebase Configuration

1. Create `.env` file in `voting-app/` with:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

2. Apply Firebase rules from `firebase-rules.json` to Realtime Database

## Technology Stack

### Dependencies
- **React 19** with hooks and TypeScript
- **Firebase** for real-time database
- **Framer Motion** for animations
- **Canvas Confetti & React Confetti** for celebration effects
- **Lucide React** for icons
- **Tailwind CSS** for styling

### Build Tools
- **Vite** as build tool and dev server
- **TypeScript** for type safety
- **ESLint** for code linting
- **PostCSS + Autoprefixer** for CSS processing

## Data Structure

### Firebase Realtime Database
```
votes/
  {userId}/
    {voteKey}: boolean

userSubmissions/
  {categoryId}/
    {submissionId}: {
      name: string,
      submitter: string,
      timestamp: number
    }

activeUsers/
  {userId}: {
    name: string,
    lastActive: number
  }

notifications/
  {notificationId}: {
    message: string,
    timestamp: number,
    type: 'vote' | 'submission' | 'user'
  }
```

## Security Considerations

- Firebase rules allow open read/write access for ease of use
- No authentication system implemented (by design for quick access)
- All data is publicly visible to connected users
- For production, implement proper authentication and access controls