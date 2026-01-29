import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { ToastService } from './toast.service';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CartPanelService {
  private isBrowser: boolean; // Kiểm tra môi trường browser để tránh SSR lỗi document

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private productService: ProductService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    // Xác định đang chạy trên trình duyệt không
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Khởi tạo cart panel nếu chưa có
  initCartPanel(): void {
    if (!this.isBrowser) return; // Nếu SSR, bỏ qua
    if (!document.getElementById('cartPanel')) {
      this.createCartPanel(); // Tạo panel lần đầu
    }
  }

  // Tạo DOM panel và overlay
  private createCartPanel(): void {
    const cartPanel = document.createElement('div');
    cartPanel.id = 'cartPanel';

    // CSS cơ bản cho panel: fixed bên phải, shadow, flex column
    cartPanel.style.cssText = `
      position: fixed;
      top: 0;
      right: -420px;
      width: 380px;
      height: 100%;
      background: #fff;
      box-shadow: -4px 0 20px rgba(0,0,0,0.15);
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      padding: 0;
      overflow: hidden;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      font-family: 'Segoe UI', system-ui, sans-serif;
    `;

    // Thêm HTML nội dung
    cartPanel.innerHTML = this.getCartPanelHTML();
    document.body.appendChild(cartPanel);

    // Gắn sự kiện cho nút và overlay
    this.setupCartPanelEvents();
    this.createCartOverlay();
  }

  // HTML panel (header, items, empty state, subtotal + buttons)
  private getCartPanelHTML(): string {
    return `
      <!-- Header -->
      <div style="padding: 24px; border-bottom: 1px solid #f0f0f0; background: #fafafa;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #333;">Your Shopping Cart</h2>
          <button id="closeCart" style="background: none; border: none; font-size: 30px; cursor: pointer; color: #666;">&times;</button>
        </div>
        <div id="cartSummary" style="margin-top: 8px; color: #666; font-size: 0.9rem;">0 items</div>
      </div>

      <!-- Container chứa các item -->
      <div id="cartItems" style="flex: 1; overflow-y: auto; padding: 16px;"></div>

      <!-- Thông báo rỗng -->
      <div id="emptyCart" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: #999; text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 16px;">🛒</div>
        <h3 style="margin: 0 0 8px; color: #666;">Your cart is empty</h3>
        <p style="margin: 0; font-size: 0.9rem;">Add some products to get started</p>
      </div>

      <!-- Footer với tổng tiền và nút -->
      <div style="border-top: 1px solid #f0f0f0; padding: 20px; background: #fafafa;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #666;">Subtotal</span>
          <span id="cartSubtotal" style="font-weight: 600; font-size: 1.1rem;">$0</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 0.9rem;">
          <span style="color: #666;">Shipping</span>
          <span id="cartShippingFee" style="color: #27ae60;">Free</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
          <span style="font-weight: 600;">Total</span>
          <span id="cartTotal" style="font-weight: 700; font-size: 1.3rem; color: #e44d26;">$0</span>
        </div>
        <!-- Nút checkout và continue -->
        <button id="checkoutBtn" style="width: 100%; padding: 14px; background: #e44d26; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">Checkout Now</button>
        <button id="continueShopping" style="width: 100%; padding: 12px; background: transparent; color: #666; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; margin-top: 12px; cursor: pointer;">Continue Shopping</button>
      </div>
    `;
  }

  // Gắn sự kiện cho nút Close, Continue, Checkout
  private setupCartPanelEvents(): void {
    document.getElementById('closeCart')?.addEventListener('click', () => this.closeCartPanel());
    document.getElementById('continueShopping')?.addEventListener('click', () => this.closeCartPanel());
    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
      if (this.cartService.getCart().length === 0) {
        this.toastService.show('Your cart is empty!');
        return;
      }
      this.closeCartPanel();
      this.router.navigate(['/checkout']);
    });
  }

  // Tạo overlay tối phía sau panel
  private createCartOverlay(): void {
    const overlay = document.createElement('div');
    overlay.id = 'cartOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 1999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => this.closeCartPanel());
  }

  // Mở panel
  openCartPanel(): void {
    if (!this.isBrowser) return;
    this.initCartPanel();

    const panel = document.getElementById('cartPanel');
    const overlay = document.getElementById('cartOverlay');
    if (panel && overlay) {
      panel.style.right = '0';
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';
    }
    this.renderCartPanel(); // Render items & totals
  }

  // Đóng panel
  closeCartPanel(): void {
    if (!this.isBrowser) return;
    const panel = document.getElementById('cartPanel');
    const overlay = document.getElementById('cartOverlay');
    if (panel && overlay) {
      panel.style.right = '-420px';
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
    }
  }

  // Render cart items và update tổng tiền
  renderCartPanel(): void {
    if (!this.isBrowser) return;

    const itemsEl = document.getElementById('cartItems');
    const emptyEl = document.getElementById('emptyCart');
    const summaryEl = document.getElementById('cartSummary');
    if (!itemsEl || !emptyEl || !summaryEl) return;

    const cart = this.cartService.getCart();

    if (cart.length === 0) {
      // Cart rỗng
      itemsEl.style.display = 'none';
      emptyEl.style.display = 'flex';
      summaryEl.textContent = '0 items';
      const checkoutBtn = document.getElementById('checkoutBtn');
      if (checkoutBtn) {
        checkoutBtn.style.opacity = '0.6';
        checkoutBtn.style.cursor = 'not-allowed';
      }
    } else {
      // Cart có sản phẩm
      itemsEl.style.display = 'block';
      emptyEl.style.display = 'none';
      const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
      summaryEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
      const checkoutBtn = document.getElementById('checkoutBtn');
      if (checkoutBtn) {
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.cursor = 'pointer';
      }
    }

    this.renderCartItems(itemsEl, cart); // Render từng item
    this.updateCartTotals(); // Cập nhật subtotal & total
  }

  // Render từng item trong cart
  private renderCartItems(itemsEl: HTMLElement, cart: any[]): void {
    itemsEl.innerHTML = ''; // Xóa các item cũ

    cart.forEach((item, index) => {
      const itemTotal = item.qty * item.price;
      const resolvedImg = item.img || '';

      const itemEl = document.createElement('div');
      itemEl.style.cssText = `
        display: flex;
        gap: 12px;
        padding: 16px;
        margin-bottom: 12px;
        background: #fff;
        border-radius: 12px;
        border: 1px solid #f0f0f0;
      `;

      itemEl.innerHTML = `
        <div style="width: 80px; height: 80px; background: #f5f5f5; border-radius: 8px; overflow: hidden;">
          <img src="${this.getImageSrc(resolvedImg)}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600; color: #333;">${item.title}</h4>
            <span style="font-weight: 700; color: #e44d26;">$${itemTotal}</span>
          </div>
          <p style="margin: 0 0 8px; font-size: 0.85rem; color: #888;">
            ${item.size ? `<span style="background:#eee;padding:2px 6px;border-radius:4px;margin-right:4px;">Size: ${item.size}</span>` : ''}
            ${item.color ? `<span style="background:#eee;padding:2px 6px;border-radius:4px;">Color: ${item.color}</span>` : ''}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="decrease-qty" data-index="${index}" style="width:28px;height:28px;border:1px solid #ddd;border-radius:4px;cursor:pointer;">−</button>
              <span style="min-width:30px;text-align:center;font-weight:600;">${item.qty}</span>
              <button class="increase-qty" data-index="${index}" style="width:28px;height:28px;border:1px solid #ddd;border-radius:4px;cursor:pointer;">+</button>
            </div>
            <button class="remove-item" data-index="${index}" style="background:none;border:none;color:#e74c3c;cursor:pointer;padding:4px 8px;border-radius:4px;font-size:0.8rem;">Remove</button>
          </div>
        </div>
      `;

      itemsEl.appendChild(itemEl);
    });

    // Use index to correctly identify the item variant
    itemsEl.querySelectorAll('.decrease-qty').forEach(btn => {
      btn.addEventListener('click', e => {
        const idxStr = (e.target as HTMLElement).getAttribute('data-index');
        if (idxStr !== null) {
          const idx = parseInt(idxStr);
          const item = cart[idx];
          if (item && item.qty > 1) {
            this.cartService.updateQuantity(item.id, item.qty - 1, item.size, item.color);
            this.renderCartPanel();
          }
        }
      });
    });

    itemsEl.querySelectorAll('.increase-qty').forEach(btn => {
      btn.addEventListener('click', e => {
        const idxStr = (e.target as HTMLElement).getAttribute('data-index');
        if (idxStr !== null) {
          const idx = parseInt(idxStr);
          const item = cart[idx];
          if (item) {
            this.cartService.updateQuantity(item.id, item.qty + 1, item.size, item.color);
            this.renderCartPanel();
          }
        }
      });
    });

    itemsEl.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', e => {
        const idxStr = (e.target as HTMLElement).getAttribute('data-index');
        if (idxStr !== null) {
          const idx = parseInt(idxStr);
          const item = cart[idx];
          if (item) {
            this.cartService.removeFromCart(item.id, item.size, item.color);
            this.renderCartPanel();
          }
        }
      });
    });
  }

  // Cập nhật subtotal & total
  private updateCartTotals(): void {
    if (!this.isBrowser) return;
    const subtotal = this.cartService.getTotalPrice();
    const shippingFee = subtotal > 100 ? 0 : 10;
    const total = subtotal + shippingFee;

    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartShippingFee = document.getElementById('cartShippingFee');
    const cartTotal = document.getElementById('cartTotal');

    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal}`;
    if (cartShippingFee) {
      cartShippingFee.textContent = shippingFee === 0 ? 'Free' : `$${shippingFee}`;
      cartShippingFee.style.color = shippingFee === 0 ? '#27ae60' : '#333';
    }
    if (cartTotal) cartTotal.textContent = `$${total}`;
  }

  // Chuẩn hóa path ảnh
  private getImageSrc(img: string): string {
    return this.productService.getImgUrl(img);
  }
}
