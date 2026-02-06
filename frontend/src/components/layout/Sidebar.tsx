import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  FileText,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Box,
  X,
  UserPlus,
  ClipboardList  
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package, adminOnly: true },
  // { label: 'Inventory', path: '/inventory', icon: Warehouse, adminOnly: true },
  { label: 'Customers', path: '/customers', icon: UserPlus },
  { label: 'Sales', path: '/sales', icon: ShoppingCart },
  // { label: 'Invoices', path: '/invoices', icon: FileText },
  { label: 'Users', path: '/users', icon: Users, adminOnly: true },
  // { label: 'Reports', path: '/reports', icon: BarChart3, adminOnly: true },
  { label: 'Requests', path: '/request', icon: ClipboardList }
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, isMobile = false }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);
  if (isAdmin) {
    filteredNavItems.pop(); // Remove the last item (Requests) for admin users
  }
  
  const handleNavClick = () => {
    if (isMobile) {
      onToggle();
    }
  };

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar transition-all duration-300 flex flex-col',
        isMobile
          ? 'relative w-64'
          : cn('fixed left-0 top-0 z-50', isCollapsed ? 'w-20' : 'w-64')
      )}
    >

      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <div className={cn('flex items-center gap-3', isCollapsed && !isMobile && 'justify-center w-full')}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar-primary">
            <Box className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">InventoryPro</span>
              <span className="text-xs text-sidebar-muted">Management System</span>
            </div>
          )}
        </div>
        {/* Mobile Close Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            const linkContent = (
              <NavLink
                to={item.path}
                onClick={handleNavClick}
                className={cn(
                  'sidebar-link',
                  isActive && 'sidebar-link-active',
                  isCollapsed && 'justify-center px-3'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );

            return (
              <li key={item.path}>
                {isCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3 mb-3', isCollapsed && 'justify-center')}>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sidebar-accent text-sidebar-foreground text-base font-semibold shrink-0">
            {user?.name.charAt(0)}

          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-muted capitalize">{user?.role}</p>
            </div>
          )}
        </div>

        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="w-full text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-3 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        )}
      </div>

      {/* Toggle Button - Desktop Only */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-card shadow-md hover:bg-secondary"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-blue-950" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-blue-950" />
          )}
        </Button>
      )}
    </aside>
  );
};

export default Sidebar;
