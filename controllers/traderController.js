const Trader = require('../models/Trader');
const bcrypt = require('bcrypt');
const Booking = require('../models/Booking');

// Register a trader
exports.registerTrader = async (req, res) => {
  try {
    const { name, username, email, password, tradeType, region } = req.body;

    if (!name || !username || !email || !password || !tradeType || !region) {
      return res.send("All fields are required");
    }

    const existingTrader = await Trader.findOne({ $or: [{ username }, { email }] });
    if (existingTrader) return res.send("Username or email already in use");

    const hashedPassword = await bcrypt.hash(password, 10);

    const trader = await Trader.create({
      name,
      username,
      email,
      password: hashedPassword,
      tradeType,
      region
    });

    res.send(`Trader registered with ID: ${trader._id}`);
  } catch (err) {
    console.error(err);
    res.send("Error registering trader: " + err.message);
  }
};

// Login a trader
exports.loginTrader = async (req, res) => {
  try {
    const { username, password } = req.body;

    const trader = await Trader.findOne({ username });
    if (!trader) return res.send("Invalid username or password");

    const isMatch = await bcrypt.compare(password, trader.password);
    if (!isMatch) return res.send("Invalid username or password");

    req.session.traderId = trader._id;
    req.session.traderName = trader.name;

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send("Error logging in: " + err.message);
  }
};

// Logout
exports.logoutTrader = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send("Error logging out");
    res.redirect('/');
  });
};

// Middleware to check authentication and attach trader to req
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
    res.status(500).send('Server error');
  }
};

// Displays the trader dashboard with pending and completed bookings
exports.showDashboard = async (req, res) => {
  try {
    const traderId = req.trader._id;

    const pendingBookings = await Booking.find({ traderId, status: 'pending' }).lean();
    const completedBookings = await Booking.find({ traderId, status: 'accepted' }).lean();

    res.render('dashboard', {
      trader: req.trader,
      pendingBookings,
      completedBookings,
      services: req.trader.services // if you store trader services
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
};
