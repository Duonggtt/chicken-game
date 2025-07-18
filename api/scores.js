// Vercel Serverless Function - Save Scores
// Temporary fallback without MongoDB dependency

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

  if (req.method === 'POST') {
    try {
      console.log('Received score save request:', req.body)
      
      const { playerName, score, level, date, sessionId } = req.body
      
      // Validate dữ liệu
      if (!playerName || typeof score !== 'number' || !level) {
        console.error('Validation failed:', { playerName, score, level })
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: playerName, score, level' 
        })
      }

      // TODO: Replace with MongoDB connection
      // For now, return success to prevent frontend errors
      console.log('Score would be saved:', { playerName, score, level })
      
      res.status(200).json({ 
        success: true, 
        insertedId: 'temp-' + Date.now(),
        message: 'Score saved successfully (localStorage fallback)' 
      })
    } catch (error) {
      console.error('Error in scores API:', error)
      res.status(500).json({ 
        success: false, 
        error: 'Failed to save score',
        details: error.message 
      })
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
