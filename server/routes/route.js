const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const accessController = require('../middleware/accessControl');
const multer = require('multer');
const upload = multer({ dest: '../../public/files' });

//user creating itself
router.post('/signup', userController.signup);
//user logging in
router.post('/login', userController.login);
//user logging out
router.post('user/logout', accessController.allowIfLoggedin, userController.logout);
//user uploading posts
router.post('/api/uploadFile', upload.single('myFile'));
// getting user by id either via admin or any of its followers
router.get('/user/:userId', accessController.allowIfLoggedin, userController.getUser);
//getting all users
router.get('/users', accessController.grantAccess('readAny', 'profile'), userController.getUsers);
//updating user either via admin or itself
router.put('/user/:userId', accessController.allowIfLoggedin, accessController.grantAccess('updateAny', 'profile'), userController.updateUser);
// deeteing user either via admin or itself
router.delete('/user/:userId', accessController.allowIfLoggedin, accessController.grantAccess('deleteAny', 'profile'), userController.deleteUser);

module.exports = router;
