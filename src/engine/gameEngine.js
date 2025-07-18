import { gameStore } from '../store/gameStore.js'
import { soundManager } from '../services/soundManager.js'
import { advancedSoundManager } from '../services/advancedSoundManager.js'
import { bulletEffects } from '../services/bulletEffects.js'

export class GameEngine {
  constructor() {
    this.lastTime = 0
    this.lastChickenSpawn = 0
    this.lastPowerUpSpawn = 0
    this.animationId = null
    this.mouseX = 0
    this.mouseY = 0
    this.targetX = 0
    this.targetY = 0
    this.autoShootInterval = null
    this.lastMouseUpdate = 0
    
    // Mobile optimization - Aggressive performance settings
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    this.isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*\bSafari\b)/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    
    // Enhanced performance settings for intensive gameplay
    this.mouseMoveThrottle = this.isMobile ? 12 : 6 // More responsive for fast gameplay
    this.gameLoopThrottle = this.isMobile ? 40 : 25 // 25fps mobile, 40fps desktop for smoother action
    this.maxExplosions = this.isMobile ? 5 : 12 // More explosions for visual impact
    this.maxBullets = this.isMobile ? 25 : 80 // More bullets for intense gameplay
    this.particleCount = this.isMobile ? 0.3 : 0.8 // More particles for better effects
    this.maxChickens = this.isMobile ? 15 : 35 // Allow more chickens for challenge
    
    // Frame skipping for very low-end devices
    this.frameSkip = this.isMobile ? 2 : 1
    this.frameCounter = 0
    
