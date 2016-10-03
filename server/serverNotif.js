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
		
	// } else {fl
	// 	res.render('index')
	// }

})



router.post('/test', middleware.requireAuthentication, function(req, res) {
	var curUser = 1
	db.user.findOne({
		where:{
			id:curUser
		}

	}).then(function(user){
		console.log('xxx:'+ user.name)
		user.getGroups().then(function(groups){
		console.log(JSON.stringify(groups, null, 4))
			var groupIds = []
			groups.forEach(function(group, i){
				
				groupIds.push(group.id)
			})
			
    
			console.log('x: '+JSON.stringify(groupIds, null, 4))
			db.userGroups.findAll({
				where:{
					groupId:{
						$in:groupIds
					}
				}
			}).then(function(userGroups){

				var userIds = []
				userGroups.forEach(function(userGroup, i){
					userIds.indexOf(userGroup.userId)===-1?
					userIds.push(userGroup.userId):""
				})
				console.log('x: '+JSON.stringify(userIds, null, 4))
				db.mainPost.findAll({
					where:{
						$or:[{
								userId:curUser
							},{
								userId:{
									$in:userIds
								}

							}]
						
					}
				}).then(function(posts){
					console.log(JSON.stringify(posts, null, 4))
					res.json({posts:posts})
				})
				
			})
		})
		
		
	})

// db.group.findOne({
// 		where:{
// 			id:1
// 		}

// 	}).then(function(group){
// 		console.log('xxx:')
// 		group.addUsers(3).then(function(users){
// 			console.log(JSON.stringify(users, null, 4))
// 			res.json({users:users})
// 		})
// 		// console.log(JSON.stringify(user, null, 4))
		
// 	})
	
})


router.get('/newAccountForm', function(req, res) {
	res.render('users/newAccountForm');
})





module.exports = router;