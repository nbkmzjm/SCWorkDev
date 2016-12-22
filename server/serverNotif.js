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
	var relationship = req.body.relationship

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
				return [user.addGroup(group2.id, {status: relationship + ' REQUEST'}), group]
				

			}).spread(function(group2, group){
				console.log('group'+ JSON.stringify( group, null, 4))
				console.log('group2'+ JSON.stringify( group2, null, 4))
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
					status:'Owner'
				}
			}),
			db.userGroups.findOne({
				where:{
					groupId:groupSelectedId,
					status:'Owner'
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
					status:'Owner'
				}
		}).then(function(userGroup1){
			return [db.userGroups.findOne({
				where:{
					groupId:groupSelectedId,
					status:'Owner'
				}
			}), userGroup1]
		}).spread(function(userGroup2, userGroup1){
			console.log(userGroup1.status +' x:'+userGroup2.status)
			console.log(curUserId +' y:'+groupSelectedId)
			db.userGroups.findOne({
				where:{
					userId:curUserId, groupId:groupSelectedId	
				}
			}).then(function(userGroup){
				console.log(JSON.stringify(userGroup.status, null, 4))
				db.userGroups.update({
					status:userGroup.status.slice(0, -8)
				},{
					where:{ 
						$or:[
							{userId:curUserId, groupId:groupSelectedId},
							{userId:userGroup2.userId, groupId:userGroup1.groupId}
						]
					}
				})
			})
			

		})

	}


})

router.post('/getFeedSetting', middleware.requireAuthentication, function(req, res){
	var curUserId = req.user.id
	db.user.findOne({
		where:{
			id:curUserId
		}
	}).then(function(user){
		return user.getSettingUser({
			include:[{
				model:db.settingDescription
			}]
		})
	}).then(function(settings){
		console.log(JSON.stringify(settings, null, 4))
		res.json({settings:settings})
	})
})

