import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'http://localhost:5000/api';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders() {
        const user = this.authService.currentUserValue;
        return new HttpHeaders({
            'Authorization': `Bearer ${user?.token}`
        });
    }

    // Employees
    getEmployees(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users/employees`, { headers: this.getHeaders() });
    }

    // Customers
    getCustomers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users/customers`, { headers: this.getHeaders() });
    }

    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
    }

    // Orders
    getOrders(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/orders`, { headers: this.getHeaders() });
    }

    updateOrderStatus(id: string, status: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/orders/${id}`, { status }, { headers: this.getHeaders() });
    }

    updateUser(id: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${id}`, data, { headers: this.getHeaders() });
    }
}
