import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-30 border-b border-black/10 bg-white">
      <div class="bg-[#123e2c] text-white">
        <div class="mx-auto flex h-8 max-w-7xl items-center justify-between px-5 text-[10px] font-medium sm:text-xs lg:px-8">
          <span>MobiHub · Thiết bị di động và phụ kiện</span>
          <span class="hidden sm:inline">Mua sắm trực tuyến</span>
        </div>
      </div>
      <div class="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <a routerLink="/store" class="flex shrink-0 items-center gap-3 no-underline" aria-label="MobiHub trang chủ">
          <span class="grid size-10 place-items-center rounded-[4px] bg-forest font-display text-lg font-extrabold text-white">M</span>
          <span class="font-display text-lg font-extrabold text-ink sm:text-xl">MOBIHUB</span>
        </a>
        <nav class="hidden items-center gap-5 text-xs font-bold uppercase text-slate-700 lg:flex xl:gap-8" aria-label="Điều hướng chính">
          <a routerLink="/store" routerLinkActive="text-forest" [routerLinkActiveOptions]="{ exact: true }" class="py-3 no-underline transition hover:text-forest">Trang chủ</a>
          <button type="button" (click)="scrollToSection('about')" class="py-3 uppercase transition hover:text-forest">Giới thiệu</button>
          <button type="button" (click)="scrollToSection('catalog')" class="py-3 uppercase transition hover:text-forest">Sản phẩm</button>
        </nav>
        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          @if (auth.user(); as user) {
            @if (user.role === 'ADMIN') {
              <a href="/admin.html" class="hidden rounded-[4px] bg-ink px-4 py-3 text-xs font-bold text-white no-underline sm:inline-flex">Quản trị</a>
            } @else {
              <div class="relative">
                <button type="button" (click)="menuOpen.update((open) => !open)" [attr.aria-expanded]="menuOpen()" aria-haspopup="menu" aria-label="Mở tài khoản khách hàng" class="flex items-center gap-2 rounded-full border border-black/10 py-1 pl-1 pr-2 text-sm font-semibold text-ink hover:border-forest sm:pr-3">
                  <span class="grid size-9 place-items-center rounded-full bg-forest text-sm font-bold text-white">{{ user.name.slice(0, 1).toUpperCase() }}</span>
                  <span class="hidden max-w-28 truncate sm:inline">{{ user.name }}</span>
                  <svg viewBox="0 0 20 20" class="hidden size-4 text-slate-500 sm:block" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 7 5 5 5-5"/></svg>
                </button>
                @if (menuOpen()) {
                  <div role="menu" class="absolute right-0 top-[calc(100%+10px)] z-40 w-64 border border-black/10 bg-white py-2 shadow-xl">
                    <div class="border-b border-black/5 px-4 pb-3"><p class="text-sm font-bold text-ink">{{ user.name }}</p><p class="mt-1 truncate text-xs text-slate-500">{{ user.email }}</p></div>
                    <p class="px-4 pt-3 text-[10px] font-bold uppercase text-slate-400">Quản lý giao dịch</p>
                    <a routerLink="/account/orders" (click)="closeMenu()" role="menuitem" class="block px-4 py-2 text-sm text-slate-700 no-underline hover:bg-[#f3f7f3] hover:text-forest">Đơn hàng của tôi</a>
                    <a routerLink="/account/warranties" (click)="closeMenu()" role="menuitem" class="block px-4 py-2 text-sm text-slate-700 no-underline hover:bg-[#f3f7f3] hover:text-forest">Tra cứu bảo hành</a>
                    <p class="border-t border-black/5 px-4 pt-3 text-[10px] font-bold uppercase text-slate-400">Tài khoản & thanh toán</p>
                    <a routerLink="/account/profile" (click)="closeMenu()" role="menuitem" class="block px-4 py-2 text-sm text-slate-700 no-underline hover:bg-[#f3f7f3] hover:text-forest">Thông tin cá nhân</a>
                    <a routerLink="/account/addresses" (click)="closeMenu()" role="menuitem" class="block px-4 py-2 text-sm text-slate-700 no-underline hover:bg-[#f3f7f3] hover:text-forest">Sổ địa chỉ</a>
                    <a routerLink="/account/payment" (click)="closeMenu()" role="menuitem" class="block px-4 py-2 text-sm text-slate-700 no-underline hover:bg-[#f3f7f3] hover:text-forest">Phương thức thanh toán</a>
                    <button type="button" (click)="logout()" role="menuitem" class="mt-2 w-full border-t border-black/5 px-4 pt-3 text-left text-sm font-semibold text-rose-700">Đăng xuất</button>
                  </div>
                }
              </div>
            }
          } @else {
            <a routerLink="/login" class="rounded-[4px] px-3 py-2.5 text-xs font-bold text-forest no-underline transition hover:bg-[#edf5ef] sm:px-4">Đăng nhập</a>
          }
          <a routerLink="/cart" class="flex h-12 items-center gap-2 rounded-[4px] bg-forest px-3 text-xs font-bold text-white no-underline transition hover:bg-emerald-800 sm:gap-3 sm:px-4" aria-label="Mở giỏ hàng">
            <svg viewBox="0 0 24 24" class="size-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
            <span class="hidden sm:inline">Giỏ hàng ({{ cart.count() }})</span>
            <span class="sm:hidden">{{ cart.count() }}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <nav class="flex items-center justify-center gap-7 border-t border-black/5 px-4 py-2 text-[10px] font-bold uppercase text-slate-600 lg:hidden" aria-label="Điều hướng chính">
        <a routerLink="/store" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="text-forest" class="no-underline">Trang chủ</a>
        <button type="button" (click)="scrollToSection('about')" class="uppercase">Giới thiệu</button>
        <button type="button" (click)="scrollToSection('catalog')" class="uppercase">Sản phẩm</button>
      </nav>
    </header>
  `
})
export class SiteHeaderComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly menuOpen = signal(false);
  private readonly router = inject(Router);

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  async scrollToSection(section: 'about' | 'catalog'): Promise<void> {
    if (this.router.url !== '/store') await this.router.navigateByUrl('/store');
    requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' }));
  }

  async logout(): Promise<void> {
    this.closeMenu();
    await this.auth.logout();
    await this.router.navigateByUrl('/store');
  }
}
