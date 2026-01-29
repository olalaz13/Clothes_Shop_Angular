import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const currentUser = authService.currentUserValue;

    // Clone the request and add the authorization header if token exists
    let authReq = req;
    if (currentUser && currentUser.token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${currentUser.token}`
            }
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // If the error is 401 (Unauthorized), log the user out
            if (error.status === 401) {
                authService.logout();
            }
            return throwError(() => error);
        })
    );
};
