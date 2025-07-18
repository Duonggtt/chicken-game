<template>
  <div class="loading-screen">
    <div class="loading-content animate__animated animate__fadeIn">
      <div class="game-logo">
        <h1 class="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 mb-4">
          🐔 CHICKEN SHOOTER 🚀
        </h1>
        <p class="text-xl text-white mb-8">Prepare for Epic Battle!</p>
      </div>
      
      <div class="loading-spinner">
        <div class="spinner-border"></div>
      </div>
      
      <div class="loading-progress">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
      
      <p class="loading-text text-white mt-4">Loading... {{ progress }}%</p>
    </div>
    
    <!-- Animated background -->
    <div class="floating-objects">
      <div v-for="i in 10" :key="i" class="floating-chicken" :style="getFloatingStyle(i)">
        🐔
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'LoadingScreen',
  setup() {
    const progress = ref(0)
    
    onMounted(() => {
      const interval = setInterval(() => {
        if (progress.value < 100) {
          progress.value += Math.random() * 10
          if (progress.value > 100) progress.value = 100
        } else {
          clearInterval(interval)
        }
      }, 150)
    })
    
    const getFloatingStyle = (index) => {
      return {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 2 + 's',
        fontSize: (Math.random() * 2 + 1) + 'rem'
      }
    }
    
    return {
      progress,
      getFloatingStyle
    }
  }
}
</script>

<style scoped>
.loading-screen {
  @apply fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50;
}

.loading-content {
  @apply text-center;
}

.spinner-border {
  @apply w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4;
}

.loading-progress {
  @apply w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto;
}

.progress-bar {
  @apply h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-300 ease-out;
}

.floating-objects {
  @apply absolute inset-0 pointer-events-none overflow-hidden;
}

.floating-chicken {
  @apply absolute animate-float opacity-30;
  animation-duration: 3s;
  animation-iteration-count: infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}
</style>
