export type UserRole = 'admin' | 'sales';

export interface User {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface Product {
  name: string;
  sellingPrice: number;
  currentStock: number;
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
  id: string;
  invoiceNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  customerId?: string;
  customerName?: string;
  customerInfo?: CustomerInfo;
  salesPersonId: string;
  salesPersonName: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  createdAt: string;
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
