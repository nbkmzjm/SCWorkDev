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

				var divTitle = document.createElement('div')
				divTitle.className = 'panel-heading'
					var pUser = document.createElement('p')
					pUser.innerHTML =  post.user.name + " posted " + moment(post.createdAt).fromNow()
					divTitle.appendChild(pUser)
				div.appendChild(divTitle)	

				var divTitle = document.createElement('div')
				divTitle.className = 'panel-heading'
				div.appendChild(divTitle)
					var comment = document.createElement('button')
					comment.setAttribute('data-toggle', 'collapse')
					comment.setAttribute('data-target', '#comment'+post.id)
					comment.innerHTML = 'comments'
					comment.addEventListener('mouseenter', function(){
						console.log('before')
						
						

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
									var pUser = document.createElement('p')
									pUser.innerHTML = '<b>' +comment.user.fullName + ' </b> commented ' 
									+ moment(comment.createdAt).fromNow()
									divComment.appendChild(pUser)

									var pComment = document.createElement('p')
									pComment.innerHTML = comment.comment
									divComment.appendChild(pComment)

								
								
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
													var divComment = document.createElement('div')
													divComment.innerHTML = Rdata.comment.comment
													
													divCommentContainer.insertBefore(divComment, divCommentPost)
												}
											})
										}) 
										span.appendChild(btn)
									divCommentPost.appendChild(span)
								divCommentContainer.appendChild(divCommentPost)
							}
							div.appendChild(divCommentContainer)
						})
					})

					div.appendChild(comment)

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