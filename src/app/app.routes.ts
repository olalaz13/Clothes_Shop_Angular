import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Home } from './component/home/home';
import { Shop } from './component/shop/shop';
import { About } from './component/about/about';
import { Contact } from './component/contact/contact';
import { Signin } from './component/signin/signin';
import { Signup } from './component/signup/signup';
import { UserComponent } from './component/user/user';
import { Dashboard } from './component/dashboard/dashboard';
import { ProductDetails } from './component/product-details/product-details';
import { Checkout } from './component/checkout/checkout';
import { authGuard } from './guards/auth.guard';
import { NotFound } from './component/not-found/not-found';
import { VerifyEmail } from './component/verify-email/verify-email';
import { ForgotPassword } from './component/forgot-password/forgot-password';
import { ResetPassword } from './component/reset-password/reset-password';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home, title: 'Home' },
  { path: 'shop', component: Shop, title: 'Shop' },
  { path: 'about', component: About, title: 'About Us' },
  { path: 'contact', component: Contact, title: 'Contact Us' },
  { path: 'signin', component: Signin, title: 'Sign In' },
  { path: 'signup', component: Signup, title: 'Sign Up' },
  { path: 'verify-email', component: VerifyEmail, title: 'Verify Email' },
  { path: 'forgot-password', component: ForgotPassword, title: 'Forgot Password' },
  { path: 'reset-password', component: ResetPassword, title: 'Reset Password' },
  { path: 'user', component: UserComponent, title: 'User Profile' },
  { path: 'product/:id', component: ProductDetails, title: 'Product Details' },
  { path: 'checkout', component: Checkout, title: 'Checkout' },
  { path: 'dashboard', component: Dashboard, title: 'Dashboard', canActivate: [authGuard] },
  { path: '404', component: NotFound, title: '404 - Not Found' },
  { path: '**', component: NotFound }
];