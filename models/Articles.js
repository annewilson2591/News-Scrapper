let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let ArticleSchema = new Schema({

    headline: {
        type: String,
        required: true
    },

    summary: {
        type: String,
        required: true
    },

    url: {
        type: String,
        required: true
    },

    imageURL: {
        type: String,
        required: true
    },

    slug: {
        type: String
    },

    //comments is an object that stores a Note id
    //the ref property links the ObjectId to the Note model
    //this allows us to populate the Article with an associated Comment

    note: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }]
});

let Article = mongoose.model("Article", ArticleSchema);

module.exports = Article; 