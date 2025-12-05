//Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Trader = require('./models/Trader');
const Service = require('./models/Service');
const Booking = require('./models/Booking');

//Load environment variables
dotenv.config();



//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log("MongoDB error:",err));

//Initialise Express.js app
const app = express();
const PORT = 3000;

//Sessions config
const session = require('express-session');
app.use(session({
    secret: 'your_secret_key', // replace with a secure key in production
    resave: false,
    saveUninitialized: false
}));

//Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

//Homepage route
app.get('/',(req,res)=>{
    res.render('index');
});

// Start server
app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})


const traderController = require('./controllers/traderController');

app.get('/register', (req, res) => res.render('register'));
app.post('/register', traderController.registerTrader);
app.get('/login', (req, res) => res.render('login'));
app.post('/login', traderController.loginTrader);
app.get('/logout', traderController.logoutTrader);

