// Backend API Server cho Chicken Shooter Game
// Chạy lệnh: node server.js

const express = require('express')
const { MongoClient } = require('mongodb')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

// MongoDB URI
const MONGO_URI = 'mongodb+srv://admin:sqk5b4DcnOpXqq2n@chicken-game.kvugxpb.mongodb.net/chicken_game'

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://chicken-game-duonggtt.vercel.app',
    'https://chicken-game.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

let db = null

// Kết nối MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    db = client.db('chicken_game')
    console.log('Connected to MongoDB successfully')
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

// Routes

// Lưu điểm số mới
app.post('/api/scores', async (req, res) => {
  try {
    const { playerName, score, level, date, sessionId } = req.body
    
    // Validate dữ liệu
    if (!playerName || typeof score !== 'number' || !level) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: playerName, score, level' 
      })
    }

    const scoreData = {
      playerName: playerName.trim(),
      score: parseInt(score),
      level: parseInt(level),
      date: date || new Date().toISOString(),
      sessionId: sessionId || Date.now().toString(),
      createdAt: new Date()
    }

    const result = await db.collection('scores').insertOne(scoreData)
    
    res.json({ 
      success: true, 
      insertedId: result.insertedId,
      message: 'Score saved successfully' 
    })
  } catch (error) {
    console.error('Error saving score:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save score' 
    })
  }
})

// Lấy bảng xếp hạng
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    
    const scores = await db.collection('scores')
      .find({})
      .sort({ score: -1, createdAt: -1 })
      .limit(Math.min(limit, 100)) // Tối đa 100 records
      .toArray()

    // Loại bỏ các trường không cần thiết
    const cleanedScores = scores.map(score => ({
      playerName: score.playerName,
      score: score.score,
      level: score.level,
      date: score.date,
      rank: 0 // Sẽ được tính ở frontend
    }))

    res.json({ 
      success: true, 
      scores: cleanedScores,
      total: scores.length 
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch leaderboard' 
    })
  }
})

// Lấy top players
app.get('/api/top-players', async (req, res) => {
  try {
    const topPlayers = await db.collection('scores')
      .aggregate([
        {
          $group: {
            _id: '$playerName',
            bestScore: { $max: '$score' },
            maxLevel: { $max: '$level' },
            totalGames: { $sum: 1 },
            lastPlayed: { $max: '$createdAt' }
          }
        },
        {
          $sort: { bestScore: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            playerName: '$_id',
            bestScore: 1,
            maxLevel: 1,
            totalGames: 1,
            lastPlayed: 1,
            _id: 0
          }
        }
      ])
      .toArray()

    res.json({ 
      success: true, 
      players: topPlayers 
    })
  } catch (error) {
    console.error('Error fetching top players:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch top players' 
    })
  }
})

// Xóa tất cả scores (chỉ để test - nên xóa ở production)
app.delete('/api/scores/clear', async (req, res) => {
  try {
    const result = await db.collection('scores').deleteMany({})
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: 'All scores cleared' 
    })
  } catch (error) {
    console.error('Error clearing scores:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear scores' 
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Chicken Shooter API is running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  })
})

// Khởi động server
async function startServer() {
  await connectToDatabase()
  
  app.listen(PORT, () => {
    console.log(`🚀 Chicken Shooter API Server running on port ${PORT}`)
    console.log(`📊 API endpoints:`)
    console.log(`   POST /api/scores - Save new score`)
    console.log(`   GET /api/leaderboard - Get leaderboard`)
    console.log(`   GET /api/top-players - Get top players`)
    console.log(`   GET /api/health - Health check`)
  })
}

startServer().catch(console.error)
