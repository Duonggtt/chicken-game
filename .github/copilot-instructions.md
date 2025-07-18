<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Chicken Shooter Game - Development Instructions

## Project Overview
This is a Vue.js-based chicken shooting game with the following key features:
- Progressive difficulty scaling
- Boss battles every 5 levels
- Power-up system with different weapon types
- Responsive design for mobile, tablet, and desktop
- Leaderboard with database integration
- Sound effects and background music
- Particle effects and animations

## Key Technologies
- Vue.js 3 with Composition API
- TailwindCSS for styling
- Howler.js for audio management
- Animate.css for animations
- @vueuse/core for utilities

## Game Architecture
- `gameStore.js` - Central state management
- `gameEngine.js` - Main game loop and logic
- `soundManager.js` - Audio system
- Components are modular and responsive

## Development Guidelines
- Use TailwindCSS classes for styling
- Follow Vue 3 Composition API patterns
- Maintain responsive design principles
- Keep performance optimized for mobile devices
- Use semantic HTML and proper accessibility
- Comment complex game logic clearly

## Database Integration
- Primary: Backend API integration
- Fallback: localStorage for offline mode
- Configuration in `src/config/database.js`

## Sound System
- Supports multiple audio formats
- Fallback to synthesized sounds if files missing
- Volume controls and mute functionality
- Background music with proper loop handling

## Performance Considerations
- Efficient collision detection
- Object pooling for bullets and explosions
- Responsive canvas/game area
- Minimal DOM manipulations during gameplay
