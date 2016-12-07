function postDB(postTo, postText, filter, userArray){
	var userArrayString = JSON.stringify(userArray,4, null)
	$.post('/notif/post',{
		postTo:postTo,
		postText:postText,
		filter:filter,
		userArray:userArrayString
	}).done(function(Rdata){
		
		console.log(Rdata)
	})
					
}

function glyphiconColor(name){
	switch(name){
		case 'glyphicon glyphicon-thumbs-up':
			return 'blue'
			break
		case 'glyphicon glyphicon-thumbs-down':
			return 'purple'
			break
		case 'glyphicon glyphicon-heart':
			return 'red'
			break
		case 'glyphicon glyphicon-remove-sign':
			return 'gray'
			break
		case 'glyphicon glyphicon-star':
			return 'orange'
			break
		default:
	} 
}

function getPostDB(){
	$.post('/notif/getFeed').done(function(Rdata){
		console.log(Rdata)
		Rdata.posts.forEach(function(post, i){

			var div = document.createElement('div')
			
			div.className = 'panel panel-primary'
			div.classList.add('col-md-4')
				var divBody = document.createElement('div')
				divBody.className = 'panel-body'
				
					var h3 = document.createElement('h3')
					h3.innerHTML = post.postText
					divBody.appendChild(h3)
				div.appendChild(divBody)
				getComment()
				function getComment(){
				
					$.post('/notif/getCommentCount',{
						mainPostId:post.id
					}).done(function(Rdata){
						console.log(Rdata)
						var emojCount = Rdata.emojCount
						
						var divTitle = document.createElement('div')
						divTitle.className = 'panel-heading'


							//Posted users with date and time
							var pUser = document.createElement('span')
							pUser.innerHTML =  post.user.fullName + " posted " + moment(post.createdAt).fromNow() + '  '
							divTitle.appendChild(pUser)

							
							
							//Count of Emoj per category 
							for(emoj in emojCount){
								var spanPostEmoj = document.createElement('span')
								spanPostEmoj.style.color = glyphiconColor(emoj)
								spanPostEmoj.className= emoj
								spanPostEmoj.innerHTML = emojCount[emoj] + '&nbsp'
								spanPostEmoj.style.float = 'right'
								spanPostEmoj.style.background = 'white'
								spanPostEmoj.style.fontSize = '18px'
								spanPostEmoj.addEventListener('click', function(){
									console.log(click)

								})
								divTitle.appendChild(spanPostEmoj)
							}
								


							//Comment Button
							var comment = document.createElement('button')
							comment.setAttribute('data-toggle', 'collapse')
							comment.setAttribute('data-target', '#comment'+post.id)
							comment.className = 'btn btn-info'
							// comment.innerHTML = 'Comments'
							comment.style.float = 'center'
								var spanBtnText = document.createElement('span')
									// spanBtnText.style.color = '#FF8C5A'
									
									spanBtnText.innerHTML = 'Comments'
								comment.appendChild(spanBtnText)
								var spanBagdes = document.createElement('span')
									spanBagdes.style.color = '#FF8C5A'
									spanBagdes.className = "badge"
									spanBagdes.style.float = 'left'
									Rdata.commentCount > 0?spanBagdes.innerHTML = Rdata.commentCount:''
								comment.appendChild(spanBagdes)
							comment.style.color = 'black'
							comment.addEventListener('click', function(){
								spanBtnText.innerHTML == 'Comments'?spanBtnText.innerHTML = 'Collapse':spanBtnText.innerHTML= 'Comments'
							})

							comment.addEventListener('mouseenter', function(){
								console.log('before')
								
								
								spanBtnText.innerHTML= 'Comments'
								$.post('/notif/getComment',{
									mainPostId:post.id
								}).done(function(Rdata1){
									console.log(Rdata1)
									$('#comment'+ post.id).length>0?$('#comment'+ post.id).remove():""
									
									var divCommentContainer = document.createElement('div')
									divCommentContainer.className='collapse'
									divCommentContainer.id = 'comment'+post.id		
										
									
										
									Rdata1.comments.forEach(function(comment){
										var divComment = document.createElement('div')
										
												if(comment.commentEmoj !== ''){
													var pUser = document.createElement('p')
													pUser.innerHTML = '&nbsp from <b>' +comment.user.fullName + ' </b>' 
													+ moment(comment.createdAt).fromNow()
													pUser.style.color = '#B0AAC4'
													var spanEmoj = document.createElement('span')
													spanEmoj.className = comment.commentEmoj
													spanEmoj.style.color = glyphiconColor(comment.commentEmoj)
													spanEmoj.id = 'spanEmoj'
													spanEmoj.style.float = 'left'
													
													spanEmoj.style.fontSize = '20px'
													pUser.appendChild(spanEmoj)
													divComment.appendChild(pUser)

												}else{
													// spanEmoj.className='glyphicon glyphicon-thumbs-up'
													// spanEmoj.style.color = 'gray'
													var pUser = document.createElement('p')
													pUser.innerHTML = '<b>' +comment.user.fullName + ' </b> commented ' 
													+ moment(comment.createdAt).fromNow()
													pUser.style.color = '#B0AAC4'
													divComment.appendChild(pUser)
													var pComment = document.createElement('p')
													pComment.innerHTML = '&nbsp&nbsp-&nbsp'+comment.comment
													divComment.appendChild(pComment)
												}
												
												
												// spanEmoj.addEventListener('click', function(){
												// 	spanEmoj.parentNode.removeChild(spanEmoj)



												// 	// $('#spanEmoj').remove();
												// 	// var spanRemove = document.createElement('span')
												// 	// spanRemove.className = 'glyphicon glyphicon-remove-sign'
												// 	// spanRemove. id = 'spanRemove'
												// 	// spanRemove.style.float = 'right'
												// 	// spanRemove.style.fontSize = '20px'
												// 	// spanRemove.addEventListener('click', function(){
												// 	// 	console.log('click')
												// 	// 	$('#spanEmojDock').remove();
												// 	// 	$('#spanRemove').remove();
												// 	// 	pUser.appendChild(spanEmoj)
												// 		// $('#spanEmoj').html('')
												// 	// })
												// 	// pUser.appendChild(spanRemove)
												// 	function glyphiconGen (name, color) {
												// 		this.name = name
												// 		this.color = color
												// 	}
												// 	var divEmojDock = document.createElement('div')
												// 		var glyphiconList = [
												// 			new glyphiconGen('glyphicon glyphicon-thumbs-up','blue'),
												// 			new glyphiconGen('glyphicon glyphicon-thumbs-down','purple'),
												// 			new glyphiconGen('glyphicon glyphicon-heart','red'),
												// 			new glyphiconGen('glyphicon glyphicon-star','yellow'),
												// 			new glyphiconGen('glyphicon glyphicon-remove-sign','gray') ]
												// 		glyphiconList.forEach(function(item){
												// 			var spanEmojDock = document.createElement('span')
												// 			spanEmojDock.className = item.name
												// 			spanEmojDock.style.color = item.color
												// 			// spanEmojDock.style.float = 'left'
												// 			spanEmojDock.style.fontSize = '20px'
												// 			spanEmojDock.addEventListener('click', function () {
												// 				console.log(spanEmojDock.className)
												// 				$.post('/notif/replyEmoj',{
												// 					commentId:comment.id,
												// 					commentEmoj:spanEmojDock.className
												// 				}).done(function(Rdata){
												// 					console.log(Rdata)
																	
												// 				})
												// 			})
												// 			divEmojDock.appendChild(spanEmojDock)


												// 			var spanSpace = document.createElement('span')
												// 			// spanSpace.style.float = 'left'
												// 			spanSpace.innerHTML = '&nbsp&nbsp&nbsp'
												// 			divEmojDock.appendChild(spanSpace)
												// 			})
												// 	divComment.appendChild(divEmojDock)
												// }) 
												
											

											
										
										divCommentContainer.appendChild(divComment)
									})

									if($('#commentPost'+ post.id).length<1){
										var divCommentPost = document.createElement('div')
										divCommentPost.className = 'input-group'
										divCommentPost.id = 'commentPost'+post.id
											var replyPost = document.createElement('textarea')
											replyPost.id = 'post'
											replyPost.className = 'form-control'
											replyPost.placeholder = 'Post comment'
											divCommentPost.appendChild(replyPost)


											var span = document.createElement('span')
											span.className = 'input-group-btn'
												var btn = document.createElement('button')
												btn.className = 'btn btn-primary'
												btn.innerHTML = 'POST'
												btn.addEventListener('click', function(){
													console.log(replyPost.value)
													console.log(post.id)
													$.post('/notif/replyPost',{
														mainPostId:post.id,
														comment:replyPost.value
													}).done(function(Rdata){
														if(!!Rdata){
															getComment()
															divTitle.parentNode.removeChild(divTitle)
															// var divComment = document.createElement('div')
															// divComment.innerHTML = Rdata.comment.comment
															
															// divCommentContainer.insertBefore(divComment, divCommentPost)
														}
													})
												}) 
												span.appendChild(btn)
											divCommentPost.appendChild(span)
										divCommentContainer.appendChild(divCommentPost)
									}
									divTitle.appendChild(divCommentContainer)
								})
							})

							divTitle.appendChild(comment)


							spanSpace = document.createElement('span')
							spanSpace.innerHTML = '&nbsp&nbsp&nbsp'
							divTitle.appendChild(spanSpace)


							//Blank like Emoj for user input
							var spanEmoj = document.createElement('span')
							
							spanEmoj.style.fontSize = '25px'
							
							if(!!Rdata.selfEmoj){
								spanEmoj.className = Rdata.selfEmoj.commentEmoj
								spanEmoj.style.color = glyphiconColor(Rdata.selfEmoj.commentEmoj)
							}else{
								spanEmoj.className = 'glyphicon glyphicon-thumbs-up'
								spanEmoj.style.color = 'white'
							}
							
							
							spanEmoj.addEventListener('click', function(){
								
								$('#divEmojDock').length>0?$('#divEmojDock').remove():''



								// $('#spanEmoj').remove();
								// var spanRemove = document.createElement('span')
								// spanRemove.className = 'glyphicon glyphicon-remove-sign'
								// spanRemove. id = 'spanRemove'
								// spanRemove.style.float = 'right'
								// spanRemove.style.fontSize = '20px'
								// spanRemove.addEventListener('click', function(){
								// 	console.log('click')
								// 	$('#spanEmojDock').remove();
								// 	$('#spanRemove').remove();
								// 	pUser.appendChild(spanEmoj)
									// $('#spanEmoj').html('')
								// })
								// pUser.appendChild(spanRemove)
								function glyphiconGen (name, color) {
									this.name = name
									this.color = color
								}
								var divEmojDock = document.createElement('div')
									var glyphiconList = [
										new glyphiconGen('glyphicon glyphicon-thumbs-up','blue'),
										new glyphiconGen('glyphicon glyphicon-thumbs-down','purple'),
										new glyphiconGen('glyphicon glyphicon-heart','red'),
										new glyphiconGen('glyphicon glyphicon-star','yellow'),
										new glyphiconGen('glyphicon glyphicon-remove-sign','gray') ]
									glyphiconList.forEach(function(item){
										var spanEmojDock = document.createElement('span')
										spanEmojDock.className = item.name
										spanEmojDock.style.color = item.color
										divEmojDock.id = 'divEmojDock'
										// spanEmojDock.style.float = 'left'
										spanEmojDock.style.fontSize = '20px'
										spanEmojDock.addEventListener('click', function () {
											console.log(spanEmojDock.className)
											$.post('/notif/addPostEmoj',{
												mainPostId:post.id,
												commentEmoj:spanEmojDock.className
											}).done(function(Rdata){
												console.log(Rdata)
												divTitle.parentNode.removeChild(divTitle)
												getComment()
											})
										})
										divEmojDock.appendChild(spanEmojDock)


										var spanSpace = document.createElement('span')
										// spanSpace.style.float = 'left'
										spanSpace.innerHTML = '&nbsp&nbsp&nbsp'
										divEmojDock.appendChild(spanSpace)
									})
								divTitle.insertBefore(divEmojDock, divhr)
							}) 
							divTitle.appendChild(spanEmoj)


							//Horizontal line before comments
							var divhr = document.createElement('HR')
							divTitle.appendChild(divhr)
							
						div.appendChild(divTitle)
					})
				}	

			$('#Feed').append(div)


		})

	
	
	})
}

function BHUserList (typeaheadId) {

	$.post('/notif/groupList').done(function(pData){
		var result = pData.groupList.map(function(group) {
			return group;
			
			});
		// constructs the suggestion engine
		var groupList = new Bloodhound({
			identify: function(obj) { return obj.name; },
		  	datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
		  	queryTokenizer: Bloodhound.tokenizers.whitespace,
		  // `states` is an array of state names defined in "The Basics"
		  	local: result
						
		});

		function groupDefault(q, sync) {
			if (q === '') {
			    sync(groupList.get('BCP', 'ACH', 'APS'));
			 }else {
			    groupList.search(q, sync);
			 }
		}

		$('#'+typeaheadId).typeahead({
			hint: true,
		  	highlight: true,
		  	minLength: 0
		},{
		  	name: 'states',
		  	display: 'name',
		  	source: groupDefault,
		  	templates: {
			  	empty: [
			      '<div class="empty-message">',
			        'unable to find any group with current search',
			      '</div>'
			    ].join('\n')
			    ,
			    suggestion: function (data) {
				        return '<p><strong>' + data.name + '</strong> - ' + data.status + '</p>';
				    }
		  }
		});
	})

	
	
	
}