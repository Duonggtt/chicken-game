<template>
  <div class="game-over-screen">
    <div class="game-over-background">
      <!-- Falling stars effect -->
      <div class="falling-stars">
        <div v-for="i in 20" :key="i" class="falling-star" :style="getFallingStarStyle(i)">⭐</div>
      </div>
    </div>
    
    <div class="game-over-content animate__animated animate__fadeIn">
      <!-- Game Over Title -->
      <div class="game-over-title animate__animated animate__bounceInDown">
        <h1 class="text-6xl font-bold text-red-500 mb-4 drop-shadow-lg">
          GAME OVER 💀
        </h1>
        <p class="text-2xl text-white mb-8">Your space adventure has ended!</p>
      </div>
      
      <!-- Final Stats -->
      <div class="final-stats animate__animated animate__zoomIn animate__delay-1s">
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-label">Final Score</div>
            <div class="stat-value">{{ gameStore.score.toLocaleString() }}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-label">Level Reached</div>
            <div class="stat-value">{{ gameStore.level }}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-label">Final Weapon</div>
            <div class="stat-value">{{ gameStore.currentWeapon.toUpperCase() }}</div>
          </div>
        </div>
      </div>
      
      <!-- Player Achievement -->
      <div class="achievement animate__animated animate__fadeInUp animate__delay-2s">
        <div class="achievement-badge">
          <div class="achievement-icon">{{ getAchievementIcon() }}</div>
          <div class="achievement-text">
            <h3 class="achievement-title">{{ getAchievementTitle() }}</h3>
            <p class="achievement-desc">{{ getAchievementDescription() }}</p>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons animate__animated animate__fadeInUp animate__delay-3s">
        <button 
          @click="$emit('restart-game')"
          class="action-btn primary-btn"
        >
          🚀 PLAY AGAIN
        </button>
        
        <button 
          @click="$emit('main-menu')"
          class="action-btn secondary-btn"
        >
          🏠 MAIN MENU
        </button>
      </div>
      
      <!-- High Score Notice -->
      <div v-if="isHighScore" class="high-score-notice animate__animated animate__flash animate__delay-4s">
        <div class="high-score-content">
          <div class="text-4xl mb-2">🎉</div>
          <h3 class="text-xl font-bold text-yellow-300">NEW HIGH SCORE!</h3>
          <p class="text-gray-300">You've made it to the leaderboard!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { gameStore } from '../store/gameStore.js'

export default {
  name: 'GameOverScreen',
  emits: ['restart-game', 'main-menu'],
  setup() {
    const isHighScore = computed(() => {
      if (gameStore.leaderboard.length === 0) return true
      return gameStore.score > (gameStore.leaderboard[gameStore.leaderboard.length - 1]?.score || 0)
    })
    
    const getAchievementIcon = () => {
      const level = gameStore.level
      if (level >= 20) return '👑'
      if (level >= 15) return '🏅'
      if (level >= 10) return '🎖️'
      if (level >= 5) return '🌟'
      return '🎯'
    }
    
    const getAchievementTitle = () => {
      const level = gameStore.level
      if (level >= 20) return 'Galactic Legend'
      if (level >= 15) return 'Space Commander'
      if (level >= 10) return 'Chicken Hunter'
      if (level >= 5) return 'Wing Warrior'
      return 'Space Rookie'
    }
    
    const getAchievementDescription = () => {
      const level = gameStore.level
      if (level >= 20) return 'You are among the greatest space pilots in the galaxy!'
      if (level >= 15) return 'Your tactical skills are exceptional!'
      if (level >= 10) return 'You have proven yourself as a formidable opponent!'
      if (level >= 5) return 'You are getting the hang of this!'
      return 'Not bad for a beginner! Keep practicing!'
    }
    
    const getFallingStarStyle = (index) => {
      return {
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 5 + 's',
        animationDuration: (Math.random() * 3 + 2) + 's'
      }
    }
    
    return {
      gameStore,
      isHighScore,
      getAchievementIcon,
      getAchievementTitle,
      getAchievementDescription,
      getFallingStarStyle
    }
  }
}
</script>

<style scoped>
.game-over-screen {
  @apply relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-900 via-purple-900 to-black;
}

.game-over-background {
  @apply absolute inset-0;
}

.falling-stars {
  @apply absolute inset-0;
}

.falling-star {
  @apply absolute text-lg opacity-60;
  animation: fall 5s linear infinite;
}

.game-over-content {
  @apply relative z-10 text-center px-4 max-w-4xl mx-auto;
}

.stats-container {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6 mb-8;
}

.stat-card {
  @apply bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-600 hover:border-gray-400 transition-all duration-300;
}

.stat-icon {
  @apply text-4xl mb-2;
}

.stat-label {
  @apply text-gray-300 text-sm font-semibold mb-1;
}

.stat-value {
  @apply text-white text-2xl font-bold;
}

.achievement {
  @apply mb-8;
}

.achievement-badge {
  @apply bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 border-2 border-yellow-400 shadow-lg;
}

.achievement-icon {
  @apply text-6xl mb-4;
}

.achievement-title {
  @apply text-2xl font-bold text-white mb-2;
}

.achievement-desc {
  @apply text-yellow-100 text-lg;
}

.action-buttons {
  @apply flex flex-col sm:flex-row gap-4 justify-center items-center mb-8;
}

.action-btn {
  @apply px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl;
}

.primary-btn {
  @apply bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white;
}

.secondary-btn {
  @apply bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white;
}

.high-score-notice {
  @apply mt-6;
}

.high-score-content {
  @apply bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 border-2 border-yellow-400 shadow-lg;
}

@keyframes fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .game-over-title h1 {
    @apply text-4xl;
  }
  
  .game-over-title p {
    @apply text-xl;
  }
  
  .stats-container {
    @apply grid-cols-1 gap-4;
  }
  
  .stat-icon {
    @apply text-3xl;
  }
  
  .stat-value {
    @apply text-xl;
  }
  
  .achievement-icon {
    @apply text-4xl;
  }
  
  .achievement-title {
    @apply text-xl;
  }
  
  .achievement-desc {
    @apply text-base;
  }
  
  .action-btn {
    @apply px-6 py-3 text-base;
  }
}

@media (max-width: 480px) {
  .game-over-title h1 {
    @apply text-3xl;
  }
  
  .game-over-title p {
    @apply text-lg;
  }
  
  .action-buttons {
    @apply flex-col;
  }
  
  .action-btn {
    @apply w-full;
  }
}
</style>
