const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Print current schema
console.log('Checking schema structure...');

// Define nested comment schema
const CommentSchema = new Schema({
    commentID: Number,
    body: String,
    likes: Number,
    unlikes: Number,
    actor: { type: Schema.ObjectId, ref: 'Actor' },
    time: Number,
    class: String,
    replyTo: Number,
    subcomments: [{
        commentID: Number,
        body: String,
        likes: Number,
        unlikes: Number,
        actor: { type: Schema.ObjectId, ref: 'Actor' },
        time: Number,
        class: String
    }]
}, { _id: true });

// Main script schema
const scriptSchema = new Schema({
    postID: Number,
    body: String,
    picture: String,
    likes: Number,
    unlikes: Number,
    actor: { type: Schema.ObjectId, ref: 'Actor' },
    time: Number,
    class: String,
    length: Number,
    comments: [CommentSchema]
}, { _id: true });

const Script = mongoose.model('Script', scriptSchema);
module.exports = Script;