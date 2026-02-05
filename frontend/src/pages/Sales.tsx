import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSales } from '@/data/mockData';
import { Sale, SaleItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import StatusBadge from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {  Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { getAllSales, acceptSale } from '@/api/apiCall';

const Sales: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  

  // Filter sales based on role
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      (sale._id?.toLowerCase().includes(searchValue.toLowerCase()) || false) ||
      (sale.customerId?.name?.toLowerCase().includes(searchValue.toLowerCase()) || false);
    
    if (!isAdmin) {
      return matchesSearch && sale.salesPersonId?._id === user?.id;
    }
    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const fetchSales = async () => {
      if ( !user) {
        toast({
          title: 'Error',
          description: 'User not logged in',
          variant: 'destructive',
        });
        return;
      }
      
      const result = await getAllSales();
      if (result.success && result.data) {
        
        setSales(result.data);
      }
      else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch sales',
          variant: 'destructive',
        });
      }
    }


  useEffect(() => { 
    fetchSales();
    console.log("user in sales page:", user);
    console.log("isAdmin in sales page:", isAdmin);
  }, []);

  const salesColumns = [
    {
      key: 'createdAt',
      header: 'Date',
      render: (sale: Sale) => format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (sale: Sale) => sale.customerId?.name || 'Walk-in Customer',
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
      render: (sale: Sale) => sale.salesPersonId?.name || 'Unknown',
    },
    {
      key: 'status',
      header: 'Status',
      render: (sale: Sale) => (
        <StatusBadge status={sale.status === 'Completed' ? 'success' : sale.status === 'Pending' ? 'warning' : 'error'}>
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

  const handleApproveSale = async (saleId: string) => {

    const res = await acceptSale(saleId);
    if (res.success) {
      toast({
        title: 'Success',
        description: 'Sale approved successfully',
      });
    } else {
      toast({
        title: 'Error',
        description: res.error || 'Failed to approve sale',
        variant: 'destructive',
      });
    }
    setSelectedSale(null);  
    fetchSales();
    
  
  };



  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Sales</h1>
          <p className="page-subtitle">Manage sales transactions</p>
        </div>
        {/* <Button onClick={() => setIsNewSaleOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button> */}
      </div>

      <DataTable
        data={filteredSales}
        columns={salesColumns}
        searchPlaceholder="Search sales..."
        searchValue={searchValue}
        onSearch={setSearchValue}
        emptyMessage="No sales found."
      />


      {/* Invoice View Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoice {selectedSale?._id}</DialogTitle>
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
                  <span>{selectedSale.customerId?.name || selectedSale.customerName || 'Walk-in Customer'}</span>
                </div>
                {selectedSale.customerId?.businessName && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Business:</span>
                    <span>{selectedSale.customerId.businessName}</span>
                  </div>
                )}
                {selectedSale.customerId?.area && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Area:</span>
                    <span>{selectedSale.customerId.area}</span>
                  </div>
                )}
                {selectedSale.customerId?.phoneNumber && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{selectedSale.customerId.phoneNumber}</span>
                  </div>
                )}
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">Sales Person:</span>
                  <span>{selectedSale.salesPersonId?.name || 'Unknown'}</span>
                </div>
                {/* {selectedSale.salesPersonId?.email && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{selectedSale.salesPersonId.email}</span>
                  </div>
                )} */}
                {selectedSale.salesPersonId?.role && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="capitalize">{selectedSale.salesPersonId.role}</span>
                  </div>
                )}
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
            {user?.role === 'admin' && selectedSale?.status === 'Pending' && (
              <Button
                className="bg-green-100 text-green-900 hover:bg-green-700"
                onClick={() => handleApproveSale(selectedSale._id!)}
              >
                Approve Sale
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;
