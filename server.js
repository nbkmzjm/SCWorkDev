var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
// var io = require('socket.io')(http);
var expValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var debug = require('debug')('http')
const webpush = require('web-push')
var moment = require('moment');
var now = moment();
var bodyParser = require('body-parser');

var bcrypt = require('bcryptjs');
var _ = require('underscore');
var LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')
// const urlsafeBase64 = require('urlsafe-base64')
var Umzug = require('umzug')

const vapidKeys = webpush.generateVAPIDKeys();
webpush.setGCMAPIKey("AIzaSyAVHtFMejQX7To7UwVqi4MWzWIfBP1qWAc");
webpush.setVapidDetails(
  'mailto:tkngo85@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
console.log('vapidKeys.publicKey' + vapidKeys.publicKey)
// const decodedVapidPublicKey = urlsafeBase64.decode(vapidKeys.publicKey)
// console.log(decodedVapidPublicKey)



var db = require('./db.js');

var middleware = require('./middleware.js')(db);

app.use(cookieParser());
// app.use(middleware.logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
// app.engine('html', require('ejs').renderFile);
app.set('view engine', 'jade');
app.set('views', path.join(__dirname + '/public', 'views'));
app.set("view options", {
	layout: true
});

app.locals.pretty = true;
app.use(express.static(__dirname));
app.use('/users', express.static(__dirname));
app.use(expValidator());



var umzug = new Umzug({
	storage: 'sequelize',

	storageOptions: {
		sequelize: db.sequelize,
		tableName: '_migrations'
	},
	upName: 'up',
	downName: 'down',

	migrations: {
		// The params that gets passed to the migrations.
		// Might be an array or a synchronous function which returns an array.
		params: [db.sequelize.getQueryInterface(), db.sequelize.constructor],
		path: './migrations',
		pattern: /^\d+[\w-]+\.js$/
	}
});




// io.on('connection', function(socket) {
// 	console.log('user connect to socket io');

// 	socket.emit('message', {
// 		text: 'welcomex to schedule app',
// 		Note: 'first'
// 	});

// 	socket.emit('test', {
// 		text1: 'testtext',
// 		Note: 'testNote'
// 	});


// });

app.get('/message', function(req, res){
	res.render('message/mesdepasageHome')
	
})

app.post('/showNoti', function(req, res){
	var text = req.body.text

	db.endpoint.findAll().then(function(endpoints){
		endpoints.forEach(function(endpoint){
			var pushSubscription = JSON.parse(endpoint.endpoint)
			// var person = {
			// 	name:'thien',
			// 	age:'20'
			// }
			const payload = JSON.stringify(text)
			const options = {
		      TTL: 240 * 60 * 60,
		      vapidDetails: {
		        subject: 'mailto:sender@example.com',
		        publicKey: vapidKeys.publicKey,
		        privateKey: vapidKeys.privateKey
		      }
		    }
			
			console.log('pushSubscription:'+ pushSubscription)
				
			webpush.sendNotification(pushSubscription, payload, options).then(function(statusSent){
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
		
		
		res.json({
			endpoint: 'pushed OK'
		})
	})	

})

app.get('/test', test)

function test(req, res){




	res.render('test',{
			JSONdata: JSON.stringify({
				vapidPub:vapidKeys.publicKey
			})
		})

	
	// var i = 0
	// setInterval(function(){
	// 	i = i+1
		
	// }, 5000)

	// db.group.findAll({
	// 	include:[{
	// 			model:db.user,
	// 			//specify which model to include if there is more ONE
	// 			as:'groupBLUser',
	// 			// attributes:['name'],
	// 			include:[{
	// 				model:db.department
	// 				// attributes:['name']
	// 			}]

	// 		}]
	// }).then(function(groupList){
	// 	console.log(JSON.stringify(groupList, null, 4))
	// 	res.json({groupList:groupList})
	// })
}


app.get('/', middleware.requireAuthentication, function(req, res, next) {
	
	db.assign.findAll({
		include: [db.user]
	}).then(function(assigns) {
		// next();
		return [assigns, db.user.findAll()];
	}).spread(function(assigns, users) {
		// console.log('suerssssssssss' + JSON.stringify(users));
		// console.log('ggggggggggggg' + JSON.stringify(assigns));
		// console.log('yyyyyyyyyy' + JSON.stringify(dateHeader));
		res.render('index', {
			JSONdata: JSON.stringify({
				vapidPub:vapidKeys.publicKey
			// users: users,
			// assigns: assigns,
			// dateHeader: dateHeader
			})
			
		});
	}).catch(function(e) {
		res.render('error', {
			error: "eeeeee" + e.toString()
		});
	});
});


app.get('/sysObjRead', middleware.requireAuthentication, function(req, res){
	var varList = req.body.pData
	
	console.log(JSON.stringify(req.params, null, 4))
	db.sysObj.findAll({
		
	}).then(function(sysObjs){
		var sysObjList = {}
		sysObjs.forEach(function(sysObj,i){
		sysObjList[sysObj.name] = sysObj.value
		})
		res.json(sysObjList)
	});
})

app.post('/endpoint', middleware.requireAuthentication, function(req, res){
	var endpoint = req.body.endpoint
	var curUser= req.user;
	
	console.log('endpoint post:'+JSON.stringify(endpoint, null, 4))
	db.endpoint.findOrCreate({
		where:{
			endpoint:endpoint,
			userId:curUser.id
		}
		
	}).then(function(endpoint){
		console.log('endpoint:'+ endpoint)
		res.json(endpoint)
	});
})


app.post('/sysObjUpdate', middleware.requireAuthentication, function(req, res){
	var name = req.body.pData.name
	var value = req.body.pData.value
	// console.log(name+'--'+value)
	db.sysObj.upsert({
			name: name,
			value: value
	}).then(function(created){
		// console.log(created)
		if (created === undefined){
			console.log(value)
			res.json({lockoutDate:value})
		}
	}).catch(function(e){
		console.log(e)
	});
})

app.get('/taskSC', middleware.requireAuthentication, function(req, res){
	var curUser= req.user;
	var datePosRange = [];
	
	var sDate = moment(new Date(req.query.sDate)).format('MM-DD-YYYY')
	var eDate = moment(new Date(req.query.sDate)).add(7,'days').format('MM-DD-YYYY')
	var datePos={
			$between:[sDate,eDate]
		}
	console.log('::::::::::::::::::::::::')
	console.log(sDate+':'+eDate + req.body.i)
	console.log(JSON.stringify(sDate.slice(-1), null, 4))
	console.log(JSON.stringify(eDate.slice(-1), null, 4))
	if (sDate.slice(-1)!=eDate.slice(-1)){
		for(var i = 0; i<7;i++){
			datePosRange.push(moment(new Date(sDate)).add(i,'days').format('MM-DD-YYYY'))
		}
		datePos = {$in:datePosRange}
	}
	db.assign.findAll({
		attributes:['id', 'datePos', 'Memo', 'userId', 'Note'],
		include:[{
			model:db.assignTracer,
			include:[{
				model:db.user
			}]
			
		}],
		where:{
			datePos
		},
		order:[
				[db.assignTracer,'createdAt', 'DESC']
			]
	}).then(function(assign){
		
		// console.log(JSON.stringify(assign, null, 4))
		res.json({
			assign,
			 curUser
		})
	})
})

app.get('/scOverview', middleware.requireAuthentication, function(req, res){
	

	console.log('pulick key:'+ vapidKeys.publicKey)
	var curUser= req.user;
	var sDate = req.query.sDate
	var eDate = req.query.eDate
	var userId = req.query.userId
	var datePosRange = [];
	var vapidPublicKey = vapidKeys.publicKey
	console.log(userId)

	var datePos={
		$between:[sDate,eDate]
	}
	console.log('pushing endpoint: '+ endpoint)
	
	console.log(sDate +':'+ eDate)
	if (sDate.slice(-1)!=eDate.slice(-1)){
		for(var i = 0; i<49;i++){
			datePosRange.push(moment(new Date(sDate)).add(i,'days').format('MM-DD-YYYY'))
		}
		datePos = {$in:datePosRange}
	}
	
	db.assign.findAll({
		attributes:['id', 'datePos', 'Memo', 'userId', 'Note'],
		include:[{
			model:db.assignTracer,
			include:[{
				model:db.user
			}]
			
		}],
		where:{
			datePos,
			userId:userId

		},
		order:[
				[db.assignTracer,'createdAt', 'DESC']
			]
	}).then(function(assign){
		
		// console.log(JSON.stringify(assign, null, 4))
		res.json({
			assign,
			curUser,
			vapidPublicKey
		})
	})
})


app.post('/assignTracerReadUpd', middleware.requireAuthentication, function(req, res) {
	var assignTracerId = req.body.assignTracerId;
	var curUserName = req.body.curUserName;
	db.assignTracer.update({
		Read:curUserName
	}, {
		where:{id:assignTracerId}
	}).then(function(updated){
		res.json({
			updated:updated
		})
	})
})

app.get('/assignTracerReadDay', middleware.requireAuthentication, function(req, res) {
	var assignId = req.query.assignId;
	var type = req.query.type;
	var curUserTitle = req.user.title;
	// console.log(assignId)

	db.assign.findOne({
		include: [{
			model:db.assignTracer,
			include:[{
				model:db.user

			},{
				model:db.assignTracerDetail
			}],
			where:{
				type:type
			}
						
		}],
		where: {
				id: assignId
		},
		order:[
				[db.assignTracer,'createdAt', 'DESC']
			]
	}).then(function(assign) {
		console.log('xxx')
		console.log(JSON.stringify(assign, null, 4))
			res.json({
				assign: assign
			});

	}).catch(function(e) {
		console.log(e)
	});
});

app.post('/assignTracerReadWeek', middleware.requireAuthentication, function(req, res){
	var curUser= req.user;
	var eDate = moment(new Date(req.body.sDate)).add(7,'days').format('MM-DD-YYYY')
	var sDate = moment(new Date(req.body.sDate)).format('MM-DD-YYYY')

	db.assign.findAll({
		attributes:['id', 'datePos', 'Memo', 'userId', 'Note'],
		include:[{
			model:db.assignTracer,
			include:[{
				model:db.user
			}]
			
		}],
		where:{
			datePos:{
				$between:[sDate,eDate]
			},
			userId:curUser.id
		},
		order:[
				['datePos'],
				[db.assignTracer,'createdAt', 'DESC']

			]
	}).then(function(assigns){
		
		// console.log(JSON.stringify(assigns, null, 4))
		res.json({
			assigns
		})
	})
})



app.post('/dateSC', middleware.requireAuthentication, function(req, res) {
	var userId = req.body.postdata.userId;
	var dateSC = req.body.postdata.dateSC;
	var taskSC = req.body.postdata.taskSC;
	var memo = req.body.postdata.memo;
	var type = req.body.postdata.type;
	var detailListArr = req.body.postdata.detailListArr;

	var curUser = req.user
	console.log(JSON.stringify(detailListArr, null, 4))

	
	if (taskSC=='SELECT' ||taskSC=='NEW'){

	
	} else {
		db.user.findOne({
			where: {
				id: userId
			}
		}).then(function(user) {
			return [
				db.assign.findOrCreate({
					where: {
						userId: user.id,
						datePos: dateSC
					}
				}),
				user
			];
		}).spread(function(assign, user) {
			user.addAssign(assign[0]).then(function() {
				return assign[0].reload()
			});

			return [
				db.assign.update({
					Note: taskSC
				},
				{
					where: {
						userId: user.id,
						datePos: dateSC
					}
				}),
				db.user.findOne({
					where:{
						id:curUser.id
					}
				})
				, assign
				, user
			];
		}).spread(function(assignUpdated, curUser, assign, user) {
			var body = {
				Note:taskSC,
				Memo:memo||'',
				type:type
			}
			var postText;
			if (taskSC==='PTO-A'){
			
				postText = 'PTO is  approved for '+ user.fullName +' on ' + dateSC

				console.log('xxxxxxxxx'+ postText)
				db.mainPost.create({
					postText:postText,
					postTo:'friend',
					userId:curUser.id,
					include:'',
					exclude:''
				
					
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
						error: e.toString()
					})
				});
			}else if(taskSC==='SWIT-R' && user.id == curUser.id){
				postText = curUser.fullName + ' is looking for coverage on ' + dateSC
				db.mainPost.create({
					postText:postText,
					postTo:'friend',
					userId:curUser.id,
					include:'',
					exclude:''
				
					
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
						error: e.toString()
					})
				});
			// }else if(taskSC==='SWIT-R' && user.id != curUser.id){
				
			// 	db.user.findAll({
			// 		where:{
			// 			title: {
			// 				$in:['Admin', "Manager"]
			// 			}
			// 		}
			// 	}).then(function(users){
			// 		var userArr = users.map(function(user){
			// 			return user.id
			// 		})
					
			// 		console.log(JSON.stringify(userArr, null, 4))
			// 		db.mainPost.create({
			// 			postText:postText,
			// 			postTo:'mine',
			// 			userId:curUser.id,
			// 			include:JSON.stringify(userArr),
			// 			exclude:''
			// 		}).then(function(post){
			// 			console.log(JSON.stringify(post, null, 4))
						
			// 		}).catch(function(e) {
			// 			console.log(e)
			// 			res.render('error', {
			// 				error: e.toString()
			// 			})
			// 		});
			// 	})

			}else if (taskSC==='PTO-R'||taskSC==='PTO-X' || taskSC==='SWIT-R'||taskSC==='SWIT-A'){
				console.log('PTO-R SWIT-R SWIT-A' + taskSC)
				postText = user.fullName + ' requested PTO' +' for ' + dateSC
				console.log('xxxxxxxxx'+ postText)
				db.user.findAll({
					where:{
						title: {
							$in:['Admin', "Manager"]
						}
					}
				}).then(function(users){
					var userArr = users.map(function(user){
						return user.id
					})
					if(taskSC == 'SWIT-R'){
						postText = curUser.fullName + ' ASK to work on' + dateSC + ' for ' + user.fullName + ' in exchange for pending SWIT-R day'
						userArr.push(user.id)
					}else if(taskSC == 'SWIT-A'){
						postText = curUser.fullName + ' is AGREED to work on' + dateSC + ' for ' + user.fullName + ' in exchange for pending SWIT-R day'
						userArr.push(user.id)

					}else if(taskSC == 'SWIT-X'){
						postText = curUser.fullName + ' is DENIED to work on' + dateSC + ' for ' + user.fullName 
						userArr.push(user.id)

					}else if(taskSC === 'PTO-X'){
						postText = 'PTO is  denied for '+ user.fullName +' on ' + dateSC
						userArr.push(user.id)
					}
					console.log(JSON.stringify(userArr, null, 4))
					db.mainPost.create({
						postText:postText,
						postTo:'mine',
						userId:curUser.id,
						include:JSON.stringify(userArr),
						exclude:''
					}).then(function(post){
						console.log(JSON.stringify(post, null, 4))
						
					}).catch(function(e) {
						console.log(e)
						res.render('error', {
							error: e.toString()
						})
					});
				})

			}else{
				console.log('else')
				// if(taskSC === 'PTO-X'){
				// 	postText = 'PTO is  denied for '+ user.fullName +' on ' + dateSC
				
				// }else{
					var postText = 'Assigned ' + taskSC + ' for '  + user.fullName +' on ' + dateSC
					console.log('xxxxxxxxx'+ postText)
				// }
				
				db.mainPost.create({
					postText:postText,
					postTo:'mine',
					userId:curUser.id,
					include:'['+user.id+']',
					exclude:''
				}).then(function(post){
					console.log(JSON.stringify(post, null, 4))
					
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
						error: e.toString()
					})
				});
			}

			res.json({
					Note: taskSC
				});
			return [db.assignTracer.create(body), curUser, assign]

		}).spread(function(assignTracer, curUser, assign){

			curUser.addAssignTracer(assignTracer).then(function(){
				return assignTracer.reload()
			})
			assign[0].addAssignTracer(assignTracer).then(function(){
				return assignTracer.reload()
			})

			if(detailListArr.length>0){
				var data = []
				detailListArr.forEach(function(memoDetail){
					data.push({
						Description:memoDetail,
						assignTracerId:assignTracer.id
					})
				})
				console.log(JSON.stringify(data, null, 4))
				

				return[db.assignTracerDetail.bulkCreate(data)]

			}

			
		// }).then(function(assignTracerDetails){
		// 	console.log(JSON.stringify(assignTracerDetails, null, 4))
				
		}).catch(function(e) {
			console.log("eeroorr" + e);

			res.render('error', {
				error: e.toString()
			});
		});
	}
});

