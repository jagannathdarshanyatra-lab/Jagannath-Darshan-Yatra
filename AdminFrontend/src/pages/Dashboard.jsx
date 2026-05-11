import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Building2,
  IndianRupee,
  TrendingUp,
  Package,
  MapPin,
  Globe,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatCard } from '@/components/admin/StatCard';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { BookingsChart } from '@/components/admin/charts/BookingsChart';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';
import { DestinationChart } from '@/components/admin/charts/DestinationChart';
import { TierBreakdownChart } from '@/components/admin/charts/TierBreakdownChart';
import dashboardService from '@/services/dashboardService';

const formatCurrency = (value) => {
  if (value === 0 || value === undefined) return '₹0';
  if (value >= 10000000) { // Crores
     return `₹${(value / 10000000).toFixed(2)}Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${(value / 1000).toFixed(0)}K`;
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    websiteVisits: 0,
    totalBookings: 0,
    activeHotels: 0,
    activePackages: 0,
    activeDestinations: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    recentActivity: [],
    upcomingTrips: [],
    bookingsByMonth: [],
    bookingsByTier: [],
    bookingsByDestination: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Website Visited"
          value={stats.websiteVisits?.toLocaleString() || '0'}
          change={stats.websiteVisitsChange || '+0% this week'}
          changeType={stats.websiteVisitsChangeType || 'neutral'}
          icon={Globe}
          iconColor="text-blue-500"
          delay={0}
        />
        <StatCard
          title="Booking Attempts"
          value={stats.totalBookings?.toLocaleString() || '0'}
          change={stats.totalBookingsChange || '+0% from last month'}
          changeType={stats.totalBookingsChangeType || 'neutral'}
          icon={CalendarCheck}
          iconColor="text-primary"
          delay={0.1}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change="+0% YoY"
          changeType="neutral"
          icon={IndianRupee}
          iconColor="text-success"
          delay={0.2}
        />
        <StatCard
          title="This Month Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          change={stats.monthlyRevenueChange || 'current month'}
          changeType={stats.monthlyRevenueChangeType || 'neutral'}
          icon={TrendingUp}
          iconColor="text-primary"
          delay={0.3}
        />
        <StatCard
          title="Active Packages"
          value={stats.activePackages}
          change="Available to book"
          changeType="neutral"
          icon={Package}
          iconColor="text-secondary"
          delay={0.4}
        />
        <StatCard
          title="Active Destinations"
          value={stats.activeDestinations}
          change="Across India"
          changeType="neutral"
          icon={MapPin}
          iconColor="text-info"
          delay={0.5}
        />
        <StatCard
          title="Active Hotels"
          value={stats.activeHotels}
          change="Premium partnerships"
          changeType="neutral"
          icon={Building2}
          iconColor="text-warning"
          delay={0.6}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingsChart data={stats.bookingsByMonth} />
        <RevenueChart data={stats.bookingsByMonth} />
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DestinationChart data={stats.bookingsByDestination} />
        <TierBreakdownChart data={stats.bookingsByTier} />
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity data={stats.recentActivity} />
        
        {/* Upcoming Trips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="chart-container"
        >
          <h3 className="text-lg font-semibold font-display text-foreground mb-4">Upcoming Trips</h3>
          <div className="space-y-3">
             {stats.upcomingTrips && stats.upcomingTrips.length > 0 ? (
               stats.upcomingTrips.map((trip, index) => (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-foreground">{trip.customerName}</p>
                    <p className="text-xs text-muted-foreground">{trip.packageName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(trip.tripDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">{trip.travelers} travelers</p>
                  </div>
                </motion.div>
              ))
             ) : (
               <p className="text-sm text-muted-foreground">No upcoming trips scheduled.</p>
             )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
