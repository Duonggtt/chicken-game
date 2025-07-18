<template>
  <div class="modal-overlay">
    <div class="modal-content animate__animated animate__slideInUp">
      <div class="modal-header">
        <h2 class="text-3xl font-bold text-white mb-2">🏆 Leaderboard</h2>
        <p class="text-gray-300 mb-4">Top Space Pilots in the Galaxy</p>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="modal-body">
        <div v-if="gameStore.leaderboard.length === 0" class="empty-state">
          <div class="text-6xl mb-4">🚀</div>
          <h3 class="text-xl font-bold text-white mb-2">No Scores Yet!</h3>
          <p class="text-gray-400">Be the first to make it to the leaderboard!</p>
        </div>
        
        <div v-else class="leaderboard-list">
          <div class="leaderboard-header">
            <div class="rank-col">Rank</div>
            <div class="name-col">Player</div>
            <div class="score-col">Score</div>
            <div class="level-col">Level</div>
            <div class="date-col">Date</div>
          </div>
          
          <div 
            v-for="(entry, index) in gameStore.leaderboard" 
            :key="index"
            class="leaderboard-entry"
            :class="{ 'current-player': entry.playerName === gameStore.playerName }"
          >
            <div class="rank-col">
              <div class="rank-badge" :class="getRankClass(index)">
                {{ getRankDisplay(index) }}
              </div>
            </div>
            <div class="name-col">
              <div class="player-name">
                {{ entry.playerName }}
                <span v-if="entry.playerName === gameStore.playerName" class="you-badge">YOU</span>
              </div>
            </div>
            <div class="score-col">{{ entry.score.toLocaleString() }}</div>
            <div class="level-col">{{ entry.level }}</div>
            <div class="date-col">{{ formatDate(entry.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="close-modal-btn">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { gameStore } from '../store/gameStore.js'

export default {
  name: 'LeaderboardModal',
  emits: ['close'],
  setup() {
    const getRankClass = (index) => {
      if (index === 0) return 'gold'
      if (index === 1) return 'silver'
      if (index === 2) return 'bronze'
      return 'normal'
    }
    
    const getRankDisplay = (index) => {
      if (index === 0) return '🥇'
      if (index === 1) return '🥈'
      if (index === 2) return '🥉'
      return `#${index + 1}`
    }
    
    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    return {
      gameStore,
      getRankClass,
      getRankDisplay,
      formatDate
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50;
  backdrop-filter: blur(5px);
}

.modal-content {
  @apply bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-600 max-w-4xl w-full mx-4 max-h-screen overflow-hidden;
}

.modal-header {
  @apply relative p-6 pb-4 text-center border-b border-gray-700;
}

.close-btn {
  @apply absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200;
}

.modal-body {
  @apply p-6 max-h-96 overflow-y-auto;
}

.modal-footer {
  @apply p-6 pt-4 border-t border-gray-700 text-center;
}

.empty-state {
  @apply text-center py-12;
}

.leaderboard-list {
  @apply space-y-2;
}

.leaderboard-header {
  @apply grid grid-cols-5 gap-4 p-4 bg-gray-800 rounded-lg font-bold text-gray-300 text-sm;
}

.leaderboard-entry {
  @apply grid grid-cols-5 gap-4 p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200;
}

.current-player {
  @apply bg-blue-700 bg-opacity-50 border border-blue-500;
}

.rank-col {
  @apply flex items-center;
}

.rank-badge {
  @apply px-2 py-1 rounded-full text-sm font-bold;
}

.rank-badge.gold {
  @apply bg-yellow-500 text-black;
}

.rank-badge.silver {
  @apply bg-gray-400 text-black;
}

.rank-badge.bronze {
  @apply bg-orange-600 text-white;
}

.rank-badge.normal {
  @apply bg-gray-600 text-white;
}

.name-col {
  @apply flex items-center;
}

.player-name {
  @apply text-white font-semibold flex items-center gap-2;
}

.you-badge {
  @apply bg-green-500 text-white text-xs px-2 py-1 rounded-full;
}

.score-col, .level-col, .date-col {
  @apply flex items-center text-gray-300;
}

.close-modal-btn {
  @apply bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .modal-content {
    @apply mx-2;
  }
  
  .leaderboard-header,
  .leaderboard-entry {
    @apply grid-cols-3 gap-2 text-sm;
  }
  
  .level-col,
  .date-col {
    @apply hidden;
  }
  
  .modal-header h2 {
    @apply text-2xl;
  }
  
  .modal-header p {
    @apply text-sm;
  }
}

@media (max-width: 480px) {
  .leaderboard-header,
  .leaderboard-entry {
    @apply grid-cols-2 text-xs;
  }
  
  .score-col {
    @apply hidden;
  }
  
  .rank-badge {
    @apply px-1 py-0 text-xs;
  }
}
</style>
