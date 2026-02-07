import React, { useState } from 'react';
import { mockProducts } from '@/data/mockData';
import { Product } from '@/types';
import { DataTable } from '@/components/ui/data-table';
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
import { Plus, Edit, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createProduct, getProducts } from '@/api/apiCall';

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    sellingPrice: '',
    currentStock: '',
  });

  const fetchProducts = async () => {
    const response = await getProducts();
    if (response.success) {
      setProducts(response.data);
    } else {
      toast({ title: 'Error', description: response.error || 'Failed to fetch products', variant: 'destructive' });
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        _id: product._id || '',
        name: product.name,
        sellingPrice: product.sellingPrice.toString(),
        currentStock: product.currentStock.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        _id: '',
        name: '',
        sellingPrice: '',
        currentStock: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async() => {
    if (!formData.name || !formData.sellingPrice || !formData.currentStock) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (isNaN(parseFloat(formData.sellingPrice)) || parseFloat(formData.sellingPrice) <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid selling price', variant: 'destructive' });
      return;
    }

    if (isNaN(parseInt(formData.currentStock)) || parseInt(formData.currentStock) < 0) {
      toast({ title: 'Error', description: 'Please enter a valid current stock level', variant: 'destructive' });
      return;
    }

    if (!Number.isInteger(parseFloat(formData.currentStock))) {
      toast({ title: 'Error', description: 'Current stock level must be a whole number', variant: 'destructive' });
      return;
    }

    const productPayload = {
      ...(formData._id && { _id: formData._id }),
      name: formData.name,
      sellingPrice: parseFloat(formData.sellingPrice),
      currentStock: parseInt(formData.currentStock) || 0,
    };

    const response = await createProduct(productPayload);
    
    if (response.success) {
      if (editingProduct) {
        toast({ title: 'Success', description: 'Product updated successfully' });
      } else {
        toast({ title: 'Success', description: 'Product created successfully' });
      }
      fetchProducts();
      setIsDialogOpen(false);
    } else {
      const errorMsg = editingProduct ? 'Failed to update product' : 'Failed to create product';
      toast({ title: 'Error', description: response.error || errorMsg, variant: 'destructive' });
      return;
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (product: any) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{product.name}</p>
            
          </div>
        </div>
      ),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      render: (product: any) => (
        <span className="font-medium">{formatCurrency(product.sellingPrice)}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product: any) => {
        return (
          <div>
            <span>{product.currentStock}</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenDialog(product)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    }
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        searchPlaceholder="Search products..."
        searchValue={searchValue}
        onSearch={setSearchValue}
        emptyMessage="No products found."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? `Update product details (ID: ${formData._id}).` : 'Fill in the product details below.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {editingProduct && (
              <div className="grid gap-2 p-2 bg-muted rounded border">
                <p className="text-xs font-medium text-muted-foreground">Product ID</p>
                <p className="text-sm font-mono font-medium">{formData._id}</p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sellingPrice">Selling Price *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currentStock">Current Stock *</Label>
              <Input
                id="currentStock"
                type="number"
                step="1"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                placeholder="0"
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
