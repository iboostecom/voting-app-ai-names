# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based voting application for selecting AI service names. The app allows users to vote on predefined names across different categories and submit their own suggestions.

## Architecture

### Single File Structure
- `naming-voting-app.tsx` - Main React component containing the entire application
- No build configuration files, package.json, or additional dependencies detected
- Standalone React component using modern hooks (useState)

### Key Components

The application is structured as a single React functional component with the following main features:

1. **Category-based Name Organization**: Names are organized into 7 categories:
   - Hispanic/Latina culture names
   - Speed-focused names  
   - Modular/adaptable names
   - LATAM regional tech names
   - Futuristic AI names
   - Value-focused Spanish names
   - Value-focused English names

2. **State Management**: Uses React useState hooks for:
   - `votes` - Tracks selected names by category-name key
   - `userSubmissions` - Stores user-contributed names by category
   - `showAddForm` - Controls modal visibility
   - Form input states for new submissions

3. **Key Functions**:
   - `handleVote()` - Toggles vote status for names
   - `handleAddName()` - Adds user-submitted names to categories
   - `removeUserSubmission()` - Removes user-contributed names
   - Various counting utilities for vote statistics

### UI Structure

- **Header**: Vote counter, user submissions counter, and "Add Name" button
- **Modal Form**: For submitting new name suggestions with submitter info
- **Category Cards**: Each category displays as a card with:
  - Predefined names in a responsive grid
  - User-submitted names section (if any)
  - Vote counts and quick-add button
- **Summary Section**: Shows selected favorites with copy-to-clipboard functionality
- **Instructions**: How-to-vote guidance at bottom

## Development Notes

### Styling
- Uses Tailwind CSS classes extensively
- Responsive design with breakpoints (md:, lg:)
- Color-coded categories with consistent design patterns
- Hover effects and transitions for interactivity

### Dependencies
- React with hooks
- Lucide React for icons (Heart, HeartOff, Plus, X, Check)
- Assumes Tailwind CSS is available in build environment

### Data Flow
- All state is local to the main component
- No external API calls or persistence
- Data persists only during session (no localStorage/database)
- Vote keys use format: `{categoryId}-{name}` for original names, `{categoryId}-user-{name}` for user submissions

## Development Workflow

Since no package.json or build configuration exists, this appears to be a standalone React component that would need to be integrated into a larger React application or development environment with appropriate build tools and dependencies.