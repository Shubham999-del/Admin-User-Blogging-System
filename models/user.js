const mongoose = require('mongoose');
const { boolean } = require('webidl-conversions');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true
	},
	created_at: {
		type: Date,
		default: Date.now()
	},
	last_login: {
		type: Date,
		required: true
	},
	active: {
		type: Boolean,
		required: true
	}
});
const User = mongoose.model('User', userSchema);

module.exports.User = User;
