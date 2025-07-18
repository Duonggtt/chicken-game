<template>
  <div id="app" class="responsive-container" :class="{ 'hide-cursor': gameStore.isPlaying }">
    <!-- Loading Screen -->
    <LoadingScreen v-if="loading" />
    
    <!-- Main Menu -->
    <MainMenu 
      v-else-if="!gameStore.gameStarted && !gameStore.gameOver" 
      @start-game="startGame"
      @show-leaderboard="showLeaderboard = true"
      @show-settings="showSettings = true"
    />
    
    <!-- Game Area -->
    <GameArea 
      v-else-if="gameStore.gameStarted"
      @pause-game="pauseGame"
      @end-game="endGame"
    />
    
    <!-- Game Over Screen -->
    <GameOverScreen 
      v-else-if="gameStore.gameOver"
      @restart-game="restartGame"
      @main-menu="goToMainMenu"
    />
    
    <!-- Player Name Modal -->
    <PlayerNameModal 
      v-if="showNameModal"
      @save-name="saveName"
      @close="showNameModal = false"
    />
    
    <!-- Leaderboard Modal -->
    <LeaderboardModal 
      v-if="showLeaderboard"
      @close="showLeaderboard = false"
    />
    
    <!-- Settings Modal - Temporarily disabled -->
    <!-- 
    <SettingsModal 
      v-if="showSettings"
      @close="showSettings = false"
    />
    -->
    
    <!-- Pause Overlay -->
    <PauseOverlay 
      v-if="gameStore.paused"
      @resume="resumeGame"
      @main-menu="goToMainMenu"
    />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { gameStore } from './store/gameStore.js'
import { gameEngine } from './engine/gameEngine.js'
import { soundManager } from './services/soundManager.js'
import { advancedSoundManager } from './services/advancedSoundManager.js'
// import { userTracker } from './services/userTracker.js' // Temporarily disabled for build

import LoadingScreen from './components/LoadingScreen.vue'
import MainMenu from './components/MainMenu.vue'
import GameArea from './components/GameArea.vue'
import GameOverScreen from './components/GameOverScreen.vue'
import PlayerNameModal from './components/PlayerNameModal.vue'
import LeaderboardModal from './components/LeaderboardModal.vue'
// import SettingsModal from './components/SettingsModal.vue' // Temporarily disabled
import PauseOverlay from './components/PauseOverlay.vue'

export default {
  name: 'ChickenShooterGame',
  components: {
    LoadingScreen,
    MainMenu,
    GameArea,
    GameOverScreen,
    PlayerNameModal,
    LeaderboardModal,
    // SettingsModal, // Temporarily disabled
    PauseOverlay
  },
  setup() {
    const loading = ref(true)
    const showNameModal = ref(false)
    const showLeaderboard = ref(false)
    const showSettings = ref(false)
    
    // Simple inline user tracking for build compatibility
    const userTracker = {
      trackAction: (action, data = {}) => {
        // Silent tracking - removed console.log for performance
        const actions = JSON.parse(localStorage.getItem('game_actions') || '[]')
        actions.push({
          action,
          data,
          timestamp: new Date().toISOString()
        })
        // Keep only last 100 actions
        const recentActions = actions.slice(-100)
        localStorage.setItem('game_actions', JSON.stringify(recentActions))
      }
    }
    
    onMounted(() => {
      // Initialize screen size
      gameStore.updateScreenSize()
      
      // Load leaderboard from database
      gameStore.loadLeaderboard()
      
      // Load assets and initialize game
      setTimeout(() => {
        loading.value = false
      }, 2000)
      
      // Keyboard controls
      document.addEventListener('keydown', handleKeyDown)
    })
    
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'Escape':
          if (gameStore.gameStarted && !gameStore.gameOver) {
            togglePause()
          }
          break
        case 'Space':
          e.preventDefault()
          if (gameStore.gameStarted && !gameStore.paused) {
            gameEngine.shoot()
          }
          break
      }
    }
    
    const startGame = () => {
      if (!gameStore.playerName || !gameStore.sessionStarted) {
        showNameModal.value = true
        return
      }
      
      // Track game start
      userTracker.trackAction('game_start', {
        playerName: gameStore.playerName,
        timestamp: new Date().toISOString()
      })
      
      // Enable audio with user interaction
      try {
        advancedSoundManager.enable()
      } catch (error) {
        // Silent fallback
      }

      try {
        soundManager.enable()
      } catch (error) {
        // Silent fallback
      }
      
      gameStore.startGame()
      gameEngine.start()
      
      // Test sound silently
      try {
        advancedSoundManager.play('buttonClick')
      } catch (error) {
        soundManager.play('buttonClick')
      }
    }
    
    const saveName = (name) => {
      // Enable audio with user interaction
      try {
        advancedSoundManager.enable()
      } catch (error) {
        // Silent fallback
      }
      
      try {
        soundManager.enable()
      } catch (error) {
        // Silent fallback
      }
      
      gameStore.playerName = name
      gameStore.sessionStarted = true
      showNameModal.value = false
      startGame()
    }
    
    const pauseGame = () => {
      gameEngine.pause()
    }
    
    const resumeGame = () => {
      gameEngine.resume()
    }
    
    const togglePause = () => {
      if (gameStore.paused) {
        resumeGame()
      } else {
        pauseGame()
      }
    }
    
    const endGame = () => {
      // Track game end with stats
      const gameStats = {
        score: gameStore.score,
        level: gameStore.level,
        duration: gameStore.gameTime,
        chickensShot: gameStore.score, // Approximate chickens shot from score
        playerName: gameStore.playerName
      }
      userTracker.trackAction('game_end', gameStats)
      
      gameEngine.stop()
      gameStore.endGame()
      // Play game over sound
      try {
        advancedSoundManager.play('gameOver')
      } catch (error) {
        soundManager.play('gameOver')
      }
    }
    
    const restartGame = () => {
      // Stop current game completely first
      gameEngine.stop()
      
      // Re-enable audio when restarting
      try {
        advancedSoundManager.enable()
      } catch (error) {
        // Silent fallback
      }
      
      try {
        soundManager.enable()
      } catch (error) {
        // Silent fallback
      }
      
      // Start fresh game
      gameStore.startGame()
      gameEngine.start()
    }
    
    const goToMainMenu = () => {
      gameEngine.stop()
      gameStore.gameStarted = false
      gameStore.gameOver = false
      gameStore.paused = false
      // Chỉ dừng nhạc, không disable sound
      try {
        advancedSoundManager.stopMusic()
      } catch (error) {
        soundManager.stopMusic()
      }
    }
    
    return {
      gameStore,
      loading,
      showNameModal,
      showLeaderboard,
      showSettings,
      startGame,
      saveName,
      pauseGame,
      resumeGame,
      endGame,
      restartGame,
      goToMainMenu
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  user-select: none;
  touch-action: none;
  overflow: hidden;
  position: relative;
}

html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100vh;
}
</style>
