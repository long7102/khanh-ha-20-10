# Tự thay ảnh và chữ

Mở `public/memories.js` trên GitHub, bấm biểu tượng bút chì để sửa, rồi Commit changes. Chờ GitHub Pages xuất bản xong và tải lại website.

## Ba ảnh đầu trang

Ở đầu file có `HA_HERO_PHOTOS`, đúng ba dòng tương ứng ảnh trái, giữa, phải:

```js
{ photo: 6, caption: 'Chữ dưới tấm ảnh', position: '50% 28%' }
```

- `photo`: chọn số 1 đến 27 từ bộ ảnh hiện có.
- `caption`: chữ dưới ảnh. Chữ luôn nằm trong khung giấy.
- `position`: vị trí cắt ảnh; ví dụ `50% 15%` để thấy phần phía trên nhiều hơn.
- Nếu dùng ảnh mới, tải ảnh vào `public/media/`, rồi thêm `image: './public/media/ten-anh.jpg'` vào dòng tương ứng.

## Từng ảnh trong sách

`HA_MEMORIES` có 27 dòng riêng, theo đúng thứ tự sách:

```js
{ photo: 1, caption: 'Caption dưới ảnh', title: 'Tiêu đề khi mở ảnh', text: 'Đoạn văn của riêng bức ảnh này.' }
```

- `caption` là chữ trên trang sách.
- `title` và `text` hiện khi bấm phóng to ảnh. Để trống `title` thì dùng caption.
- Để trống cả caption và title thì hiện số ảnh; đoạn văn trống sẽ được ẩn.
- Có thể thêm `image` và `position` như ba ảnh đầu trang. Khung ảnh trong sách giữ tỉ lệ **3:4**.
- Dùng `\n` trong `text` để xuống dòng. Nếu câu có dấu nháy đơn `'`, dùng dấu nháy kép `"..."` bao quanh cả câu.

## Xem thử trước giờ mở quà

Mở `https://long7102.github.io/khanh-ha-20-10/?preview=1`, đăng nhập như cũ. Link thường vẫn chờ 00:00 ngày 20/10/2026, giờ Việt Nam.