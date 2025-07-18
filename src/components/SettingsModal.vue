<template>
  <div class="modal-overlay">
    <div class="modal-content animate__animated animate__zoomIn">
      <div class="modal-header">
        <h2 class="text-3xl font-bold text-white mb-2">⚙️ Settings</h2>
        <p class="text-gray-300 mb-4">Customize your game experience</p>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="modal-body">
        <!-- Sound Settings -->
        <div class="settings-section">
          <h3 class="section-title">🔊 Sound & Music</h3>
          
          <div class="setting-item">
            <label class="setting-label">
              <span>Enable Sound Effects</span>
              <input 
                type="checkbox" 
                v-model="localSettings.soundEnabled"
                @change="updateSoundEnabled"
                class="setting-checkbox"
              >
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <span>Music Volume</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                v-model="localSettings.musicVolume"
                @input="updateMusicVolume"
                class="setting-slider"
              >
              <span class="volume-display">{{ Math.round(localSettings.musicVolume * 100) }}%</span>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <span>Effects Volume</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                v-model="localSettings.effectVolume"
                @input="updateEffectVolume"
                class="setting-slider"
              >
              <span class="volume-display">{{ Math.round(localSettings.effectVolume * 100) }}%</span>
            </label>
          </div>
        </div>
        
        <!-- Game Settings -->
        <div class="settings-section">
          <h3 class="section-title">🎮 Gameplay</h3>
          
          <div class="setting-item">
            <label class="setting-label">
              <span>Difficulty Scaling</span>
              <select v-model="localSettings.difficultyMode" class="setting-select">
                <option value="normal">Normal</option>
                <option value="easy">Easy</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <span>Show FPS Counter</span>
              <input 
                type="checkbox" 
                v-model="localSettings.showFPS"
                class="setting-checkbox"
              >
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <span>Screen Shake Effects</span>
              <input 
                type="checkbox" 
                v-model="localSettings.screenShake"
                class="setting-checkbox"
              >
            </label>
          </div>
        </div>
        
        <!-- Controls Settings -->
        <div class="settings-section">
          <h3 class="section-title">🎯 Controls</h3>
          
          <div class="setting-item">
            <label class="setting-label">
              <span>Mouse Sensitivity</span>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1"
                v-model="localSettings.mouseSensitivity"
                class="setting-slider"
              >
              <span class="volume-display">{{ localSettings.mouseSensitivity }}x</span>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <span>Auto-Fire Rate</span>
              <select v-model="localSettings.autoFireRate" class="setting-select">
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
                <option value="rapid">Rapid</option>
              </select>
            </label>
          </div>
        </div>
        
        <!-- Display Settings -->
        <div class="settings-section">
          <h3 class="section-title">🖥️ Display</h3>
          
          <div class="setting-item">
            <label class="setting-label">
              <span>Particle Effects</span>
              <select v-model="localSettings.particleQuality" class="setting-select">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="ultra">Ultra</option>
              </select>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <span>Background Animations</span>
              <input 
                type="checkbox" 
                v-model="localSettings.backgroundAnimations"
                class="setting-checkbox"
              >
            </label>
          </div>
        </div>

        <!-- Save confirmation -->
        <div v-if="showSaveConfirmation" class="save-confirmation">
          ✅ Đã lưu cài đặt thành công!
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="resetToDefaults" class="reset-btn">
          🔄 Khôi phục mặc định
        </button>
        <button @click="saveAndClose" class="save-btn">
          💾 Lưu & Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { gameStore } from '../store/gameStore.js'
import { soundManager } from '../services/soundManager.js'
import { advancedSoundManager } from '../services/advancedSoundManager.js'

