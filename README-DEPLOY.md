# Chicken Shooter Game - Deploy Guide

## 🚀 Hướng dẫn Deploy lên Vercel

### 1. Push code lên GitHub

```bash
# Khởi tạo git repository (nếu chưa có)
git init

# Add remote repository
git remote add origin https://github.com/Duonggtt/chicken-game.git

# Add tất cả files
git add .

# Commit với message
git commit -m "Initial commit: Chicken Shooter Game with MongoDB integration"

# Push lên GitHub
git push -u origin master
```

### 2. Deploy lên Vercel với Serverless Functions

```bash
# Cài đặt Vercel CLI (nếu chưa có)
npm i -g vercel

# Đăng nhập Vercel
vercel login

# Deploy project (bao gồm cả frontend và API)
vercel --prod

# Domain example: https://chicken-game-sigma.vercel.app/
```

### 3. Cập nhật API URL trong Frontend

API đã được cấu hình để sử dụng Vercel Serverless Functions:

```javascript
// Trong src/config/database.js
apiBaseUrl: process.env.NODE_ENV === 'production' 
  ? 'https://chicken-game-sigma.vercel.app/api'  // Production URL trên Vercel
  : 'http://localhost:3001/api'  // Local development
```

API Endpoints available:
- `https://chicken-game-sigma.vercel.app/api/health` - Health check
- `https://chicken-game-sigma.vercel.app/api/scores` - Save scores
- `https://chicken-game-sigma.vercel.app/api/leaderboard` - Get leaderboard

### 4. Deploy lên Vercel

```bash
# Deploy toàn bộ project (frontend + API)
vercel --prod
```

### 5. Cấu hình Domain (tùy chọn)

Trong Vercel Dashboard:
- Vào project settings
- Thêm custom domain nếu cần
- Cập nhật CORS settings trong backend nếu đổi domain

## 📁 Cấu trúc Project

```
chicken-game/
├── backend/
│   ├── server.js          # Backend API server
│   ├── package.json       # Backend dependencies
│   └── vercel.json        # Backend Vercel config
├── src/
│   ├── components/        # Vue components
│   ├── services/          # Database & sound services
│   ├── store/            # Game state management
│   └── config/           # Database configuration
├── vercel.json           # Frontend Vercel config
└── package.json          # Frontend dependencies
```

## 🔧 Environment Variables

Không cần environment variables vì MongoDB URI đã được hardcode trong code.

## 🌐 CORS Configuration

Backend đã được cấu hình CORS cho:
- localhost (development)
- *.vercel.app (production)

## 📊 Database

- **MongoDB Atlas**: Đã cấu hình sẵn
- **Collection**: `scores`
- **Fallback**: localStorage khi offline

## 🎮 Features

- ✅ Game bắn gà với Vue.js
- ✅ MongoDB database integration
- ✅ Real-time leaderboard
- ✅ Responsive design
- ✅ Sound effects
- ✅ Progressive difficulty
- ✅ Boss battles

## 🐛 Troubleshooting

### CORS Error
- Kiểm tra URL backend trong `database.js`
- Đảm bảo domain được thêm vào CORS config

### Database Connection
- MongoDB Atlas phải allow connections from anywhere (0.0.0.0/0)
- Kiểm tra network access trong MongoDB Atlas

### Deployment Issues
- Kiểm tra build logs trong Vercel dashboard
- Đảm bảo tất cả dependencies được install

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Vercel build logs
2. Browser console errors
3. Network tab trong DevTools
