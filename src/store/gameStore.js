import { reactive } from 'vue'
import dbConfig from '../config/database.js'
import { databaseService } from '../services/databaseService.js'

export const gameStore = reactive({
  // Player info
  playerName: '',
  sessionStarted: false,
  
  // Game state
  gameStarted: false,
  gameOver: false,
  paused: false,
  isPlaying: false,
  level: 1,
  score: 0,
  lives: 3,
  chickensKilledThisLevel: 0,
  // Số gà cần giết tăng mạnh hơn để phù hợp với spawn nhiều hơn
  getChickensRequired() {
    // Level 1: 25 gà, Level 2: 35 gà, Level 3: 50 gà, Level 5: 80 gà
    return Math.floor(25 + (this.level * 10) + Math.pow(this.level, 1.5) * 2)
  },
  
  // Difficulty scaling
  difficulty: {
    chickenSpeed: 1.5, // Tăng tốc độ base từ 1 lên 1.5
    spawnRate: 600, // Giảm từ 800 xuống 600ms để spawn nhanh hơn
    bossLevel: 3, // Boss xuất hiện mỗi 3 level
    speedMultiplier: 1.25, // Tăng từ 1.2 lên 1.25 để tăng tốc độ mạnh hơn
    spawnRateDecrease: 0.7, // Giảm từ 0.75 xuống 0.7 để spawn nhanh hơn mỗi level
    // Settings modifiers
    chickenSpeedMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
    bossHealthMultiplier: 1.0,
    powerUpChanceMultiplier: 1.0
  },
  
  // Game objects
  spaceship: {
    x: 400,
    y: 500,
    width: 60,
    height: 40,
    speed: 5
  },
  
  chickens: [],
  bullets: [],
  explosions: [],
  powerUps: [],
  boss: null,
  
  // Power-ups
  currentWeapon: 'normal',
  powerUpDuration: 0,
  
  // Sound settings
  soundEnabled: true,
  musicVolume: 0.5,
  effectVolume: 0.7,
  
  // Game settings
  settings: {
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
  },
  
  // Leaderboard
  leaderboard: [],
  
  // Screen dimensions (responsive)
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  
  // Methods
  startGame() {
    this.gameStarted = true
    this.gameOver = false
    this.paused = false
    this.isPlaying = true
    this.level = 1
    this.score = 0
    this.lives = 3
    this.chickensKilledThisLevel = 0
    this.chickens = []
    this.bullets = []
    this.explosions = []
    this.powerUps = []
    this.boss = null
    this.currentWeapon = 'normal'
    this.resetDifficulty()
  },
  
  endGame() {
    this.gameStarted = false
    this.gameOver = true
    this.isPlaying = false // Stop all game activity
    this.saveScore()
  },
  
  nextLevel() {
    // Temporarily stop game activity during level transition
    this.isPlaying = false
    
    this.level++
    this.chickensKilledThisLevel = 0 // Reset số gà đã giết
    this.increaseDifficulty()
    this.chickens = []
    this.bullets = []
    this.explosions = []
    this.powerUps = []
    
    // Boss level every 3 levels
    if (this.level % this.difficulty.bossLevel === 0) {
      this.spawnBoss()
    }
    
    // Resume game activity after brief delay for level transition
    setTimeout(() => {
      if (this.gameStarted && !this.paused) {
        this.isPlaying = true
      }
    }, 500) // 500ms delay for level transition
  },
  
  resetDifficulty() {
    this.difficulty.chickenSpeed = 1.5
    this.difficulty.spawnRate = 600
  },
  
  increaseDifficulty() {
    // Tăng tốc độ gà mạnh hơn
    this.difficulty.chickenSpeed *= this.difficulty.speedMultiplier
    
    // Giảm thời gian spawn để có nhiều gà hơn trên màn hình
    this.difficulty.spawnRate *= this.difficulty.spawnRateDecrease
    
    // Giới hạn thời gian spawn tối thiểu thấp hơn để spawn cực nhanh
    if (this.difficulty.spawnRate < 100) { // Giảm từ 150 xuống 100ms
      this.difficulty.spawnRate = 100
    }
    
    console.log(`Level ${this.level}: Spawn rate: ${this.difficulty.spawnRate}ms, Speed: ${this.difficulty.chickenSpeed.toFixed(2)}x, Chickens needed: ${this.getChickensRequired()}`)
  },
  
  spawnBoss() {
    // Boss size và độ khó tăng theo level
    const baseSize = 80
    const sizeIncrease = Math.floor(this.level / 5) * 20 // Tăng size mỗi 5 level
    const bossSize = Math.min(baseSize + sizeIncrease, 200) // Tối đa 200px
    
    this.boss = {
      x: this.screenWidth / 2 - bossSize / 2,
      y: 30,
      width: bossSize,
      height: bossSize,
      health: this.level * 25 + 50, // Tăng mạnh máu theo level (Level 3: 125, Level 6: 200, Level 9: 275)
      maxHealth: this.level * 25 + 50,
      speed: Math.min(1 + this.level * 0.3, 5), // Tăng tốc độ theo level
      direction: 1,
      lastShot: 0,
      shotInterval: Math.max(600 - this.level * 30, 200), // Bắn nhanh hơn theo level
      bulletCount: Math.min(3 + Math.floor(this.level / 2), 10), // Tăng số đạn theo level
      type: 'chicken-boss', // Để nhận diện là boss gà
      level: this.level
    }
    
    console.log(`Boss spawned - Level: ${this.level}, Size: ${bossSize}, Health: ${this.boss.health}, Speed: ${this.boss.speed}`)
  },
  
  addScore(points) {
    this.score += points * this.level
    // Cập nhật số gà đã giết nếu giết gà
    if (points === 10) { // 10 điểm = giết 1 con gà
      this.chickensKilledThisLevel++
    }
  },
  
  takeDamage() {
    this.lives--
    if (this.lives <= 0) {
      this.endGame()
    }
  },
  
  addLife() {
    if (this.lives < 5) {
      this.lives++
    }
  },
  
  async saveScore() {
    const scoreData = {
      playerName: this.playerName,
      score: this.score,
      level: this.level,
      timestamp: new Date().toISOString()
    }
    
    try {
      // Sử dụng databaseService để lưu điểm
      const result = await databaseService.saveScore(scoreData)
      if (result.success) {
        console.log('Score saved successfully:', result.local ? 'localStorage' : 'database')
      }
    } catch (error) {
      console.error('Failed to save score:', error)
    }
    
    // Tải lại bảng xếp hạng
    this.loadLeaderboard()
  },
  
  async loadLeaderboard() {
    try {
      // Sử dụng databaseService để tải bảng xếp hạng
      const scores = await databaseService.getLeaderboard(10)
      
      // Thêm ranking cho mỗi điểm số
      this.leaderboard = scores.map((score, index) => ({
        ...score,
        rank: index + 1
      }))
      
      console.log('Leaderboard loaded:', this.leaderboard.length, 'scores')
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
      this.leaderboard = []
    }
  },
  
  updateScreenSize() {
    this.screenWidth = window.innerWidth
    this.screenHeight = window.innerHeight
    
    // Adjust spaceship position if out of bounds
    if (this.spaceship.x > this.screenWidth - this.spaceship.width) {
      this.spaceship.x = this.screenWidth - this.spaceship.width
    }
    if (this.spaceship.y > this.screenHeight - this.spaceship.height) {
      this.spaceship.y = this.screenHeight - this.spaceship.height
    }
  },

  // Settings management methods
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('chicken_game_settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        this.settings = { ...this.settings, ...parsed }
        
        // Sync with top-level sound settings
        this.soundEnabled = this.settings.soundEnabled
        this.musicVolume = this.settings.musicVolume
        this.effectVolume = this.settings.effectVolume
        
        this.applyDifficultySettings()
        console.log('Settings loaded successfully')
      }
    } catch (error) {
      console.warn('Failed to load settings:', error)
      this.resetSettingsToDefaults()
    }
  },

  saveSettings() {
    try {
      // Sync top-level settings with settings object
      this.settings.soundEnabled = this.soundEnabled
      this.settings.musicVolume = this.musicVolume
      this.settings.effectVolume = this.effectVolume
      
      localStorage.setItem('chicken_game_settings', JSON.stringify(this.settings))
      console.log('Settings saved successfully')
    } catch (error) {
      console.warn('Failed to save settings:', error)
    }
  },

  updateSetting(key, value) {
    if (this.settings.hasOwnProperty(key)) {
      this.settings[key] = value
      
      // Apply special settings immediately
      if (key === 'soundEnabled') {
        this.soundEnabled = value
        this.applySoundSettings()
      } else if (key === 'musicVolume') {
        this.musicVolume = value
        this.applySoundSettings()
      } else if (key === 'effectVolume') {
        this.effectVolume = value
        this.applySoundSettings()
      } else if (key === 'difficultyMode') {
        this.applyDifficultySettings()
      }
      
      this.saveSettings()
    }
  },

  applySoundSettings() {
    try {
      // Apply to sound managers if they exist
      if (typeof window !== 'undefined') {
        // Dynamic import to avoid circular dependencies
        if (window.advancedSoundManager) {
          if (this.soundEnabled) {
            window.advancedSoundManager.enable()
          } else {
            window.advancedSoundManager.disable()
          }
          window.advancedSoundManager.setMusicVolume(this.musicVolume)
          window.advancedSoundManager.setSoundVolume(this.effectVolume)
        }
        
        if (window.soundManager) {
          if (this.soundEnabled) {
            window.soundManager.enable()
          } else {
            window.soundManager.disable()
          }
          window.soundManager.setMusicVolume(this.musicVolume)
          window.soundManager.setEffectVolume(this.effectVolume)
        }
      }
    } catch (error) {
      console.warn('Failed to apply sound settings:', error)
    }
  },

  applyDifficultySettings() {
    const difficultyConfigs = {
      easy: {
        chickenSpeedMultiplier: 0.8,
        spawnRateMultiplier: 1.5,
        bossHealthMultiplier: 0.7,
        powerUpChanceMultiplier: 1.5
      },
      normal: {
        chickenSpeedMultiplier: 1.0,
        spawnRateMultiplier: 1.0,
        bossHealthMultiplier: 1.0,
        powerUpChanceMultiplier: 1.0
      },
      hard: {
        chickenSpeedMultiplier: 1.3,
        spawnRateMultiplier: 0.8,
        bossHealthMultiplier: 1.5,
        powerUpChanceMultiplier: 0.8
      },
      extreme: {
        chickenSpeedMultiplier: 1.6,
        spawnRateMultiplier: 0.6,
        bossHealthMultiplier: 2.0,
        powerUpChanceMultiplier: 0.6
      }
    }

    const config = difficultyConfigs[this.settings.difficultyMode] || difficultyConfigs.normal
    Object.assign(this.difficulty, config)
    
    console.log(`Difficulty applied: ${this.settings.difficultyMode}`, config)
  },

  resetSettingsToDefaults() {
    this.settings = {
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
    }
    
    // Sync with top-level settings
    this.soundEnabled = true
    this.musicVolume = 0.5
    this.effectVolume = 0.7
    
    this.applyDifficultySettings()
    this.applySoundSettings()
    this.saveSettings()
    
    console.log('Settings reset to defaults')
  },

  // Gameplay helper methods
  getAutoFireInterval() {
    const intervals = {
      slow: 400,
      normal: 250,
      fast: 150,
      rapid: 100
    }
    return intervals[this.settings.autoFireRate] || 250
  },

  getEffectiveMouseSensitivity() {
    return this.settings.mouseSensitivity || 1.0
  },

  shouldShowFPS() {
    return this.settings.showFPS
  },

  shouldUseScreenShake() {
    return this.settings.screenShake
  },

  getParticleQualityLevel() {
    return this.settings.particleQuality || 'high'
  },

  shouldShowBackgroundAnimations() {
    return this.settings.backgroundAnimations
  }
})

// Load leaderboard on initialization
gameStore.loadLeaderboard()

// Load settings on initialization
gameStore.loadSettings()

// Listen for window resize
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    gameStore.updateScreenSize()
  })
  
  // Expose gameStore to window for sound managers
  window.gameStore = gameStore
}
