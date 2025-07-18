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
    this.gameLoopThrottle = this.isMobile ? 35 : 20 // 28fps mobile, 50fps desktop for smoother action
    this.maxExplosions = this.isMobile ? 4 : 10 // Moderate explosions for visual impact
    this.maxBullets = this.isMobile ? 20 : 60 // Moderate bullets for intense gameplay
    this.particleCount = this.isMobile ? 0.2 : 0.6 // Moderate particles for better effects
    this.maxChickens = this.isMobile ? 12 : 25 // Allow moderate chickens for challenge
    
    // Frame skipping for very low-end devices
    this.frameSkip = this.isMobile ? 2 : 1
    this.frameCounter = 0
    
    this.init()
  }
  
  init() {
    this.setupEventListeners()
    // Don't start auto shoot in init - only start when game actually starts
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
    // Clear existing interval first
    if (this.autoShootInterval) {
      clearInterval(this.autoShootInterval)
      this.autoShootInterval = null
    }
    
    // Dynamic shooting speed based on level - faster each level
    const levelSpeedBonus = Math.max(0.7, 1 - (gameStore.level * 0.08)) // Faster each level, minimum 0.7x
    const baseInterval = gameStore.currentWeapon === 'rapid' ? 100 : 250 // Base intervals
    const levelAdjustedInterval = baseInterval * levelSpeedBonus
    const shootInterval = this.isMobile ? levelAdjustedInterval * 1.3 : levelAdjustedInterval
    
    this.autoShootInterval = setInterval(() => {
      // Only shoot if game is actively playing (not paused, not transitioning)
      if (gameStore.gameStarted && !gameStore.paused && gameStore.isPlaying) {
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
    
    // Start auto shooting when game starts
    this.startAutoShoot()
    
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
    
    // Stop auto shooting
    if (this.autoShootInterval) {
      clearInterval(this.autoShootInterval)
      this.autoShootInterval = null
    }
    
    // Stop background music only
    try {
      advancedSoundManager.stopMusic()
    } catch (error) {
      soundManager.stopMusic()
    }
  }
  
  pause() {
    gameStore.paused = true
    gameStore.isPlaying = false // Stop all game activity
    
    // Stop auto shooting during pause
    if (this.autoShootInterval) {
      clearInterval(this.autoShootInterval)
      this.autoShootInterval = null
    }
    
    try {
      advancedSoundManager.pauseMusic()
    } catch (error) {
      soundManager.pauseMusic()
    }
  }

  resume() {
    gameStore.paused = false
    gameStore.isPlaying = true // Resume all game activity
    
    // Resume auto shooting when unpaused
    this.startAutoShoot()
    
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
    
    // Only update game logic when game is actively playing
    if (!gameStore.paused && gameStore.isPlaying) {
      this.spawnChickens(currentTime)
      this.spawnPowerUps(currentTime)
      this.updateBullets(deltaTime)
      this.updateChickens(deltaTime)
      this.updateBoss(deltaTime)
      this.updateExplosions(deltaTime)
      this.updatePowerUps(deltaTime)
      this.checkCollisions()
      this.checkLevelComplete()
    }
    
    // Always cleanup to prevent memory issues, but more frequently during active play
    if (gameStore.isPlaying) {
      this.cleanupArrays()
    } else {
      // Less frequent cleanup when paused
      if (this.frameCounter % 10 === 0) {
        this.cleanupArrays()
      }
    }
    
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time))
  }
  
  spawnChickens(currentTime) {
    // Don't spawn during boss fight, pause, or when game is not actively playing
    if (gameStore.boss || !gameStore.isPlaying || gameStore.paused) return
    
    // Dramatically increase chicken count each level
    const maxChickensOnScreen = Math.min(
      this.isMobile ? 12 : 25, // Reduced from 15:35 to prevent lag
      5 + (gameStore.level * 2) // 2 more chickens per level instead of 3
    )
    
    if (gameStore.chickens.length >= maxChickensOnScreen) return
    
    // Much faster spawn rate that decreases with level
    const baseSpawnRate = gameStore.difficulty.spawnRate * (gameStore.difficulty.spawnRateMultiplier || 1.0)
    const levelSpawnMultiplier = Math.max(0.4, 1 - (gameStore.level * 0.04)) // Slower progression to prevent lag
    const spawnRate = baseSpawnRate * levelSpawnMultiplier
    
    if (currentTime - this.lastChickenSpawn > spawnRate) {
      // Controlled chicken spawning to prevent lag
      const baseChickens = this.isMobile ? 1 : 2 // Reduced base spawning
      const levelMultiplier = Math.floor(1 + Math.pow(gameStore.level, 1.1) * 0.1) // Slower exponential growth
      const chickensToSpawn = Math.min(
        baseChickens * levelMultiplier,
        this.isMobile ? 4 : 8 // Lower caps to prevent lag
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
    
    // Controlled chicken size to prevent lag
    const baseSize = 45 + Math.floor(gameStore.level * 1.5) // Slower growth: 1.5px per level
    const chickenWidth = Math.min(baseSize, 70) // Max 70px width instead of 80
    const chickenHeight = Math.min(baseSize * 0.75, 55) // Max 55px height instead of 60
    
    // Enhanced speed that increases with level
    const baseSpeed = gameStore.difficulty.chickenSpeed + (gameStore.level * 0.25) // Slower speed growth
    
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
        speed: baseSpeed + Math.random() * 1.2, // Slightly less speed variation
        health: Math.max(1, Math.floor(gameStore.level / 3) + 1), // Slower health scaling
        maxHealth: Math.max(1, Math.floor(gameStore.level / 3) + 1),
        
        // Flocking behavior properties
        flockId: flockId,
        flockRole: flockRole, // 'leader', 'follower', 'solo'
        formation: formation,
        originalIndex: i,
        
        // Enhanced movement properties
        zigzag: Math.random() > 0.6, // Less zigzag to reduce CPU
        zigzagDirection: Math.random() > 0.5 ? 1 : -1,
        zigzagSpeed: 1 + Math.random() * 1.5, // Less zigzag speed
        
        // Diving behavior
        isDiving: false,
        diveTarget: null,
        diveSpeed: baseSpeed * 1.6, // Less dive speed
        
        // Leader following
        followTarget: null,
        followDistance: 40 + Math.random() * 15 // Smaller follow distance
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
      // Only update chickens if game is actively playing
      if (!gameStore.isPlaying || gameStore.paused) {
        return true // Keep chickens but don't update them
      }
      
      // Advanced flocking behavior with level-based speed
      this.updateChickenFlockBehavior(chicken, deltaTime)
      
      // Basic downward movement with level speed bonus
      const levelSpeedMultiplier = 1 + (gameStore.level * 0.15) // Reduced from 0.2 to 0.15
      chicken.y += chicken.speed * levelSpeedMultiplier * (deltaTime / 16)
      
      // Enhanced zigzag movement (less CPU intensive)
      if (chicken.zigzag && !chicken.isDiving) {
        const zigzagStrength = chicken.zigzagSpeed * levelSpeedMultiplier
        chicken.x += chicken.zigzagDirection * zigzagStrength * (deltaTime / 16)
        
        // Bounce off walls
        if (chicken.x <= 0 || chicken.x >= gameStore.screenWidth - chicken.width) {
          chicken.zigzagDirection *= -1
        }
        
        // Reduced random direction changes for better performance
        if (Math.random() < 0.001) { // Reduced from 0.002
          chicken.zigzagDirection *= -1
        }
      }
      
      // Reduced diving behavior frequency to prevent lag
      if (!chicken.isDiving && Math.random() < 0.0005 * gameStore.level) { // Reduced from 0.001
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
        
        if (distance > 15) { // Increased threshold to end dive sooner
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
          const pullStrength = 0.25 + (gameStore.level * 0.015) // Reduced pull strength to prevent lag
          chicken.x += (dx / distance) * pullStrength * (deltaTime / 16)
          chicken.y += (dy / distance) * pullStrength * (deltaTime / 16)
        }
        
        // Reduced separation calculation to prevent lag - only check nearby flock mates
        const nearbyMates = flockMates.filter(mate => {
          const mdx = mate.x - chicken.x
          const mdy = mate.y - chicken.y
          return Math.abs(mdx) < 50 && Math.abs(mdy) < 50 // Pre-filter for performance
        })
        
        nearbyMates.forEach(mate => {
          const mdx = mate.x - chicken.x
          const mdy = mate.y - chicken.y
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
          
          if (mdist < 25 && mdist > 0) { // Reduced separation distance
            const repelStrength = 0.3 // Reduced repel strength
            chicken.x -= (mdx / mdist) * repelStrength * (deltaTime / 16)
            chicken.y -= (mdy / mdist) * repelStrength * (deltaTime / 16)
          }
        })
      }
    }
    
    // Leaders occasionally change direction to add variety (less frequent to reduce CPU)
    if (chicken.flockRole === 'leader' && Math.random() < 0.0005) { // Reduced frequency
      chicken.zigzagDirection *= -1
      chicken.zigzagSpeed = 1 + Math.random() * 2
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
          // Create hit effect at precise collision point - center of chicken
          const hitX = chicken.x + chicken.width / 2
          const hitY = chicken.y + chicken.height / 2
          bulletEffects.createHitEffect(hitX, hitY, bullet.type)
          
          // Apply damage based on bullet type
          chicken.health -= bullet.damage || 10
          
          // Remove bullet and clean up effects
          if (bullet.element) {
            bulletEffects.removeBullet(bullet)
          }
          gameStore.bullets.splice(bulletIndex, 1)
          
          if (chicken.health <= 0) {
            // Create explosion at exact chicken center position
            const explosionX = chicken.x + chicken.width / 2
            const explosionY = chicken.y + chicken.height / 2
            this.createExplosion(explosionX, explosionY)
            
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
        // Create enhanced hit effect for boss at precise center
        const hitX = gameStore.boss.x + gameStore.boss.width / 2
        const hitY = gameStore.boss.y + gameStore.boss.height / 2
        bulletEffects.createHitEffect(hitX, hitY, bullet.type)
        
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
          // Create explosion at exact boss center position
          const explosionX = gameStore.boss.x + gameStore.boss.width / 2
          const explosionY = gameStore.boss.y + gameStore.boss.height / 2
          this.createExplosion(explosionX, explosionY)
          
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
        // Player hit by enemy bullet - create explosion at bullet position
        const explosionX = bullet.x + (bullet.width || 4) / 2
        const explosionY = bullet.y + (bullet.height || 4) / 2
        this.createExplosion(explosionX, explosionY)
        
        gameStore.bullets.splice(bulletIndex, 1)
        
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
        // Create explosion at collision point between chicken and player
        const explosionX = (chicken.x + chicken.width / 2 + gameStore.spaceship.x + gameStore.spaceship.width / 2) / 2
        const explosionY = (chicken.y + chicken.height / 2 + gameStore.spaceship.y + gameStore.spaceship.height / 2) / 2
        this.createExplosion(explosionX, explosionY)
        
        gameStore.chickens.splice(chickenIndex, 1)
        gameStore.takeDamage()
        
        try {
          advancedSoundManager.play('playerHit')
        } catch (error) {
          soundManager.play('playerHit')
        }
      }
    })
    
    // PowerUps vs Player (normal collision with larger tolerance)
    gameStore.powerUps.forEach((powerUp, powerUpIndex) => {
      // Power-ups use more generous collision detection
      const powerUpPadding = 8 // Easier to collect power-ups
      const powerUpCollision = powerUp.x - powerUpPadding < gameStore.spaceship.x + gameStore.spaceship.width + powerUpPadding &&
                              powerUp.x + powerUp.width + powerUpPadding > gameStore.spaceship.x - powerUpPadding &&
                              powerUp.y - powerUpPadding < gameStore.spaceship.y + gameStore.spaceship.height + powerUpPadding &&
                              powerUp.y + powerUp.height + powerUpPadding > gameStore.spaceship.y - powerUpPadding
      
      if (powerUpCollision) {
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
  
  // Collision detection with much more precise hitboxes
  isColliding(obj1, obj2, padding = 0) {
    return obj1.x + padding < obj2.x + obj2.width - padding &&
           obj1.x + (obj1.width || 4) - padding > obj2.x + padding &&
           obj1.y + padding < obj2.y + obj2.height - padding &&
           obj1.y + (obj1.height || 4) - padding > obj2.y + padding
  }

  // Very precise collision detection for bullets hitting enemies
  isBulletHittingEnemy(bullet, enemy) {
    // Much smaller collision area - bullet must actually overlap with enemy center area
    const bulletPadding = 2 // Bullet needs to be closer
    const enemyPadding = -8 // Enemy hitbox is smaller (8px smaller on each side)
    
    return bullet.x + bulletPadding < enemy.x + enemy.width + enemyPadding &&
           bullet.x + (bullet.width || 4) - bulletPadding > enemy.x - enemyPadding &&
           bullet.y + bulletPadding < enemy.y + enemy.height + enemyPadding &&
           bullet.y + (bullet.height || 4) - bulletPadding > enemy.y - enemyPadding
  }

  // Very strict collision detection for enemies hitting player
  isEnemyHittingPlayer(enemy, player) {
    // Much smaller collision area - enemy must actually touch player center
    const enemyPadding = 5 // Enemy hitbox smaller
    const playerPadding = 8 // Player hitbox much smaller
    
    return enemy.x + enemyPadding < player.x + player.width - playerPadding &&
           enemy.x + enemy.width - enemyPadding > player.x + playerPadding &&
           enemy.y + enemyPadding < player.y + player.height - playerPadding &&
           enemy.y + enemy.height - enemyPadding > player.y + playerPadding
  }
  
  // Very precise collision detection for enemy bullets hitting player
  isPlayerHit(bullet) {
    // Much smaller collision area - bullet must be very close to player center
    const bulletPadding = 1
    const playerPadding = 12 // Player has much smaller hitbox
    
    return bullet.x + bulletPadding < gameStore.spaceship.x + gameStore.spaceship.width - playerPadding &&
           bullet.x + (bullet.width || 4) - bulletPadding > gameStore.spaceship.x + playerPadding &&
           bullet.y + bulletPadding < gameStore.spaceship.y + gameStore.spaceship.height - playerPadding &&
           bullet.y + (bullet.height || 4) - bulletPadding > gameStore.spaceship.y + playerPadding
  }
  
  createExplosion(x, y) {
    // Limit explosions on mobile for performance
    if (gameStore.explosions.length >= this.maxExplosions) {
      gameStore.explosions.shift() // Remove oldest explosion
    }
    
    // Center the explosion properly - adjust for explosion size (64x64)
    const explosion = {
      id: Date.now() + Math.random(),
      x: x - 32, // Center horizontally (explosion is 64px wide, so -32)
      y: y - 32, // Center vertically (explosion is 64px tall, so -32)
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
        gameStore.shield = (gameStore.shield || 0) + 3 // Add 3 shield points
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
      
      // Stop auto shooting during level transition
      if (this.autoShootInterval) {
        clearInterval(this.autoShootInterval)
        this.autoShootInterval = null
      }
      
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
  
  // Enhanced cleanup method with aggressive memory management
  cleanupArrays() {
    // More aggressive cleanup for better performance
    const maxBullets = this.isMobile ? 20 : 50 // Reduced from 25:80
    const maxExplosions = this.isMobile ? 3 : 8 // Reduced from 5:12
    const maxChickens = this.isMobile ? 12 : 25 // Reduced from 15:35
    
    // Limit bullets more aggressively
    if (gameStore.bullets.length > maxBullets) {
      // Remove oldest bullets first
      gameStore.bullets = gameStore.bullets.slice(-maxBullets)
    }
    
    // Limit explosions
    if (gameStore.explosions.length > maxExplosions) {
      gameStore.explosions = gameStore.explosions.slice(-maxExplosions)
    }
    
    // Limit chickens to prevent overwhelming
    if (gameStore.chickens.length > maxChickens) {
      // Remove chickens that are furthest from screen or lowest health
      gameStore.chickens.sort((a, b) => {
        const aDistance = a.y < 0 ? -a.y : 0 // Priority to off-screen chickens
        const bDistance = b.y < 0 ? -b.y : 0
        return bDistance - aDistance
      })
      gameStore.chickens = gameStore.chickens.slice(0, maxChickens)
    }
    
    // Remove off-screen bullets immediately
    gameStore.bullets = gameStore.bullets.filter(bullet => {
      const inBounds = bullet.y > -100 && bullet.y < gameStore.screenHeight + 100 && 
                      bullet.x > -100 && bullet.x < gameStore.screenWidth + 100
      return inBounds
    })
    
    // Remove finished explosions immediately
    gameStore.explosions = gameStore.explosions.filter(explosion => explosion.life > 0)
    
    // Clean up bullet DOM elements that might be orphaned
    if (typeof bulletEffects !== 'undefined' && bulletEffects.cleanup) {
      bulletEffects.cleanup()
    }
  }
}

// Export gameEngine instance and expose to window for cross-component access
export const gameEngine = new GameEngine()

// Expose to window for gameStore and other components
if (typeof window !== 'undefined') {
  window.gameEngine = gameEngine
}
