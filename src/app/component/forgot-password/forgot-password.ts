import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="signin-container">
      <div class="signin-card">
        <h2>Forgot Password</h2>
        <p class="subtitle">Enter your email to receive a reset link.</p>

        <div class="form-group">
          <label>Email Address</label>
          <input type="email" [(ngModel)]="email" name="email" placeholder="john@example.com" (keyup.enter)="sendLink()">
        </div>

        <button (click)="sendLink()" [disabled]="loading">
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <div class="link">
          <p>Remembered your password? <a routerLink="/signin">Back to Login</a></p>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['../signin/signin.css']
})
export class ForgotPassword {
    email = '';
    loading = false;

    constructor(
        private auth: AuthService,
        private toast: ToastService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    sendLink(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        if (!this.email) {
            this.toast.show('⚠ Please enter your email address.');
            return;
        }

        this.loading = true;
        this.auth.forgotPassword(this.email).subscribe({
            next: (res) => {
                this.loading = false;
                this.toast.show('✅ ' + res.message);
            },
            error: (err) => {
                this.loading = false;
                this.toast.show('❌ ' + (err.error.message || 'Error sending reset link.'));
            }
        });
    }
}
