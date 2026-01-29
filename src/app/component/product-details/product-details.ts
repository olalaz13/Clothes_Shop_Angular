import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './product-details.html',
    styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {
    product: Product | null = null;
    loading = true;
    relatedProducts: Product[] = [];

    // Selection properties
    selectedSize: string = 'M';
    selectedColor: string = 'Black';
    availableSizes = ['S', 'M', 'L', 'XL'];
    availableColors = [
        { name: 'Black', hex: '#1e293b' },
        { name: 'Indigo', hex: '#6366f1' },
        { name: 'Red', hex: '#ef4444' }
    ];

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.loadProduct(id);
            }
        });
    }

    loadProduct(id: string): void {
        this.loading = true;
        this.productService.getProductById(id).subscribe({
            next: (data) => {
                this.product = data;

                // Use dynamic sizes/colors if available, otherwise use defaults
                if (data.sizes && data.sizes.length > 0) {
                    this.availableSizes = data.sizes;
                    this.selectedSize = data.sizes[0];
                }
                if (data.colors && data.colors.length > 0) {
                    this.availableColors = data.colors;
                    this.selectedColor = data.colors[0].name;
                }

                this.loading = false;
                this.loadRelatedProducts(data.cat);
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadRelatedProducts(category: string): void {
        this.productService.getProducts().subscribe(all => {
            this.relatedProducts = all
                .filter(p => p.cat === category && p._id !== this.product?._id)
                .slice(0, 4);
            this.cdr.detectChanges();
        });
    }

    selectSize(size: string): void {
        this.selectedSize = size;
        this.cdr.detectChanges();
    }

    selectColor(color: string): void {
        this.selectedColor = color;
        this.cdr.detectChanges();
    }

    addToCart(): void {
        if (this.product) {
            this.cartService.addToCart(this.product, this.selectedSize, this.selectedColor);
            this.toastService.show(`Added 1 x <b>${this.product.title}</b> (${this.selectedSize}, ${this.selectedColor}) to cart!`);
            this.cdr.detectChanges();
        }
    }

    toggleWishlist(): void {
        const productId = this.product?._id as string;
        if (productId) {
            const isAdded = this.cartService.toggleFavorite(productId);
            this.toastService.show(isAdded ? 'Added to wishlist!' : 'Removed from wishlist!');
        }
    }

    isFavorite(): boolean {
        const productId = this.product?._id as string;
        return productId ? this.cartService.isFavorite(productId) : false;
    }

    getImgUrl(url: string | undefined): string {
        return this.productService.getImgUrl(url);
    }
}
