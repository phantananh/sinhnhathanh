# Gửi Hanh, với tất cả yêu thương ♡

Website sinh nhật bằng tiếng Việt, sử dụng HTML, CSS và JavaScript thuần. Không cần thư viện, khóa API hay bước build.

## Chạy tại máy phát triển

```sh
cd /workspace/sinhnhathanh
python3 -m http.server 3000 --bind 0.0.0.0
```

Dùng trình duyệt truy cập cổng 3000 trong môi trường hỗ trợ. Có thể mở trực tiếp `index.html` hoặc triển khai ba tệp `index.html`, `style.css`, `script.js` lên dịch vụ lưu trữ website tĩnh.

## Cá nhân hóa

- Sửa lời chúc, tên và nội dung thư trong `index.html`.
- Sửa màu sắc, bố cục trong `style.css`.
- Hiệu ứng thổi/thắp nến, trái tim và hộp thoại nằm trong `script.js`.

Trang không dùng tài nguyên bên ngoài; hỗ trợ điện thoại, bàn phím và tùy chọn giảm chuyển động của thiết bị.

## Ghép ảnh và nhạc

Chọn **Thêm ảnh** để đưa nhiều ảnh JPG, PNG hoặc WebP vào album. Nhấn ảnh để xem lớn; dùng phím mũi tên để chuyển ảnh, Escape để đóng. Ảnh được nén về cạnh dài tối đa 1400 px; không cắt hoặc sửa ảnh gốc.

Chọn file nhạc (khuyến nghị MP3, tối đa 30 MB), rồi dùng nút **Dành cho em** để phát/tạm dừng. Website không tự tải bài hát từ Internet. Bạn cần cung cấp bản nhạc muốn dùng. Trình duyệt yêu cầu tương tác trước khi phát âm thanh.

Sau khi chọn ảnh và nhạc, bấm **Tải thiệp đã ghép ảnh & nhạc**. Tệp `gui-hanh-yeu.html` chứa luôn giao diện, ảnh và nhạc, có thể đưa lên dịch vụ lưu trữ website tĩnh. Các thay đổi chỉ ở trong phiên hiện tại cho đến khi tải thiệp; không có máy chủ lưu ảnh. Chỉ chia sẻ bản thiệp với người bạn muốn chia sẻ ảnh.

## Kiểm tra

```sh
node --check script.js
curl --fail http://127.0.0.1:3000/ > /dev/null
```

Kiểm tra tương tác trên trình duyệt: mở/đóng thư, thổi/thắp nến, thêm ảnh và xem lớn, phát/tạm dừng nhạc, tải thiệp và kiểm tra lại bản đã tải; kiểm tra bố cục điện thoại và máy tính. Không có bộ kiểm thử hay bước build của thư viện.

Bài hát YouTube người dùng chọn đã được tích hợp: https://www.youtube.com/watch?v=QxXYWMIQAcQ. Nút **Dành cho em** mở trình phát YouTube chính thức; đóng trình phát sẽ dừng nhạc. Có thể chọn file âm thanh để thay thế. Video cần Internet và quyền cho phép nhúng của chủ sở hữu; nếu không phát được, dùng liên kết mở trên YouTube. Bản tải xuống giữ liên kết video, không tải hoặc nhúng tệp âm thanh YouTube.
