import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signin.html',
  styleUrls: ['./signin.css'],
})
export class Signin {
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) { }

  signIn(): void {
    if (!this.email || !this.password) {
      this.toast.show('⚠ Please enter email and password.');
      return;
    }

    this.auth.login(this.email, this.password).subscribe({
      next: (user) => {
        this.toast.show(`✅ Welcome back, ${user.fullname}!`);
        if (user.role === 'admin' || user.role === 'employee') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.toast.show(`❌ Error: ${err.error.message || 'Login failed'}`);
      }
    });
  }
}
