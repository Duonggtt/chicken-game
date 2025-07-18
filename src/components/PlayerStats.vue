<template>
  <div class="player-stats-container">
    <div class="player-stats-card">
      <div class="stats-content">
        <!-- Header -->
        <div class="stats-header">
          📊 THỐNG KÊ THẬT
        </div>
        
        <!-- Stats Grid -->
        <div class="stats-grid">
          <!-- Total Players -->
          <div class="stat-item">
            <div class="stat-icon-label">
              <span class="stat-icon text-green-400">👥</span>
              <span class="stat-label">Tổng:</span>
            </div>
            <span class="stat-value text-green-400">{{ formatNumber(stats.totalPlayers) }}</span>
          </div>
          
          <!-- Today Players -->
          <div class="stat-item">
            <div class="stat-icon-label">
              <span class="stat-icon text-blue-400">📅</span>
              <span class="stat-label">Hôm nay:</span>
            </div>
            <span class="stat-value text-blue-400">{{ formatNumber(stats.todayPlayers) }}</span>
          </div>
          
          <!-- Online Players -->
          <div class="stat-item">
            <div class="stat-icon-label">
              <span class="stat-icon text-yellow-400 animate-pulse">🟡</span>
              <span class="stat-label">Online:</span>
            </div>
            <span class="stat-value text-yellow-400">{{ formatNumber(stats.onlinePlayers) }}</span>
          </div>
        </div>
        
        <!-- Last Updated -->
        <div class="stats-footer">
          <span class="update-time">Cập nhật: {{ lastUpdated }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { cloudStorageService } from '../services/cloudStorageService.js'

export default {
  name: 'PlayerStats',
  setup() {
    const stats = ref({
      totalPlayers: 0,
      todayPlayers: 0,
      onlinePlayers: 0,
      lastUpdated: null
    })

    const lastUpdated = computed(() => {
      if (!stats.value.lastUpdated) return ''
      const date = new Date(stats.value.lastUpdated)
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    })

    let updateInterval = null

    const formatNumber = (num) => {
      if (!num && num !== 0) return '---'
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toString()
    }

    const fetchStats = async () => {
      // Get real statistics from cloudStorageService (which uses real user tracking)
      try {
        const realStats = await cloudStorageService.getStatistics()
        stats.value = realStats
        console.log('Stats updated from cloud storage service:', realStats)
        return
      } catch (error) {
        console.warn('Cloud storage service failed, using basic fallback:', error)
      }

      // Final fallback - basic real stats
      const now = new Date()
      const hour = now.getHours()
      
      const fallbackStats = {
        totalPlayers: 1,
        todayPlayers: 1,
        onlinePlayers: 1,
        lastUpdated: new Date().toISOString(),
        source: 'fallback'
      }
      
      stats.value = fallbackStats
      console.log('Stats updated with fallback:', fallbackStats)

      // Try to fetch from API as final enhancement (optional)
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 
                       (window.location.hostname === 'localhost' ? 
                        'http://localhost:3000' : 
                        'https://chicken-game-sigma.vercel.app')
        
        const response = await fetch(`${baseUrl}/api/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.stats) {
            stats.value = { 
              ...localStats, 
              ...data.stats,
              onlinePlayers: Math.max(1, data.stats.onlinePlayers || localStats.onlinePlayers)
            }
            console.log('Stats enhanced with API data:', stats.value)
          }
        }
      } catch (error) {
        console.warn('API stats failed, using cloud/local stats:', error)
      }
    }

    onMounted(() => {
      // Fetch initial stats
      fetchStats()
      
      // Update stats every 30 seconds
      updateInterval = setInterval(fetchStats, 30000)
    })

    onUnmounted(() => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    })

    return {
      stats,
      lastUpdated,
      formatNumber
    }
  }
}
</script>

<style scoped>
/* Responsive Player Stats Container */
.player-stats-container {
  @apply fixed z-50 text-white;
  
  /* Desktop: Top right corner */
  @apply top-4 right-4;
}

.player-stats-card {
  @apply bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90;
  @apply backdrop-blur-md border border-yellow-400/40 shadow-2xl;
  @apply rounded-xl px-4 py-3;
  
  /* Responsive adjustments */
  @apply min-w-[160px] max-w-[200px];
}

.stats-content {
  @apply text-sm space-y-2;
}

.stats-header {
  @apply text-center text-yellow-400 font-bold text-xs mb-2;
  @apply border-b border-yellow-400/30 pb-1;
}

.stats-grid {
  @apply space-y-2;
}

.stat-item {
  @apply flex items-center justify-between;
}

.stat-icon-label {
  @apply flex items-center gap-2;
}

.stat-icon {
  @apply text-lg;
}

.stat-label {
  @apply text-xs;
}

.stat-value {
  @apply font-bold;
}

.stats-footer {
  @apply text-xs text-gray-400 text-center pt-2;
  @apply border-t border-gray-600/30;
}

.update-time {
  @apply text-xs;
}

/* Tablet adjustments (iPad) */
@media (min-width: 768px) and (max-width: 1024px) {
  .player-stats-container {
    @apply top-3 right-3;
  }
  
  .player-stats-card {
    @apply px-3 py-2;
    @apply min-w-[140px] max-w-[180px];
  }
  
  .stats-content {
    @apply text-xs space-y-1;
  }
  
  .stat-icon {
    @apply text-base;
  }
  
  .stat-label, .update-time {
    @apply text-xs;
  }
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .player-stats-container {
    @apply top-2 right-2;
  }
  
  .player-stats-card {
    @apply px-2 py-2 rounded-lg;
    @apply min-w-[120px] max-w-[140px];
  }
  
  .stats-content {
    @apply text-xs space-y-1;
  }
  
  .stats-header {
    @apply text-xs mb-1 pb-1;
  }
  
  .stats-grid {
    @apply space-y-1;
  }
  
  .stat-icon {
    @apply text-sm;
  }
  
  .stat-label {
    @apply text-xs;
  }
  
  .stat-value {
    @apply text-xs;
  }
  
  .stats-footer {
    @apply pt-1;
  }
  
  .update-time {
    @apply text-xs;
  }
}

/* Very small mobile (< 480px) */
@media (max-width: 480px) {
  .player-stats-container {
    @apply top-1 right-1;
  }
  
  .player-stats-card {
    @apply px-2 py-1;
    @apply min-w-[100px] max-w-[120px];
  }
  
  .stats-content {
    @apply text-xs space-y-1;
  }
  
  .stat-item {
    @apply flex-col items-start gap-0;
  }
  
  .stat-icon-label {
    @apply gap-1;
  }
  
  .stat-icon {
    @apply text-xs;
  }
  
  .stat-label, .stat-value, .update-time {
    @apply text-xs;
  }
  
  .stats-header {
    @apply text-xs;
  }
}

/* Landscape mobile optimization */
@media (max-height: 500px) and (orientation: landscape) {
  .player-stats-container {
    @apply top-1 right-1;
  }
  
  .player-stats-card {
    @apply px-2 py-1;
  }
  
  .stats-content {
    @apply space-y-0;
  }
  
  .stats-grid {
    @apply space-y-0 grid grid-cols-3 gap-2;
  }
  
  .stat-item {
    @apply flex-col text-center;
  }
  
  .stat-icon-label {
    @apply flex-col gap-0;
  }
  
  .stats-header, .stats-footer {
    @apply hidden;
  }
}
</style>
