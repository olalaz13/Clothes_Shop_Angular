import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="signin-container">
      <div class="signin-card">
        <h2>Reset Password</h2>
        <p class="subtitle">Please enter your new password.</p>

        <div class="form-group">
          <label>New Password</label>
          <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" (keyup.enter)="reset()">
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="••••••••" (keyup.enter)="reset()">
        </div>

        <button (click)="reset()" [disabled]="loading">
          {{ loading ? 'Updating...' : 'Update Password' }}
        </button>

        <div class="link">
          <p>Changed your mind? <a routerLink="/signin">Back to Login</a></p>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['../signin/signin.css']
})
export class ResetPassword implements OnInit {
    password = '';
    confirmPassword = '';
    token = '';
    loading = false;

    constructor(
        private route: ActivatedRoute,
        private auth: AuthService,
        private toast: ToastService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        this.token = this.route.snapshot.queryParamMap.get('token') || '';
        if (!this.token) {
            this.toast.show('❌ Invalid or missing reset token.');
            this.router.navigate(['/signin']);
        }
    }

    reset(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        if (!this.password || !this.confirmPassword) {
            this.toast.show('⚠ Please fill in both fields.');
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.toast.show('❌ Passwords do not match.');
            return;
        }

        this.loading = true;
        this.auth.resetPassword(this.token, this.password).subscribe({
            next: (res) => {
                this.loading = false;
                this.toast.show('✅ ' + res.message);
                this.router.navigate(['/signin']);
            },
            error: (err) => {
                this.loading = false;
                this.toast.show('❌ ' + (err.error.message || 'Reset failed.'));
            }
        });
    }
}
