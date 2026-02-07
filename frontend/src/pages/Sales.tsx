import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSales } from '@/data/mockData';
import { Sale, SaleItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import StatusBadge from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {  Eye, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { getAllSales, acceptSale, rejectSale } from '@/api/apiCall';

const Sales: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [billFilter, setBillFilter] = useState<'bill' | 'no-bill' | 'both'>('both');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  

  // Filter sales based on role, search, bill type, and date range
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      (sale._id?.toLowerCase().includes(searchValue.toLowerCase()) || false) ||
      (sale.customerId?.name?.toLowerCase().includes(searchValue.toLowerCase()) || false);
    
    const matchesBillType = billFilter === 'both' ? true : 
      billFilter === 'bill' ? sale.bill === true : sale.bill === false;
    
    // Date range filtering
    let matchesDateRange = true;
    if (fromDate || toDate) {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
      
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && saleDate >= from;
      }
      
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // End of day
        matchesDateRange = matchesDateRange && saleDate <= to;
      }
    }
    
    if (!isAdmin) {
      return matchesSearch && matchesBillType && matchesDateRange && sale.salesPersonId?._id === user?.id;
    }
    return matchesSearch && matchesBillType && matchesDateRange;
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
        const reverseSales = [...result.data].reverse(); // Reverse the order to show latest sales first
        setSales(reverseSales);
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
  }, []);

  const salesColumns = [
    {
      key: 'createdAt',
      header: 'Date',
      render: (sale: Sale) => format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm'),
      sortable: true,
      sortFn: (a: Sale, b: Sale) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      },
    },
    {
      key: 'BussinessName',
      header: 'Bussiness Name',
      render: (sale: Sale) => sale.customerId?.businessName || 'Walk-in Customer',
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
      sortable: true,
      sortFn: (a: Sale, b: Sale) => a.total - b.total,
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
      sortable: true,
      sortFn: (a: Sale, b: Sale) => {
        const statusOrder = { 'Pending': 0, 'Completed': 1, 'Cancelled': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      },
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
        className: 'bg-green-50 border-green-200 text-green-900',
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

  const handleRejection = async (saleId: string) => {
    
    // Implement rejection logic here (e.g., API call to reject the sale)
    const res = await rejectSale(saleId);
    if (res.success) {
      toast({
        title: 'Success',
        description: 'Sale rejected successfully',
        className: 'bg-red-50 border-red-200 text-red-900',
      });
    } else {
      toast({
        title: 'Error',
        description: res.error || 'Failed to reject sale',
        variant: 'destructive',
      });
    }
    setSelectedSale(null);  
    fetchSales();
  };

  const handleExport = (exportFormat: 'csv' | 'pdf') => {
    if (exportFormat !== 'csv') {
      toast({
        title: 'Export',
        description: `Exporting as ${exportFormat.toUpperCase()} is not implemented yet.`,
        variant: 'default',
      });
      return;
    }

    try {
      // Prepare data for Excel export with detailed items
      const exportData: any[] = [];
      
      filteredSales.forEach((sale) => {
        // Add a row for each item in the sale
        sale.items.forEach((item, index) => {
          exportData.push({
            'Date': format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm'),
            // 'Sale ID': sale._id || 'N/A',
            'Business Name': sale.customerId?.businessName || 'Walk-in Customer',
            'Customer Name': sale.customerId?.name || 'N/A',
            'Area': sale.customerId?.area || 'N/A',
            'Phone': sale.customerId?.phoneNumber || 'N/A',
            'Product Name': item.productName || 'N/A',
            'Quantity': item.quantity,
            'Unit Price (₹)': item.unitPrice,
            'Item Total (₹)': item.total,
            'Sale Total (₹)': index === 0 ? sale.total : '', // Show sale total only on first item
            'Sales Person': sale.salesPersonId?.name || 'Unknown',
            'Status': sale.status.charAt(0).toUpperCase() + sale.status.slice(1),
            'Bill Type': sale.bill ? 'Bill' : 'No Bill',
          });
        });
      });

      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 18 }, // Date
        // { wch: 24 }, // Sale ID
        { wch: 25 }, // Business Name
        { wch: 20 }, // Customer Name
        { wch: 25 }, // Area
        { wch: 15 }, // Phone
        { wch: 30 }, // Product Name
        { wch: 10 }, // Quantity
        { wch: 15 }, // Unit Price
        { wch: 15 }, // Item Total
        { wch: 15 }, // Sale Total
        { wch: 20 }, // Sales Person
        { wch: 12 }, // Status
        { wch: 12 }, // Bill Type
      ];
      worksheet['!cols'] = columnWidths;

      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Data');

      // Generate filename with current date and filter info
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const filterStr = billFilter === 'both' ? 'All' : billFilter === 'bill' ? 'Bill' : 'NoBill';
      const filename = `Sales_${filterStr}_${dateStr}.xlsx`;

      // Write and download the file
      XLSX.writeFile(workbook, filename);

      toast({
        title: 'Success',
        description: `Exported ${filteredSales.length} sales with ${exportData.length} items to ${filename}`,
        className: 'bg-green-50 border-green-200 text-green-900',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export sales data',
        variant: 'destructive',
      });
    }
  }

  
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

        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <FileDown className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Bill Type Filter (Bill / No Bill) */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Filter by Bill Type:</span>
        <Button
          variant={billFilter === 'bill' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBillFilter('bill')}
        >
          Bill
        </Button>
        <Button
          variant={billFilter === 'no-bill' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBillFilter('no-bill')}
        >
          No Bill
        </Button>

        <Button
          variant={billFilter === 'both' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBillFilter('both')}
        >
          Both
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm text-muted-foreground">Filter by Date Range:</span>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {(fromDate || toDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
          >
            Clear Dates
          </Button>
        )}
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
                {
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Bill Type:</span>
                    <span className="capitalize">{selectedSale.bill ? 'Bill' : 'No Bill'}</span>
                  </div>
                }
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
                <div className="flex justify-between font-bold text-lg">
                  <span>Total </span>
                  <span>{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="bg-amber-100 text-red-900 hover:bg-amber-400 hover:text-white" onClick={() => setSelectedSale(null)}>
              Close
            </Button>
            {user?.role === 'admin' && selectedSale?.status === 'Pending' && (  
              <>
                <Button
                  className="bg-red-100 text-red-900 hover:bg-red-700 hover:text-white"
                  onClick={() => handleRejection(selectedSale._id!)}
                  >
                  Reject Sale
                </Button>
                
                <Button
                  className="bg-green-100 text-green-900 hover:bg-green-700 hover:text-white"
                  onClick={() => handleApproveSale(selectedSale._id!)}
                  >
                  Approve Sale
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;
