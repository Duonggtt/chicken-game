// Vercel Serverless Function - Get Leaderboard
// Stable fallback without MongoDB dependency

export default async function handler(req, res) {
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
      
      // Stable mock data for demo
      const mockScores = [
        { playerName: 'Chicken Master', score: 8500, level: 12, date: new Date(Date.now() - 1000000).toISOString() },
        { playerName: 'Wing Commander', score: 7200, level: 10, date: new Date(Date.now() - 2000000).toISOString() },
        { playerName: 'Feather Fighter', score: 6800, level: 9, date: new Date(Date.now() - 3000000).toISOString() },
        { playerName: 'Egg Hunter', score: 5500, level: 8, date: new Date(Date.now() - 4000000).toISOString() },
        { playerName: 'Rooster Shooter', score: 4900, level: 7, date: new Date(Date.now() - 5000000).toISOString() },
        { playerName: 'Poultry Pro', score: 4200, level: 6, date: new Date(Date.now() - 6000000).toISOString() },
        { playerName: 'Coop Cleaner', score: 3800, level: 5, date: new Date(Date.now() - 7000000).toISOString() },
        { playerName: 'Farm Hero', score: 3200, level: 4, date: new Date(Date.now() - 8000000).toISOString() },
        { playerName: 'Rookie Pilot', score: 2600, level: 3, date: new Date(Date.now() - 9000000).toISOString() },
        { playerName: 'Space Cadet', score: 1800, level: 2, date: new Date(Date.now() - 10000000).toISOString() }
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
