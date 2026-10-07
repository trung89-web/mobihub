import { Component, OnInit, inject, signal } from '@angular/core';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { CustomerProfile, PaymentInfo } from '../models/account.model';

@Component({
  selector: 'app-account-payment-page',
  standalone: true,
  template: `
    <div>
      <div class="border-b border-black/10 pb-5"><h2 class="font-display text-xl font-extrabold text-ink">Phương thức thanh toán</h2><p class="mt-1 text-sm text-slate-500">Chọn phương thức mặc định cho lần thanh toán tiếp theo.</p></div>
      @if (loading()) { <p class="py-10 text-sm text-slate-500">Đang tải thiết lập thanh toán...</p> }
      @else {
        <fieldset class="mt-6 space-y-3">
          <legend class="mb-3 text-xs font-bold text-ink">Phương thức mặc định</legend>
          <label class="flex cursor-pointer items-start gap-3 border p-4" [class.border-forest]="method() === 'COD'" [class.bg-[#edf5ef]]="method() === 'COD'">
            <input type="radio" name="payment" value="COD" [checked]="method() === 'COD'" (change)="method.set('COD')" class="mt-1 accent-[#176342]">
            <span><span class="block text-sm font-bold text-ink">Thanh toán khi nhận hàng (COD)</span><span class="mt-1 block text-sm text-slate-500">Thanh toán trực tiếp cho nhân viên giao hàng khi nhận đủ sản phẩm.</span></span>
          </label>
          <label class="flex cursor-pointer items-start gap-3 border p-4" [class.border-forest]="method() === 'CHUYEN_KHOAN'" [class.bg-[#edf5ef]]="method() === 'CHUYEN_KHOAN'">
            <input type="radio" name="payment" value="CHUYEN_KHOAN" [checked]="method() === 'CHUYEN_KHOAN'" (change)="method.set('CHUYEN_KHOAN')" class="mt-1 accent-[#176342]">
            <span><span class="block text-sm font-bold text-ink">Chuyển khoản ngân hàng</span><span class="mt-1 block text-sm text-slate-500">Thông tin tài khoản sẽ hiển thị khi MobiHub cấu hình thanh toán.</span></span>
          </label>
        </fieldset>
        @if (method() === 'CHUYEN_KHOAN') {
          <div class="mt-4 border-l-2 border-forest bg-white p-4 text-sm">
            @if (paymentInfo()?.qrConfigured) {
              <p><strong>Ngân hàng:</strong> {{ paymentInfo()?.bankId }}</p>
              <p class="mt-1"><strong>Số tài khoản:</strong> {{ paymentInfo()?.accountNo }}</p>
              <p class="mt-1"><strong>Chủ tài khoản:</strong> {{ paymentInfo()?.accountName }}</p>
            } @else { <p class="text-slate-600">Thông tin chuyển khoản chưa được cấu hình. Bạn vẫn có thể chọn COD khi đặt hàng.</p> }
          </div>
        }
        @if (error()) { <p class="mt-4 text-sm text-rose-700" role="alert">{{ error() }}</p> }
        @if (saved()) { <p class="mt-4 text-sm font-semibold text-forest" role="status">Đã lưu phương thức thanh toán mặc định.</p> }
        <button type="button" (click)="save()" [disabled]="saving()" class="mt-5 h-11 bg-forest px-5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{{ saving() ? 'Đang lưu...' : 'Lưu lựa chọn' }}</button>
      }
    </div>
  `
})
export class AccountPaymentPageComponent implements OnInit {
  private readonly account = inject(AccountService);
  private readonly auth = inject(AuthService);
  readonly method = signal('COD');
  readonly paymentInfo = signal<PaymentInfo | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly saved = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      const [profile, paymentInfo] = await Promise.all([this.account.profile(), this.account.paymentInfo()]);
      this.method.set(profile.defaultPaymentMethod || 'COD');
      this.paymentInfo.set(paymentInfo);
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.saved.set(false);
    this.error.set('');
    try {
      const profile: CustomerProfile = await this.account.updatePaymentMethod(this.method());
      this.method.set(profile.defaultPaymentMethod || 'COD');
      this.auth.user.update((user) => user ? { ...user } : user);
      this.saved.set(true);
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }
}
