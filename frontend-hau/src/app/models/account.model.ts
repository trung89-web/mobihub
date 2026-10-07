export interface CustomerProfile {
  email: string;
  name: string;
  phone: string;
  dateOfBirth: string | null;
  defaultPaymentMethod: 'COD' | 'CHUYEN_KHOAN' | string;
}

export interface CustomerAddress {
  id: number;
  customerId: number;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  defaultAddress: boolean;
}

export interface AddressRequest {
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  defaultAddress: boolean;
}

export interface WarrantyRecord {
  productName: string;
  sku: string;
  quantity: number;
  orderNumber: string;
  purchasedAt: string;
  warrantyEndsAt: string | null;
  status: 'CON_HAN' | 'HET_HAN' | string;
}

export interface PaymentInfo {
  qrConfigured: boolean;
  bankId: string | null;
  accountNo: string | null;
  accountName: string | null;
}