    this.init()
  }
  
  init() {
    this.setupEventListeners()
    this.startAutoShoot()
  }
  
  setupEventListeners() {
    // High priority mouse movement for spaceship control - much more responsive
    document.addEventListener('mousemove', (e) => {
      const now = Date.now()
      if (now - this.lastMouseUpdate < this.mouseMoveThrottle) return
      this.lastMouseUpdate = now
      
      const gameArea = document.getElementById('game-area') || document.querySelector('.game-area')
      if (!gameArea) return
      
      const rect = gameArea.getBoundingClientRect()
      this.targetX = e.clientX - rect.left
      this.targetY = e.clientY - rect.top
    }, { passive: true, capture: true }) // Use capture for higher priority
    
    // Touch events for mobile with much better responsiveness
    document.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const now = Date.now()
      if (now - this.lastMouseUpdate < this.mouseMoveThrottle) return
      this.lastMouseUpdate = now
      
      const gameArea = document.getElementById('game-area') || document.querySelector('.game-area')
      if (!gameArea) return
      
      const rect = gameArea.getBoundingClientRect()
      const touch = e.touches[0]
      this.targetX = touch.clientX - rect.left
      this.targetY = touch.clientY - rect.top
    }, { passive: false, capture: true }) // Use capture for higher priority
    
    // Resize handler
    window.addEventListener('resize', () => {
      gameStore.updateScreenSize()
    })
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', (e) => e.preventDefault())
  }
  
  updateSpaceshipPosition() {
    if (!gameStore.gameStarted) return
    
    const spaceship = gameStore.spaceship
    const margin = 10
    
    // More responsive interpolation with level-based speed boost
    const levelSpeedBonus = 1 + (gameStore.level * 0.03) // 3% faster each level
    const baseLerpFactor = this.isMobile ? 0.4 : 0.6
    const lerpFactor = Math.min(baseLerpFactor * levelSpeedBonus, 0.95) // Max 0.95 for stability
    
    // Calculate target position with boundaries
    const targetX = Math.max(margin, Math.min(this.targetX - spaceship.width / 2, gameStore.screenWidth - spaceship.width - margin))
    const targetY = Math.max(margin, Math.min(this.targetY - spaceship.height / 2, gameStore.screenHeight - spaceship.height - margin))
    
    // Much more responsive movement with smaller deadzone
    const deltaX = targetX - spaceship.x
    const deltaY = targetY - spaceship.y
    const deadzone = 0.5 // Smaller deadzone for more responsive movement
    
    if (Math.abs(deltaX) > deadzone) {
      spaceship.x += deltaX * lerpFactor
    } else {
      spaceship.x = targetX // Snap to position if very close
    }
    
    if (Math.abs(deltaY) > deadzone) {
      spaceship.y += deltaY * lerpFactor
    } else {
      spaceship.y = targetY // Snap to position if very close
    }
    
    // Update mouse position for reference
    this.mouseX = this.targetX
    this.mouseY = this.targetY
  }
  
  startAutoShoot() {
    // Dynamic shooting speed based on level - faster each level
    const levelSpeedBonus = Math.max(0.7, 1 - (gameStore.level * 0.08)) // Faster each level, minimum 0.7x
    const baseInterval = gameStore.currentWeapon === 'rapid' ? 100 : 250 // Base intervals
    const levelAdjustedInterval = baseInterval * levelSpeedBonus
    const shootInterval = this.isMobile ? levelAdjustedInterval * 1.3 : levelAdjustedInterval
    
    this.autoShootInterval = setInterval(() => {
      if (gameStore.gameStarted && !gameStore.paused) {
        this.shoot()
      }
    }, shootInterval)
  }
  
  shoot() {
    // Don't shoot if game is not started
    if (!gameStore.gameStarted) return
    
    const spaceship = gameStore.spaceship
    const weaponType = gameStore.currentWeapon
    
    // Create bullet with enhanced effects
    const bullet = bulletEffects.createBullet(
      spaceship.x + spaceship.width / 2 - 2,
      spaceship.y,
      weaponType
    )
    
    // Check if bullet creation was successful
    if (!bullet) return
    
    // Add to game store for collision detection
    const gameStoreBullet = {
      id: Date.now() + Math.random(),
      x: bullet.x,
      y: bullet.y,
      width: bullet.width,
      height: bullet.height,
      speed: bullet.speed,
      damage: bullet.damage,
      type: weaponType,
      element: bullet.element
    }
    
    gameStore.bullets.push(gameStoreBullet)
    
    // Play weapon sound only once per shot (not per bullet for spread)
    try {
      advancedSoundManager.play('shoot')
    } catch (error) {
      soundManager.play('shoot')
    }
    
    // Multiple bullets for spread weapon
    if (weaponType === 'spread') {
      // Create additional spread bullets
      const spreadBullet1 = bulletEffects.createBullet(
        spaceship.x + spaceship.width / 2 - 22,
        spaceship.y,
        'spread'
      )
      const spreadBullet2 = bulletEffects.createBullet(
        spaceship.x + spaceship.width / 2 + 18,
        spaceship.y,
        'spread'
      )
      
      gameStore.bullets.push(
        {
          id: gameStoreBullet.id + 1,
          x: spreadBullet1.x,
          y: spreadBullet1.y,
          width: spreadBullet1.width,
          height: spreadBullet1.height,
          speed: spreadBullet1.speed,
          damage: spreadBullet1.damage,
          type: 'spread',
          element: spreadBullet1.element
        },
        {
          id: gameStoreBullet.id + 2,
          x: spreadBullet2.x,
          y: spreadBullet2.y,
          width: spreadBullet2.width,
          height: spreadBullet2.height,
          speed: spreadBullet2.speed,
          damage: spreadBullet2.damage,
          type: 'spread',
          element: spreadBullet2.element
        }
      )
    }
  }
  
  start() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    
    // Initialize spaceship position targets
    this.targetX = gameStore.spaceship.x + gameStore.spaceship.width / 2
    this.targetY = gameStore.spaceship.y + gameStore.spaceship.height / 2
    
    // Hide cursor during gameplay
    document.body.style.cursor = 'none'
    
    this.lastTime = performance.now()
    this.gameLoop()
    try {
      advancedSoundManager.playMusic()
    } catch (error) {
      soundManager.playMusic()
    }
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    
    // Show cursor when game stops
    document.body.style.cursor = 'default'
    
    // Clean up bullet effects
    bulletEffects.cleanup()
    
    // Chỉ dừng nhạc nền, không disable sound manager
    try {
      advancedSoundManager.stopMusic()
    } catch (error) {
      soundManager.stopMusic()
    }
    
    // Clear auto shoot interval
    if (this.autoShootInterval) {
      clearInterval(this.autoShootInterval)
      this.autoShootInterval = null
    }
  }
  
  pause() {
    gameStore.paused = true
    gameStore.isPlaying = false
    try {
      advancedSoundManager.pauseMusic()
    } catch (error) {
      soundManager.pauseMusic()
    }
  }

  resume() {
    gameStore.paused = false
    gameStore.isPlaying = true
    try {
      advancedSoundManager.resumeMusic()
    } catch (error) {
      soundManager.resumeMusic()
    }
  }

  gameLoop(currentTime = performance.now()) {
    if (!gameStore.gameStarted) {
      // Stop the game loop if game is not started
      this.stop()
      return
    }
    
    const deltaTime = currentTime - this.lastTime
    
    // More aggressive throttling for mobile
    if (deltaTime < this.gameLoopThrottle) {
      this.animationId = requestAnimationFrame((time) => this.gameLoop(time))
      return
    }
    
    this.lastTime = currentTime
    
    // Frame skipping for very low performance devices
    this.frameCounter++
    if (this.frameCounter % this.frameSkip !== 0) {
      this.animationId = requestAnimationFrame((time) => this.gameLoop(time))
      return
    }
    
    // Always update spaceship position for smooth movement
    this.updateSpaceshipPosition()
    
    if (!gameStore.paused) {
      this.spawnChickens(currentTime)
      this.spawnPowerUps(currentTime)
      this.updateBullets(deltaTime)
      this.updateChickens(deltaTime)
      this.updateBoss(deltaTime)
      this.updateExplosions(deltaTime)
      this.updatePowerUps(deltaTime)
      this.checkCollisions()
      this.checkLevelComplete()
      
      // More aggressive cleanup to prevent memory issues
      this.cleanupArrays()
    }
    
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time))
  }
  
  spawnChickens(currentTime) {
    if (gameStore.boss) return // No chickens during boss fight
    
    // Dramatically increase chicken count each level
    const maxChickensOnScreen = Math.min(
      this.isMobile ? 15 : 35, // Higher base limits
      5 + (gameStore.level * 3) // 3 more chickens per level
    )
    
    if (gameStore.chickens.length >= maxChickensOnScreen) return
    
    // Much faster spawn rate that decreases with level
    const baseSpawnRate = gameStore.difficulty.spawnRate * (gameStore.difficulty.spawnRateMultiplier || 1.0)
    const levelSpawnMultiplier = Math.max(0.3, 1 - (gameStore.level * 0.05)) // 5% faster each level, min 0.3x
    const spawnRate = baseSpawnRate * levelSpawnMultiplier
    
    if (currentTime - this.lastChickenSpawn > spawnRate) {
      // Exponential chicken spawning - double every few levels
      const baseChickens = this.isMobile ? 2 : 4 // Higher base
      const levelMultiplier = Math.floor(1 + Math.pow(gameStore.level, 1.3) * 0.15) // Exponential growth
      const chickensToSpawn = Math.min(
        baseChickens * levelMultiplier,
        this.isMobile ? 8 : 15 // Higher caps
      )
      
      // Create formation patterns for flocking behavior
      const formationTypes = ['line', 'v-formation', 'cluster', 'wave', 'scattered']
      const formation = formationTypes[Math.floor(Math.random() * formationTypes.length)]
      
      this.spawnChickenFormation(formation, chickensToSpawn)
      this.lastChickenSpawn = currentTime
    }
  }
  
  spawnChickenFormation(formation, count) {
    const baseY = -60 - Math.random() * 100
    const centerX = gameStore.screenWidth / 2
    const flockId = Date.now() + Math.random() // Unique flock ID
    
    // Bigger chickens that scale with level
    const baseSize = 50 + Math.floor(gameStore.level * 2) // Start at 50px, grow 2px per level
    const chickenWidth = Math.min(baseSize, 80) // Max 80px width
    const chickenHeight = Math.min(baseSize * 0.75, 60) // Max 60px height
    
    // Enhanced speed that increases with level
    const baseSpeed = gameStore.difficulty.chickenSpeed + (gameStore.level * 0.3)
    
    for (let i = 0; i < count; i++) {
      let x, y, flockRole
      
      switch (formation) {
        case 'line':
          x = (gameStore.screenWidth / (count + 1)) * (i + 1) - chickenWidth / 2
          y = baseY
          flockRole = 'follower'
          break
          
        case 'v-formation':
          const isLeft = i % 2 === 0
          const offset = Math.floor(i / 2) + 1
          x = centerX + (isLeft ? -offset : offset) * 60 - chickenWidth / 2
          y = baseY - offset * 30
          flockRole = i === 0 ? 'leader' : 'follower'
          break
          
        case 'cluster':
          const angle = (i / count) * 2 * Math.PI
          const radius = 80 + Math.random() * 40
          x = centerX + Math.cos(angle) * radius - chickenWidth / 2
          y = baseY + Math.sin(angle) * radius * 0.3
          flockRole = 'follower'
          break
          
        case 'wave':
          x = (gameStore.screenWidth / count) * i + Math.random() * 40 - chickenWidth / 2
          y = baseY + Math.sin((i / count) * Math.PI * 2) * 50
          flockRole = 'follower'
          break
          
        default: // scattered
          x = Math.random() * (gameStore.screenWidth - chickenWidth)
          y = baseY + Math.random() * 100
          flockRole = Math.random() > 0.7 ? 'leader' : 'solo'
          break
      }
      
      const chicken = {
        id: Date.now() + Math.random() + i,
        x: Math.max(0, Math.min(x, gameStore.screenWidth - chickenWidth)),
        y: y,
        width: chickenWidth,
        height: chickenHeight,
        speed: baseSpeed + Math.random() * 1.5, // More speed variation
        health: Math.max(1, Math.floor(gameStore.level / 2) + 1), // Scale health with level
        maxHealth: Math.max(1, Math.floor(gameStore.level / 2) + 1),
        
        // Flocking behavior properties
        flockId: flockId,
        flockRole: flockRole, // 'leader', 'follower', 'solo'
        formation: formation,
        originalIndex: i,
        
        // Enhanced movement properties
        zigzag: Math.random() > 0.5,
        zigzagDirection: Math.random() > 0.5 ? 1 : -1,
        zigzagSpeed: 1 + Math.random() * 2,
        
        // Diving behavior
        isDiving: false,
        diveTarget: null,
        diveSpeed: baseSpeed * 1.8,
        
        // Leader following
        followTarget: null,
        followDistance: 40 + Math.random() * 20
      }
      
      gameStore.chickens.push(chicken)
    }
  }
  
  spawnPowerUps(currentTime) {
    if (currentTime - this.lastPowerUpSpawn > 15000 + Math.random() * 10000) {
      const powerUpTypes = ['rapid', 'spread', 'shield', 'life']
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
      
      const powerUp = {
        id: Date.now() + Math.random(),
        x: Math.random() * (gameStore.screenWidth - 32),
        y: -32,
        width: 32,
        height: 32,
        speed: 2,
        type: type
      }
      
      gameStore.powerUps.push(powerUp)
      this.lastPowerUpSpawn = currentTime
    }
  }
  
  updateBullets(deltaTime) {
    gameStore.bullets = gameStore.bullets.filter(bullet => {
      // Update bullet using enhanced effects manager only for player bullets
      if (bullet.type !== 'enemy') {
        const stillActive = bulletEffects.updateBullet(bullet)
        
        if (!stillActive) {
          return false
        }
        
        // Update position for collision detection (player bullets)
        if (bullet.element && bullet.element.style) {
          bullet.x = parseFloat(bullet.element.style.left) || bullet.x
          bullet.y = parseFloat(bullet.element.style.top) || bullet.y
        }
      } else {
        // Boss/enemy bullets - update position manually with enhanced behavior
        if (bullet.subtype === 'homing' && gameStore.spaceship) {
          // Homing missile behavior
          const player = gameStore.spaceship
          const dx = (player.x + player.width / 2) - bullet.x
          const dy = (player.y + player.height / 2) - bullet.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 0) {
            // Adjust velocity towards player
            const targetVelX = (dx / distance) * bullet.speed
            const targetVelY = (dy / distance) * bullet.speed
            
            bullet.velocityX += (targetVelX - bullet.velocityX) * bullet.homingStrength
            bullet.velocityY += (targetVelY - bullet.velocityY) * bullet.homingStrength
          }
        }
        
        if (bullet.velocityX !== undefined && bullet.velocityY !== undefined) {
          bullet.x += bullet.velocityX * (deltaTime / 16)
          bullet.y += bullet.velocityY * (deltaTime / 16)
        } else {
          bullet.y -= bullet.speed * (deltaTime / 16)
        }
      }
      
      // Remove bullets that are off screen
      const inBounds = bullet.y > -30 && bullet.y < gameStore.screenHeight + 30 && 
                      bullet.x > -30 && bullet.x < gameStore.screenWidth + 30
      
      if (!inBounds) {
        if (bullet.type !== 'enemy' && bullet.element) {
          bulletEffects.removeBullet(bullet)
        }
        return false
      }
      
      return true
    })
  }
  
  updateChickens(deltaTime) {
    gameStore.chickens = gameStore.chickens.filter(chicken => {
      // Advanced flocking behavior with level-based speed
      this.updateChickenFlockBehavior(chicken, deltaTime)
      
      // Basic downward movement with level speed bonus
      const levelSpeedMultiplier = 1 + (gameStore.level * 0.2) // 20% faster each level
      chicken.y += chicken.speed * levelSpeedMultiplier * (deltaTime / 16)
      
      // Enhanced zigzag movement
      if (chicken.zigzag && !chicken.isDiving) {
        const zigzagStrength = chicken.zigzagSpeed * levelSpeedMultiplier
        chicken.x += chicken.zigzagDirection * zigzagStrength * (deltaTime / 16)
        
        // Bounce off walls
        if (chicken.x <= 0 || chicken.x >= gameStore.screenWidth - chicken.width) {
          chicken.zigzagDirection *= -1
        }
        
        // Random direction changes for more organic movement
        if (Math.random() < 0.002) {
          chicken.zigzagDirection *= -1
        }
      }
      
      // Occasional diving behavior towards player
      if (!chicken.isDiving && Math.random() < 0.001 * gameStore.level) {
        chicken.isDiving = true
        chicken.diveTarget = {
          x: gameStore.spaceship.x + gameStore.spaceship.width / 2,
          y: gameStore.spaceship.y
        }
      }
      
      // Execute diving behavior
      if (chicken.isDiving && chicken.diveTarget) {
        const dx = chicken.diveTarget.x - chicken.x
        const dy = chicken.diveTarget.y - chicken.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > 10) {
          chicken.x += (dx / distance) * chicken.diveSpeed * (deltaTime / 16)
          chicken.y += (dy / distance) * chicken.diveSpeed * (deltaTime / 16)
        } else {
          chicken.isDiving = false
          chicken.diveTarget = null
        }
      }
      
      // Remove if off screen
      if (chicken.y > gameStore.screenHeight + 50) {
        return false
      }
      
      return true
    })
  }
  
  updateChickenFlockBehavior(chicken, deltaTime) {
    if (chicken.flockRole === 'solo') return
    
    const flockMates = gameStore.chickens.filter(c => 
      c.flockId === chicken.flockId && c.id !== chicken.id
    )
    
    if (flockMates.length === 0) return
    
    if (chicken.flockRole === 'follower') {
      // Find leader or follow formation
      let target = flockMates.find(c => c.flockRole === 'leader')
      
      if (!target && chicken.formation === 'v-formation') {
        // Follow the chicken ahead in formation
        target = flockMates.find(c => c.originalIndex === chicken.originalIndex - 1)
      }
      
      if (target) {
        const dx = target.x - chicken.x
        const dy = target.y - chicken.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Maintain formation distance
        if (distance > chicken.followDistance) {
          const pullStrength = 0.3 + (gameStore.level * 0.02) // Stronger pull at higher levels
          chicken.x += (dx / distance) * pullStrength * (deltaTime / 16)
          chicken.y += (dy / distance) * pullStrength * (deltaTime / 16)
        }
        
        // Separation - avoid collision with flock mates
        flockMates.forEach(mate => {
          const mdx = mate.x - chicken.x
          const mdy = mate.y - chicken.y
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
          
          if (mdist < 30 && mdist > 0) {
            const repelStrength = 0.5
            chicken.x -= (mdx / mdist) * repelStrength * (deltaTime / 16)
            chicken.y -= (mdy / mdist) * repelStrength * (deltaTime / 16)
          }
        })
      }
    }
    
    // Leaders occasionally change direction to add variety
    if (chicken.flockRole === 'leader' && Math.random() < 0.001) {
      chicken.zigzagDirection *= -1
      chicken.zigzagSpeed = 1 + Math.random() * 3
    }
  }
  
  updateBoss(deltaTime) {
    if (!gameStore.boss) return
    
    const boss = gameStore.boss
    
    // Enhanced boss movement patterns
    if (!boss.movementPattern) {
      boss.movementPattern = 'horizontal'
      boss.movementTimer = 0
      boss.patternDuration = 2500 // 2.5 seconds per pattern
      boss.verticalDirection = 1
      boss.rushDirection = 1
    }
    
    boss.movementTimer += deltaTime
    
    // Switch movement patterns every 2.5 seconds
    if (boss.movementTimer > boss.patternDuration) {
      boss.movementTimer = 0
      const patterns = ['horizontal', 'zigzag', 'circle', 'vertical', 'rush', 'wave']
      boss.movementPattern = patterns[Math.floor(Math.random() * patterns.length)]
    }
    
    // Apply movement based on pattern
    switch (boss.movementPattern) {
      case 'horizontal':
        boss.x += boss.direction * boss.speed * (deltaTime / 16)
        if (boss.x <= 0 || boss.x >= gameStore.screenWidth - boss.width) {
          boss.direction *= -1
        }
        break
        
      case 'zigzag':
        boss.x += boss.direction * boss.speed * (deltaTime / 16)
        boss.y += Math.sin(boss.movementTimer / 200) * 3
        if (boss.x <= 0 || boss.x >= gameStore.screenWidth - boss.width) {
          boss.direction *= -1
        }
        break
        
      case 'circle':
        const centerX = gameStore.screenWidth / 2
        const radius = 100
        const angle = boss.movementTimer / 800
        boss.x = centerX + Math.cos(angle) * radius - boss.width / 2
        boss.y = 60 + Math.sin(angle) * 40
        break
        
      case 'vertical':
        boss.y += boss.verticalDirection * boss.speed * 0.8 * (deltaTime / 16)
        if (boss.y <= 20 || boss.y >= 140) {
          boss.verticalDirection *= -1
        }
        boss.x += boss.direction * boss.speed * 0.2 * (deltaTime / 16)
        if (boss.x <= 0 || boss.x >= gameStore.screenWidth - boss.width) {
          boss.direction *= -1
        }
        break
        
      case 'rush':
        // Boss lao xuống và lùi lên
        boss.y += boss.rushDirection * boss.speed * 1.5 * (deltaTime / 16)
        if (boss.y <= 15) {
          boss.rushDirection = 1 // Lao xuống
        } else if (boss.y >= 180) {
          boss.rushDirection = -1 // Lùi lên
        }
        boss.x += Math.sin(boss.movementTimer / 300) * 2
        break
        
      case 'wave':
        // Di chuyển theo sóng
        boss.x += boss.direction * boss.speed * 0.7 * (deltaTime / 16)
        boss.y = 60 + Math.sin(boss.movementTimer / 400) * 50
        if (boss.x <= 0 || boss.x >= gameStore.screenWidth - boss.width) {
          boss.direction *= -1
        }
        break
    }
    
    // Keep boss within bounds
    boss.x = Math.max(0, Math.min(boss.x, gameStore.screenWidth - boss.width))
    boss.y = Math.max(20, Math.min(boss.y, 150))
    
    // Boss shooting với interval tăng dần theo level
    const shootInterval = boss.shotInterval || 1500
    if (Date.now() - boss.lastShot > shootInterval) {
      this.bosShoot()
      boss.lastShot = Date.now()
    }
  }
  
  bosShoot() {
    // Boss shoots multiple bullets downward with increased difficulty
    const boss = gameStore.boss
    const levelDifficultyMultiplier = 1 + (gameStore.level * 0.15) // 15% more bullets per level
    const bulletCount = Math.floor((boss.bulletCount || 3) * levelDifficultyMultiplier)
    const spreadAngle = 80 + (gameStore.level * 5) // Wider spread at higher levels
    
    for (let i = 0; i < bulletCount; i++) {
      // Tính toán vị trí và góc bắn
      const angleStep = spreadAngle / (bulletCount - 1)
      const angle = -spreadAngle / 2 + (i * angleStep)
      const radians = (angle * Math.PI) / 180
      
      // Enhanced bullet speed based on level
      const baseSpeed = 4 + Math.floor(gameStore.level * 0.5) // Faster bullets each level
      const speedVariation = 1 + Math.random() * 2
      const bulletSpeed = baseSpeed + speedVariation
      
      const bullet = {
        id: Date.now() + Math.random() + i,
        x: boss.x + boss.width / 2 - 4,
        y: boss.y + boss.height,
        width: 8,
        height: 15,
        speed: bulletSpeed,
        velocityX: Math.sin(radians) * bulletSpeed,
        velocityY: Math.cos(radians) * bulletSpeed,
        type: 'enemy',
        color: '#ff3333', // Brighter red for boss bullets
        damage: 0.5 + (gameStore.level * 0.1) // More damage at higher levels
      }
      gameStore.bullets.push(bullet)
    }
    
    // Boss occasionally fires homing missiles at higher levels
    if (gameStore.level >= 5 && Math.random() < 0.3) {
      this.bossFireHomingMissile()
    }
    
    // Play boss shoot sound
    try {
      advancedSoundManager.play('bossShoot')
    } catch (error) {
      soundManager.play('explosion')
    }
  }
  
  bossFireHomingMissile() {
    const boss = gameStore.boss
    const player = gameStore.spaceship
    
    // Calculate direction to player
    const dx = (player.x + player.width / 2) - (boss.x + boss.width / 2)
    const dy = (player.y + player.height / 2) - (boss.y + boss.height)
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    const missile = {
      id: Date.now() + Math.random(),
      x: boss.x + boss.width / 2 - 6,
      y: boss.y + boss.height,
      width: 12,
      height: 20,
      speed: 3 + gameStore.level * 0.2,
      velocityX: (dx / distance) * (3 + gameStore.level * 0.2),
      velocityY: (dy / distance) * (3 + gameStore.level * 0.2),
      type: 'enemy',
      subtype: 'homing',
      color: '#ff6600', // Orange for homing missiles
      damage: 1.0,
      homingStrength: 0.1 + (gameStore.level * 0.01) // Stronger homing at higher levels
    }
    
    gameStore.bullets.push(missile)
  }
  
  updateExplosions(deltaTime) {
    gameStore.explosions = gameStore.explosions.filter(explosion => {
      explosion.life -= deltaTime
      return explosion.life > 0
    })
  }
  
  updatePowerUps(deltaTime) {
    gameStore.powerUps = gameStore.powerUps.filter(powerUp => {
      powerUp.y += powerUp.speed * (deltaTime / 16)
      return powerUp.y < gameStore.screenHeight
    })
    
    // Update power-up duration
    if (gameStore.powerUpDuration > 0) {
      gameStore.powerUpDuration -= deltaTime
      if (gameStore.powerUpDuration <= 0) {
        gameStore.currentWeapon = 'normal'
        this.resetAutoShoot()
      }
    }
  }
  
  checkCollisions() {
    // Bullets vs Chickens and Boss (only player bullets)
    gameStore.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.type === 'enemy') return // Skip enemy bullets
      
      gameStore.chickens.forEach((chicken, chickenIndex) => {
        if (this.isBulletHittingEnemy(bullet, chicken)) {
          // Create hit effect at collision point
          bulletEffects.createHitEffect(
            chicken.x + chicken.width / 2, 
            chicken.y + chicken.height / 2, 
            bullet.type
          )
          
          // Apply damage based on bullet type
          chicken.health -= bullet.damage || 10
          
          // Remove bullet and clean up effects
          if (bullet.element) {
            bulletEffects.removeBullet(bullet)
          }
          gameStore.bullets.splice(bulletIndex, 1)
          
          if (chicken.health <= 0) {
            this.createExplosion(chicken.x + chicken.width / 2, chicken.y + chicken.height / 2)
            gameStore.chickens.splice(chickenIndex, 1)
            gameStore.addScore(10) // addScore sẽ tự động tăng chickensKilledThisLevel
            try {
              advancedSoundManager.play('chickenHit')
            } catch (error) {
              soundManager.play('chickenHit')
            }
          }
        }
      })
      
      // Bullets vs Boss (only player bullets)
      if (gameStore.boss && this.isBulletHittingEnemy(bullet, gameStore.boss)) {
        // Create enhanced hit effect for boss
        bulletEffects.createHitEffect(
          gameStore.boss.x + gameStore.boss.width / 2, 
          gameStore.boss.y + gameStore.boss.height / 2, 
          bullet.type
        )
        
        // Apply damage based on bullet type
        gameStore.boss.health -= bullet.damage || 10
        
        // Remove bullet and clean up effects
        if (bullet.element) {
          bulletEffects.removeBullet(bullet)
        }
        gameStore.bullets.splice(bulletIndex, 1)
        gameStore.addScore(50)
        
        try {
          advancedSoundManager.play('bossHit')
        } catch (error) {
          soundManager.play('bossHit')
        }
        
        if (gameStore.boss.health <= 0) {
          this.createExplosion(gameStore.boss.x + gameStore.boss.width / 2, gameStore.boss.y + gameStore.boss.height / 2)
          gameStore.boss = null
          gameStore.addScore(500)
          try {
            advancedSoundManager.play('explosion')
          } catch (error) {
            soundManager.play('explosion')
          }
        }
      }
    })
    
    // Enemy bullets vs Player
    gameStore.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.type !== 'enemy') return // Only check enemy bullets
      
      if (this.isPlayerHit(bullet)) {
        // Player hit by enemy bullet
        gameStore.bullets.splice(bulletIndex, 1)
        this.createExplosion(bullet.x, bullet.y)
        
        if (gameStore.shield <= 0) {
          // Boss bullets cause 0.5 damage (half heart)
          gameStore.lives -= 0.5
          if (gameStore.lives <= 0) {
            gameStore.endGame()
          }
        } else {
          gameStore.shield--
        }
        
        try {
          advancedSoundManager.play('playerHit')
        } catch (error) {
          soundManager.play('playerHit')
        }
      }
    })
    
    // Chickens vs Player (strict collision)
    gameStore.chickens.forEach((chicken, chickenIndex) => {
      if (this.isEnemyHittingPlayer(chicken, gameStore.spaceship)) {
        gameStore.chickens.splice(chickenIndex, 1)
        gameStore.takeDamage()
        this.createExplosion(chicken.x + chicken.width / 2, chicken.y + chicken.height / 2)
        try {
          advancedSoundManager.play('playerHit')
        } catch (error) {
          soundManager.play('playerHit')
        }
      }
    })
    
    // PowerUps vs Player (normal collision)
    gameStore.powerUps.forEach((powerUp, powerUpIndex) => {
      if (this.isColliding(powerUp, gameStore.spaceship, 5)) {
        this.applyPowerUp(powerUp.type)
        gameStore.powerUps.splice(powerUpIndex, 1)
        try {
          advancedSoundManager.play('powerUp')
        } catch (error) {
          soundManager.play('powerUp')
        }
      }
    })
  }
  
  isColliding(obj1, obj2, padding = 0) {
    return obj1.x < obj2.x + obj2.width + padding &&
           obj1.x + (obj1.width || 4) > obj2.x - padding &&
           obj1.y < obj2.y + obj2.height + padding &&
           obj1.y + (obj1.height || 4) > obj2.y - padding
  }

  // Collision detection for bullets hitting enemies (very precise - đạn phải thật sự chạm vào)
  isBulletHittingEnemy(bullet, enemy) {
    const padding = -1 // Âm padding - đạn phải chồng lên gà một chút mới chết
    return this.isColliding(bullet, enemy, padding)
  }

  // Collision detection for enemies hitting player (strict)
  isEnemyHittingPlayer(enemy, player) {
    const padding = -2 // Negative padding = must overlap slightly
    return this.isColliding(enemy, player, padding)
  }
  
  // Collision detection for enemy bullets hitting player
  isPlayerHit(bullet) {
    const padding = -1 // Precise collision for enemy bullets
    return this.isColliding(bullet, gameStore.spaceship, padding)
  }
  
  createExplosion(x, y) {
    // Limit explosions on mobile for performance
    if (gameStore.explosions.length >= this.maxExplosions) {
      gameStore.explosions.shift() // Remove oldest explosion
    }
    
    const explosion = {
      id: Date.now() + Math.random(),
      x: x - 32,
      y: y - 32,
      life: this.isMobile ? 300 : 500 // Shorter life on mobile
    }
    gameStore.explosions.push(explosion)
  }
  
  cleanupArrays() {
    // Prevent memory issues by limiting array sizes on mobile
    if (gameStore.bullets.length > this.maxBullets) {
      gameStore.bullets = gameStore.bullets.slice(-this.maxBullets)
    }
    
    // Clean up old explosions more aggressively on mobile
    if (this.isMobile && gameStore.explosions.length > this.maxExplosions) {
      gameStore.explosions = gameStore.explosions.slice(-this.maxExplosions)
    }
  }
  
  applyPowerUp(type) {
    switch (type) {
      case 'rapid':
        gameStore.currentWeapon = 'rapid'
        gameStore.powerUpDuration = 5000
        this.resetAutoShoot()
        break
      case 'spread':
        gameStore.currentWeapon = 'spread'
        gameStore.powerUpDuration = 5000
        this.resetAutoShoot()
        break
      case 'shield':
        gameStore.powerUpDuration = 3000
        break
      case 'life':
        gameStore.addLife()
        break
    }
  }
  
  resetAutoShoot() {
    if (this.autoShootInterval) {
      clearInterval(this.autoShootInterval)
    }
    this.startAutoShoot()
  }
  
  checkLevelComplete() {
    // Kiểm tra đã giết đủ gà theo yêu cầu
    if (gameStore.chickensKilledThisLevel >= gameStore.getChickensRequired() && 
        !gameStore.boss) {
      
      console.log(`Level ${gameStore.level} completed! Killed ${gameStore.chickensKilledThisLevel}/${gameStore.getChickensRequired()} chickens`)
      
      // Clear remaining chickens and power-ups immediately
      gameStore.chickens = []
      gameStore.powerUps = []
      
      // Advance to next level immediately
      gameStore.nextLevel()
      
      try {
        advancedSoundManager.play('levelUp')
      } catch (error) {
        soundManager.play('levelUp')
      }
      
      if (gameStore.boss) {
        try {
          advancedSoundManager.play('bossAppear')
        } catch (error) {
          soundManager.play('bossAppear')
        }
      }
    }
  }
  
  // Enhanced cleanup method for intensive gameplay
  cleanupArrays() {
    // Limit bullets more generously for action gameplay
    if (gameStore.bullets.length > this.maxBullets) {
      gameStore.bullets = gameStore.bullets.slice(-this.maxBullets)
    }
    
    // Limit explosions
    if (gameStore.explosions.length > this.maxExplosions) {
      gameStore.explosions = gameStore.explosions.slice(-this.maxExplosions)
    }
    
    // Limit chickens to prevent overwhelming
    if (gameStore.chickens.length > this.maxChickens) {
      gameStore.chickens = gameStore.chickens.slice(-this.maxChickens)
    }
    
    // Remove off-screen bullets immediately
    gameStore.bullets = gameStore.bullets.filter(bullet => bullet.y > -50)
    
    // Remove finished explosions immediately
    gameStore.explosions = gameStore.explosions.filter(explosion => explosion.life > 0)
  }
}

export const gameEngine = new GameEngine()
