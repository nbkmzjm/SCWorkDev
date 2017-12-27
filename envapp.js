
var fs = require('fs');
var readline = require('readline');
var cryptojs = require('crypto-js');
var dotenv = require('dotenv').config()

var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})
var mkey = process.env.mkey
var data = process.env.data



function keyList(encrytedKey){


	var key = cryptojs.AES.decrypt(encrytedKey, mkey).toString(cryptojs.enc.Utf8)
	console.log("Key List:")
	var keyArray = key.split(',')

	keyArray.forEach(function(key, i) {
		console.log(i + " - " + key)
	})

	return key
	

}


function addKey(){
	
	rl.question('Please ADD key:value entry OR enter numeric value > 0 according to key list to DELETE:', function(entry){
		if (isNaN(entry) === false && entry != 0){

			
			fs.readFile('.env', 'utf8', function(err, encrytedKey){
				if (err) return console.log(err)

						
				var key = cryptojs.AES.decrypt(encrytedKey.substring(5), mkey).toString(cryptojs.enc.Utf8)
				var keyArray = key.split(',')
				keyArray.splice(entry,1)
				
				var updatedKey = keyArray.join(',')
				var encryptedKeys = 'data='+ cryptojs.AES.encrypt(updatedKey, mkey).toString()
				fs.writeFile('.env', encryptedKeys, function(err){
					if (err) return console.log(err)
					fs.readFile('.env', 'utf8', function(err, encrytedKey){
						if (err) return console.log(err)

							keyList(encrytedKey.substring(5))
							addKey()
					})
				})
			})
				

			

		} else if (entry.indexOf('=')!== -1){
			fs.readFile('.env', 'utf8', function(err, encrytedKey){
				if(!!encrytedKey){
					var keys =  keyList(encrytedKey.substring(5))+","+ entry 

				}else{
					var keys = 'key=value'
				}

				
				var encryptedKeys = 'data='+ cryptojs.AES.encrypt(keys, mkey).toString()
				// var data = encryptedKey
				fs.writeFile('.env', encryptedKeys, function(err){
					if (err) return console.log(err)
					fs.readFile('.env', 'utf8', function(err, encrytedKey){
						if (err) return console.log(err)

							keyList(encrytedKey.substring(5))
							addKey()
					})
				})
			})
		}else{
			console.log('Please enter key and value pair with a "="')
			addKey()
		}
	})
}

if (mkey !== undefined) {
		keyProcess()
		function keyProcess(){
			fs.exists('.env', function(exists){
				if(!exists){
					fs.writeFile('.env', '', function(err){
						if (err) return console.log(err)
					})
				}
				if (data === undefined){
					rl.question('No key found. Do you want to add key?(y/n)', function(ans){

						if(ans === 'y'){
							addKey()
							
							
						}else if(ans ==='n'){

						}else{

							console.log('Please enter y for Yes, n for No and Exit.')
							keyProcess()
						}

					})
				}else{
					fs.readFile('.env', 'utf8', function(err, encrytedKey){
						if (err) return console.log(err)
							keyList(encrytedKey.substring(5))
							addKey()
					})
				}

			})
			
		}

		
}else{
	console.log('Please provide password for editing env or Delete content of .env for to reset all keys')
}


