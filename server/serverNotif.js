var express = require('express');
var router = express.Router();
var db = require('../db.js');
var moment = require('moment');
var _ = require('underscore');

var middleware = require('../middleware.js')(db);


router.get('/', middleware.requireAuthentication, function(req, res) {
	var curUserTitle = req.user.title;
	res.render('notif/notifHome', {
			JSONdata: {
				notif: 'notif'
			}
			
		})
	// var arrayTitle_UserTab = ['admin', 'manager']
	// if (arrayTitle_UserTab.indexOf(curUserTitle) !== -1) {
		
	// } else {
	// 	res.render('index')
	// }

})



router.post('/test', middleware.requireAuthentication, function(req, res) {
	// db.user.findOne({
	// 	where:{
	// 		id:1
	// 	}

	// }).then(function(user){
	// 	console.log('xxx:')
	// 	group.addUser([1,2]).then(function(groups){
	// 		console.log(JSON.stringify(groups, null, 4))
	// 	})
	// 	// console.log(JSON.stringify(user, null, 4))
	// 	res.json({user:user})
	// })

db.group.findOne({
		where:{
			id:1
		}

	}).then(function(group){
		console.log('xxx:')
		group.setUsers(3).then(function(users){
			console.log(JSON.stringify(users, null, 4))
		})
		// console.log(JSON.stringify(user, null, 4))
		res.json({user:user})
	})



	
})


router.get('/newAccountForm', function(req, res) {
	res.render('users/newAccountForm');
})





module.exports = router;