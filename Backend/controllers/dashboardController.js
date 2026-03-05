const Booking = require('../models/Booking');
const Package = require('../models/Package');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Static/Hardcoded Base Values
    const baseWebsiteVisits = 11000;
    const baseBookingAttempts = 144;

    // 2. Fetch Real Counts
    const totalBookingsCount = await Booking.countDocuments();
    const activeHotelsCount = await Hotel.countDocuments();
    
    // Calculate final displayed values (Base + Real)
    // For website visits, we don't have real tracking, so just return base
    const websiteVisits = baseWebsiteVisits;
    // For bookings, we add real bookings to base
    const totalBookings = baseBookingAttempts + totalBookingsCount;
    // For hotels, show actual count from database
    const activeHotels = activeHotelsCount;

    // 3. Dynamic Counts
    const activePackages = await Package.countDocuments();
    const activeDestinations = await Destination.countDocuments({ isActive: true });

    // 4. Financials (Revenue)
    // Total Revenue from confirmed/completed bookings
    const revenueAggregation = await Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['confirmed', 'completed'] } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$totalPrice' } 
        } 
      }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    // Monthly Revenue (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenueAggregation = await Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startOfMonth }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$totalPrice' } 
        } 
      }
    ]);
    const monthlyRevenue = monthlyRevenueAggregation.length > 0 ? monthlyRevenueAggregation[0].total : 0;

    // 5. Recent Activity (Last 5 Bookings)
    const recentBookings = await Booking.find()
      .select('contactName packageName status createdAt totalPrice')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Map to generic activity format
    const recentActivity = recentBookings.map(booking => ({
      id: booking._id,
      type: 'booking',
      message: `Booking received for ${booking.packageName} by ${booking.contactName || 'Guest'}`,
      time: booking.createdAt,
      status: booking.status,
      amount: booking.totalPrice
    }));

    // 6. Upcoming Trips
    const upcomingTrips = await Booking.find({
      tripDate: { $gte: new Date() },
      status: { $in: ['confirmed', 'completed'] }
    })
    .select('contactName packageName tripDate travelers')
    .sort({ tripDate: 1 })
    .limit(5)
    .lean();

    // 7. Charts Data
    // Bookings by Month (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const bookingsByMonthRaw = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" },
            monthName: { $dateToString: { format: "%b", date: "$createdAt" } }
          },
          bookings: { $sum: 1 },
          revenue: { 
            $sum: { 
              $cond: [{ $in: ["$status", ["confirmed", "completed"]] }, "$totalPrice", 0] 
            } 
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format for Recharts
    const bookingsByMonth = bookingsByMonthRaw.map(item => ({
      month: item._id.monthName,
      bookings: item.bookings,
      revenue: item.revenue
    }));

    // Bookings by Tier (Actual Bookings)
    // Lookup package for each booking to get the tier (type)
    const bookingsByTierRaw = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      {
        $addFields: {
           packageObjId: { $toObjectId: "$packageId" } 
        }
      },
      {
        $lookup: {
          from: "packages",
          localField: "packageObjId",
          foreignField: "_id",
          as: "packageDetails"
        }
      },
      {
        $unwind: {
          path: "$packageDetails",
          preserveNullAndEmptyArrays: false // Ignore bookings with invalid packages for stats
        }
      },
      {
        $group: {
          _id: "$packageDetails.type",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalBookingsForTier = bookingsByTierRaw.reduce((acc, curr) => acc + curr.count, 0) || 1;
    
    // Define all tiers to ensure consistent colors/ordering
    const allTiers = ['Lite', 'Standard', 'Pro', 'Premium', 'Elite'];
    
    const bookingsByTier = allTiers.map(tier => {
      const found = bookingsByTierRaw.find(item => item._id === tier);
      const count = found ? found.count : 0;
      return {
        tier,
        bookings: count,
        percentage: Math.round((count / totalBookingsForTier) * 100)
      };
    });

    // If no bookings, maybe return empty or don't show chart? 
    // Frontend handles empty array gracefully hopefully.


    // Bookings by Destination
    const bookingsByDestinationRaw = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      // Lookup package to get destination if not in booking
      {
        $addFields: {
           packageObjId: { $toObjectId: "$packageId" } 
        }
      },
      {
        $lookup: {
          from: "packages",
          localField: "packageObjId",
          foreignField: "_id",
          as: "packageDetails"
        }
      },
      {
        $unwind: {
          path: "$packageDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          destination: { $ifNull: ["$destination", "$packageDetails.primaryDestination", "Unknown"] }
        }
      },
      { $group: { _id: "$destination", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 4 }
    ]);
    
    // Calculate percentages
    const totalBookingsForDest = bookingsByDestinationRaw.reduce((acc, curr) => acc + curr.count, 0) || 1;
    const bookingsByDestination = bookingsByDestinationRaw.map((item, index) => ({
      name: item._id || 'Unknown',
      value: Math.round((item.count / totalBookingsForDest) * 100),
      color: `hsl(var(--chart-${index + 1}))`
    }));

    res.status(200).json({
      success: true,
      data: {
        websiteVisits,
        totalBookings,
        activeHotels,
        activePackages,
        activeDestinations,
        totalRevenue,
        monthlyRevenue,
        recentActivity,
        upcomingTrips,
        bookingsByMonth,
        bookingsByTier,
        bookingsByDestination
      }
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    // Fetch recent bookings
    const recentBookings = await Booking.find()
      .select('contactName packageName status createdAt totalPrice isReadByAdmin')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    const unreadCount = await Booking.countDocuments({ isReadByAdmin: false });

    const notifications = recentBookings.map(booking => ({
      id: booking._id,
      type: 'booking',
      title: 'New booking received',
      message: `${booking.packageName} - ${booking.contactName || 'Guest'}`,
      time: booking.createdAt,
      read: booking.isReadByAdmin || false
    }));

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Notification Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/dashboard/notifications/:id/read
// @access  Private/Admin
exports.markNotificationAsRead = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (booking) {
      booking.isReadByAdmin = true;
      await booking.save();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Notification not found' });
    }
  } catch (error) {
     console.error('Mark Read Error:', error);
     res.status(500).json({ success: false, error: 'Server Error' });
  }
};
