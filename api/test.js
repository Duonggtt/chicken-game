// Simple test API function
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

  try {
    console.log('Test API called:', req.method, req.url)
    console.log('Request body:', req.body)
    console.log('Request query:', req.query)
    
    res.status(200).json({ 
      success: true, 
      message: 'Test API working',
      method: req.method,
      timestamp: new Date().toISOString(),
      body: req.body,
      query: req.query
    })
  } catch (error) {
    console.error('Test API error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}
