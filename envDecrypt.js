var cryptojs = require('crypto-js');

var mkey = process.env.mkey
var envdata = process.env.data
var processEnv = {}


var key = cryptojs.AES.decrypt(envdata, mkey).toString(cryptojs.enc.Utf8)
	console.log("Key List:")
	var keyArray = key.split(',')
	
	keyArray.forEach(function(item, i){
		
		var key = item.slice(0, item.indexOf('='))
		var value = item.slice(item.indexOf('=')+1)
		console.log(i + ')'+key)
		processEnv[key] = value

	})
 module.exports = processEnv