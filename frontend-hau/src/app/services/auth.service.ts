import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom, TimeoutError, timeout } from 'rxjs';
import { LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);

  constructor(private readonly http: HttpClient) {}

  async loadCurrentUser(): Promise<void> {
    try {
      this.user.set(await firstValueFrom(this.http.get<User | null>('/api/auth/me', { withCredentials: true }).pipe(timeout(12000))));
    } catch {
      this.user.set(null);
    }
  }

  async login(request: LoginRequest): Promise<User> {
    const user = await firstValueFrom(this.http.post<User>('/api/auth/login', request, { withCredentials: true }).pipe(timeout(12000)));
    this.user.set(user);
    return user;
  }

  async register(request: RegisterRequest): Promise<User> {
    const user = await firstValueFrom(this.http.post<User>('/api/auth/register', request, { withCredentials: true }).pipe(timeout(12000)));
    this.user.set(user);
    return user;
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post<void>('/api/auth/logout', {}, { withCredentials: true }).pipe(timeout(12000)));
    this.user.set(null);
  }

  errorMessage(error: unknown): string {
    if (error instanceof TimeoutError) {
      return 'Máy chủ phản hồi quá lâu. Hãy kiểm tra Spring Boot (8080) và MySQL (3306).';
    }
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0 || error.status === 502 || error.status === 504) {
        return 'Không kết nối được backend. Hãy khởi động Spring Boot (8080) và MySQL (3306).';
      }
      const body = error.error as { message?: string; detail?: string } | null;
      return body?.message ?? body?.detail ?? `Yêu cầu thất bại (${error.status}). Vui lòng thử lại.`;
    }
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }
}
