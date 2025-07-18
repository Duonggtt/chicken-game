<template>
  <div class="main-menu">
    <div class="menu-background">
      <!-- Animated stars -->
      <div class="stars">
        <div v-for="i in 50" :key="i" class="star" :style="getStarStyle(i)"></div>
      </div>
      
      <!-- Flying chickens -->
      <div class="flying-chickens">
        <div v-for="i in 5" :key="i" class="flying-chicken" :style="getChickenStyle(i)">
          🐔
        </div>
      </div>
    </div>
    
    <div class="menu-content">
      <!-- Game Title -->
      <div class="game-title animate__animated animate__bounceInDown">
        <h1 class="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-4 drop-shadow-lg">
          🐔 CHICKEN SHOOTER 🚀
        </h1>
        <p class="text-2xl text-white font-semibold mb-8 drop-shadow-md">
          The Ultimate Space Adventure
        </p>
      </div>
      
      <!-- Menu Buttons -->
      <div class="menu-buttons animate__animated animate__fadeInUp">
        <button 
          @click="$emit('start-game')"
          class="game-btn text-2xl py-4 px-8 mb-4 hover:scale-110 transform transition-all duration-300"
        >
          🚀 START GAME
        </button>
        
        <button 
          @click="$emit('show-leaderboard')"
          class="game-btn text-xl py-3 px-6 mb-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transform transition-all duration-300"
        >
          🏆 LEADERBOARD
        </button>
        
        <!-- Settings button temporarily disabled -->
        <!-- 
        <button 
          @click="$emit('show-settings')"
          class="game-btn text-xl py-3 px-6 mb-4 bg-gradient-to-r from-green-500 to-teal-600 hover:scale-105 transform transition-all duration-300"
        >
          ⚙️ SETTINGS
        </button>
        -->
      </div>
      
      <!-- Game Info -->
      <div class="game-info animate__animated animate__fadeIn animate__delay-1s">
        <div class="info-cards grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div class="info-card">
            <div class="text-3xl mb-2">🎯</div>
            <h3 class="text-lg font-bold text-white">Easy Controls</h3>
            <p class="text-sm text-gray-300">Move with mouse, auto-shoot enabled</p>
          </div>
          
          <div class="info-card">
            <div class="text-3xl mb-2">⚡</div>
            <h3 class="text-lg font-bold text-white">Power-ups</h3>
            <p class="text-sm text-gray-300">Collect special weapons and abilities</p>
          </div>
          
          <div class="info-card">
            <div class="text-3xl mb-2">👑</div>
            <h3 class="text-lg font-bold text-white">Boss Battles</h3>
            <p class="text-sm text-gray-300">Epic fights every 5 levels</p>
          </div>
        </div>
      </div>
      
      <!-- Controls Info -->
      <div class="controls-info text-center mt-8 text-white animate__animated animate__fadeIn animate__delay-2s">
        <p class="text-sm opacity-75">
          🖱️ Mouse to move • 🚀 Auto-shoot • ⏸️ ESC to pause • 📱 Touch friendly
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainMenu',
  emits: ['start-game', 'show-leaderboard', 'show-settings'],
  setup() {
    const getStarStyle = (index) => {
      return {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 3 + 's',
        animationDuration: (Math.random() * 2 + 1) + 's'
      }
    }
    
    const getChickenStyle = (index) => {
      return {
        top: Math.random() * 80 + 10 + '%',
        animationDelay: Math.random() * 5 + 's',
        animationDuration: (Math.random() * 10 + 10) + 's'
      }
    }
    
    return {
      getStarStyle,
      getChickenStyle
    }
  }
}
</script>

<style scoped>
.main-menu {
  @apply relative w-full h-screen flex items-center justify-center overflow-hidden;
}

.menu-background {
  @apply absolute inset-0;
}

.stars {
  @apply absolute inset-0;
}

.star {
  @apply absolute w-1 h-1 bg-white rounded-full animate-pulse;
}

.flying-chickens {
  @apply absolute inset-0;
}

.flying-chicken {
  @apply absolute text-2xl opacity-20 animate-float;
  animation: fly-across 15s linear infinite;
}

.menu-content {
  @apply relative z-10 text-center px-4 max-w-6xl mx-auto;
}

.menu-buttons {
  @apply flex flex-col items-center space-y-4;
}

.info-cards {
  @apply mt-12;
}

.info-card {
  @apply bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-6 text-center border border-white border-opacity-20 hover:bg-opacity-40 transition-all duration-300;
}

@keyframes fly-across {
  0% { 
    transform: translateX(-100px) translateY(0px) rotate(0deg);
  }
  25% { 
    transform: translateX(25vw) translateY(-20px) rotate(10deg);
  }
  50% { 
    transform: translateX(50vw) translateY(10px) rotate(-5deg);
  }
  75% { 
    transform: translateX(75vw) translateY(-15px) rotate(8deg);
  }
  100% { 
    transform: translateX(calc(100vw + 100px)) translateY(5px) rotate(0deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .game-title h1 {
    @apply text-4xl;
  }
  
  .game-title p {
    @apply text-lg;
  }
  
  .menu-buttons button {
    @apply text-lg py-3 px-6;
  }
  
  .info-cards {
    @apply grid-cols-1 gap-3;
  }
}

@media (max-width: 480px) {
  .game-title h1 {
    @apply text-3xl;
  }
  
  .menu-buttons button {
    @apply text-base py-2 px-4;
  }
}
</style>
