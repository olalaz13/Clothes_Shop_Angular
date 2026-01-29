import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  // Hiển thị thông báo toast với nội dung message
  show(message: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Nếu đã có toast đang hiện, xóa nó trước khi tạo toast mới
    const existingToast = document.getElementById('toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Tạo một thẻ div mới làm toast
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 3000;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      font-size: 0.9rem;
      max-width: 300px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    toast.innerHTML = message;  // Gán nội dung thông báo
    document.body.appendChild(toast); // Thêm toast vào body

    // Hiệu ứng hiện toast (slide từ dưới lên)
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Tự động ẩn toast sau 3 giây
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      // Xóa toast khỏi DOM sau khi animation kết thúc
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300); // Thời gian khớp với transition CSS
    }, 3000);
  }
}
