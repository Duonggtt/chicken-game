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
    this.autoShootInterval = null
    
    this.init()
  }
  
  init() {
    this.setupEventListeners()
    this.startAutoShoot()
  }
  
  setupEventListeners() {
    // Mouse movement for spaceship control
    document.addEventListener('mousemove', (e) => {
      const gameArea = document.getElementById('game-area')
      if (!gameArea) return
      
      const rect = gameArea.getBoundingClientRect()
      this.mouseX = e.clientX - rect.left
      this.mouseY = e.clientY - rect.top
      this.updateSpaceshipPosition()
    })
    
    // Touch events for mobile
    document.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const gameArea = document.getElementById('game-area')
      if (!gameArea) return
      
      const rect = gameArea.getBoundingClientRect()
      const touch = e.touches[0]
      this.mouseX = touch.clientX - rect.left
      this.mouseY = touch.clientY - rect.top
      this.updateSpaceshipPosition()
    }, { passive: false })
    
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
    
    // Follow mouse with boundaries
    spaceship.x = Math.max(margin, Math.min(this.mouseX - spaceship.width / 2, gameStore.screenWidth - spaceship.width - margin))
    spaceship.y = Math.max(margin, Math.min(this.mouseY - spaceship.height / 2, gameStore.screenHeight - spaceship.height - margin))
  }
  
  startAutoShoot() {
    this.autoShootInterval = setInterval(() => {
      if (gameStore.gameStarted && !gameStore.paused) {
        this.shoot()
      }
    }, gameStore.currentWeapon === 'rapid' ? 100 : 250)
  }
  
  shoot() {
    const spaceship = gameStore.spaceship
    const weaponType = gameStore.currentWeapon
    
    // Create bullet with enhanced effects
    const bullet = bulletEffects.createBullet(
      spaceship.x + spaceship.width / 2 - 2,
      spaceship.y,
      weaponType
    )
    
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
    
    // Play weapon sound
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
    if (!gameStore.gameStarted) return
    
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime
    
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
    }
    
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time))
  }
  
  spawnChickens(currentTime) {
    if (gameStore.boss) return // No chickens during boss fight
    
    // Apply difficulty multiplier from settings
    const spawnRate = gameStore.difficulty.spawnRate * (gameStore.difficulty.spawnRateMultiplier || 1.0)
    
    if (currentTime - this.lastChickenSpawn > spawnRate) {
      const chicken = {
        id: Date.now() + Math.random(),
        x: Math.random() * (gameStore.screenWidth - 40),
        y: -40,
        width: 40,
        height: 30,
        speed: gameStore.difficulty.chickenSpeed + Math.random() * 2,
        health: Math.floor(gameStore.level / 3) + 1,
        maxHealth: Math.floor(gameStore.level / 3) + 1,
        zigzag: Math.random() > 0.7,
        zigzagDirection: 1
      }
      
      gameStore.chickens.push(chicken)
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
      // Update bullet using enhanced effects manager
      const stillActive = bulletEffects.updateBullet(bullet)
      
      if (!stillActive) {
        return false
      }
      
      // Update position for collision detection
      if (bullet.velocityX !== undefined && bullet.velocityY !== undefined) {
        // Đạn có hướng bay (boss bullets)
        bullet.x += bullet.velocityX * (deltaTime / 16)
        bullet.y += bullet.velocityY * (deltaTime / 16)
      } else {
        // Đạn bay thẳng (player bullets) - position already updated by bulletEffects
        bullet.x = parseFloat(bullet.element.style.left)
        bullet.y = parseFloat(bullet.element.style.top)
      }
      
      // Remove bullets that are off screen
      const inBounds = bullet.y > -10 && bullet.y < gameStore.screenHeight + 10 && 
                      bullet.x > -10 && bullet.x < gameStore.screenWidth + 10
      
      if (!inBounds) {
        bulletEffects.removeBullet(bullet)
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
    boss.x += boss.direction * boss.speed * (deltaTime / 16)
    
    // Bounce off walls
    if (boss.x <= 0 || boss.x >= gameStore.screenWidth - boss.width) {
      boss.direction *= -1
    }
    
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
    // Bullets vs Chickens (forgiving collision for bullets)
    gameStore.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.type === 'enemy') return
      
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
          bulletEffects.removeBullet(bullet)
          gameStore.bullets.splice(bulletIndex, 1)
          
          if (chicken.health <= 0) {
            this.createExplosion(chicken.x + chicken.width / 2, chicken.y + chicken.height / 2)
            gameStore.chickens.splice(chickenIndex, 1)
            gameStore.addScore(10)
            try {
              advancedSoundManager.play('chickenHit')
            } catch (error) {
              soundManager.play('chickenHit')
            }
          }
        }
      })
      
      // Bullets vs Boss (forgiving collision for bullets)
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
        bulletEffects.removeBullet(bullet)
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
    
    // Enemy bullets vs Player (strict collision)
    gameStore.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.type !== 'enemy') return
      
      if (this.isEnemyHittingPlayer(bullet, gameStore.spaceship)) {
        gameStore.bullets.splice(bulletIndex, 1)
        gameStore.takeDamage()
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
  
  createExplosion(x, y) {
    const explosion = {
      id: Date.now() + Math.random(),
      x: x - 32,
      y: y - 32,
      life: 500
    }
    gameStore.explosions.push(explosion)
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
      
      // Clear remaining chickens and objects for smooth transition
      gameStore.chickens = []
      gameStore.bullets = []
      gameStore.explosions = []
      gameStore.powerUps = []
      
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
}

export const gameEngine = new GameEngine()
