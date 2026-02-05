import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private uploadUrl = `${environment.apiUrl}/upload`;
  private categoryUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(this.uploadUrl, formData);
  }

  // Trả về toàn bộ danh sách sản phẩm từ API
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Tìm và trả về sản phẩm dựa theo id từ API
  getProductById(id: string | number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Thêm sản phẩm mới
  addProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // Cập nhật sản phẩm
  updateProduct(id: string | number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // Xóa sản phẩm
  deleteProduct(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Lọc sản phẩm (Xử lý client-side cho đơn giản hoặc có thể mở rộng API sau)
  filterProducts(products: Product[], category: string, searchTerm: string = '', sortBy: string = 'popular'): Product[] {
    let filtered = products.filter(p =>
      (category === 'All' || p.cat === category) &&
      (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (sortBy) {
      case 'asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }

  // Categories CRUD
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryUrl);
  }

  addCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.categoryUrl, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.categoryUrl}/${id}`, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.categoryUrl}/${id}`);
  }

  getImgUrl(url: string | undefined): string {
    if (!url) return 'https://placehold.co/600x400?text=No+Image';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${environment.apiUrl.replace('/api', '')}${url}`;
    if (url.startsWith('img/')) return `/${url}`;
    return url;
  }
}
