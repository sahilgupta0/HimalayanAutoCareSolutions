import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
  Search,
  Plus,
  Trash2,
  Send,
  User,
  Phone,
  MapPin,
  Store,
  Package,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

import { getCustomersFromBackend } from '@/api/apiCall';

interface Customer {
  id: string;
  name: string;
  businessName: string;
  panNumber: string;
  area: string;
  phoneNumber: string;
}

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  currentStock: number;
}

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SalesRequest {
  id: string;
  requestNumber: string;
  customerInfo: Customer | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  requestedBy: string;
  requestedById: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Mock Customer Data
// const mockCustomers: Customer[] = [
//   {
//     id: '1',
//     name: 'Raj Kumar',
//     businessName: 'Kumar Trading Co.',
//     panNumber: 'ABCDE1234F',
//     area: 'Delhi',
//     phoneNumber: '9876543210',
//   },
//   {
//     id: '2',
//     name: 'Priya Singh',
//     businessName: 'Singh Enterprises',
//     panNumber: 'FGHIJ5678K',
//     area: 'Mumbai',
//     phoneNumber: '9876543211',
//   },
//   {
//     id: '3',
//     name: 'Amit Patel',
//     businessName: 'Patel Industries',
//     panNumber: 'KLMNO9012P',
//     area: 'Bangalore',
//     phoneNumber: '9876543212',
//   },
//   {
//     id: '4',
//     name: 'Neha Sharma',
//     businessName: 'Sharma Group',
//     panNumber: 'QRSTU3456V',
//     area: 'Hyderabad',
//     phoneNumber: '9876543213',
//   },
// ];

// Mock Product Data
const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Himalayan Coolant 20L',
    sellingPrice: 1200,
    currentStock: 50,
  },
  {
    id: 'p2',
    name: 'Himalayan Coolant 50L',
    sellingPrice: 2500,
    currentStock: 30,
  },
  {
    id: 'p3',
    name: 'Himalayan Coolant 200L',
    sellingPrice: 8000,
    currentStock: 15,
  },
  {
    id: 'p4',
    name: 'Engine Oil Premium',
    sellingPrice: 450,
    currentStock: 100,
  },
];

const Request: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State Management
  const [customers, setCustomers] = useState<Customer[]>([]);    
  const [requests, setRequests] = useState<SalesRequest[]>([]);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [customPrice, setCustomPrice] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState('0');



  // Get customers from backend
  const fetchCustomers = async () => {
    const result = await getCustomersFromBackend();

    if (result.success && result.data) {
      setCustomers(result.data);
    } else {
      toast.error(result.error || "Failed to fetch customers");
    }
  };

  React.useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return [];
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customerSearch]);

  // Filter available products (not in cart)
  const filteredAvailableProducts = mockProducts.filter(
    (product) => !cart.find((item) => item.productId === product.id)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Handle Customer Selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!selectedProductId) {
      toast({
        title: 'Error',
        description: 'Please select a product',
        variant: 'destructive',
      });
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    const product = mockProducts.find((p) => p.id === selectedProductId);
    if (!product) return;

    const unitPrice = customPrice ? parseFloat(customPrice) : product.sellingPrice;

    if (isNaN(unitPrice) || unitPrice <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    const qty = parseInt(quantity);
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice,
      total: qty * unitPrice,
    };

    setCart([...cart, item]);
    setSelectedProductId('');
    setQuantity('1');
    setCustomPrice('');

    toast({
      title: 'Success',
      description: `${product.name} added to cart`,
    });
  };

  // Handle Remove from Cart
  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  // Calculate Totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = parseFloat(discount) || 0;
  const total = subtotal - discountAmount;

  // Handle Submit Request
  const handleSubmitRequest = () => {
    if (!selectedCustomer) {
      toast({
        title: 'Error',
        description: 'Please select a customer',
        variant: 'destructive',
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one product',
        variant: 'destructive',
      });
      return;
    }

    const newRequest: SalesRequest = {
      id: Date.now().toString(),
      requestNumber: `REQ-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`,
      customerInfo: selectedCustomer,
      items: cart,
      subtotal,
      discount: discountAmount,
      total,
      requestedBy: user?.name || '',
      requestedById: user?.id || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setRequests([newRequest, ...requests]);
    toast({
      title: 'Success',
      description: `Request created - ${newRequest.requestNumber}`,
    });

    // Reset form
    setSelectedCustomer(null);
    setCustomerSearch('');
    setCart([]);
    setDiscount('0');
    setIsNewRequestOpen(false);
  };

  const selectedProduct = mockProducts.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Sales Requests</h1>
          <p className="page-subtitle">Create and manage customer requests</p>
        </div>
        <Button
          onClick={() => setIsNewRequestOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Requests List */}
      {requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {request.requestNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${
                      request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">
                        {request.customerInfo?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.customerInfo?.businessName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">
                        {request.customerInfo?.phoneNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">Phone</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Items: {request.items.length}</p>
                  <div className="space-y-2">
                    {request.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm text-muted-foreground"
                      >
                        <span>
                          {item.productName} ({item.quantity}x)
                        </span>
                        <span>{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(request.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {requests.length === 0 && !isNewRequestOpen && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Send className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No requests created yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "New Request" to create your first request
            </p>
          </CardContent>
        </Card>
      )}

      {/* New Request Dialog */}
      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Create New Sales Request
            </DialogTitle>
            <DialogDescription>
              Search for customer, select products, and create a new sales request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Selection Section */}
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customer by name..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Customer Search Results */}
              {customerSearch && filteredCustomers.length > 0 && (
                <div className="border rounded-lg bg-background max-h-48 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className={`w-full p-3 text-left hover:bg-accent border-b last:border-0 transition-colors ${
                        selectedCustomer?.id === customer.id ? 'bg-accent' : ''
                      }`}
                    >
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.businessName}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {customerSearch && filteredCustomers.length === 0 && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No customers found
                </div>
              )}

              {/* Selected Customer Details */}
              {selectedCustomer && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Name
                      </p>
                      <p className="text-sm font-medium truncate">
                        {selectedCustomer.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Store className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Business
                      </p>
                      <p className="text-sm font-medium truncate">
                        {selectedCustomer.businessName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-sm font-medium truncate">
                        {selectedCustomer.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Area
                      </p>
                      <p className="text-sm font-medium truncate">
                        {selectedCustomer.area}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Selection Section */}
            {selectedCustomer && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Add Products
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="product">Product Name</Label>
                    <Select
                      value={selectedProductId}
                      onValueChange={setSelectedProductId}
                    >
                      <SelectTrigger id="product">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAvailableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price{' '}
                      {selectedProduct && (
                        <span className="text-xs text-muted-foreground">
                          (Default: {formatCurrency(selectedProduct.sellingPrice)})
                        </span>
                      )}
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder="Leave empty for default price"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={handleAddToCart}
                      className="w-full"
                      disabled={!selectedProductId}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Section */}
            {cart.length > 0 && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">
                  Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})
                </h3>

                <div className="border rounded-lg divide-y bg-background max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-semibold">
                          {formatCurrency(item.total)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount and Total Section */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="grid gap-2">
                    <Label htmlFor="discount">Discount</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2 p-4 bg-card rounded-lg border">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
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
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNewRequestOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={!selectedCustomer || cart.length === 0}
              className="w-full sm:w-auto"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Request;
