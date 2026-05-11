const Booking = require('../models/Booking');
const Package = require('../models/Package');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Visitor = require('../models/Visitor');
const Contact = require('../models/Contact');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Website Visits
    const totalVisits = await Visitor.countDocuments();
    const currentWeekVisits = await Visitor.countDocuments({ timestamp: { $gte: sevenDaysAgo } });
    const previousWeekVisits = await Visitor.countDocuments({ timestamp: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } });
    
    let visitChange = 0;
    let visitChangeType = 'neutral';
    
    if (previousWeekVisits > 0) {
      visitChange = Math.round(((currentWeekVisits - previousWeekVisits) / previousWeekVisits) * 100);
    } else if (currentWeekVisits > 0) {
      visitChange = 100;
    }
    
    if (visitChange > 0) visitChangeType = 'positive';
    else if (visitChange < 0) visitChangeType = 'negative';

    // 2. Booking Attempts (Inquiries + Bookings)
    const bookingsCount = await Booking.countDocuments();
    const inquiriesCount = await Contact.countDocuments();
    const totalBookings = bookingsCount + inquiriesCount;
    
    const currentMonthAttempts = await Booking.countDocuments({ createdAt: { $gte: startOfCurrentMonth } }) + 
                                await Contact.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
    const previousMonthAttempts = await Booking.countDocuments({ createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } }) + 
                                 await Contact.countDocuments({ createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
    
    let attemptChange = 0;
    let attemptChangeType = 'neutral';
    
    if (previousMonthAttempts > 0) {
      attemptChange = Math.round(((currentMonthAttempts - previousMonthAttempts) / previousMonthAttempts) * 100);
    } else if (currentMonthAttempts > 0) {
      attemptChange = 100;
    }
    
    if (attemptChange > 0) attemptChangeType = 'positive';
    else if (attemptChange < 0) attemptChangeType = 'negative';

    // 3. Dynamic Counts
    const activeHotels = await Hotel.countDocuments();
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
    const monthlyRevenueAggregation = await Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startOfCurrentMonth }
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

    // Monthly Revenue Change (MoM)
    const previousMonthRevenueAggregation = await Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$totalPrice' } 
        } 
      }
    ]);
    const previousMonthRevenue = previousMonthRevenueAggregation.length > 0 ? previousMonthRevenueAggregation[0].total : 0;
    
    let revenueChange = 0;
    let revenueChangeType = 'neutral';
    
    if (previousMonthRevenue > 0) {
      revenueChange = Math.round(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);
    } else if (monthlyRevenue > 0) {
      revenueChange = 100;
    }
    
    if (revenueChange > 0) revenueChangeType = 'positive';
    else if (revenueChange < 0) revenueChangeType = 'negative';

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
        websiteVisits: totalVisits,
        websiteVisitsChange: `${visitChange > 0 ? '+' : ''}${visitChange}% this week`,
        websiteVisitsChangeType: visitChangeType,
        totalBookings,
        totalBookingsChange: `${attemptChange > 0 ? '+' : ''}${attemptChange}% from last month`,
        totalBookingsChangeType: attemptChangeType,
        activeHotels,
        activePackages,
        activeDestinations,
        totalRevenue,
        monthlyRevenue,
        monthlyRevenueChange: `${revenueChange > 0 ? '+' : ''}${revenueChange}% from last month`,
        monthlyRevenueChangeType: revenueChangeType,
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
// @desc    Track website visit
// @route   POST /api/admin/dashboard/track-visit
// @access  Public
exports.trackVisit = async (req, res) => {
  try {
    const { path, userAgent } = req.body;
    
    // Simple check to avoid tracking too many repeated visits from same user in short time
    // In a real app we might use cookies or session IDs, but here we'll just record it
    
    await Visitor.create({
      path: path || '/',
      userAgent: userAgent || req.headers['user-agent']
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track Visit Error:', error);
    res.status(500).json({ success: false });
  }
};
