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
    
    // Much more aggressive performance settings to fix lag
    this.mouseMoveThrottle = this.isMobile ? 16 : 8 // Much more responsive: 60fps mobile, 120fps desktop
    this.gameLoopThrottle = this.isMobile ? 50 : 33 // 20fps for mobile, 30fps for desktop
    this.maxExplosions = this.isMobile ? 3 : 8 // Reduce explosions significantly
    this.maxBullets = this.isMobile ? 15 : 50 // Reduce bullets significantly
    this.particleCount = this.isMobile ? 0.1 : 0.5 // Much fewer particles
    this.maxChickens = this.isMobile ? 8 : 20 // Limit chickens on screen
    
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
    
    // Much more responsive interpolation - nearly instant on desktop
    const lerpFactor = this.isMobile ? 0.4 : 0.6 // Much faster response
    
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
    // Much slower shooting to reduce CPU load and lag
    const baseInterval = gameStore.currentWeapon === 'rapid' ? 150 : 400 // Increased intervals
    const shootInterval = this.isMobile ? baseInterval * 2 : baseInterval * 1.2 // Even slower on mobile
    
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
    
    // Limit total chickens on screen for performance
    if (gameStore.chickens.length >= this.maxChickens) return
    
    // Apply difficulty multiplier from settings with performance consideration
    const baseSpawnRate = gameStore.difficulty.spawnRate * (gameStore.difficulty.spawnRateMultiplier || 1.0)
    const spawnRate = this.isMobile ? baseSpawnRate * 1.5 : baseSpawnRate // Slower spawn on mobile
    
    if (currentTime - this.lastChickenSpawn > spawnRate) {
      // Reduce chickens spawned at once for performance
      const baseChickens = this.isMobile ? 1 : 2 // Only 1 chicken on mobile
      const extraChickens = this.isMobile ? 0 : Math.floor(gameStore.level / 3) // Less scaling on mobile
      const chickensToSpawn = Math.min(baseChickens + extraChickens, this.isMobile ? 2 : 4) // Max 2 on mobile, 4 on desktop
      
      for (let i = 0; i < chickensToSpawn; i++) {
        const chicken = {
          id: Date.now() + Math.random() + i,
          x: Math.random() * (gameStore.screenWidth - 40),
          y: -40 - (i * 50), // Spread vertical position để không overlap
          width: 40,
          height: 30,
          speed: gameStore.difficulty.chickenSpeed + Math.random() * 2,
          health: Math.floor(gameStore.level / 3) + 1,
          maxHealth: Math.floor(gameStore.level / 3) + 1,
          zigzag: this.isMobile ? false : Math.random() > 0.7, // Disable zigzag on mobile for performance
          zigzagDirection: 1
        }
        
        gameStore.chickens.push(chicken)
      }
      
      this.lastChickenSpawn = currentTime
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
        // Boss/enemy bullets - update position manually
        if (bullet.velocityX !== undefined && bullet.velocityY !== undefined) {
          bullet.x += bullet.velocityX * (deltaTime / 16)
          bullet.y += bullet.velocityY * (deltaTime / 16)
        } else {
          bullet.y -= bullet.speed * (deltaTime / 16)
        }
      }
      
      // Remove bullets that are off screen
      const inBounds = bullet.y > -10 && bullet.y < gameStore.screenHeight + 10 && 
                      bullet.x > -10 && bullet.x < gameStore.screenWidth + 10
      
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
      chicken.y += chicken.speed * (deltaTime / 16)
      
      // Zigzag movement
      if (chicken.zigzag) {
        chicken.x += chicken.zigzagDirection * 2 * (deltaTime / 16)
        if (chicken.x <= 0 || chicken.x >= gameStore.screenWidth - chicken.width) {
          chicken.zigzagDirection *= -1
        }
      }
      
      // Remove if off screen
      if (chicken.y > gameStore.screenHeight) {
        return false
      }
      
      return true
    })
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
    // Boss shoots multiple bullets downward
    const boss = gameStore.boss
    const bulletCount = boss.bulletCount || 3
    const spreadAngle = 60 // Góc phân tán đạn
    
    for (let i = 0; i < bulletCount; i++) {
      // Tính toán vị trí và góc bắn
      const angleStep = spreadAngle / (bulletCount - 1)
      const angle = -spreadAngle / 2 + (i * angleStep)
      const radians = (angle * Math.PI) / 180
      
      const bullet = {
        id: Date.now() + Math.random() + i,
        x: boss.x + boss.width / 2 - 3,
        y: boss.y + boss.height,
        width: 6,
        height: 12,
        speed: 5 + Math.floor(gameStore.level / 2), // Tốc độ tăng theo level
        velocityX: Math.sin(radians) * (5 + Math.floor(gameStore.level / 2)),
        velocityY: Math.cos(radians) * (5 + Math.floor(gameStore.level / 2)),
        type: 'enemy',
        color: '#ff4444' // Đạn đỏ của boss
      }
      gameStore.bullets.push(bullet)
    }
    
    // Play boss shoot sound
    try {
      advancedSoundManager.play('bossShoot')
    } catch (error) {
      soundManager.play('explosion')
    }
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
    clearInterval(this.autoShootInterval)
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
  
  // Aggressive cleanup method to prevent memory issues and lag
  cleanupArrays() {
    // Limit bullets more aggressively
    if (gameStore.bullets.length > this.maxBullets) {
      gameStore.bullets = gameStore.bullets.slice(-this.maxBullets)
    }
    
    // Limit explosions
    if (gameStore.explosions.length > this.maxExplosions) {
      gameStore.explosions = gameStore.explosions.slice(-this.maxExplosions)
    }
    
    // Limit chickens
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
