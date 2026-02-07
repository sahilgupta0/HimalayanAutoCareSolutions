import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import StatusBadge from '@/components/ui/status-badge';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  FileDown,
  Calendar,
  Filter,
  X,
  ChevronDown,
  Package,
  ShoppingCart,
  TrendingDown,
  IndianRupee,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { getAllSales, getCustomersFromBackend, getProducts, userFetchAll } from '@/api/apiCall';

interface Customer {
  id?: string;
  _id?: string;
  name: string;
  businessName: string;
  area: string;
  district: string;
  panNumber: string;
  phoneNumber?: string;
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  selectedProducts: string[];
  selectedBusinessNames: string[];
  selectedDistricts: string[];
  selectedAreas: string[];
  selectedStatuses: string[];
  selectedSalesPersons: string[];
  minAmount: string;
  maxAmount: string;
  minQuantity: string;
  maxQuantity: string;
  invoiceSearch: string;
  selectedMonth: string;
  selectedYear: string;
}

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  
  // Fetch customers, sales, users, products from backend
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      const result = await getCustomersFromBackend();
      if (result.success && result.data) {
        setCustomers(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch customers',
          variant: 'destructive',
        });
      }
      setIsLoadingCustomers(false);
    };

    const fetchSales = async () => {
      const result = await getAllSales();
      if (result.success && result.data) {
        setSales(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch sales',
          variant: 'destructive',
        });
      }
    };

    const fetchUsers = async () => {
      const result = await userFetchAll();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch users',
          variant: 'destructive',
        });
      }
    };

    const fetchProducts = async () => {
      // Implement product fetching logic here
      const result = await getProducts();
      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch products',
          variant: 'destructive',
        });
      }
    };

    fetchCustomers();
    fetchSales();
    fetchUsers();
    fetchProducts();
  }, [toast]);

  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    selectedProducts: [],
    selectedBusinessNames: [],
    selectedDistricts: [],
    selectedAreas: [],
    selectedStatuses: [],
    selectedSalesPersons: [],
    minAmount: '',
    maxAmount: '',
    minQuantity: '',
    maxQuantity: '',
    invoiceSearch: '',
    selectedMonth: 'all',
    selectedYear: 'all',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get unique values for filter options
  const uniqueBusinessNames = useMemo(() => 
    Array.from(new Set(customers.map(c => c.businessName))), 
    [customers]
  );
  const uniqueDistricts = useMemo(() => 
    Array.from(new Set(customers.map(c => c.district))), 
    [customers]
  );
  const uniqueAreas = useMemo(() => 
    Array.from(new Set(customers.map(c => c.area))), 
    [customers]
  );

  // Apply filters to sales data
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {

      // Date filters
      const saleDate = new Date(sale.createdAt);
      if (filters.dateFrom && saleDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && saleDate > new Date(filters.dateTo)) return false;

      // Month and Year filters
      if (filters.selectedMonth && filters.selectedMonth !== 'all') {
        const saleMonth = saleDate.getMonth() + 1;
        if (saleMonth !== parseInt(filters.selectedMonth)) return false;
      }
      if (filters.selectedYear && filters.selectedYear !== 'all') {
        const saleYear = saleDate.getFullYear();
        if (saleYear !== parseInt(filters.selectedYear)) return false;
      }

      // Product filter
      if (filters.selectedProducts.length > 0) {
        const hasProduct = sale.items.some((item: any) => 
          filters.selectedProducts.includes(item.productId || item.productId?._id)
        );
        if (!hasProduct) return false;
      }

      // Status filter
      if (filters.selectedStatuses.length > 0 && !filters.selectedStatuses.includes(sale.status)) {
        return false;
      }

      // Sales person filter
      const salesPersonId = typeof sale.salesPersonId === 'object' ? sale.salesPersonId?._id : sale.salesPersonId;
      if (filters.selectedSalesPersons.length > 0 && !filters.selectedSalesPersons.includes(salesPersonId)) {
        return false;
      }

      // Customer filters
      const customerId = typeof sale.customerId === 'object' ? sale.customerId?._id : sale.customerId;
      const customer = customers.find(c => c._id === customerId || c.id === customerId);
      if (customer) {
        if (filters.selectedBusinessNames.length > 0 && !filters.selectedBusinessNames.includes(customer.businessName)) {
          return false;
        }
        if (filters.selectedDistricts.length > 0 && !filters.selectedDistricts.includes(customer.district)) {
          return false;
        }
        if (filters.selectedAreas.length > 0 && !filters.selectedAreas.includes(customer.area)) {
          return false;
        }
      }

      // Amount range filter
      if (filters.minAmount && sale.total < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && sale.total > parseFloat(filters.maxAmount)) return false;

      // Quantity filter
      const totalQuantity = sale.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      if (filters.minQuantity && totalQuantity < parseInt(filters.minQuantity)) return false;
      if (filters.maxQuantity && totalQuantity > parseInt(filters.maxQuantity)) return false;

      return true;
    });
  }, [sales, filters, customers]);

  // Calculate filtered report data
  const reportData = useMemo(() => {
    const totalTransactions = filteredSales.length;
    const totalAmount = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const avgTransactionValue = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
    
    // Calculate items sold by category
    const categoryStats: Record<string, { count: number; revenue: number }> = {};
    filteredSales.forEach(sale => {
      sale.items?.forEach((item: any) => {
        // Use productName directly from the item since it's already included in the sales data
        const category = item.productName || 'Unknown';
        if (!categoryStats[category]) {
          categoryStats[category] = { count: 0, revenue: 0 };
        }
        categoryStats[category].count += item.quantity || 0;
        categoryStats[category].revenue += item.total || 0;
      });
    });

    // Status breakdown
    const statusBreakdown = {
      Completed: filteredSales.filter(s => s.status === 'Completed').length,
      Pending: filteredSales.filter(s => s.status === 'Pending').length,
      Cancelled: filteredSales.filter(s => s.status === 'Cancelled').length,
    };

    return {
      totalTransactions,
      totalAmount,
      avgTransactionValue,
      categoryStats,
      statusBreakdown,
    };
  }, [filteredSales]);

  // Calculate total cost and profit
  const totalCost = filteredSales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.productId);
      return itemSum + (product?.costPrice || 0) * item.quantity;
    }, 0);
  }, 0);
  const totalProfit = reportData.totalAmount - totalCost;

  // Sales by month (filtered data)
  const salesByMonth = useMemo(() => {
    const monthMap: Record<string, number> = {
      'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0, 'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
    };
    
    filteredSales.forEach(sale => {
      const date = new Date(sale.createdAt);
      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
      monthMap[monthName] += sale.total;
    });

    return Object.entries(monthMap).map(([name, sales]) => ({ name, sales }));
  }, [filteredSales]);



  // Category distribution
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    Object.entries(reportData.categoryStats).forEach(([category, stats]) => {
      categories[category] = stats.count;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [reportData.categoryStats]);

  const COLORS = ['hsl(226, 71%, 40%)', 'hsl(167, 76%, 38%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];


  // Sales by staff (filtered)
  const salesByStaff = useMemo(() => {
    return users
      .filter((u: any) => u.role === 'sales' || u.role === 'admin')
      .map((user: any) => {
        const userId = user._id || user.id;
        const userSales = filteredSales.filter(s => {
          const salesPersonId = typeof s.salesPersonId === 'object' ? s.salesPersonId?._id : s.salesPersonId;
          return salesPersonId === userId;
        });
        const totalSales = userSales.length;
        const totalRevenue = userSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        return { ...user, id: userId, totalSales, totalRevenue };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredSales, users]);

  // Filter handlers
  const handleProductToggle = (productId: string) => {
    setFilters(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId]
    }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      selectedStatuses: prev.selectedStatuses.includes(status)
        ? prev.selectedStatuses.filter(s => s !== status)
        : [...prev.selectedStatuses, status]
    }));
  };

  const handleSalesPersonToggle = (personId: string) => {
    setFilters(prev => ({
      ...prev,
      selectedSalesPersons: prev.selectedSalesPersons.includes(personId)
        ? prev.selectedSalesPersons.filter(id => id !== personId)
        : [...prev.selectedSalesPersons, personId]
    }));
  };

  const handleBusinessNameToggle = (businessName: string) => {
    setFilters(prev => ({
      ...prev,
      selectedBusinessNames: prev.selectedBusinessNames.includes(businessName)
        ? prev.selectedBusinessNames.filter(n => n !== businessName)
        : [...prev.selectedBusinessNames, businessName]
    }));
  };

  const handleDistrictToggle = (district: string) => {
    setFilters(prev => ({
      ...prev,
      selectedDistricts: prev.selectedDistricts.includes(district)
        ? prev.selectedDistricts.filter(d => d !== district)
        : [...prev.selectedDistricts, district]
    }));
  };

  const handleAreaToggle = (area: string) => {
    setFilters(prev => ({
      ...prev,
      selectedAreas: prev.selectedAreas.includes(area)
        ? prev.selectedAreas.filter(a => a !== area)
        : [...prev.selectedAreas, area]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      selectedProducts: [],
      selectedBusinessNames: [],
      selectedDistricts: [],
      selectedAreas: [],
      selectedStatuses: [],
      selectedSalesPersons: [],
      minAmount: '',
      maxAmount: '',
      minQuantity: '',
      maxQuantity: '',
      invoiceSearch: '',
      selectedMonth: 'all',
      selectedYear: 'all',
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.selectedMonth && filters.selectedMonth !== 'all') count++;
    if (filters.selectedYear && filters.selectedYear !== 'all') count++;
    if (filters.selectedProducts.length > 0) count++;
    if (filters.selectedBusinessNames.length > 0) count++;
    if (filters.selectedDistricts.length > 0) count++;
    if (filters.selectedAreas.length > 0) count++;
    if (filters.selectedStatuses.length > 0) count++;
    if (filters.selectedSalesPersons.length > 0) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.minQuantity || filters.maxQuantity) count++;
    if (filters.invoiceSearch) count++;
    return count;
  }, [filters]);

  const handleExport = (type: 'pdf' | 'csv') => {
    toast({ 
      title: 'Export', 
      description: `Exporting ${filteredSales.length} transactions as ${type.toUpperCase()}` 
    });
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">DashBoard & Analytics</h1>
          <p className="page-subtitle">Comprehensive business insights with advanced filters</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <FileDown className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle>Filters</CardTitle>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Date Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select value={filters.selectedMonth} onValueChange={(val) => setFilters(prev => ({ ...prev, selectedMonth: val === 'all' ? '' : val }))}>
                    <SelectTrigger id="month">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={filters.selectedYear} onValueChange={(val) => setFilters(prev => ({ ...prev, selectedYear: val === 'all' ? '' : val }))}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {[2026, 2025, 2024, 2023].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Invoice Search */}
              {/* <div className="space-y-2">
                <Label htmlFor="invoiceSearch">Invoice Number</Label>
                <Input
                  id="invoiceSearch"
                  placeholder="Search by invoice number..."
                  value={filters.invoiceSearch}
                  onChange={(e) => setFilters(prev => ({ ...prev, invoiceSearch: e.target.value }))}
                />
              </div> */}

              {/* Amount Range */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Min Amount ($)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Max Amount ($)</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    placeholder="10000"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                  />
                </div>
              </div> */}

              {/* Quantity Range */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Min Quantity</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    placeholder="0"
                    value={filters.minQuantity}
                    onChange={(e) => setFilters(prev => ({ ...prev, minQuantity: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxQuantity">Max Quantity</Label>
                  <Input
                    id="maxQuantity"
                    type="number"
                    placeholder="100"
                    value={filters.maxQuantity}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxQuantity: e.target.value }))}
                  />
                </div>
              </div> */}

              {/* Multi-select Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {filters.selectedStatuses.length > 0
                          ? `${filters.selectedStatuses.length} selected`
                          : 'Select status'}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-3" align="start">
                      <div className="space-y-2">
                        {['Completed', 'Pending', 'Cancelled'].map(status => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={filters.selectedStatuses.includes(status)}
                              onCheckedChange={() => handleStatusToggle(status)}
                            />
                            <Label htmlFor={`status-${status}`} className="font-normal cursor-pointer flex-1">
                              <StatusBadge status={status === 'Completed' ? 'success' : status === 'Pending' ? 'warning' : 'error'}>
                                {status}
                              </StatusBadge>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Sales Person Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sales Person</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {filters.selectedSalesPersons.length > 0
                          ? `${filters.selectedSalesPersons.length} selected`
                          : 'Select sales person'}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-3" align="start">
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {users.filter((u: any) => u.role === 'sales' || u.role === 'admin').map((user: any) => {
                          const userId = user._id || user.id;
                          return (
                            <div key={userId} className="flex items-center space-x-2">
                              <Checkbox
                                id={`sales-${userId}`}
                                checked={filters.selectedSalesPersons.includes(userId)}
                                onCheckedChange={() => handleSalesPersonToggle(userId)}
                              />
                              <Label htmlFor={`sales-${userId}`} className="font-normal cursor-pointer flex-1">
                                {user.name}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Products Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Products</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {filters.selectedProducts.length > 0
                          ? `${filters.selectedProducts.length} selected`
                          : 'Select products'}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-3" align="start">
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {products.map(product => (
                          <div key={product._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`product-${product._id}`}
                              checked={filters.selectedProducts.includes(product._id)}
                              onCheckedChange={() => handleProductToggle(product._id)}
                            />
                            <Label htmlFor={`product-${product._id}`} className="font-normal cursor-pointer text-sm flex-1">
                              {product.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Business Name Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Business Name</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {filters.selectedBusinessNames.length > 0
                          ? `${filters.selectedBusinessNames.length} selected`
                          : 'Select business'}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-3" align="start">
                      <div className="space-y-2">
                        {uniqueBusinessNames.map(businessName => (
                          <div key={businessName} className="flex items-center space-x-2">
                            <Checkbox
                              id={`business-${businessName}`}
                              checked={filters.selectedBusinessNames.includes(businessName)}
                              onCheckedChange={() => handleBusinessNameToggle(businessName)}
                            />
                            <Label htmlFor={`business-${businessName}`} className="font-normal cursor-pointer flex-1">
                              {businessName}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* District Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">District</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {filters.selectedDistricts.length > 0
                          ? `${filters.selectedDistricts.length} selected`
                          : 'Select district'}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-3" align="start">
                      <div className="space-y-2">
                        {uniqueDistricts.map(district => (
                          <div key={district} className="flex items-center space-x-2">
                            <Checkbox
                              id={`district-${district}`}
                              checked={filters.selectedDistricts.includes(district)}
                              onCheckedChange={() => handleDistrictToggle(district)}
                            />
                            <Label htmlFor={`district-${district}`} className="font-normal cursor-pointer flex-1">
                              {district}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Area Filter */}
                {/* <div className="space-y-2">
                  <Label className="text-sm font-medium">Area</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {filters.selectedAreas.length > 0
                          ? `${filters.selectedAreas.length} selected`
                          : 'Select area'}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-3" align="start">
                      <div className="space-y-2">
                        {uniqueAreas.map(area => (
                          <div key={area} className="flex items-center space-x-2">
                            <Checkbox
                              id={`area-${area}`}
                              checked={filters.selectedAreas.includes(area)}
                              onCheckedChange={() => handleAreaToggle(area)}
                            />
                            <Label htmlFor={`area-${area}`} className="font-normal cursor-pointer flex-1">
                              {area}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div> */}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            <ShoppingCart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportData.totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {sales.length} total sales
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <IndianRupee className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{formatCurrency(reportData.totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatCurrency(reportData.avgTransactionValue)}
            </p>
          </CardContent>
        </Card>         
      </div>

      {/* Category-wise Sales Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items Sold by Category
          </CardTitle>
          <CardDescription>Breakdown of items sold across different product categories</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(reportData.categoryStats).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No data available for selected filters</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(reportData.categoryStats)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([category, stats]) => (
                  <div key={category} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg">{category}</span>
                        <span className="text-2xl font-bold text-primary">{stats.count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Total Revenue</span>
                        <span className="font-medium text-foreground">{formatCurrency(stats.revenue)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ 
                            width: `${(stats.revenue / reportData.totalAmount) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sales Status Breakdown
          </CardTitle>
          <CardDescription>Distribution of transactions by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-success/20 bg-success/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Completed</span>
                <StatusBadge status="success">Completed</StatusBadge>
              </div>
              <div className="text-3xl font-bold text-success mt-2">{reportData.statusBreakdown.Completed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((reportData.statusBreakdown.Completed / reportData.totalTransactions) * 100 || 0).toFixed(1)}% of total
              </p>
            </div>
            
            <div className="p-4 border-2 border-warning/20 bg-warning/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Pending</span>
                <StatusBadge status="warning">Pending</StatusBadge>
              </div>
              <div className="text-3xl font-bold text-warning mt-2">{reportData.statusBreakdown.Pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((reportData.statusBreakdown.Pending / reportData.totalTransactions) * 100 || 0).toFixed(1)}% of total
              </p>
            </div>
            
            <div className="p-4 border-2 border-destructive/20 bg-destructive/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Cancelled</span>
                <StatusBadge status="error">Cancelled</StatusBadge>
              </div>
              <div className="text-3xl font-bold text-destructive mt-2">{reportData.statusBreakdown.Cancelled}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((reportData.statusBreakdown.Cancelled / reportData.totalTransactions) * 100 || 0).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend by Months</CardTitle>
                <CardDescription>Sales distribution across the year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Items sold by category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Legend Table */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                      {categoryData.map((item, index) => {
                        const totalValue = categoryData.reduce((sum, d) => sum + d.value, 0);
                        const percentage = ((item.value / totalValue) * 100).toFixed(1);
                        return (
                          <div key={`legend-${index}`} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                            <div 
                              className="w-4 h-4 rounded-sm flex-shrink-0" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm">{item.value}</p>
                              <p className="text-xs text-muted-foreground">{percentage}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Performance */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sales by Staff
              </CardTitle>
              <CardDescription>Performance metrics for sales team (filtered)</CardDescription>
            </CardHeader>
            <CardContent>
              {salesByStaff.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No staff data available</p>
              ) : (
                <div className="space-y-4">
                  {salesByStaff.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={user.role === 'admin' ? 'info' : 'neutral'}>
                              {user.role === 'admin' ? 'Admin' : 'Sales'}
                            </StatusBadge>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatCurrency(user.totalRevenue)}</p>
                        <p className="text-sm text-muted-foreground">{user.totalSales} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
