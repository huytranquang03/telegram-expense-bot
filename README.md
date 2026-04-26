# 🤖 Telegram Expense Bot

> Bot Telegram thông minh để quản lý chi tiêu nhóm — ghi nhanh, tính công nợ tự động, và chia tiền tối ưu.

![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Tính Năng

| Tính năng | Mô tả |
|-----------|-------|
| ⚡️ **Chế độ Nhanh** | Mọi khoản chi tự động chia đều cho cả nhóm |
| 🌴 **Chế độ Chi tiết** | Chỉ định chính xác ai dùng món gì |
| 🧠 **Nhập liệu thông minh** | Hiểu `150k`, `1.5M`, `150.000`, số nguyên < 1000 tự nhân 1000 |
| 👥 **Tự động nhận diện thành viên** | Bot tự thêm người vào nhóm khi họ chat |
| 📊 **Tổng kết công nợ** | Thuật toán minimize transactions — ít giao dịch nhất có thể |
| 📋 **Lịch sử giao dịch** | Xem lại toàn bộ khoản chi theo sổ tay |
| 🗑️ **Reset độc lập** | Xóa từng sổ tay riêng biệt mà không ảnh hưởng sổ còn lại |

---

## 🗂️ Cấu Trúc Project

```
telegram-expense-bot/
├── src/
│   ├── bot.js                    # Bot singleton (khởi tạo & validate token)
│   ├── handlers/
│   │   ├── callbackHandler.js    # Xử lý nút bấm inline
│   │   └── messageHandler.js     # Xử lý tin nhắn văn bản
│   ├── services/
│   │   ├── sessionService.js     # Quản lý sessions + đọc/ghi DB
│   │   ├── expenseService.js     # Tính toán số dư và giao dịch
│   │   └── reportService.js      # Tạo báo cáo kết quả & lịch sử
│   └── utils/
│       ├── formatters.js         # Format tiền, tên, parse input
│       └── menuBuilder.js        # Tạo inline keyboard menu
├── data/                         # DB runtime (gitignored)
│   └── .gitkeep
├── index.js                      # Entry point
├── test.js                       # Smoke tests
├── .env.example                  # Template biến môi trường
├── Procfile                      # Railway / Heroku
└── railway.json                  # Railway deploy config
```

---

## 🚀 Cài Đặt & Chạy Local

### 1. Clone repo

```bash
git clone https://github.com/<your-username>/telegram-expense-bot.git
cd telegram-expense-bot
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

```bash
cp .env.example .env
```

Mở `.env` và điền token bot (lấy từ [@BotFather](https://t.me/BotFather)):

```
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
```

### 4. Chạy bot

```bash
npm start          # Production
npm run dev        # Development (auto-reload)
npm test           # Smoke test (không cần token)
```

---

## ☁️ Deploy

### Option A: Railway *(khuyến nghị — miễn phí, 1-click)*

1. Push code lên GitHub
2. Vào [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Chọn repo này
4. Vào tab **Variables** → thêm `BOT_TOKEN=<token của bạn>`
5. Railway tự detect `railway.json` và deploy ✅

> Bot chạy như một **worker** (không cần web server), tự restart khi crash.

### Option B: VPS với PM2

```bash
# Cài PM2 globally
npm install -g pm2

# Clone & cài dependencies trên server
git clone https://github.com/<your-username>/telegram-expense-bot.git
cd telegram-expense-bot && npm install

# Tạo .env
echo "BOT_TOKEN=your_token" > .env

# Chạy với PM2
pm2 start index.js --name expense-bot
pm2 save
pm2 startup   # Auto-start sau khi reboot
```

---

## 💬 Hướng Dẫn Sử Dụng Chi Tiết

### 🎯 Bắt Đầu Nhanh

1. **Thêm bot vào nhóm Telegram** của bạn
2. **Gửi tin nhắn bất kỳ** — bot tự động thêm bạn vào danh sách thành viên
3. **Bấm nút menu** để xem các chức năng chính

### 📱 Các Lệnh Cơ Bản

| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `/start` hoặc `/menu` | Mở menu chính | `/start` |
| `/help` | Xem hướng dẫn sử dụng | `/help` |
| `?` hoặc `kq` | Xem kết quả công nợ | `?` |
| `ls` | Xem lịch sử giao dịch | `ls` |
| `+ Tên1, Tên2` | Thêm thành viên thủ công | `+ Huy, An, Minh` |

### 🔄 Chế Độ Hoạt Động

Bot có **2 chế độ** hoạt động độc lập:

#### ⚡️ **Chế độ Nhanh (Quỹ Chung)**
- Tự động chia đều cho tất cả thành viên
- Phù hợp cho quỹ chung, tiền ăn trưa, đóng góp nhóm
- Mọi khoản chi đều được chia đều

#### 🌴 **Chế độ Chi Tiết (Du Lịch)**
- Chỉ định chính xác ai dùng món gì
- Phù hợp cho đi du lịch, ăn uống theo món
- Hỗ trợ chia theo danh sách hoặc số tiền tùy chỉnh

### 💰 Cách Ghi Chi Tiêu

#### **Chế độ Nhanh ⚡️**

```
Huy 150k
Minh 200k nhậu
Đăng 1.5M xăng xe
```

Tất cả đều tự động chia đều cho cả nhóm.

#### **Chế độ Chi Tiết 🌴**

**1. Chia đều cho một số người:**
```
Huy 150k Bún bò chia Huy, An
Minh 200k Taxi chia Minh, Đăng
```

**2. Chia tùy chỉnh theo số tiền:**
```
Huy 300k Ăn tối chia Huy:100k, An:150k, Minh:50k
```

**3. Chia cho cả nhóm (bỏ "chia"):**
```
An 100k Cafe
```

### 🧾 Tính Năng Bill (Chế độ Chi Tiết)

Để nhập bill chi tiết nhiều món:

```
bill Huy 500k
món Bún bò 150k: Huy An
món Nem rán 100k: Huy Minh
món Cafe 50k: An
xong
```

Các lệnh hỗ trợ:
- `bill <Người> <Số tiền>` — Bắt đầu nhập bill
- `món <Tên> <Số tiền>[: người1 người2]` — Thêm món
- `xong` — Lưu bill
- `hủy` — Hủy bill đang nhập

### 💵 Định Dạng Tiền Được Hỗ Trợ

Bot thông minh hiểu nhiều định dạng tiền:

| Input | Kết quả | Ghi chú |
|-------|---------|---------|
| `150k`, `1.5k` | 150.000 đ / 1.500 đ | Hậu tố k |
| `1.5M`, `1M` | 1.500.000 đ / 1.000.000 đ | Hậu tố M |
| `150.000`, `150,000` | 150.000 đ | Dấu phân cách |
| `120`, `20`, `500` | 120.000 đ / 20.000 đ / 500.000 đ | Số < 1000 tự × 1000 |

### 📊 Xem Kết Quả

**Xem công nợ:**
```
? hoặc kq
```

Bot sẽ hiển thị:
- Tổng chi tiêu nhóm
- Chi tiết từng người (đã chi, đã dùng)
- Trạng thái (nhận lại / cần đóng)
- Hướng dẫn thanh toán tối ưu

**Xem lịch sử:**
```
ls
```

Hiển thị toàn bộ giao dịch theo thứ tự thời gian.

### 👥 Quản Lý Thành Viên

**Tự động thêm:**
- Bot tự động thêm người khi họ gửi tin nhắn đầu tiên

**Thêm thủ công:**
```
+ Tên1, Tên2, Tên3
```

**Xem danh sách:**
- Bấm nút "👥 Danh sách nhóm" trong menu

### 🗑️ Xóa Dữ Liệu

- Bấm nút "🗑️ Xóa sổ tay hiện tại" trong menu
- Chỉ xóa sổ tay đang active, sổ còn lại không bị ảnh hưởng
- Hữu ích khi muốn bắt đầu lại từ đầu

### 🎯 Mẹo Sử Dụng

1. **Bắt đầu với lệnh `/start`** để xem menu đầy đủ
2. **Chuyển chế độ** bằng nút trong menu khi cần thay đổi cách chia
3. **Dùng `?` thường xuyên** để kiểm tra công nợ
4. **Mô tả ngắn gọn** giúp dễ theo dõi lịch sử
5. **Kiểm tra kết quả** sau khi ghi chi để đảm bảo đúng

### ⚠️ Lưu Ý Quan Trọng

- **Bot hoạt động theo nhóm** — mỗi nhóm có dữ liệu riêng biệt
- **Dữ liệu được lưu local** — không đồng bộ giữa các nhóm
- **Chế độ hoạt động độc lập** — dữ liệu chế độ Nhanh và Chi tiết tách biệt
- **Xóa sổ tay không ảnh hưởng sổ còn lại** — an toàn để reset từng chế độ

---

## 🛠️ Development

```bash
npm run lint    # Kiểm tra code style với ESLint
npm test        # Chạy smoke test
```

---

## 📄 License

MIT © tranquanghuy
