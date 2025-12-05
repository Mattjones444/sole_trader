
const Trader = require('../models/Trader');
const bcrypt = require('bcrypt');

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

        // Render index.ejs
        res.render('index', { traderName: trader.name });
    } catch (err) {
        console.error(err);
        res.send("Error logging in: " + err.message);
    }
};

// Logout
exports.logoutTrader = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send("Error logging out");
        res.redirect('/login');
    });
};

// Middleware to protect routes
exports.isAuthenticated = (req, res, next) => {
    if (req.session.traderId) {
        next();
    } else {
        res.redirect('/login');
    }
};


