const adminRoutes = require('adminRoutes');
const userRoutes = require('userRoutes');
const router = require('./adminRoutes');

router.use('/admin', adminRoutes);
router.use('/user', userRoutes);

module.exports = router;
