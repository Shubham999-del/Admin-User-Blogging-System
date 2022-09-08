const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Post } = require('../../models/post');
const { UserFollowers } = require('../../models/user_followers');

async function hashPassword(password) {
	return await bcrypt.hash(password, 10);
}

//creating new user
const create = async (req, res, next) => {
	try {
		const { name, email, password, role } = req.body;
		const hashedPassword = await hashPassword(password);
		const newUser = new User({ name, email, password: hashedPassword, role: role || 'user', active: true });
		const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
			expiresIn: '1d'
		});

		newUser.accessToken = accessToken;
		await newUser.save();
		res.json({
			data: newUser,
			accessToken
		});
	} catch (error) {
		next(error);
	}
};

//updating password
const passwordUpdate = async (req, res, next) => {
	try {
		if (req.user.role === 'admin') {
			const newPassword = req.params.password;
			const userId = req.params.userId;
			const hashedPassword = await hashPassword(newPassword);
			const user = user.findById(userId);
			user.password = hashedPassword;
			user.save();
			res.status(200).json({
				message: ' Password updated successfully'
			});
		} else {
			res.status(401).json({
				message: 'Ask admin to update your password'
			});
		}
	} catch (error) {
		next(error);
	}
};

//get all users
const getUsers = async (req, res, next) => {
	const users = await User.find({});
	res.status(200).json({
		data: users
	});
};

//get data of existing user
const getUserById = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const user = await User.findById(userId);
		if (!user) return next(new Error('User does not exist'));
		res.status(200).json({
			data: user
		});
	} catch (error) {
		next(error);
	}
};

//update creds of an existing user
const updateUserById = async (req, res, next) => {
	try {
		const update = req.body;
		const userId = req.params.userId;
		await User.findByIdAndUpdate(userId, update);
		const user = await User.findById(userId);
		res.status(200).json({
			data: user,
			message: 'User has been updated'
		});
	} catch (error) {
		next(error);
	}
};

//delete an existing user
const deleteUserById = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		await User.findByIdAndDelete(userId);
		await Post.deleteMany({ user_id: userId }); //deleteing all user's posts
		await UserFollowers.deleteMany({ follower: userId }); //updating followers/following as well
		await UserFollowers.deleteMany({ user: userId });
		res.status(200).json({
			data: null,
			message: 'User has been deleted'
		});
	} catch (error) {
		next(error);
	}
};

//get all posts of a user
const getUserPosts = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const query = dbSchemas.Post.find({ user_id: userId });
		query.exec(function (err, userPosts) {
			if (err) return next(err);
			res.send.json({
				data: userPosts
			});
		});
	} catch (error) {
		next(error);
	}
	//query with mongoose
};

//get users based on their active status
const getActiveInactiveUsers = async (req, res, next) => {
	const active = req.params.active; // listing active users
	if (active === 'active') {
		User.find({ active: true }, (err, users) => {
			if (err) {
				next(err);
			} else {
				if (users.length) {
					res.send.json({
						data: users
					});
				} else {
					res.send.json({
						message: 'No active users present'
					});
				}
			}
		});
	} else {
		User.find({ active: false }, (err, users) => {
			if (err) {
				next(err);
			} else {
				if (users.length) {
					res.send.json({
						data: users
					});
				} else {
					res.send.json({
						message: 'No inactive users present'
					});
				}
			}
		});
	}
};

//get all last weak and last month users created
const getRecentUsersCreated = async (req, res, next) => {
	try {
		const filter = req.params.filter;
		const currentDate = new Date();
		let query;
		if (filter === 'lastweak') {
			const before7Daysdate = new Date(currentDate.setDate(currentDate.getDate() - 7));
			query = dbSchemas.User.find({ created_at: { $gte: before7Daysdate } });
		} else if (filter === 'lastmonth') {
			const before1monthdate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
			query = dbSchemas.User.find({ created_at: { $gte: before1monthdate } });
		}

		query.exec(function (err, users) {
			if (err) return next(err);
			res.send.json({
				data: users
			});
		});
	} catch (error) {
		next(error);
	}
};

//get users created between given dates
const getUsersInBetweenDates = async (req, res, next) => {
	const startDate = req.query.startDate;
	const endDate = req.query.endDate;
	const query = dbSchemas.User.find({ created_at: { $gte: startDate, $lt: endDate } });
	query.exec(function (err, users) {
		if (err) return next(err);
		res.send.json({
			data: users
		});
	});
};

module.exports = {
	create,
	passwordUpdate,
	getUsers,
	getUserById,
	updateUserById,
	deleteUserById,
	getUserPosts,
	getActiveInactiveUsers,
	getRecentUsersCreated,
	getUsersInBetweenDates
};
