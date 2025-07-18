<template>
  <div 
    id="game-area" 
    class="game-area"
    :class="{ 'hide-cursor': gameStore.isPlaying }"
    @mousemove="handleMouseMove"
    @click="handleClick"
  >
    <!-- Background -->
    <div class="game-background" :style="backgroundStyle"></div>
    
    <!-- Game UI -->
    <div class="game-ui">
      <div class="ui-left">
        <div class="score-display">
          <span class="text-yellow-300 text-xl font-bold">Score: {{ gameStore.score.toLocaleString() }}</span>
        </div>
        <div class="level-display">
          <span class="text-blue-300 text-lg">Level: {{ gameStore.level }}</span>
        </div>
      </div>
      
      <div class="ui-center">
        <div v-if="gameStore.boss" class="boss-health">
          <div class="boss-info">
            <span class="text-red-300 text-xs font-bold">🐔 BOSS LV{{ gameStore.boss.level }}</span>
            <span class="text-red-200 text-xs">{{ gameStore.boss.health }}/{{ gameStore.boss.maxHealth }} HP</span>
          </div>
          <div class="boss-health-bar">
            <div 
              class="boss-health-fill" 
              :style="{ 
                width: (gameStore.boss.health / gameStore.boss.maxHealth) * 100 + '%',
                backgroundColor: gameStore.boss.health > gameStore.boss.maxHealth * 0.5 ? '#ef4444' : 
                                gameStore.boss.health > gameStore.boss.maxHealth * 0.25 ? '#f97316' : '#dc2626'
              }"
            ></div>
          </div>
        </div>
      </div>
      
      <div class="ui-right">
        <div class="level-progress mb-2">
          <span class="text-blue-300 text-sm">Level {{ gameStore.level }}</span>
          <div class="text-yellow-300 text-xs">
            {{ gameStore.chickensKilledThisLevel }}/{{ gameStore.getChickensRequired() }} Chickens
          </div>
        </div>
        
        <div class="lives-display flex items-center space-x-1">
          <span class="text-red-300 text-lg mr-2">Lives:</span>
          <div v-for="i in gameStore.lives" :key="i" class="life-heart">❤️</div>
        </div>
        <div class="power-up-display" v-if="gameStore.powerUpDuration > 0">
          <span class="text-green-300 text-sm">{{ gameStore.currentWeapon.toUpperCase() }}</span>
          <div class="power-up-timer">
            <div 
              class="power-up-fill" 
              :style="{ width: (gameStore.powerUpDuration / 5000) * 100 + '%' }"
            ></div>
          </div>
        </div>
        <button @click="$emit('pause-game')" class="pause-btn">⏸️</button>
      </div>
    </div>
    
    <!-- Game Objects -->
    <div class="game-objects">
      <!-- Spaceship -->
      <div 
        class="spaceship"
        :style="{ 
          left: gameStore.spaceship.x + 'px', 
          top: gameStore.spaceship.y + 'px',
          width: gameStore.spaceship.width + 'px',
          height: gameStore.spaceship.height + 'px'
        }"
      >
        🚀
      </div>
      
      <!-- Bullets -->
      <div 
        v-for="bullet in gameStore.bullets" 
        :key="bullet.id"
        class="bullet"
        :class="{ 
          'enemy-bullet': bullet.type === 'enemy',
          'boss-bullet': bullet.color === '#ff4444'
        }"
        :style="{ 
          left: bullet.x + 'px', 
          top: bullet.y + 'px',
          width: (bullet.width || 4) + 'px',
          height: (bullet.height || 8) + 'px',
          backgroundColor: bullet.color || '#00ffff'
        }"
      ></div>
      
      <!-- Chickens - Precise hitbox visualization -->
      <div 
        v-for="chicken in gameStore.chickens" 
        :key="chicken.id"
        class="chicken"
        :style="{ 
          left: chicken.x + 'px', 
          top: chicken.y + 'px',
          width: chicken.width + 'px',
          height: chicken.height + 'px'
        }"
      >
        <div class="chicken-sprite">🐔</div>
        
        <!-- Visual hitbox for debugging (remove in production) -->
        <!-- 
        <div class="chicken-hitbox" :style="{
          left: (chicken.width * 0.3) + 'px',
          top: (chicken.height * 0.3) + 'px',
          width: (chicken.width * 0.4) + 'px',
          height: (chicken.height * 0.4) + 'px'
        }"></div>
        -->
        
        <div v-if="chicken.health < chicken.maxHealth" class="chicken-health">
          <div 
            class="chicken-health-fill" 
            :style="{ width: (chicken.health / chicken.maxHealth) * 100 + '%' }"
          ></div>
        </div>
      </div>
      
      <!-- Boss - Simplified animations -->
      <div 
        v-if="gameStore.boss"
        class="boss"
        :style="{ 
          left: gameStore.boss.x + 'px', 
          top: gameStore.boss.y + 'px',
          width: gameStore.boss.width + 'px',
          height: gameStore.boss.height + 'px'
        }"
      >
        <div class="boss-sprite">
          <!-- Con gà boss to với hiệu ứng giảm thiểu -->
          <div class="chicken-boss-body" :style="{ 
            fontSize: getBossSize(gameStore.boss.level),
            transform: `scale(${getBossScale(gameStore.boss.level)})`
          }">
            🐔
          </div>
          <div class="boss-level-indicator">
            LV.{{ gameStore.boss.level }}
          </div>
        </div>
      </div>
      
      <!-- Power-ups - Remove spin animation -->
      <div 
        v-for="powerUp in gameStore.powerUps" 
        :key="powerUp.id"
        class="power-up"
        :style="{ 
          left: powerUp.x + 'px', 
          top: powerUp.y + 'px' 
        }"
      >
        <div class="power-up-sprite">{{ getPowerUpIcon(powerUp.type) }}</div>
      </div>
      
      <!-- Explosions - Precisely positioned -->
      <div 
        v-for="explosion in gameStore.explosions" 
        :key="explosion.id"
        class="explosion"
        :style="{ 
          left: explosion.x + 'px', 
          top: explosion.y + 'px',
          width: '64px',
          height: '64px'
        }"
      >
        💥
      </div>
    </div>
    
    <!-- Level transition -->
    <div v-if="showLevelTransition" class="level-transition animate__animated animate__zoomIn">
      <h2 class="text-6xl font-bold text-white mb-4">LEVEL {{ gameStore.level }}</h2>
      <p class="text-2xl text-yellow-300">{{ getLevelMessage() }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { gameStore } from '../store/gameStore.js'

export default {
  name: 'GameArea',
  emits: ['pause-game', 'end-game'],
  setup() {
    const showLevelTransition = ref(false)
    
    const backgroundStyle = computed(() => {
      const level = gameStore.level
      if (level <= 5) {
        return { background: 'linear-gradient(to bottom, #1e3a8a, #3730a3, #581c87)' }
      } else if (level <= 10) {
        return { background: 'linear-gradient(to bottom, #7c2d12, #dc2626, #ea580c)' }
      } else if (level <= 15) {
        return { background: 'linear-gradient(to bottom, #166534, #059669, #0d9488)' }
      } else {
        return { background: 'linear-gradient(to bottom, #374151, #6b7280, #9ca3af)' }
      }
    })
    
    const getPowerUpIcon = (type) => {
      const icons = {
        rapid: '⚡',
        spread: '🌟',
        shield: '🛡️',
        life: '❤️'
      }
      return icons[type] || '✨'
    }
    
    const getLevelMessage = () => {
      if (gameStore.level % 5 === 0) {
        return 'BOSS FIGHT!'
      } else if (gameStore.level <= 5) {
        return 'Getting Started'
      } else if (gameStore.level <= 10) {
        return 'Heating Up!'
      } else if (gameStore.level <= 15) {
        return 'Getting Intense!'
      } else {
        return 'MAXIMUM CHAOS!'
      }
    }
    
    // Watch for level changes to show transition
    watch(() => gameStore.level, (newLevel, oldLevel) => {
      if (newLevel > oldLevel) {
        showLevelTransition.value = true
        // Show transition for longer time to match gameStore delay
        setTimeout(() => {
          showLevelTransition.value = false
        }, 2200) // 2.2 seconds to match gameStore 2.5s delay
      }
    })
    
    // Watch for game over
    watch(() => gameStore.lives, (newLives) => {
      if (newLives <= 0) {
        setTimeout(() => {
          emit('end-game')
        }, 1000)
      }
    })
    
    // Handle mouse movement for spaceship control - DISABLED for better performance
    // Let gameEngine handle all mouse movement for smoother control
    const handleMouseMove = (event) => {
      // Disabled - gameEngine handles mouse movement more efficiently
      return
    }
    
    // Handle click for shooting
    const handleClick = (event) => {
      if (!gameStore.isPlaying) return
      
      // Trigger shooting
      if (typeof window.gameEngine !== 'undefined' && window.gameEngine.shoot) {
        window.gameEngine.shoot()
      }
    }
    
    // Tính kích thước boss theo level
    const getBossSize = (level) => {
      const baseSize = 5 // 5rem base (khá to)
      const sizeIncrease = level * 0.3 // Tăng 0.3rem mỗi level
      return `${Math.min(baseSize + sizeIncrease, 8)}rem` // Max 8rem
    }
    
    const getBossScale = (level) => {
      const baseScale = 1.0
      const scaleIncrease = level * 0.05 // Tăng 5% scale mỗi level
      return Math.min(baseScale + scaleIncrease, 1.5) // Max scale 1.5
    }

    return {
      gameStore,
      backgroundStyle,
      showLevelTransition,
      getPowerUpIcon,
      getLevelMessage,
      getBossSize,
      getBossScale,
      handleMouseMove,
      handleClick
    }
  }
}
</script>

<style scoped>
/* Performance optimized CSS - No heavy animations */
.game-area {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  /* Hardware acceleration for better performance */
  transform: translateZ(0);
  will-change: auto;
}

.hide-cursor {
  cursor: none !important;
}

.hide-cursor * {
  cursor: none !important;
}

.hide-cursor:hover {
  cursor: none !important;
}

.game-background {
  @apply absolute inset-0 transition-all duration-2000;
}

.game-ui {
  @apply absolute top-4 left-4 right-4 z-50 flex justify-between items-start;
}

.ui-left, .ui-right {
  @apply flex flex-col space-y-2;
}

.ui-center {
  @apply flex-1 flex justify-center;
}

.score-display, .level-display {
  @apply bg-black bg-opacity-50 rounded-lg px-3 py-1 backdrop-blur-sm;
}

.lives-display {
  @apply bg-black bg-opacity-50 rounded-lg px-3 py-1 backdrop-blur-sm;
}

.life-heart {
  @apply text-lg;
}

.boss-health {
  @apply flex flex-col items-center space-y-1 bg-black bg-opacity-50 rounded-lg p-2 backdrop-blur-sm;
}

.boss-info {
  @apply flex flex-col items-center space-y-0;
}

.boss-health-bar {
  @apply w-48 h-3 bg-red-900 rounded-full overflow-hidden border border-red-400 shadow-md;
}

.boss-health-fill {
  @apply h-full transition-all duration-500 ease-out shadow-inner;
}

.power-up-display {
  @apply bg-black bg-opacity-50 rounded-lg px-3 py-1 backdrop-blur-sm;
}

.power-up-timer {
  @apply w-20 h-2 bg-gray-700 rounded-full overflow-hidden mt-1;
}

.power-up-fill {
  @apply h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-100;
}

.pause-btn {
  @apply bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg px-3 py-1 backdrop-blur-sm transition-all duration-200;
}

.game-objects {
  @apply relative w-full h-full;
}

.spaceship {
  @apply text-3xl flex items-center justify-center z-40;
  filter: drop-shadow(0 0 15px rgba(255, 255, 0, 1));
  animation: spaceship-glow 1s ease-in-out infinite alternate;
  pointer-events: none; /* Không bị cản trở bởi click events */
}

@keyframes spaceship-glow {
  0% { 
    filter: drop-shadow(0 0 15px rgba(255, 255, 0, 1));
    transform: scale(1);
  }
  100% { 
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 1));
    transform: scale(1.05);
  }
}

