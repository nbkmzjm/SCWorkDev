var express = require('express');
var router = express.Router();
var db = require('../db.js');
var moment = require('moment');
var _ = require('underscore');
const webpush = require('web-push')
var fs = require('fs')
var middleware = require('../middleware.js')(db);
const base64url = require('base64url')
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var gmail = google.gmail('v1');

var processEnv = require('../envDecrypt.js')
var aws = require('aws-sdk')
aws.config.update({
    accessKeyId: processEnv.AWS_ACCESS_KEY_ID,
    secretAccessKey: processEnv.AWS_SECRET_ACCESS_KEY
});


// const vapidKeys = webpush.generateVAPIDKeys();
// webpush.setGCMAPIKey("AIzaSyAVHtFMejQX7To7UwVqi4MWzWIfBP1qWAc");
// webpush.setVapidDetails(
//   'mailto:tkngo85@gmail.com',
//   vapidKeys.publicKey,
//   vapidKeys.privateKey
// );
// console.log('vapidKeys.publicKeyNOTI' + vapidKeys.publicKey)
getOauth2Client(iniGmaiWatch)
setInterval(() => {
	getOauth2Client(iniGmaiWatch)
	}, 124 * 36000);

function iniGmaiWatch(auth){
	request = {

	  'labelIds': ['INBOX'],
	  'topicName': 'projects/wkosolution-188119/topics/wkoMailScanner'
	}
	console.log('initial watch mail')
	gmail.users.watch({
		auth:auth,
		userId:'me', 
		resource:request
	}, function(err, res){
		if (err) {
			console.log('Gmail Watch returned an error: ' + err);
			return;
		}
		var historyId = res.historyId

		const PubSub = require('@google-cloud/pubsub');

		// Your Google Cloud Platform project ID
		const projectId = 'wkosolution-188119';

		// Instantiates a client
		const pubsubClient = PubSub({
			keyFilename: './wkosolutionPush.json',
			projectId: projectId
		});


		// References an existing subscription, e.g. "my-subscription"
		const subscription = pubsubClient.subscription('wkoMailPush');

		// Create an event handler to handle messages
		console.log('start hisId:'+historyId)
		let messageCount = 0;
		const messageHandler = (message) => {
			console.log(JSON.stringify(message, null, 4))
			console.log(`Received message ${message.id}:`);
			console.log(`\tData: ${message.data}`);
			console.log(`\tAttributes: ${message.attributes}`);
			messageCount += 1;
			console.log('before hisId:'+historyId)

			gmail.users.history.list({
				auth:auth,
				userId: 'me',
				startHistoryId: historyId
			}, function(err, res){
				console.log('history:')
				
				// console.log(JSON.stringify(res.history[0].messages, null, 4))
				if(!!res.history){
					var messages = res.history[0].messages
					messages.forEach(function(message){
						var mailCC = ''
						var mailTo = ''
						var mailFrom = ''

						gmail.users.messages.get({
							auth: auth,
							userId: 'me',
							id:message.id
						}, function(err, message){
							if (err) {
								console.log('The API returned an error: ' + err);
								return;
							}                                                                                                                                                     
							if(message.labelIds.indexOf('TRASH') === -1){

								var headers = message.payload.headers
								headers.forEach(function(header){
									if(header.name === "From"){
										mailFrom = header.value
										
									}
								})

								headers.forEach(function(header){
											
									if (header.name === "CC"||header.name === "Cc"){
										mailCC = header.value
									}
									if (header.name === "To"){
										mailTo = header.value
									}
								})

								var parts = message.payload.parts
								console.log(JSON.stringify(parts, null, 4))
								if (parts !== undefined){
									parts.forEach(function(part){
										if(part.filename && part.filename.length > 0){
											var attachId = part.body.attachmentId
											var signFileType = part.mimeType
											var fileName
											var origfileName = part.filename
											var fileExtension = origfileName.substring(origfileName.lastIndexOf('.'))
											var video = ['.m4v', '.mov', '.mp4', '.MKV', '.AVI', '.VOB', '.MPG', '.TiVo', '.FLV']
											var fileNameNoSpace = origfileName.replace(/ /g,"_")
											var parts = fileNameNoSpace.split(".");
										    if (parts[1]===undefined){
										        fileName = fileNameNoSpace;
										    }else if (signFileType.indexOf('image')!== -1){
										    	fileName = parts.slice(0,-1).join('') + moment().format("MMDDHHmmss") +".jpeg"
										    }else if(video.indexOf(fileExtension)!==-1){
										    	fileName = parts.slice(0,-1).join('') + moment().format("MMDDHHmmss") +".mp4"
										    }else{
										        fileName = parts.slice(0,-1).join('') + moment().format("MMDDHHmmss") + "." 
										        + parts.slice(-1)
										    }

											// Scan for Email Attachement from new mail
											gmail.users.messages.attachments.get({
												auth: auth,
												userId: 'me',
												id:attachId,
												messageId:message.id
											}, function(err, attachment) {

												if (err) {
													console.log('The API returned an error: ' + err);
													return;
												}
												console.log('attachxxx')

												var userEmail = mailCC + mailTo + mailFrom
												var regExp = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
												var emailArr = userEmail.match(regExp)
												emailArr = emailArr.filter( function( item, index, inputArray ) {
											           return inputArray.indexOf(item) == index;
											    });
												var Bucket = processEnv.S3Bucket
												var fileBuffer = new Buffer(attachment.data, 'base64')

												const s3 = new aws.S3({
													apiVersion: '2006-03-01'
												});
												var params = {
													Bucket: processEnv.S3Bucket,
													Key: fileName,
													Body: fileBuffer,
													ACL: 'public-read'
												};
												console.log('signFileType:'+signFileType)
												console.log('fileName:'+fileName)
												s3.putObject(params, function(err) {
													if(err){
														console.log(JSON.stringify(err, null, 4))
													}
													var fileUrl = 'https://'+ processEnv.S3Bucket +'.s3.amazonaws.com/'+fileName

													if(signFileType.indexOf('msword')!==-1||signFileType.indexOf('wordprocessingml')!==-1||
												    	signFileType.indexOf('ms-excel')!==-1||signFileType.indexOf('spreadsheetml')!==-1||
												    	signFileType.indexOf('ms-powerpoint')!==-1||signFileType.indexOf('presentationml')!==-1){
												    	var returnURLs = '<p><iframe src="https://view.officeapps.live.com/op/embed.aspx?src='+fileUrl
												    	+'"></iframe><a href="'+fileUrl+'" >'+fileName+'</a></p><br>'
												    }else if(signFileType.indexOf('pdf')!==-1){
												   		var returnURLs = '<p><iframe src="https://docs.google.com/gview?url='+fileUrl
												   		+'&embedded=true"></iframe><a href="'+fileUrl+'" >'+fileName+'</a></p><br>'
												   		
												   	}else if(signFileType.indexOf('video')!==-1){
												   		var returnURLs = '<p><video controls><source src="'+fileUrl+'"> </video></p>'
												    }else if(signFileType.indexOf('image')!==-1){
												    	var returnURLs = '<p><img src="'+returnData.url+'"/><a href="'+fileUrl+'" >'+fileName+'</a></p><br>'
												    }else{
												    	var returnURLs = '<p><a href="'+fileUrl+'" >'+fileName+'</a></p><br>'
												    }

												    console.log('returnUrl:'+ returnURLs)
												    console.log(emailArr)

												    gmail.users.messages.trash({
														auth: auth,
														userId: 'me',
														id:message.id
													}, function(err, deleted){
														if (err) {
															console.log('The API delete returned an error: ' + err);
															return;
														}
														console.log('----------')
														console.log(JSON.stringify(deleted, null, 4))
													})

												    db.user.findAll({
														where:{
															email: {
																$in:emailArr
															}
														}
													}).then(function(users){

														console.log(JSON.stringify(users, null, 4))
														users.forEach(function(user){
															console.log(user.id)
															db.mainPost.create({
															postText:returnURLs,
															postTo:"Private",
															postToValue:'Private',
															userId:user.id,
															include:'',
															exclude:''
															}).then(function(post){
																var userFeed = new UserFeed(post.id, user.id, 'New', user.id,
																 'New attachment arrived from an Email Server', 'active')

																db.userFeed.create(userFeed).then(function(created){
																	// console.log('pushUserId: '+JSON.stringify(pushUserId, null, 4))
																	// showNotification(user.id, post)

																})
															})
														})
														
													})
												})
											})
										}
									})
								}
							}

						})	

					})
				}
				
			});
			

			historyId = JSON.parse(new Buffer(message.data, 'base64').toString()).historyId
			// "Ack" (acknowledge receipt of) the message
			message.ack();
			console.log('after hisId:'+historyId)
			
			// var getPageOfHistory = function(request, result) {
			// 	request(function(resp) {
			// 		result = result.concat(resp.history);
			// 		var nextPageToken = resp.nextPageToken;
			// 		if (nextPageToken) {
			// 			request = gmail.users.history.list({
			// 				auth:auth,
			// 				userId: 'me',
			// 				startHistoryId: historyId,
			// 				pageToken: nextPageToken
			// 			});
			// 			getPageOfHistory(request, result);
			// 		} else {
			// 			console.log(JSON.stringify(request, null, 4))
			// 		}
			// 	});
			// };
			
			// getPageOfHistory(request, []);
		};

		// Listen for new messages until timeout is hit
		subscription.on(`message`, messageHandler);
		// setTimeout(() => {
		//   subscription.removeListener('message', messageHandler);
		//   console.log(`${messageCount} message(s) received.`);
		// }, 10 * 1000);

		console.log('getting Push from WKO')
			// console.log(JSON.stringify(res, null, 4))
	})
}



