import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './signup.html',
    styleUrls: ['../signin/signin.css'],
})
export class Signup {
    fullname = '';
    username = '';
    email = '';
    password = '';

    constructor(
        private auth: AuthService,
        private toast: ToastService,
        private router: Router
    ) { }

    signUp(): void {
        if (!this.fullname || !this.username || !this.email || !this.password) {
            this.toast.show('⚠ Please fill in all fields.');
            return;
        }

        this.auth.register({
            fullname: this.fullname,
            username: this.username,
            email: this.email,
            password: this.password,
            role: 'customer'
        }).subscribe({
            next: (res) => {
                this.toast.show(`✅ ${res.message}`);
                this.router.navigate(['/signin']);
            },
            error: (err) => {
                this.toast.show(`❌ Error: ${err.error.message || 'Registration failed'}`);
            }
        });
    }
}
