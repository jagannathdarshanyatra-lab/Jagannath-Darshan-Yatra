import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Building2,
  CalendarCheck,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Primitives';
import adminAuthService from '@/services/adminAuthService';

import logo from '../../assets/White_Logo_Bharat_Darshan.webp';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/packages', label: 'Packages', icon: Package },
  { path: '/destinations', label: 'Destinations', icon: MapPin },
  { path: '/hotels', label: 'Hotels', icon: Building2 },
  { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { path: '/inquiries', label: 'Inquiries', icon: MessageSquare },
  { path: '/faqs', label: 'FAQs', icon: HelpCircle },
];

// SuperAdmin-only nav items
const superAdminNavItems = [
  { path: '/approvals', label: 'Approvals', icon: ClipboardCheck },
];

const bottomNavItems = [
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ isCollapsed, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isSuperAdmin = adminAuthService.isSuperAdmin();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      adminAuthService.logout();
      navigate('/login');
    }
  };

  // Combine nav items based on role
  const allNavItems = isSuperAdmin
    ? [...navItems, ...superAdminNavItems]
    : navItems;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <motion.div
          initial={false}
          animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
          className="flex items-center gap-3 overflow-hidden"
        >
          <img src={logo} alt="Bharat Darshan" className="h-16 w-auto" />
        </motion.div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Role Badge */}
      {!isCollapsed && (
        <div className="px-4 py-2">
          <div className={cn(
            "text-xs font-semibold px-3 py-1.5 rounded-lg text-center",
            isSuperAdmin
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
          )}>
            {isSuperAdmin ? 'Super Admin' : '👤 Admin'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {allNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={cn(
                'sidebar-item group relative',
                isActive && 'active'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-sidebar-muted group-hover:text-sidebar-foreground'
              )} />
              <motion.span
                initial={false}
                animate={{ 
                  opacity: isCollapsed ? 0 : 1,
                  width: isCollapsed ? 0 : 'auto',
                }}
                className={cn(
                  'text-sm font-medium whitespace-nowrap overflow-hidden',
                  isActive ? 'text-white' : 'text-sidebar-foreground'
                )}
              >
                {item.label}
              </motion.span>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={cn(
                'sidebar-item group',
                isActive && 'active'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-sidebar-muted group-hover:text-sidebar-foreground'
              )} />
              <motion.span
                initial={false}
                animate={{ 
                  opacity: isCollapsed ? 0 : 1,
                  width: isCollapsed ? 0 : 'auto',
                }}
                className={cn(
                  'text-sm font-medium whitespace-nowrap overflow-hidden',
                  isActive ? 'text-white' : 'text-sidebar-foreground'
                )}
              >
                {item.label}
              </motion.span>
            </RouterNavLink>
          );
        })}
        
        <button 
          onClick={handleLogout}
          className="sidebar-item group w-full text-left"
        >
          <LogOut className="h-5 w-5 shrink-0 text-sidebar-muted group-hover:text-destructive transition-colors" />
          <motion.span
            initial={false}
            animate={{ 
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : 'auto',
            }}
            className="text-sm font-medium text-sidebar-foreground group-hover:text-destructive whitespace-nowrap overflow-hidden"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
}
