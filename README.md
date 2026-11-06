# Hanh’s day — Birthday camera

Website sinh nhật bằng tiếng Việt với giao diện máy ảnh kỹ thuật số retro màu bạc–xanh, lời nhắn tự nhiên dành cho Hanh, bánh thổi nến, album 15 ảnh và bài hát **Dành cho em**. HTML, CSS và JavaScript thuần; không cần cài thư viện, khóa API, cơ sở dữ liệu hay bước build.

## Chạy tại máy phát triển

```sh
cd /workspace/sinhnhathanh
python3 -m http.server 3000 --bind 127.0.0.1
```

Triển khai toàn bộ `index.html`, `style.css`, `script.js` và thư mục `assets/` lên dịch vụ lưu trữ website tĩnh. Phông Nunito tiếng Việt được lưu cục bộ trong `assets/fonts/`, kèm giấy phép OFL. Chỉ trình phát YouTube cần kết nối bên ngoài.

## Mở thiệp

1. Nhập **0611** bằng bàn phím số trên thiệp hoặc bàn phím thiết bị, rồi bấm **Mở máy ảnh** (hoặc Enter).
2. Mã thiếu hoặc sai sẽ có nhắc thử lại, không mở nội dung hoặc tải trình phát nhạc.
3. Tùy chọn **Bật nhạc khi mở máy** mặc định được chọn. Bỏ chọn nếu muốn mở thiệp trước rồi bật nhạc sau.
4. Nhấn **Khóa máy** để đóng lại và dừng nhạc. Tải lại trang cũng trở về màn khóa.

Mật mã giao diện nằm trong hằng `PASSCODE` ở `script.js`; đây là một màn mở quà phía trình duyệt, không phải hệ thống xác thực máy chủ.

## Nội dung và tương tác

- Sửa lời chúc, tên và nội dung thư trong `index.html`.
- Sửa màu sắc, bố cục trong `style.css`.
- Dùng hai nút mũi tên trên máy ảnh để chuyển qua 15 ảnh. Nút chụp tạo hiệu ứng flash và mở ảnh lớn; chế độ giảm chuyển động bỏ hiệu ứng flash. Nút **Lời nhắn** và **Dành cho em** mở thư và điều khiển nhạc.
- Nhấn **Thổi nến thôi** để tắt nến, xem lời chúc và hiệu ứng trái tim; nhấn lần nữa để thắp lại.
- Mở thư từ nút ở đầu hoặc cuối trang; nhấn Escape hoặc nút đóng để đóng thư.
- Hỗ trợ màn hình từ 320 px, thao tác bàn phím và tùy chọn giảm chuyển động của thiết bị.

## Album và file nhạc riêng

Trang chia sẻ ẩn các nút chỉnh sửa. Thêm `?edit=1` vào cuối địa chỉ để vào chế độ chỉnh sửa cục bộ, rồi nhập mật mã.

Sau khi mở khóa ở chế độ này, nhấn **Thêm những tấm ảnh của Hanh** hoặc mở mục **Trang trí thêm cho món quà** để chọn nhiều ảnh JPG, PNG hoặc WebP. Nhấn ảnh để xem lớn; dùng phím mũi tên chuyển ảnh và Escape để đóng. Ảnh được nén về cạnh dài tối đa 1400 px, không sửa tệp gốc.

Có thể chọn file âm thanh riêng (khuyến nghị MP3, tối đa 30 MB) để thay cho YouTube. Nút nhạc cho phép phát và tạm dừng. Các lựa chọn được giữ trong bộ nhớ của phiên hiện tại, chưa lưu lên máy chủ hay repository.

Bấm **Tải thiệp đã ghép ảnh & nhạc** để tải `gui-hanh-yeu.html`. Tệp này chứa giao diện, phông chữ, ảnh và file âm thanh đã chọn; vẫn bắt đầu bằng màn mật mã **0611**. Khi không có ảnh, bản thiệp đã tải sẽ ẩn phần album trống. Có thể dùng riêng tệp HTML này để triển khai website.

## Nhạc YouTube

Đã tích hợp video người dùng chọn: https://www.youtube.com/watch?v=QxXYWMIQAcQ.

Trình phát chính thức chỉ được tạo sau khi nhập đúng mật mã và chọn mở cùng nhạc, hoặc sau khi nhấn nút **Dành cho em**. Đóng trình phát hoặc khóa thiệp sẽ xóa iframe để dừng phát. Đóng thư không dừng nhạc nền.

Video cần Internet, trình duyệt cho phép phát và chủ video cho phép nhúng. Nếu không phát được, có liên kết mở video gốc trên YouTube. Bản HTML tải xuống giữ liên kết video, không tải bản ghi âm từ YouTube. Chạy qua website có địa chỉ HTTP(S) để YouTube nhận được thông tin nguồn trang cần thiết.

## Kiểm tra

```sh
node --check script.js
git diff --check
curl --fail http://127.0.0.1:3000/ > /dev/null
```

Kiểm tra trình duyệt bao gồm: trạng thái khóa ban đầu, mã thiếu/sai/đúng, nhập bằng bàn phím và bàn phím số, đóng/mở lại thiệp, nhạc chỉ khởi tạo sau mở khóa, mở/đóng thư, thổi/thắp nến, nhập/xem ảnh, phát/tạm dừng file âm thanh, xuất và mở lại bản HTML độc lập, bố cục 320–1440 px và chế độ giảm chuyển động.

Trong môi trường đám mây hiện tại, chức năng tạo/đóng iframe YouTube được kiểm tra bằng phản hồi mô phỏng vì proxy chặn truy cập YouTube; việc phát âm thanh thực tế của video ngoài chưa được xác minh. File âm thanh cục bộ đã được kiểm tra phát/tạm dừng và bắt đầu sau khi nhập đúng mã.

## Ảnh đã ghép

Đã đưa đủ 15 ảnh từ file ZIP người dùng cung cấp vào `assets/photos/`, giữ nguyên nội dung và chất lượng tệp gốc. Danh sách và thứ tự album được lưu trong JSON `card-assets` ở `index.html`. Ảnh chỉ được tạo trong giao diện sau khi mở khóa; nhấn ảnh để xem đầy đủ. Bản HTML xuất ra nhúng tất cả ảnh vào cùng tệp.

## GitHub Pages

Toàn bộ mã và tài nguyên phục vụ từ nhánh `main`, thư mục gốc. Tệp `.nojekyll` cho phép phục vụ website tĩnh trực tiếp. Trong repository, chọn **Settings → Pages → Deploy from a branch → main → /(root)** và Save. Chỉ gửi link do GitHub báo sau khi triển khai hoàn tất.