.bullet {
  @apply bg-yellow-300 rounded-full shadow-lg absolute;
  box-shadow: 0 0 8px rgba(255, 255, 0, 0.8);
}

.enemy-bullet {
  @apply bg-red-500;
  box-shadow: 0 0 8px rgba(255, 0, 0, 0.8);
}

.boss-bullet {
  background: #ff4444 !important;
  box-shadow: 0 0 12px rgba(255, 68, 68, 0.9);
  animation: boss-bullet-glow 0.5s ease-in-out infinite alternate;
}

@keyframes boss-bullet-glow {
  0% { box-shadow: 0 0 12px rgba(255, 68, 68, 0.9); }
  100% { box-shadow: 0 0 20px rgba(255, 68, 68, 1); }
}

.chicken {
  position: relative;
  font-size: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

/* Debug hitbox visualization (commented out for production) */
/*
.chicken-hitbox {
  position: absolute;
  border: 2px solid red;
  background: rgba(255, 0, 0, 0.2);
  pointer-events: none;
  z-index: 100;
}
*/

.chicken-health {
  @apply w-full h-1 bg-red-900 rounded-full overflow-hidden mt-1;
}

.chicken-health-fill {
  @apply h-full bg-red-500 transition-all duration-200;
}

.boss {
  @apply flex items-center justify-center relative;
  filter: drop-shadow(0 4px 8px rgba(255, 0, 0, 0.8));
}

.boss-sprite {
  @apply relative w-full h-full flex items-center justify-center;
}

.chicken-boss-body {
  /* Size sẽ được set bởi JavaScript để tăng theo level */
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
  animation: boss-float 2s ease-in-out infinite;
  transition: all 0.5s ease;
  position: relative;
  z-index: 1;
}

.boss-level-indicator {
  @apply absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1 py-0.5 rounded;
  font-size: 10px;
  z-index: 10;
}

.boss-glow {
  @apply absolute inset-0 rounded-full;
  background: radial-gradient(circle, rgba(255, 0, 0, 0.3) 0%, transparent 70%);
  animation: boss-glow 1.5s ease-in-out infinite alternate;
}

@keyframes boss-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes boss-glow {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.7; transform: scale(1.1); }
}

