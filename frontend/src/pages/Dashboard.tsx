import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDashboardStats, mockRecentActivity, mockProducts, mockSales } from '@/data/mockData';
import KpiCard from '@/components/ui/kpi-card';
import StatusBadge from '@/components/ui/status-badge';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const stats = mockDashboardStats;

  const lowStockProducts = mockProducts.filter(p => p.currentStock < p.minStockLevel && p.isActive);
  const recentSales = mockSales.slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return ShoppingCart;
      case 'stock':
        return Package;
      case 'user':
        return Activity;
      case 'product':
        return Package;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="page-subtitle">Here's what's happening with your inventory today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Products"
          value={stats.totalProducts}
          subtitle="Active products in catalog"
          icon={Package}
          variant="primary"
        />
        <KpiCard
          title="Low Stock Items"
          value={stats.lowStockProducts}
          subtitle="Need immediate attention"
          icon={AlertTriangle}
          variant={stats.lowStockProducts > 0 ? 'warning' : 'default'}
        />
        <KpiCard
          title="Sales Today"
          value={stats.totalSalesToday}
          subtitle={formatCurrency(stats.revenueToday)}
          icon={ShoppingCart}
          trend={{ value: 12, isPositive: true }}
        />
        <KpiCard
          title="Monthly Revenue"
          value={formatCurrency(stats.revenueThisMonth)}
          subtitle={`${stats.totalSalesThisMonth} transactions`}
          icon={DollarSign}
          variant="accent"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => navigate('/sales/new')}
        >
          <ShoppingCart className="h-5 w-5 text-primary" />
          <span>New Sale</span>
        </Button>
        {isAdmin && (
          <>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/products')}
            >
              <Package className="h-5 w-5 text-primary" />
              <span>Add Product</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/inventory')}
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Update Stock</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/reports')}
            >
              <Activity className="h-5 w-5 text-primary" />
              <span>View Reports</span>
            </Button>
          </>
        )}
        {!isAdmin && (
          <>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/sales')}
            >
              <Clock className="h-5 w-5 text-primary" />
              <span>Sales History</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/invoices')}
            >
              <Activity className="h-5 w-5 text-primary" />
              <span>View Invoices</span>
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        {isAdmin && lowStockProducts.length > 0 && (
          <div className="bg-card rounded-xl border shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h3 className="font-semibold">Low Stock Alert</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-warning">{product.currentStock} left</p>
                    <p className="text-xs text-muted-foreground">Min: {product.minStockLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sales */}
        <div className="bg-card rounded-xl border shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Recent Sales</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/sales')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{sale.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">{sale.customerName || 'Walk-in Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(sale.total)}</p>
                  <StatusBadge status="success">{sale.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`bg-card rounded-xl border shadow-card p-6 ${!isAdmin || lowStockProducts.length === 0 ? 'lg:col-span-2' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.userName}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
