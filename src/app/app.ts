import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './component/navbar/navbar';
import { Footer } from './component/footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, CommonModule],
  template: `
    <app-navbar *ngIf="!isDashboardPage()" />
    <router-outlet />
    <app-footer *ngIf="!isDashboardPage()" />
  `,
  styleUrls: ['./app.css']
})
export class App {
  title = 'ClothesShop';
  constructor(private router: Router) { }
  isDashboardPage(): boolean {
    // router.url is available on both server and client
    const isDashboard = this.router.url.includes('dashboard');
    console.log('App: isDashboardPage?', isDashboard, 'Path:', this.router.url);
    return isDashboard;
  }
}
