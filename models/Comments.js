let mongoose = require('mongoose');

let Schema = mongoose.Schema;

//using the Schema constructor, creat a new CommentSchema object

var CommentSchema = new Schema({
    body: String
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;