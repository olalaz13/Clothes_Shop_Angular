import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

export interface AuthResponse extends User {
    token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5000/api/auth';
    private currentUserSubject: BehaviorSubject<AuthResponse | null>;
    public currentUser: Observable<AuthResponse | null>;
    public isBrowser: boolean;

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        let savedUser: AuthResponse | null = null;

        if (this.isBrowser) {
            const data = localStorage.getItem('currentUser');
            savedUser = data ? JSON.parse(data) : null;
        }

        this.currentUserSubject = new BehaviorSubject<AuthResponse | null>(savedUser);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): AuthResponse | null {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
            .pipe(map(user => {
                if (user && user.token && this.isBrowser) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            }));
    }

    register(userData: Partial<User>): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, userData);
    }

    verifyEmail(token: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/verify-email/${token}`);
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/forgotpassword`, { email });
    }

    resetPassword(token: string, password: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/resetpassword/${token}`, { password });
    }

    logout() {
        if (this.isBrowser) {
            localStorage.removeItem('currentUser');
        }
        this.currentUserSubject.next(null);
        this.router.navigate(['/signin']);
    }

    isLoggedIn(): boolean {
        return !!this.currentUserValue;
    }

    getRole(): string {
        return this.currentUserValue?.role || '';
    }

    isAdmin(): boolean {
        return this.getRole() === 'admin';
    }

    isEmployee(): boolean {
        return this.getRole() === 'employee';
    }

    updateProfile(userData: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/profile`, userData, {
            headers: { 'Authorization': `Bearer ${this.currentUserValue?.token}` }
        }).pipe(map(user => {
            const current = this.currentUserValue;
            if (current && this.isBrowser) {
                const updated = { ...current, ...user };
                localStorage.setItem('currentUser', JSON.stringify(updated));
                this.currentUserSubject.next(updated);
            }
            return user;
        }));
    }
}
