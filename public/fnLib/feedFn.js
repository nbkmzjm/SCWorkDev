function postDB(postTo, postText){
	$.post('/notif/post',{
		postTo:postTo,
		postText:postText
	}).done(function(Rdata){
		
		console.log(Rdata)
	})
					
}

function getPostDB(){
	$.post('/notif/getFeed').done(function(Rdata){
		console.log(Rdata)
		Rdata.posts.forEach(function(post, i){
			var div = document.createElement('div')
			
			div.className = 'panel panel-primary'
			div.classList.add('col-sm-4')
				var divBody = document.createElement('div')
				divBody.className = 'panel-body'
					var h3 = document.createElement('h3')
					h3.innerHTML = post.postText
					divBody.appendChild(h3)
				div.appendChild(divBody)

				var divTitle = document.createElement('div')
				divTitle.className = 'panel-heading'
				div.appendChild(divTitle)

					var pUser = document.createElement('p')
					pUser.innerHTML =  post.user.name + " posted " + moment(post.createdAt).fromNow()
					divTitle.appendChild(pUser)

			$('#Feed').append(div)


		})

	
	
	})
	
	
	
}