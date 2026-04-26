# Tính Năng Mới: Chia Tùy Chỉnh & Theo Món

## Tổng quan
Đã thêm 2 tính năng mới vào chế độ Chi tiết 🌴 (không ảnh hưởng chế độ Nhanh ⚡️).

---

## Feature 1: Số tiền tùy chỉnh (chia Name:Amount)

### Cú pháp
```
Huy 300k Ăn tối chia Huy:100k An:150k Minh:50k
```

### Cách hoạt động
- Nếu `chia` có dạng `Tên:Số tiền` → dùng số tiền tùy chỉnh từng người
- Nếu tổng tùy chỉnh ≠ tổng bill → bot cảnh báo nhưng vẫn ghi nhận
- Nếu `chia` không có `:` → vẫn chia đều như cũ

### Ví dụ
```
✅ Đã ghi nhận: Ăn tối
━━━━━━━━━━━━━━━━━━
• Người chi: Huy (300.000 đ)
• Chia tùy chỉnh:
  - Huy: 100.000 đ
  - An: 150.000 đ
  - Minh: 50.000 đ
```

### Hỗ trợ định dạng
- `Huy:100k An:150k Minh:50k` (dấu cách)
- `Huy:100k, An:150k, Minh:50k` (dấu phẩy)
- `Huy:100 An:150 Minh:50` (số nguyên < 1000 tự động × 1000)

---

## Feature 2: Theo món (stateful bill flow)

### Cú pháp
```
bill Huy 500k         → bắt đầu bill, Huy là người trả
món Phở 80k: Huy An   → thêm món
món Cafe 50k: Minh    → thêm món
món Nước 30k          → thêm món (chia cho cả nhóm)
xong                  → lưu tất cả
hủy                   → hủy phiên không lưu
```

### Cách hoạt động
1. `bill` mở một "phiên nhập bill" tạm thời cho chat đó
2. Mỗi món append vào phiên đó
3. `xong` → mỗi món được lưu như 1 expense riêng
4. `hủy` → hủy phiên không lưu gì

### Ví dụ output
```
✅ Đã lưu bill của Huy (500.000 đ) — 3 món:
• Phở (80.000 đ) → Huy, An
• Cafe (50.000 đ) → Minh
• Nước (30.000 đ) → Cả nhóm
```

### Lưu ý
- Nếu tổng món khác tổng bill → bot cảnh báo nhưng vẫn lưu
- `món` không có danh sách người → mặc định chia cho cả nhóm
- Chỉ hoạt động ở chế độ Chi tiết 🌴

---

## Thay đổi file

### [MODIFY] src/utils/formatters.js
- Thêm `parseCustomSplit()` function để parse cú pháp `Name:Amount`

### [MODIFY] src/services/sessionService.js
- Thêm `customAmounts` property vào `Expense` type
- Thêm `pendingBill` property vào `Session` type (in-memory only)

### [MODIFY] src/services/expenseService.js
- Cập nhật `calculateBalances()` để xử lý `customAmounts`

### [MODIFY] src/services/reportService.js
- Cập nhật `buildResultsMessage()` để hiển thị số tiền tùy chỉnh
- Cập nhật `buildHistoryMessage()` để hiển thị chi tiết chia tùy chỉnh

### [MODIFY] src/handlers/messageHandler.js
- Thêm logic detect `Name:Amount` trong splitStr
- Thêm 3 command handler: `bill`, `món`, `xong`, `hủy`
- Cập nhật response message để hiển thị chia tùy chỉnh

---

## Không thay đổi
- `src/utils/menuBuilder.js` — UI không đổi
- `src/handlers/callbackHandler.js` — nút bấm không đổi
- Chế độ Nhanh ⚡️ — không bị ảnh hưởng

---

## Testing
Đã test đầy đủ:
- ✅ Parse custom amounts với nhiều định dạng
- ✅ Calculate balances với custom amounts
- ✅ Display custom amounts trong reports
- ✅ Bill flow structure và finalization
- ✅ Syntax validation cho tất cả files

---

## Ví dụ sử dụng thực tế

### Scenario 1: Chia tùy chỉnh
```
Huy 300k Nhậu chia Huy:100k An:150k Minh:50k
```
→ Huy trả 300k, nhưng chỉ chịu 100k, An chịu 150k, Minh chịu 50k

### Scenario 2: Bill theo món
```
bill Huy 500k
món Phở 80k: Huy An
món Cafe 50k: Minh
món Nước 30k
xong
```
→ Huy trả 500k tổng, Phở chia Huy+An, Cafe cho Minh, Nước chia cả nhóm
