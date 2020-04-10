var express = require('express');
var router = express.Router();
var db = require('../db.js');
var pgdb = require('pg')
var moment = require('moment');
var _ = require('underscore');
var processEnv = require('../envDecrypt.js')
var crypto = require('crypto');
const rpromise = require('request-promise')

var middleware = require('../middleware.js')(db);

const CoinbasePro = require('coinbase-pro');



const apiKey = processEnv.apiKeyCoinB;
const apiSecret = processEnv.apiSecretCoinB;
const passphrase= processEnv.passphraseCoinB;
const apiURI = 'https://api.pro.coinbase.com';
const sandboxURI = 'https://api-public.sandbox.pro.coinbase.com';


const authedClient = new CoinbasePro.AuthenticatedClient(
	apiKey,
	apiSecret,
	passphrase,
	apiURI
  );





// authedClient.getOrder('06be2fc9-9f30-430d-8dcf-9b67883e09f3',(err, res, orders) =>{
// 	console.log('get id ordersxxxxxxx: ' + JSON.stringify(orders, null, 4))

// })

async function coinAPI (method, path, body){

	//get unix time in seconds
	var timestamp = Math.floor(Date.now() / 1000);

	// set the parameter for the request message
	// var body = JSON.stringify({
	// 	price: "5000",
	// 	size: "0.001",
	// 	side: "buy",
	// 	product_id: "BTC-USD"
	// })
	
	if (method == 'POST'){
		var req = {
			method: method,
			path: path,
			body: body
		};

	}else{
		var req = {
			method: method,
			path: path,
			body: ''
		};

	}
	



	var message = timestamp + req.method + req.path + req.body;
	// console.log('messagexxxxxxxx')
	// console.log(message)

	var key = Buffer(apiSecret, 'base64');

	var hmac = crypto.createHmac('sha256', key);

	//create a hexedecimal encoded SHA256 signature of the message
	var signature = hmac.update(message).digest('base64');



	//create the request options object
	var options = {
		baseUrl: apiURI,
		url: req.path,
		method: req.method,
		headers: {
			'CB-ACCESS-SIGN': signature,
			'CB-ACCESS-TIMESTAMP': timestamp,
			'CB-ACCESS-KEY': apiKey,
			'CB-ACCESS-PASSPHRASE': passphrase,
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
		}
	};
	try{
		let response = await rpromise(options)
		var result = JSON.parse(response)
	}catch(err){
		console.log(err.message)
	}
	
		// if (err) console.log('error' + err);
	
	

	
	
	
	return result
}

	


const websocket = new CoinbasePro.WebsocketClient(
	['BTC-USD'],
	'wss://ws-feed.pro.coinbase.com',
	{
		  key: apiKey,
		  secret: apiSecret,
		  passphrase: passphrase,
	}
	,
	{ channels: [  'heartbeat'] }
);

websocket.on('open', data => {
	console.log("openxxxxxxxxxxxxxxxxxxxx")
	websocket.unsubscribe({ channels: ['heartbeat'] });
	websocket.subscribe({ product_ids: ['BTC-USD'], channels: ['ticker', 'user'] });
	
  });
var price 
var buyPrice
var openBuyOrderSize
var stopPrice
var limitPrice
var openBuyOrder

var fillOrder = {
	id:'',
	status:''
}
var filledOrder = {
	id:'',
	price:0,
	size:0,
	trailStop: false

}

let currentTime  = 0

let preTime  = 0
let deltaTime = 0
let culTime = 0

