function postDB(postText){
	$.post('/notif/mainFeed',{
		postText:postText
	}).done(function(Rdata){
		
		console.log(Rdata)
	})
					
}

function getPostDB(){
	var plist = ['a','b']
	$.getJSON('/notif/mainFeed').done(function(Rdata){
		Rdata.posts.forEach(function(post, i){
			plist.push(post.postText)
		})

	
	console.log(plist)
	return plist
	})
	console.log(plist)
	
	
}