router.post('/setFeedSetting', middleware.requireAuthentication, function(req, res){
	var curUserId = req.user.id
	var settingId = req.body.settingId
	var settingValue = req.body.settingValue
	var action = req.body.action
	if (action==='add'){

		db.feedSetting.create({
			description:'I can view post from',
			value:'friend',
			userId:curUserId,
		}).then(function(feedSetting){
			console.log(JSON.stringify(feedSetting, null, 4))
		}).catch(function(e) {
			console.log(e)
			res.render('error', {
				error: e.toString()
			})
		});
	}else if (action==='update'){
		db.feedSetting.update({
			value:settingValue
		}, {
			where:{
				id:settingId
			}
		}).then(function(feedSetting){
			console.log(JSON.stringify(feedSetting, null, 4))
		}).catch(function(e) {
			console.log(e)
			res.render('error', {
				error: e.toString()
			})
		});

	}
})



	
router.post('/getFeed', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	var loadNumber = req.body.loadNumber
	// console.log('lodingNumber: '+ loadNumber)
	db.feedSetting.findOne({
		where:{
			userId:curUserId,
			settingDescriptionId:1
		}
	}).then(function(feedSetting){
		// console.log(JSON.stringify(feedSetting, null, 4))
		if(feedSetting.value==='Private'){
			db.mainPost.findAll({
				include:[{
					model:db.user
				}],
				where:{
					$or:[{
						userId:curUserId
					},{	
						include:{
							$like:'%'+curUserId+'%'
						}
					}]
					
				}
			}).then(function(posts){
				// console.log(JSON.stringify(posts, null, 4))
				res.json({posts:posts})
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
				error: e.toString()
				})
			})


		}else if(feedSetting.value==='Cowoker'){

			db.group.findAll({
				include:[{
					model:db.user,
					where:{
						id:curUserId
					},
					through:{
						where:{
							status:{
								$in:['Cowoker','Owner']
							}
						}
					}
				}]
			}).then(function(groups){
				console.log('friend Group:'+JSON.stringify(groups, null, 4))
				var userIds = []
				groups.forEach(function(group, i){
					
					userIds.push(group.groupBLUserId)
				})
				
				return [db.mainPost.findAll({
				include:[{
					model:db.user
				}],
				where:{
					$or:[{
							userId:req.user.id
						},{
							userId:{
								$in:userIds
							},
							exclude:{
								$notLike:'%'+curUserId+'%'
							},
								
							postTo:{
								$notIn:['Private']
							}

						},{
							include:{
							$like:'%'+curUserId+'%'
							}
						}]
					
				},
				order:[
					['createdAt', 'DESC']
				],
				limit: 12,
				offset: loadNumber
				})]
			}).spread(function(posts){
				// console.log(JSON.stringify(posts, null, 4))
				res.json({posts:posts})
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
		}else if(feedSetting.value==='Colleague'){

			db.group.findAll({
				include:[{
					model:db.user,
					where:{
						id:curUserId
					},
					through:{
						where:{
							status:{
								$in:['Colleague','Owner']
							}
						}
					}
				}]
			}).then(function(groups){
				console.log('friend Group:'+JSON.stringify(groups, null, 4))
				var userIds = []
				groups.forEach(function(group, i){
					
					userIds.push(group.groupBLUserId)
				})
				
				return [db.mainPost.findAll({
				include:[{
					model:db.user
				}],
				where:{
					$or:[{
							userId:req.user.id
						},{
							userId:{
								$in:userIds
							},
							exclude:{
								$notLike:'%'+curUserId+'%'
							},
								
							postTo:{
								$notIn:['Private']
							}

						},{
							include:{
							$like:'%'+curUserId+'%'
							}
						}]
					
				},
				order:[
					['createdAt', 'DESC']
				],
				limit: 12,
				offset: loadNumber
				})]
			}).spread(function(posts){
				// console.log(JSON.stringify(posts, null, 4))
				res.json({posts:posts})
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
		}else if(feedSetting.value==='Friend of Colleague'){
			// console.log('fof:'+curUserId)
			db.user.findOne({
				where:{
					id:curUserId
				}

			}).then(function(user){
				db.group.findAll({
					include:[{
						model:db.user,
						where:{
							id:curUserId
						},
						through:{
							where:{
								status:{
									$in:['Colleague','Owner']
								}
							}
						}
					}]
					
				}).then(function(groups){
				// console.log(JSON.stringify(groups, null, 4))
					var groupIds = []
					var friendUserId = []
					groups.forEach(function(group, i){
						
						groupIds.push(group.id)
						friendUserId.push(group.groupBLUserId)
					})
					
		    
					// console.log('group: '+JSON.stringify(groupIds, null, 4))
					db.userGroups.findAll({
						where:{
							groupId:{
								$in:groupIds
							},
							status:{
								$in:['Colleague','Owner']
							}
						}
					}).then(function(userGroups){

						var userIds = []
						userGroups.forEach(function(userGroup, i){
							userIds.indexOf(userGroup.userId)===-1?
							userIds.push(userGroup.userId):""
						})
						// console.log('x: '+JSON.stringify(userIds, null, 4))
						// console.log('groupId:'+JSON.stringify(friendUserId, null, 4))
						db.mainPost.findAll({
							include:[{
								model:db.user
							}],
							where:{
								$or:[{
										userId:req.user.id
									},{
										postTo:{
											$in:['Colleague']
										},
										userId:{
											$in:friendUserId
										},
										exclude:{
											$notLike:'%'+curUserId+'%'
										}
									},{
										userId:{
											$in:userIds
										}
										,
										postTo:{
											$notIn:['Private', 'Colleague'],
										}
									},{
										include:{
										$like:'%'+curUserId+'%'
										}
									}]
								
							},
							order:[
								['createdAt', 'DESC']
							] 
						}).then(function(posts){
							// console.log(JSON.stringify(posts, null, 4))
							res.json({posts:posts})
						})
						
					})
				})
			})	
		}
	})
			
})	
		

router.post('/getUserPost', middleware.requireAuthentication, function(req, res) {

	var curUserId = req.user.id
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
		// console.log(JSON.stringify(user, null, 4))
		res.json({user:user})
	})

})