router.post('/oauth2Client', function(req, res){
	var command = req.body.command
	var authCode = req.body.authCode
	
	var SCOPES = ['https://mail.google.com/']
	var token_dir = './gmailAPIToken.json'
	console.log(token_dir)

	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		}
		var credentials = JSON.parse(content)
		var clientSecret = credentials.installed.client_secret;
		var clientId = credentials.installed.client_id;
		var redirectUrl = credentials.installed.redirect_uris[0];

		console.log(clientSecret)

		var auth = new googleAuth()
		var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

		var authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES
		});

		if(command === 'getTokenLink'){
			res.json({
				authUrl:authUrl
			})
		}else{
			oauth2Client.getToken(authCode, function(erorr, token) {
				if (erorr) {
					console.log('Error while trying to retrieve access token', erorr);
					res.json({
						error:"Error while trying to retrieve access token. Please try again"
					})
				}
				oauth2Client.credentials = token;

				// fs.mkdirSync(token_dir)
				fs.writeFile(token_dir, JSON.stringify(token))
				// storeToken(token);
				// callback(oauth2Client);
				console.log('xxxxx')
				console.log(token)
				res.json({
					oauth2Client:oauth2Client
				})
			});
			
		}
		
	});

	
})

router.post('/postAttchmentToDB', function(req, res){
	var attachUrl = req.body.attachUrl
	var emailList = req.body.emailList
	console.log(JSON.stringify(emailList, null, 4))
	
	db.user.findAll({
		where:{
			email: {
				$in:emailList
			}
		}
	}).then(function(users){

		console.log(JSON.stringify(users, null, 4))
		users.forEach(function(user){
			console.log(user.id)
			console.log(+'-'+attachUrl)
			db.mainPost.create({
			postText:attachUrl,
			postTo:"Private",
			postToValue:'Private',
			userId:user.id,
			include:'',
			exclude:''
			}).then(function(post){
				var userFeed = new UserFeed(post.id, user.id, 'New', user.id,
				 'New attachment arrived from an Email Server', 'active')

				db.userFeed.create(userFeed).then(function(created){
					// console.log('pushUserId: '+JSON.stringify(pushUserId, null, 4))
					// showNotification(user.id, post)

				})
			})
		})
		
	})
	res.json(attachUrl)
})


function UserFeed(mainPostId, receivedUserId, notification, userId, notifText, type){
	this.mainPostId = mainPostId
	this.receivedUserId = receivedUserId
	this.status = type||'active',
	this.notification = notification|| 'new'
	this.userId = userId,
	this.notifText = notifText
}



	// db.mainPost.create({
	// 		postText:postText,
	// 		postTo:"Private",
	// 		postToValue:'Private',
	// 		userId:postUser.id,
	// 		include:userIncString,
	// 		exclude:userExcString,
	// }).then(function(post){
	// 	// console.log('post:'+JSON.stringify(post, null, 4))
	// 	var stringPostToValue = post.postToValue
	// 	if(post.postToValue != 'ALL'){
	// 		var arrayPostToValue = JSON.parse(stringPostToValue)
	// 	}
		
		
	// 	// console.log(JSON.stringify(user, null, 4))
	// 	var postTo = post.postTo
	// 	var include = post.include
	// 	if(postTo === 'Private'){
	// 		var bulkData = []
	// 		// console.log('typeof'+ typeof include)
	// 		var userFeed = new UserFeed(post.id, postUser.id, 'None', postUser.id, postUser.fullName + ' posted to ' + postTo +  ': ' + post.postText)
	// 		bulkData.push(userFeed)

	// 		if (filter ==="Include"){
	// 			userIncArray.forEach(function(id){
	// 				if(id!==curUserId){
	// 					var userFeed = new UserFeed(post.id, id, 'new',
	// 					curUserId, curUser.fullName + ' posted to you' +  ': ' + post.postText)
	// 					bulkData.push(userFeed)
	// 				}
	// 			})

	// 		}

	// 		// console.log('bulkData: '+JSON.stringify(bulkData, null, 4))
	// 			db.userFeed.bulkCreate(bulkData).then(function(created){
	// 				//check notification type and push in array pushUserId. Do not send notification for 'NONE'
	// 				var pushUserId = bulkData.map(function(data){
	// 					if(data.notification !== "None"){
	// 						return data.receivedUserId
	// 					}else{
	// 						return 0
	// 					}

	// 				})
	// 				// console.log('pushUserId: '+JSON.stringify(pushUserId, null, 4))
	// 				showNotification(pushUserId, post)
	// 			}).catch(function(e) {
	// 				console.log(e)
	// 				res.render('error', {
	// 					error: e.toString()
	// 				})
	// 			});


