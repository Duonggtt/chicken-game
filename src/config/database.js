// Database Configuration
// Điền thông tin database của bạn vào đây

export const dbConfig = {
  // Thông tin kết nối database
  host: 'localhost',
  port: 3306,
  database: 'chicken_game',
  username: 'root',
  password: '',
  
  // Hoặc sử dụng connection string
  connectionString: '',
  
  // Cấu hình cho MongoDB (nếu sử dụng)
  mongoUri: 'mongodb+srv://admin:sqk5b4DcnOpXqq2n@chicken-game.kvugxpb.mongodb.net/chicken_game',
  
  // API endpoint cho backend (nếu có)
  apiBaseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://chicken-game-backend.vercel.app/api'  // Production URL (sẽ cập nhật sau khi deploy)
    : 'http://localhost:3001/api', // Local development
  
  // Local storage key cho offline mode
  localStorageKey: 'chicken_game_scores'
}

// Export default để sử dụng trong app
export default dbConfig
