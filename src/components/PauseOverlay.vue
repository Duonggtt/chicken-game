<template>
  <div class="pause-overlay">
    <div class="pause-content animate__animated animate__zoomIn">
      <div class="pause-header">
        <h2 class="text-6xl font-bold text-white mb-4">⏸️ PAUSED</h2>
        <p class="text-xl text-gray-300 mb-8">Take a break, space pilot!</p>
      </div>
      
      <div class="pause-stats">
        <div class="stat-row">
          <span class="stat-label">Current Score:</span>
          <span class="stat-value">{{ gameStore.score.toLocaleString() }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Level:</span>
          <span class="stat-value">{{ gameStore.level }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Lives Remaining:</span>
          <span class="stat-value">{{ gameStore.lives }} ❤️</span>
        </div>
        <div v-if="gameStore.powerUpDuration > 0" class="stat-row">
          <span class="stat-label">Active Power-up:</span>
          <span class="stat-value power-up">{{ gameStore.currentWeapon.toUpperCase() }} ⚡</span>
        </div>
      </div>
      
      <div class="pause-buttons">
        <button 
          @click="$emit('resume')"
          class="pause-btn primary-btn"
        >
          ▶️ RESUME GAME
        </button>
        
        <button 
          @click="$emit('main-menu')"
          class="pause-btn secondary-btn"
        >
          🏠 MAIN MENU
        </button>
      </div>
      
      <div class="pause-tips">
        <h3 class="tips-title">💡 Pro Tips</h3>
        <div class="tips-list">
          <p>• Collect power-ups to upgrade your weapons</p>
          <p>• Boss battles occur every 5 levels</p>
          <p>• Your score multiplies by your current level</p>
          <p>• Extra lives can be found as power-ups</p>
        </div>
      </div>
    </div>
    
    <!-- Floating elements -->
    <div class="floating-elements">
      <div v-for="i in 8" :key="i" class="floating-emoji" :style="getFloatingStyle(i)">
        {{ getRandomEmoji() }}
      </div>
    </div>
  </div>
</template>

<script>
import { gameStore } from '../store/gameStore.js'

export default {
  name: 'PauseOverlay',
  emits: ['resume', 'main-menu'],
  setup() {
    const emojis = ['🚀', '⭐', '🌟', '✨', '💫', '🌙', '☄️', '🛸']
    
    const getFloatingStyle = (index) => {
      return {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 3 + 's',
        animationDuration: (Math.random() * 4 + 3) + 's'
      }
    }
    
    const getRandomEmoji = () => {
      return emojis[Math.floor(Math.random() * emojis.length)]
    }
    
    return {
      gameStore,
      getFloatingStyle,
      getRandomEmoji
    }
  }
}
</script>

<style scoped>
.pause-overlay {
  @apply fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50;
  backdrop-filter: blur(10px);
}

.pause-content {
  @apply bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-600 p-8 max-w-lg w-full mx-4 text-center;
}

.pause-header {
  @apply mb-8;
}

.pause-stats {
  @apply bg-black bg-opacity-30 rounded-lg p-6 mb-8 space-y-3;
}

.stat-row {
  @apply flex justify-between items-center text-white;
}

.stat-label {
  @apply text-gray-300;
}

.stat-value {
  @apply font-bold text-lg;
}

.stat-value.power-up {
  @apply text-green-400;
}

.pause-buttons {
  @apply space-y-4 mb-8;
}

.pause-btn {
  @apply w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl;
}

.primary-btn {
  @apply bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white;
}

.secondary-btn {
  @apply bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white;
}

.pause-tips {
  @apply text-left;
}

.tips-title {
  @apply text-lg font-bold text-white mb-3 text-center;
}

.tips-list {
  @apply text-sm text-gray-300 space-y-1;
}

.floating-elements {
  @apply absolute inset-0 pointer-events-none overflow-hidden;
}

.floating-emoji {
  @apply absolute text-2xl opacity-20 animate-float;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
    opacity: 0.2;
  }
  50% { 
    transform: translateY(-20px) rotate(180deg); 
    opacity: 0.4;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .pause-content {
    @apply p-6;
  }
  
  .pause-header h2 {
    @apply text-4xl;
  }
  
  .pause-header p {
    @apply text-lg;
  }
  
  .pause-btn {
    @apply text-base py-2 px-4;
  }
  
  .tips-title {
    @apply text-base;
  }
  
  .tips-list {
    @apply text-xs;
  }
}

@media (max-width: 480px) {
  .pause-content {
    @apply p-4 mx-2;
  }
  
  .pause-header h2 {
    @apply text-3xl;
  }
  
  .pause-header p {
    @apply text-base;
  }
  
  .stat-value {
    @apply text-base;
  }
}
</style>
