# 🐔 Chicken Shooter### 🎨 Đồ Họa & Âm Thanh
- **🌟 Đồ Họa Stunning**: Background động thay đổi theo level
- **🎵 Hệ Thống Âm Thanh**: Audio toàn diện với nhạc nền và hiệu ứng
- **💥 Hiệu Ứng Particle**: Nổ, power-ups và phản hồi visual
- **🎪 Animation Mượt**: CSS animations với Animate.css
- **📱 Responsive Design**: Tối ưu cho mobile, tablet và desktop Gà Siêu Hấp Dẫn 🚀

Một trò chơi phiêu lưu không gian hoành tráng được xây dựng bằng Vue.js, nơi bạn điều khiển phi thuyền để chiến đấu với làn sóng gà và các boss mạnh mẽ!

🎮 **[CHƠI NGAY TẠI ĐÂY](https://chicken-game-sigma.vercel.app/)** 🎮

## ✨ Tính Năng Nổi Bật

### 🎯 Gameplay Hấp Dẫn
- **🔥 Độ Khó Tăng Dần**: Hệ thống difficulty scaling không giới hạn
- **👹 Boss Battles**: Trận đánh boss epic sau mỗi 3 level với cơ chế độc đáo
- **⚡ Hệ Thống Power-up**: Thu thập vũ khí đặc biệt (Rapid Fire, Spread Shot, Shield, Extra Life)
- **🎯 Auto-targeting**: Phi thuyền theo dõi chuột/chạm với bắn tự động
- **❤️ Nhiều Mạng**: Bắt đầu với 3 mạng, kiếm thêm qua power-ups
- **♾️ Level Vô Hạn**: Gameplay không giới hạn với thử thách tăng dần
- **📈 Số Gà Vừa Phải**: Số gà cần tiêu diệt tăng hợp lý theo level (Level 1: 15 gà → Level 5: 40 gà → Level 10: 65 gà)
- **🐔 Spawn Nhiều Gà**: Bắt đầu với 2 gà, level cao spawn tới 6 gà cùng lúc mỗi round
- **⚡ Spawn Nhanh**: Thời gian spawn giảm mạnh mỗi level (từ 800ms xuống 150ms)
- **🎆 Hiệu Ứng Bắn Đa Dạng**: Bullet trails, particle effects, và visual feedback phong phú

### 🎨 Đồ Họa & Âm Thanh
- **🌟 Đồ Họa Stunning**: Background động thay đổi theo level
- **� Hệ Thống Âm Thanh**: Audio toàn diện với nhạc nền và hiệu ứng
- **💥 Hiệu Ứng Particle**: Nổ, power-ups và phản hồi visual
- **� Animation Mượt**: CSS animations với Animate.css
- **📱 Responsive Design**: Tối ưu cho mobile, tablet và desktop
- **🌟 Đồ Họa Stunning**: Background động thay đổi theo level
- **🎵 Hệ Thống Âm Thanh**: Audio toàn diện với nhạc nền và hiệu ứng
- **💥 Hiệu Ứng Particle**: Nổ, power-ups và phản hồi visual
- **🎪 Animation Mượt**: CSS animations với Animate.css
- **📱 Responsive Design**: Tối ưu cho mobile, tablet và desktop

### 🏆 Hệ Thống Game
- **📊 Bảng Xếp Hạng**: Lưu điểm cao local và online với MongoDB Atlas
- **👤 Hồ Sơ Người Chơi**: Session có tên với lưu điểm liên tục
- **📈 Thống Kê Thật**: Đếm số người chơi thực tế, không fake data
- **⏸️ Hệ Thống Pause**: Tạm dừng hoàn chỉnh với bảo toàn trạng thái

### 📊 Thống Kê Người Dùng Thật
- **👥 Tổng Người Chơi**: Đếm tổng số người đã truy cập game
- **📅 Người Chơi Hôm Nay**: Thống kê người chơi trong ngày
- **🟢 Online Hiện Tại**: Số người đang online thực tế
- **📈 Tracking Thông Minh**: Hệ thống theo dõi dựa trên thời gian thực

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **Vue.js 3**: Composition API với state management reactive
- **TailwindCSS**: Styling system với custom game classes
- **Vite**: Build tool nhanh cho development và production

### Audio & Effects
- **Howler.js**: Quản lý âm thanh nâng cao
- **Tone.js**: Synthesized sound fallback
- **Animate.css**: Hiệu ứng animation mượt mà

### Database & Deployment
- **MongoDB Atlas**: Cloud database cho leaderboard và user tracking
- **Vercel**: Serverless deployment với API functions
- **GitHub**: Version control và CI/CD

### APIs & Services
- **Real-time Tracking**: User visit và game session tracking
- **RESTful APIs**: `/api/scores`, `/api/leaderboard`, `/api/stats`, `/api/track`
- **CORS Support**: Cross-origin requests cho production

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js (v16 trở lên)
- npm hoặc yarn
- Git (cho clone repository)

### Cài Đặt Local

1. **Clone repository**:
   ```bash
   git clone https://github.com/Duonggtt/chicken-game.git
   cd chicken-game
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Cấu hình database** (tùy chọn):
   - Chỉnh sửa connection string trong `/api/scores.js` và `/api/leaderboard.js`
   - Game hoạt động offline với localStorage nếu không có database

4. **Chạy development server**:
   ```bash
   npm run dev
   ```

5. **Build cho production**:
   ```bash
   npm run build
   ```

### Deploy lên Vercel

1. **Kết nối GitHub repository** với Vercel
2. **Import project** từ GitHub
3. **Configure environment variables** (nếu cần)
4. **Deploy** - Vercel tự động build và deploy

## 🎮 Điều Khiển Game

### 🖥️ Desktop
- **🖱️ Chuột**: Di chuyển phi thuyền
- **🔫 Auto-shoot**: Bắn tự động
- **⌨️ ESC**: Pause/unpause game
- **⌨️ Spacebar**: Bắn thủ công (nếu tắt auto-shoot)

### 📱 Mobile/Touch
- **👆 Chạm**: Di chuyển phi thuyền bằng cách chạm màn hình
- **🔫 Auto-shoot**: Bắn tự động
- **📱 Touch controls**: Tất cả UI elements đều touch-friendly

## 🗄️ Cấu Hình Database

### MongoDB Atlas (Production)
```javascript
// Connection string trong API files
const MONGO_URI = 'mongodb+srv://username:password@cluster.mongodb.net/chicken_game'
```

### Local Development
```javascript
// Fallback to localStorage
const localStorageKey = 'chicken_game_scores'
```

## 📊 API Endpoints

### 🎯 Game APIs
- **POST** `/api/scores` - Lưu điểm game
- **GET** `/api/leaderboard?limit=10` - Lấy bảng xếp hạng
- **GET** `/api/stats` - Thống kê người chơi thật
- **POST** `/api/track` - Track user visits và game sessions

### � Tracking System
```javascript
// Track visit
POST /api/track
{
  "action": "visit",
  "userAgent": "browser info",
  "sessionId": "unique_session_id"
}

// Track game start
POST /api/track
{
  "action": "game_start",
  "sessionId": "unique_session_id"
}
```

## 🎖️ Tính Năng Đặc Biệt

### 🏆 Bảng Xếp Hạng
- **💾 Lưu MongoDB**: Điểm số được lưu vào cloud database
- **🔄 Fallback System**: Tự động chuyển sang localStorage nếu API lỗi
- **📝 Validation**: Kiểm tra tên người chơi và điểm số

### 📊 Thống Kê Thực Tế
- **👥 Real User Count**: Đếm người dùng thật, không fake
- **⏰ Time-based**: Thống kê thay đổi theo giờ thực
- **🔄 Auto Refresh**: Cập nhật mỗi 30 giây

### 🎨 UI/UX
- **🎭 Animation**: Smooth transitions với Animate.css
- **📱 Responsive**: Hoàn hảo trên mọi device
- **🌙 Dark Theme**: Giao diện tối gaming professional
- **🎯 Accessibility**: Semantic HTML và keyboard support

## 🔧 Cấu Trúc Project

```
chicken-game/
├── api/                    # Vercel serverless functions
│   ├── scores.js          # Save game scores
│   ├── leaderboard.js     # Get leaderboard
│   ├── stats.js           # User statistics
│   └── track.js           # User tracking
├── src/
│   ├── components/        # Vue components
│   ├── services/          # Business logic
│   ├── store/            # State management
│   └── engine/           # Game engine
├── public/               # Static assets
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies
```

## 👨‍💻 Tác Giả

**Designed by DTT** - *Initial work* - [GitHub](https://github.com/Duonggtt/chicken-game)

## 🌐 Links

- **🎮 Live Demo**: [https://chicken-game-sigma.vercel.app/](https://chicken-game-sigma.vercel.app/)
- **📦 Repository**: [https://github.com/Duonggtt/chicken-game](https://github.com/Duonggtt/chicken-game)
- **🚀 Vercel**: Auto-deployed from GitHub

---

**🎮 Sẵn sàng bắt đầu cuộc phiêu lưu không gian? Chạy `npm run dev` và tận hưởng! 🚀🐔**
