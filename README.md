# 🐔 Chicken Shooter Game 🚀

An epic space adventure game built with Vue.js where you pilot a spaceship to battle waves of chickens and powerful bosses!

## ✨ Features

### 🎮 Gameplay
- **Progressive Difficulty**: Exponential difficulty scaling with no upper limit
- **Boss Battles**: Epic boss fights every 5 levels with unique mechanics
- **Power-up System**: Collect special weapons (Rapid Fire, Spread Shot, Shield, Extra Life)
- **Auto-targeting**: Spaceship follows mouse/touch input with automatic shooting
- **Multiple Lives**: Start with 3 lives, earn more through power-ups
- **Infinite Levels**: Unlimited gameplay with increasing challenges

### 🎨 Visual & Audio
- **Stunning Graphics**: Dynamic backgrounds that change with level progression
- **Sound System**: Comprehensive audio with background music and sound effects
- **Particle Effects**: Explosions, power-ups, and visual feedback
- **Smooth Animations**: CSS animations and transitions using Animate.css
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### 🏆 Game Systems
- **Leaderboard**: Local and online high score tracking
- **Player Profiles**: Named player sessions with score persistence
- **Settings**: Customizable audio, graphics, and gameplay options
- **Pause System**: Full pause functionality with game state preservation

## 🛠️ Technology Stack

- **Frontend**: Vue.js 3 (Composition API)
- **Styling**: TailwindCSS with custom game-specific classes
- **Audio**: Howler.js for advanced sound management
- **Animations**: Animate.css for smooth visual effects
- **Utilities**: @vueuse/core for enhanced Vue reactivity
- **Build Tool**: Vite for fast development and building

## 📱 Platform Support

- **Desktop**: Full keyboard and mouse support
- **Mobile**: Touch-optimized controls with responsive UI
- **Tablet**: Optimized for tablet-sized screens
- **Progressive Web App**: Can be installed on devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure database** (optional):
   - Edit `src/config/database.js`
   - Add your database connection details
   - Game works offline with localStorage if no database configured

3. **Add audio files** (optional):
   - Place audio files in `public/sounds/` directory
   - See `public/sounds/README.md` for required file names
   - Game generates synthetic sounds if files are missing

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 🎯 Game Controls

### Desktop
- **Mouse**: Move spaceship
- **Auto-shoot**: Automatic firing
- **ESC**: Pause/unpause game
- **Spacebar**: Manual shoot (if auto-shoot disabled)

### Mobile/Touch
- **Touch**: Move spaceship by touching screen
- **Auto-shoot**: Automatic firing
- **Touch controls**: All UI elements are touch-friendly

## ⚙️ Database Configuration

Edit `src/config/database.js` with your database information:

```javascript
export const dbConfig = {
  // MySQL/PostgreSQL
  host: 'your-db-host',
  port: 3306,
  database: 'chicken_game',
  username: 'your-username',
  password: 'your-password',
  
  // Or API endpoint
  apiBaseUrl: 'https://your-api.com/api',
  
  // Local storage (always works as fallback)
  localStorageKey: 'chicken_game_scores'
}
```

## 🎮 Game Features

- 🚀 Responsive spaceship controls
- 🐔 Progressive chicken enemy spawning
- 👹 Boss battles every 5 levels
- ⚡ Power-up system with multiple weapon types
- 🏆 Leaderboard with score persistence
- 🎵 Dynamic audio system
- 📱 Mobile-friendly responsive design
- ⚙️ Customizable settings

---

**Ready to start your space adventure? Run `npm run dev` and enjoy! 🚀🐔**
