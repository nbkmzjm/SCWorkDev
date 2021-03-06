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
app.use(expValidator());

app.get('/', middleware.requireAuthentication, function(req, res, next) {

	db.assign.findAll({
		include: [db.user]
	}).then(function(assigns) {

		// next();

		return [assigns, db.user.findAll(), db.dateHeader.findAll()];
	}).spread(function(assigns, users, dateHeader) {
		// console.log('suerssssssssss' + JSON.stringify(users));
		// console.log('ggggggggggggg' + JSON.stringify(assigns));
		// console.log('yyyyyyyyyy' + JSON.stringify(dateHeader));
		res.render('index', {
			users: users,
			assigns: assigns,
			dateHeader: dateHeader
		});
	}).catch(function(e) {
		res.render('error', {
			error: "eeeeee" + e.toString()

		});

	});



});

app.post('/mainSC', middleware.requireAuthentication, function(req, res) {
	// req.accepts('application/json');
	// console.log('mainSCCCCCC receiving' + req.body.postdata.name);
	db.assign.findAll({
		include: [db.user]
	}).then(function(assigns) {

		// next();

		return [assigns, db.user.findAll(), db.dateHeader.findAll()];
	}).spread(function(assigns, users, dateHeader) {

		// console.log('suerssssssssss' + JSON.stringify(users));
		// console.log('ggggggggggggg' + JSON.stringify(assigns));
		// console.log('yyyyyyyyyy' + JSON.stringify(dateHeader));
		res.json({
			users: users,
			dateHeader: dateHeader
				// {
				// users: users, 
				// assigns: assigns,
				// dateHeader: dateHeader
				// }
		});
	}).catch(function(e) {
		res.render('error', {
			error: "eeeeee" + e.toString()

		});

	});

})

app.post('/taskSC', middleware.requireAuthentication, function(req, res) {
	var userId = req.body.postdata.userId;
	var dateSC = req.body.postdata.dateSC;

	// console.log('taskSCCCCCCx: ' + userId + dateSC);
	db.assign.findOne({
		where: {
			userId: userId,
			datePos: dateSC
		}

	}).then(function(assign) {
		// console.log('assingXXX' + assign);
		// console.log('userIdXXX' + userId);

		if (!!assign) {
			res.json({
				assign: assign
			});
		} else {
			res.json({
				userId: userId
			});
		};

	}).catch(function(e) {

		console.log("eeroorr" + e);

		res.render('error', {
			error: e.toString()
		});
	});
});
app.post('/dateSC', middleware.requireAuthentication, function(req, res) {
	var userId = req.body.postdata.userId;
	var dateSC = req.body.postdata.dateSC;
	var taskSC = req.body.postdata.taskSC;
	var curUserId = req.user.id
	// console.log('jjjjj'+curUserId) 

	// console.log('dateSCCCCCC: ' + userId + dateSC + taskSC);

	if (userId != curUserId){
		console.log('aaauu')
		res.json({authorized: false});


	} else if (taskSC!=''){
		
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
					// if (assign[1]) {
				// console.log('assigned is: rrrr' + assign[0].Note)
					// return assign[0].reload();
					// }
				
			});

			res.json({
					Note: taskSC
				});

			return db.assign.update({
				Note: taskSC
			}, {
				where: {
					userId: user.id,
					datePos: dateSC
				}
			});



			

		}).then(function(assign) {
			console.log('updateeee new taskSC: ' + assign);
		}).catch(function(e) {
			console.log("eeroorr" + e);

			res.render('error', {
				error: e.toString()
			});
		});
	}else{
		db.user.findOne({
			where: {
				id: userId
			}
		}).then(function(user) {
			return db.assign.destroy({
						where: {
							userId: user.id,
							datePos: dateSC

						}
					});
		}).then(function(deleted){
			console.log('deleted: ' + deleted)
			res.json({
					deleted: deleted
				});


		}).catch(function(e) {
			console.log("eeroorrx" + e);

			res.render('error', {
				error: e.toString()
			});
		});

	}




	// db.assign.create({

	// 	datePos:dateSC
	// }).then(function(assign){
	// 	userId.addAssign(assign).then(function(
	// 		){
	// 		return assign.reload();
	// 	}).then(function(assign){

	// 	});
	// console.log(assign);

	// 	// console.log(ins + ":::::::"+ ini)
	// }).catch(function(e) {
	// 	console.log(e);
	// 	res.render('error', {
	// 		error: e.toString()

	// 	});

	// });
});

app.get('/taskOption', middleware.requireAuthentication, function(req, res){

	db.taskOption.findAll().then(function(taskOption){
		res.json({
			taskOption:taskOption
		})
	}, function(e){
		res.render('error', {
			error: e.toString()
		})

	})

})

