const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const accessController = require('../middleware/accessControl');

//admin creating user
router.post('/create', accessController.grantAccess('createAny', 'profile'), adminController.create);
//updating user password
router.post('/user/:userId/:passowrd', accessController.grantAccess('updateAny', 'profile'), adminController.passwordUpdate);
// getting user by id via admin
router.get('/user/:userId', accessController.allowIfLoggedin, adminController.getUser);
//getting all users
router.get('/user/users', accessController.grantAccess('readAny', 'profile'), adminController.getUsers);
//get all posts of a user
router.get('user/:userId/posts', accessController.grantAccess('readAny', 'profile', adminController.getUserPosts));
//updating user via admin
router.put('/user/:userId', accessController.allowIfLoggedin, accessController.grantAccess('updateAny', 'profile'), adminController.updateUser);
// deleteing user via admin
router.delete('/user/:userId', accessController.allowIfLoggedin, accessController.grantAccess('deleteAny', 'profile'), adminController.deleteUser);
//get active/inactive users
router.get('/user/:active', accessController.allowIfLoggedin, accessController.grantAccess('readAny', 'profile'), adminController.getActiveInactiveUsers);
//get recent last weak/month created users
router.get('/user/:filter', accessController.allowIfLoggedin, accessController.grantAccess('readAny', 'profile'), adminController.getRecentUsersCreated);
//get users created in given time period
router.get('/user/pastUsers', accessController.allowIfLoggedin, accessController.grantAccess('readAny', 'profile'), adminController.getUsersInBetweenDates);

module.exports = router;
