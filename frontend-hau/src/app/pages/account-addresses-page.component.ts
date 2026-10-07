import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddressRequest, CustomerAddress } from '../models/account.model';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';

interface AddressDraft {
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  defaultAddress: boolean;
}

const emptyDraft = (): AddressDraft => ({ label: 'Nhà riêng', recipientName: '', phone: '', address: '', defaultAddress: false });

@Component({
  selector: 'app-account-addresses-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <div class="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-5">
        <div><h2 class="font-display text-xl font-extrabold text-ink">Sổ địa chỉ</h2><p class="mt-1 text-sm text-slate-500">Lưu địa chỉ giao hàng để thanh toán nhanh hơn.</p></div>
        @if (!showForm()) { <button type="button" (click)="newAddress()" class="h-10 bg-forest px-4 text-sm font-bold text-white hover:bg-emerald-800">Thêm địa chỉ</button> }
      </div>
      @if (error()) { <p class="mt-4 text-sm text-rose-700" role="alert">{{ error() }}</p> }
      @if (loading()) { <p class="py-10 text-sm text-slate-500">Đang tải địa chỉ...</p> }
      @else {
        <div class="divide-y divide-black/10">
          @for (address of addresses(); track address.id) {
            <article class="flex flex-wrap items-start justify-between gap-5 py-5">
              <div>
                <div class="flex flex-wrap items-center gap-2"><h3 class="font-bold text-ink">{{ address.label }}</h3>@if (address.defaultAddress) { <span class="bg-[#e7eee8] px-2 py-1 text-[11px] font-bold text-forest">Mặc định</span> }</div>
                <p class="mt-2 text-sm font-semibold text-ink">{{ address.recipientName }} · {{ address.phone }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ address.address }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                @if (!address.defaultAddress) { <button type="button" (click)="makeDefault(address.id)" class="border border-black/10 px-3 py-2 text-xs font-bold text-ink hover:border-forest">Đặt mặc định</button> }
                <button type="button" (click)="edit(address)" class="border border-black/10 px-3 py-2 text-xs font-bold text-ink hover:border-forest">Sửa</button>
                <button type="button" (click)="remove(address)" class="border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Xóa</button>
              </div>
            </article>
          } @empty {
            @if (!showForm()) { <p class="py-10 text-sm text-slate-500">Bạn chưa lưu địa chỉ nào.</p> }
          }
        </div>
      }
      @if (showForm()) {
        <form (ngSubmit)="save()" class="mt-6 border-t border-black/10 pt-6">
          <h3 class="font-display text-lg font-extrabold text-ink">{{ editingId() ? 'Cập nhật địa chỉ' : 'Địa chỉ mới' }}</h3>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label class="text-xs font-bold text-ink">Nhãn địa chỉ<input [ngModel]="draft().label" (ngModelChange)="updateDraft('label', $event)" name="label" required maxlength="60" placeholder="Nhà riêng, Công ty..." class="mt-2 h-11 w-full border border-black/10 bg-white px-3 text-sm font-normal outline-none focus:border-forest"></label>
            <label class="text-xs font-bold text-ink">Người nhận<input [ngModel]="draft().recipientName" (ngModelChange)="updateDraft('recipientName', $event)" name="recipientName" required maxlength="150" class="mt-2 h-11 w-full border border-black/10 bg-white px-3 text-sm font-normal outline-none focus:border-forest"></label>
            <label class="text-xs font-bold text-ink">Số điện thoại<input [ngModel]="draft().phone" (ngModelChange)="updateDraft('phone', $event)" name="phone" required maxlength="20" class="mt-2 h-11 w-full border border-black/10 bg-white px-3 text-sm font-normal outline-none focus:border-forest"></label>
            <label class="text-xs font-bold text-ink sm:col-span-2">Địa chỉ chi tiết<textarea [ngModel]="draft().address" (ngModelChange)="updateDraft('address', $event)" name="address" required maxlength="500" rows="3" class="mt-2 w-full border border-black/10 bg-white p-3 text-sm font-normal outline-none focus:border-forest"></textarea></label>
            <label class="flex items-center gap-2 text-sm font-semibold text-ink sm:col-span-2"><input type="checkbox" [checked]="draft().defaultAddress" (change)="updateDraft('defaultAddress', $any($event.target).checked)"> Đặt làm địa chỉ mặc định</label>
          </div>
          <div class="mt-5 flex gap-3">
            <button type="submit" [disabled]="saving()" class="h-10 bg-forest px-4 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{{ saving() ? 'Đang lưu...' : 'Lưu địa chỉ' }}</button>
            <button type="button" (click)="cancelForm()" class="h-10 border border-black/10 px-4 text-sm font-bold text-ink">Hủy</button>
          </div>
        </form>
      }
    </div>
  `
})
export class AccountAddressesPageComponent implements OnInit {
  private readonly account = inject(AccountService);
  private readonly auth = inject(AuthService);
  readonly addresses = signal<CustomerAddress[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly draft = signal<AddressDraft>(emptyDraft());

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  newAddress(): void {
    this.editingId.set(null);
    this.draft.set({ ...emptyDraft(), defaultAddress: this.addresses().length === 0 });
    this.showForm.set(true);
  }

  edit(address: CustomerAddress): void {
    this.editingId.set(address.id);
    this.draft.set({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      address: address.address,
      defaultAddress: address.defaultAddress
    });
    this.showForm.set(true);
  }

  updateDraft<K extends keyof AddressDraft>(key: K, value: AddressDraft[K]): void {
    this.draft.update((draft) => ({ ...draft, [key]: value }));
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set('');
    const request: AddressRequest = this.draft();
    try {
      const id = this.editingId();
      if (id === null) await this.account.createAddress(request);
      else await this.account.updateAddress(id, request);
      this.showForm.set(false);
      await this.reload();
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }

  async makeDefault(id: number): Promise<void> {
    this.error.set('');
    try {
      await this.account.setDefaultAddress(id);
      await this.reload();
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    }
  }

  async remove(address: CustomerAddress): Promise<void> {
    if (!window.confirm(`Xóa địa chỉ ${address.label}?`)) return;
    this.error.set('');
    try {
      await this.account.deleteAddress(address.id);
      await this.reload();
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    }
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.draft.set(emptyDraft());
  }

  private async reload(): Promise<void> {
    this.loading.set(true);
    try {
      this.addresses.set(await this.account.addresses());
    } catch (error: unknown) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
}
