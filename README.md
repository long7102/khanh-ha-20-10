# Gửi Khánh Hạ — 20/10

Một website Love Scrapbook responsive trên laptop và điện thoại, với hành trình bảy tháng, album tóc ngắn đến tóc dài và mini game 20/10. Nhạc vẫn là placeholder để thay sau.

## Chạy trên máy

Yêu cầu Node.js 20 trở lên. Sao chép `.env.example` thành `.env`, điền `SITE_USERNAME`, `SITE_PASSWORD` và một `SESSION_SECRET` ngẫu nhiên dài ít nhất 32 ký tự. Không commit file `.env`.

```bash
npm start
```

Mở `http://localhost:3000`. Node không tự nạp `.env`; khi chạy cục bộ, xuất các biến môi trường trong terminal hoặc dùng trình quản lý môi trường của nền tảng triển khai. Ví dụ PowerShell:

```powershell
$env:SITE_USERNAME = "ten-dang-nhap"
$env:SITE_PASSWORD = "mat-khau-rieng"
$env:SESSION_SECRET = "mot-chuoi-ngau-nhien-dai-it-nhat-32-ky-tu"
npm start
```

## Thay nội dung

- `private/home.html`: lời chúc, thư, các mốc câu chuyện và món quà bí mật.
- `public/styles.css`: màu sắc, bố cục và hiệu ứng.
- `public/app.js`: đếm ngày, album xếp từ tóc ngắn đến tóc dài, hiệu ứng cuộn, bất ngờ, mini game và nhạc.
- 27 ảnh cá nhân nằm trong `public/media/photo-01.jpg` đến `photo-27.jpg`, được xếp bằng mắt từ tóc ngắn đến dài và được đưa lên repository công khai theo yêu cầu. Có thể thay từng ảnh mà không cần sửa mã.
- Nhạc: đặt file trong `public/media/`, rồi gán đường dẫn vào `AUDIO_SRC` trong `public/app.js`.

## Bảo vệ truy cập

Server chỉ gửi trang nội dung và ảnh khi có cookie phiên đã ký. Username, password và khóa ký được đọc từ biến môi trường phía server. Nếu thiếu cấu hình, đăng nhập bị vô hiệu hóa. Cookie dùng `HttpOnly`, `SameSite=Lax` và `Secure` trên HTTPS. Nên triển khai sau HTTPS và đặt bí mật trong phần cấu hình môi trường của nhà cung cấp hosting. Không dùng GitHub Pages vì đây là ứng dụng cần server.

Đây là cổng truy cập đơn giản cho một website cá nhân, không có hệ thống tài khoản hay khôi phục mật khẩu. Đổi thông tin đăng nhập bằng cách cập nhật biến môi trường và khởi động lại server.