// websocket.subscribe({channels:['full']}) 
const websocketData = (data) =>{
	currentTime = coinAPI('GET', '/time').then((result)=>{
		currentTime = result.epoch
		deltaTime = currentTime - preTime
		// console.log('Delta Time: ' + JSON.stringify(deltaTime, null, 4))
		culTime = culTime + deltaTime
		// console.log('Cultime: ' + JSON.stringify(culTime, null, 4))
		preTime = currentTime

		if (culTime >= 0.5){
			if (data.type === 'ticker'){
				price = data.price
				console.log('Price: ' + JSON.stringify(price, null, 4))
		
				
				authedClient.getOrders((err, res, orders) =>{
					if (orders !== undefined ){
						//if open order exist
						if(orders.length != 0 && fillOrder.id == ''){
							openBuyOrder = orders.filter(obj => {
								return obj.side === 'buy'
							})

							// filledOrder = orders.filter(obj => 
							// 	obj.status === 'done' && obj.id == filledOrder.id
							// )
		
							if (openBuyOrder.length != 0){
		
								fillOrder.id = openBuyOrder[0].id
								console.log('buy order: ' + JSON.stringify(openBuyOrder[0], null, 4))
							}
						}else if (orders.length == 0 && fillOrder.id != ''){
							console.log('fillOrderssss:') 
							console.log(JSON.stringify(fillOrder.id, null, 4))
							authedClient.getFills({order_id: fillOrder.id}, function(err, res, data){
								
								if(data !== undefined){
									if(data.length == 0){
									fillOrder.id = ''
									console.log('cancel buy order')
									}else{
										var filled = data[0]
										console.log('get fills:')
										console.log(JSON.stringify(filled, null, 4))
										var params = {
											price: filled.price - 400,
											size: filled.size,
											side: 'sell',
											stop: 'loss',
											stop_price: filled.price - 400 + 10,
											product_id: 'BTC-USD'
										}
		
										console.log('params')
										console.log(JSON.stringify(params, null, 4))
							
										authedClient.placeOrder(params, function(err, res, data){
											console.log('placed limit order:')
											console.log(JSON.stringify(data, null, 4))
											// buyPrice = buyOrder.price
											// limitPrice = buyPrice - 400
											// stopPrice = limitPrice + 10
					
											// deltaPrice = price - buyPrice
											// console.log('Delta Price:' + deltaPrice)
											// if ( deltaPrice > 200){
											// 	console.log('exe stop loss')
											// }
											filledOrder.id = filled.order_id
											filledOrder.price = filled.price
											filledOrder.size = filled.size
											
										});
										fillOrder.id = ''
									}
								}
							})
						}
					} 
				})
				console.log('delta price:')
				console.log(price - filledOrder.price)
				console.log('filledOrder.id:')
				console.log(filledOrder.id)

				if(filledOrder.id != '' && price - filledOrder.price > 200){
					
					var params = {
						price: price -50,
						size: filledOrder.size,
						side: 'sell',
						stop: 'loss',
						stop_price: price - 50 + 5,
						product_id: 'BTC-USD'
					}

					console.log('params trailing stop')
					console.log(JSON.stringify(params, null, 4))
					coinAPI('DELETE', '/orders').then((result)=>{
						console.log("deleted xxxxxxxxxxxxxxxxx")
						console.log(JSON.stringify(result, null, 4))

						authedClient.placeOrder(params, function(err, res, data){
							console.log('placed trailing limit order:')
							console.log(JSON.stringify(data, null, 4))
	
							filledOrder.trailStop = true
							filledOrder.price = data.price + 50
							filledOrder.id = ''
													
						});
	
					})
					
				}

				if(filledOrder.trailStop == true && price - filledOrder.price > 20){
					var params = {
						price: price -50,
						size: filledOrder.size,
						side: 'sell',
						stop: 'loss',
						stop_price: price - 50 + 5,
						product_id: 'BTC-USD'
					}

					console.log('params trailing stop')
					console.log(JSON.stringify(params, null, 4))
					coinAPI('DELETE', '/orders').then((result)=>{
						console.log("deleted xxxxxxxxxxxxxxxxx")
						console.log(JSON.stringify(result, null, 4))

						authedClient.placeOrder(params, function(err, res, data){
							console.log('placed trailing limit order:')
							console.log(JSON.stringify(data, null, 4))
	
							filledOrder.trailStop = true
							filledOrder.price = data.price + 50
							
													
						});
	
					})

				}
			}
			culTime = 0	
		}

	})

	
	

	

	 
	
}


// authedClient.getOrders({status: 'open' }, (err, res, order) =>{
// 	console.log('Open order: ' + JSON.stringify(order, null, 4))
// })


websocket.on('message', websocketData);



//   websocket.subscribe({ product_ids: ['LTC-USD'], channels: ['ticker', 'user'] });
  websocket.on('error', err => {
	/* handle error */
  });
  websocket.on('close', () => {
	/* ... */
  });



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
			console.log("xxxxxxxxxxxxxxxxx")
			//'wss://ws-feed-public.sandbox.pro.coinbase.com'
			

			// coinAPI('DELETE', '/orders').then((result)=>{
			// 	console.log("deleted xxxxxxxxxxxxxxxxx")
			// 	console.log(JSON.stringify(result, null, 4))
			// })

		

			// coinAPI('GET', '/coinbase-accounts').then((result)=> {
			// 	console.log('xxxxxxxxxxxxxxxxxxx')
			// 	// console.log(JSON.stringify(result, null, 4))
			// 	var BTCAccount = result.find(function(item, i){
			// 		if(item.currency === 'BTC'){
			// 		index = i;
			// 		return i;
			// 		}
			// 	});
			// 	console.log('BTC')
			// 	console.log(JSON.stringify(BTCAccount, null, 4))
			// 	var USDAccount = result.find(function(item, i){
			// 		if(item.currency === 'USD'){
			// 		index = i;
			// 		return i;
			// 		}
			// 	});
			// }) 
			// coinAPI('POST', '/orders', params).then((result)=> {
			// 	console.log('orders xxxxxxxxxxxxxxxxxxx')
			// 	console.log(JSON.stringify(result, null, 4))
			// }) 
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

	var dbClient = new pgdb.Client(dbConn)

	
	var query = "CREATE TABLE test (id INT , username VARCHAR(255) , login INTEGER)"
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