.power-up {
  @apply text-2xl flex items-center justify-center;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.8));
}

.explosion {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  pointer-events: none;
  width: 64px;
  height: 64px;
  animation: explosion-animate 0.5s ease-out;
}

@keyframes explosion-animate {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.level-transition {
  @apply absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-50 text-center;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .game-ui {
    @apply text-sm;
  }
  
  .spaceship {
    @apply text-2xl;
  }
  
  .chicken {
    @apply text-xl;
  }
  
  .boss {
    @apply text-4xl;
  }
  
  .boss-health-bar {
    @apply w-40 h-2;
  }
  
  .level-transition h2 {
    @apply text-4xl;
  }
  
  .level-transition p {
    @apply text-xl;
  }
}

@media (max-width: 480px) {
  .game-ui {
    @apply flex-col space-y-2;
  }
  
  .ui-left, .ui-right {
    @apply flex-row space-x-2 space-y-0;
  }
  
  .spaceship {
    @apply text-xl;
  }
  
  .chicken {
    @apply text-lg;
  }
  
  .boss {
    @apply text-3xl;
  }
  
  .level-transition h2 {
    @apply text-3xl;
  }
  
  .level-transition p {
    @apply text-lg;
  }
}

/* Mobile Performance Optimizations */
@media (max-width: 768px) {
  /* Reduce animations on mobile for better performance */
  .spaceship {
    animation: none; /* Disable glow animation on mobile */
  }
  
  .boss-bullet {
    animation: none; /* Disable bullet glow on mobile */
  }
  
  .boss-float {
    animation-duration: 3s; /* Slower animation */
  }
  
  .powerup-float {
    animation-duration: 4s; /* Slower animation */
  }
  
  /* Adjust boss size for mobile */
  .chicken-boss-body {
    font-size: 3rem !important; /* Override JavaScript size on mobile */
    transform: scale(1.2) !important; /* Override scale on mobile */
  }
  
  .boss-level-indicator {
    font-size: 8px;
    top: -4px;
    right: -4px;
  }
  
  /* Reduce effects */
  .bullet {
    box-shadow: none;
  }
  
  .enemy-bullet {
    box-shadow: none;
  }
  
  .boss-bullet {
    box-shadow: 0 0 4px rgba(255, 68, 68, 0.6);
  }
  
  /* Disable complex filters on mobile */
  .spaceship {
    filter: none;
  }
  
  .chicken {
    filter: none;
  }
  
  .boss {
    filter: drop-shadow(0 2px 4px rgba(255, 0, 0, 0.6));
  }
  
  .chicken-boss-body {
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6)) !important;
  }
}

/* Further optimizations for very small screens */
@media (max-width: 480px) {
  /* Disable all non-essential animations */
  * {
    animation-duration: 0s !important;
    transition-duration: 0.1s !important;
  }
  
  /* Keep only essential animations */
  .level-transition {
    animation-duration: 1s !important;
  }
  
  .boss-health-fill {
    transition-duration: 0.3s !important;
  }
}
</style>
