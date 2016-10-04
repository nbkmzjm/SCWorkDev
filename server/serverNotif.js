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
	

})


router.post('/groupList', middleware.requireAuthentication, function(req, res){
	db.group.findAll().then(function(groupList){
		res.json({groupList:groupList})
	})


})

router.get('/userGetGroups', middleware.requireAuthentication, function(req, res){
	var curUserId = req.user.id
	db.user.findOne({
		where:{
			id:curUserId
		}
	}).then(function(user){
		user.getGroups().then(function(groups){
			res.json({groupList:groups})
		})
	})
			


})

router.post('/editGroup', middleware.requireAuthentication, function(req, res){
	var curUserId = req.user.id
	var action = req.body.action
	var groupdSelected = req.body.groupdSelected
	db.user.findOne({
		where:{
			id:curUserId
		}
	}).then(function(user){

		user.addGroup(curUserId).then(function(group){
			console.log(JSON.stringify(group, null, 4))
			res.json({group:group})
		})
	})


})


router.post('/test', middleware.requireAuthentication, function(req, res) {
	var curUser = 2
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