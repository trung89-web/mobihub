export interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string | null;
  categoryId: number;
  price: number;
  stock: number;
  warrantyMonths: number;
  imageUrl: string | null;
  description: string | null;
  active: boolean;
}
