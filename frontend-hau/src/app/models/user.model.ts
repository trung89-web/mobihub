export interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | string;
  customerId: number | null;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  phone: string;
  address: string;
}
