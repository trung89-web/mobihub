import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { AddressRequest, CustomerAddress, CustomerProfile, PaymentInfo, WarrantyRecord } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private readonly http: HttpClient) {}

  profile(): Promise<CustomerProfile> {
    return firstValueFrom(this.http.get<CustomerProfile>('/api/account/profile', { withCredentials: true }).pipe(timeout(12000)));
  }

  updateProfile(request: Pick<CustomerProfile, 'name' | 'phone' | 'dateOfBirth'>): Promise<CustomerProfile> {
    return firstValueFrom(this.http.put<CustomerProfile>('/api/account/profile', request, { withCredentials: true }).pipe(timeout(12000)));
  }

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return firstValueFrom(this.http.post<void>('/api/account/password', { currentPassword, newPassword }, { withCredentials: true }).pipe(timeout(12000)));
  }

  updatePaymentMethod(method: string): Promise<CustomerProfile> {
    return firstValueFrom(this.http.put<CustomerProfile>('/api/account/payment-method', { method }, { withCredentials: true }).pipe(timeout(12000)));
  }

  addresses(): Promise<CustomerAddress[]> {
    return firstValueFrom(this.http.get<CustomerAddress[]>('/api/account/addresses', { withCredentials: true }).pipe(timeout(12000)));
  }

  createAddress(request: AddressRequest): Promise<CustomerAddress> {
    return firstValueFrom(this.http.post<CustomerAddress>('/api/account/addresses', request, { withCredentials: true }).pipe(timeout(12000)));
  }

  updateAddress(id: number, request: AddressRequest): Promise<CustomerAddress> {
    return firstValueFrom(this.http.put<CustomerAddress>(`/api/account/addresses/${id}`, request, { withCredentials: true }).pipe(timeout(12000)));
  }

  setDefaultAddress(id: number): Promise<CustomerAddress> {
    return firstValueFrom(this.http.patch<CustomerAddress>(`/api/account/addresses/${id}/default`, {}, { withCredentials: true }).pipe(timeout(12000)));
  }

  deleteAddress(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/account/addresses/${id}`, { withCredentials: true }).pipe(timeout(12000)));
  }

  warranties(): Promise<WarrantyRecord[]> {
    return firstValueFrom(this.http.get<WarrantyRecord[]>('/api/account/warranties', { withCredentials: true }).pipe(timeout(12000)));
  }

  paymentInfo(): Promise<PaymentInfo> {
    return firstValueFrom(this.http.get<PaymentInfo>('/api/store/payment-info').pipe(timeout(12000)));
  }
}
