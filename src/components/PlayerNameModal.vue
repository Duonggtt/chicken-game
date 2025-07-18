<template>
  <div class="modal-overlay">
    <div class="modal-content animate__animated animate__bounceIn">
      <div class="modal-header">
        <h2 class="text-3xl font-bold text-white mb-2">Welcome, Player! 👋</h2>
        <p class="text-gray-300 mb-6">Enter your name to begin your epic adventure</p>
      </div>
      
      <form @submit.prevent="submitName" class="modal-body">
        <div class="input-group">
          <label for="playerName" class="input-label">Player Name</label>
          <input
            id="playerName"
            v-model="playerName"
            type="text"
            class="name-input"
            :class="{ 'error': showError }"
            placeholder="Enter your name..."
            maxlength="20"
            required
            autofocus
            @input="checkNameAvailability"
          >
          
          <!-- Error message -->
          <div v-if="showError" class="error-message">
            ⚠️ This name is already taken! Try one of these:
          </div>
          
          <!-- Name suggestions -->
          <div v-if="showSuggestions && suggestions.length > 0" class="suggestions">
            <p class="suggestions-label">💡 Suggested names:</p>
            <div class="suggestion-buttons">
              <button 
                v-for="suggestion in suggestions" 
                :key="suggestion"
                type="button"
                @click="selectSuggestion(suggestion)"
                class="suggestion-btn"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="button-group">
          <button 
            type="submit" 
            class="submit-btn"
            :class="{ 'disabled': !playerName.trim() || showError }"
            :disabled="!playerName.trim() || showError"
          >
            <span v-if="!showError">🚀 Start Adventure</span>
            <span v-else>⚠️ Choose Different Name</span>
          </button>
          
          <button 
            type="button" 
            @click="$emit('close')"
            class="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
      
      <div class="modal-footer">
        <p class="text-sm text-gray-400">
          💡 Tip: Choose a cool name for the leaderboard!
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { gameStore } from '../store/gameStore.js'

export default {
  name: 'PlayerNameModal',
  emits: ['save-name', 'close'],
  setup(props, { emit }) {
    const playerName = ref('')
    const showError = ref(false)
    const showSuggestions = ref(false)
    
    // Get existing names from leaderboard
    const existingNames = computed(() => {
      try {
        return gameStore.leaderboard.map(entry => entry.playerName.toLowerCase())
      } catch (error) {
        console.warn('Error getting existing names:', error)
        return []
      }
    })
    
    // Generate name suggestions
    const suggestions = computed(() => {
      if (!playerName.value.trim()) return []
      
      const baseName = playerName.value.trim()
      const suggestions = []
      
      // Add numbers
      for (let i = 1; i <= 5; i++) {
        const suggestion = `${baseName}${i}`
        if (!existingNames.value.includes(suggestion.toLowerCase())) {
          suggestions.push(suggestion)
        }
      }
      
      // Add prefixes/suffixes
      const modifiers = ['Pro', 'Master', 'Elite', 'Super', 'Mega']
      for (const modifier of modifiers) {
        const suggestion1 = `${modifier}${baseName}`
        const suggestion2 = `${baseName}${modifier}`
        
        if (!existingNames.value.includes(suggestion1.toLowerCase()) && suggestions.length < 6) {
          suggestions.push(suggestion1)
        }
        if (!existingNames.value.includes(suggestion2.toLowerCase()) && suggestions.length < 6) {
          suggestions.push(suggestion2)
        }
      }
      
      return suggestions.slice(0, 6) // Limit to 6 suggestions
    })
    
    const checkNameAvailability = () => {
      const name = playerName.value.trim().toLowerCase()
      const isNameTaken = existingNames.value.includes(name)
      
      showError.value = isNameTaken
      showSuggestions.value = isNameTaken && suggestions.value.length > 0
    }
    
    const selectSuggestion = (suggestion) => {
      playerName.value = suggestion
      showError.value = false
      showSuggestions.value = false
    }
    
    const submitName = () => {
      const name = playerName.value.trim()
      if (!name) return
      
      // Check if name is taken
      if (existingNames.value.includes(name.toLowerCase())) {
        showError.value = true
        showSuggestions.value = true
        return
      }
      
      emit('save-name', name)
    }
    
    return {
      playerName,
      showError,
      showSuggestions,
      suggestions,
      submitName,
      checkNameAvailability,
      selectSuggestion
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
  @apply bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-600 max-w-md w-full mx-4;
}

.modal-header {
  @apply p-6 pb-0 text-center;
}

.modal-body {
  @apply p-6;
}

.modal-footer {
  @apply p-6 pt-0 text-center;
}

.input-group {
  @apply mb-6;
}

.input-label {
  @apply block text-white text-sm font-semibold mb-2;
}

.name-input {
  @apply w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200;
}

.name-input:focus {
  @apply shadow-lg;
}

/* Error and suggestion styles */
.name-input.error {
  border: 2px solid #ef4444;
  background-color: #fee2e2;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.suggestions {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #1f2937, #374151);
  border-radius: 0.75rem;
  border: 1px solid #4b5563;
}

.suggestions-label {
  color: #60a5fa;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-btn {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button-group {
  @apply flex flex-col space-y-3;
}

.submit-btn {
  @apply w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100;
}

.submit-btn.disabled {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
  cursor: not-allowed;
  opacity: 0.7;
}

.submit-btn.disabled:hover {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  @apply w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200;
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .modal-content {
    @apply mx-2;
  }
  
  .modal-header h2 {
    @apply text-2xl;
  }
  
  .modal-header p {
    @apply text-sm;
  }
}
</style>
