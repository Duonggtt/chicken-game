// Bullet Effects Manager - Optimized for performance
import '../styles/bulletEffects.css'

class BulletEffectsManager {
  constructor() {
    this.particles = []
    this.muzzleFlashes = []
    this.hitEffects = []
    this.bulletTrails = new Map()
    
    // Performance optimization
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    this.maxParticles = this.isMobile ? 5 : 20
    this.enableTrails = !this.isMobile // Disable trails on mobile
    this.enableMuzzleFlash = !this.isMobile // Disable muzzle flash on mobile
  }

  // Create different types of bullets with reduced effects for performance
  createBullet(x, y, weaponType = 'normal') {
    // Check if game area exists
    const gameArea = document.querySelector('.game-area')
    if (!gameArea) return null

    const bullet = {
      x: x,
      y: y,
      width: this.getBulletSize(weaponType).width,
      height: this.getBulletSize(weaponType).height,
      speed: this.getBulletSpeed(weaponType),
      damage: this.getBulletDamage(weaponType),
      type: weaponType,
      element: this.createBulletElement(x, y, weaponType),
      particles: [],
      trail: []
    }

    // Add bullet to DOM
    gameArea.appendChild(bullet.element)
    
    // Create muzzle flash only on desktop
    if (this.enableMuzzleFlash) {
      this.createMuzzleFlash(x, y, weaponType)
    }
    
    // Start particle trail only on desktop
    if (this.enableTrails) {
      this.startBulletTrail(bullet)
    }
    
    return bullet
  }

  createBulletElement(x, y, weaponType) {
    const element = document.createElement('div')
    element.className = `bullet bullet-${weaponType}`
    element.style.left = x + 'px'
    element.style.top = y + 'px'
    element.style.zIndex = '100'
    
    // Add special effects based on weapon type
    this.addBulletSpecialEffects(element, weaponType)
    
    return element
  }

  addBulletSpecialEffects(element, weaponType) {
    switch (weaponType) {
      case 'rapid':
        element.style.filter = 'hue-rotate(180deg)'
        break
      case 'spread':
        element.style.filter = 'hue-rotate(300deg)'
        break
      case 'power':
        element.style.transform = 'scale(1.5)'
        break
      case 'laser':
        element.style.filter = 'hue-rotate(120deg)'
        element.style.height = '25px'
        break
      case 'explosive':
        element.style.borderRadius = '50%'
        element.style.width = '8px'
        element.style.height = '8px'
        break
      case 'charged':
        element.className += ' bullet-charged'
        break
    }
  }

  getBulletSize(weaponType) {
    const sizes = {
      normal: { width: 4, height: 12 },
      rapid: { width: 3, height: 10 },
      spread: { width: 3, height: 10 },
      power: { width: 6, height: 16 },
      laser: { width: 2, height: 25 },
      explosive: { width: 8, height: 8 },
      charged: { width: 10, height: 20 }
    }
    return sizes[weaponType] || sizes.normal
  }

  getBulletSpeed(weaponType) {
    const speeds = {
      normal: 8,
      rapid: 12,
      spread: 10,
      power: 6,
      laser: 15,
      explosive: 5,
      charged: 4
    }
    return speeds[weaponType] || speeds.normal
  }

  getBulletDamage(weaponType) {
    const damages = {
      normal: 10,
      rapid: 5,
      spread: 8,
      power: 25,
      laser: 15,
      explosive: 30,
      charged: 50
    }
    return damages[weaponType] || damages.normal
  }

  // Create muzzle flash effect
  createMuzzleFlash(x, y, weaponType) {
    const flash = document.createElement('div')
    flash.className = 'muzzle-flash'
    flash.style.left = (x - 15) + 'px'
    flash.style.top = (y - 15) + 'px'
    flash.style.zIndex = '99'

    // Different colors for different weapons
    const colors = {
      normal: 'radial-gradient(circle, #ffffff, #ffff00, transparent)',
      rapid: 'radial-gradient(circle, #ffffff, #00ffff, transparent)',
      spread: 'radial-gradient(circle, #ffffff, #ff00ff, transparent)',
      power: 'radial-gradient(circle, #ffffff, #ff6600, transparent)',
      laser: 'radial-gradient(circle, #ffffff, #00ff00, transparent)',
      explosive: 'radial-gradient(circle, #ffffff, #ff0000, transparent)',
      charged: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
    }

    flash.style.background = colors[weaponType] || colors.normal

    const gameArea = document.querySelector('.game-area')
    if (gameArea) {
      gameArea.appendChild(flash)
    }

    // Remove after animation
    setTimeout(() => {
      if (flash.parentNode) {
        flash.parentNode.removeChild(flash)
      }
    }, 150)
  }

