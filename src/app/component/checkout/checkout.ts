import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ProductService } from '../../services/product.service';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './checkout.html',
    styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
    cartItems: any[] = [];
    subtotal: number = 0;
    shippingFee: number = 0;
    total: number = 0;

    shippingData = {
        fullname: '',
        address: '',
        phone: '',
        paymentMethod: 'cod'
    };

    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private authService: AuthService,
        private productService: ProductService,
        private router: Router,
        private toast: ToastService
    ) { }

    ngOnInit(): void {
        if (!this.authService.isLoggedIn()) {
            this.toast.show('Please sign in to continue checkout');
            this.router.navigate(['/signin']);
            return;
        }

        this.updateTotals();

        this.cartService.cart$.subscribe(() => {
            this.updateTotals();
        });

        // Prefill name if available
        const user = this.authService.currentUserValue;
        if (user) {
            this.shippingData.fullname = user.fullname || '';
            // If user has saved profile phone, can prefill too
            if ((user as any).phone) this.shippingData.phone = (user as any).phone;
        }
    }

    updateTotals(): void {
        this.cartItems = this.cartService.getCart();
        this.subtotal = this.cartService.getTotalPrice();
        this.shippingFee = this.subtotal > 100 ? 0 : 10;
        this.total = this.subtotal + this.shippingFee;
    }

    placeOrder(): void {
        if (!this.shippingData.fullname || !this.shippingData.address || !this.shippingData.phone) {
            this.toast.show('⚠️ Please fill in all shipping details');
            return;
        }

        if (this.cartItems.length === 0) {
            this.toast.show('⚠️ Your cart is empty');
            return;
        }

        const orderBody = {
            items: this.cartItems.map(item => ({
                product: item.id,
                title: item.title,
                price: item.price,
                qty: item.qty,
                size: item.size,
                color: item.color,
                img: item.img
            })),
            total: this.total,
            shippingFee: this.shippingFee,
            shippingInfo: this.shippingData
        };

        this.orderService.createOrder(orderBody).subscribe({
            next: () => {
                this.toast.show('🎉 Order placed successfully!');
                this.cartService.clearCart();
                this.router.navigate(['/user']); // Redirect to user profile / my orders
            },
            error: (err) => {
                this.toast.show('❌ Failed to place order: ' + (err.error?.message || 'Server error'));
            }
        });
    }

    getImgUrl(url: string | undefined): string {
        return this.productService.getImgUrl(url);
    }
}