app.post('/taskOption', middleware.requireAuthentication, function(req, res) {


	db.taskOption.findOrCreate({
		where:{
		description: req.body.taskOption
		}
	}).spread(function(taskOption, created) {
			
			res.json({
				taskOption:taskOption,
				created:created
			})
		
	}, function(e) {
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

app.post('/ajaxUser', middleware.requireAuthentication, function(req, res) {

	db.user.findAll().then(function(users) {
		
		if (req.body.clickedData){
			res.json({
				pData: {
					users: users,
					clickedData: true
				}
			});
		}else{
			res.json({
				pData: {
					users: users,
					clickedData: false
				}
			});
		}
		
		

	}, function(e) {
		res.render('error', {
			error: e.toString()

		});

	});
})


app.get('/loginForm', function(req, res) {
	res.render('users/loginForm')
})


app.post('/login', function(req, res) {

	req.check('email', 'length is required').isByteLength(5);
	req.check('email', 'Not valid email').isEmail();

	var errors = req.validationErrors();

	if (errors) {
		res.render('users/loginForm', {
			message: '',
			errors: errors
		});
	}

	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication')
		userInstance = user;
		return db.token.create({
			token: token
		});

	}).then(function(tokenInstance) {
		// res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
		res.cookie('token', tokenInstance.get('token'), {
			maxAge: 900000
		});
		res.redirect('/');
	}).catch(function(e) {
		console.log(e);
		arrErr = [{
			param: "account",
			msg: 'Username and Password do not match!!!'
		}];
		res.render('users/loginForm', {
			errors: arrErr
		});
		res.status(401).json({
			error: e.toString()
		});
	});

});


app.get('/logout', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function() {
		res.redirect('/loginForm');
	}).catch(function(e) {
		res.status(500).send();
	});
});
// app.use('token', )



app.get('/newAccountForm', function(req, res) {
	res.render('users/newAccountForm');
})

app.post('/createAccount', function(req, res) {

	body = {};
	body.email = req.body.email;
	body.password = req.body.password;

	db.user.create(body).then(function(user) {
		res.redirect('/');
	}, function(e) {
		res.render('error', {
			error: 'Can not Create Account due to :' + e

		});

	});
});


app.get('/assignInput', middleware.requireAuthentication, function(req, res) {
	res.render('assignInput');
});



app.post('/assign', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'datePos', 'Note');
	console.log('body is xxxxxxxxx: ' + body);
	db.assign.create(body).then(function(datePos) {
		req.user.addAssign(datePos).then(function() {
			return assign.reload();
		}).then(function(datePos) {
			res.json(datePos.toJSON());
		});



	}, function(e) {
		res.status(400).json(e);
	});


	res.redirect('/');
});

io.on('connection', function(socket) {
	console.log('user connect to socket io');

	socket.emit('message', {
		text: 'welcomex to schedule app',
		Note: 'first'
	});


});

todoItems = [{
	id: 1,
	desc: 'foo'
}, {
	id: 2,
	desc: 'far'
}, {
	id: 3,
	desc: 'fuk'
}];

app.get('/about', middleware.requireAuthentication, function(req, res) {

	console.log(typeof(todoItems));
	todoItems.forEach(function(item) {
		console.log(item.desc);
	})
	res.render('about', {
		title: 'My App',
		items: todoItems
	});

});

app.get('/test', function(req, res){
	res.render('test')
})

app.post('/add', function(req, res) {
	var newItem = req.body.newItem;
	console.log(newItem);
	todoItems.push({
		id: todoItems.length + 1,
		desc: newItem
	});
	res.redirect('/about');

});

app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {

		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {

		res.json(todos);

	}, function(e) {
		res.status(500).send;

	});
});
app.get('/todos/:id', middleware.requireAuthentication,
	function(req, res) {
		var todoId = parseInt(req.params.id);

		db.todo.findOne({
			where: {
				id: todoId,
				userId: req.user.get('id')
			}
		}).then(function(todo) {
			if (!!todo) {
				res.json(todo.toJSON());
			} else {
				res.status(404).send();
			}
		}, function(e) {
			res.status(500).send();

		});


	});

app.post('/todos', middleware.requireAuthentication,
	function(req, res) {
		var body = _.pick(req.body, 'datePos', 'Note');
		console.log(body);
		db.assign.create(body).then(function(datePos) {
			req.user.addAssign(datePos).then(function() {
				return assign.reload();
			}).then(function(datePos) {
				res.json(datePos.toJSON());
			});



		}, function(e) {
			res.status(400).json(e);
		});


	});



app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}

	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with id'
			});
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	})
})



app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attr = {};

	if (body.hasOwnProperty('completed')) {
		attr.completed = body.completed
	}

	if (body.hasOwnProperty('description')) {
		attr.description = body.description
	}

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			todo.update(attr).then(function() {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);

			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(400).send();
	});

});


app.post('/user/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication')
		userInstance = user;
		return db.token.create({
			token: token
		});

	}).then(function(tokenInstance) {
		console.log("tookenInstance created");
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function(e) {
		res.status(401).json({
			error: e.toString()
		});
	});
});

app.delete('/user/logout', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function() {
		res.status(204).send();
	}).catch(function(e) {
		res.status(500).send();
	});

});


db.sequelize.sync(
	// {force: true}
).then(function() {
	
	http.listen(PORT, function() {
		console.log('Helllo Express server started on PORT ' + PORT);
	});

});