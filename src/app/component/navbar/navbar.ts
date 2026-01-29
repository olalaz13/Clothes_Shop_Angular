import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartPanelService } from '../../services/cart-panel.service';
import { SearchService } from '../../services/search.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['../../../../public/css/style.css']
})
export class Navbar implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  currentUser: any = null;
  cartItemCount = 0;
  searchTerm: string = '';
  private subs: Subscription[] = [];

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService,
    private cartPanelService: CartPanelService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Listen to auth changes
    this.subs.push(
      this.authService.currentUser.subscribe(user => {
        this.currentUser = user;
        this.cdr.detectChanges();
      })
    );

    // Listen to cart changes
    this.updateCartCount();
    this.subs.push(
      this.cartService.cart$.subscribe(() => {
        this.updateCartCount();
        this.cdr.detectChanges();
      })
    );

    this.cartPanelService.initCartPanel();
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  private updateCartCount(): void {
    this.cartItemCount = this.cartService.getTotalItems();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  onSearchChange(): void {
    this.searchService.setTerm(this.searchTerm);
  }

  openCart(): void {
    this.cartPanelService.openCartPanel();
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get username(): string {
    return this.currentUser?.fullname || this.currentUser?.username || '';
  }

  get isStaff(): boolean {
    return this.authService.isAdmin() || this.authService.isEmployee();
  }
}
