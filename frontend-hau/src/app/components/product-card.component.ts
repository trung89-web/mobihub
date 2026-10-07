import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="group min-w-0">
      <a [routerLink]="['/products', product().id]" class="relative block aspect-[4/3] overflow-hidden bg-[#edf1ec] no-underline">
        @if (product().imageUrl) {
          <img [src]="product().imageUrl" [alt]="product().name" class="size-full object-contain p-7 transition duration-500 group-hover:scale-105">
        } @else {
          <div class="grid size-full place-items-center text-forest/40">
            <svg viewBox="0 0 80 80" class="size-20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="23" y="8" width="34" height="64" rx="5"/><path d="M34 15h12M36 64h8"/></svg>
          </div>
        }
        <span class="absolute left-3 top-3 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase text-forest">{{ product().brand || 'MobiHub' }}</span>
      </a>
      <div class="pt-4">
        <div class="flex min-h-5 items-center justify-between gap-2 text-[10px] font-semibold uppercase text-slate-400">
          <span>{{ product().sku }}</span><span>Còn {{ product().stock }}</span>
        </div>
        <a [routerLink]="['/products', product().id]" class="mt-2 block min-h-12 font-display text-[15px] font-bold leading-6 text-ink no-underline hover:text-forest">{{ product().name }}</a>
        <div class="mt-3 flex items-center justify-between gap-2">
          <span class="font-display text-base font-extrabold text-forest">{{ formatPrice(product().price) }}</span>
          <button type="button" (click)="add.emit(product())" class="grid size-9 shrink-0 place-items-center rounded-full border border-black/10 text-ink transition hover:border-forest hover:bg-forest hover:text-white" [attr.aria-label]="'Thêm ' + product().name + ' vào giỏ'">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </article>
  `
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly add = output<Product>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
  }
}
