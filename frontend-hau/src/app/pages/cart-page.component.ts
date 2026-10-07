import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { CustomerAddress, PaymentInfo } from '../models/account.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="mx-auto min-h-[70vh] max-w-7xl px-5 py-12 lg:px-8">
      <p class="text-xs font-bold uppercase text-forest">Mua sắm</p>
      <h1 class="mt-2 font-display text-3xl font-extrabold text-ink">Giỏ hàng</h1>
      @if (cart.lines().length === 0) {
        <section class="mt-10 border-y border-black/10 py-16 text-center">
          <p class="font-display text-xl font-bold text-ink">Giỏ hàng đang trống</p>
          <a routerLink="/store" class="mt-5 inline-flex bg-forest px-5 py-3 text-sm font-bold text-white no-underline">Tiếp tục mua sắm</a>
        </section>
      } @else {
        <div class="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
          <section class="divide-y divide-black/10 border-y border-black/10">
            @for (line of cart.lines(); track line.product.id) {
              <article class="grid grid-cols-[80px_1fr_auto] items-center gap-4 py-5 sm:grid-cols-[100px_1fr_120px_auto] sm:gap-6">
                <div class="grid aspect-square place-items-center bg-[#edf1ec]">
                  @if (line.product.imageUrl) { <img [src]="line.product.imageUrl" [alt]="line.product.name" class="size-full object-contain p-2"> }
                  @else { <span class="font-display text-2xl font-extrabold text-forest/40">M</span> }
                </div>
                <div class="min-w-0"><p class="truncate font-bold text-ink">{{ line.product.name }}</p><p class="mt-1 text-xs text-slate-500">{{ line.product.sku }}</p><p class="mt-2 font-bold text-forest sm:hidden">{{ formatPrice(line.product.price * line.quantity) }}</p></div>
                <div class="flex items-center border border-black/10 sm:justify-self-center">
                  <button type="button" (click)="cart.setQuantity(line.product.id, line.quantity - 1)" class="grid size-9 place-items-center text-ink hover:bg-white" [attr.aria-label]="'Giảm số lượng ' + line.product.name">−</button>
                  <span class="w-8 text-center text-sm font-semibold">{{ line.quantity }}</span>
                  <button type="button" (click)="cart.setQuantity(line.product.id, line.quantity + 1)" class="grid size-9 place-items-center text-ink hover:bg-white" [attr.aria-label]="'Tăng số lượng ' + line.product.name">+</button>
                </div>
                <div class="hidden text-right sm:block"><p class="text-sm font-bold text-ink">{{ formatPrice(line.product.price * line.quantity) }}</p><button type="button" (click)="cart.remove(line.product.id)" class="mt-2 text-xs font-semibold text-slate-400 hover:text-rose-700">Xóa</button></div>
                <button type="button" (click)="cart.remove(line.product.id)" class="text-xs font-semibold text-slate-400 hover:text-rose-700 sm:hidden">Xóa</button>
              </article>
            }
          </section>
          <aside class="h-fit border-t-2 border-ink pt-5">
            <h2 class="font-display text-xl font-extrabold text-ink">Thông tin giao hàng</h2>
            @if (!auth.user()) { <p class="mt-3 text-sm leading-6 text-slate-500">Bạn cần đăng nhập trước khi đặt hàng.</p> }
            @if (loadingAccount()) { <p class="mt-4 text-xs text-slate-500">Đang tải địa chỉ đã lưu...</p> }
            @if (addresses().length > 0) {
              <label class="mt-5 block text-xs font-bold text-ink">Chọn địa chỉ giao hàng
                <select [ngModel]="selectedAddressId()" (ngModelChange)="selectedAddressId.set($event)" name="selectedAddress" class="mt-2 h-11 w-full border border-black/10 bg-white px-3 text-sm font-normal outline-none focus:border-forest">
                  @for (address of addresses(); track address.id) { <option [value]="address.id.toString()">{{ address.label }} · {{ address.recipientName }}{{ address.defaultAddress ? ' (Mặc định)' : '' }}</option> }
                  <option value="new">Nhập địa chỉ khác</option>
                </select>
              </label>
            }
            @if (selectedAddressId() === 'new') {
              <label class="mt-4 block text-xs font-bold text-ink">Địa chỉ nhận hàng<textarea [ngModel]="deliveryAddress()" (ngModelChange)="deliveryAddress.set($event)" name="deliveryAddress" rows="3" maxlength="500" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" class="mt-2 w-full resize-y border border-black/10 bg-white p-3 text-sm font-normal outline-none focus:border-forest"></textarea></label>
            } @else if (selectedSavedAddress(); as address) {
              <div class="mt-4 border-l-2 border-forest bg-white p-3 text-sm"><p class="font-bold text-ink">{{ address.recipientName }} · {{ address.phone }}</p><p class="mt-1 text-slate-600">{{ address.address }}</p></div>
            }
            <fieldset class="mt-5 border-t border-black/10 pt-4">
              <legend class="text-xs font-bold text-ink">Phương thức thanh toán</legend>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <label class="flex cursor-pointer items-center gap-2 border p-3 text-xs font-semibold" [class.border-forest]="paymentMethod() === 'COD'" [class.bg-[#edf5ef]]="paymentMethod() === 'COD'"><input type="radio" name="checkoutPayment" value="COD" [checked]="paymentMethod() === 'COD'" (change)="paymentMethod.set('COD')" class="accent-[#176342]"> Khi nhận hàng (COD)</label>
                <label class="flex cursor-pointer items-center gap-2 border p-3 text-xs font-semibold" [class.border-forest]="paymentMethod() === 'CHUYEN_KHOAN'" [class.bg-[#edf5ef]]="paymentMethod() === 'CHUYEN_KHOAN'"><input type="radio" name="checkoutPayment" value="CHUYEN_KHOAN" [checked]="paymentMethod() === 'CHUYEN_KHOAN'" (change)="paymentMethod.set('CHUYEN_KHOAN')" class="accent-[#176342]"> Chuyển khoản</label>
              </div>
              @if (paymentMethod() === 'CHUYEN_KHOAN') {
                <p class="mt-2 text-xs text-slate-500">{{ paymentInfo()?.qrConfigured ? 'Thông tin chuyển khoản sẽ được gửi cùng xác nhận đơn hàng.' : 'Thông tin chuyển khoản chưa được cấu hình; bạn có thể chọn COD.' }}</p>
              }
            </fieldset>
            <div class="mt-4 flex justify-between border-t border-black/10 pt-4"><span class="font-bold text-ink">Tổng cộng</span><span class="font-display font-extrabold text-forest">{{ formatPrice(cart.total()) }}</span></div>
            @if (error()) { <p class="mt-4 text-sm text-rose-700" role="alert">{{ error() }}</p> }
            <button type="button" (click)="checkout()" [disabled]="submitting()" class="mt-5 h-12 w-full bg-forest px-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60">{{ submitting() ? 'Đang đặt hàng...' : 'Đặt hàng' }}</button>
          </aside>
        </div>
      }
    </main>
  `
})
export class CartPageComponent implements OnInit {
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  private readonly account = inject(AccountService);
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);
  readonly addresses = signal<CustomerAddress[]>([]);
  readonly selectedAddressId = signal('new');
  readonly selectedSavedAddress = computed(() => this.addresses().find((address) => address.id.toString() === this.selectedAddressId()) ?? null);
  readonly deliveryAddress = signal('');
  readonly paymentMethod = signal('COD');
  readonly paymentInfo = signal<PaymentInfo | null>(null);
  readonly loadingAccount = signal(false);
  readonly error = signal('');
  readonly submitting = signal(false);

  ngOnInit(): void {
    void this.loadCheckoutOptions();
  }

  async checkout(): Promise<void> {
    if (!this.auth.user()) {
      await this.router.navigateByUrl('/login');
      return;
    }
    const selectedId = this.selectedAddressId();
    const addressId = selectedId === 'new' ? null : Number(selectedId);
    if (addressId === null && !this.deliveryAddress().trim()) {
      this.error.set('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }
    this.error.set('');
    this.submitting.set(true);
    try {
      await this.orders.place({
        address: addressId === null ? this.deliveryAddress().trim() : '',
        addressId,
        paymentMethod: this.paymentMethod(),
        items: this.cart.lines().map((line) => ({ productId: line.product.id, quantity: line.quantity }))
      });
      this.cart.clear();
      await this.router.navigateByUrl('/orders');
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
  }

  private async loadCheckoutOptions(): Promise<void> {
    if (!this.auth.user()) return;
    this.loadingAccount.set(true);
    try {
      const [addresses, profile, paymentInfo] = await Promise.all([
        this.account.addresses(),
        this.account.profile(),
        this.account.paymentInfo()
      ]);
      this.addresses.set(addresses);
      const defaultAddress = addresses.find((address) => address.defaultAddress) ?? addresses[0];
      if (defaultAddress) this.selectedAddressId.set(defaultAddress.id.toString());
      this.paymentMethod.set(profile.defaultPaymentMethod || 'COD');
      this.paymentInfo.set(paymentInfo);
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.loadingAccount.set(false);
    }
  }
}
