import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

import { User as UserModel } from '../../models/user.model';
import { Order } from '../../models/order.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user.html',
  styleUrls: ['./user.css', '../../../../public/css/style.css']
})
export class UserComponent implements OnInit {
  currentUser: UserModel | null = null;
  orders: Order[] = [];
  wishlistProducts: Product[] = [];
  loading = false;
  currentSection: 'profile' | 'orders' | 'addresses' | 'wishlist' | 'security' = 'profile';

  // Address Modal State
  showAddressModal = false;
  newAddress = {
    title: 'Home',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    default: false
  };

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private productService: ProductService,
    private cartService: CartService,
    private storage: StorageService,
    private toast: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;

      // Only redirect if we are in the browser and definitely have no user
      if (this.authService.isBrowser && !user) {
        this.router.navigate(['/signin']);
      } else if (user) {
        this.loadMyOrders();
        this.loadWishlist();
        // Prefill address name if empty
        if (!this.newAddress.fullName) this.newAddress.fullName = user.fullname || '';
      }
    });

    // Default to 'orders' view if user comes from checkout
    // this.switchSection('orders'); // Let's keep profile as default
  }

  loadMyOrders(): void {
    if (!this.currentUser) return;
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.show('Failed to load orders');
      }
    });
  }

  loadWishlist(): void {
    if (!this.authService.isBrowser) return;
    this.productService.getProducts().subscribe(products => {
      this.wishlistProducts = products.filter(p => {
        const id = p._id || p.id;
        return id ? this.cartService.isFavorite(id.toString()) : false;
      });
    });
  }

  switchSection(section: 'profile' | 'orders' | 'addresses' | 'wishlist' | 'security'): void {
    this.currentSection = section;
    if (section === 'wishlist') this.loadWishlist();
    if (section === 'orders') this.loadMyOrders();
  }

  saveProfile(): void {
    if (this.currentUser) {
      this.authService.updateProfile(this.currentUser).subscribe({
        next: () => this.toast.show('✅ Profile updated successfully!'),
        error: () => this.toast.show('❌ Failed to update profile')
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  get ordersCount(): number {
    return this.orders.length;
  }

  get wishlistCount(): number {
    return this.wishlistProducts.length;
  }

  // ADDRESS MANAGEMENT
  openAddressModal(): void {
    this.showAddressModal = true;
  }

  closeAddressModal(): void {
    this.showAddressModal = false;
  }

  saveAddress(): void {
    if (!this.currentUser) return;
    if (!this.newAddress.street || !this.newAddress.phone) {
      this.toast.show('Please fill in street and phone');
      return;
    }

    if (!this.currentUser.addresses) this.currentUser.addresses = [];

    // If setting as default, unset others
    if (this.newAddress.default) {
      this.currentUser.addresses.forEach((a: any) => a.default = false);
    }

    this.currentUser.addresses.push({ ...this.newAddress });
    this.saveProfile();
    this.closeAddressModal();
    this.newAddress = { title: 'Home', fullName: this.currentUser.fullname || '', phone: '', street: '', city: '', default: false };
  }

  deleteAddress(index: number): void {
    if (this.currentUser && this.currentUser.addresses) {
      this.currentUser.addresses.splice(index, 1);
      this.saveProfile();
    }
  }

  // WISHLIST MANAGEMENT
  removeFromWishlist(product: Product): void {
    const productId = product._id || product.id;
    if (productId) {
      this.cartService.toggleFavorite(productId.toString());
      this.loadWishlist();
      this.toast.show('Removed from wishlist');
    }
  }

  addToCartFromWishlist(product: Product): void {
    this.cartService.addToCart(product);
    this.toast.show('Added to cart!');
  }

  formatPrice(price?: number): string {
    if (price == null) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  getImgUrl(url: string | undefined): string {
    return this.productService.getImgUrl(url);
  }
}