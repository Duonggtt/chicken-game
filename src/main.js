import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// Import animate.css
import 'animate.css'

// Import sound managers
import { soundManager } from './services/soundManager.js'
import { advancedSoundManager } from './services/advancedSoundManager.js'

// Debug audio libraries
console.log('Checking audio libraries...')
console.log('Tone available:', typeof Tone !== 'undefined')
console.log('Howl available:', typeof Howl !== 'undefined')

// Try to load Tone.js if not available
if (typeof Tone === 'undefined') {
  console.log('Loading Tone.js...')
  import('tone').then((ToneModule) => {
    window.Tone = ToneModule.default || ToneModule
    console.log('Tone.js loaded:', typeof window.Tone !== 'undefined')
  }).catch(error => {
    console.error('Failed to load Tone.js:', error)
  })
}

// Expose sound managers to window for settings modal
window.soundManager = soundManager
window.advancedSoundManager = advancedSoundManager

const app = createApp(App)

app.mount('#app')
