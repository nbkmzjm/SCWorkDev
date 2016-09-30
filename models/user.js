var bcrypt = require('bcryptjs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {

	var user = sequelize.define('user', {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [5, 30]	
			},
			set: function(value){
				this.setDataValue('name', value.toUpperCase())
			}
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				len: [5, 100]	
			}
		},
		title: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		active: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
			
		},
		
		
		salt: {
			type: DataTypes.STRING,
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [5, 100]	
			},
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);

			}
		}



	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			},
			generateToken: function (type) {
				if (!_.isString(type)){
					return undefined;
				}

				try {
					var stringData = JSON.stringify({id: this.get('id'), type: type});
					var encryptedData = cryptojs.AES.encrypt(stringData, 'fish1ing').toString();
					var token = jwt.sign({
						token: encryptedData
						},'fish1ing');
						return token;
					
					

				} catch (e){
					console.error(e);
					return undefined;
				}
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					user.findOne({
						where: {
							username: body.username,
							active:true
						}
					}).then(function(user) {
						if (!user){
							reject('User-Active')

						}else if(!bcrypt.compareSync(body.password, user.get('password_hash'))){
							reject('User-Pass');
						}

						resolve(user);

					}, function(e) {
						// console.log(e)
						reject(e);


					});
					
				});
			},
			findByToken: function (token){
				return new Promise(function (resolve, reject){
					try {
						var decodedJWT = jwt.verify(token, 'fish1ing');
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'fish1ing');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						user.findById(tokenData.id).then(function (user){
							if(user){
								resolve(user);
							} else {
								reject()
							}
						}, function (e){
							reject(e);
						})

					}catch (e) {
						console.log(e);
						reject(e);
					}
				});
			}


		}


	});
 	return user;
};



	