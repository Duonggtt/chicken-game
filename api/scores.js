// Vercel Serverless Function - Save Scores
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

  if (req.method === 'POST') {
    try {
      const { playerName, score, level, date, sessionId } = req.body
      
      // Validate dữ liệu
      if (!playerName || typeof score !== 'number' || !level) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: playerName, score, level' 
        })
      }

      const client = await connectToDatabase()
      const db = client.db('chicken_game')

      const scoreData = {
        playerName: playerName.trim(),
        score: parseInt(score),
        level: parseInt(level),
        date: date || new Date().toISOString(),
        sessionId: sessionId || Date.now().toString(),
        createdAt: new Date()
      }

      const result = await db.collection('scores').insertOne(scoreData)
      
      res.status(200).json({ 
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
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
