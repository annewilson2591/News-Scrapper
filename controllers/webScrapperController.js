let axios = require('axios');
let cheerio = require('cheerio');
let mongoose = require('mongoose');
let db = require('../models');

//mongoose config
mongoose.Promise = Promise;
mongoose.connect("mongodb://<dbuser>:<dbpassword>@ds145916.mlab.com:45916/heroku_53scp3b2", {
    useMongoClient: true
});
let mongooseConnection = mongoose.connection;

mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function() {
    console.log('Successfully connected to Mongo DB');
});

module.exports = (app) => {

    //default route
    app.get("/", (req, res) => res.render("index"));

    //scrape articles route
    app.get("/api/search", (req, res) => {
        axios.get("http://npr.org/sections/news/").then(response => {
            //console.log("load response");
            //load that into cheerio and save it to $
            let $ = cheerio.load(response.data);

            let handlebarsObject = {
                //store cheerio objects in empty object
                data: []
            };
            
            //use cheerio to search for all Article HTML tags
            $("article").each((i, element) => {
                //npr returns low res images - string manipulation to get high res
                let lowResImageLink = $(element).children('.item-image').children('.imagewrap').children('a').children('img').attr('src');

                if (lowResImageLink) {
                    let imageLength = lowResImageLink.length;
                    let highResImage = lowResImageLink.substr(0, imageLength - 11) + "800-c100.jpg";

                    //store scraped data in handlebars object
                    handlebarsObject.data.push({
                        headline: $(element).children('.item-info').children('.title').children('a').text(),
                        summary: $(element).children('.item-info').children('.teaser').children('a').text(),
                        url: $(element).children('.item-info').children('.title').children('a').attr('href'),
                        imageURL: highResImage,
                        slug: $(element).children('.item-info').children('.slug-wrap').children('.slug').children('a').text(),
                        comments: null
                    }); // Store HTML Data as an Object within an Object
                } // End of If Else
            }); // End of Article Serch
            
            //return scraped data to handlebars for rendering
            res.render("index", handlebarsObject);
        });
    });

    //saved article route
    app.get("/api/savedArticles", (req, res) => {
        //grab every document in the Articles collection
        db.Articles.find({}).
        then(function(dbArticle) {
            res.json(dbArticle);
        }).catch(function(err) {
            res.json(err);
        });
    });

    //post requests
  
    app.post("/api/add", (req, res) => { // Add Article Route

        // console.log("add path hit");
    
        let articleObject = req.body;
    
        db.Articles. // Save the Article to the Database
        findOne({url: articleObject.url}). // Look for an Existing Article with the Same URL
        then(function(response) {
    
          if (response === null) { // Only Create Article if it has not been Created
            db.Articles.create(articleObject).then((response) => console.log(" ")).catch(err => res.json(err));
          } // End if
    
          // If we were able to successfully  save an Article, send a message to the client
          res.send("Article Saved");
        }).catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    
      }); // End Post Route
    
      // Delete Article Route
      app.post("/api/deleteArticle", (req, res) => {
        // console.log(req.body)
        sessionArticle = req.body;
    
        db.Articles.findByIdAndRemove(sessionArticle["_id"]). // Look for the Article and Remove from DB
        then(response => {
          if (response) {
            res.send("Sucessfully Deleted");
          }
        });
      }); // End deleteArticle Route
    
      // Delete Comment Route
      app.post("/api/deleteComment", (req, res) => {
        // console.log("delete comment route hit")
        let comment = req.body;
        db.Notes.findByIdAndRemove(comment["_id"]). // Look for the Comment and Remove from DB
        then(response => {
          if (response) {
            res.send("Sucessfully Deleted");
          }
        });
      }); // End deleteArticle Route
    
      // Create Notes Route
      app.post("/api/createNotes", (req, res) => {
    
        sessionArticle = req.body;
    
        db.Notes.create(sessionArticle.body).then(function(dbNote) {
          // console.log(dbNote);
          // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
          // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
          // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
          return db.Articles.findOneAndUpdate({
            _id: sessionArticle.articleID.articleID
          }, {
            $push: {
              note: dbNote._id
            }
          });
        }).then(function(dbArticle) {
          // If we were able to successfully update an Article, send it back to the client
          res.json(dbArticle);
        }).catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
      }); // End deleteArticle Route
    
      // Route for grabbing a specific Article by id, populate it with it's note
      app.post("/api/populateNote", function(req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        // console.log("ID is "+ req.body.articleID);
    
        db.Articles.findOne({_id: req.body.articleID}).populate("Note"). // Associate Notes with the Article ID
        then((response) => {
          // console.log("response is " + response);
    
          if (response.note.length == 1) { // Note Has 1 Comment
    
            db.Notes.findOne({'_id': response.note}).then((comment) => {
              comment = [comment];
              console.log("Sending Back One Comment");
              res.json(comment); // Send Comment back to the Client
            });
    
          } else { // Note Has 0 or more than 1 Comments
    
            console.log("2")
            db.Notes.find({
              '_id': {
                "$in": response.note
              }
            }).then((comments) => {
              // console.log("Sending Back Multiple Comments");
              res.json(comments); // Send Comments back to the Client
            });
          }
          // If we were able to successfully find an Article with the given id, send it back to the client
        }).catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
      }); // End of Post Populate Note
    
    } // End of Module Export
    
            
    