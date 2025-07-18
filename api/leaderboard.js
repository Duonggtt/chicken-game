// Vercel Serverless Function - Get Leaderboard
const { MongoClient } = require('mongodb')

const MONGO_URI = 'mongodb+srv://admin:sqk5b4DcnOpXqq2n@chicken-game.kvugxpb.mongodb.net/chicken_game'

let cachedClient = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }
  
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  cachedClient = client
  return client
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    try {
      const limit = parseInt(req.query.limit) || 10
      
      const client = await connectToDatabase()
      const db = client.db('chicken_game')
      
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
        timestamp: score.date // For compatibility
      }))

      res.status(200).json({ 
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
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