  // Create bullet trail particles
  startBulletTrail(bullet) {
    const createTrailParticle = () => {
      if (!bullet.element.parentNode) return

      // Check if game area still exists
      const gameArea = document.querySelector('.game-area')
      if (!gameArea) return

      const particle = document.createElement('div')
      particle.className = 'bullet-particle'
      particle.style.left = (bullet.x + bullet.width / 2) + 'px'
      particle.style.top = (bullet.y + bullet.height) + 'px'
      particle.style.zIndex = '98'

      // Different particle colors for different bullets
      const colors = {
        normal: '#ffff00',
        rapid: '#00ffff',
        spread: '#ff00ff',
        power: '#ff6600',
        laser: '#00ff00',
        explosive: '#ff0000',
        charged: '#ffffff'
      }

      particle.style.background = colors[bullet.type] || colors.normal

      gameArea.appendChild(particle)

      // Random particle movement
      const randomX = (Math.random() - 0.5) * 10
      const randomY = Math.random() * 10 + 5
      
      particle.style.transform = `translate(${randomX}px, ${randomY}px)`

      // Remove after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      }, 500)
    }

    // Create particles at intervals
    const trailInterval = setInterval(() => {
      // Check if game area still exists
      const gameArea = document.querySelector('.game-area')
      if (!gameArea || !bullet.element.parentNode) {
        clearInterval(trailInterval)
        return
      }
      createTrailParticle()
    }, 50)

    // Store interval for cleanup
    this.bulletTrails.set(bullet, trailInterval)
  }

  // Create hit effect when bullet hits target
  createHitEffect(x, y, weaponType = 'normal') {
    const hitEffect = document.createElement('div')
    hitEffect.className = 'bullet-hit-effect'
    hitEffect.style.left = (x - 10) + 'px'
    hitEffect.style.top = (y - 10) + 'px'
    hitEffect.style.zIndex = '101'

    // Different hit effects for different weapons
    const effects = {
      normal: 'radial-gradient(circle, #ffff00, transparent)',
      rapid: 'radial-gradient(circle, #00ffff, transparent)',
      spread: 'radial-gradient(circle, #ff00ff, transparent)',
      power: 'radial-gradient(circle, #ff6600, transparent)',
      laser: 'radial-gradient(circle, #00ff00, transparent)',
      explosive: 'radial-gradient(circle, #ff0000, transparent)',
      charged: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
    }

    hitEffect.style.background = effects[weaponType] || effects.normal

    const gameArea = document.querySelector('.game-area')
    if (gameArea) {
      gameArea.appendChild(hitEffect)
    }

    // Create additional particles for explosive hits
    if (weaponType === 'explosive' || weaponType === 'power' || weaponType === 'charged') {
      this.createExplosionParticles(x, y, weaponType)
    }

    // Remove after animation
    setTimeout(() => {
      if (hitEffect.parentNode) {
        hitEffect.parentNode.removeChild(hitEffect)
      }
    }, 400)
  }

  // Create explosion particles for powerful weapons
  createExplosionParticles(x, y, weaponType) {
    const particleCount = weaponType === 'charged' ? 12 : 8
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'bullet-particle'
      particle.style.left = x + 'px'
      particle.style.top = y + 'px'
      particle.style.zIndex = '100'

      const colors = {
        power: '#ff6600',
        explosive: '#ff0000',
        charged: '#ffffff'
      }

      particle.style.background = colors[weaponType] || '#ffff00'
      particle.style.width = '3px'
      particle.style.height = '3px'

      const gameArea = document.querySelector('.game-area')
      if (gameArea) {
        gameArea.appendChild(particle)
      }

      // Random explosion direction
      const angle = (i / particleCount) * Math.PI * 2
      const speed = 20 + Math.random() * 20
      const moveX = Math.cos(angle) * speed
      const moveY = Math.sin(angle) * speed

      particle.style.transform = `translate(${moveX}px, ${moveY}px)`

      // Remove after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      }, 600)
    }
  }

  // Update bullet position and effects
  updateBullet(bullet) {
    bullet.y -= bullet.speed
    bullet.element.style.top = bullet.y + 'px'

    // Update trail
    if (bullet.type === 'laser') {
      // Laser bullets create continuous trail
      this.createLaserTrail(bullet)
    }

    // Remove bullet if off screen
    if (bullet.y < -50) {
      this.removeBullet(bullet)
      return false
    }

    return true
  }

  createLaserTrail(bullet) {
    const trail = document.createElement('div')
    trail.className = 'bullet-particle'
    trail.style.left = (bullet.x + 1) + 'px'
    trail.style.top = (bullet.y + bullet.height) + 'px'
    trail.style.background = '#00ff00'
    trail.style.width = '1px'
    trail.style.height = '5px'
    trail.style.zIndex = '97'

    const gameArea = document.querySelector('.game-area')
    if (gameArea) {
      gameArea.appendChild(trail)
    }

    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail)
      }
    }, 200)
  }

  // Clean up bullet and its effects
  removeBullet(bullet) {
    // Stop trail particles
    if (this.bulletTrails.has(bullet)) {
      clearInterval(this.bulletTrails.get(bullet))
      this.bulletTrails.delete(bullet)
    }

    // Remove bullet element
    if (bullet.element && bullet.element.parentNode) {
      bullet.element.parentNode.removeChild(bullet.element)
    }
  }

  // Clean up all effects
  cleanup() {
    // Clear all intervals
    this.bulletTrails.forEach(interval => clearInterval(interval))
    this.bulletTrails.clear()

    // Remove all effect elements
    const gameArea = document.querySelector('.game-area')
    if (gameArea) {
      const effects = gameArea.querySelectorAll('.bullet-particle, .muzzle-flash, .bullet-hit-effect')
      effects.forEach(effect => {
        if (effect.parentNode) {
          effect.parentNode.removeChild(effect)
        }
      })
    }
  }
}

// Create singleton instance
export const bulletEffects = new BulletEffectsManager()
