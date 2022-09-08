const AccessControl = require('accesscontrol');
const ac = new AccessControl();

exports.roles = (function () {
	ac.grant('user').extend('user').createOwn('profile').readOwn('profile').updateOwn('profile').deleteOwn('profile').readAny('profile');

	ac.grant('admin').extend('user').createAny('profile').readAny('profile').updateAny('profile').deleteAny('profile');

	return ac;
})();
