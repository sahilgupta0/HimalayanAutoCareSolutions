import React, { useState } from 'react';
import { mockProducts, mockStockHistory } from '@/data/mockData';
import { Product, StockHistory } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import StatusBadge from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Package, AlertTriangle, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>(mockStockHistory);
  const [searchValue, setSearchValue] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'reduce'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const filteredProducts = products.filter(
    (product) =>
      product.isActive &&
      (product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchValue.toLowerCase()))
  );

  const handleOpenDialog = (product: Product, type: 'add' | 'reduce') => {
    setSelectedProduct(product);
    setActionType(type);
    setQuantity('');
    setReason('');
    setIsDialogOpen(true);
  };

  const handleStockUpdate = () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid quantity', variant: 'destructive' });
      return;
    }

    if (!reason.trim()) {
      toast({ title: 'Error', description: 'Please provide a reason', variant: 'destructive' });
      return;
    }

    const qty = parseInt(quantity);
    const newStock =
      actionType === 'add'
        ? selectedProduct.currentStock + qty
        : selectedProduct.currentStock - qty;

    if (newStock < 0) {
      toast({ title: 'Error', description: 'Cannot reduce stock below 0', variant: 'destructive' });
      return;
    }

    // Update product stock
    setProducts(
      products.map((p) =>
        p.id === selectedProduct.id ? { ...p, currentStock: newStock, updatedAt: new Date().toISOString() } : p
      )
    );

    // Add to history
    const historyEntry: StockHistory = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      action: actionType,
      quantity: actionType === 'add' ? qty : -qty,
      previousStock: selectedProduct.currentStock,
      newStock,
      reason,
      userId: user?.id || '',
      userName: user?.name || '',
      timestamp: new Date().toISOString(),
    };
    setStockHistory([historyEntry, ...stockHistory]);

    toast({
      title: 'Success',
      description: `Stock ${actionType === 'add' ? 'added' : 'reduced'} successfully`,
    });
    setIsDialogOpen(false);
  };

  const stockColumns = [
    {
      key: 'name',
      header: 'Product',
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (product: Product) => (
        <StatusBadge status="info">{product.category}</StatusBadge>
      ),
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      render: (product: Product) => {
        const isLowStock = product.currentStock < product.minStockLevel;
        return (
          <div className="flex items-center gap-2">
            {isLowStock && <AlertTriangle className="h-4 w-4 text-warning" />}
            <span className={`text-lg font-semibold ${isLowStock ? 'text-warning' : ''}`}>
              {product.currentStock}
            </span>
          </div>
        );
      },
    },
    {
      key: 'minStockLevel',
      header: 'Min Level',
      render: (product: Product) => (
        <span className="text-muted-foreground">{product.minStockLevel}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (product: Product) => {
        const isLowStock = product.currentStock < product.minStockLevel;
        const isOutOfStock = product.currentStock === 0;
        return (
          <StatusBadge status={isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success'}>
            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
          </StatusBadge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDialog(product, 'add')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDialog(product, 'reduce')}
            disabled={product.currentStock === 0}
          >
            <Minus className="h-4 w-4 mr-1" />
            Reduce
          </Button>
        </div>
      ),
    },
  ];

  const historyColumns = [
    {
      key: 'productName',
      header: 'Product',
      render: (entry: StockHistory) => (
        <div>
          <p className="font-medium">{entry.productName}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (entry: StockHistory) => (
        <StatusBadge status={entry.action === 'add' ? 'success' : entry.action === 'reduce' ? 'warning' : 'info'}>
          {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
        </StatusBadge>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (entry: StockHistory) => (
        <span className={entry.quantity > 0 ? 'text-success' : 'text-destructive'}>
          {entry.quantity > 0 ? '+' : ''}{entry.quantity}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock Change',
      render: (entry: StockHistory) => (
        <span>
          {entry.previousStock} → {entry.newStock}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (entry: StockHistory) => (
        <span className="text-muted-foreground">{entry.reason}</span>
      ),
    },
    {
      key: 'userName',
      header: 'User',
      render: (entry: StockHistory) => entry.userName,
    },
    {
      key: 'timestamp',
      header: 'Date',
      render: (entry: StockHistory) => format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm'),
    },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
        <p className="page-subtitle">Monitor and manage your stock levels</p>
      </div>

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Stock Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Stock History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <DataTable
            data={filteredProducts}
            columns={stockColumns}
            searchPlaceholder="Search products..."
            searchValue={searchValue}
            onSearch={setSearchValue}
            emptyMessage="No products found."
          />
        </TabsContent>

        <TabsContent value="history">
          <DataTable
            data={stockHistory}
            columns={historyColumns}
            searchPlaceholder="Search history..."
            emptyMessage="No stock history found."
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'add' ? 'Add Stock' : 'Reduce Stock'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} - Current stock: {selectedProduct?.currentStock}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
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

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {actionType === 'add' ? (
                    <>
                      <SelectItem value="New shipment arrived">New shipment arrived</SelectItem>
                      <SelectItem value="Return from customer">Return from customer</SelectItem>
                      <SelectItem value="Inventory adjustment">Inventory adjustment</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Sold to customer">Sold to customer</SelectItem>
                      <SelectItem value="Damaged items">Damaged items</SelectItem>
                      <SelectItem value="Inventory adjustment">Inventory adjustment</SelectItem>
                      <SelectItem value="Expired items">Expired items</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockUpdate} variant={actionType === 'add' ? 'default' : 'destructive'}>
              {actionType === 'add' ? 'Add Stock' : 'Reduce Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
