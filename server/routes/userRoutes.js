const userController = require('../controllers/userController');
const accessController = require('../middleware/accessControl');
const router = global.express.Router();
const multer = require('multer');
const uploadForm = multer({ dest: '../../public/files' });

//user logging in
router.post('/login', userController.login);
//user logging out
router.post('/user/logout', accessController.allowIfLoggedin, userController.logout);
//user uploading posts
router.post('/user/uploadFile', accessController.allowIfLoggedin, uploadForm.single('myFile'), userController.createPost);

//last weak user posts
router.get('/:userId/:lastweak', accessController.allowIfLoggedin, userController.getRecentUserPosts);

//last month user posts
router.get('/:userId/:lastmonth', accessController.allowIfLoggedin, userController.getRecentUserPosts);

//posts between two dates
router.get('/:userId/', accessController.allowIfLoggedin, userController.getPostsInBetweenDates);

//followers list
router.get('/:userId/followers', accessController.allowIfLoggedin, userController.getAllFollowers);

//following list
router.get('/:userId/following', accessController.allowIfLoggedin, userController.getAllFollowing);

//get other followe posts
router.get('/:userId/:followingId', accessController.allowIfLoggedin, accessController.grantAccess('readAny', 'profile'), userController.getFollowingUserPosts);

module.exports = router;
