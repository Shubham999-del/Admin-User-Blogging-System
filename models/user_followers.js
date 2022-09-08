const mongoose = require('mongoose');
const { User } = require('./user');

const userFollowersSchema = new mongoose.Schema({
	user: {
		type: _id
	},
	follower: {
		type: _id
	}
});

const UserFollowers = mongoose.model('UserFollowers', userFollowersSchema);

module.exports.UserFollowers = UserFollowers;