function getOauth2Client(callback) {
	
		var token_path = './gmailAPIToken.json'

		fs.readFile('client_secret.json', function processClientSecrets(err, content) {
			if (err) {
				console.log('Error loading client secret file: ' + err);
			}
			var credentials = JSON.parse(content)
			var clientSecret = credentials.installed.client_secret;
			var clientId = credentials.installed.client_id;
			var redirectUrl = credentials.installed.redirect_uris[0];


			var auth = new googleAuth()
			var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

			fs.readFile(token_path, function(err, token) {
				if (err) {
					console.log('Please go to setting to request new TOKEN')
					callback('error')
				} else {

					oauth2Client.credentials = JSON.parse(token);
					
					callback(oauth2Client)
				}
			});
		})

}





router.post('/sendEmail', function(req, res){

	// function encodedGmailBody(to, from, subject, message) {
	//     var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
	//         "MIME-Version: 1.0\n",
	//         "Content-Transfer-Encoding: 7bit\n",
	//         "to: ", to, "\n",
	//         "from: ", from, "\n",
	//         "subject: ", subject, "\n\n",
	//         message
	//     ].join('');
	//   }
	var raw = req.body.raw
	var encodedRaw = new Buffer(raw).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
	

			// var raw = encodedGmailBody('ngokhanhthien@yahoo.com','wkosolution@gmail.com', 'Test Send', 'This is test body')


	// var raw = req.body.raw
	getOauth2Client(sendMessage)
	function sendMessage(auth) {
	    gmail.users.messages.send({
	        auth: auth,
	        userId: 'me',
	        resource: {
	            raw: encodedRaw
	        }
	    }, function(err, response) {
	    	if (err) {
				console.log('The API Changed Label returned an error: ' + err);
				return;
			}
	        res.json(err || response)
	    });
	}

})
router.post('/changedEmailRead', function(req, res){
	var messageId = req.body.messageId
	getOauth2Client(getMailMessage)

	console.log('messageId:')
	console.log(messageId)
	console.log(JSON.stringify(messageId, null, 4))
	function getMailMessage(auth){	
		console.log(JSON.stringify(auth, null, 4))

		gmail.users.messages.modify({
			auth: auth,
			userId: 'me',
			removeLabelIds:['UNREAD'],
			id:messageId
		}, function(err, labelList){
			if (err) {
				console.log('The API Changed Label returned an error: ' + err);
				return;
			}

			res.json(labelList)
		})
	}
})

router.post('/trashEmail', function(req, res){
	var messageId = req.body.messageId
	getOauth2Client(deleteEmail)

	console.log('messageId:')
	console.log(messageId)
	console.log(JSON.stringify(messageId, null, 4))
	function deleteEmail(auth){	
		console.log(JSON.stringify(auth, null, 4))

		// gmail.users.messages.delete({
		// 	auth: auth,
		// 	userId: 'me',
		// 	id:messageId
		// }, function(err, labelList){
		// 	if (err) {
		// 		console.log('The API returned an error: ' + err);
		// 		return;
		// 	}

		// 	res.json(labelList)
		// })

		gmail.users.messages.trash({
			auth: auth,
			userId: 'me',
			id:messageId
		}, function(err, deleted){
			if (err) {
				console.log('The API delete returned an error: ' + err);
				return;
			}
			console.log('----------')
			console.log(JSON.stringify(deleted, null, 4))
			res.json(deleted)
		})
	}
})




router.post('/getEmailList', function(req, res){
	
	var nextPageToken = req.body.nextPageToken||false

	if (nextPageToken == false){
		getOauth2Client(getInitialList)
		function getInitialList(auth){
			console.log(auth)
			gmail.users.messages.list({
				auth: auth,
				userId: 'me',
				maxResults:'20',
				q:'in:INBOX'
			}, function(err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				console.log(response)
				var messageList = response.messages
				res.json({
					messages:messageList,
					nextPageToken:response.nextPageToken
				})

			})
		}

	}else{
		getOauth2Client(getMessages)
		function getMessages(auth){
			gmail.users.messages.list({
				auth: auth,
				userId: 'me',
				q:'in:INBOX',
				maxResults:'20',
				pageToken: nextPageToken
			}, function(err, response) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
				var messages = response.messages;
				console.log(JSON.stringify(messages,null,4))
				if (messages.length == 0) {
					console.log('No labels found.');
				} else {
					console.log('Messages:');
					res.json(messages)
				}
				
			});
		
		}
	}

	
})

router.post('/getEmailMessage', function(req, res){
	var messageId = req.body.id
	getOauth2Client(getMailMessage)
	function getMailMessage(auth){


		var getMessage = gmail.users.messages.get({
			auth: auth,
			userId: 'me',
			id:messageId
		}, function(err, message){
			if (err) {
				console.log('The API returned an error: ' + err);
				return;
			}
			res.json(message)
		})
	}
})



router.post('/getEmailAttachment', function(req, res){
	var messageId = req.body.messageId
	var attachId  = req.body.attachId
	console.log(attachId)
	console.log(messageId)
	getOauth2Client(getMessages)
	function getMessages(auth){
		gmail.users.messages.attachments.get({
			auth: auth,
			userId: 'me',
			id:attachId,
			messageId:messageId
		}, function(err, attachment) {
			if (err) {
				console.log('The API returned an error: ' + err);
				return;
			}

			res.json(attachment)
			
		});
		
	}
	
})


router.get('/', middleware.requireAuthentication, function(req, res) {
	var curUser = req.user;
	var postId = req.query.postId
	var command = req.query.command
	var curUserTitle = req.user.title;
	console.log(command)
	db.user.findOne({
		where:curUser.id,
		include:[{
			model:db.department
		}]
	}).then(function(curUser){
		res.render('notif/notifHome', {
			JSONdata: JSON.stringify({
				notif: 'notif',
				postId:postId,
				curUser:curUser,
				command:command
				
			})
		})

	})
	

})

