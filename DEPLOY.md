# Hướng dẫn Deploy Project lên Vercel và Render

Dự án này bao gồm 2 phần:
1. **Frontend (Angular)**: Deploy lên Vercel.
2. **Backend (Node.js)**: Deploy lên Render.

---

## Bước 1: Chuẩn bị Backend (Render)

1. **Push code lên GitHub**: Đảm bảo toàn bộ project (cả `back-end` và frontend) đã được push lên GitHub.
2. Truy cập [Render Dashboard](https://dashboard.render.com/).
3. Chọn **New +** -> **Web Service**.
4. Kết nối với repository GitHub của bạn.
5. Cấu hình Render Service:
   - **Name**: Đặt tên cho service (ví dụ: `clothes-shop-api`).
   - **Root Directory**: `back-end` (Rất quan trọng!).
   - **Runtime**: Node.
   - **Build Command**: `npm install` (hoặc `yarn`).
   - **Start Command**: `node server.js`.
6. **Environment Variables** (Kéo xuống dưới mục Advanced):
   - Thêm các biến môi trường cần thiết từ file `.env` của bạn:
     - `MONGO_URI`: Connection string tới MongoDB Atlas.
     - `JWT_SECRET`: Secret key cho JWT.
     - `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`: Nếu có dùng tính năng gửi mail.
     - `PORT`: Render sẽ tự động set, nhưng bạn cứ để code dùng `process.env.PORT`.
7. Nhấn **Create Web Service**.
8. Đợi deploy thành công. Copy **URL** của backend (ví dụ: `https://clothes-shop-api.onrender.com`).

---

## Bước 2: Cập nhật Frontend

Sau khi có URL của Backend từ Render:

1. Mở file `src/environments/environment.prod.ts` trong project.
2. Cập nhật `apiUrl` với URL vừa copy (nhớ thêm `/api` ở cuối):
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://TEN-APP-CUA-BAN.onrender.com/api' 
   };
   ```
   *(Lưu ý: Đảm bảo không có dấu `/` thừa ở cuối nếu logic code đã xử lý)*

3. Commit và Push thay đổi này lên GitHub.

---

## Bước 3: Deploy Frontend (Vercel)

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard).
2. Chọn **Add New...** -> **Project**.
3. Import repository GitHub của bạn.
4. Cấu hình Project:
   - **Framework Preset**: Angular.
   - **Root Directory**: Để mặc định (`./`) hoặc chọn edit nếu Vercel không tự nhận diện (thường nó sẽ tự nhận diện).
   - **Build Settings**:
     - Vercel thường tự động phát hiện lệnh build (`ng build`).
     - **Output Directory**: Mặc định là `dist/test-angular/browser`. (Kiểm tra lại folder `dist` sau khi build local để chắc chắn đường dẫn đúng).
5. Nhấn **Deploy**.

## Lưu ý quan trọng
- Do đây là Angular SSR (Server-Side Rendering) (thấy có `server.ts`), Vercel có thể hỗ trợ deploy SSR function. Nếu gặp lỗi deploy tĩnh, hãy kiểm tra Output Directory. Nếu chỉ muốn deploy bản Client (SPA), hãy đảm bảo Output Directory trỏ vào thư mục chứa `index.html` sau khi build (thường là `dist/test-angular/browser`).
- Nếu Backend trên Render bị sleep (do dùng gói Free), lần đầu gọi API sẽ mất khoảng 30-60s để khởi động.
