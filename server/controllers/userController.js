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

//create a post
const createPost = async (req, res, next) => {
	try {
		const userId = req.user.userId;
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
	const followingUser = req.params.followingId;
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

//get all last weak and last month posts by a user
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

//get posts between given dates by a user
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

module.exports = {
	signup,
	login,
	logout,
	createPost,
	followUser,
	getAllFollowing,
	getAllFollowers,
	getRecentUserPosts,
	getPostsInBetweenDates,
	getFollowingUserPosts
};