router.post('/sharePostContain', middleware.requireAuthentication, function(req, res){
	var user = req.user
	
	var mainPostId = req.body.mainPostId
	
	db.mainPost.findOne({
		where:{
			id:mainPostId
		}
	}).then(function(mainPost){
		console.log('mainPostContain'+JSON.stringify(mainPost, null, 4))
		
		res.json(mainPost)
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});

	
})


router.post('/hidePost', middleware.requireAuthentication, function(req, res){
	var user = req.user
	
	var postId = req.body.mainPostId
	console.log('postId'+JSON.stringify(postId, null, 4))
	
	db.userFeed.update({
		status:'hidden'
	},{
		where:{
			mainPostId:postId,
			receivedUserId:user.id
			
		}
	}).then(function(userFeed){
		console.log('userFeed hidden'+JSON.stringify(userFeed, null, 4))
		
		res.json(userFeed)
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});

	
})

router.post('/getTagSave', middleware.requireAuthentication, function(req, res){
	var user = req.user
	console.log('user'+JSON.stringify(user, null, 4))
	db.department.findOne({
		where:{
			id:user.departmentId
		}
	}).then(function(department){
		console.log('department'+JSON.stringify(department, null, 4))
		return db.tagSave.findAll({
			// include:[{
			// 	model:db.mainPost,
			// 	attributes:[]
				
			// }],
			attributes:['tagName', 'type', 'mainPostId','category',
				[db.Sequelize.fn('MAX', db.Sequelize.col('id')), 'MAX']
			],
			group:[['tagName'],['category'],['type']]
			,
			
			where:{
				$or:[{
					type:department.name
				},{
					type:'Personal',
					userId:user.id
				}]
			},
			raw:true
		})
	}).then(function(tagSaves){
		console.log('tagSaves'+JSON.stringify(tagSaves, null, 4))
		
		res.json(tagSaves)
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});

	
})

router.post('/getTagToUnsave', middleware.requireAuthentication, function(req, res){
	var user = req.user
	
	var postId = req.body.postId
	console.log('postId'+JSON.stringify(postId, null, 4))
	
	db.tagSave.findAll({
				
		where:{
			mainPostId:postId
		}
	}).then(function(tagSaves){
		console.log('tagSaves'+JSON.stringify(tagSaves, null, 4))
		
		res.json(tagSaves)
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});

	
})


router.post('/unsaveTag', middleware.requireAuthentication, function(req, res){
	var user = req.user
	var body = _.pick(req.body, 'mainPostId','type', 'tagName', 'category')
	body.userId = user.id
	
	var postId = req.body.postId
	console.log('postId'+JSON.stringify(postId, null, 4))
	
	db.tagSave.destroy({
		where:{
			mainPostId:body.mainPostId,
			type:body.type,
			tagName:body.tagName,
			category:body.category,
			userId:body.userId
			
		}
	}).then(function(deleted){
		console.log('deleted'+JSON.stringify(deleted, null, 4))
		
		res.json(deleted)
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});

	
})

