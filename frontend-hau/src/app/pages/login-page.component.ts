import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_430px] lg:px-8">
      <section class="relative hidden min-h-[570px] items-end overflow-hidden bg-[#123b2a] p-12 text-white lg:flex">
        <img src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1400&q=85" alt="Điện thoại thông minh" class="absolute inset-0 size-full object-cover opacity-60">
        <div class="absolute inset-0 bg-gradient-to-t from-[#072719]/95 via-[#0a2a18]/35 to-transparent"></div>
        <div class="relative max-w-xl">
          <p class="text-xs font-bold uppercase text-emerald-200">Thiết bị di động · Phụ kiện · Linh kiện</p>
          <h1 class="mt-4 font-display text-5xl font-extrabold leading-tight">Kết nối điều<br>quan trọng.</h1>
          <p class="mt-4 max-w-md text-sm leading-7 text-white/80">Đăng nhập để đặt hàng nhanh, theo dõi giao nhận và nhận hỗ trợ từ MobiHub.</p>
        </div>
      </section>
      <section class="mx-auto w-full max-w-md py-8">
        <p class="text-xs font-bold uppercase text-forest">Tài khoản MobiHub</p>
        <h2 class="mt-3 font-display text-3xl font-extrabold text-ink">{{ mode() === 'login' ? 'Chào mừng bạn' : 'Tạo tài khoản' }}</h2>
        <p class="mt-2 text-sm leading-6 text-slate-500">{{ mode() === 'login' ? 'Đăng nhập để tiếp tục mua sắm và theo dõi đơn hàng.' : 'Đăng ký để đặt hàng và theo dõi giao nhận.' }}</p>
        <div class="mt-7 grid grid-cols-2 border-b border-black/10 text-sm font-bold">
          <button type="button" (click)="setMode('login')" class="border-b-2 py-3" [class.border-forest]="mode() === 'login'" [class.text-forest]="mode() === 'login'" [class.border-transparent]="mode() !== 'login'">Đăng nhập</button>
          <button type="button" (click)="setMode('register')" class="border-b-2 py-3" [class.border-forest]="mode() === 'register'" [class.text-forest]="mode() === 'register'" [class.border-transparent]="mode() !== 'register'">Tạo tài khoản</button>
        </div>
        <form (ngSubmit)="submit()" class="mt-6 space-y-4">
          @if (mode() === 'register') {
            <label class="block text-xs font-bold text-ink">Họ và tên<input [(ngModel)]="name" name="name" required maxlength="150" autocomplete="name" class="mt-2 h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none focus:border-forest"></label>
            <label class="block text-xs font-bold text-ink">Số điện thoại<input [(ngModel)]="phone" name="phone" required maxlength="20" autocomplete="tel" class="mt-2 h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none focus:border-forest"></label>
          }
          <label class="block text-xs font-bold text-ink">Email<input [(ngModel)]="email" name="email" type="email" required autocomplete="username" placeholder="ten@email.com" class="mt-2 h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none focus:border-forest"></label>
          <label class="block text-xs font-bold text-ink">Mật khẩu<input [(ngModel)]="password" name="password" type="password" required [minlength]="mode() === 'register' ? 8 : 1" autocomplete="current-password" placeholder="Nhập mật khẩu" class="mt-2 h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none focus:border-forest"></label>
          @if (mode() === 'register') {
            <label class="block text-xs font-bold text-ink">Địa chỉ nhận hàng <span class="font-normal text-slate-400">(không bắt buộc)</span><input [(ngModel)]="address" name="address" maxlength="500" autocomplete="street-address" class="mt-2 h-12 w-full border border-black/10 bg-white px-4 text-sm outline-none focus:border-forest"></label>
          }
          @if (error()) { <p class="border-l-2 border-rose-500 pl-3 text-sm text-rose-700" role="alert">{{ error() }}</p> }
          <button type="submit" [disabled]="submitting()" class="flex h-12 w-full items-center justify-center bg-forest px-5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">{{ submitting() ? 'Đang xử lý...' : (mode() === 'login' ? 'Đăng nhập' : 'Tạo tài khoản') }}</button>
        </form>
        <button type="button" routerLink="/store" class="mt-5 w-full py-3 text-sm font-semibold text-slate-500 hover:text-forest">Tiếp tục xem cửa hàng</button>
      </section>
    </main>
  `
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly mode = signal<'login' | 'register'>('login');
  name = '';
  phone = '';
  email = '';
  password = '';
  address = '';
  readonly error = signal('');
  readonly submitting = signal(false);

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.error.set('');
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.submitting.set(true);
    try {
      const user = this.mode() === 'login'
        ? await this.auth.login({ email: this.email, password: this.password })
        : await this.auth.register({ name: this.name, phone: this.phone, email: this.email, password: this.password, address: this.address });
      if (user.role === 'ADMIN') {
        window.location.assign('/admin.html');
        return;
      }
      await this.router.navigateByUrl('/store');
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
