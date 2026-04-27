# 🤖 Telegram Expense Bot

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-brightgreen?style=for-the-badge&logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Telegram-Bot-blue?style=for-the-badge&logo=telegram" alt="Telegram">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
</p>

> **Giải pháp quản lý chi tiêu nhóm thông minh ngay trên Telegram.** Ghi nhanh, tính toán công nợ tự động, và tối ưu hóa số lượng giao dịch chuyển khoản.

---

## 📑 Mục lục
- [✨ Tính năng nổi bật](#-tính-năng-nổi-bật)
- [🛠 Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [🚀 Bắt đầu nhanh](#-bắt-đầu-nhanh)
- [📖 Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [☁️ Triển khai (Deployment)](#️-triển-khai-deployment)
- [🏗 Cấu trúc dự án](#-cấu-trúc-dự-án)
- [📄 Giấy phép](#-giấy-phép)

---

## ✨ Tính năng nổi bật

| Tính năng | Mô tả chi tiết |
| :--- | :--- |
| ⚡️ **Chế độ Nhanh** | Tự động chia đều cho tất cả thành viên. Phù hợp cho quỹ chung, ăn trưa văn phòng. |
| 🌴 **Chế độ Chi tiết** | Chỉ định chính xác ai dùng món gì. Tuyệt vời cho các chuyến du lịch, tiệc tùng. |
| 🧠 **NLP Parsing** | Hiểu các định dạng tiền linh hoạt: `150k`, `1.5M`, `150,000`. Tự động nhân 1000 cho số nhỏ. |
| 📊 **Tối ưu công nợ** | Sử dụng thuật toán thông minh để giảm thiểu số lượng giao dịch chuyển khoản giữa các thành viên. |
| 🧾 **Nhập Bill thông minh** | Cho phép nhập bill nhiều món cùng lúc (Bill -> Món 1 -> Món 2 -> Xong). |
| 💾 **Persistence** | Dữ liệu được lưu trữ an toàn trên MongoDB Atlas, không lo mất dữ liệu khi restart bot. |

---

## 🛠 Công nghệ sử dụng

- **Runtime:** Node.js (>= 18)
- **Framework:** `node-telegram-bot-api`
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Deployment:** Hỗ trợ Docker, Railway, Heroku, VPS (PM2)

---

## 🚀 Bắt đầu nhanh

### 1. Yêu cầu hệ thống
- Node.js installed
- Một con Bot Telegram (Lấy token từ [@BotFather](https://t.me/BotFather))
- Một tài khoản MongoDB Atlas (Xem [MONGODB_SETUP.md](MONGODB_SETUP.md))

### 2. Cài đặt

```bash
# Clone repository
git clone https://github.com/tranquanghuy/telegram-expense-bot.git
cd telegram-expense-bot

# Cài đặt dependencies
npm install

# Cấu hình biến môi trường
cp .env.example .env
```

### 3. Cấu hình file `.env`
```env
BOT_TOKEN=123456789:ABCDEF...
MONGODB_URI=mongodb+srv://...
```

### 4. Khởi động
```bash
npm run dev  # Chế độ phát triển (nodemon)
# hoặc
npm start    # Chế độ production
```

---

## 📖 Hướng dẫn sử dụng

### 🎯 Quy trình cơ bản
1. Thêm Bot vào nhóm.
2. Gửi `/start` hoặc `/menu` để khởi tạo.
3. Ghi chi tiêu theo cú pháp đơn giản.
4. Gõ `?` để xem ai nợ ai.

### 📝 Cú pháp ghi chi tiêu

#### Chế độ Nhanh (Quỹ chung) ⚡️
Mọi khoản chi sẽ được chia đều cho tất cả người đã từng tương tác với bot.
- `Huy 150k bún bò`
- `An 200k taxi`

#### Chế độ Chi tiết (Du lịch) 🌴
- **Chia cho một số người:** `Huy 150k Bún bò chia Huy, An`
- **Chia theo số tiền chính xác:** `Minh 300k Lẩu chia Minh 100k An 200k`
- **Nhập Bill nhiều món:**
  ```text
  bill Huy 500k
  món Bún bò 150k: Huy An
  món Cafe 50k: An
  xong
  ```

### 📱 Các lệnh điều khiển nhanh
- `?` hoặc `kq`: Xem tổng kết công nợ.
- `ls`: Xem lịch sử chi tiêu.
- `+ Tên`: Thêm thành viên thủ công.

---

## ☁️ Triển khai (Deployment)

### Railway (Recommended)
Bot đã được cấu hình sẵn cho Railway. Chỉ cần kết nối Repo và thêm `BOT_TOKEN`, `MONGODB_URI` vào Variables.

### Docker
```bash
docker build -t expense-bot .
docker run -d --env-file .env expense-bot
```

---

## 🏗 Cấu trúc dự án

```text
src/
├── handlers/      # Logic xử lý tin nhắn & callback
├── models/        # Định nghĩa Mongoose Schemas
├── services/      # Business logic (tính toán, database)
├── utils/         # Helpers (format tiền, parse tên)
└── bot.js         # Khởi tạo bot singleton
```

---

## 📄 Giấy phép

Phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

---
<p align="center">Made with ❤️ by <a href="https://github.com/tranquanghuy">tranquanghuy</a></p>
