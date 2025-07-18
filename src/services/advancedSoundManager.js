import * as Tone from 'tone'

class AdvancedSoundManager {
  constructor() {
    this.enabled = true
    this.musicVolume = 0.5
    this.effectVolume = 0.7
    this.initialized = false
    this.synthPresets = {}
    
    // Add sound throttling to prevent lag
    this.lastSoundTime = {}
    this.soundThrottle = {
      shoot: 50,        // Minimum 50ms between shoot sounds
      chickenHit: 30,   // Minimum 30ms between hit sounds
      explosion: 100,   // Minimum 100ms between explosions
      powerUp: 200,     // Minimum 200ms between power-up sounds
      default: 20       // Default throttle for other sounds
    }
    
    this.init()
  }

  async init() {
    if (this.initialized) return
    
    try {
      // Initialize Tone.js
      await Tone.start()
      // Silent initialization
      
      // Create synthesizers for different sound effects
      this.synthPresets = {
        shoot: new Tone.MonoSynth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
        }).toDestination(),
        
        explosion: new Tone.NoiseSynth({
          noise: { type: 'brown' },
          envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3 }
        }).toDestination(),
        
        powerUp: new Tone.PluckSynth({
          attackNoise: 1,
          dampening: 4000,
          resonance: 0.7
        }).toDestination(),
        
