const express = require('express');
const router = express.Router();
const traderController = require('../controllers/traderController');

// Registration routes
router.get('/register', (req, res) => res.render('register'));
router.post('/register', traderController.registerTrader);

// Login/logout routes
router.get('/login', (req, res) => res.render('login'));
router.post('/login', traderController.loginTrader);
router.get('/logout', traderController.logoutTrader);

// Protected dashboard
router.get('/dashboard', traderController.isAuthenticated, (req, res) => {
    res.send(`Welcome to your dashboard, ${req.session.traderName}`);
});

module.exports = router;
