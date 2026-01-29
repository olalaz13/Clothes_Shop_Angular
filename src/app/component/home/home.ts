import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { SearchService } from '../../services/search.service';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['../../../../public/css/style.css']
})
export class Home implements OnInit {
  // Danh sách tất cả sản phẩm
  products: Product[] = [];
  // Danh sách sản phẩm sau khi lọc theo category, search, sort
  filteredProducts: Product[] = [];
  // Danh sách category để hiển thị filter
  categories: Category[] = [];
  // Category đang được chọn
  activeCategory: string = 'All';
  // Từ khóa tìm kiếm
  searchTerm: string = '';
  // Kiểu sắp xếp: popular / asc / desc
  sortBy: string = 'popular';
  // Sản phẩm đang xem nhanh (quick view modal)
  selectedProduct: Product | null = null;
  // Subscription để hủy khi component bị destroy
  private searchSub?: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Lấy toàn bộ sản phẩm từ service
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.filterProducts();
      this.cdr.markForCheck();
    });

    this.productService.getCategories().subscribe(cats => {
      this.categories = [{ name: 'All' } as Category, ...cats];
      this.cdr.markForCheck();
    });

    // Subcribe để nhận từ khóa tìm kiếm toàn cục từ Navbar
    this.searchSub = this.searchService.getTerm().subscribe(term => {
      this.searchTerm = term;
      this.filterProducts();
      this.cdr.markForCheck();
    });
  }

  // Lọc sản phẩm dựa theo category, searchTerm và sortBy
  filterProducts(): void {
    this.filteredProducts = this.productService.filterProducts(
      this.products,
      this.activeCategory,
      this.searchTerm,
      this.sortBy
    ).slice(0, 8);
  }

  // Khi người dùng chọn category mới
  onCategoryChange(category: string): void {
    this.activeCategory = category;
    this.filterProducts();
  }

  // Khi người dùng nhập tìm kiếm
  onSearchChange(): void {
    this.filterProducts();
  }

  // Hủy subscription để tránh memory leak
  ngOnDestroy(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  // Khi người dùng thay đổi sắp xếp
  onSortChange(): void {
    this.filterProducts();
  }

  // Mở quick view modal của sản phẩm
  quickView(product: Product): void {
    this.selectedProduct = product;
  }

  // Đóng modal xem nhanh
  closeModal(): void {
    this.selectedProduct = null;
  }

  // Thêm sản phẩm vào giỏ hàng
  addToCart(product: Product): void {
    this.cartService.addToCart(product); // Gọi service thêm giỏ hàng
    this.toastService.show(`Added <b>${product.title}</b> to cart!`); // Hiển thị thông báo
  }

  // Lấy số lượng sản phẩm đang hiển thị
  getProductCount(): number {
    return this.filteredProducts.length;
  }

  getImgUrl(url: string | undefined): string {
    return this.productService.getImgUrl(url);
  }
}
