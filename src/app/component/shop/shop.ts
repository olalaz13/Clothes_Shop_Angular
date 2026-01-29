import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { SearchService } from '../../services/search.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './shop.html',
  styleUrls: ['../../../../public/css/style.css']
})
export class Shop implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  activeCategory: string = 'All';
  searchTerm: string = '';
  sortBy: string = 'popular';
  selectedProduct: Product | null = null;
  private searchSub?: Subscription;
  isSidebarOpen = false;
  viewMode: 'grid' | 'list' = 'grid';
  priceMin?: number | null = null;
  priceMax?: number | null = null;
  // Pagination
  currentPage = 1;
  pageSize = 8;
  paginatedProducts: Product[] = [];
  totalPages = 1;

  constructor(
    private productService: ProductService, // Service quản lý sản phẩm
    private cartService: CartService,       // Service giỏ hàng
    private toastService: ToastService,     // Service toast
    private searchService: SearchService,   // Service tìm kiếm global
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.filterProducts();
      this.cdr.markForCheck();
    });

    this.productService.getCategories().subscribe(cats => {
      this.categories = [{ name: 'All' } as Category, ...cats];
      this.cdr.markForCheck();
    });

    // Lắng nghe thay đổi từ thanh tìm kiếm global
    this.searchSub = this.searchService.getTerm().subscribe(term => {
      this.searchTerm = term;
      this.filterProducts();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    // Hủy subscription khi component bị hủy
    this.searchSub?.unsubscribe();
  }

  filterProducts(): void {
    // Lọc cơ bản theo danh mục, từ khóa và sắp xếp
    let base = this.productService.filterProducts(
      this.products,
      this.activeCategory,
      this.searchTerm,
      this.sortBy
    );

    // Lọc theo khoảng giá nếu người dùng nhập
    const min = (this.priceMin != null && !isNaN(Number(this.priceMin))) ? Number(this.priceMin) : -Infinity;
    const max = (this.priceMax != null && !isNaN(Number(this.priceMax))) ? Number(this.priceMax) : Infinity;

    this.filteredProducts = base.filter(p => p.price >= min && p.price <= max);
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(start, end);
    this.cdr.markForCheck();
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Khi thay đổi danh mục
  onCategoryChange(category: string): void {
    this.activeCategory = category;
    this.filterProducts();
    // Nếu màn hình nhỏ (mobile), đóng sidebar sau khi chọn
    if (window.innerWidth <= 1000) {
      this.closeSidebar();
    }
  }

  // Khi thay đổi kiểu sắp xếp
  onSortChange(): void {
    this.filterProducts();
  }

  // Mở quick view
  quickView(product: Product): void {
    this.selectedProduct = product;
  }

  // Đóng modal quick view
  closeModal(): void {
    this.selectedProduct = null;
  }

  // Thêm sản phẩm vào giỏ
  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.toastService.show(`Added <b>${product.title}</b> to cart!`);
  }

  // Toggle sidebar bộ lọc
  toggleFilters(): void {
    if (this.isSidebarOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar(): void {
    this.isSidebarOpen = true;
    document.body.style.overflow = 'hidden'; // Chặn scroll khi mở sidebar
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    document.body.style.overflow = ''; // Mở lại scroll
  }

  // Áp dụng lọc theo giá
  onApplyPrice(): void {
    if (this.priceMin === null || this.priceMin === undefined || this.priceMin === 0) this.priceMin = this.priceMin ?? undefined;
    if (this.priceMax === null || this.priceMax === undefined) this.priceMax = this.priceMax ?? undefined;
    this.filterProducts();
    if (window.innerWidth <= 1000) this.closeSidebar();
  }

  // Chuyển chế độ xem dạng lưới
  setViewGrid(): void {
    this.viewMode = 'grid';
  }

  // Chuyển chế độ xem dạng danh sách
  setViewList(): void {
    this.viewMode = 'list';
  }

  // Lấy tổng số sản phẩm sau khi lọc
  getProductCount(): number {
    return this.filteredProducts.length;
  }

  // WISHLIST
  toggleFavorite(product: Product): void {
    const id = product._id || product.id;
    if (id) {
      const isAdded = this.cartService.toggleFavorite(id.toString());
      this.toastService.show(isAdded ? 'Added to wishlist!' : 'Removed from wishlist!');
    }
  }

  isFavorite(product: Product): boolean {
    const id = product._id || product.id;
    return id ? this.cartService.isFavorite(id.toString()) : false;
  }

  getImgUrl(url: string | undefined): string {
    return this.productService.getImgUrl(url);
  }
}
