const mongoose = require('mongoose');
const { User } = require('./user');

const postSchema = new mongoose.Schema({
	created_at: {
		type: Date,
		default: Date.now
	},
	user_id: {
		type: _id
	},
	name: {
		type: String
	}
});

const Post = mongoose.model('Post', postSchema);

module.exports.Post = Post;
