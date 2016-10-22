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
	db.group.findAll({

	}).then(function(groupList){
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

			user.addGroup(groupSelectedId, {status:'PENDING'}).then(function(usergroup){



				return db.group.findOne({
					where:{
						id:groupSelectedId
					}
					// include:[{
					// 	model:db.user, as:'groupBLUser'
					// }],
				})
			}).then(function(group){
				return [db.user.findOne({
					where:{
						id:group.groupBLUserId
					}
				}),group]
				
			}).spread(function(user, group){
				console.log('user'+ JSON.stringify(user, null, 4))
				console.log('curuser'+ JSON.stringify(user, null, 4))
				return [db.group.findOne({
					where:{
						groupBLUserId:curUserId
					}
				}), user, group]
			}).spread(function(group2, user, group){
				console.log('user1'+JSON.stringify( user, null, 4))
				console.log('group1'+ JSON.stringify(group, null, 4))
				return [user.addGroup(group2.id, {status:'REQUEST'}).then(function(usergroup){

				}), group]
				

			}).spread(function(group2, group){
				res.json({group:group})
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
		})
	else if(action==="delete"){
		db.userGroups.destroy({
			where:{
				groupId:groupSelectedId,
				userId:curUserId
			}
		}).then(function(deleted){

			return [db.userGroups.findOne({
				where:{
					userId:curUserId,
					status:'OWNER'
				}
			}),
			db.userGroups.findOne({
				where:{
					groupId:groupSelectedId,
					status:'OWNER'
				}
			})
			]

			
		}).spread(function(userGroup1, userGroup2){
			console.log(userGroup1.groupId+':'+userGroup2.userId)
			return db.userGroups.destroy({
				where:{
					groupId:userGroup1.groupId,
					userId:userGroup2.userId
				}
			})
		}).then(function(deleted){
			res.json({deleted:deleted})
		})
	}else if(action==='accept'){
		db.userGroups.findOne({
				where:{
					userId:curUserId,
					status:'OWNER'
				}
		}).then(function(userGroup1){
			return [db.userGroups.findOne({
				where:{
					groupId:groupSelectedId,
					status:'OWNER'
				}
			}), userGroup1]
		}).spread(function(userGroup2, userGroup1){
			console.log(userGroup1.groupId+' x:'+userGroup2.userId)
			db.userGroups.update({
				status:'ACTIVE'
			},{
				where:{ 
					$or:[
						{userId:curUserId, groupId:groupSelectedId},
						{userId:userGroup2.userId, groupId:userGroup1.groupId}
					]
				}
			})

		})

	}


})


// router.post('/getFeed', middleware.requireAuthentication, function(req, res) {
// 	var curUserId = req.user.id
// 	db.user.findOne({
// 		where:{
// 			id:curUserId
// 		}

// 	}).then(function(user){
// 		console.log('xxx:'+ user.name)
// 		// user.getGroups({
// 		// 	where:{
// 		// 		userGroups.status:'OWNER'
// 		// 	}
// 		db.group.findAll({
// 			include:[{
// 				model:db.user,
// 				where:{
// 					id:curUserId
// 				},
// 				through:{
// 					where:{
// 						status:{
// 							$in:['ACTIVE','OWNER']
// 						}
// 					}
// 				}
// 			}]
			
// 		}).then(function(groups){
// 		console.log(JSON.stringify(groups, null, 4))
// 			var groupIds = []
// 			groups.forEach(function(group, i){
				
// 				groupIds.push(group.id)
// 			})
			
    
// 			console.log('x: '+JSON.stringify(groupIds, null, 4))
// 			db.userGroups.findAll({
// 				where:{
// 					groupId:{
// 						$in:groupIds
// 					},
// 					status:'OWNER'
// 				}
// 			}).then(function(userGroups){

// 				var userIds = []
// 				userGroups.forEach(function(userGroup, i){
// 					userIds.indexOf(userGroup.userId)===-1?
// 					userIds.push(userGroup.userId):""
// 				})
// 				console.log('x: '+JSON.stringify(userIds, null, 4))
// 				db.mainPost.findAll({
// 					include:[{
// 						model:db.user
// 					}],
// 					where:{
// 						$or:[{
// 								// userId:req.user.id
// 							},{
// 								userId:{
// 									$in:userIds
// 								}

// 							}]
						
// 					},
// 					order:[
// 						['createdAt', 'DESC']
// 					] 
// 				}).then(function(posts){
// 					console.log(JSON.stringify(posts, null, 4))
// 					res.json({posts:posts})
// 				})
				
// 			})
// 		})
		
		
// 	})
router.post('/getFeed', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	
	db.group.findAll({
		include:[{
			model:db.user,
			where:{
				id:curUserId
			},
			through:{
				where:{
					status:{
						$in:['ACTIVE','OWNER']
					}
				}
			}
		}]
		
	}).then(function(groups){
	console.log(JSON.stringify(groups, null, 4))
		var userIds = []
		groups.forEach(function(group, i){
			
			userIds.push(group.groupBLUserId)
		})
		
		return db.mainPost.findAll({
			include:[{
				model:db.user
			}],
			where:{
				$or:[{
						// userId:req.user.id
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
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});
			
		
		
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