app.post('/dateSCDel', middleware.requireAuthentication, function(req, res) {

	var userId = req.body.postdata.userId;
	var dateSC = req.body.postdata.dateSC;
	var taskSC = req.body.postdata.taskSC;
	var memo = req.body.postdata.memo;
	var type = req.body.postdata.type;

	var curUser = req.user
	
	db.assign.update(
		{
			Note:''	
		},{
			where: {
				userId: userId,
				datePos: dateSC
			}
		},{
			returning:true
		}

	).then(function(updated){
		postText = ' Assigned on ' + dateSC + ' has been DELETED'
		
		
		db.mainPost.create({
			postText:postText,
			postTo:'mine',
			userId:curUser.id,
			include:'['+userId+']',
			exclude:''
		}).then(function(post){
			console.log(JSON.stringify(post, null, 4))
			
		}).catch(function(e) {
			console.log(e)
			res.render('error', {
				error: e.toString()
			})
		});
		res.json({
			updated: updated
		});
		return db.assign.findOne({
			where: {
				userId: userId,
				datePos: dateSC
			}
		})

	}).then(function(assign){
		return db.assignTracer.update({
			Read:'DELETED'
		},{
			where:{
				assignId:assign.id
			}
		})
	}).then(function(assignTracers){

		console.log(JSON.stringify(assignTracers, null, 4))

	}).catch(function(e) {
		console.log("eeroorr" + e);

		res.render('error', {
			error: e.toString()
		});
	});
	
});

