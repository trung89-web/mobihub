import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private readonly http: HttpClient) {}

  list(query = ''): Promise<Product[]> {
    const params = query.trim() ? new HttpParams().set('q', query.trim()) : new HttpParams();
    return firstValueFrom(this.http.get<Product[]>('/api/store/products', { params }).pipe(timeout(12000)));
  }

  get(id: number): Promise<Product> {
    return firstValueFrom(this.http.get<Product>(`/api/store/products/${id}`).pipe(timeout(12000)));
  }
}
