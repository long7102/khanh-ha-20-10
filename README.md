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

Sửa trực tiếp HTML, CSS hoặc JavaScript rồi commit. Nhạc piano được lưu tại `public/media/piano-instrumental.mp3`; điều khiển phát, dừng, âm lượng và tiến độ nằm trong `public/music.js`. Nhạc chỉ bắt đầu khi bấm, không tự phát.

Nếu đổi thông tin đăng nhập, cập nhật hash SHA-256 của chuỗi `username:password:salt` trong `public/access.js`.
`public/memories.js`: sửa title/paragraph của 27 ảnh và lời nhắn mặt lưng của 4 polaroid. Album sách tự lật khi ở trong màn hình; ảnh có thể rút ra toàn màn hình và trả về trang cũ. Hiệu ứng hỗ trợ prefers-reduced-motion.

`public/gift.js`: quà phun ảnh một lần trong mỗi phiên tab, sau đó khóa hộp. Thư bay ra từ hộp vào cửa sổ đọc; nút riêng cho phép đọc lại thư mà không phun ảnh lần nữa. `public/ocean.css` định nghĩa sóng, tia nắng dưới nước, rong biển và trạng thái nền khi nhạc phát.

