# Chicken Shooter Game - Backend Setup

## Cài đặt Backend API

### 1. Cài đặt Node.js dependencies

```bash
cd backend
npm install
```

### 2. Chạy backend server

```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

Backend server sẽ chạy trên `http://localhost:3001`

### 3. API Endpoints

- **POST** `/api/scores` - Lưu điểm số mới
- **GET** `/api/leaderboard?limit=10` - Lấy bảng xếp hạng
- **GET** `/api/top-players` - Lấy top players
- **GET** `/api/health` - Health check
- **DELETE** `/api/scores/clear` - Xóa tất cả scores (chỉ để test)

### 4. Database Configuration

Backend sử dụng MongoDB Atlas với URI:
```
mongodb+srv://admin:sqk5b4DcnOpXqq2n@chicken-game.kvugxpb.mongodb.net/chicken_game
```

### 5. Test API

Có thể test API bằng curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Lưu điểm số
curl -X POST http://localhost:3001/api/scores \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Test Player","score":1500,"level":5}'

# Lấy leaderboard
curl http://localhost:3001/api/leaderboard?limit=5
```

## Chạy Full Stack

### 1. Chạy Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```

### 2. Chạy Frontend (Terminal 2)
```bash
cd ..
npm run dev
```

### 3. Truy cập game
Mở browser tại `http://localhost:5173`

## Features

- ✅ Lưu điểm số tự động vào MongoDB
- ✅ Bảng xếp hạng real-time từ database
- ✅ Fallback localStorage khi offline
- ✅ Auto-sync khi online trở lại
- ✅ CORS enabled cho frontend
- ✅ Error handling và validation

## Troubleshooting

### Backend không kết nối MongoDB
- Kiểm tra internet connection
- Kiểm tra MongoDB Atlas URI
- Kiểm tra firewall/network settings

### Frontend không kết nối Backend
- Đảm bảo backend đang chạy trên port 3001
- Kiểm tra CORS settings
- Kiểm tra `apiBaseUrl` trong `src/config/database.js`

### CORS Error
- Đảm bảo frontend chạy trên `http://localhost:5173`
- Kiểm tra CORS config trong `backend/server.js`
