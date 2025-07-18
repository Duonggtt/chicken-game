// User Tracking Service - Real user analytics
// Tracks actual user visits and interactions

class UserTracker {
  constructor() {
    this.sessionId = this.generateSessionId()
    this.isTracked = false
    this.startTime = Date.now()
    this.apiUrl = this.getApiUrl()
  }

  generateSessionId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `session_${timestamp}_${random}`
  }

  getApiUrl() {
    // Determine API URL based on environment
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000'
      } else {
        return 'https://chicken-game-sigma.vercel.app'
      }
    }
    return 'https://chicken-game-sigma.vercel.app'
  }

  async trackVisit() {
    if (this.isTracked) return

    try {
      const visitorData = {
        action: 'visit',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        referrer: document.referrer || 'direct',
        language: navigator.language,
        screen: {
          width: screen.width,
          height: screen.height
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }

      console.log('Tracking website visit:', this.sessionId)

      const response = await fetch(`${this.apiUrl}/api/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Visit tracked successfully:', result)
        this.isTracked = true
        return result
      } else {
        console.warn('Failed to track visit:', response.status)
      }
    } catch (error) {
      console.error('Error tracking visit:', error)
    }
  }

  async trackGameStart() {
    try {
      const gameData = {
        action: 'game_start',
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        timeOnSite: Date.now() - this.startTime
      }

      console.log('Tracking game start:', this.sessionId)

      const response = await fetch(`${this.apiUrl}/api/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Game start tracked:', result)
        return result
      }
    } catch (error) {
      console.error('Error tracking game start:', error)
    }
  }

  async trackGameEnd(gameStats) {
    try {
      const gameEndData = {
        action: 'game_end',
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        gameStats: {
          score: gameStats.score || 0,
          level: gameStats.level || 1,
          duration: gameStats.duration || 0,
          chickensShot: gameStats.chickensShot || 0
        }
      }

      console.log('Tracking game end:', this.sessionId, gameStats)

      const response = await fetch(`${this.apiUrl}/api/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameEndData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Game end tracked:', result)
        return result
      }
    } catch (error) {
      console.error('Error tracking game end:', error)
    }
  }

  // Track page visibility changes to better estimate online users
  setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageHidden()
      } else {
        this.trackPageVisible()
      }
    })

    // Track when user leaves the page
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave()
    })
  }

  async trackPageHidden() {
    // User switched tab or minimized window
    console.log('Page hidden - user may be inactive')
  }

  async trackPageVisible() {
    // User came back to the tab
    console.log('Page visible - user is active again')
  }

  async trackPageLeave() {
    // User is leaving the page
    console.log('User leaving page:', this.sessionId)
    
    // Use sendBeacon for reliable tracking even when page is closing
    if (navigator.sendBeacon) {
      const leaveData = JSON.stringify({
        action: 'page_leave',
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        timeOnSite: Date.now() - this.startTime
      })
      
      navigator.sendBeacon(`${this.apiUrl}/api/track`, leaveData)
    }
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      timeOnSite: Date.now() - this.startTime,
      isTracked: this.isTracked
    }
  }
}

// Create singleton instance
const userTracker = new UserTracker()

// Auto-track visit when module loads
if (typeof window !== 'undefined') {
  // Track visit after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      userTracker.trackVisit()
      userTracker.setupVisibilityTracking()
    })
  } else {
    userTracker.trackVisit()
    userTracker.setupVisibilityTracking()
  }
}

export default userTracker
