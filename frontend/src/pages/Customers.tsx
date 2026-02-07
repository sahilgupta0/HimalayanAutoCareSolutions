import React, { useState } from 'react';
import { Plus, Search, Phone, MapPin, Building2, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {createCustomer, deleteCustomer, getCustomersFromBackend, updateCustomer} from "@/api/apiCall.tsx";

interface Customer {
  _id: string;
  name: string;
  businessName: string;
  panNumber: string;
  district: string;
  area: string;
  phoneNumber: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const resetForm = () => {
    setName('');
    setBusinessName('');
    setPanNumber('');
    setDistrict('');
    setArea('');
    setPhoneNumber('');
  };

  const handleAddCustomer = async () => {
    if (!name.trim() || !panNumber.trim() || !district.trim() || !area.trim() || !phoneNumber.trim() || !businessName.trim()) {
      toast.error('Details required');
      return;
    }

    if(phoneNumber.trim().length < 10){
      toast.error('Phone number must be at least 10 digits');
      return;
    }

    const newCustomer = {
      name: name.trim(),
      businessName: businessName.trim(),
      panNumber: panNumber.trim(),
      district: district.trim(),
      area: area.trim(),
      phoneNumber: phoneNumber.trim()
    };

    const result = await createCustomer(newCustomer);
    
    if(!result.success){
      toast.error(result.error || 'Failed to create customer');
      return;
    }
    toast.success('Customer added successfully');
    resetForm();
    setIsAddDialogOpen(false);
    fetchCustomers();
  };

  const handleEditCustomer = async () => {
    if (!editingCustomer || !name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const dataToUpdate = {
      _id: editingCustomer._id,
      name: name.trim(),
      businessName: businessName.trim(),
      panNumber: panNumber.trim(),
      district: district.trim(),
      area: area.trim(),
      phoneNumber: phoneNumber.trim()
    };

    const response = await updateCustomer(dataToUpdate);

    if(!response.success){
      toast.error(response.error || 'Failed to update customer');
      return;
    }
    console.log("Update response:", response.data);
    toast.success(response.data?.message || 'Customer updated successfully');

    await fetchCustomers();
    resetForm();
    setEditingCustomer(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteCustomer = async(id: string) => {
    // Optimistically update UI
    const response = await deleteCustomer(id);
    if(!response.success){
      toast.error(response.error || 'Failed to delete customer');
      return;
    }
    toast.success(response.data?.message || 'Customer deleted successfully');
    await fetchCustomers();
  };

  const openEditDialog = (customerid : string, customer: Customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setBusinessName(customer.businessName);
    setPanNumber(customer.panNumber);
    setDistrict(customer.district);
    setArea(customer.area); 
    setPhoneNumber(customer.phoneNumber);
    setIsEditDialogOpen(true);
  };

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



  const filteredCustomers = customers.filter(customer =>
    customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) 
    // customer.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // customer.phoneNumber.includes(searchTerm) || 
    // customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // customer.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // customer.panNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter the customer details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name </Label>
                <Input
                  id="name"
                  placeholder="Enter customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Enter business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panNumber">Pan Number</Label>
                <Input
                  id="panNumber"
                  placeholder="Enter pan number"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  placeholder="Enter district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  placeholder="Enter area/location"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomer}>Add Customer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCustomers.filter(c => c.businessName).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Business Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCustomers.filter(c => c.businessName).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Areas Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(filteredCustomers.map(c => c.area).filter(Boolean)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead className="hidden sm:table-cell">Business Name</TableHead>
                <TableHead className="hidden md:table-cell">Pan Number</TableHead>
                <TableHead className="hidden md:table-cell">Area</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      <div className="sm:hidden text-xs text-muted-foreground">
                        {customer.businessName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {customer.businessName}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {customer.businessName || '-'}
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {customer.panNumber || '-'}
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {customer.area || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {customer.phoneNumber || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(customer._id, customer)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCustomer(customer._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Customer Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter customer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-businessName">Business Name</Label>
              <Input
                id="edit-businessName"
                placeholder="Enter business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-panNumber">PAN Number</Label>
              <Input
                id="edit-panNumber"
                placeholder="Enter PAN number"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-district">District</Label>
              <Input
                id="edit-district"
                placeholder="Enter district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-area">Area</Label>
              <Input
                id="edit-area"
                placeholder="Enter area/location"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNumber">Phone Number</Label>
              <Input
                id="edit-phoneNumber"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCustomer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
