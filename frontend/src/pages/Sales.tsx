import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSales, mockProducts } from '@/data/mockData';
import { Sale, SaleItem, Product } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import StatusBadge from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ShoppingCart, Trash2, Eye, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const Sales: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [searchValue, setSearchValue] = useState('');
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // New sale state
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [area, setArea] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [discount, setDiscount] = useState('0');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');

  const availableProducts = mockProducts.filter(p => p.isActive && p.currentStock > 0);
  const filteredAvailableProducts = availableProducts.filter(
    p => p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
         p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filter sales based on role
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      sale.invoiceNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      sale.customerName?.toLowerCase().includes(searchValue.toLowerCase());
    
    if (!isAdmin) {
      return matchesSearch && sale.salesPersonId === user?.id;
    }
    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = parseFloat(discount) || 0;
  const total = subtotal - discountAmount;

  const handleAddToCart = () => {
    if (!selectedProductId || !quantity || parseInt(quantity) <= 0) {
      toast({ title: 'Error', description: 'Please select a product and quantity', variant: 'destructive' });
      return;
    }

    const product = availableProducts.find(p => p.id === selectedProductId);
    if (!product) return;

    const qty = parseInt(quantity);
    if (qty > product.currentStock) {
      toast({ title: 'Error', description: `Only ${product.currentStock} units available`, variant: 'destructive' });
      return;
    }

    const existingItem = cart.find(item => item.productId === selectedProductId);
    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      if (newQty > product.currentStock) {
        toast({ title: 'Error', description: `Only ${product.currentStock} units available`, variant: 'destructive' });
        return;
      }
      setCart(cart.map(item =>
        item.productId === selectedProductId
          ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPrice: product.sellingPrice,
        total: qty * product.sellingPrice,
      }]);
    }

    setSelectedProductId('');
    setQuantity('1');
    setProductSearch('');
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // useEffect(() => { 
  //   setSelectedSale(sales)
  // }, [sales]);

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast({ title: 'Error', description: 'Please add items to the cart', variant: 'destructive' });
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`,
      items: cart,
      subtotal,
      discount: discountAmount,
      total,
      customerName: customerName || undefined,
      customerInfo: {
        name: customerName || undefined,
        businessName: businessName || undefined,
        area: area || undefined,
        phoneNumber: phoneNumber || undefined,
      },
      salesPersonId: user?.id || '',
      salesPersonName: user?.name || '',
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    setSales([newSale, ...sales]);
    toast({ title: 'Success', description: `Sale completed - ${newSale.invoiceNumber}` });
    
    // Reset form
    setCart([]);
    setCustomerName('');
    setBusinessName('');
    setArea('');
    setPhoneNumber('');
    setDiscount('0');
    setIsNewSaleOpen(false);
    
    // Navigate to invoice
    setSelectedSale(newSale);
  };

  const salesColumns = [
    {
      key: 'createdAt',
      header: 'Date',
      render: (sale: Sale) => format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (sale: Sale) => sale.customerName || 'Walk-in Customer',
    },
    {
      key: 'items',
      header: 'Items',
      render: (sale: Sale) => `${sale.items.length} item(s)`,
    },
    {
      key: 'total',
      header: 'Total',
      render: (sale: Sale) => (
        <span className="font-semibold">{formatCurrency(sale.total)}</span>
      ),
    },
    {
      key: 'salesPersonName',
      header: 'Sales Person',
    },
    {
      key: 'status',
      header: 'Status',
      render: (sale: Sale) => (
        <StatusBadge status={sale.status === 'completed' ? 'success' : sale.status === 'pending' ? 'warning' : 'error'}>
          {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
        </StatusBadge>
      ),
    },
    
    {
      key: 'actions',
      header: 'Actions',
      render: (sale: Sale) => (
        <Button variant="ghost" size="icon" onClick={() => setSelectedSale(sale)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Sales</h1>
          <p className="page-subtitle">Manage sales transactions</p>
        </div>
        <Button onClick={() => setIsNewSaleOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      <DataTable
        data={filteredSales}
        columns={salesColumns}
        searchPlaceholder="Search invoices..."
        searchValue={searchValue}
        onSearch={setSearchValue}
        emptyMessage="No sales found."
      />

      {/* New Sale Dialog */}
      <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Create New Sale
            </DialogTitle>
            <DialogDescription>
              Add products to the cart and complete the sale.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold">Add Products</h3>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAvailableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.sellingPrice)} ({product.currentStock} in stock)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Qty"
                  className="w-24"
                />
                <Button onClick={handleAddToCart} className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Cart */}
            <div className="space-y-4">
              <h3 className="font-semibold">Cart ({cart.length} items)</h3>
              
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No items in cart
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFromCart(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold">Customer Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Enter business name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Enter area"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewSaleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteSale} disabled={cart.length === 0}>
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice View Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoice {selectedSale?.invoiceNumber}</DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{format(new Date(selectedSale.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">Customer:</span>
                  <span>{selectedSale.customerInfo?.name || selectedSale.customerName || 'Walk-in Customer'}</span>
                </div>
                {selectedSale.customerInfo?.businessName && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Business:</span>
                    <span>{selectedSale.customerInfo.businessName}</span>
                  </div>
                )}
                {selectedSale.customerInfo?.area && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Area:</span>
                    <span>{selectedSale.customerInfo.area}</span>
                  </div>
                )}
                {selectedSale.customerInfo?.phoneNumber && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{selectedSale.customerInfo.phoneNumber}</span>
                  </div>
                )}
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">Sales Person:</span>
                  <span>{selectedSale.salesPersonName}</span>
                </div>
              </div>

              <div className="border rounded-lg divide-y">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex justify-between">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedSale.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(selectedSale.discount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSale(null)}>
              Close
            </Button>
            <Button onClick={() => navigate(`/invoices/${selectedSale?.id}`)}>
              View Full Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;
