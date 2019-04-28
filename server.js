//imports
let express = require('express');
let bodyParser = require('body-parser');
let exphbs = require('express-handlebars');
//let logger = require('morgan');
//let mongoose = require('mongoose');
//let cheerio = require('cheerio');

//require all models
//let db = require('./models');

let PORT = process.env.PORT || 3000;

//initalize express
let app = express();

//configure middleware
app.use(bodyParser.urlencoded({ extended: false })); // Use body-parser for handling form submissions
app.use(bodyParser.json());
app.use(express.static("public"));

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//routes
require("./controllers/webScrapperController.js")(app);

//execution
app.listen(PORT, () => {
    console.log('App listening on PORT ${PORT}');
})