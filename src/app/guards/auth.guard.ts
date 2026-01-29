import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    // If we're on the server, we allow navigation during SSR to prevent 
    // unwanted redirects to login (since localStorage isn't available on server)
    if (!authService.isBrowser) {
        return true;
    }

    const currentUser = authService.currentUserValue;
    console.log('AuthGuard: Current User:', currentUser);

    if (!currentUser) {
        console.warn('AuthGuard: No user found. Redirecting to /signin');
        router.navigate(['/signin']);
        return false;
    }

    // Dashboard protection: Admin and Employee only
    if (state.url.includes('dashboard')) {
        const role = currentUser.role;
        console.log('AuthGuard: checking dashboard access for role:', role);

        if (role === 'admin' || role === 'employee') {
            return true;
        } else {
            console.warn('AuthGuard: Access denied for role', role, '. Redirecting to /');
            toast.show('❌ Access denied. Staff only.');
            router.navigate(['/']);
            return false;
        }
    }

    return true;
};
