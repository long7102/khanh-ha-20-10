# Gửi Khánh Hạ — 20/10

Website HTML, CSS và JavaScript thuần, không cần cài thư viện hay build.

- `index.html`: trang đăng nhập với ảnh trôi nhẹ.
- `scrapbook.html`: scrapbook, hành trình bảy tháng, album và mini game.
- `public/styles.css`: giao diện xanh dương, responsive và reduced motion.
- `public/app.js`: hiệu ứng cuộn, nghiêng ảnh 3D, bộ đếm, hộp quà bung 27 ảnh rồi mở thư.
- `public/login.js`, `public/access.js`: cửa vào phía trình duyệt. Thông tin đối chiếu lưu dưới dạng SHA-256; đây là trải nghiệm đăng nhập cho trang công khai, không bảo vệ nội dung như xác thực server.
- `public/media/`: 27 ảnh xếp bằng mắt từ tóc ngắn đến tóc dài, được công khai theo yêu cầu.

## GitHub Pages

Trong Settings → Pages, chọn Deploy from a branch → main → / (root) → Save.

Trang dự kiến: https://long7102.github.io/khanh-ha-20-10/

## Thay nội dung

Sửa trực tiếp HTML, CSS hoặc JavaScript rồi commit. Nhạc hiện là placeholder: thêm file vào `public/media/` và đặt `AUDIO_SRC` trong `public/app.js` thành đường dẫn tương đối, ví dụ `./public/media/our-song.mp3`.

Nếu đổi thông tin đăng nhập, cập nhật hash SHA-256 của chuỗi `username:password:salt` trong `public/access.js`.

