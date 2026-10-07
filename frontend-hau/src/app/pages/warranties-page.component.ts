import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WarrantyRecord } from '../models/account.model';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-warranties-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <div class="flex flex-wrap items-end justify-between gap-5 border-b border-black/10 pb-5">
        <div><h2 class="font-display text-xl font-extrabold text-ink">Tra cứu bảo hành</h2><p class="mt-1 text-sm text-slate-500">Thời hạn bảo hành của thiết bị trong các đơn đã hoàn tất.</p></div>
        <label class="flex min-w-60 items-center border-b border-black/20"><span class="sr-only">Tìm đơn hàng hoặc sản phẩm</span><input [ngModel]="query()" (ngModelChange)="query.set($event)" name="query" placeholder="Mã đơn, tên hoặc mã sản phẩm" class="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"></label>
      </div>
      @if (loading()) { <p class="py-10 text-sm text-slate-500">Đang tra cứu bảo hành...</p> }
      @else if (error()) { <p class="mt-6 text-sm text-rose-700" role="alert">{{ error() }}</p> }
      @else if (filtered().length === 0) {
        <p class="py-12 text-center text-sm text-slate-500">{{ records().length ? 'Không tìm thấy thiết bị phù hợp.' : 'Chưa có thiết bị đủ điều kiện bảo hành.' }}</p>
      } @else {
        <div class="mt-5 overflow-x-auto border-y border-black/10">
          <table class="w-full min-w-[680px] text-left text-sm">
            <thead class="bg-white text-xs text-slate-500"><tr><th class="px-3 py-3 font-semibold">Thiết bị</th><th class="px-3 py-3 font-semibold">Mã đơn</th><th class="px-3 py-3 font-semibold">Ngày mua</th><th class="px-3 py-3 font-semibold">Bảo hành đến</th><th class="px-3 py-3 font-semibold">Trạng thái</th></tr></thead>
            <tbody class="divide-y divide-black/5">
              @for (record of filtered(); track record.orderNumber + record.sku) {
                <tr><td class="px-3 py-4"><p class="font-bold text-ink">{{ record.productName }}</p><p class="mt-1 text-xs text-slate-500">{{ record.sku }} · SL {{ record.quantity }}</p></td><td class="px-3 py-4 font-semibold">{{ record.orderNumber }}</td><td class="px-3 py-4">{{ formatDate(record.purchasedAt) }}</td><td class="px-3 py-4">{{ record.warrantyEndsAt ? formatDate(record.warrantyEndsAt) : 'Không xác định' }}</td><td class="px-3 py-4"><span class="inline-flex px-2.5 py-1 text-xs font-bold" [class.bg-[#e7eee8]]="record.status === 'CON_HAN'" [class.text-forest]="record.status === 'CON_HAN'" [class.bg-rose-50]="record.status !== 'CON_HAN'" [class.text-rose-700]="record.status !== 'CON_HAN'">{{ record.status === 'CON_HAN' ? 'Còn hạn' : 'Hết hạn' }}</span></td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class WarrantiesPageComponent implements OnInit {
  private readonly account = inject(AccountService);
  private readonly auth = inject(AuthService);
  readonly records = signal<WarrantyRecord[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly query = signal('');
  readonly filtered = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('vi');
    return this.records().filter((record) => !query ||
      `${record.productName} ${record.sku} ${record.orderNumber}`.toLocaleLowerCase('vi').includes(query));
  });

  async ngOnInit(): Promise<void> {
    try {
      this.records.set(await this.account.warranties());
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(`${date}T00:00:00`));
  }
}
