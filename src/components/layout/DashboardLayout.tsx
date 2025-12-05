import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  LogOut, 
  Settings,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { 
      label: 'Maintenance', 
      icon: Settings, 
      href: '/dashboard/maintenance',
      adminOnly: true,
      children: [
        { label: 'Add Membership', href: '/dashboard/maintenance/add' },
        { label: 'Update Membership', href: '/dashboard/maintenance/update' },
      ]
    },
    { 
      label: 'Reports', 
      icon: FileText, 
      href: '/dashboard/reports',
      adminOnly: false 
    },
    { 
      label: 'Transactions', 
      icon: CreditCard, 
      href: '/dashboard/transactions',
      adminOnly: false 
    },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || role === 'admin');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-lg text-sidebar-foreground"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar transform transition-transform duration-300 lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-sidebar-primary" />
              <span className="text-xl font-heading font-bold text-sidebar-foreground">
                Event Manager
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;

              if (item.children) {
                return (
                  <div key={item.href} className="space-y-1">
                    <div className={cn(
                      "sidebar-item cursor-default",
                      isActive && "sidebar-item-active"
                    )}>
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      {role === 'admin' && (
                        <span className="ml-auto text-xs bg-sidebar-primary/20 text-sidebar-primary px-2 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="ml-8 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                            location.pathname === child.href
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                          )}
                        >
                          <ChevronRight className="h-3 w-3" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "sidebar-item",
                    isActive && "sidebar-item-active"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <Users className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">
                  {role || 'User'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 lg:ml-0 overflow-auto">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}