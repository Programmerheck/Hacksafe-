const Log = require('../models/Log');
const Alert = require('../models/Alert');

// @desc    Get aggregated cybersecurity analytics statistics
// @route   GET /api/analytics
// @access  Private
exports.getAnalyticsStats = async (req, res) => {
  try {
    // 1. Core counters
    const totalEvents = await Log.countDocuments({});
    const activeThreats = await Alert.countDocuments({ status: 'open' });
    const failedLogins = await Log.countDocuments({
      category: 'auth',
      message: /failed/i,
    });

    // 2. Severity Breakdown (Info, Warning, Error, Critical)
    const severityBreakdown = await Log.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    const severityMap = { info: 0, warning: 0, error: 0, critical: 0 };
    severityBreakdown.forEach(item => {
      severityMap[item._id] = item.count;
    });

    // 3. Category Breakdown (Firewall, Auth, Malware, System)
    const categoryBreakdown = await Log.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const categoryMap = { firewall: 0, auth: 0, malware: 0, system: 0 };
    categoryBreakdown.forEach(item => {
      categoryMap[item._id] = item.count;
    });

    // 4. IP Traffic Tracking (Top IPs generating traffic or alerts)
    const topIPs = await Log.aggregate([
      { $group: { _id: '$sourceIP', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const parsedTopIPs = topIPs.map(item => ({
      ip: item._id,
      events: item.count,
    }));

    // 5. Simulated real-time hardware telemetry
    // For CPU load, Network traffic, etc.
    const systemTelemetry = {
      cpuUsage: Math.floor(Math.random() * 30) + 15, // 15-45% standard loaded CPU
      networkInbound: Math.floor(Math.random() * 400) + 100, // KB/s
      networkOutbound: Math.floor(Math.random() * 200) + 50, // KB/s
      memoryUsage: Math.floor(Math.random() * 20) + 40, // 40-60%
    };

    // 6. Chronological Attack Trends (Logs grouped by severity over past hour / days)
    // We will generate the 7 recent data intervals for the chart
    const trends = await Log.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%H:%M', date: '$timestamp' }
          },
          critical: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          },
          error: {
            $sum: { $cond: [{ $eq: ['$severity', 'error'] }, 1, 0] }
          },
          warning: {
            $sum: { $cond: [{ $eq: ['$severity', 'warning'] }, 1, 0] }
          },
          info: {
            $sum: { $cond: [{ $eq: ['$severity', 'info'] }, 1, 0] }
          },
          timestamp: { $max: '$timestamp' }
        }
      },
      { $sort: { timestamp: -1 } },
      { $limit: 10 }
    ]);

    // Reverse trends to make it chronological (left to right in charts)
    const formattedTrends = trends.reverse().map(item => ({
      time: item._id,
      critical: item.critical,
      error: item.error,
      warning: item.warning,
      info: item.info,
      total: item.critical + item.error + item.warning + item.info,
    }));

    // 7. Geographic Attack Mapping (Simulated coordinates or country counts based on IP patterns)
    const geoMap = [
      { country: 'United States', code: 'US', count: Math.floor(totalEvents * 0.45) + 3, coords: [37.0902, -95.7129] },
      { country: 'Russia', code: 'RU', count: Math.floor(totalEvents * 0.20) + 1, coords: [61.5240, 105.3188] },
      { country: 'China', code: 'CN', count: Math.floor(totalEvents * 0.15) + 2, coords: [35.8617, 104.1954] },
      { country: 'Germany', code: 'DE', count: Math.floor(totalEvents * 0.10) + 1, coords: [51.1657, 10.4515] },
      { country: 'Netherlands', code: 'NL', count: Math.floor(totalEvents * 0.05) + 1, coords: [52.1326, 5.2913] },
      { country: 'Unknown', code: 'UN', count: Math.floor(totalEvents * 0.05), coords: [0, 0] },
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        activeThreats,
        failedLogins,
        severities: severityMap,
        categories: categoryMap,
        topIPs: parsedTopIPs,
        systemTelemetry,
        trends: formattedTrends,
        geoMap,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
