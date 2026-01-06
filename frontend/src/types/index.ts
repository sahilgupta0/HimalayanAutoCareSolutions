export type UserRole = 'admin' | 'sales';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  status: 'completed' | 'pending' | 'cancelled';
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
