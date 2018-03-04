var express = require('express');
var router = express.Router();
var db = require('../db.js');
var db = require('pg')
var moment = require('moment');
var _ = require('underscore');
var processEnv = require('../envDecrypt.js')

var middleware = require('../middleware.js')(db);

function test(req, res){
	res.send('heyx;xhey')
}
router.get('/', middleware.requireAuthentication, function(req, res) {
	var curUser = req.user;

	if(curUser.role === 'Administrator'){
		db.user.findOne({
		where:curUser.id,
		include:[{
			model:db.department
		}]
		}).then(function(curUser){
			res.render('admin/adminHome', {
				JSONdata: JSON.stringify({
					
				})
			})

		})

	}else{

		res.render('admin/adminUse')
	}
	

	
	// var arrayTitle_UserTab = ['admin', 'manager']
	// if (arrayTitle_UserTab.indexOf(curUserTitle) !== -1) {
		
	// } else {
	// 	res.render('index')
	// }

})


router.get('/createDB', function (res, res) {
	var dbConn = processEnv.DATABASE_URL

	var dbClient = new db.Client(dbConn)

	
	var query = "CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT, user VARCHAR(255) NOT NULL, login INTEGER)"
	dbClient.connect(function(err){
		if(err){
			console.log('connection err:'+ err)
			throw err
		}

		dbClient.query(query, function(err){
			if(err){
				console.log('query Error:'+ err)
			}else{
				console.log('Success')
				res.end()
			}
		})
	})



})


module.exports = router;