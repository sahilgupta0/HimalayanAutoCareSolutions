import React, { useState } from 'react';
import { mockUsers } from '@/data/mockData';
import { User, UserRole } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit, KeyRound, UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { signup, userFetchAll } from '@/api/apiCall';

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'sales' as UserRole,
    password : '',
    // isActive: true,
  });

  const fetchUsers = async () => {
    try {
      const response = await userFetchAll();
      const normalizedUsers = response.data.map((user: any) => ({
        ...user,
        id: user._id || user.id, // Use MongoDB _id if available
      }));
      setUsers(normalizedUsers);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.email && user.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password,
        // isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'sales',
        password: '',
        // isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: 'Error', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...formData }
            : u
        )
      );
      toast({ title: 'Success', description: 'User updated successfully' });
    } else {
      try {
        const result = await signup(formData.email, formData.password, formData.name, formData.role);
  
        if (result.success) {
          // Use the user data returned from API with proper ID mapping
          const newUserFromAPI = {
            ...result.data,
            id: result.data._id || result.data.id, // Normalize MongoDB _id to id
          };
          
          setUsers([newUserFromAPI, ...users]);
          toast({ title: 'Success!', description: 'User created successfully.' });
        } else {
          toast({ title: 'Creation failed', description: result.error, variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to create user', variant: 'destructive' });
      }
    }

    setIsDialogOpen(false);
  };

  // const toggleUserStatus = (userId: string) => {
  //   setUsers(
  //     users.map((u) =>
  //       u.id === userId ? { ...u, isActive: !u.isActive } : u
  //     )
  //   );
  //   toast({ title: 'Success', description: 'User status updated' });
  // };

  const handleResetPassword = () => {
    toast({ title: 'Success', description: 'Password reset link sent (mock)' });
    setIsResetPasswordOpen(false);
    setSelectedUserId(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.avatar || user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <StatusBadge status={user.role === 'admin' ? 'info' : 'neutral'}>
          {user.role === 'admin' ? 'Administrator' : 'Sales Staff'}
        </StatusBadge>
      ),
    },
    // {
    //   key: 'actions',
    //   header: 'Actions',
    //   render: (user: User) => (
    //     <div className="flex items-center gap-2">
    //       <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
    //         <Edit className="h-4 w-4" />
    //       </Button>
    //       <Button
    //         variant="ghost"
    //         size="icon"
    //         onClick={() => {
    //           setSelectedUserId(user.id);
    //           setIsResetPasswordOpen(true);
    //         }}
    //       >
    //         <KeyRound className="h-4 w-4" />
    //       </Button>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and permissions</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        searchPlaceholder="Search users..."
        searchValue={searchValue}
        onSearch={setSearchValue}
        emptyMessage="No users found."
      />

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update the user details below.' : 'Fill in the user details below.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="sales">Sales Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              This will send a password reset link to the user's email address.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to reset the password for this user?
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
