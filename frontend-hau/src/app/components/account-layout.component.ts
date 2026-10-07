import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <main class="mx-auto min-h-[70vh] max-w-7xl px-5 py-10 lg:px-8">
      <p class="text-xs font-bold uppercase text-forest">Tài khoản khách hàng</p>
      <h1 class="mt-2 font-display text-3xl font-extrabold text-ink">Quản lý tài khoản</h1>
      <div class="mt-8 grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <nav class="flex gap-2 overflow-x-auto border-b border-black/10 pb-3 md:block md:space-y-1 md:border-0 md:border-r md:pb-0 md:pr-5" aria-label="Quản lý tài khoản">
          <a routerLink="orders" routerLinkActive="!bg-forest !text-white" class="block shrink-0 px-3 py-2.5 text-sm font-semibold text-slate-600 no-underline hover:bg-white">Đơn hàng của tôi</a>
          <a routerLink="warranties" routerLinkActive="!bg-forest !text-white" class="block shrink-0 px-3 py-2.5 text-sm font-semibold text-slate-600 no-underline hover:bg-white">Tra cứu bảo hành</a>
          <a routerLink="profile" routerLinkActive="!bg-forest !text-white" class="block shrink-0 px-3 py-2.5 text-sm font-semibold text-slate-600 no-underline hover:bg-white">Thông tin cá nhân</a>
          <a routerLink="addresses" routerLinkActive="!bg-forest !text-white" class="block shrink-0 px-3 py-2.5 text-sm font-semibold text-slate-600 no-underline hover:bg-white">Sổ địa chỉ</a>
          <a routerLink="payment" routerLinkActive="!bg-forest !text-white" class="block shrink-0 px-3 py-2.5 text-sm font-semibold text-slate-600 no-underline hover:bg-white">Thanh toán</a>
        </nav>
        <section class="min-w-0"><router-outlet /></section>
      </div>
    </main>
  `
})
export class AccountLayoutComponent {}
