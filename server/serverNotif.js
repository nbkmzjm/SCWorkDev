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
			console.log(JSON.stringify(groups, null, 4))
			res.json({groupList:groups})
		})
	})
			


})

router.post('/editGroup', middleware.requireAuthentication, function(req, res){
	var curUserId = req.user.id
	var action = req.body.action
	var groupSelectedId = req.body.groupSelectedId

	if(action==="add")
		db.user.findOne({
			where:{
				id:curUserId
			}
		}).then(function(user){

			user.addGroup(groupSelectedId).then(function(usergroup){
				return db.group.findOne({
					where:{
						id:groupSelectedId
					}
				})
			}).then(function(group){
				res.json({group:group})
			})
		})
	else if(action==="delete"){
		db.userGroups.destroy({
			where:{
				groupId:groupSelectedId,
				userId:curUserId
			}
		}).then(function(deleted){
			console.log(JSON.stringify(deleted, null, 4))
			res.json({deleted:deleted})
		})
	}


})


router.post('/getFeed', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	db.user.findOne({
		where:{
			id:curUserId
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
					include:[{
						model:db.user
					}],
					where:{
						$or:[{
								userId:req.user.id
							},{
								userId:{
									$in:userIds
								}

							}]
						
					},
					order:[
						['createdAt', 'DESC']
					] 
				}).then(function(posts){
					console.log(JSON.stringify(posts, null, 4))
					res.json({posts:posts})
				})
				
			})
		})
		
		
	})

router.post('/getUserPost', middleware.requireAuthentication, function(req, res) {
	db.user.findOne({
		where:{
			id:curUserId
		},
		include:[{
			model:db.mainPost
		}],
		order:[
			[db.mainPost, 'createdAt', 'DESC']
		] 
	}).then(function(user){
		console.log(JSON.stringify(user, null, 4))
		res.json({user:user})
	})

})

router.post('/post', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	var postText = req.body.postText
	db.user.findOne({
		where:{
			id:curUserId
		}

	}).then(function(user){
		return [db.mainPost.create({
			postText:postText,
			userId:curUserId
		}), user]

	}).spread(function(post, user){
		console.log('post:'+JSON.stringify(post, null, 4))
		// console.log(JSON.stringify(user, null, 4))
		res.json({
			post:post,
			user:user
			
		})


	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});

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