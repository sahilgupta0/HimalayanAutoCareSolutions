export type UserRole = 'admin' | 'sales';

export interface User {
  id?: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id?: string;
  name: string;
  sku?: string;
  category?: string;
  sellingPrice: number;
  costPrice?: number;
  currentStock: number;
  minStockLevel?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  action: 'add' | 'reduce' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CustomerInfo {
  name?: string;
  businessName?: string;
  area?: string;
  phoneNumber?: string;
}

export interface Sale {
  id: Date | string;
  salesDate: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  customerId?: string;
  salesPersonId: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalSalesToday: number;
  revenueToday: number;
  totalSalesThisMonth: number;
  revenueThisMonth: number;
}

export interface RecentActivity {
  id: string;
  type: 'sale' | 'stock' | 'user' | 'product';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}
