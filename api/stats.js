// Vercel Serverless Function - Game Statistics
// Get total players count

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
      console.log('Stats API called for total players count')
      
      // Try to get real stats from localStorage counts or simulate based on scores
      let totalPlayers = 0
      let todayPlayers = 0
      let onlinePlayers = 0
      
      // TODO: When MongoDB is working, replace with actual queries:
      // - Count unique playerNames from scores collection for totalPlayers
      // - Count unique playerNames from today's scores for todayPlayers
      // - Use active sessions or recent activity for onlinePlayers
      
      // For now, generate realistic numbers based on time of day
      const now = new Date()
      const hour = now.getHours()
      
      // Base numbers that increase over time
      totalPlayers = 750 + Math.floor(Math.random() * 500) // 750-1250
      
      // More players during peak hours (6PM-11PM Vietnam time)
      if (hour >= 18 && hour <= 23) {
        todayPlayers = 80 + Math.floor(Math.random() * 40) // 80-120
        onlinePlayers = 15 + Math.floor(Math.random() * 25) // 15-40
      } else if (hour >= 12 && hour <= 18) {
        todayPlayers = 40 + Math.floor(Math.random() * 30) // 40-70
        onlinePlayers = 8 + Math.floor(Math.random() * 15) // 8-23
      } else {
        todayPlayers = 20 + Math.floor(Math.random() * 20) // 20-40
        onlinePlayers = 3 + Math.floor(Math.random() * 10) // 3-13
      }
      
      console.log('Returning realistic stats:', { totalPlayers, todayPlayers, onlinePlayers })

      res.status(200).json({ 
        success: true, 
        stats: {
          totalPlayers,
          todayPlayers,
          onlinePlayers,
          lastUpdated: new Date().toISOString()
        },
        message: 'Game statistics (simulated)'
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch game statistics',
        details: error.message 
      })
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
