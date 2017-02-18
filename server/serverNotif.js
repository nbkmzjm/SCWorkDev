var express = require('express');
var router = express.Router();
var db = require('../db.js');
var moment = require('moment');
var _ = require('underscore');
const webpush = require('web-push')

var middleware = require('../middleware.js')(db);

// const vapidKeys = webpush.generateVAPIDKeys();
// webpush.setGCMAPIKey("AIzaSyAVHtFMejQX7To7UwVqi4MWzWIfBP1qWAc");
// webpush.setVapidDetails(
//   'mailto:tkngo85@gmail.com',
//   vapidKeys.publicKey,
//   vapidKeys.privateKey
// );
// console.log('vapidKeys.publicKeyNOTI' + vapidKeys.publicKey)


router.get('/', middleware.requireAuthentication, function(req, res) {
	var curUser = req.user;
	var curUserTitle = req.user.title;

	db.user.findOne({
		where:curUser.id,
		include:[{
			model:db.department
		}]
	}).then(function(curUser){
		res.render('notif/notifHome', {
			JSONdata: JSON.stringify({
				notif: 'notif',
				curUser:curUser
				
			})
		})

	})
	

})


router.post('/groupList', middleware.requireAuthentication, function(req, res){
	db.group.findAll({
		include:[{
			model:db.user,
			//specify which model to include if there is more ONE
			as:'groupBLUser',
			attributes:['name'],
			include:[{
				model:db.department,
				attributes:['name']
			}]

		}]
	}).then(function(groupList){
		console.log(JSON.stringify(groupList, null, 4))
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
		console.log('acdpt')
		db.userGroups.findOne({
				where:{
					userId:curUserId,
					status:'Owner'
				}
		}).then(function(userGroup1){
			console.log('1st run')
			return [db.userGroups.findOne({
				where:{
					groupId:groupSelectedId,
					status:'Owner'
				}
			}), userGroup1]
		}).spread(function(userGroup2, userGroup1){
			// console.log(userGroup1.status +' x:'+userGroup2.status)
			console.log(JSON.stringify(userGroup1, null, 4))
			console.log('--------')
			console.log(JSON.stringify(userGroup2, null, 4))

			console.log(curUserId +' y:'+groupSelectedId)
			db.userGroups.findOne({
				where:{
					userId:curUserId, groupId:groupSelectedId	
				}
			}).then(function(userGroup){
				console.log(JSON.stringify(userGroup.status, null, 4))
				return db.userGroups.update({
					status:userGroup.status.slice(0, -8)
				},{
					where:{ 
						$or:[
							{userId:curUserId, groupId:groupSelectedId},
							{userId:userGroup2.userId, groupId:userGroup1.groupId}
						]
					}
				})
			}).then(function(updated){
				res.json({
					updated:updated
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
	var curUser = req.user

	var curUserId = req.user.id
	console.log('curUserId'+ curUserId)
	var loadNumber = req.body.loadNumber
	var viewOption = req.body.viewOption
	var viewOnly = req.body.viewOnly
	console.log('offset: '+ loadNumber)
	console.log('viewOnly: '+ viewOnly)

	// console.log('lodingNumber: '+ loadNumber)
	db.feedSetting.findOne({
		where:{
			userId:curUserId,
			settingDescriptionId:1
		}
	}).then(function(feedSetting){
		// console.log(JSON.stringify(feedSetting, null, 4))
		if(viewOption!== 'false'){
			feedSetting.value = viewOption
		}
		console.log(feedSetting.value)
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
				},
				order:[
					['createdAt', 'DESC']
				],
				limit: 12,
				offset: loadNumber
			}).then(function(posts){
				// console.log(JSON.stringify(posts, null, 4))
				res.json({posts:posts})
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
				error: e.toString()
				})
			})
		}else if(feedSetting.value==='WorkGroup'){
			var workGroupName
			db.userGroups.findAll({
					where:{
						userId:curUserId,
						status:{
							$like:'WorkGroup%'
						}
					}
			}).then(function(userGroups){
				console.log('userGroups:' + JSON.stringify(userGroups, null, 4))
				workGroupName = userGroups.map(function(userGroup){
					return userGroup.status
				})
				console.log('workGroupName:' + JSON.stringify(workGroupName, null, 4))
				return db.userGroups.findAll({
					where:{
						status:{
							$in:workGroupName
						}
					}
				})

			}).then(function(userGroups){
				// console.log('friend Group:'+JSON.stringify(userGroups, null, 4))
				var workGroupIds = []

				userGroups.forEach(function(userGroup, i){
					workGroupIds.indexOf(userGroup.userId)===-1?
					workGroupIds.push(userGroup.userId):""
				})
				console.log('workGroupIds: '+JSON.stringify(workGroupIds, null, 4))

				if(viewOnly==='true'){
					wherePara={
						userId:{
								$in:workGroupIds
							},
							exclude:{
								$notLike:'%'+curUserId+'%'
							},
							postTo:{
								$in:workGroupName
							}
					}
				}else{
					wherePara={
						$or:[{
							userId:req.user.id
						},{
							userId:{
								$in:workGroupIds
							},
							exclude:{
								$notLike:'%'+curUserId+'%'
							},
							postTo:{
								$in:workGroupName
							}

						},{
							include:{
							$like:'%'+curUserId+'%'
							}
						}]
						
					}

				}

				return [db.mainPost.findAll({
				include:[{
					model:db.user
				}],
				where:wherePara
				,
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
		}else if(feedSetting.value==='Coworker'){
			var workGroupName
			db.userGroups.findAll({
					where:{
						userId:curUserId,
						status:{
							$like:'WorkGroup%'
						}
					}
			}).then(function(userGroups){
				console.log('userGroups:' + JSON.stringify(userGroups, null, 4))
				workGroupName = userGroups.map(function(userGroup){
					return userGroup.status
				})
				console.log('workGroupName:' + JSON.stringify(workGroupName, null, 4))
				return db.userGroups.findAll({
					where:{
						status:{
							$in:workGroupName
						}
					}
				})

			}).then(function(userGroupWorkGroups){
				return [db.group.findAll({
					include:[{
						model:db.user,
						where:{
							id:curUserId
						},
						through:{
							where:{
								status:{
									$in:['Coworker']
								}	
							}
						}
					}]
				}), userGroupWorkGroups]

			}).spread(function(groups, userGroupWorkGroups){
				console.log('friend Group:'+JSON.stringify(groups, null, 4))
				var coworkerUserIds = []
				var workGroupIds = []



				groups.forEach(function(group, i){
					group.users[0].userGroups.status === 'Coworker'?
					coworkerUserIds.push(group.groupBLUserId):""
					
				})
				userGroupWorkGroups.forEach(function(userGroupWorkGroup, i){
					workGroupIds.indexOf(userGroupWorkGroup.userId)===-1?
					workGroupIds.push(userGroupWorkGroup.userId):""
					
				})
				console.log('coworkerUserIds: '+JSON.stringify(coworkerUserIds, null, 4))
				console.log('workGroupIds: '+JSON.stringify(workGroupIds, null, 4))
				if(viewOnly==='true'){
					console.log('yyyy')
					var wherePara ={
						userId:{
							$in:coworkerUserIds
						},
						exclude:{
							$notLike:'%'+curUserId+'%'
						},
						postTo:{
							$in:['Coworker']
						}
					}
				}else if(viewOnly==='false'){
					console.log('xxxx')
					var wherePara = {
						$or:[{
								userId:req.user.id
							},{
								userId:{
									$in:coworkerUserIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
								postTo:{
									$notIn:['Private']
								}

							},{
								userId:{
									$in:workGroupIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
								postTo:{
									$in:workGroupName
								}

							},{
								include:{
								$like:'%'+curUserId+'%'
								}
							}]
					}
				}

				return [db.mainPost.findAll({
				include:[{
					model:db.user
				}],
				where:wherePara,
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
			var workGroupName
			db.userGroups.findAll({
					where:{
						userId:curUserId,
						status:{
							$like:'WorkGroup%'
						}
					}
			}).then(function(userGroups){
				console.log('userGroups:' + JSON.stringify(userGroups, null, 4))
				workGroupName = userGroups.map(function(userGroup){
					return userGroup.status
				})
				console.log('workGroupName:' + JSON.stringify(workGroupName, null, 4))
				return db.userGroups.findAll({
					where:{
						status:{
							$in:workGroupName
						}
					}
				})

			}).then(function(userGroupWorkGroups){
				return [db.group.findAll({
					include:[{
						model:db.user,
						where:{
							id:curUserId
						},
						through:{
							where:{
								status:{
									$in:['Coworker','Colleague']
								}	
							}
						}
					}]
				}), userGroupWorkGroups]

			}).spread(function(groups, userGroupWorkGroups){
				console.log('friend Group:'+JSON.stringify(groups, null, 4))
				var coworkerUserIds = []
				var colleagueUserIds = []
				var workGroupIds = []

				userGroupWorkGroups.forEach(function(userGroupWorkGroup, i){
					workGroupIds.indexOf(userGroupWorkGroup.userId)===-1?
					workGroupIds.push(userGroupWorkGroup.userId):""
				})

				groups.forEach(function(group, i){
					if(group.users[0].userGroups.status === 'Colleague'){
					colleagueUserIds.push(group.groupBLUserId)
						
					}else if(group.users[0].userGroups.status === 'Coworker'){
						coworkerUserIds.push(group.groupBLUserId)
					}
					
				})

				console.log('colleagueUserIds: '+JSON.stringify(colleagueUserIds, null, 4))
				console.log('coworkerUserIds: '+JSON.stringify(coworkerUserIds, null, 4))
				console.log('workGroupIds: '+JSON.stringify(workGroupIds, null, 4))
				if(viewOnly==='true'){
					wherePara={
						userId:{
								$in:colleagueUserIds
							},
							exclude:{
								$notLike:'%'+curUserId+'%'
							},
								
							postTo:{
								$in:['Colleague', 'Coworker of Colleague']
							}
					}
				}else{
					wherePara={
						$or:[{
							userId:req.user.id
						},{
							userId:{
								$in:coworkerUserIds
							},
							exclude:{
								$notLike:'%'+curUserId+'%'
							},
							postTo:{
								$notIn:['Private']
							}

						},{
							userId:{
								$in:colleagueUserIds
							},
							exclude:{
								$notLike:'%'+curUserId+'%'
							},
								
							postTo:{
								$notIn:['Private','Coworker']
							}

						},{
							userId:{
								$in:workGroupIds
							},
							exclude:{
								$notLike:'%'+curUserId+'%'
							},
							postTo:{
								$in:workGroupName
							}

						},{
							include:{
							$like:'%'+curUserId+'%'
							}
						}]
						
					}

				}
				return [db.mainPost.findAll({
				include:[{
					model:db.user
				}],
				where:wherePara,
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
		
		}else if(feedSetting.value==='Coworker of Colleague'){
			var workGroupName
			db.userGroups.findAll({
					where:{
						userId:curUserId,
						status:{
							$like:'WorkGroup%'
						}
					}
			}).then(function(userGroups){
				console.log('userGroups:' + JSON.stringify(userGroups, null, 4))
				workGroupName = userGroups.map(function(userGroup){
					return userGroup.status
				})
				console.log('workGroupName:' + JSON.stringify(workGroupName, null, 4))
				return db.userGroups.findAll({
					where:{
						status:{
							$in:workGroupName
						}
					}
				})

			}).then(function(userGroupWorkGroups){

			return [db.group.findAll({
				include:[{
					model:db.user,
					where:{
						id:curUserId
					},
					through:{
						where:{
							status:{
								$in:['Coworker','Colleague']
							}
						}
					}
				}]
			}), userGroupWorkGroups]
			}).spread(function(groups, userGroupWorkGroups){

				console.log('friend Group:'+JSON.stringify(groups, null, 4))
				var colleagueUserIds = []
				var coworkerUserIds = []
				var coworkerofColleagueGroupIds = []
				var workGroupIds = []

				userGroupWorkGroups.forEach(function(userGroupWorkGroup, i){
					workGroupIds.indexOf(userGroupWorkGroup.userId)===-1?
					workGroupIds.push(userGroupWorkGroup.userId):""
				})
				
				groups.forEach(function(group, i){
					
					console.log(group.users[0].userGroups.status)
					if(group.users[0].userGroups.status === 'Colleague'){
						colleagueUserIds.push(group.groupBLUserId)
						coworkerofColleagueGroupIds.push(group.id)
							
					}else if(group.users[0].userGroups.status === 'Coworker'){
						coworkerUserIds.push(group.groupBLUserId)
					}
				})
				//Finding for Coworker of Colleague
				db.userGroups.findAll({
					where:{
						groupId:{
							$in:coworkerofColleagueGroupIds
						},
						userId:{
							$notIn:[curUserId]
						},
						status:{
							$in:['Coworker']
						}
					}
				}).then(function(userGroups){
					//adding userId of Coworker of Colleague to coworkerofColleagueUserIds Array
					var coworkerofColleagueUserIds = []
					userGroups.forEach(function(userGroup, i){
						//removing duplicate if exist
						coworkerofColleagueUserIds.indexOf(userGroup.userId)===-1?
						coworkerofColleagueUserIds.push(userGroup.userId):""
					})
					
					console.log('colleagueUserIds: '+JSON.stringify(colleagueUserIds, null, 4))
					console.log('workGroupIds: '+JSON.stringify(workGroupIds, null, 4))
					console.log('coworkerUserIds: '+JSON.stringify(coworkerUserIds, null, 4))
				
				

					console.log('coworkerofColleagueUserIds: '+JSON.stringify(coworkerofColleagueUserIds, null, 4))
					if(viewOnly==='true'){
						wherePara={
							userId:{
									$in:colleagueUserIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
									
								postTo:{
									$in:['Coworker of Colleague']
								}
						}
					}else{
						wherePara={
							$or:[{
								userId:req.user.id
							},{
								userId:{
									$in:colleagueUserIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
								postTo:{
									$notIn:['Private','Coworker']
								}
							},{
								userId:{
									$in:coworkerUserIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
																
								postTo:{
									$notIn:['Private']
								}
							},{
								userId:{
									$in:coworkerofColleagueUserIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
								postTo:{
									$in:['Coworker of Colleague']
								}

							},{
								userId:{
									$in:workGroupIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
								postTo:{
									$in:workGroupName
								}
							},{
								include:{
								$like:'%'+curUserId+'%'
								}
							}]
						}

					}
					db.mainPost.findAll({
					include:[{
						model:db.user
					}],
					where:wherePara,
					order:[
						['createdAt', 'DESC']
					],
					limit: 12,
					offset: loadNumber
					}).then(function(posts){
						res.json({posts:posts})
					})
				})
			
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
		}else if(feedSetting.value==='Public'){
			var workGroupName
			db.userGroups.findAll({
					where:{
						userId:curUserId,
						status:{
							$like:'WorkGroup%'
						}
					}
			}).then(function(userGroups){
				console.log('userGroups:' + JSON.stringify(userGroups, null, 4))
				workGroupName = userGroups.map(function(userGroup){
					return userGroup.status
				})
				console.log('workGroupName:' + JSON.stringify(workGroupName, null, 4))
				return db.userGroups.findAll({
					where:{
						status:{
							$in:workGroupName
						}
					}
				})

			}).then(function(userGroupWorkGroups){

			return [db.group.findAll({
				include:[{
					model:db.user,
					where:{
						id:curUserId
					},
					through:{
						where:{
							status:{
								$in:['Coworker','Colleague','Owner']
							}
						}
					}
				}]
			}), userGroupWorkGroups]
			}).spread(function(groups, userGroupWorkGroups){

				console.log('friend Group:'+JSON.stringify(groups, null, 4))
				var colleagueUserIds = []
				var coworkerUserIds = []
				var coworkerofColleagueGroupIds = []
				var workGroupIds = []

				userGroupWorkGroups.forEach(function(userGroupWorkGroup, i){
					workGroupIds.indexOf(userGroupWorkGroup.userId)===-1?
					workGroupIds.push(userGroupWorkGroup.userId):""
				})
				
				groups.forEach(function(group, i){
					
					console.log(group.users[0].userGroups.status)
					if(group.users[0].userGroups.status === 'Colleague'){
						colleagueUserIds.push(group.groupBLUserId)
						coworkerofColleagueGroupIds.push(group.id)
							
					}else if(group.users[0].userGroups.status === 'Coworker'){
						coworkerUserIds.push(group.groupBLUserId)
					}
				})
				//Finding for Coworker of Colleague
				db.userGroups.findAll({
					where:{
						groupId:{
							$in:coworkerofColleagueGroupIds
						},
						userId:{
							$notIn:[curUserId]
						},
						status:{
							$in:['Coworker']
						}
					}
				}).then(function(userGroups){
					//adding userId of Coworker of Colleague to coworkerofColleagueUserIds Array
					var coworkerofColleagueUserIds = []
					userGroups.forEach(function(userGroup, i){
						//removing duplicate if exist
						coworkerofColleagueUserIds.indexOf(userGroup.userId)===-1?
						coworkerofColleagueUserIds.push(userGroup.userId):""
					})
					
					console.log('colleagueUserIds: '+JSON.stringify(colleagueUserIds, null, 4))
					console.log('workGroupIds: '+JSON.stringify(workGroupIds, null, 4))
					console.log('coworkerUserIds: '+JSON.stringify(coworkerUserIds, null, 4))
					console.log('coworkerofColleagueUserIds: '+JSON.stringify(coworkerofColleagueUserIds, null, 4))

					if(viewOnly==='true'){
						wherePara={
							postTo:{
								$in:['Public']
							},
							exclude:{
								$notLike:'%'+curUserId+'%'
							}
						}
					}else{
						wherePara={
							$or:[{
								userId:req.user.id
							},{
								userId:{
									$in:colleagueUserIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
								postTo:{
									$notIn:['Private','Coworker']
								}

							},{
								userId:{
									$in:coworkerUserIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
								
									
								postTo:{
									$notIn:['Private']
								}

							},{
								userId:{
									$in:coworkerofColleagueUserIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
								postTo:{
									$in:['Coworker of Colleague']
								}

							},{
								userId:{
									$in:workGroupIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
								postTo:{
									$in:workGroupName
								}

							},{
								postTo:{
									$in:['Public']
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								}
							},{
								include:{
								$like:'%'+curUserId+'%'
								}
							}]
						}


					}
					db.mainPost.findAll({
					include:[{
						model:db.user
					}],
					where:wherePara,
					order:[
						['createdAt', 'DESC']
					],
					limit: 12,
					offset: loadNumber
					}).then(function(posts){
						res.json({posts:posts})
					})
				})
			
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
			
		}else if(feedSetting.value==='Public'){
			db.group.findAll({
				include:[{
					model:db.user,
					where:{
						id:curUserId
					},
					through:{
						where:{
							status:{
								$in:['Coworker','Colleague','Owner']
							}
						}
					}
				}]
			}).then(function(groups){
				console.log('friend Group:'+JSON.stringify(groups, null, 4))
				var colleagueUserIds = []
				var coworkerUserIds = []
				var coworkerofColleagueGroupIds = []
				
				groups.forEach(function(group, i){
					
					console.log(group.users[0].userGroups.status)
					if(group.users[0].userGroups.status === 'Colleague'){
						colleagueUserIds.push(group.groupBLUserId)
						coworkerofColleagueGroupIds.push(group.id)
							
					}else if(group.users[0].userGroups.status === 'Coworker'){
						coworkerUserIds.push(group.groupBLUserId)
					}
				})

				db.userGroups.findAll({
					where:{
						groupId:{
							$in:coworkerofColleagueGroupIds
						},
						userId:{
							$notIn:[curUserId]
						},
						status:{
							$in:['Coworker']
						}
					}
				}).then(function(userGroups){

					var coworkerofColleagueUserIds = []
					userGroups.forEach(function(userGroup, i){
						coworkerofColleagueUserIds.indexOf(userGroup.userId)===-1?
						coworkerofColleagueUserIds.push(userGroup.userId):""
					})
					
					console.log('colleagueUserIds: '+JSON.stringify(colleagueUserIds, null, 4))
					console.log('coworkerUserIds: '+JSON.stringify(coworkerUserIds, null, 4))
				
				

					console.log('coworkerofColleagueUserIds: '+JSON.stringify(coworkerofColleagueUserIds, null, 4))
					db.mainPost.findAll({
					include:[{
						model:db.user
					}],
					where:{
						$or:[{
								userId:req.user.id
							},{
								userId:{
									$in:colleagueUserIds
								},
								postTo:{
									$notIn:['Private','Coworker']
								}

							},{
								userId:{
									$in:coworkerUserIds
								},
								exclude:{
									$notLike:'%'+curUserId+'%'
								},
								
									
								postTo:{
									$notIn:['Private']
								}

							},{
								userId:{
									$in:coworkerofColleagueUserIds
								}
								,
								postTo:{
									$in:['Coworker of Colleague']
								}

							},{
								postTo:{
									$in:['Public']
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
					}).then(function(posts){
						res.json({posts:posts})
					})
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
function UserFeed(mainPostId, receivedUserId){
	this.mainPostId = mainPostId
	this.receivedUserId = receivedUserId
	this.status = 'active',
	this.notification = 'new'
}

function showNotification(idArray, post){
	
		db.endpoint.findAll({
			where:{
				userId:{
					$in:idArray
				}
			}
		}).then(function(endpoints){
			console.log('endpoints'+ JSON.stringify(endpoints, null, 4))
			endpoints.forEach(function(endpoint){
				var pushSubscription = JSON.parse(endpoint.endpoint)
				// var person = {
				// 	name:'thien',
				// 	age:'20'
				// }
				const payload = JSON.stringify(post.postText)
				// const options = {
			 //      TTL: 240 * 60 * 60,
			 //      vapidDetails: {
			 //        subject: 'mailto:sender@example.com',
			 //        publicKey: vapidKeys.publicKey,
			 //        privateKey: vapidKeys.privateKey
			 //      }
			 //    }
				
				console.log('pushSubscription:'+ pushSubscription)
					
				webpush.sendNotification(pushSubscription, payload).then(function(statusSent){
					console.log('statusSent'+ JSON.stringify(statusSent, null, 4))
				}).catch(function(statusCode){
					console.log('statusCode'+ JSON.stringify(statusCode, null, 4))
					db.endpoint.destroy({
						where:{
							endpoint: endpoint.endpoint
						}
					})
					console.log('pushSubscription'+JSON.stringify(pushSubscription, null, 4))
				});
			})
		}).catch(function(e) {
			console.log(e)
		});	
	

}

router.post('/post', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	var postText = req.body.postText
	var postTo = req.body.postTo
	var filter = req.body.filter
	var userArray = req.body.userArray
	var userArrayIn = ""
	var userArrayEx =""

	
	if (filter ==="Include"||filter ==='Include Department'){
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
		var postTo = post.postTo

		if(postTo.indexOf('WORKGROUP') !== -1){
			console.log('WorkGroup...')
			var workGroupIds = []
			db.userGroups.findAll({
					where:{
						status:post.postTo
					}
			}).then(function(userGroups){
				// console.log('friend Group:'+JSON.stringify(userGroups, null, 4))
				
				var bulkData = []

				userGroups.forEach(function(userGroup, i){
					if (workGroupIds.indexOf(userGroup.userId)===-1){
						workGroupIds.push(userGroup.userId)
						var userFeed = new UserFeed(post.id, userGroup.userId)
						bulkData.push(userFeed)
					}
				})
				console.log('bulkData: '+JSON.stringify(bulkData, null, 4))
				return db.userFeed.bulkCreate(bulkData)
			}).then(function(created){
			
				showNotification(workGroupIds, post)
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});

		}
		

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

router.post('/getDept', middleware.requireAuthentication, function(req, res) {
	
	db.department.findAll({ 
		include: [{
			model:db.user,
			attributes:['id','name', 'lastname']
		}] 
	}).then(function(depts) {

		depts.forEach(function(dept){
			var userIds = dept.users.map(function(user){
				return user.id
			})
			
			dept.status = userIds
		})
 	 	
 	 	
 	 	console.log(JSON.stringify(depts, null, 4))
		res.json({department:depts})
	})

})

router.post('/getMyWorkGroup', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	db.userGroups.findAll({ 
		where:{
			userId:curUserId,
			status: {
				$like:'WorkGroup%'
			}
		}
		
	}).then(function(userGroups) {

 	 	
 	 	console.log(JSON.stringify(userGroups, null, 4))
		res.json({userGroups:userGroups})
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