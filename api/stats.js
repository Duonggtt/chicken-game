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
      
      // TODO: Replace with actual MongoDB query
      // For now, get from localStorage simulation or mock data
      
      // Mock data for demonstration
      const totalPlayers = Math.floor(Math.random() * 1000) + 500 // Random between 500-1500
      const todayPlayers = Math.floor(Math.random() * 50) + 10 // Random between 10-60
      const onlinePlayers = Math.floor(Math.random() * 20) + 5 // Random between 5-25
      
      console.log('Returning stats:', { totalPlayers, todayPlayers, onlinePlayers })

      res.status(200).json({ 
        success: true, 
        stats: {
          totalPlayers,
          todayPlayers,
          onlinePlayers,
          lastUpdated: new Date().toISOString()
        },
        message: 'Game statistics retrieved'
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