router.post('/post', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	var postText = req.body.postText
	var postTo = req.body.postTo
	var filter = req.body.filter
	var userArray = req.body.userArray
	var userArrayIn = ""
	var userArrayEx =""
	if (filter ==="Include"){
		userArrayIn= userArray
	}else{
		userArrayEx = userArray
	}
	
	console.log('userArray:'+JSON.stringify(userArray, null, 4))
	db.user.findOne({
		where:{
			id:curUserId
		}

	}).then(function(user){
		return [db.mainPost.create({
			postText:postText,
			postTo:postTo,
			userId:curUserId,
			include:userArrayIn,
			exclude:userArrayEx,
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

router.post('/getComment', middleware.requireAuthentication, function(req, res) {
	var mainPostId = req.body.mainPostId
	db.comment.findAll({
		where:{
			mainPostId:mainPostId
			// commentEmoj:''
			

		},
		include:[{
			model:db.user,
			attributes:['name','lastname']
		}]
	}).then(function(comments){
		// console.log(JSON.stringify(comments, null, 4))
		res.json({
			comments:comments
		})
	})

})

router.post('/getCommentCount', middleware.requireAuthentication, function(req, res) {
	var mainPostId = req.body.mainPostId
	var curUserId = req.user.id
	// console.log('mainPostId'+ mainPostId)
	db.comment.count({
		where:{
			mainPostId:mainPostId,
			comment: {
				$not:''
			}
		}
	}).then(function(commentCount){
		// console.log(JSON.stringify(commentCount, null, 4))
		return [db.comment.findAll({
			where:{
				mainPostId:mainPostId,
				commentEmoj: {
					$not:''
				}
			},
			attributes:['commentEmoj']
		}), commentCount]
	}).spread(function(commentEmojs, commentCount){
		// console.log('arrCommentEmojs'+JSON.stringify(commentEmojs.length, null, 4))
		if(commentEmojs.length > 0){
			var objCommentEmoj = {};
			commentEmojs.map(function(commentEmoj){
				
				if(objCommentEmoj[commentEmoj.commentEmoj]!= undefined){
					objCommentEmoj[commentEmoj.commentEmoj].push('x')
				}else{
					objCommentEmoj[commentEmoj.commentEmoj] = []
					objCommentEmoj[commentEmoj.commentEmoj].push('x')
				}

			})

			for(key in objCommentEmoj){
				objCommentEmoj[key] = objCommentEmoj[key].length
			}
		}
		// console.log('mainPostId'+ mainPostId)
		return [db.comment.findOne({
			where:{
				mainPostId:mainPostId,
				userId:curUserId,
				commentEmoj:{
					$not:''
				}
			}
			
		}), commentCount, objCommentEmoj]
		
		
		console.log('objCommentEmojs'+JSON.stringify(objCommentEmoj, null, 4))
	}).spread(function(selfEmoj,commentCount, objCommentEmoj){

		// console.log('selfEmoj: '+ JSON.stringify(selfEmoj, null, 4)+' id:'+ mainPostId)
		res.json({
			commentCount:commentCount,
			emojCount:objCommentEmoj,
			selfEmoj:selfEmoj
		})
	})

})

router.post('/replyPost', middleware.requireAuthentication, function(req, res) {
	var commentUser = req.user.id
	var comment = req.body.comment
	var mainPostId = req.body.mainPostId
	console.log(mainPostId+"--"+comment+'--'+commentUser)
	// console.log(typeOf dfsdf)
	db.comment.create({
		comment:comment,
		reaction:'',
		userId:commentUser,
		mainPostId:mainPostId
	}).then(function(comment){
		console.log(JSON.stringify(comment, null, 4))
		res.json({
			comment:comment
		})
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});

})

router.post('/addPostEmoj', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	var commentEmoj = req.body.commentEmoj
	var mainPostId = req.body.mainPostId
	console.log(mainPostId+"--"+commentEmoj+'--'+curUserId)
	db.comment.findOne({
		where:{
			mainPostId:mainPostId,
			userId:curUserId,
			commentEmoj:{
				$not:''
			}
		}
	}).then(function(comment){
		console.log("xxx"+JSON.stringify(comment, null, 4))
		if(!!comment){
			console.log('updating')
			db.comment.update({
				commentEmoj:commentEmoj
			},{
				where:{
					mainPostId:mainPostId,
					userId:curUserId,
					commentEmoj:{
						$not:''
					}
				}
			}).then(function(updated){
				res.json({
					updated:updated
				})
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
			
		}else{
			console.log('creating new')
			db.comment.create({
				mainPostId:mainPostId,
				userId:curUserId,
				commentEmoj:commentEmoj
			}).then(function(comment){
				res.json({
					comment:comment
				})
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
			
		}
		
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
	
 


router.get('/newAccountForm', function(req, res) {
	res.render('users/newAccountForm');
})





module.exports = router;