import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders() {
        const user = this.authService.currentUserValue;
        return new HttpHeaders({
            'Authorization': `Bearer ${user?.token}`
        });
    }

    createOrder(orderData: Partial<Order>): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, orderData, { headers: this.getHeaders() });
    }

    getMyOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/mine`, { headers: this.getHeaders() });
    }
}
