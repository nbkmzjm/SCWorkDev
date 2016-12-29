var express = require('express');
var router = express.Router();
var db = require('../db.js');
var moment = require('moment');
var _ = require('underscore');

var middleware = require('../middleware.js')(db);

function test(req, res){
	res.send('heyx;xhey')
}
router.get('/', middleware.requireAuthentication, function(req, res) {
	var curUser = req.user;
	db.user.findOne({
		where:curUser.id,
		include:[{
			model:db.department
		}]
	}).then(function(curUser){
		res.render('users/usersHome', {
			JSONdata: JSON.stringify({
				tabx: 'userList', 
				curUser:curUser,
				firstUser: false
			})
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
	var newDay = moment();
	console.log(newDay.FullDate)
	
	res.redirect('/users')
})

router.get('/curUser', middleware.requireAuthentication, function(req, res) {
	res.json({curUserName:req.user.name})
})


router.get('/newAccountForm', function(req, res) {
	res.render('users/newAccountForm');
})

router.post('/getDept',middleware.requireAuthentication, function(req, res) {
	db.department.findAll().then(function(departments){
		res.json({
			departments:departments
		})
	})
})

router.post('/addDept',middleware.requireAuthentication, function(req, res) {
	req.check('deptName', 'Deparment name must be within 2-30 characters').len(2, 30);
	req.check('status', 'Please select a status').len(2, 30);
	var errors = req.validationErrors()
	var body = _.pick(req.body, 'deptName', 'status')
	console.log(JSON.stringify(body, null, 4))
	if (errors) {
		res.json({
			errors: errors
		})
	}else{
		db.department.create({
			name:body.deptName,
			staus:body.status
		}).then(function(created){
			console.log('department created: '+ created)
			res.json({
				redi: '/users'
			})
		}).catch(function(e) {
			console.log(JSON.stringify(e, null, 4))
			res.json({
				errors: "User cannot be created due to " + e.errors[0].message
			})
		});

		
	}	
})

router.post('/addUser',middleware.requireAuthentication, function(req, res) {
	// console.log('xxx'+req.user.departmentId)

	// db.department.
	req.check('name', 'First name must be within 2-30 characters').len(2, 30);
	req.check('lastname', 'Last name must be within 2-30 characters').len(2, 30);
	req.check('email', 'Email is not valid').isEmail();
	req.check('username', 'Username must be within 5-20 characters').len(5, 20)
	req.check('title', 'Title must be assigned').len(3)
	// req.check('department', 'Deparment must be at lease 3 characters').len(3)
	// req.check('password', 'Password must be within 5-20 characters').len(5, 20)
	var errors = req.validationErrors()
	var id = req.body.id
	var pass = req.body.password
	
	var passreset = req.body.passreset
		// res.redirect("/aboutuserx");
	
	var body = _.pick(req.body, 'name','lastname', 'email', 'username', 'password', 'title','departmentId', 'active')
	// if(body.departmentId === 1){
		
	// }
	console.log(JSON.stringify(body, null, 4))

	if (errors) {
		res.json({
			errors: errors
		})
	} else if (id == '0') {

		return db.sequelize.transaction(function (t) {
			return db.user.create(body, {
				transaction:t
			}).then(function(user){
				var groupName = user.name+' '+user.lastname+'_'+user.id
				
				return db.group.create({
					name:groupName,
					userId:user.id,
					groupBLUserId:user.id
				}, {
					transaction:t
				}).then(function(group){
					return db.userGroups.create({
						userId:user.id,
						groupId:group.id,
						status:'Owner'
					}, {
						transaction:t
					}).then(function(){
						return db.settingDescription.findAll({
							transaction:t
						}).then(function(settingDescriptions){
							console.log(JSON.stringify(settingDescriptions, null, 4))
							settingDescriptions.forEach(function(settingDescription){
								db.feedSetting.create({
									value:settingDescription.defaultValue,
									userId:user.id,
									settingDescriptionId:settingDescription.id
								})
							})
						})
					})
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
				errors: "User cannot be created due to " + e.errors[0].message
			})
		});
		

	} else if (id != '0' || id != '') {
		console.log(typeof (req.body.password))
		console.log(passreset + '--' + req.body.password)
		if (passreset==true) {
			req.body.password = 'banner1234'
			var body = _.pick(req.body, 'name','lastname', 'email', 'password', 'username', 'departmentId', 'title', 'active')
		}else if (req.body.password !== ''){
			var body = _.pick(req.body, 'name','lastname', 'email', 'password', 'username', 'departmentId', 'title', 'active')
		}else {
			console.log('ese')
			var body = _.pick(req.body, 'name','lastname', 'email', 'username', 'departmentId', 'title', 'active')
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
		},
		include:[{
			model:db.department
		}]
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

router.post('/userList', middleware.requireAuthentication, function(req, res) {
	var curUser = req.user
	var departmentId = req.body.departmentId

	var para = {}
	var arrayTitle_UserTab = ['Admin', 'Manager']
	if (arrayTitle_UserTab.indexOf(curUser.title) !== -1) {
		if(departmentId == 1){
			para.id = {$gt:0}
		}else{
			para.departmentId = departmentId
			console.log(departmentId + ' :xxx')
		}
		

	}else{
		
		para.id = curUser.id
	}

	db.user.findAll({
		order: [
			['title']
		],
		where:para,
		include:[{
			model:db.department
		}]
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