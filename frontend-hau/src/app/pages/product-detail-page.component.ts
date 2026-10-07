import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="mx-auto min-h-[70vh] max-w-7xl px-5 py-10 lg:px-8">
      <a routerLink="/store" class="text-sm font-semibold text-forest no-underline">← Cửa hàng</a>
      @if (error()) { <p class="mt-10 text-sm text-rose-700" role="alert">{{ error() }}</p> }
      @if (product(); as item) {
        <section class="mt-7 grid gap-10 md:grid-cols-2 md:gap-16">
          <div class="grid aspect-square place-items-center bg-[#edf1ec]">
            @if (item.imageUrl) { <img [src]="item.imageUrl" [alt]="item.name" class="size-full object-contain p-10"> }
            @else { <div class="text-forest/40"><svg viewBox="0 0 80 80" class="size-28" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="23" y="8" width="34" height="64" rx="5"/><path d="M34 15h12M36 64h8"/></svg></div> }
          </div>
          <div class="flex flex-col justify-center py-4">
            <p class="text-xs font-bold uppercase text-forest">{{ item.brand || 'MobiHub' }} · {{ item.sku }}</p>
            <h1 class="mt-4 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{{ item.name }}</h1>
            <p class="mt-5 font-display text-2xl font-extrabold text-forest">{{ formatPrice(item.price) }}</p>
            <p class="mt-6 border-y border-black/10 py-5 text-sm leading-7 text-slate-600">{{ item.description || 'Sản phẩm chính hãng, được kiểm tra kỹ trước khi giao đến bạn.' }}</p>
            <div class="grid grid-cols-2 gap-4 py-5 text-sm"><div><p class="text-xs text-slate-400">Tình trạng</p><p class="mt-1 font-bold text-ink">Còn {{ item.stock }} sản phẩm</p></div><div><p class="text-xs text-slate-400">Bảo hành</p><p class="mt-1 font-bold text-ink">{{ item.warrantyMonths }} tháng</p></div></div>
            <button type="button" (click)="addToCart()" [disabled]="item.stock < 1" class="mt-2 h-12 bg-forest px-6 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50">{{ added() ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng' }}</button>
          </div>
        </section>
      }
    </main>
  `
})
export class ProductDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly products = inject(ProductService);
  private readonly cart = inject(CartService);
  readonly product = signal<Product | null>(null);
  readonly error = signal('');
  readonly added = signal(false);

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    try {
      this.product.set(await this.products.get(id));
    } catch {
      this.error.set('Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng kinh doanh.');
    }
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;
    this.cart.add(product);
    this.added.set(true);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
  }
}