app.post('/assignTracerDel', middleware.requireAuthentication, function(req, res){

	var assignTracerId = req.body.assignTracerId;
	db.assignTracer.update({
			Read:'Deleted'
		},{
			where:{
				id:assignTracerId
			}
		
	}).then(function(updated){

		
		res.json({
			updated: updated
		});
	}).catch(function(e) {
		console.log("eeroorr" + e);

		res.render('error', {
			error: e.toString()
		});
	});

})

app.post('/clearEvent', middleware.requireAuthentication, function(req,res){
	var sDate = req.body.sDate
	var eDate = req.body.eDate
	db.assigns.update({
		Read:true
	},{
		where:{

		}
	})
})



app.get('/taskOption', middleware.requireAuthentication, function(req, res){
	var curUserTitle = req.user.title;
	db.taskOption.findAll({
		order: [
			['description']
		]
	}).then(function(taskOption){
		res.json({
			taskOption:taskOption,
			curUserTitle:curUserTitle
		})
	}, function(e){
		res.render('error', {
			error: e.toString()
		})

	})

})


app.get('/taskOptionDefault', middleware.requireAuthentication, function(req, res) {
	var description = req.query.taskOption
	var category = req.query.taskCategory
	db.taskOption.findOrCreate({
		where:{
			description:description
		}
	}).spread(function(taskOption, created) {
		return [db.taskOption.update({
			category:category
		}, {
			where:{
				description: description
			}
		}), taskOption]	
	}).spread(function(created, taskOption){
		
		taskOption.category = category
		res.json({
				created,
				taskOption:taskOption
			})
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});
});


