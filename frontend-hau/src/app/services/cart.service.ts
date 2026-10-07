import { computed, Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartLine {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = 'mobihub-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly lines = signal<CartLine[]>(this.readCart());
  readonly count = computed(() => this.lines().reduce((total, line) => total + line.quantity, 0));
  readonly total = computed(() => this.lines().reduce((sum, line) => sum + line.product.price * line.quantity, 0));

  add(product: Product): void {
    this.lines.update((lines) => {
      const current = lines.find((line) => line.product.id === product.id);
      if (current) {
        return lines.map((line) => line.product.id === product.id
          ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) }
          : line);
      }
      return [...lines, { product, quantity: 1 }];
    });
    this.persist();
  }

  setQuantity(productId: number, quantity: number): void {
    this.lines.update((lines) => lines
      .map((line) => line.product.id === productId
        ? { ...line, quantity: Math.max(1, Math.min(quantity, line.product.stock)) }
        : line));
    this.persist();
  }

  remove(productId: number): void {
    this.lines.update((lines) => lines.filter((line) => line.product.id !== productId));
    this.persist();
  }

  clear(): void {
    this.lines.set([]);
    this.persist();
  }

  private readCart(): CartLine[] {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value ? JSON.parse(value) as CartLine[] : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines()));
  }
}
