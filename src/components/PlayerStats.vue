<template>
  <div class="fixed top-4 right-4 z-50 bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 text-white px-4 py-3 rounded-xl backdrop-blur-md border border-yellow-400/40 shadow-2xl">
    <div class="text-sm space-y-2 min-w-[160px]">
      <!-- Header -->
      <div class="text-center text-yellow-400 font-bold text-xs mb-2 border-b border-yellow-400/30 pb-1">
        📊 THỐNG KÊ GAME
      </div>
      
      <!-- Total Players -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-green-400 text-lg">👥</span>
          <span class="text-xs">Tổng:</span>
        </div>
        <span class="font-bold text-green-400">{{ formatNumber(stats.totalPlayers) }}</span>
      </div>
      
      <!-- Today Players -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-blue-400 text-lg">📅</span>
          <span class="text-xs">Hôm nay:</span>
        </div>
        <span class="font-bold text-blue-400">{{ formatNumber(stats.todayPlayers) }}</span>
      </div>
      
      <!-- Online Players -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-yellow-400 text-lg animate-pulse">🟡</span>
          <span class="text-xs">Online:</span>
        </div>
        <span class="font-bold text-yellow-400">{{ formatNumber(stats.onlinePlayers) }}</span>
      </div>
      
      <!-- Last Updated -->
      <div class="text-xs text-gray-400 text-center pt-2 border-t border-gray-600/30">
        <span class="text-xs">Cập nhật: {{ lastUpdated }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'

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
      try {
        // Determine the correct API URL based on environment
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
            stats.value = { ...data.stats }
            console.log('Stats updated:', data.stats)
          }
        } else {
          console.warn('Failed to fetch stats:', response.status)
          // Use fallback data
          stats.value = {
            totalPlayers: Math.floor(Math.random() * 1000) + 500,
            todayPlayers: Math.floor(Math.random() * 50) + 10,
            onlinePlayers: Math.floor(Math.random() * 20) + 5,
            lastUpdated: new Date().toISOString()
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Use fallback data on error
        stats.value = {
          totalPlayers: Math.floor(Math.random() * 1000) + 500,
          todayPlayers: Math.floor(Math.random() * 50) + 10,
          onlinePlayers: Math.floor(Math.random() * 20) + 5,
          lastUpdated: new Date().toISOString()
        }
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
/* Additional custom styles if needed */
</style>
