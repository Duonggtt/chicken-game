// Vercel Serverless Function - Get Leaderboard
// Temporary fallback without MongoDB dependency

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
      console.log('Fetching leaderboard with limit:', limit)
      
      // TODO: Replace with MongoDB connection
      // For now, return mock data to prevent frontend errors
      const mockScores = [
        { playerName: 'Demo Player 1', score: 5000, level: 8, date: new Date().toISOString() },
        { playerName: 'Demo Player 2', score: 4500, level: 7, date: new Date().toISOString() },
        { playerName: 'Demo Player 3', score: 4000, level: 6, date: new Date().toISOString() },
        { playerName: 'Demo Player 4', score: 3500, level: 5, date: new Date().toISOString() },
        { playerName: 'Demo Player 5', score: 3000, level: 4, date: new Date().toISOString() }
      ]

      const cleanedScores = mockScores.slice(0, limit).map(score => ({
        playerName: score.playerName,
        score: score.score,
        level: score.level,
        date: score.date,
        timestamp: score.date // For compatibility
      }))

      console.log('Returning mock scores:', cleanedScores.length)

      res.status(200).json({ 
        success: true, 
        scores: cleanedScores,
        total: cleanedScores.length,
        message: 'Mock data (localStorage fallback)'
      })
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch leaderboard',
        details: error.message 
      })
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
