import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { mockSales } from '@/data/mockData';
import { Sale } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import StatusBadge from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, Printer, Download, FileText, Box } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Invoices: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Sale | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Filter invoices based on role
  const filteredInvoices = mockSales.filter((sale) => {
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

  const handlePrint = () => {
    window.print();
    toast({ title: 'Print', description: 'Print dialog opened' });
  };

  const handleDownloadPDF = () => {
    toast({ title: 'Download', description: 'PDF download initiated (mock)' });
  };

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (sale: Sale) => (
        <span className="font-medium text-primary">{sale.invoiceNumber}</span>
      ),
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
      key: 'createdAt',
      header: 'Date',
      render: (sale: Sale) => format(new Date(sale.createdAt), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (sale: Sale) => (
        <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(sale)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <p className="page-subtitle">View and manage all invoices</p>
      </div>

      <DataTable
        data={filteredInvoices}
        columns={invoiceColumns}
        searchPlaceholder="Search invoices..."
        searchValue={searchValue}
        onSearch={setSearchValue}
        emptyMessage="No invoices found."
      />

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </DialogHeader>

          {selectedInvoice && (
            <div ref={printRef} className="space-y-6 print:p-8">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
                    <Box className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">InventoryPro</h2>
                    <p className="text-sm text-muted-foreground">Management System</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-primary">{selectedInvoice.invoiceNumber}</h3>
                  <StatusBadge status="success" className="mt-1">
                    {selectedInvoice.status}
                  </StatusBadge>
                </div>
              </div>

              <Separator />

              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Bill To</h4>
                  <p className="font-medium">{selectedInvoice.customerName || 'Walk-in Customer'}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Invoice Details</h4>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Date:</span>{' '}
                    {format(new Date(selectedInvoice.createdAt), 'MMMM dd, yyyy')}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Time:</span>{' '}
                    {format(new Date(selectedInvoice.createdAt), 'hh:mm a')}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Processed by:</span>{' '}
                    {selectedInvoice.salesPersonName}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-semibold">Item</th>
                      <th className="text-center p-3 font-semibold">Qty</th>
                      <th className="text-right p-3 font-semibold">Unit Price</th>
                      <th className="text-right p-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3">{item.productName}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-destructive">-{formatCurrency(selectedInvoice.discount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between py-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-muted-foreground pt-6 border-t">
                <p>Thank you for your business!</p>
                <p className="mt-1">For inquiries, please contact support@inventorypro.com</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
