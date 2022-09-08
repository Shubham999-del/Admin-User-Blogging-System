const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Post } = require('../../models/post');
const { UserFollowers } = require('../../models/user_followers');
// const e = require('express');

async function hashPassword(password) {
	return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
	return await bcrypt.compare(plainPassword, hashedPassword);
}
//creating new user
const signup = async (req, res, next) => {
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

//login existing user
const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		user.active = true;
		if (!user) return next(new Error('Email does not exist'));
		const validPassword = await validatePassword(password, user.password);
		if (!validPassword) return next(new Error('Password is not correct'));
		const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1d'
		});
		await User.findByIdAndUpdate(user._id, { accessToken });
		res.status(200).json({
			data: { name: user.name, email: user.email, role: user.role },
			accessToken
		});
	} catch (error) {
		next(error);
	}
};

//logout user
const logout = async (req, res, next) => {
	try {
		const user = req.user;
		user.last_login = new Date();
		user.active = false;
		res.locals.loggedInUser = null; //to indicate that the local logged in user has now logged out
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
const getUser = async (req, res, next) => {
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
const updateUser = async (req, res, next) => {
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
const deleteUser = async (req, res, next) => {
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

//create a post
const createPost = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const newPost = new Post({ created_at: new Date(), user_id: userId });
		await newPost.save();
	} catch (error) {
		next(error);
	}
};

// follow a user
const followUser = async (req, res, next) => {
	try {
		const otherUserID = req.query.userId;
		const currentUser = req.params.userId;
		const newFollowing = new UserFollowers({ user: otherUserID, follower: currentUser });
		await newFollowing.save();
	} catch (error) {
		next(error);
	}
};

//user followings
const getAllFollowing = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const query = dbSchemas.UserFollowers.find({ follower: userId });
		query.exec(function (err, followingList) {
			if (err) return next(err);
			res.send.json({
				data: followingList
			});
		});
	} catch (error) {
		next(error);
	}
};

//user followers
const getAllFollowers = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const query = dbSchemas.UserFollowers.find({ user: userId });
		query.exec(function (err, followersList) {
			if (err) return next(err);
			res.send.json({
				data: followersList
			});
		});
	} catch (error) {
		next(error);
	}
};

//check following user blog posts
const getFollowingUserPosts = async (req, res, next) => {
	const currentUser = req.params.userId;
	const followingUser = req.query.userId;
	UserFollowers.find({ user: followingUser, follower: currentUser }, (err, result) => {
		if (err) {
			next(err);
		} else {
			if (result.length) {
				Post.find({ user_id: result.user }, (err, userPosts) => {
					if (err) {
						next(err);
					} else {
						res.send.json({
							data: userPosts
						});
					}
				});
			} else {
				res.send.json({
					message: "You do not follow this user. To see this user's posts, you need to follow him/her first"
				});
			}
		}
	});
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

//get all last weak and last month posts
const getRecentUserPosts = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const filter = req.params.filter;
		const currentDate = new Date();
		let query;
		if (filter === 'lastweak') {
			const before7Daysdate = new Date(currentDate.setDate(currentDate.getDate() - 7));
			query = dbSchemas.Post.find({ created_at: { $gte: before7Daysdate }, user_id: userId });
		} else if (filter === 'lastmonth') {
			const before1monthdate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
			query = dbSchemas.Post.find({ created_at: { $gte: before1monthdate }, user_id: userId });
		}

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

//get posts between given dates
const getPostsInBetweenDates = async (req, res, next) => {
	const userId = req.params.userId;
	const startDate = req.query.startDate;
	const endDate = req.query.endDate;
	const query = dbSchemas.Post.find({ created_at: { $gte: startDate, $lt: endDate }, user_id: userId });
	query.exec(function (err, userPosts) {
		if (err) return next(err);
		res.send.json({
			data: userPosts
		});
	});
};
// -----------------------Admin----------------------- //

//get other user posts (only for admin)
const getOtherUserPosts = async (req, res, next) => {
	const otherUserId = req.query.userId;
	Post.find({ user_id: otherUserId }, (err, userPosts) => {
		if (err) {
			next(err);
		} else {
			res.send.json({
				data: userPosts
			});
		}
	});
};

//get users based on their active status
const getActiveInactiveUsers = async (req, res, next) => {
	const userId = req.params.userId;
	const active = req.params.active; // listing active users
	if (active) {
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
	signup,
	login,
	logout,
	getUsers,
	getUser,
	updateUser,
	deleteUser,
	createPost,
	followUser,
	getAllFollowing,
	getAllFollowers,
	getUserPosts,
	getRecentUserPosts,
	getPostsInBetweenDates,
	getFollowingUserPosts,
	getOtherUserPosts,
	getActiveInactiveUsers,
	getRecentUsersCreated,
	getUsersInBetweenDates
};
