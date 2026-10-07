export interface OrderRequest {
  address: string;
  addressId: number | null;
  paymentMethod: string;
  items: Array<{ productId: number; quantity: number }>;
}

export interface OrderLine {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderInvoice {
  id: number;
  number: string;
  paymentMethod: string;
  status: string;
  total: number;
  createdAt: string;
}

export interface OrderView {
  invoice: OrderInvoice;
  items: OrderLine[];
  shippingAddress: string | null;
}
