import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { CustomerProfile } from '../models/account.model';

@Component({
  selector: 'app-account-profile-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <div class="border-b border-black/10 pb-5"><h2 class="font-display text-xl font-extrabold text-ink">Thông tin cá nhân</h2><p class="mt-1 text-sm text-slate-500">Cập nhật thông tin liên hệ và ngày sinh.</p></div>
      @if (loading()) { <p class="py-10 text-sm text-slate-500">Đang tải thông tin...</p> }
      @else {
        <form (ngSubmit)="saveProfile()" class="grid gap-4 py-6 sm:grid-cols-2">
          <label class="text-xs font-bold text-ink">Họ và tên<input [ngModel]="name()" (ngModelChange)="name.set($event)" name="name" required maxlength="150" class="mt-2 h-11 w-full border border-black/10 bg-white px-3 text-sm font-normal outline-none focus:border-forest"></label>
          <label class="text-xs font-bold text-ink">Số điện thoại<input [ngModel]="phone()" (ngModelChange)="phone.set($event)" name="phone" required maxlength="20" autocomplete="tel" class="mt-2 h-11 w-full border border-black/10 bg-white px-3 text-sm font-normal outline-none focus:border-forest"></label>
          <label class="text-xs font-bold text-ink">Email<input [value]="profile()?.email ?? ''" disabled class="mt-2 h-11 w-full border border-black/10 bg-slate-100 px-3 text-sm font-normal text-slate-500"></label>
          <label class="text-xs font-bold text-ink">Ngày sinh<input [ngModel]="dateOfBirth()" (ngModelChange)="dateOfBirth.set($event)" name="dateOfBirth" type="date" class="mt-2 h-11 w-full border border-black/10 bg-white px-3 text-sm font-normal outline-none focus:border-forest"></label>
          <div class="sm:col-span-2">
            @if (profileError()) { <p class="mb-3 text-sm text-rose-700" role="alert">{{ profileError() }}</p> }
            @if (profileSaved()) { <p class="mb-3 text-sm font-semibold text-forest" role="status">Đã cập nhật thông tin.</p> }
            <button type="submit" [disabled]="savingProfile()" class="h-11 bg-forest px-5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{{ savingProfile() ? 'Đang lưu...' : 'Lưu thông tin' }}</button>
          </div>
        </form>

        <div class="border-t border-black/10 py-6">
          <h3 class="font-display text-lg font-extrabold text-ink">Đổi mật khẩu</h3>
          <p class="mt-1 text-sm text-slate-500">Mật khẩu mới cần có ít nhất 8 ký tự.</p>
          <form (ngSubmit)="changePassword()" class="mt-5 grid gap-4 sm:max-w-xl">
            <label class="text-xs font-bold text-ink">Mật khẩu hiện tại<input [ngModel]="currentPassword()" (ngModelChange)="currentPassword.set($event)" name="currentPassword" type="password" required autocomplete="current-password" class="mt-2 h-11 w-full border border-black/10 bg-white px-3 text-sm font-normal outline-none focus:border-forest"></label>
            <label class="text-xs font-bold text-ink">Mật khẩu mới<input [ngModel]="newPassword()" (ngModelChange)="newPassword.set($event)" name="newPassword" type="password" required minlength="8" autocomplete="new-password" class="mt-2 h-11 w-full border border-black/10 bg-white px-3 text-sm font-normal outline-none focus:border-forest"></label>
            <label class="text-xs font-bold text-ink">Nhập lại mật khẩu mới<input [ngModel]="confirmPassword()" (ngModelChange)="confirmPassword.set($event)" name="confirmPassword" type="password" required minlength="8" autocomplete="new-password" class="mt-2 h-11 w-full border border-black/10 bg-white px-3 text-sm font-normal outline-none focus:border-forest"></label>
            @if (passwordError()) { <p class="text-sm text-rose-700" role="alert">{{ passwordError() }}</p> }
            @if (passwordSaved()) { <p class="text-sm font-semibold text-forest" role="status">Đã đổi mật khẩu.</p> }
            <button type="submit" [disabled]="savingPassword()" class="h-11 w-fit bg-ink px-5 text-sm font-bold text-white hover:bg-forest disabled:opacity-60">{{ savingPassword() ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}</button>
          </form>
        </div>
      }
    </div>
  `
})
export class AccountProfilePageComponent implements OnInit {
  private readonly account = inject(AccountService);
  private readonly auth = inject(AuthService);
  readonly profile = signal<CustomerProfile | null>(null);
  readonly name = signal('');
  readonly phone = signal('');
  readonly dateOfBirth = signal('');
  readonly loading = signal(true);
  readonly savingProfile = signal(false);
  readonly profileError = signal('');
  readonly profileSaved = signal(false);
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly savingPassword = signal(false);
  readonly passwordError = signal('');
  readonly passwordSaved = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      this.applyProfile(await this.account.profile());
    } catch (error: unknown) {
      this.profileError.set(this.auth.errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async saveProfile(): Promise<void> {
    this.profileError.set('');
    this.profileSaved.set(false);
    this.savingProfile.set(true);
    try {
      this.applyProfile(await this.account.updateProfile({
        name: this.name().trim(),
        phone: this.phone().trim(),
        dateOfBirth: this.dateOfBirth() || null
      }));
      this.auth.user.update((user) => user ? { ...user, name: this.name().trim() } : user);
      this.profileSaved.set(true);
    } catch (error: unknown) {
      this.profileError.set(this.auth.errorMessage(error));
    } finally {
      this.savingProfile.set(false);
    }
  }

  async changePassword(): Promise<void> {
    this.passwordError.set('');
    this.passwordSaved.set(false);
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('Mật khẩu nhập lại không khớp.');
      return;
    }
    this.savingPassword.set(true);
    try {
      await this.account.changePassword(this.currentPassword(), this.newPassword());
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
      this.passwordSaved.set(true);
    } catch (error: unknown) {
      this.passwordError.set(this.auth.errorMessage(error));
    } finally {
      this.savingPassword.set(false);
    }
  }

  private applyProfile(profile: CustomerProfile): void {
    this.profile.set(profile);
    this.name.set(profile.name);
    this.phone.set(profile.phone);
    this.dateOfBirth.set(profile.dateOfBirth ?? '');
  }
}
