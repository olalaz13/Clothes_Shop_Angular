import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  activeSection = 'dashboard';
  searchTerm = '';
  isBrowser: boolean;

  // Data
  products: Product[] = [];
  orders: any[] = [];
  employees: any[] = [];
  customers: any[] = [];
  categories: Category[] = [];

  // UI state
  loading = false;
  currentProduct: Partial<Product> = {
    sizes: [],
    colors: []
  };
  isEditing = false;
  showModal = false;
  showChat = false;
  isSidebarOpen = false;
  notifications = [
    { id: 1, text: 'New order #1234 received', time: '5m ago', read: false },
    { id: 2, text: 'Stock low for Denim Jacket', time: '1h ago', read: false },
    { id: 3, text: 'Customer message from John', time: '2h ago', read: true }
  ];
  showNotifications = false;

  chatMessages = [
    { user: 'Admin', text: 'Chào cả đội, hôm nay tập trung vào chương trình sale hè nhé.', time: '09:00 AM', isMe: false },
    { user: 'Employee 1', text: 'Đã rõ! Tôi sẽ cập nhật banner.', time: '09:05 AM', isMe: true }
  ];
  newMessage = '';

  // User Edit State
  showUserModal = false;
  editingUser: any = {};
  isUserEditing = false;

  // Order View State
  showOrderModal = false;
  selectedOrder: any = null;

  // Product View State
  showProductModal = false;
  selectedProduct: any = null;

  // Category State
  showCategoryModal = false;
  editingCategory: Partial<Category> = {};
  isCategoryEditing = false;

  public sumRevenue = 0;

  constructor(
    private productService: ProductService,
    private adminService: AdminService,
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = this.authService.isBrowser;
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.refreshAllData();
    }
  }

  refreshAllData(): void {
    if (!this.isBrowser) return;
    this.loading = true;
    let counts = 0;
    const checkDone = () => {
      counts++;
      if (counts >= 3) {
        this.loading = false;
        this.cdr.detectChanges();
      }
    };

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        checkDone();
      },
      error: () => { checkDone(); }
    });

    this.loadCategories(checkDone);

    this.adminService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.sumRevenue = this.orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.total || 0), 0);
        checkDone();
      },
      error: () => { checkDone(); }
    });

    this.adminService.getCustomers().subscribe({
      next: (data) => { this.customers = data; checkDone(); },
      error: () => { checkDone(); }
    });

    if (this.isAdmin) {
      this.loadEmployees();
    }
  }

  loadCategories(callback?: () => void): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        if (callback) callback();
      },
      error: () => { if (callback) callback(); }
    });
  }

  get filteredCategories() {
    const term = this.searchTerm.toLowerCase();
    return this.categories.filter(c =>
      !term || c.name.toLowerCase().includes(term)
    );
  }

  getProductCountByCategory(cat: string): number {
    return this.products.filter(p => p.cat === cat).length;
  }

  get filteredProducts() {
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p =>
      !term ||
      p.title.toLowerCase().includes(term) ||
      p.cat?.toLowerCase().includes(term)
    );
  }

  get filteredOrders() {
    const term = this.searchTerm.toLowerCase();
    return this.orders.filter(o =>
      !term ||
      o._id?.toLowerCase().includes(term) ||
      o.user?.fullname?.toLowerCase().includes(term) ||
      o.user?.username?.toLowerCase().includes(term) ||
      o.status?.toLowerCase().includes(term)
    );
  }

  get filteredEmployees() {
    const term = this.searchTerm.toLowerCase();
    return this.employees.filter(e =>
      !term ||
      e.fullname?.toLowerCase().includes(term) ||
      e.username?.toLowerCase().includes(term)
    );
  }

  get filteredCustomers() {
    const term = this.searchTerm.toLowerCase();
    return this.customers.filter(c =>
      !term ||
      c.fullname?.toLowerCase().includes(term) ||
      c.username?.toLowerCase().includes(term)
    );
  }

  setSection(section: string): void {
    this.activeSection = section;
    this.isSidebarOpen = false;
    this.searchTerm = '';

    if (section === 'products') this.loadProducts();
    else if (section === 'orders') this.loadOrders();
    else if (section === 'employees') this.loadEmployees();
    else if (section === 'customers') this.loadCustomers();
    else if (section === 'dashboard' || section === 'analytics') this.refreshAllData();

    this.cdr.detectChanges();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.cdr.detectChanges();
  }

  // --- Products ---
  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.toast.show('Failed to load products');
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal(): void {
    this.currentProduct = {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Black', hex: '#1e293b' },
        { name: 'Indigo', hex: '#6366f1' },
        { name: 'Red', hex: '#ef4444' }
      ]
    };
    this.isEditing = false;
    this.showModal = true;
  }

  openEditModal(product: Product): void {
    this.currentProduct = { ...product };
    if (!this.currentProduct.sizes) this.currentProduct.sizes = ['S', 'M', 'L', 'XL'];
    if (!this.currentProduct.colors) {
      this.currentProduct.colors = [
        { name: 'Black', hex: '#1e293b' },
        { name: 'Indigo', hex: '#6366f1' },
        { name: 'Red', hex: '#ef4444' }
      ];
    }
    this.isEditing = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveProduct(): void {
    if (this.isEditing && this.currentProduct._id) {
      this.productService.updateProduct(this.currentProduct._id, this.currentProduct).subscribe(() => {
        this.toast.show('Product updated!');
        this.loadProducts();
        this.closeModal();
      });
    } else {
      this.productService.addProduct(this.currentProduct as Product).subscribe(() => {
        this.toast.show('Product added!');
        this.loadProducts();
        this.closeModal();
      });
    }
  }

  deleteProduct(id?: string): void {
    if (!id) return;
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.toast.show('Product deleted');
        this.loadProducts();
      });
    }
  }

  // Product Detail Helper Methods
  addSize(size: string): void {
    if (size && !this.currentProduct.sizes?.includes(size)) {
      this.currentProduct.sizes?.push(size);
    }
  }

  removeSize(index: number): void {
    this.currentProduct.sizes?.splice(index, 1);
  }

  addColor(name: string, hex: string): void {
    if (name && hex) {
      this.currentProduct.colors?.push({ name, hex });
    }
  }

  removeColor(index: number): void {
    this.currentProduct.colors?.splice(index, 1);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.loading = true;
      this.productService.uploadImage(file).subscribe({
        next: (res) => {
          this.currentProduct.img = res.url;
          this.loading = false;
          this.toast.show('Image uploaded successfully');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.toast.show('Failed to upload image');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // --- Orders ---
  loadOrders(): void {
    this.loading = true;
    this.adminService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.sumRevenue = this.orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.total || 0), 0);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.toast.show('Failed to load orders');
        this.cdr.detectChanges();
      }
    });
  }

  updateOrderStatus(id: string, status: string): void {
    this.adminService.updateOrderStatus(id, status).subscribe(() => {
      this.toast.show('Order status updated');
      this.loadOrders();
    });
  }

  // --- Users (Employees/Customers) ---
  loadEmployees(): void {
    this.loading = true;
    this.adminService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.toast.show('Failed to load employees');
        this.cdr.detectChanges();
      }
    });
  }

  loadCustomers(): void {
    this.loading = true;
    this.adminService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.toast.show('Failed to load customers');
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(id: string, section: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.adminService.deleteUser(id).subscribe(() => {
        this.toast.show('User deleted successfully');
        if (section === 'employees') this.loadEmployees();
        else this.loadCustomers();
      });
    }
  }

  // --- User Management ---
  openAddUserModal(): void {
    if (!this.isAdmin) return;
    this.editingUser = { role: 'customer' };
    this.isUserEditing = false;
    this.showUserModal = true;
  }

  openEditUserModal(user: any): void {
    if (!this.isAdmin) return;
    this.editingUser = { ...user };
    this.isUserEditing = true;
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
  }

  saveUser(): void {
    if (this.isUserEditing && this.editingUser._id) {
      this.adminService.updateUser(this.editingUser._id, this.editingUser).subscribe({
        next: () => {
          this.toast.show('User updated successfully');
          this.closeUserModal();
          this.refreshCurrentSection();
        },
        error: () => this.toast.show('Failed to update user')
      });
    } else {
      this.authService.register(this.editingUser).subscribe({
        next: () => {
          this.toast.show('New user created successfully');
          this.closeUserModal();
          this.refreshCurrentSection();
        },
        error: (err) => this.toast.show(`Error: ${err.error.message || 'Creation failed'}`)
      });
    }
  }

  refreshCurrentSection(): void {
    if (this.activeSection === 'employees') this.loadEmployees();
    else if (this.activeSection === 'customers') this.loadCustomers();
    else this.refreshAllData();
  }

  // --- Order Details ---
  viewOrderDetails(order: any): void {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  // --- Category Management ---
  openAddCategoryModal(): void {
    this.editingCategory = {};
    this.isCategoryEditing = false;
    this.showCategoryModal = true;
  }

  openEditCategoryModal(cat: Category): void {
    this.editingCategory = { ...cat };
    this.isCategoryEditing = true;
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  saveCategory(): void {
    if (!this.editingCategory.name?.trim()) return;

    if (this.isCategoryEditing && this.editingCategory._id) {
      this.productService.updateCategory(this.editingCategory._id, this.editingCategory).subscribe(() => {
        this.toast.show('Category updated successfully');
        this.loadCategories();
        this.closeCategoryModal();
      });
    } else {
      this.productService.addCategory(this.editingCategory).subscribe(() => {
        this.toast.show('Category created successfully');
        this.loadCategories();
        this.closeCategoryModal();
      });
    }
  }

  deleteCategory(id?: string): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this category?')) {
      this.productService.deleteCategory(id).subscribe(() => {
        this.toast.show('Category deleted successfully');
        this.loadCategories();
      });
    }
  }

  viewProductDetails(product: any): void {
    this.selectedProduct = product;
    this.showProductModal = true;
  }

  closeAllModals(): void {
    this.showModal = false;
    this.showUserModal = false;
    this.showOrderModal = false;
    this.showCategoryModal = false;
    this.showProductModal = false;
  }

  // --- UI Helpers ---
  logout(): void {
    this.authService.logout();
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatMessages.push({
        user: this.userFullname,
        text: this.newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      });
      this.newMessage = '';
    }
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isEmployee(): boolean {
    return this.authService.isEmployee();
  }

  get userFullname(): string {
    return this.authService.currentUserValue?.fullname || 'Staff';
  }

  getImgUrl(url: string | undefined): string {
    return this.productService.getImgUrl(url);
  }
}
