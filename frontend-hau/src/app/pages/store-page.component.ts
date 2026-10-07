import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { ProductCardComponent } from '../components/product-card.component';

@Component({
  selector: 'app-store-page',
  standalone: true,
  imports: [FormsModule, ProductCardComponent],
  template: `
    <main id="store-top">
      <section class="relative isolate min-h-[480px] overflow-hidden bg-[#123b2a] text-white">
        <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1800&q=85" alt="Điện thoại thông minh tại MobiHub" class="absolute inset-0 -z-20 size-full object-cover object-center opacity-45">
        <div class="absolute inset-0 -z-10 bg-gradient-to-r from-[#092719]/95 via-[#0b2d1d]/75 to-[#0b2d1d]/10"></div>
        <div class="mx-auto flex min-h-[480px] max-w-7xl items-center px-5 py-16 lg:px-8">
          <div class="max-w-2xl">
            <p class="mb-4 text-xs font-bold uppercase text-emerald-200">Thiết bị di động · Phụ kiện · Linh kiện</p>
            <h1 class="font-display text-4xl font-extrabold leading-tight sm:text-6xl">Kết nối điều<br>quan trọng.</h1>
            <p class="mt-5 max-w-lg text-sm leading-7 text-white/80 sm:text-base">Khám phá điện thoại và phụ kiện được chọn lọc. Đặt hàng nhanh, theo dõi giao nhận và nhận hỗ trợ từ MobiHub.</p>
            <button type="button" (click)="scrollToCatalog()" class="mt-8 inline-flex items-center gap-3 bg-emerald-400 px-5 py-3 text-sm font-bold text-[#103b28] transition hover:bg-emerald-300">Khám phá sản phẩm <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </section>

      <section id="catalog" class="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div class="flex flex-col justify-between gap-6 border-b border-black/10 pb-7 md:flex-row md:items-end">
          <div>
            <p class="text-[11px] font-bold uppercase text-forest">MobiHub selection</p>
            <h2 class="mt-2 font-display text-3xl font-extrabold text-ink">Sản phẩm nổi bật</h2>
          </div>
          <form (submit)="$event.preventDefault(); search()" class="flex w-full max-w-md items-center border-b border-black/20 focus-within:border-forest">
            <input [(ngModel)]="query" name="query" aria-label="Tìm sản phẩm" placeholder="Tìm tên, mã hoặc thương hiệu" class="h-12 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-slate-400">
            <button type="submit" aria-label="Tìm kiếm" class="grid size-10 place-items-center text-ink hover:text-forest"><svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg></button>
          </form>
        </div>

        @if (notice()) { <p class="mt-5 text-sm font-semibold text-forest" role="status">{{ notice() }}</p> }
        @if (error()) {
          <div class="mt-6 border-l-2 border-rose-500 pl-4 text-sm text-rose-700" role="alert">
            <p>{{ error() }}</p>
            <button type="button" (click)="search()" class="mt-2 font-bold underline underline-offset-2">Thử tải lại</button>
          </div>
        }
        @if (loading()) { <p class="py-16 text-center text-sm text-slate-500">Đang tải sản phẩm...</p> }
        @else if (products().length === 0) {
          <div class="py-20 text-center"><p class="font-display text-xl font-bold text-ink">Chưa tìm thấy sản phẩm phù hợp</p><p class="mt-2 text-sm text-slate-500">Thử một tên hoặc thương hiệu khác nhé.</p></div>
        } @else {
          <div class="grid grid-cols-2 gap-x-4 gap-y-10 pt-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            @for (product of products(); track product.id) { <app-product-card [product]="product" (add)="addToCart($event)" /> }
          </div>
        }
      </section>
      <section id="about" class="border-y border-black/5 bg-[#e9efe9]">
        <div class="mx-auto grid max-w-7xl gap-8 px-5 py-9 text-sm sm:grid-cols-3 lg:px-8">
          <div><p class="font-bold text-ink">01 / Sản phẩm chính hãng</p><p class="mt-1 text-slate-600">Thông tin rõ ràng, bảo hành minh bạch.</p></div>
          <div><p class="font-bold text-ink">02 / Giao hàng tận nơi</p><p class="mt-1 text-slate-600">Theo dõi đơn hàng ngay trong tài khoản.</p></div>
          <div><p class="font-bold text-ink">03 / Hỗ trợ tận tâm</p><p class="mt-1 text-slate-600">Đội ngũ MobiHub luôn sẵn sàng hỗ trợ.</p></div>
        </div>
      </section>
    </main>
  `
})
export class StorePageComponent implements OnInit {
  private readonly catalog = inject(ProductService);
  private readonly cart = inject(CartService);
  readonly products = signal<Product[]>([]);
  query = '';
  readonly loading = signal(true);
  readonly error = signal('');
  readonly notice = signal('');

  ngOnInit(): void {
    void this.search();
  }

  scrollToCatalog(): void {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  }

  async search(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.products.set(await this.catalog.list(this.query));
    } catch {
      this.error.set('Không kết nối được API sản phẩm. Hãy kiểm tra Spring Boot (8080) và MySQL (3306).');
    } finally {
      this.loading.set(false);
    }
  }

  addToCart(product: Product): void {
    this.cart.add(product);
    this.notice.set(`Đã thêm ${product.name} vào giỏ hàng.`);
    window.setTimeout(() => this.notice.set(''), 2600);
  }
}
