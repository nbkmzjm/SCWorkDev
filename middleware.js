cryptojs = require('crypto-js')
module.exports = function(db) {

	return {

		requireAuthentication: function(req, res, next) {
			var token = req.cookies.token;

			db.token.findOne({
				where: {
					tokenHash: cryptojs.MD5(token).toString()
				}
			}).then(function (tokenIns){
				if (!tokenIns){
					
					console.log('Token is not found. Goto Login Form');
					db.user.findOne({
						where:{
							id:{
								gt:0
							}
						}
					}).then(function(user){

						if (!!user){
							res.redirect('/users/loginform');
							
							
						}else{
							res.render('users/usersHome', {
								JSONdata: JSON.stringify({
									tabx: 'userForm',
									firstUser: true
								})
							})
							
						}
						
					})
				}else{
					req.token = tokenIns;
					db.user.findByToken(token).then(function (user){
						req.user = user;
						next();
					}, function (e) {
						console.log(e);
						db.user.findOne({
							where:{
								id:{
									gt:0
								}
							}
						}).then(function(user){

							if (!!user){
								res.redirect('/users/loginform');
								
								
							}else{
								res.render('users/usersHome', {
									JSONdata: JSON.stringify({
										tabx: 'userForm',
										firstUser: true
									})
								})
								
							}
							
						})

						
					});



				}
			})

		},
		logger: function(req, res, next) {
			console.log('request: ' + req.method + ' ' + req.originalUrl + ' ' + new Date());
			next();
		}
	}
};