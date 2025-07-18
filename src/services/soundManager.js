import { Howl, Howler } from 'howler'

class SoundManager {
  constructor() {
    this.sounds = {}
    this.music = null
    this.enabled = true
    this.musicVolume = 0.5
    this.effectVolume = 0.7
    
    // Add sound throttling to prevent lag
    this.lastSoundTime = {}
    this.soundThrottle = {
      shoot: 50,        // Minimum 50ms between shoot sounds
      chickenHit: 30,   // Minimum 30ms between hit sounds
      explosion: 100,   // Minimum 100ms between explosions
      powerUp: 200,     // Minimum 200ms between power-up sounds
      default: 20       // Default throttle for other sounds
    }
    
    this.initSounds()
  }
  
  initSounds() {
    // Remove console.log to reduce noise
    
    // Try to load audio files, fallback to synthetic sounds
    try {
      // Background music
      this.music = new Howl({
        src: ['/sounds/background-music.mp3'],
        loop: true,
        volume: this.musicVolume,
        html5: true,
        onloaderror: () => {
          // Silent fallback - no console.log
          this.music = null
        }
      })
      
      // Sound effects with fallback
      const soundFiles = {
        shoot: '/sounds/shoot.wav',
        explosion: '/sounds/explosion.wav',
        chickenHit: '/sounds/chicken-hit.wav',
        powerUp: '/sounds/power-up.wav',
        levelUp: '/sounds/level-up.wav',
        gameOver: '/sounds/game-over.wav',
        bossAppear: '/sounds/boss-appear.wav',
        bossHit: '/sounds/boss-hit.wav',
        playerHit: '/sounds/player-hit.wav',
        buttonClick: '/sounds/button-click.wav'
      }
      
      this.sounds = {}
      for (const [name, src] of Object.entries(soundFiles)) {
        this.sounds[name] = new Howl({
          src: [src],
          volume: this.effectVolume,
          html5: true,
          onloaderror: () => {
            // Silent fallback - no console.log
            this.sounds[name] = null
          }
        })
      }
    } catch (error) {
      // Silent error handling
      this.music = null
      this.sounds = {}
    }
  }
  
  play(soundType) {
    // Remove excessive logging and add throttling
    if (!this.enabled) return
    
    // Throttle sounds to prevent lag and spam
    const now = Date.now()
    const throttleTime = this.soundThrottle[soundType] || this.soundThrottle.default
    
    if (this.lastSoundTime[soundType] && (now - this.lastSoundTime[soundType]) < throttleTime) {
      return // Skip this sound to prevent spam
    }
    
    this.lastSoundTime[soundType] = now
    
    try {
      if (typeof Tone !== 'undefined') {
        switch (soundType) {
          case 'shoot':
            this.playSynth(800, 0.1)
            break
          case 'explosion':
            this.playNoise(0.5, 0.3)
            break
          case 'powerup':
            this.playSynth(1200, 0.2)
            this.playSynth(1500, 0.2, 0.1)
            break
          case 'buttonClick':
            this.playSynth(600, 0.05)
            break
          case 'gameOver':
            this.playNoise(200, 1)
            break
          default:
            // Skip unknown sound types silently
            break
        }
      }
    } catch (error) {
      // Silent error handling to prevent console spam
    }
  }
  
  playMusic() {
    if (!this.enabled) return
    
    if (this.music && this.music.play && !this.music.playing()) {
      this.music.play()
    } else {
      console.log('Playing synthetic background music')
      // Could implement synthetic background music here
    }
  }
  
  stopMusic() {
    if (this.music && this.music.playing()) {
      this.music.stop()
    }
  }
  
  pauseMusic() {
    if (this.music && this.music.playing()) {
      this.music.pause()
    }
  }
  
  resumeMusic() {
    if (this.music && !this.music.playing()) {
      this.music.play()
    }
  }
  
  setMusicVolume(volume) {
    this.musicVolume = volume
    if (this.music) {
      this.music.volume(volume)
    }
  }
  
  setEffectVolume(volume) {
    this.effectVolume = volume
    Object.values(this.sounds).forEach(sound => {
      if (sound && typeof sound.volume === 'function') {
        sound.volume(volume)
      }
    })
  }

  // Alias for compatibility
  setSoundVolume(volume) {
    this.setEffectVolume(volume)
  }

  setMusicEnabled(enabled) {
    if (enabled && this.enabled) {
      this.playMusic()
    } else {
      this.stopMusic()
    }
  }

  setEffectEnabled(enabled) {
    // Effects are controlled by the main enabled flag
    // Individual effect muting could be implemented here if needed
  }

  // Global mute/unmute
  mute() {
    Howler.mute(true)
  }

  unmute() {
    Howler.mute(false)
  }

  // Get current settings
  getSettings() {
    return {
      enabled: this.enabled,
      musicVolume: this.musicVolume,
      effectVolume: this.effectVolume
    }
  }
  
  enable() {
    console.log('Enabling basic sound manager...')
    this.enabled = true
    
    // Test if Tone is working
    if (typeof Tone !== 'undefined' && Tone.context) {
      console.log('Tone.js context state:', Tone.context.state)
      if (Tone.context.state === 'suspended') {
        console.log('Resuming Tone.js context...')
        Tone.context.resume().then(() => {
          console.log('Tone.js context resumed successfully')
        }).catch(error => {
          console.error('Failed to resume Tone.js context:', error)
        })
      }
    } else {
      console.warn('Tone.js not available')
    }
  }
  
  disable() {
    this.enabled = false
    Howler.mute(true)
    this.stopMusic()
    console.log('Sound manager disabled')
  }
  
  toggle() {
    this.enabled = !this.enabled
    if (!this.enabled) {
      this.stopMusic()
      Howler.mute(true)
    } else {
      Howler.mute(false)
      this.playMusic()
    }
  }
  
  playSyntheticSound(soundName) {
    try {
      console.log('Playing synthetic sound:', soundName)
      this.generateSynthSound(soundName)
    } catch (error) {
      console.warn('Failed to play synthetic sound:', error)
    }
  }
  
  // Generate sound effects programmatically for missing audio files
  generateSynthSound(type) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      switch (type) {
        case 'shoot':
        case 'buttonClick':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
          oscillator.stop(audioContext.currentTime + 0.1)
          break
          
        case 'explosion':
        case 'chickenHit':
          oscillator.frequency.setValueAtTime(100, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1)
          oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3)
          gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
          oscillator.stop(audioContext.currentTime + 0.3)
          break
          
        case 'powerUp':
        case 'levelUp':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
          oscillator.stop(audioContext.currentTime + 0.2)
          break
          
        case 'gameOver':
        case 'playerHit':
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5)
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          oscillator.stop(audioContext.currentTime + 0.5)
          break
          
        case 'bossAppear':
        case 'bossHit':
          oscillator.frequency.setValueAtTime(80, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3)
          gainNode.gain.setValueAtTime(0.6, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
          oscillator.stop(audioContext.currentTime + 0.3)
          break
          
        default:
          // Default sound
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
          oscillator.stop(audioContext.currentTime + 0.1)
      }
      
      oscillator.start(audioContext.currentTime)
    } catch (error) {
      console.warn('Failed to generate synthetic sound:', error)
    }
  }
}

export const soundManager = new SoundManager()
