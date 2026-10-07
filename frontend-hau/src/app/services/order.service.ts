import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { OrderRequest, OrderView } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<OrderView[]> {
    return firstValueFrom(this.http.get<OrderView[]>('/api/account/orders', { withCredentials: true }).pipe(timeout(12000)));
  }

  place(request: OrderRequest): Promise<OrderView> {
    return firstValueFrom(this.http.post<OrderView>('/api/account/orders', request, { withCredentials: true }).pipe(timeout(12000)));
  }

  cancel(id: number): Promise<OrderView> {
    return firstValueFrom(this.http.post<OrderView>(`/api/account/orders/${id}/cancel`, {}, { withCredentials: true }).pipe(timeout(12000)));
  }
}
