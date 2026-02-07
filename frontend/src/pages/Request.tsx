import React, { useState, useMemo, useEffect } from 'react';
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

import { getCustomersFromBackend, addNewSalesRequest, getMyRequestsFromBackend, getProducts } from '@/api/apiCall';

interface Customer {
  _id: string;
  name: string;
  businessName: string;
  panNumber: string;
  area: string;
  phoneNumber: string;
}

interface Product {
  _id: string;
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
  _id?: string;
  saleDate?: Date;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  bill: boolean;
  customerId: string;
  salesPersonId: string;
  createdAt?: string;
  updatedAt?: string;
}


const Request: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State Management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<SalesRequest[]>([]);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [customPrice, setCustomPrice] = useState('');
  const [bill, setBill] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Fetching the Products list from backend

  const fetchProducts = async () => {
    // Implementation for fetching products can be added here
    const result = await getProducts();


    if (result.success && result.data) {
      // setProducts(result.data);
      setProducts(result.data);

    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to fetch products',
        variant: 'destructive',
      });
    }
  }

  const fetchMyRequests = async () => {
    if ( !user) {
      toast({
        title: 'Error',
        description: 'User not logged in',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await getMyRequestsFromBackend(user.id);
    if (result.success && result.data) {
      const reversedData = result.data.slice().reverse(); // Reverse the data to show most recent first
      setRequests(reversedData);
    }
    else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to fetch requests',
        variant: 'destructive',
      });
    }
  }


  // Get customers from backend
  const fetchCustomers = async () => {
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
  };

  React.useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchMyRequests();
  }, []);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return [];
    return customers.filter((customer) =>
      customer.businessName.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customerSearch, customers]);

  // Filter available products (not in cart)
  const filteredAvailableProducts = products.filter(
    (product) => !cart.find((item) => item.productId === product._id)
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
    setCustomerSearch(customer.businessName);
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast({
        title: 'Error',
        description: 'Please select a product',
        variant: 'destructive',
      });
      return;
    }

    if (!quantity || parseInt(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
      toast({
        title: 'Error',
        description: 'Please enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }
    if(parseInt(quantity) > selectedProduct.currentStock) {
      toast({
        title: 'Error',
        description: `Quantity exceeds available stock (${selectedProduct.currentStock})`,
        variant: 'destructive',
      });
      return;
    }

    const unitPrice = customPrice ? parseFloat(customPrice) : selectedProduct.sellingPrice;

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
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      quantity: qty,
      unitPrice,
      total: qty * unitPrice,
    };

    setCart([...cart, item]);
    setSelectedProduct(null);
    setQuantity('1');
    setCustomPrice('');

    toast({
      title: 'Success',
      description: `${selectedProduct.name} added to cart`,
    });
  };

  // Handle Remove from Cart
  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  // Calculate Total
  const total = cart.reduce((sum, item) => sum + item.total, 0);

  useEffect(() => {
    console.log("bill type changed", bill);
  }, [bill]);

  // Handle Submit Request
  const handleSubmitRequest = async () => {
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
      items: cart,
      bill: bill,
      total : total,
      status: 'Pending',
      customerId: selectedCustomer?._id || '',
      salesPersonId: user.id,
    };

    console.log("Submitting request:", newRequest);

    setIsSubmitting(true);
    const response = await addNewSalesRequest(newRequest);
    setIsSubmitting(false);

    if (!response.success) {
      toast({
        title: 'Error',
        description: response.error || 'Failed to create request',
        variant: 'destructive',
      });
      return;
    }
    // Refresh requests list
    fetchMyRequests();
    toast({
      title: 'Success',
      description: `Request created - ${newRequest.items.length} items totaling ${formatCurrency(newRequest.total)}`,
    });

    // Reset form
    setSelectedCustomer(null);
    setCustomerSearch('');
    setCart([]);
    setIsNewRequestOpen(false);
  };
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
          {requests.map((request, index) => (
            <Card key={request._id || `request-${index}`}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      Request #{requests.indexOf(request) + 1}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {request.createdAt ? format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm') : format(new Date(request.saleDate), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${
                      request.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'Completed'
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
                        {request.customerId?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.customerId?.businessName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">
                        {request.customerId?.phoneNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">Phone</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Items: {request.items.length}</p>
                  <div className="space-y-2">
                    {request.items.map((item) => (
                      <div
                        key={item.productId}
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
                      key={customer._id}
                      onClick={() => handleSelectCustomer(customer)}
                      className={`w-full p-3 text-left hover:bg-accent border-b last:border-0 transition-colors ${
                        selectedCustomer?._id === customer._id ? 'bg-accent' : ''
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
                      value={selectedProduct?._id || ''}
                      onValueChange={(id) => {
                        const product = products.find((p) => p._id === id);
                        setSelectedProduct(product || null);
                      }}
                    >
                      <SelectTrigger id="product">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAvailableProducts.map((product) => (
                          <SelectItem key={product._id} value={product._id}>
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
                      disabled={!selectedProduct}
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

                {/* Total Section */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="space-y-2 p-4 bg-card rounded-lg border">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bill">Bill Status</Label>
                    <Select
                      value={bill ? 'true' : 'false'}
                      onValueChange={(value) => setBill(value === 'true')}
                    >
                      <SelectTrigger id="bill">
                        <SelectValue placeholder="Select bill status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Bill</SelectItem>
                        <SelectItem value="false">No Bill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNewRequestOpen(false)}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={!selectedCustomer || cart.length === 0 || isSubmitting}
              className="w-full sm:w-auto"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Request;
