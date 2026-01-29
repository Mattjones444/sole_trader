const Trader = require('../models/Trader');
const bcrypt = require('bcrypt');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// Register a trader
exports.registerTrader = async (req, res) => {
  try {
    let { name, username, email, password, tradeType, region } = req.body;

    // Basic validation
    if (!name || !username || !email || !password || !tradeType || !region) {
      return res.status(400).send("All fields are required");
    }

    // Normalise inputs (helps filtering + consistency)
    name = name.trim();
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();
    tradeType = tradeType.trim(); // keep display casing from dropdown
    region = region.trim();

    const existingTrader = await Trader.findOne({
      $or: [{ username }, { email }]
    });

    if (existingTrader) {
      return res.status(400).send("Username or email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trader = await Trader.create({
      name,
      username,
      email,
      password: hashedPassword,
      tradeType,
      region
    });

    // Auto-login after register
    req.session.traderId = trader._id;
    req.session.traderName = trader.name;

    return res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error registering trader");
  }
};

// Login a trader
exports.loginTrader = async (req, res) => {
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    username = username.trim().toLowerCase();

    const trader = await Trader.findOne({ username });
    if (!trader) return res.status(400).send("Invalid username or password");

    const isMatch = await bcrypt.compare(password, trader.password);
    if (!isMatch) return res.status(400).send("Invalid username or password");

    req.session.traderId = trader._id;
    req.session.traderName = trader.name;

    return res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error logging in");
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const username = (req.query.username || '').trim().toLowerCase();
    const email = (req.query.email || '').trim().toLowerCase();

    // If neither provided, nothing to check
    if (!username && !email) {
      return res.json({ usernameAvailable: true, emailAvailable: true });
    }

    const or = [];
    if (username) or.push({ username });
    if (email) or.push({ email });

    const existing = await Trader.findOne({ $or: or }).select('username email').lean();

    // If found, work out which field(s) collide
    const usernameAvailable = username ? !(existing && existing.username === username) : true;
    const emailAvailable = email ? !(existing && existing.email === email) : true;

    return res.json({ usernameAvailable, emailAvailable });
  } catch (err) {
    console.error('checkAvailability error:', err);
    // Don’t block typing UX if server errors — just say "available" and let submit validation catch it.
    return res.json({ usernameAvailable: true, emailAvailable: true });
  }
};

//Logout
exports.logoutTrader = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send("Error logging out");

    // cookie name is usually "connect.sid" unless you changed it
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
};


// Middleware: check authentication and attach trader to req
exports.isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session.traderId) {
      return res.redirect('/login');
    }

    const trader = await Trader.findById(req.session.traderId).lean();
    if (!trader) {
      return res.redirect('/login');
    }

    req.trader = trader;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
};

// Dashboard
exports.showDashboard = async (req, res) => {
  try {
    const traderId = req.trader._id;

    const pendingBookingsRaw = await Booking.find({ traderId, status: 'pending' })
      .populate('serviceId', 'title')
      .lean();

    // ✅ Rejected (case-insensitive safety)
    const rejectedBookingsRaw = await Booking.find({
      traderId,
      status: { $regex: /^rejected$/i }
    })
      .populate('serviceId', 'title')
      .lean();

    // IMPORTANT: include price fields so we can calculate earnings
    const completedBookingsRaw = await Booking.find({ traderId, status: 'confirmed' })
      .populate('serviceId', 'title basePrice pricingType')
      .lean();

    const services = await Service.find({ traderId }).lean();

    const pendingBookings = pendingBookingsRaw.map(b => ({
      ...b,
      serviceTitle: b.serviceId?.title || 'Unknown service'
    }));

    const rejectedBookings = rejectedBookingsRaw.map(b => ({
      ...b,
      serviceTitle: b.serviceId?.title || 'Unknown service'
    }));

    const completedBookings = completedBookingsRaw.map(b => ({
      ...b,
      serviceTitle: b.serviceId?.title || 'Unknown service'
    }));

    // ✅ NEW: one list for the "My Jobs" panel + filtering
    const myJobsBookings = [
      ...pendingBookings.map(b => ({ ...b, status: 'pending' })),
      ...rejectedBookings.map(b => ({ ...b, status: 'rejected' })),
      ...completedBookings.map(b => ({ ...b, status: 'confirmed' }))
    ].sort((a, c) => {
      const ad = a.requestedDateTime ? new Date(a.requestedDateTime).getTime() : 0;
      const cd = c.requestedDateTime ? new Date(c.requestedDateTime).getTime() : 0;
      return cd - ad; // newest first
    });

    // ===== Stats =====
    const totalEarnedFixed = completedBookingsRaw.reduce((sum, b) => {
      const svc = b.serviceId;
      if (!svc) return sum;
      if (svc.pricingType !== 'fixed') return sum;
      const price = Number(svc.basePrice);
      if (Number.isNaN(price)) return sum;
      return sum + price;
    }, 0);

    const completedCount = completedBookingsRaw.length;

    // Earnings by month (fixed jobs only) for the chart
    const byMonth = {};
    completedBookingsRaw.forEach(b => {
      const svc = b.serviceId;
      if (!svc || svc.pricingType !== 'fixed') return;

      const price = Number(svc.basePrice);
      if (Number.isNaN(price)) return;

      const dt = b.requestedDateTime ? new Date(b.requestedDateTime) : null;
      if (!dt || Number.isNaN(dt.getTime())) return;

      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + price;
    });

    const monthKeys = Object.keys(byMonth).sort();
    const chartLabels = monthKeys.map(k => {
      const [y, m] = k.split('-');
      const d = new Date(Number(y), Number(m) - 1, 1);
      return d.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
    });
    const chartData = monthKeys.map(k => Number(byMonth[k].toFixed(2)));

    return res.render('dashboard', {
      trader: req.trader,

      // existing arrays (keep them)
      pendingBookings,
      rejectedBookings,
      completedBookings,

      // ✅ NEW: render this in "My Jobs" instead of pendingBookings
      myJobsBookings,

      services,

      totalEarnedFixed,
      completedCount,
      chartLabels,
      chartData
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading dashboard');
  }
};



// Update profile (AJAX from modal)
exports.updateProfile = async (req, res) => {
  try {
    const traderId = req.session.traderId;
    let { tradeType, region, availability, bio } = req.body;

    if (!tradeType || !region) {
      return res.status(400).json({ message: 'Trade type and region are required' });
    }

    tradeType = tradeType.trim();
    region = region.trim();
    availability = availability ? availability.trim() : '';
    bio = bio ? bio.trim() : '';

    await Trader.findByIdAndUpdate(traderId, {
      tradeType,
      region,
      availability,
      bio
    });

    return res.status(200).json({ message: 'Profile updated' });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Public trader directory page
exports.showAllTraders = async (req, res) => {
  try {
    const traders = await Trader.find().lean();

    // Get all services once, then attach to each trader
    const traderIds = traders.map(t => t._id);
    const services = await Service.find({ traderId: { $in: traderIds } }).lean();

    const servicesByTraderId = services.reduce((acc, s) => {
      const key = String(s.traderId);
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {});

    const tradersWithServices = traders.map(t => ({
      ...t,
      services: servicesByTraderId[String(t._id)] || []
    }));

    res.render('traders', { traders: tradersWithServices });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading traders');
  }
};
