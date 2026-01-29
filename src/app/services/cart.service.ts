import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { Product, CartItem } from '../models/product.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: CartItem[] = [];       // Danh sách sản phẩm trong giỏ hàng
  private favorites: string[] = [];    // Danh sách sản phẩm yêu thích (giữ theo ID thay vì title)
  private isBrowser: boolean;          // Kiểm tra đang chạy trên trình duyệt hay không
  private cartChanged = new BehaviorSubject<CartItem[]>([]); // BehaviorSubject để luôn có giá trị hiện tại
  cart$ = this.cartChanged.asObservable();

  private wishlistUrl = 'http://localhost:5000/api/users/wishlist';

  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadCart(); // Khi service khởi tạo, tải giỏ hàng từ storage
    this.loadFavorites(); // Tải danh sách yêu thích

    // Theo dõi sự thay đổi của user từ AuthService
    this.authService.currentUser.subscribe(user => {
      // Khi auth thay đổi, luôn tải lại giỏ hàng tương ứng
      this.loadCart();
      if (user) {
        this.syncWishlist();
      } else {
        this.favorites = [];
        this.saveFavorites();
      }
    });
  }

  // Lấy danh sách sản phẩm trong giỏ hàng (trả về bản sao)
  getCart(): CartItem[] {
    return [...this.cart];
  }

  // Thêm sản phẩm vào giỏ hàng với tùy chọn size và color
  addToCart(product: Product, size?: string, color?: string): void {
    const productId = product._id || product.id;
    if (!productId) return;

    // Tìm xem đã có item cùng ID, cùng Size, cùng Color chưa
    const found = this.cart.find(item =>
      item.id === productId &&
      item.size === size &&
      item.color === color
    );

    if (found) {
      found.qty++; // Nếu đã tồn tại thì tăng số lượng
    } else {
      // Nếu chưa có thì thêm mới
      this.cart.push({
        id: productId,
        _id: productId as string,
        title: product.title,
        price: product.price,
        img: product.img,
        qty: 1,
        size: size,
        color: color
      });
    }
    this.saveCart(); // Lưu lại giỏ hàng sau khi thêm
  }

  // Xóa sản phẩm khỏi giỏ hàng (cần match cả variant nếu muốn xóa chính xác variant đó)
  removeFromCart(id: string | number, size?: string, color?: string): void {
    this.cart = this.cart.filter(item =>
      !(item.id === id && item.size === size && item.color === color)
    );
    this.saveCart();
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateQuantity(id: string | number, newQty: number, size?: string, color?: string): void {
    if (newQty < 1) {
      this.removeFromCart(id, size, color);
      return;
    }

    const item = this.cart.find(i => i.id === id && i.size === size && i.color === color);
    if (item) {
      item.qty = newQty;
      this.saveCart();
    }
  }

  // Lấy tổng số lượng sản phẩm (tổng qty)
  getTotalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  // Tính tổng tiền trong giỏ hàng
  getTotalPrice(): number {
    return this.cart.reduce((sum, item) => sum + (item.qty * item.price), 0);
  }

  // Xóa toàn bộ giỏ hàng
  clearCart(): void {
    this.cart = [];
    this.saveCart();
  }

  // Thêm hoặc xóa sản phẩm khỏi danh sách yêu thích
  toggleFavorite(productId: string): boolean {
    const index = this.favorites.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
      this.favorites.splice(index, 1);
      isAdded = false;
    } else {
      this.favorites.push(productId);
      isAdded = true;
    }

    this.saveFavorites();

    // Nếu đã đăng nhập, đẩy lên DB
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.token) {
      this.http.post(`${this.wishlistUrl}/${productId}`, {}, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      }).subscribe({
        error: (err) => console.error('Failed to sync wishlist to DB', err)
      });
    }

    return isAdded;
  }

  // Kiểm tra sản phẩm có nằm trong danh sách yêu thích hay không
  isFavorite(productId: string): boolean {
    return this.favorites.includes(productId);
  }

  // Đồng bộ wishlist từ DB về Local
  syncWishlist(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.token) {
      this.http.get<any[]>(this.wishlistUrl, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      }).subscribe({
        next: (items) => {
          // items là mảng các Product object từ populate
          this.favorites = items.map(item => item._id);
          this.saveFavorites();
        }
      });
    }
  }

  private loadFavorites(): void {
    if (!this.isBrowser) return;
    const user = this.authService.currentUserValue?.username || 'guest';
    const data = this.storageService.getObject<string[]>(`fav_${user}`);
    this.favorites = data || [];
  }

  private saveFavorites(): void {
    if (!this.isBrowser) return;
    const user = this.authService.currentUserValue?.username || 'guest';
    this.storageService.setObject(`fav_${user}`, this.favorites);
  }

  // Tải giỏ hàng từ localStorage
  private loadCart(): void {
    if (!this.isBrowser) return;

    const user = this.authService.currentUserValue?.username || 'guest';
    const cartData = this.storageService.getObject<CartItem[]>(`cart_${user}`);
    this.cart = cartData || [];
    this.cartChanged.next(this.cart);
  }

  // Lưu giỏ hàng hiện tại vào localStorage
  saveCart(): void {
    if (!this.isBrowser) return;

    const user = this.authService.currentUserValue?.username || 'guest';
    this.storageService.setObject(`cart_${user}`, this.cart);
    this.cartChanged.next(this.cart);
  }

  // Lấy số lượng của một sản phẩm cụ thể (theo ID) trong giỏ hàng
  getCartItemCount(productId: string | number): number {
    return this.cart
      .filter(item => item.id === productId)
      .reduce((sum, item) => sum + item.qty, 0);
  }
}
