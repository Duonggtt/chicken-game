import dbConfig from '../config/database.js'

class DatabaseService {
  constructor() {
    this.isOnline = navigator.onLine
    this.apiUrl = dbConfig.apiBaseUrl
    this.localStorageKey = dbConfig.localStorageKey
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncLocalData()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Lưu điểm số vào database
  async saveScore(playerData) {
    const scoreData = {
      playerName: playerData.playerName,
      score: playerData.score,
      level: playerData.level,
      date: new Date().toISOString(),
      sessionId: this.generateSessionId()
    }

    try {
      if (this.isOnline && this.apiUrl) {
        // Gửi dữ liệu lên MongoDB qua API
        const response = await this.sendToAPI(scoreData)
        if (response.success) {
          console.log('Score saved to database successfully')
          return response
        }
      }
    } catch (error) {
      console.warn('Failed to save to database, using localStorage:', error)
    }

    // Fallback: Lưu vào localStorage
    this.saveToLocalStorage(scoreData)
    return { success: true, local: true }
  }

  // Lấy bảng xếp hạng
  async getLeaderboard(limit = 10) {
    try {
      if (this.isOnline && this.apiUrl) {
        // Lấy dữ liệu từ MongoDB qua API
        const response = await fetch(`${this.apiUrl}/leaderboard?limit=${limit}`)
        if (response.ok) {
          const data = await response.json()
          console.log('Leaderboard loaded from database')
          return data.scores || []
        }
      }
    } catch (error) {
      console.warn('Failed to load from database, using localStorage:', error)
    }

    // Fallback: Lấy từ localStorage
    return this.getFromLocalStorage()
  }

  // Gửi dữ liệu lên API
  async sendToAPI(scoreData) {
    const response = await fetch(`${this.apiUrl}/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  // Lưu vào localStorage
  saveToLocalStorage(scoreData) {
    try {
      const existingScores = this.getFromLocalStorage()
      existingScores.push(scoreData)
      
      // Sắp xếp theo điểm số giảm dần và giữ tối đa 50 điểm
      const sortedScores = existingScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 50)
      
      localStorage.setItem(this.localStorageKey, JSON.stringify(sortedScores))
      console.log('Score saved to localStorage')
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  // Lấy từ localStorage
  getFromLocalStorage() {
    try {
      const stored = localStorage.getItem(this.localStorageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return []
    }
  }

  // Đồng bộ dữ liệu local lên server khi online trở lại
  async syncLocalData() {
    if (!this.apiUrl) return

    try {
      const localScores = this.getFromLocalStorage()
      const pendingScores = localScores.filter(score => !score.synced)
      
      for (const score of pendingScores) {
        try {
          const response = await this.sendToAPI(score)
          if (response.success) {
            score.synced = true
          }
        } catch (error) {
          console.warn('Failed to sync score:', error)
        }
      }
      
      // Cập nhật localStorage với trạng thái đã sync
      localStorage.setItem(this.localStorageKey, JSON.stringify(localScores))
      console.log('Local data synced to database')
    } catch (error) {
      console.error('Failed to sync local data:', error)
    }
  }

  // Tạo session ID duy nhất
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Xóa tất cả dữ liệu local (để test)
  clearLocalData() {
    localStorage.removeItem(this.localStorageKey)
    console.log('Local data cleared')
  }

  // Kiểm tra trạng thái kết nối
  getConnectionStatus() {
    return {
      online: this.isOnline,
      hasAPI: !!this.apiUrl,
      canSaveToDatabase: this.isOnline && !!this.apiUrl
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()