router.post('/postTagSave', middleware.requireAuthentication, function(req, res){
	var user = req.user
	var body = _.pick(req.body, 'mainPostId','type', 'tagName', 'category')
	body.userId = user.id
	// body.departmentId = user.departmentId
	console.log('postBody'+ JSON.stringify(body, null, 4))
	db.department.findOne({
		where:{
			id:user.departmentId
		}
	}).then(function(department){

		if(body.type === 'Department'){
			var type = department.name
		}else{
			var type = body.type
		}

		return [db.tagSave.findOrCreate({
			where:{
				mainPostId:body.mainPostId,
				type:type,
				tagName:body.tagName,
				category:body.category
				// userId:body.userId
			}
		}),type]
	}).spread(function(tagSaves, type){
		console.log(type)
		return [db.tagSave.update({
			userId:user.id
		},{
			where:{
				mainPostId:body.mainPostId,
				type:type,
				tagName:body.tagName,
				category:body.category
			}
		}),tagSaves[0]]

	}).spread(function(updated, tagSaves){
		console.log(JSON.stringify(tagSaves, null, 4))
		
		
		res.json(tagSaves)
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});
	
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
		res.json(groupList)
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
			// console.log(JSON.stringify(feedSetting, null, 4))
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
			// console.log(JSON.stringify(feedSetting, null, 4))
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
	var tagName = req.body.tagName
	var tagType = req.body.tagType
	var tagCategory = req.body.tagCategory
	var curUserId = req.user.id
	var loadNumber = req.body.loadNumber
	var limit = req.body.limit
	var viewOption = req.body.viewOption
	var byMe = req.body.byMe
	var byOther = req.body.byOther
	var viewOnly = req.body.viewOnly
	var postId = req.body.postId
	var sDate = new Date(req.body.sDate)
	var eDate = new Date(req.body.eDate)
	console.log('limit: '+ limit)
	console.log('loadNumber: '+ loadNumber)
	
	

	//set Post by me
	if(byMe==='true' && byOther !== 'true'){
		console.log('by me ')
			userIdPara = curUserId
	}else if(byOther==='true' && byMe !== 'true'){
		console.log('by other ')
		userIdPara = {
			$ne:curUserId

		}

	}else{
		// console.log('not by me nor other')
		userIdPara = {
			$gt:0
		}
	}


	var getFeedsPara = function(wherePara){
		return {
			attributes:['mainPostId'],
			where:{
				receivedUserId:curUserId,
				status: 'active'
			},
			include:[{
				model:db.mainPost,
				where:wherePara,
				include:[{
					model:db.user,
					attributes:['name', 'lastname','departmentId', 'title'],
					include:[{
						model:db.department,
						attributes:['name']
					}]		
				}]					

			}],
			order:[
				[db.mainPost, 'createdAt', 'DESC']
			],
			limit: limit,
			offset: loadNumber
		}
	}
	// console.log('lodingNumber: '+ loadNumber)
	if(tagName!== 'false'){
		console.log('tagname procless:'+tagName+tagType)
		if(tagType !== 'Personal'){
			var wherepara1 = {

				tagName:tagName,
				type:tagType,
				category:tagCategory
			
			}
		}else{
			var wherepara1 = {
				tagName:tagName,
				type:tagType,
				category:tagCategory,
				userId:curUser.id
			}
		}
		console.log('xxxxxxxxxx')
		console.log(sDate+ eDate)
		db.tagSave.findAll({
			attributes:['mainPostId'],
			where:wherepara1,
			include:[{
				model:db.mainPost,
				where:{
					createdAt:{
							$between:[sDate,eDate]
						}
				},
				include:[{
					model:db.user,
					attributes:['name', 'lastname','departmentId', 'title'],
					include:[{
						model:db.department,
						attributes:['name']
					}]		
				}]					

			}],
			order:[
				[db.mainPost, 'createdAt', 'DESC']
			],
			limit: 12,
			offset: loadNumber

		}).then(function(tagSaves){
			console.log('tagSaves:' + JSON.stringify(tagSaves, null, 4))
			var posts = tagSaves.map(function(tagSaves){
						return tagSaves.mainPost
					})
			res.json({posts:posts})
			console.log('posts:' + JSON.stringify(posts, null, 4))
		})
	}else{
		//Retrieving default feedSetting
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
			// console.log(feedSetting.value)
			if(postId !== 'false'){
				
				db.userFeed.findAll(
					getFeedsPara({
						$or:[{
							id:postId
						}]
						
					})
				).then(function(userFeeds){
					var posts = userFeeds.map(function(userFeed){
						return userFeed.mainPost
					})
					
					console.log('postsXC:' + JSON.stringify(posts, null, 4))
					res.json({posts:posts})
				}).catch(function(e) {
					console.log(e)	
					res.render('error', {
					error: e.toString()
					})
				})
			}else if(feedSetting.value==='Private'){
				
				db.userFeed.findAll(
					getFeedsPara({
						createdAt:{
							$between:[sDate,eDate]
						},
						$or:[{
								postTo:{
									$in:['Private']
								}
								// userId:userIdPara
							
							},{
								include:{
									$or:[{
										$like:'%['+curUserId+']%'},{
										$like:'%['+curUserId+',%'},{
										$like:'%,'+curUserId+',%'},{
										$like:'%,'+curUserId+',%'
									}]
								},
								userId:userIdPara

							}
						]
					})
				).then(function(userFeeds){
					var posts = userFeeds.map(function(userFeed){
						return userFeed.mainPost
					})
					// console.log('posts:' + JSON.stringify(posts, null, 4))
					res.json({posts:posts})
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
					error: e.toString()
					})
				})
			}else if(feedSetting.value==='WorkGroup'){
				if(viewOnly!=='true'){
					var filter = getFeedsPara({
						createdAt:{
							$between:[sDate,eDate]
						},
						$or:[{
								postTo:{
									$in:['Private']
								},
								userId:userIdPara
							},{
								postTo: 'WorkGroup',
								userId:userIdPara
							}
						]
					})
				}else{
					var filter = getFeedsPara({
						postTo:'WorkGroup',
						userId:userIdPara
					})
				}
				db.userFeed.findAll(filter).then(function(userFeeds){
					var posts = userFeeds.map(function(userFeed){
						return userFeed.mainPost
					})
					// console.log('posts:' + JSON.stringify(posts, null, 4))
					res.json({posts:posts})
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
					error: e.toString()
					})
				})

			}else if(feedSetting.value==='Coworker'){
				

				if(viewOnly!=='true'){
					
					console.log('sDate'+ sDate + eDate)
					var filter = getFeedsPara({
						//if db field is fulldate, use New Date to feed into sequelize date filtering
						createdAt:{
							$between:[sDate,eDate]
						},
						$or:[{
								postTo:{
									$in:['Private', 'Coworker']
								},
								userId:userIdPara
							},{
								postTo:'WorkGroup',
								userId:userIdPara
							},{
								include:{
									$or:[{
										$like:'%['+curUserId+']%'},{
										$like:'%['+curUserId+',%'},{
										$like:'%,'+curUserId+',%'},{
										$like:'%,'+curUserId+',%'
									}]
								},
								userId:userIdPara

							}
						],
						exclude:{
							$notLike:'%'+curUserId+'%'
						}
					})
				}else{
					var filter = getFeedsPara({
						createdAt:{
							$between:[sDate,eDate]
						},
						postTo:{
							$in:['Coworker']
						}
						,
						userId:userIdPara
					})
				}
				
				db.userFeed.findAll(filter).then(function(userFeeds){
					var posts = userFeeds.map(function(userFeed){
						return userFeed.mainPost
					})
					// console.log('posts:' + JSON.stringify(posts, null, 4))
					res.json({posts:posts})
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
					error: e.toString()
					})
				})

				
			}else if(feedSetting.value==='Colleague'){
				if(viewOnly!=='true'){
					console.log(userIdPara)
					var filter = getFeedsPara({
						createdAt:{
							$between:[sDate,eDate]
						},
						$or:[{
								postTo:{
									$in:['Private', 'Coworker', 'Colleague']
								},
								userId:userIdPara
							},{
								postTo:'WorkGroup',
								userId:userIdPara
							},{
								include:{
									$or:[{
										$like:'%['+curUserId+']%'},{
										$like:'%['+curUserId+',%'},{
										$like:'%,'+curUserId+',%'},{
										$like:'%,'+curUserId+',%'
									}]
								},
								userId:userIdPara

							}
						]
					})
				}else{
					var filter = getFeedsPara({
						createdAt:{
							$between:[sDate,eDate]
						},
						postTo:{
							$in:['Colleague']
						},
						userId:userIdPara
					})
				}
				
				db.userFeed.findAll(filter).then(function(userFeeds){
					var posts = userFeeds.map(function(userFeed){
						return userFeed.mainPost
					})
					// console.log('posts:' + JSON.stringify(posts, null, 4))
					res.json({posts:posts})
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
					error: e.toString()
					})
				})

				
			
			}else if(feedSetting.value==='Coworker of Colleague'){
				if(viewOnly!=='true'){
					var filter = getFeedsPara({
						createdAt:{
							$between:[sDate,eDate]
						},
						$or:[{
								postTo:{
									$in:['Private', 'Coworker', 'Colleague', 'Coworker of Colleague']
								},
								userId:userIdPara
							},{
								postTo:'WorkGroup',
								userId:userIdPara
							},{
								include:{
									$or:[{
										$like:'%['+curUserId+']%'},{
										$like:'%['+curUserId+',%'},{
										$like:'%,'+curUserId+',%'},{
										$like:'%,'+curUserId+',%'
									}]
								},
								userId:userIdPara

							}
						]
					})
				}else{
					var filter = getFeedsPara({
						createdAt:{
							$between:[sDate,eDate]
						},
						postTo:{
							$in:['Coworker of Colleague']
						},
						userId:userIdPara
					})
				}
				
				db.userFeed.findAll(filter).then(function(userFeeds){
					var posts = userFeeds.map(function(userFeed){
						return userFeed.mainPost
					})
					// console.log('posts:' + JSON.stringify(posts, null, 4))
					res.json({posts:posts})
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
					error: e.toString()
					})
				})
				
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
					// console.log('friend Group:'+JSON.stringify(groups, null, 4))
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
						
						// console.log('colleagueUserIds: '+JSON.stringify(colleagueUserIds, null, 4))
						// console.log('coworkerUserIds: '+JSON.stringify(coworkerUserIds, null, 4))
					
					

						// console.log('coworkerofColleagueUserIds: '+JSON.stringify(coworkerofColleagueUserIds, null, 4))
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
	}//end if for tagName processing
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
function UserFeed(mainPostId, receivedUserId, notification, userId, notifText, type){
	this.mainPostId = mainPostId
	this.receivedUserId = receivedUserId
	this.status = type||'active',
	this.notification = notification|| 'new'
	this.userId = userId,
	this.notifText = notifText
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

router.post('/getUserPostFilter', middleware.requireAuthentication, function(req, res) {
	var userPostFilter = req.body.userPostFilter
	var curUserId = req.user.id
	db.group.findOne({
		where:{
			groupBLUserId:curUserId
		}
	}).then(function(group){
		db.user.findAll({
			include:[{
				model:db.group,
				where:{
					id:group.id
				},
				through:{
					where:{
						status:userPostFilter
						
					}
				}
			}, {
				model:db.department
			}]
		}).then(function(groups){
			console.log('groups:'+JSON.stringify(groups, null, 4))
			var usersPostfilter = groups.map(function(group){
				return {fullName:group.fullName, id:group.id, department:group.department.name}

			})
			
			console.log('usersPostfilter:'+JSON.stringify(usersPostfilter, null, 4))
			res.json({usersPostfilter:usersPostfilter})
		})
	})


})


router.post('/post', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	var curUser = req.user
	var postText = req.body.postText
	var postTo = req.body.postTo
	var postToValue = req.body.postToValue
	var filter = req.body.filter
	var userArray = req.body.userArray
	var shareOriginalUserId = req.body.shareOriginalUserId
	var userIncString = ""
	var userExcString =""

	console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbb')
	if (filter ==="Include"){
		userIncString= userArray
		userIncArray = JSON.parse(userIncString)
	}
	
	console.log('userArray:'+JSON.stringify(userArray, null, 4))
	console.log('shareOriginalUserId:'+JSON.stringify(shareOriginalUserId, null, 4))
	if(shareOriginalUserId!== undefined){
		var postUserId = shareOriginalUserId
	}else{
		var postUserId = curUserId
	}
	db.user.findOne({
		where:{
			id:postUserId
		}

	}).then(function(postUser){
		return [db.mainPost.create({
			postText:postText,
			postTo:postTo,
			postToValue:postToValue,
			// storageLink:storageLink,
			userId:postUser.id,
			include:userIncString,
			exclude:userExcString,
		}), postUser]

	}).spread(function(post, postUser){
		// console.log('post:'+JSON.stringify(post, null, 4))
		var stringPostToValue = post.postToValue
		if(post.postToValue != 'ALL'){
			var arrayPostToValue = JSON.parse(stringPostToValue)
		}
		
		
		// console.log(JSON.stringify(user, null, 4))
		var postTo = post.postTo
		var include = post.include
		if(postTo === 'Private'){
			var bulkData = []
			// console.log('typeof'+ typeof include)
			var userFeed = new UserFeed(post.id, postUser.id, 'None', postUser.id, postUser.fullName + ' posted to ' + postTo +  ': ' + post.postText)
			bulkData.push(userFeed)

			if (filter ==="Include"){
				userIncArray.forEach(function(id){
					if(id!==curUserId){
						var userFeed = new UserFeed(post.id, id, 'new',
						curUserId, curUser.fullName + ' posted to you' +  ': ' + post.postText)
						bulkData.push(userFeed)
					}
				})

			}

			// console.log('bulkData: '+JSON.stringify(bulkData, null, 4))
				db.userFeed.bulkCreate(bulkData).then(function(created){
					//check notification type and push in array pushUserId. Do not send notification for 'NONE'
					var pushUserId = bulkData.map(function(data){
						if(data.notification !== "None"){
							return data.receivedUserId
						}else{
							return 0
						}

					})
					// console.log('pushUserId: '+JSON.stringify(pushUserId, null, 4))
					showNotification(pushUserId, post)
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
						error: e.toString()
					})
				});
		}else if(postTo.indexOf('WorkGroup') !== -1){
			console.log('WorkGroup...'+ curUserId)
			var bulkData = []
			var workGroupIds = []
			if(!arrayPostToValue.some(isNaN)){

				var userFeed = new UserFeed(post.id, postUser.id, 'None',
						postUser.id, postUser.fullName + ' posted to ' + postTo +  ': ' + post.postText)
				bulkData.push(userFeed)

				arrayPostToValue.forEach(function(id){
					
					var userFeed = new UserFeed(post.id, id, 'new',
					postUser.id, postUser.fullName + ' posted ' + post.postText)
					bulkData.push(userFeed)
					
				})
				// console.log('bulkData: '+JSON.stringify(bulkData, null, 4))

				db.userFeed.bulkCreate(bulkData).then(function(created){
					//check notification type and push in array pushUserId. Do not send notification for 'NONE'
					var pushUserId = bulkData.map(function(data){
						if(data.notification !== "None"){
							return data.receivedUserId
						}else{
							return 0
						}

					})
					// console.log('pushUserId: '+JSON.stringify(pushUserId, null, 4))
					showNotification(pushUserId, post)
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
						error: e.toString()
					})
				});
			}else{
			
				
				db.userGroups.findAll({
						where:{
							status:{
								$in:arrayPostToValue
							}
						}
				}).then(function(userGroups){
					// console.log('friend Group:'+JSON.stringify(userGroups, null, 4))
					
					
					//add id of owner of post for notification
					workGroupIds.push(curUserId)
					var userFeed = new UserFeed(post.id, postUser.id, 'None', postUser.id, 
					postUser.fullName + ' posted to ' + postTo +  ': ' + post.postText)
					bulkData.push(userFeed)
					userGroups.forEach(function(userGroup, i){
						if (workGroupIds.indexOf(userGroup.userId)===-1){
							workGroupIds.push(userGroup.userId)
							var userFeed = new UserFeed(post.id, userGroup.userId, 'new', postUser.id, 
							postUser.fullName + ' posted to ' + postTo +  ': ' + post.postText)
							bulkData.push(userFeed)
						}
					})
					// console.log('bulkData: '+JSON.stringify(bulkData, null, 4))
					return db.userFeed.bulkCreate(bulkData)
				}).then(function(created){
					var pushUserId = bulkData.map(function(data){
						if(data.notification !== "None"){
							return data.receivedUserId
						}else{
							return 0
						}

					})
					// console.log('pushUserId: '+JSON.stringify(pushUserId, null, 4))
					showNotification(pushUserId, post)
				}).catch(function(e) {
					console.log(e)
					res.render('error', {
						error: e.toString()
					})
				});
			}


		} else if(postTo === 'Coworker'){
			console.log('Coworker...')
			var coworkerIds = []
			var bulkData = []
			if(stringPostToValue !== 'ALL'){
				console.log('!ALL')
				var groupBLUserIdPara = {
					$in:arrayPostToValue
				}
			}else{
				console.log('ALL')
				var groupBLUserIdPara = {
					$ne:0
				}
			}
			

			db.group.findAll({
				where:{
					groupBLUserId:groupBLUserIdPara
				},
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
			}).then(function(groups){
				// console.log('friend Group:'+JSON.stringify(groups, null, 4))

				var userFeed = new UserFeed(post.id, 
				postUser.id, 'None', postUser.id, 
				postUser.fullName + ' posted '+ post.postText)
				bulkData.push(userFeed)
				groups.forEach(function(group, i){
						// coworkerIds.push(group.groupBLUserId)
						var userFeed = new UserFeed(post.id, 
							group.groupBLUserId, 'new', postUser.id, 
							postUser.fullName + ' posted '+ post.postText)
					bulkData.push(userFeed)
				})
				if (filter ==="Include"){
					userIncArray.forEach(function(id){
						var userFeed = new UserFeed(post.id, id, 'new',
						curUserId, curUser.fullName + ' include you in a post to coworkers' +  ': ' + post.postText)
						bulkData.push(userFeed)
					})
				}
				// console.log('coworkerIds: '+JSON.stringify(coworkerIds, null, 4))
				// console.log('bulkData: '+JSON.stringify(bulkData, null, 4))
				return db.userFeed.bulkCreate(bulkData)
			}).then(function(created){
				//check notification type and push in array pushUserId. Do not send notification for 'NONE'
				var pushUserId = bulkData.map(function(data){
					if(data.notification !== "None"){
						return data.receivedUserId
					}else{
						return 0
					}

				})
				// console.log('pushUserId: '+JSON.stringify(pushUserId, null, 4))
				showNotification(pushUserId, post)
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
		} else if(postTo === 'Colleague'){
			console.log('Colleague...')
			var bulkData = []
			if(stringPostToValue !== 'ALL'){
				console.log('!ALL')
				var groupBLUserIdPara = {
					$in:arrayPostToValue
				}
			}else{
				console.log('ALL')
				var groupBLUserIdPara = {
					$ne:0
				}
			}

			db.group.findAll({
				where:{
					groupBLUserId:groupBLUserIdPara
				},
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
			}).then(function(groups){
				// console.log('friend Group:'+JSON.stringify(groups, null, 4))
				
				var userFeed = new UserFeed(post.id, 
				postUser.id, 'None', postUser.id, 
				postUser.fullName + ' posted '+ post.postText)
				bulkData.push(userFeed)

				groups.forEach(function(group, i){
					if (group.users[0].userGroups.status === 'Coworker'){
						// colleagueIds.push(group.groupBLUserId)
						var userFeed = new UserFeed(post.id, 
							group.groupBLUserId, 'new', postUser.id, 
							postUser.fullName + ' posted '+ post.postText)
					
					}else if (group.users[0].userGroups.status === 'Colleague'){
						// colleagueIds.push(group.groupBLUserId)
						var userFeed = new UserFeed(post.id, 
							group.groupBLUserId, 'new', postUser.id, 
							postUser.fullName + ' posted '+ post.postText)
					}
					bulkData.push(userFeed)
				
				})
				// console.log('colleagueIds: '+JSON.stringify(colleagueIds, null, 4))
				// console.log('coworkerIds: '+JSON.stringify(coworkerIds, null, 4))
				// console.log('bulkData: '+JSON.stringify(bulkData, null, 4))
				return db.userFeed.bulkCreate(bulkData)
			}).then(function(created){
				//check notification type and push in array pushUserId. Do not send notification for 'NONE'
				var pushUserId = bulkData.map(function(data){
					if(data.notification !== "None"){
						return data.receivedUserId
					}else{
						return 0
					}

				})
				console.log('pushUserId: '+JSON.stringify(pushUserId, null, 4))
				showNotification(pushUserId, post)
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
		} else if(postTo === 'Coworker of Colleague'){
			console.log('Coworker of Colleague...')
			var colleagueIds = []
			var bulkData = []
			if(stringPostToValue !== 'ALL'){
				console.log('!ALL')
				var groupBLUserIdPara = {
					$in:arrayPostToValue
				}
			}else{
				console.log('ALL')
				var groupBLUserIdPara = {
					$ne:0
				}
			}

			db.group.findAll({
				where:{
					groupBLUserId:groupBLUserIdPara
				},
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
			}).then(function(groups){
				// console.log('friend Group:'+JSON.stringify(groups, null, 4))
				// var coworkerIds = []
				var colleagueGroupIds = []
				var userFeed = new UserFeed(post.id, 
				curUserId, 'None', curUserId, 
				curUser.fullName + ' posted '+ post.postText)
				bulkData.push(userFeed)

				

				groups.forEach(function(group, i){
					group.users[0].userGroups.status === 'Colleague'?
					colleagueGroupIds.push(group.id):""
					// console.log('colleagueGroupIds: '+JSON.stringify(colleagueGroupIds, null, 4))

					if (group.users[0].userGroups.status === 'Coworker'){
						colleagueIds.push(group.groupBLUserId)
						var userFeed = new UserFeed(post.id, 
							group.groupBLUserId, 'new', postUser.id, 
							postUser.fullName + ' posted '+ post.postText)
					
					}else if (group.users[0].userGroups.status === 'Colleague'){
						colleagueIds.push(group.groupBLUserId)
						var userFeed = new UserFeed(post.id, 
							group.groupBLUserId, 'new', postUser.id, 
							postUser.fullName + ' posted '+ post.postText)
					}
					bulkData.push(userFeed)
				})

				return db.userGroups.findAll({
					where:{
						groupId:{
							$in:colleagueGroupIds
						},
						userId:{
							$notIn:[curUserId]
						},
						status:{
							$in:['Coworker']
						}
					}
				})
			}).then(function(userGroups){
				//adding userId of Coworker of Colleague to coworkerofColleagueUserIds Array
				var coworkerofColleagueUserIds = []
				userGroups.forEach(function(userGroup, i){
					//removing duplicate if exist
					if(coworkerofColleagueUserIds.indexOf(userGroup.userId)===-1){
						if(colleagueIds.indexOf(userGroup.userId)=== -1){
							coworkerofColleagueUserIds.push(userGroup.userId)
							var userFeed = new UserFeed(post.id, userGroup.userId, 'new', postUser.id, 
							postUser.fullName + ' posted to COWORKER OF COLLEAGUE: '+ post.postText)
							bulkData.push(userFeed)
						}
					}
					
				})
				
				// console.log('colleagueIds: '+JSON.stringify(colleagueIds, null, 4))
				// console.log('Coworker of Colleague bulkData: '+JSON.stringify(bulkData, null, 4))
				return db.userFeed.bulkCreate(bulkData)

			}).then(function(created){
				var pushUserId = bulkData.map(function(data){
					if(data.notification !== "None"){
						return data.receivedUserId
					}else{
						return 0
					}

				})
				// console.log('pushUserId: '+JSON.stringify(pushUserId, null, 4))
				showNotification(pushUserId, post)
			}).catch(function(e) {
				console.log(e)
				res.render('error', {
					error: e.toString()
				})
			});
		}
		

		res.json({
			post:post,
			user:postUser
			
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
	var commentUser = req.user
	var commentUserId = req.user.id
	var comment = req.body.comment
	var mainPostId = req.body.mainPostId
	console.log(mainPostId+"--"+comment+'--'+commentUserId)
	// console.log(typeOf dfsdf)
	db.comment.create({
		comment:comment,
		reaction:'',
		userId:commentUserId,
		mainPostId:mainPostId
	}).then(function(comment){
		console.log(JSON.stringify(comment, null, 4))
		db.mainPost.findOne({
			where:{
				id:mainPostId
			}
		}).then(function(mainPost){
			
			db.userFeed.findAll({
				attributes:[db.Sequelize.literal('DISTINCT `receivedUserId`'),'receivedUserId'],
				where:{
					mainPostId:mainPostId
				}
			}).then(function(notifications){

				console.log('notifications: '+JSON.stringify(notifications, null, 4))
				var notificationIds = notifications.map(function(notification){
						return	notification.receivedUserId
				})
			
				var bulkData = []
				// //push NEW commenter userId into the array to get included into converstation
				// if(notificationIds.indexOf(commentUserId) === -1){
				// 	notificationIds.push(commentUserId)
				// }
				notificationIds.forEach(function(notificationId, i){
					if(notificationId !== commentUserId){
						var commentDescription = (notificationId ===mainPost.userId)? ' your post :':' a post that you are in: '
						var userFeed = new UserFeed(mainPostId, 
							notificationId, 'new', commentUserId, 
							commentUser.fullName + ' commented on' + commentDescription+ comment.comment, 'comment')
						bulkData.push(userFeed)
					}
				})
				console.log('bulkData: '+JSON.stringify(bulkData, null, 4))
				return db.userFeed.bulkCreate(bulkData)
				res.json({
					comment:comment
				})
			})
		})
	}).catch(function(e) {
		console.log(e)
		res.render('error', {
			error: e.toString()
		})
	});

})


function emojToText(commentEmoj){
	var emojText;
	switch(commentEmoj){
		case 'glyphicon glyphicon-thumbs-up':
		emojText = ' likes '
		break;
		case 'glyphicon glyphicon-thumbs-down':
		emojText = ' dislikes '
		break;
		case 'glyphicon glyphicon-heart':
		emojText = ' loves '
		break;
		case 'glyphicon glyphicon-star':
		emojText = ' give a star to '
		break;
		case 'glyphicon glyphicon-remove-sign':
		emojText = ' denies '
		break;
	}


	return emojText

}

router.post('/addPostEmoj', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	var commentUser = req.user
	var commentUserId = req.user.id
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
		console.log("mainPostuserId"+JSON.stringify(comment, null, 4))
		db.userFeed.findAll({
			attributes:['receivedUserId'],
			where:{
				mainPostId:mainPostId
			}
		}).then(function(notifications){
			db.mainPost.findOne({
				where:{
					id:mainPostId
				}
			}).then(function(mainPost){
				console.log('notifications: '+JSON.stringify(notifications, null, 4))
				var notificationIds = notifications.map(function(notification){
						return	notification.receivedUserId
				})
			
				var bulkData = []
				// //push NEW commenter userId into the array to get included into converstation
				// if(notificationIds.indexOf(commentUserId) === -1){
				// 	notificationIds.push(commentUserId)
				// }
				
			
			
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
						notificationIds.forEach(function(notificationId, i){
							if(notificationId !== commentUserId){
								var emojDescription = (notificationId ===mainPost.userId)? ' your post ':'a post that you are in '
								var userFeed = new UserFeed(mainPostId, 
									notificationId, 'new', commentUserId, 
									commentUser.fullName + emojToText(commentEmoj) + emojDescription, 'emoj')
								bulkData.push(userFeed)
							}
						})
						console.log('bulkData: '+JSON.stringify(bulkData, null, 4))
						return db.userFeed.bulkCreate(bulkData)

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
						notificationIds.forEach(function(notificationId, i){
							if(notificationId !== commentUserId){
								var emojDescription = (notificationId ===mainPost.userId)? ' your post ':'a post that you are in '
								var userFeed = new UserFeed(mainPostId, 
									notificationId, 'new', commentUserId, 
									commentUser.fullName + emojToText(commentEmoj) + emojDescription, 'emoj')
								bulkData.push(userFeed)
							}
						})
						console.log('bulkData: '+JSON.stringify(bulkData, null, 4))
						return db.userFeed.bulkCreate(bulkData)

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
	// db.userGroups.findAll({ 
	// 	where:{
	// 		userId:curUserId,
	// 		status: {
	// 			$like:'WorkGroup%'
	// 		}
	// 	}
		
	// })
	db.group.findAll({
				include:[{
					// attributes:['userGroup'],
					model:db.user,
					where:{
						id:curUserId
					},
					through:{
						where:{
							status:{
								$like:'WorkGroup%'
							}	
						}
					}
				}]
			}).then(function(userGroups) {

 	 	
 	 	console.log(JSON.stringify(userGroups, null, 4))
		res.json({userGroups:userGroups})
	})

})

router.post('/getNewNotif', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	db.userFeed.findAll({ 
		where:{
			receivedUserId:curUserId,
			notification:{
				$not:'None'
			}
		},
		include:[{
			model:db.mainPost
		}]
		,
		order:[ 
			['createdAt', 'DESC']
		],
		limit: 100
		
	}).then(function(userFeeds) {

 	 	
 	 	console.log(JSON.stringify(userFeeds, null, 4))
		res.json({userFeeds:userFeeds})
	})

})
router.post('/getNewNotifCount', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	db.userFeed.count({ 
		where:{
			receivedUserId:curUserId,
			notification: 'new' 
		}
		
	}).then(function(userFeedCount) {

 	 	
 	 	console.log('countttt'+JSON.stringify(userFeedCount, null, 4))
		res.json({userFeed:userFeedCount})
	})

})

router.post('/clearNewNotif', middleware.requireAuthentication, function(req, res) {
	var curUserId = req.user.id
	db.userFeed.update({
			notification:'viewed'
		},{
			where:{
			receivedUserId:curUserId,
			notification: 'new' 
			}
	}).then(function(updated) {

 	 	
 	 	console.log('updated'+JSON.stringify(updated, null, 4))
		res.json({updated:updated})
	})

})

router.post('/viewedNotif', middleware.requireAuthentication, function(req, res) {
	var userFeedId = req.body.userFeedId
	var curUserId = req.user.id
	db.userFeed.update({
			notification:'read'
		},{
			where:{
			id:userFeedId,
			notification:'viewed'
			}
	}).then(function(updated) {

 	 	
 	 	console.log('updatedviewed'+JSON.stringify(updated, null, 4))
		res.json({updated:updated})
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