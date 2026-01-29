import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top left, #1e293b, #0f172a); font-family: 'Outfit', sans-serif;">
      <div style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 50px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center; max-width: 450px; width: 90%; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
        
        <style>
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .v-btn { margin-top: 30px; padding: 14px 28px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3); }
          .v-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4); }
        </style>

        <div *ngIf="loading">
          <div style="width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
          <h2 style="color: #f8fafc; font-size: 1.75rem; font-weight: 800; margin-bottom: 10px;">Verifying...</h2>
          <p style="color: #94a3b8;">Processing your verification link.</p>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        </div>
        
        <div *ngIf="!loading && success">
          <div style="font-size: 4rem; margin-bottom: 15px;">✅</div>
          <h2 style="color: #f8fafc; font-size: 1.75rem; font-weight: 800; margin-bottom: 10px;">Account Verified!</h2>
          <p style="color: #94a3b8;">{{ message }}</p>
          <button routerLink="/signin" class="v-btn">Return to Login</button>
        </div>

        <div *ngIf="!loading && !success">
          <div style="font-size: 4rem; margin-bottom: 15px;">❌</div>
          <h2 style="color: #f8fafc; font-size: 1.75rem; font-weight: 800; margin-bottom: 10px;">Verification Failed</h2>
          <p style="color: #94a3b8;">{{ message }}</p>
          <button routerLink="/signup" class="v-btn">Try Registering Again</button>
        </div>
      </div>
    </div>
  `
})
export class VerifyEmail implements OnInit {
    loading = true;
    success = false;
    message = '';

    constructor(
        private route: ActivatedRoute,
        private auth: AuthService,
        private toast: ToastService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const token = this.route.snapshot.queryParamMap.get('token');

        if (!token) {
            this.loading = false;
            this.success = false;
            this.message = 'Verification token is missing.';
            return;
        }

        this.auth.verifyEmail(token).subscribe({
            next: (res) => {
                this.loading = false;
                this.success = true;
                this.message = res.message;
                this.toast.show('✅ ' + res.message);
            },
            error: (err) => {
                this.loading = false;
                this.success = false;
                this.message = err.error.message || 'Verification failed.';
                this.toast.show('❌ ' + this.message);
            }
        });
    }
}