app.post('/delTaskOption', middleware.requireAuthentication, function(req, res){

	db.taskOption.destroy({
		where: {
			description: req.body.taskOption
		}
	}).then(function(deleted){
		res.json({
			deleted:deleted
		});
	});

})


app.post('/memoOpt', middleware.requireAuthentication, function(req, res) {
	var optFilter = req.body.optFilter
	var description = req.body.description
	if(optFilter=="all"){
		db.taskOptMemo.findAll({
		include:[{model:db.taskOption}]
		}).then(function(taskOptMemos) {
			res.json({taskOptMemos:taskOptMemos})
		
		}).catch(function(e) {
			console.log(e)
			res.render('error', {
				error: e.toString()
			})
		});


	}else if(optFilter=="category"){
		db.taskOptMemo.findAll({
			include:[{
				model:db.taskOption,
				where:{
					category:description
				}
			}]
		}).then(function(taskOptMemos) {
			console.log(JSON.stringify(taskOptMemos, null, 4))
			res.json({taskOptMemos:taskOptMemos})
		
		}).catch(function(e) {
			console.log(e)
			res.render('error', {
				error: e.toString()
			})
		});

	}else if(optFilter=="individual"){
		db.taskOption.findOne({
			where:{
				description:description
			},
			include:[{
				model:db.taskOptMemo,
				include:[{
					model:db.taskOptDetail,
				}]	
			}]
			
		}).then(function(taskOption) {
			console.log(JSON.stringify(taskOption, null, 4))
			res.json({taskOptMemos:taskOption.taskOptMemos})
		
		}).catch(function(e) {
			console.log(e)
			res.render('error', {
				error: e.toString()
			})
		});

	}
	
});

