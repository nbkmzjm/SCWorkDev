var express = require('express');
var router = express.Router();
var db = require('../db.js');
var moment = require('moment');
var _ = require('underscore');

var middleware = require('../middleware.js')(db);


router.get('/', middleware.requireAuthentication, function(req, res) {
	var curUserTitle = req.user.title;
	res.render('users/usersHome', {
			JSONdata: JSON.stringify({
				tabx: 'userList', 
				curUserTitle:curUserTitle,
				firstUser: false
			})
		})
	// var arrayTitle_UserTab = ['admin', 'manager']
	// if (arrayTitle_UserTab.indexOf(curUserTitle) !== -1) {
		
	// } else {
	// 	res.render('index')
	// }

})

router.get('/aboutuser', function(req, res) {
	// res.send('abuot user')
	res.redirect('/users')
})

router.get('/curUser', middleware.requireAuthentication, function(req, res) {
	res.json({curUserName:req.user.name})
})


router.get('/newAccountForm', function(req, res) {
	res.render('users/newAccountForm');
})


router.post('/addUser', function(req, res) {
	console.log('xxx'+req.body.lastname)
	
	req.check('name', 'First name must be within 2-30 characters').len(2, 30);
	req.check('lastname', 'Last name must be within 2-30 characters').len(2, 30);
	req.check('email', 'Email is not valid').isEmail();
	req.check('username', 'Username must be within 5-20 characters').len(5, 20)
	req.check('title', 'Title must be assigned').len(3)
	// req.check('password', 'Password must be within 5-20 characters').len(5, 20)
	var errors = req.validationErrors()
	var id = req.body.id
	var pass = req.body.password
	
	var passreset = req.body.passreset
		// res.redirect("/aboutuserx");

	var body = _.pick(req.body, 'name','lastname', 'email', 'username', 'password', 'title', 'active')
	console.log(JSON.stringify(id, null, 4))
	if (errors) {
		res.json({
			errors: errors
		})
	} else if (id == '0') {

		return db.sequelize.transaction(function (t) {
			return db.user.create(body, {transaction:t}
			).then(function(user){
				var groupName = user.name+' '+user.lastname+'_'+user.id
				
				return db.group.create({
					name:groupName,
					userId:user.id,
					groupBLUserId:user.id
				}, {transaction:t}).then(function(group){
					return db.userGroups.create({
						userId:user.id,
						groupId:group.id,
						status:'OWNER'
					}, {transaction:t})
				})
			})
		}).then(function(result){
			console.log('result is:'+JSON.stringify(result, null, 4))
			res.json({
					redi: '/users'
				})
		}).catch(function(e) {
			console.log(JSON.stringify(e, null, 4))
			res.json({
				errors: "User cannot be created due to " + e
			})
		});
		

	} else if (id != '0' || id != '') {
		console.log(typeof (req.body.password))
		console.log(passreset + '--' + req.body.password)
		if (passreset==true) {
			req.body.password = 'banner1234'
			var body = _.pick(req.body, 'name','lastname', 'email', 'password', 'username', 'title', 'active')
		}else if (req.body.password !== ''){
			var body = _.pick(req.body, 'name','lastname', 'email', 'password', 'username', 'title', 'active')
		}else {
			console.log('ese')
			var body = _.pick(req.body, 'name','lastname', 'email', 'username', 'title', 'active')
		}

		db.user.update(body, {
			where: {
				id: id
			}
		}).then(function(user) {
			res.json({
					redi: '/users'
				})
				// {JSONdata:JSON.stringify({tabx:'userList'})}
		}, function(e) {
			console.log(JSON.stringify(e, null, 4))
			res.json({
				errors: e.errors[0].message
			})
		});

	}



});

router.post('/editUserForm', function(req, res) {

	db.user.findOne({
		where: {
			id: req.body.userId
		}
	}).then(function(user) {
		res.json({
			user: user
		})
	})
})

// router.post('/userFormValid', function(req, res) {
// 	db.user.findOne({
// 		where: {
// 			username: req.body.username
// 		}
// 	}).then(function(user) {
// 		if (user) {
// 			res.json({
// 				userexist: true
// 			})
// 		} else {
// 			res.json({
// 				userexist: false
// 			})
// 		}
// 	})
// })

// router.post('/editUser', function(req, res) {
// 	db.user.findOne({
// 		where: {
// 			id: req.body.userId
// 		}
// 	}).then(function(user) {
// 		console.log(JSON.stringify(user, null, 4))
// 		res.json({
// 			user: user
// 		})
// 	})
// })

router.get('/userList', middleware.requireAuthentication, function(req, res) {
	var curUser = req.user
	console.log(curUser.id)

	var idpara = {}
	var arrayTitle_UserTab = ['Admin', 'Manager']
	if (arrayTitle_UserTab.indexOf(curUser.title) !== -1) {
		idpara.id = {$gt:0}
	}else{
		
		idpara.id = curUser.id
	}

	db.user.findAll({
		order: [
			['title']
		],
		where:idpara
	}).then(function(users) {
		res.json({
			users: users
		})
	}, function(e) {
		res.render('error', {
			error: e.toString()
		})

	})
})


router.post('/delUser', middleware.requireAuthentication, function(req, res) {

	db.user.destroy({
		where: {
			id: req.body.userId
		}
	}).then(function(deleted) {
		res.json({
			deleted: deleted
		});
	});

})


router.post('/login', function(req, res) {

	req.check('username', 'Username is required').isByteLength(5);
	req.check('username', 'Password is required').isByteLength(5);

	var errors = req.validationErrors();

	if (errors) {
		res.render('users/loginForm', {
			errors: errors
		});
	}else{
		var body = _.pick(req.body, 'username', 'password');
		var userInstance;
		console.log(body.username)
		db.user.authenticate(body).then(function(user) {
			var token = user.generateToken('authentication')
			userInstance = user;
			return db.token.create({
				token: token
			});

		}).then(function(tokenInstance) {
			// res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
			res.cookie('token', tokenInstance.get('token'), {
				maxAge: 60000000
			});
			res.redirect('/');
		}).catch(function(e) {
			console.log(e);
			if (e=='User-Active'){
				arrErr = [{
				msg: 'Username and Password do not match OR INACTIVE!!'
				}];
			}else if (e=='User-Pass')
				arrErr = [{
					msg: 'Username and Password do not match!!!'
				}];
			res.render('users/loginForm', {
				errors: arrErr
			});
			
		});
	}

	

});



router.get('/logout', middleware.requireAuthentication, function(req, res) {
	
	var prior7Date = moment(new Date()).subtract(7,'days').format()
	req.token.destroy().then(function() {
		console.log('prior7Date:'+prior7Date) 
		db.token.destroy({
			where:{
				createdAt:{
					$lt:prior7Date
				}
			}
		})
		res.redirect('loginForm');
	}).catch(function(e) {
		res.status(500).send();
	});
});


router.get('/loginForm', function(req, res) {
	res.render('users/loginForm')
})


module.exports = router;