export default {
  name: 'SettingsModal',
  emits: ['close'],
  setup(props, { emit }) {
    const showSaveConfirmation = ref(false)
    
    const localSettings = reactive({
      soundEnabled: true,
      musicVolume: 0.5,
      effectVolume: 0.7,
      difficultyMode: 'normal',
      showFPS: false,
      screenShake: true,
      mouseSensitivity: 1.0,
      autoFireRate: 'normal',
      particleQuality: 'high',
      backgroundAnimations: true
    })
    
    const difficultySettings = {
      easy: {
        chickenSpeed: 0.8,
        spawnRate: 1.5,
        bossHealth: 0.7,
        powerUpChance: 1.5
      },
      normal: {
        chickenSpeed: 1.0,
        spawnRate: 1.0,
        bossHealth: 1.0,
        powerUpChance: 1.0
      },
      hard: {
        chickenSpeed: 1.3,
        spawnRate: 0.8,
        bossHealth: 1.5,
        powerUpChance: 0.8
      },
      extreme: {
        chickenSpeed: 1.6,
        spawnRate: 0.6,
        bossHealth: 2.0,
        powerUpChance: 0.6
      }
    }
    
    const updateSoundEnabled = () => {
      gameStore.updateSetting('soundEnabled', localSettings.soundEnabled)
    }
    
    const updateMusicVolume = () => {
      gameStore.updateSetting('musicVolume', localSettings.musicVolume)
    }
    
    const updateEffectVolume = () => {
      gameStore.updateSetting('effectVolume', localSettings.effectVolume)
    }

    const updateDifficulty = () => {
      gameStore.updateSetting('difficultyMode', localSettings.difficultyMode)
    }

    const updateControls = () => {
      gameStore.updateSetting('mouseSensitivity', localSettings.mouseSensitivity)
      gameStore.updateSetting('autoFireRate', localSettings.autoFireRate)
    }

    const updateDisplay = () => {
      gameStore.updateSetting('showFPS', localSettings.showFPS)
      gameStore.updateSetting('screenShake', localSettings.screenShake)
      gameStore.updateSetting('particleQuality', localSettings.particleQuality)
      gameStore.updateSetting('backgroundAnimations', localSettings.backgroundAnimations)
    }
    
    const applyDifficultySettings = () => {
      const difficulty = difficultySettings[localSettings.difficultyMode]
      if (difficulty && gameStore.difficulty) {
        Object.assign(gameStore.difficulty, {
          chickenSpeedMultiplier: difficulty.chickenSpeed,
          spawnRateMultiplier: difficulty.spawnRate,
          bossHealthMultiplier: difficulty.bossHealth,
          powerUpChanceMultiplier: difficulty.powerUpChance
        })
      }
    }
    
    const testMusic = () => {
      try {
        if (window.advancedSoundManager) {
          window.advancedSoundManager.playMusic()
        } else if (window.soundManager) {
          window.soundManager.playMusic()
        }
      } catch (error) {
        console.warn('Failed to test music:', error)
      }
    }

    const testEffect = () => {
      try {
        if (window.advancedSoundManager) {
          window.advancedSoundManager.play('shoot')
        } else if (window.soundManager) {
          window.soundManager.play('shoot')
        }
      } catch (error) {
        console.warn('Failed to test effect:', error)
      }
    }
    
    const resetToDefaults = () => {
      gameStore.resetSettingsToDefaults()
      loadSettings()
      
      // Play confirmation sound
      testEffect()
      showSaveConfirmation.value = true
      setTimeout(() => showSaveConfirmation.value = false, 2000)
    }
    
    const getPerformanceLevel = () => {
      let score = 0
      if (localSettings.particleQuality === 'ultra') score += 3
      else if (localSettings.particleQuality === 'high') score += 2
      else if (localSettings.particleQuality === 'medium') score += 1
      
      if (localSettings.backgroundAnimations) score += 1
      if (localSettings.screenShake) score += 0.5
      if (localSettings.showFPS) score += 0.5
      
      if (score <= 1) return 'Thấp'
      if (score <= 3) return 'Trung bình' 
      if (score <= 4) return 'Cao'
      return 'Rất cao'
    }

    const getPerformanceClass = () => {
      const level = getPerformanceLevel()
      switch(level) {
        case 'Thấp': return 'text-green-400'
        case 'Trung bình': return 'text-yellow-400'
        case 'Cao': return 'text-orange-400'
        case 'Rất cao': return 'text-red-400'
        default: return 'text-gray-400'
      }
    }
    
    const saveAndClose = () => {
      // All settings are already updated in real-time via gameStore
      // Just show confirmation and close
      showSaveConfirmation.value = true
      
      // Play confirmation sound and close
      testEffect()
      
      setTimeout(() => {
        emit('close')
      }, 500)
    }
    
    // Load saved settings on mount
    const loadSettings = () => {
      try {
        if (gameStore.settings) {
          Object.assign(localSettings, gameStore.settings)
        }
      } catch (error) {
        console.warn('Failed to load settings:', error)
        resetToDefaults()
      }
    }
    
    onMounted(() => {
      loadSettings()
    })
    
    return {
      localSettings,
      showSaveConfirmation,
      updateSoundEnabled,
      updateMusicVolume,
      updateEffectVolume,
      updateDifficulty,
      updateControls,
      updateDisplay,
      testMusic,
      testEffect,
      getPerformanceLevel,
      getPerformanceClass,
      resetToDefaults,
      saveAndClose
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
  @apply bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-600 max-w-2xl w-full mx-4 max-h-screen overflow-hidden;
}

.modal-header {
  @apply relative p-6 pb-4 text-center border-b border-gray-700;
}

.close-btn {
  @apply absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200;
}

.modal-body {
  @apply p-6 max-h-96 overflow-y-auto space-y-6;
}

.modal-footer {
  @apply p-6 pt-4 border-t border-gray-700 flex justify-between;
}

.settings-section {
  @apply space-y-4;
}

.section-title {
  @apply text-xl font-bold text-white mb-4 pb-2 border-b border-gray-600;
}

.setting-item {
  @apply space-y-2;
}

.setting-label {
  @apply flex items-center justify-between text-white;
}

.setting-checkbox {
  @apply w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2;
}

.setting-slider {
  @apply w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer;
}

.setting-slider::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-blue-500 rounded-full cursor-pointer;
}

.setting-slider::-moz-range-thumb {
  @apply w-4 h-4 bg-blue-500 rounded-full cursor-pointer border-none;
}

.setting-select {
  @apply bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.volume-display {
  @apply text-gray-300 text-sm font-mono min-w-[3rem] text-right;
}

.reset-btn {
  @apply bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200;
}

.save-btn {
  @apply bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200;
}

.save-confirmation {
  @apply bg-green-600 text-white p-3 rounded-lg text-center font-semibold animate-pulse;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .modal-content {
    @apply mx-2;
  }
  
  .modal-header h2 {
    @apply text-2xl;
  }
  
  .modal-header p {
    @apply text-sm;
  }
  
  .section-title {
    @apply text-lg;
  }
  
  .setting-label {
    @apply flex-col items-start space-y-2;
  }
  
  .setting-slider {
    @apply w-full;
  }
  
  .modal-footer {
    @apply flex-col space-y-2;
  }
  
  .reset-btn,
  .save-btn {
    @apply w-full;
  }
}
</style>
