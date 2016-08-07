var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var expValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var debug = require('debug')('http')

var moment = require('moment');
var now = moment();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var _ = require('underscore');
var Umzug = require('umzug')






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




io.on('connection', function(socket) {
	console.log('user connect to socket io');

	socket.emit('message', {
		text: 'welcomex to schedule app',
		Note: 'first'
	});

	socket.emit('test', {
		text1: 'testtext',
		Note: 'testNote'
	});


});

app.get('/message', function(req, res){
	res.render('message/messageHome')
	
})

app.get('/test', function(req, res){
	
	// res.send('hey hey')
})


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
			// users: users,
			// assigns: assigns,
			// dateHeader: dateHeader
		});
	}).catch(function(e) {
		res.render('error', {
			error: "eeeeee" + e.toString()
		});
	});
});


app.post('/sysObjRead', middleware.requireAuthentication, function(req, res){
	var varList = req.body.pData
	
	db.sysObj.findAll({
		where:{
			name: varList
		} 
	}).then(function(sysObjs){
		var sysObjList = {}
		sysObjs.forEach(function(sysObj,i){
		sysObjList[sysObj.name] = sysObj.value
		})
		res.json(sysObjList)
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

app.post('/taskSC', middleware.requireAuthentication, function(req, res){
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
			}
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

app.post('/assignTracerReadDay', middleware.requireAuthentication, function(req, res) {
	var assignId = req.body.assignId;
	var curUserTitle = req.user.title;
	// console.log(assignId)

	db.assign.findOne({
		include: [{
			model:db.assignTracer,
			include:[{
				model:db.user
			}]
		}],
		where: {
				id: assignId
		},
		order:[
				[db.assignTracer,'createdAt', 'DESC']
			]
	}).then(function(assign) {
		// console.log(JSON.stringify(assign, null, 4))
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
	var curUser = req.user

	// console.log('dateSC: '+dateSC)
	if (taskSC=='SELECT' ||taskSC=='NEW'){

	// }else if (userId != curUser.id && (curUser.title != 'Admin' && curUser.title != 'Manager')&& taskSC!="SWIT-R"){
		
	// 	res.json({authorized: false});
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
			// console.log(assign[0]+'--'+assign[1])
			user.addAssign(assign[0]).then(function() {

			});

		// console.log(taskSC)	


			if (taskSC=='DELETE'){
				var updatePara = {
					Note: '',
					Memo: ''
				}
			} else {
				var updatePara = {
					Note: taskSC,
					Memo: memo
				}
			}
			return [
				db.assign.update(
					updatePara
				, {
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
			];
		}).spread(function(assignUpdated, curUser, assign) {
			// console.log('updateeee new taskSC: ' + JSON.stringify(curUser,null,4));
			var body = {
				Note:taskSC,
				Memo:memo||''
			}

			res.json({
					Note: taskSC
				});
			return db.assignTracer.create(body).then(function(assignTracer){
				curUser.addAssignTracer(assignTracer).then(function(){})
				assign[0].addAssignTracer(assignTracer).then(function(){})

			})


			
		}).catch(function(e) {
			console.log("eeroorr" + e);

			res.render('error', {
				error: e.toString()
			});
		});
	}
});

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


app.post('/taskOption', middleware.requireAuthentication, function(req, res) {
	var description = req.body.taskOption
	var category = req.body.taskCategory
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

	db.taskOption.findOne({
		where: {
			description:taskOptionDes
		}
	}).then(function(taskOption){
		console.log(JSON.stringify(taskOption, null, 4))
		return db.taskOptMemo.create({
			memo:memoChbx,
			taskOptionId:taskOption.id,
			type:type
		})
	}).then(function(taskOption){
		res.json({
			taskOption:taskOption
		})
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});

})

app.post('/taskOptMemo', middleware.requireAuthentication, function(req, res) {
	
	var type = req.body.type
	console.log(type)

	db.taskOptMemo.findAll({
		where: {
			type:type
		}
	}).then(function(taskOptMemos){
	
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



app.post('/ajaxUser', middleware.requireAuthentication, function(req, res) {

	db.user.findAll({
		where:{
			active:true
		}, 
		order:[
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







io.on('connection', function(socket) {
	console.log('user connect to socket io');

	socket.emit('message', {
		text: 'welcomex to schedule app',
		Note: 'first'
	});


});


var user = require('./server/serverUser.js');
// var user = express.static(__dirname + '/server');
app.use('/users', user);


umzug.up().then(function (migrations) {
	console.log(migrations)
  // "migrations" will be an Array with the names of
  // pending migrations.
  	db.sequelize.sync(
	{force: false}
	).then(function() {
		
		http.listen(PORT, function() {
			console.log('Helllo Express server started on PORT ' + PORT);
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