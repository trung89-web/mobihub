import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { OrderView } from '../models/order.model';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="mx-auto min-h-[70vh] max-w-5xl px-5 py-12 lg:px-8">
      <p class="text-xs font-bold uppercase text-forest">Tài khoản của bạn</p>
      <h1 class="mt-2 font-display text-3xl font-extrabold text-ink">Lịch sử đơn hàng</h1>
      @if (loading()) { <p class="py-16 text-center text-sm text-slate-500">Đang tải đơn hàng...</p> }
      @else if (error()) { <p class="mt-8 border-l-2 border-rose-500 pl-4 text-sm text-rose-700" role="alert">{{ error() }}</p> }
      @else if (orders().length === 0) {
        <section class="mt-8 border-y border-black/10 py-16 text-center"><p class="font-display text-xl font-bold text-ink">Bạn chưa có đơn hàng nào</p><a routerLink="/store" class="mt-5 inline-flex bg-forest px-5 py-3 text-sm font-bold text-white no-underline">Khám phá cửa hàng</a></section>
      } @else {
        <div class="mt-8 divide-y divide-black/10 border-y border-black/10">
          @for (order of orders(); track order.invoice.id) {
            <article class="py-6">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div><p class="text-xs font-semibold uppercase text-slate-400">Mã đơn hàng</p><h2 class="mt-1 font-display text-lg font-extrabold text-ink">{{ order.invoice.number }}</h2></div>
                <div class="text-right"><p class="text-xs text-slate-400">{{ formatDate(order.invoice.createdAt) }}</p><span class="mt-2 inline-flex bg-[#e7eee8] px-3 py-1 text-xs font-bold text-forest">{{ statusLabel(order.invoice.status) }}</span></div>
              </div>
              <div class="mt-4 space-y-2 border-t border-black/5 pt-4">
                @for (line of order.items; track $index) { <div class="flex justify-between gap-4 text-sm"><span class="text-slate-600">{{ line.productName }} × {{ line.quantity }}</span><span class="shrink-0 font-semibold text-ink">{{ formatPrice(line.lineTotal) }}</span></div> }
              </div>
              <div class="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-black/5 pt-4 text-sm"><div><p class="text-slate-500">{{ order.shippingAddress || 'Địa chỉ giao hàng' }}</p><p class="mt-1 text-xs text-slate-500">Thanh toán: {{ paymentLabel(order.invoice.paymentMethod) }}</p></div><div class="flex items-center gap-4"><span class="font-bold text-ink">Tổng {{ formatPrice(order.invoice.total) }}</span>@if (order.invoice.status === 'CHO_XAC_NHAN') { <button type="button" (click)="cancelOrder(order.invoice.id)" [disabled]="cancellingId() === order.invoice.id" class="text-xs font-bold text-rose-700 underline underline-offset-2 disabled:opacity-50">{{ cancellingId() === order.invoice.id ? 'Đang hủy...' : 'Hủy đơn' }}</button> }</div></div>
            </article>
          }
        </div>
      }
    </main>
  `
})
export class OrdersPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly ordersApi = inject(OrderService);
  private readonly router = inject(Router);
  readonly orders = signal<OrderView[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly cancellingId = signal<number | null>(null);

  async ngOnInit(): Promise<void> {
    if (!this.auth.user()) {
      await this.router.navigateByUrl('/login');
      return;
    }
    try {
      this.orders.set(await this.ordersApi.list());
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      CHO_XAC_NHAN: 'Chờ xác nhận',
      DA_XAC_NHAN: 'Đã xác nhận',
      DANG_GIAO: 'Đang giao',
      HOAN_THANH: 'Đã giao',
      DA_GIAO: 'Đã giao',
      DA_THANH_TOAN: 'Đã thanh toán',
      DA_HUY: 'Đã hủy'
    };
    return labels[status] ?? status;
  }

  paymentLabel(method: string): string {
    return ({ COD: 'Thanh toán khi nhận hàng (COD)', CHUYEN_KHOAN: 'Chuyển khoản' })[method] ?? method;
  }

  async cancelOrder(id: number): Promise<void> {
    this.error.set('');
    this.cancellingId.set(id);
    try {
      const updated = await this.ordersApi.cancel(id);
      this.orders.update((orders) => orders.map((order) => order.invoice.id === id ? updated : order));
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.cancellingId.set(null);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }
}