        levelUp: new Tone.FMSynth({
          harmonicity: 3,
          modulationIndex: 10,
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 }
        }).toDestination(),
        
        gameOver: new Tone.AMSynth({
          harmonicity: 2,
          detune: 0,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.1, decay: 0.3, sustain: 0.3, release: 1 }
        }).toDestination(),
        
        boss: new Tone.FatOscillator({
          type: 'sawtooth',
          spread: 30,
          count: 3
        }).toDestination()
      }
      
      // Create background music loop
      this.createBackgroundMusic()
      
      this.initialized = true
      // Silent initialization success
    } catch (error) {
      // Silent error handling
      this.initialized = false
    }
  }

  createBackgroundMusic() {
    try {
      // Create a simple ambient background music
      const reverb = new Tone.Reverb(4).toDestination()
      const delay = new Tone.PingPongDelay('8n', 0.2).connect(reverb)
      
      this.backgroundSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 1, decay: 1, sustain: 0.5, release: 2 }
      }).connect(delay)
      
      // Simple chord progression - using valid note names only
      this.musicPattern = new Tone.Pattern((time, note) => {
        this.backgroundSynth.triggerAttackRelease(note, '2n', time)
      }, ['C4', 'G3', 'F4', 'A3'], 'up')
      
      this.musicPattern.interval = '1n'
      // Silent music creation
    } catch (error) {
      // Silent error handling
      this.musicPattern = null
      this.backgroundSynth = null
    }
  }

  play(soundName, volume = 1) {
    // Remove console.log to reduce lag and spam
    if (!this.enabled || !this.initialized) {
      return
    }

    // Throttle sounds to prevent lag and spam
    const now = Date.now()
    const throttleTime = this.soundThrottle[soundName] || this.soundThrottle.default
    
    if (this.lastSoundTime[soundName] && (now - this.lastSoundTime[soundName]) < throttleTime) {
      return // Skip this sound to prevent spam
    }
    
    this.lastSoundTime[soundName] = now

    try {
      const effectiveVolume = this.effectVolume * volume

      switch (soundName) {
        case 'shoot':
        case 'buttonClick':
          this.synthPresets.shoot.volume.value = Tone.gainToDb(effectiveVolume)
          this.synthPresets.shoot.triggerAttackRelease('C5', '16n')
          break

        case 'explosion':
        case 'chickenHit':
          this.synthPresets.explosion.volume.value = Tone.gainToDb(effectiveVolume)
          this.synthPresets.explosion.triggerAttackRelease('8n')
          break

        case 'powerUp':
          this.synthPresets.powerUp.volume.value = Tone.gainToDb(effectiveVolume)
          this.synthPresets.powerUp.triggerAttackRelease('E5', '4n')
          break

        case 'levelUp':
          this.synthPresets.levelUp.volume.value = Tone.gainToDb(effectiveVolume)
          this.synthPresets.levelUp.triggerAttackRelease('C5', '2n')
          setTimeout(() => {
            this.synthPresets.levelUp.triggerAttackRelease('E5', '2n')
          }, 200)
          setTimeout(() => {
            this.synthPresets.levelUp.triggerAttackRelease('G5', '2n')
          }, 400)
          break

        case 'gameOver':
        case 'playerHit':
          this.synthPresets.gameOver.volume.value = Tone.gainToDb(effectiveVolume)
          this.synthPresets.gameOver.triggerAttackRelease('C3', '1n')
          break

        case 'bossAppear':
        case 'bossHit':
          this.synthPresets.boss.volume.value = Tone.gainToDb(effectiveVolume)
          this.synthPresets.boss.frequency.value = 80
          this.synthPresets.boss.start()
          setTimeout(() => {
            this.synthPresets.boss.stop()
          }, 300)
          break

        default:
          console.log('Unknown sound:', soundName)
      }
    } catch (error) {
      console.warn('Failed to play sound:', soundName, error)
    }
  }

  playMusic() {
    if (!this.enabled || !this.initialized) {
      console.log('Music not enabled or not initialized')
      return
    }
    
    try {
      if (this.musicPattern && this.backgroundSynth && Tone.Transport.state !== 'started') {
        this.backgroundSynth.volume.value = Tone.gainToDb(this.musicVolume * 0.3)
        this.musicPattern.start(0)
        Tone.Transport.start()
        console.log('Background music started')
      } else if (!this.musicPattern) {
        console.log('Music pattern not available')
      } else if (!this.backgroundSynth) {
        console.log('Background synth not available')
      } else {
        console.log('Transport already started or other issue')
      }
    } catch (error) {
      console.warn('Failed to start background music:', error)
    }
  }

  stopMusic() {
    try {
      if (this.musicPattern) {
        this.musicPattern.stop()
      }
      if (Tone.Transport.state === 'started') {
        Tone.Transport.stop()
      }
      console.log('Background music stopped')
    } catch (error) {
      console.warn('Failed to stop background music:', error)
    }
  }

  pauseMusic() {
    try {
      Tone.Transport.pause()
    } catch (error) {
      console.warn('Failed to pause music:', error)
    }
  }

  resumeMusic() {
    try {
      Tone.Transport.start()
    } catch (error) {
      console.warn('Failed to resume music:', error)
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.backgroundSynth) {
      this.backgroundSynth.volume.value = Tone.gainToDb(this.musicVolume * 0.3)
    }
  }

  setSoundVolume(volume) {
    this.effectVolume = Math.max(0, Math.min(1, volume))
  }

  // Alias for compatibility
  setEffectVolume(volume) {
    this.setSoundVolume(volume)
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

  // Get current settings
  getSettings() {
    return {
      enabled: this.enabled,
      musicVolume: this.musicVolume,
      effectVolume: this.effectVolume,
      initialized: this.initialized
    }
  }

  enable() {
    console.log('Enabling advanced sound manager...')
    this.enabled = true
    
    if (typeof Howl !== 'undefined') {
      console.log('Howler.js is available')
      // Initialize Howler sounds if needed
      this.initializeHowlerSounds()
    } else {
      console.warn('Howler.js not available, using synthesized sounds')
    }
    
    // Initialize synthesizers
    this.initializeSynthesizers()
  }

  initializeHowlerSounds() {
    console.log('Initializing Howler.js sounds...')
    // Placeholder for Howler.js sound initialization
    // This can be extended to load actual sound files
  }

  initializeSynthesizers() {
    console.log('Initializing synthesizers...')
    if (typeof Tone !== 'undefined' && !this.initialized) {
      try {
        this.init() // Call existing init method
        console.log('Synthesizers initialized successfully')
      } catch (error) {
        console.error('Failed to initialize synthesizers:', error)
      }
    }
  }

  disable() {
    this.enabled = false
    Tone.Master.mute = true
    this.stopMusic()
    console.log('Advanced sound manager disabled')
  }

  toggle() {
    if (this.enabled) {
      this.disable()
    } else {
      this.enable()
      this.playMusic()
    }
  }
}

export const advancedSoundManager = new AdvancedSoundManager()