app.post('/memoChbx', middleware.requireAuthentication, function(req, res) {
	var memoChbx = req.body.memoChbx
	var taskOptionDes = req.body.taskOptionDes
	var type = req.body.type
	console.log(memoChbx+'-'+taskOptionDes+'-'+type)

	
	// db.taskOptMemo.max('updatedAt').then(function(maxUpdated){
	// 	console.log('Max is: '+ JSON.stringify(maxUpdated, null, 4))
	// 	return 
	db.taskOptMemo.findOne({
		where:{
			memo:memoChbx
		},
		order:[
			['updatedAt', 'DESC']
		],
		limit:1,
		include:[{
			model:db.taskOptDetail,
		}]	
	}).then(function(taskOptionMemo){
		console.log('Max row is: '+ JSON.stringify(taskOptionMemo, null, 4))	
		console.log(taskOptionDes)
		if (!!taskOptionMemo){

			db.taskOption.findOne({
					where: {
						description:taskOptionDes
					}
			}).then(function(taskOption){
				console.log('taskOption is:'+JSON.stringify(taskOption, null, 4))
				
				
				return db.taskOptMemo.create({
					memo:memoChbx,
					taskOptionId:taskOption.id,
					type:type
				})
			}).then(function(createdTaskOptionMemo){
				console.log('createdtaskMemo:'+JSON.stringify(createdTaskOptionMemo, null, 4))
				var mapTaskDescription = taskOptionMemo.taskOptDetails.map(function(taskOpt) {
					return {
						taskDescription:taskOpt.taskDescription,
						taskOptMemoId:createdTaskOptionMemo.id
					}
				});



				if(!!mapTaskDescription){
					db.taskOptDetail.bulkCreate(mapTaskDescription)
				}
				res.json({
					taskOptionMemo:createdTaskOptionMemo
				})

			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
		} else{


			db.taskOption.findOne({
					where: {
						description:taskOptionDes
					}
			}).then(function(taskOption){

				return db.taskOptMemo.create({
					memo:memoChbx,
					taskOptionId:taskOption.id,
					type:type
				})
			}).then(function(createdTaskOptionMemo){
				res.json({
					taskOptionMemo:createdTaskOptionMemo
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

app.post('/taskOptMemo', middleware.requireAuthentication, function(req, res) {
	
	var type = req.body.type
	console.log(type)

	db.taskOptMemo.findAll({
		
		where: {
			type:type
		}
	}).then(function(taskOptMemos){
		console.log(JSON.stringify(taskOptMemos, null, 4))
		res.json({
			taskOptMemos:taskOptMemos
		})
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});

})

app.post('/checkedMemoUpd', middleware.requireAuthentication, function(req, res) {
	var checkedMemoValue = req.body.checkedMemoValue
	var checkedMemoId = req.body.checkedMemoId
	console.log(checkedMemoValue+'-'+checkedMemoId)

	db.taskOptMemo.update({
		checked:checkedMemoValue
	}, {
		where:{id:checkedMemoId}
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
})


app.post('/checkedMemoDel', middleware.requireAuthentication, function(req, res) {
	var checkedMemoValue = req.body.checkedMemoValue
	var checkedMemoId = req.body.checkedMemoId
	console.log(checkedMemoValue+'-'+checkedMemoId)

	db.taskOptMemo.destroy({
		where:{id:checkedMemoId}
	}).then(function(deleted){
		res.json({
			deleted:deleted
		})
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});
})


app.post('/memoChbxDetailCreate', middleware.requireAuthentication, function(req, res) {
	var memoChbxDetail = req.body.memoChbxDetail
	var taskOptMemoId = req.body.taskOptMemoId
	console.log(memoChbxDetail+'-'+taskOptMemoId)
	if (memoChbxDetail!=''){
		db.taskOptDetail.create({
			taskDescription:memoChbxDetail,
			taskOptMemoId:taskOptMemoId
			
		}).then(function(memoChbxDetail){
			res.json({
				memoChbxDetail:memoChbxDetail
			})
		}).catch(function(e) {
			console.log(e)
			res.render('error', {
				error: e.toString()
			})
		});
	}

})

app.post('/memoChbxDetailDel', middleware.requireAuthentication, function(req, res) {
	var memoChbxDetailId = req.body.memoChbxDetailId
	console.log(memoChbxDetailId)

	db.taskOptDetail.destroy({
		where:{id:memoChbxDetailId}
	}).then(function(deleted){
		res.json({
			deleted:deleted
		})
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});
})


app.post('/assignTracerDetailUpd', middleware.requireAuthentication, function(req, res) {
	var comments = req.body.comments
	var value = req.body.value
	var curUserName = req.body.curUserName
	var assignTracerDetailId = req.body.assignTracerDetailId
	console.log(comments+'-'+value+'-'+assignTracerDetailId)

	db.assignTracerDetail.update({
		Comments:comments,
		Value:value,
		CompletedBy:curUserName
	}, {
		where:{id:assignTracerDetailId}
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
})



//Loading user on the scheduling main page
app.get('/ajaxUser', middleware.requireAuthentication, function(req, res) {
	var curUser = req.user
	console.log(JSON.stringify(curUser, null, 4))
	var whereParams = {
		active:true,
		departmentId:curUser.departmentId
	}

	if(curUser.department==='ADMIN'){
		var whereParams = {
		active:true
		}
	}

	db.user.findAll({
		where:whereParams, 
		order:[
				// ['department'],
				['title']

			]
		,
	}).then(function(users) {
		res.json({
			pData: {
				users: users
				
				
			}
		});
	}, function(e) {
		res.render('error', {
			error: e.toString()
		});

	});
})







// io.on('connection', function(socket) {
// 	console.log('user connect to socket io');

// 	socket.emit('message', {
// 		text: 'welcomex to schedule app',
// 		Note: 'first'
// 	});


// });


var user = require('./server/serverUser.js');
// var user = express.static(__dirname + '/server');
app.use('/users', user);

var notif = require('./server/serverNotif.js'); 
app.use('/notif', notif)


umzug.up().then(function (migrations) {
	console.log(migrations)
  // "migrations" will be an Array with the names of
  // pending migrations.
  	db.sequelize.sync(
	{force: false}
	).then(function() {
		
		http.listen(PORT, function() {
			console.log('Helllo Express server started on PORT ' + PORT);
			setInterval(function(){
				console.log('clean DB....')
				var prior90Date = moment(new Date()).subtract(60,'days').format()
				
					console.log('prior90Date:'+prior90Date) 
				db.assign.destroy({
					where:{
						updatedAt:{
							$lt:prior90Date
						}
					}
				}).then(function(){
					var prior10Date = moment(new Date()).subtract(10,'days').format()
					db.token.destroy({
						where:{
							createdAt:{
								$lt:prior10Date
							}
						}
					})

				}).catch(function(e) {
					console.log(e);
				});
			}, 7*8460000);
		});

	});
});


// db.sequelize.sync(
// 	{force: false}
// 	).then(function() {
		
// 		http.listen(PORT, function() {
// 			console.log('Helllo Express server started on PORT ' + PORT);
// 		});

// 	});