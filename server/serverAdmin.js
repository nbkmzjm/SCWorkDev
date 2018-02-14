var express = require('express');
var router = express.Router();
var db = require('../db.js');
var moment = require('moment');
var _ = require('underscore');

var middleware = require('../middleware.js')(db);

function test(req, res){
	res.send('heyx;xhey')
}
router.get('/', middleware.requireAuthentication, function(req, res) {
	var curUser = req.user;

	if(curUser.role === 'Administrator'){
		db.user.findOne({
		where:curUser.id,
		include:[{
			model:db.department
		}]
		}).then(function(curUser){
			res.render('admin/adminHome', {
				JSONdata: JSON.stringify({
					
				})
			})

		})

	}else{

		res.render('admin/adminUse')
	}
	
	
	// var arrayTitle_UserTab = ['admin', 'manager']
	// if (arrayTitle_UserTab.indexOf(curUserTitle) !== -1) {
		
	// } else {
	// 	res.render('index')
	// }

})


module.exports = router;