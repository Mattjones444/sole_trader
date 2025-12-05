//Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

//Initialise Express.js app
const app = express();
const PORT = 3000;

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