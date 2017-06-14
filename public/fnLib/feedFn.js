

function myMCEini(selector){
	// tinymce.init({
	//     selector: selector,
	//     //- statusbar: false,
 //        setup: function (editor) {
 //            editor.on('change', function () {
 //                editor.save();
 //                var editorContent = editor.getContent()
 //                if(editorContent != ''){
 //                	console.log('not black')
 //                	$("#btnPost").prop("disabled",false)
 //                }else{
 //                	$("#btnPost").prop("disabled",true)
 //                }

 //            });
            
 //        },
	//     theme: "modern",
	   
	//     //- paste_as_text: false,
	//     paste_data_images: true,
	//     paste_enable_default_filters: false,
	//     //- plugins:[
	//     //- 	'paste'
	//     //- ]
	//     plugins: [
	//       "advlist autolink lists link image charmap print preview hr anchor pagebreak",
	//       "searchreplace wordcount visualblocks visualchars code fullscreen",
	//       "insertdatetime media nonbreaking save table contextmenu directionality",
	//       "emoticons template textcolor paste colorpicker textpattern"
	//     ],
	//     theme_advanced_buttons3_add : "emotions",
	//     table_default_styles: {
	// 	    fontWeight: 'bold',
	// 	    borderTop: '1px solid black'
	// 	},
	//     toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
	//     toolbar2: "print preview media | forecolor backcolor emoticons",
	//      theme_advanced_buttons3_add : "tablecontrols",
 //        table_styles : "Header 1=header1;Header 2=header2;Header 3=header3",
        
       
	//     file_picker_callback: function(callback, value, meta) {
	// 		if (meta.filetype == 'image') {
	// 			$('#upload').trigger('click');
	// 			$('#upload').on('change', function() {
	// 			    var file = this.files[0];
	// 			    var reader = new FileReader();
	// 			    reader.onload = function(e) {
	// 				    callback(e.target.result, {
	// 				       alt: ''
	// 				    });
	// 			 	};
	// 			  	reader.readAsDataURL(file);
	// 			});
	// 		}
	//     },
	//     templates: [{
	//         title: 'Test template 1',
	//         content: 'Test 1'
	//     }, {
	//         title: 'Test template 2',
	//         content: 'Test 2'
	//     }]
	// });
}

function postDB(postTo, postToValue, postText, filter, userArray, storageLink){

	var userArrayString = JSON.stringify(userArray,4, null)
	if(postToValue !== "ALL"){
	var postToValue = JSON.stringify(postToValue,4, null)
	}
	console.log('aaaaaaaaaaaa')
	$.post('/notif/post',{
		postTo:postTo,
		postToValue:postToValue,
		storageLink:storageLink,
		postText:postText,
		filter:filter,
		userArray:userArrayString
	}).done(function(Rdata){
		//****undo to work with notification
		// location.reload()
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
function testalert(text){
	alert('testalert: '+text)
}

function getPostDB(option){
	if(option===undefined){
		var option = {}
	}

	var loadNumber = option.loadNumber||undefined
	var viewOption = option.viewOption||false
	var byMe = option.byMe||false
	var byOther = option.byOther||false
	var viewOnly = option.viewOnly||false
	var postId = option.postId||false
	var tagName = option.tagName||false
	var tagType = option.tagType||false
	console.log('byMe:'+ byMe)
	console.log('byOther:'+ byOther)
	// console.log('feedNumber:'+loadNumber)
	$.post('/notif/getFeed',{
		loadNumber:loadNumber,
		viewOption:viewOption,
		viewOnly:viewOnly,
		byMe:byMe,
		byOther:byOther,
		postId:postId,
		tagName: tagName,
		tagType:tagType
	}).done(function(Rdata){
		
		Rdata.posts.forEach(function(post, i){
			console.log(post)

			var div = document.createElement('div')
			
			div.className = 'panel panel-success'
			div.classList.add('postPanel')
				var divBody = document.createElement('div')
				divBody.className = 'panel-body'

				divBody.innerHTML = post.postText
				divBody.id = 'divBody'+ i

					
					

				div.appendChild(divBody)

				getComment()
				function getComment(){
				
					$.post('/notif/getCommentCount',{
						mainPostId:post.id
					}).done(function(Rdata){
						var emojCount = Rdata.emojCount
						
						var divTitle = document.createElement('div')
						divTitle.className = 'panel-heading'

						divTitle.classList.add('postPanel')


							//Posted users with date and time
							var pUser = document.createElement('span')
							pUser.innerHTML =  post.user.fullName + ' ('+
							post.user.title + ', ' + post.user.department.name + 

							") posted " + moment(post.createdAt).calendar() + '  '
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
									
									spanBtnText.innerHTML = 'Load Comments'
								comment.appendChild(spanBtnText)
								var spanBagdes = document.createElement('span')
									spanBagdes.style.color = '#FF8C5A'
									spanBagdes.className = "badge"
									spanBagdes.style.float = 'left'
									Rdata.commentCount > 0?spanBagdes.innerHTML = Rdata.commentCount:''
								comment.appendChild(spanBagdes)
							comment.style.color = 'black'
							// comment.addEventListener('click', function(){
							// 	spanBtnText.innerHTML == 'Comments'?spanBtnText.innerHTML = 'Collapse':spanBtnText.innerHTML= 'Comments'
							// })

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
									divCommentContainer.setAttribute('style','margin-top:10px')
									divCommentContainer.id = 'comment'+post.id		
										
									
										
									Rdata1.comments.forEach(function(comment){
										var divComment = document.createElement('div')
										
												if(comment.commentEmoj !== ''){
													var pUser = document.createElement('p')
													pUser.innerHTML = '&nbsp from <b>' +comment.user.fullName + ' ('+
													post.user.title + ', ' + post.user.department.name + 

													") "+ ' </b>' 
													+ moment(comment.createdAt).calendar()
													pUser.style.fontSize = '10px'
													pUser.style.color = '#B0AAC4'
														var spanEmoj = document.createElement('span')
														spanEmoj.className = comment.commentEmoj
														spanEmoj.style.color = glyphiconColor(comment.commentEmoj)
														spanEmoj.id = 'spanEmoj'
														spanEmoj.style.float = 'left'
														spanEmoj.style.fontSize = '15px'
														pUser.appendChild(spanEmoj)
													divComment.appendChild(pUser)

												}else{
													// spanEmoj.className='glyphicon glyphicon-thumbs-up'
													// spanEmoj.style.color = 'gray'
													var pUser = document.createElement('p')
													pUser.innerHTML = '&nbsp from <b>' +comment.user.fullName 
													+ ' ('+ post.user.title + ', ' + post.user.department.name + 
													") "+ ' </b>' 
													+ moment(comment.createdAt).calendar()
													pUser.style.color = '#B0AAC4'
													pUser.style.fontSize = '10px'

														var spanEmoj = document.createElement('span')
														
														spanEmoj.className = 'glyphicon glyphicon-comment'
														spanEmoj.style.color = '#72D0C2'
														spanEmoj.style.float = 'left'
														spanEmoj.style.fontSize = '15px'
														pUser.appendChild(spanEmoj)
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


						
							var postOpt = document.createElement('span')
							postOpt.id = 'postOpt'
							postOpt.className = 'glyphicon glyphicon-collapse-down'
							postOpt.onclick = function(){

							function postOptClick(option){
								console.log(option)
								if(option === "Save"){
									
									var saveToContainer = document.createElement('div')
									saveToContainer.style.top = postOptCoords.bottom - divTitleCoords.top +'px'
									saveToContainer.style.left = postOptCoords.left - divTitleCoords.left + 'px'
									saveToContainer.className = 'popUpContainer'
									saveToContainer.id = 'saveToContainer'
										var resultContainer = document.createElement('var')
										resultContainer.id = 'result-container'
										resultContainer.className = "result-container"
										saveToContainer.appendChild(resultContainer)

										var addTag = document.createElement('div')
										addTag.id = 'addTag'
										saveToContainer.appendChild(addTag)

										var divTHContainer = document.createElement('div')
										divTHContainer.className = 'typeahead__container'
											var divTHField = document.createElement('div')
											divTHField.className = 'typeahead__field'
												spanTH = document.createElement('span')
												spanTH.className = 'typeahead__query'
									
													var input = document.createElement('input')
													
													input.className ='js-typeahead-searchTagSave'
													input.type = 'search'
													input.id = 'searchTagSave'
													input.placeholder = 'Search Tag Name'
													
													spanTH.appendChild(input)
												divTHField.appendChild(spanTH)
											divTHContainer.appendChild(divTHField)
										saveToContainer.appendChild(divTHContainer)


										// var saveToContainerUl = document.createElement('ul')
										// 	saveToContainerUl.setAttribute('style', 'list-style:none;padding:5px 10px 5px 10px;')
										// 	$.post('/notif/getTagSave').done(function(tagNames){
										// 		console.log(tagNames)
										// 		tagNames.forEach(function(option){
										// 			var saveToContainerLi = document.createElement('li')
										// 				var a = document.createElement('a')
										// 				a.href='#'
										// 				a.innerHTML = option.tagName
										// 				a.onclick = function(){
										// 					event.preventDefault()
										// 					var clickedTag = event.target.innerHTML
										// 					$.post('/notif/postTagSave',{
										// 						mainPostId:post.id,
										// 						type:'personal',
										// 						tagName:clickedTag
										// 					}).done(function(){

										// 					})
										// 				}
										// 				saveToContainerLi.appendChild(a)
										// 			saveToContainerUl.appendChild(saveToContainerLi)
										// 		})
										// 	})
											

										// 	var newOpt = document.createElement('input')
										// 	newOpt.className = 'form-control'
										// 	newOpt.placeholder = 'New Tag'
										// 	newOpt.id = 'newTagSave'
										// 	newOpt.onchange = function(){
										// 		console.log(`${post.id},${newOpt.value}`)
										// 		$.post('/notif/postTagSave',{
										// 			mainPostId:post.id,
										// 			type:'personal',
										// 			tagName:newOpt.value
										// 		}).done(function(){

										// 		})
										// 	}
										// 	saveToContainer.appendChild(newOpt)
										// saveToContainer.appendChild(saveToContainerUl)
									divTitle.appendChild(saveToContainer)
									$.typeahead({
									    input: '.js-typeahead-searchTagSave',
									    minLength:0, maxItem: 20, offset: false, 
									    order: "acs",
									    template:"{{tagName}} ({{category}}) <small style='color:#999;'>{{type}}</small>",
									    // correlativeTemplate: true, //search text to match any word, anywhere inside the template
									    searchOnFocus: true,
									    display:['category','tagName','type'],
									    group:{
									    	key:'category'
									    	// ,
									    	// template:"<table><tr><td>{{category}}</td></tr></table>"
								    	 	// template: function(item){
								    	 	// 	return item.category
								    	 		
								    	 	// }

									    },
									    groupTemplate: "<table><tr><td>{{category}}</td></tr></table>",
									    
									    source: {
									    	newTag:{
									    		display:['tagName','type'],
									    		data:[
									    			{tagName:'New Tag',type:'personal'},
								            		{tagName:'New Tag',type:'department'}
								            	]
									    	},
								            tagSave:{
								            	
									           	ajax: {
									            	type:'POST',
									                url: '/notif/getTagSave'
									                
									            }
									        }
									    },
									    callback: {
									        
									        onClickAfter: function (node, a, item, event) {
									        	event.preventDefault();
									        	console.log(event.target)
									 			console.log(node)
									            console.log(a)
									            console.log(item)
									            console.log(event)

										            

												$.post('/notif/postTagSave',{
													mainPostId:post.id,
													type:'Personal',
													tagName:item.tagName,
													category:item.category
												}).done(function(){
													$('#result-container').text('');
												})
									 
									        },
									        onResult: function (node, query, result, resultCount) {
									            if (query === "") return;
									            $('#addTag').html("")
									            console.log(query.length)
									            console.log($('#addTagBtn'))
									            if(query.length<2&&$('#addTagBtn').length>0){
									            	$('#addTagBtn').remove()
									            }
									            var arrTagType = ['Personal', 'Department']

									            var addTagDiv = document.getElementById('addTag')
									            arrTagType.forEach(function(type){
									            	
										            	var addTagBtn = document.createElement('button')
										 				addTagBtn.innerHTML = 'Add '+ type +' Tag'
										 				addTagBtn.id = 'addTagBtn'
										 				addTagBtn.onclick = function(){
										 					$('#result-container').text('Adding Tag: '+ query);
										 					event.preventDefault()
										 					$('#addTagCategory').length>0?$('#addTagCategory').remove():''
										 					$('#addTagCategoryBtn').length>0?$('#addTagCategoryBtn').remove():''
										 					var addTagCategory = document.createElement('input')
										 					addTagCategory.className = 'form-control'
										 					addTagCategory.id = 'addTagCategory'
										 					addTagCategory.placeholder = 'Type '+ type+' Category'
										 					addTagDiv.appendChild(addTagCategory)
										 					
										 					var addTagCategoryBtn = document.createElement('button')
										 					addTagCategoryBtn.innerHTML = 'ADD'
										 					addTagCategoryBtn.id = 'addTagCategoryBtn'
										 					// addTagCategoryBtn.style.float = 'right'
										 					addTagDiv.appendChild(addTagCategoryBtn)
										 					addTagCategoryBtn.onclick = function(){
										 						console.log('adding'+ addTagCategory.value)
										 							$.post('/notif/postTagSave',{
																	mainPostId:post.id,
																	category:addTagCategory.value,
																	type:type,
																	tagName:query
																	}).done(function(){
																		
																		$('#saveToContainer').remove()
																	})
										 					}
										 				}
										 				addTagDiv.appendChild(addTagBtn)
									            })
									 			

									 			

									            var text = "";
									            if (result.length > 0 && result.length < resultCount) {
									                text = "Showing <strong>" + result.length + "</strong> of <strong>" + resultCount + '</strong> elements matching "' + query + '"';
									            } else if (result.length > 0) {
									                text = 'Showing <strong>' + result.length + '</strong> elements matching "' + query + '"';
									            } else {
									                text = 'No results matching "' + query + '"';
									            }
									            $('#result-container').html(text);
									 
									        }
									    }
									});
								}
							}
								console.log(event.clientY)
								
								var divTitleCoords = divTitle.getBoundingClientRect()
								var postOptCoords = this.getBoundingClientRect()

								console.log(postOptCoords)
								console.log(divTitleCoords)
								$('#postOptContainer').length>0?$('#postOptContainer').remove():''
								var postOptContainer = document.createElement('div')
								postOptContainer.style.top = postOptCoords.bottom - divTitleCoords.top +'px'
								postOptContainer.style.left = postOptCoords.left - divTitleCoords.left + 'px'
								postOptContainer.className = 'popUpContainer'
								postOptContainer.id = 'postOptContainer'
									var postOptContainerUl = document.createElement('ul')
										postOptContainerUl.setAttribute('style', 'list-style:none;padding:5px 10px 5px 10px;')
										
										var optList = ['Hide', 'Share', 'Email', 'Save']
										optList.forEach(function(option){
											var postOptContainerLi = document.createElement('li')
												var a = document.createElement('a')
												a.href='#'
												a.innerHTML = option
												a.onclick = function(){
													event.preventDefault()
													postOptClick(this.innerHTML)
												}
												postOptContainerLi.appendChild(a)
											postOptContainerUl.appendChild(postOptContainerLi)
										})
									postOptContainer.appendChild(postOptContainerUl)
								divTitle.appendChild(postOptContainer)
								

										

							}
							divTitle.appendChild(postOpt)

							window.onclick = function(){
								console.log(event.target)
								if(event.target.id !== 'postOpt'){
									$('#postOptContainer').remove()
								}
								if(event.target.innerHTML !== 'Save'&&
									event.target.type!=='search'
									&&event.target.id !== 'addTagBtn'
									&&event.target.id!=='addTagCategory'
									&&event.target.id!=='addTagCategoryBtn'
									){
									$('#saveToContainer').remove()
								}
								
							}

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
								divTitle.appendChild(divEmojDock)
							}) 
							divTitle.appendChild(spanEmoj)


							// //Horizontal line before comments
							// var divhr = document.createElement('HR')
							// divTitle.appendChild(divhr)
							
						div.appendChild(divTitle)
					})
				}	

			divPostContainer.appendChild(div)

			// var imgTags = [].slice.call(divBody.getElementsByTagName('img'))
			// 		imgTags.forEach(function(imgTag, u){
			// 			if(imgTag !== undefined){
			// 				imgTag.setAttribute("style","width:128px;height:128px;")
			// 				imgTag.className = 'imageThumb' 
			// 				textInPost()===false?imgTag.classList.add('floating-image'):""
							
			// 				// imgTag.id = 'image'+ i + u
			// 				imgTag.addEventListener('click', function(){
			// 					console.log(this)
			// 					document.getElementById('myModal').style.display = 'block'
			// 					document.getElementById('imgModal').src = this.src
			// 				})
			// 			}
			// 		})
			var textInPost = function(){
				var result = false;
				var pTags = [].slice.call(document.getElementById('divBody'+i).getElementsByTagName('p'))
				pTags.forEach(function(pTag, u){
					// alert(pTag.firstChild.nodeName)
					if(pTag.firstChild.nodeName!=='IMG'&&pTag.firstChild.nodeName!=='IFRAME'){
						result =  true
					}
				})
				return result
			}
			
			$("#divBody"+i).find('img').each(function(){
				var jqImg = $(this)
				jqImg.attr("style","max-width:132px;max-height:132px")
				jqImg.attr('class','imageThumb')
				textInPost()===false?jqImg.addClass('floating-image'):""
				jqImg.click(function(){
					// $('.aModal').length>1?$('.aModal').remove():""
					var myModal = document.getElementById('myModal')
					myModal.style.display = 'block'
						var aModal = document.createElement('a')
						// aModal.style.color = 'white'
						aModal.href = this.src
						aModal.className = 'aModal'
						// a.download = true
						aModal.innerHTML = 'Full Size'
					myModal.insertBefore(aModal, myModal.firstChild)
					// myModal.innerHTML = '<a href="'+this.scr+'" download>full Screen</a>'
					document.getElementById('iframeModal').style.display = 'none'
					document.getElementById('imgModal').style.display = 'block'
					document.getElementById('imgModal').setAttribute('style','max-width:100%;max-height:100%;')
					document.getElementById('imgModal').src = this.src
				})
			})
			
			$("#divBody"+i).find('p').each(function(){
				var pIframe = this
				
				if(pIframe.firstChild.nodeName === 'IFRAME'){
					pIframe.className = 'embed-responsive embed-responsive-4by3'
					pIframe.setAttribute('style','clear:both')

					var jqIframe = $(this).first()
					
					jQuery(document).ready(function($){
						jqIframe.iframeTracker({
							blurCallback: function(){
								console.log('x')
								document.getElementById('myModal').style.display = 'block'
								// $('.aModal').length>1?$('.aModal').remove():""
								// var aModal = document.createElement('a')
								// 	aModal.href = pIframe.firstChild.src
								// 	aModal.className = 'aModal'
								// 	aModal.innerHTML = 'Full View'
								// myModal.insertBefore(aModal, myModal.firstChild)
								document.getElementById('imgModal').style.display = 'none'
								document.getElementById('iframeModal').style.display = 'block'
								document.getElementById('iframeModal').setAttribute('style','width:100%;height:100%;')
								document.getElementById('iframeModal').src = pIframe.firstChild.src
							}
						});
					});
				}else if(pIframe.firstChild.nodeName === 'VIDEO'){
					console.log('VIDEO')
					pIframe.className = 'embed-responsive embed-responsive-4by3'
				}
				
		       
			})

			

		})

	
	
	})
	return true
}

function BHUserList (typeaheadId) {
	$.post('/notif/groupList').done(function(pData){
		var result = pData.groupList
		// constructs the suggestion engine
		var groupList = new Bloodhound({
			identify: function(obj) { return obj.name;},
		  	datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
		  	queryTokenizer: Bloodhound.tokenizers.whitespace,
		  // `states` is an array of state names defined in "The Basics"
		  	local: result
		});
		function groupDefault(q, sync) {
			if (q === '') {
			   // sync(groupList.get('ADD NEW GROUP'));
			 }else {
			 	console.log('BHResult')
			 	console.log(result)
			    groupList.search(q, sync);
			 }
		}

		$('#'+typeaheadId).typeahead({
			hint: true,
		  	highlight: true,
		  	minLength: 0
		},{
		  	name: 'states',
		  	display: 'status',
		  	source: groupDefault,
		  	templates: {
			  	// empty: [
			   //    '<div class="empty-message">',
			   //      'unable to find any group with current search',
			   //    '</div>'
			   //  ].join('\n')
			   //  ,
			    suggestion: function (data) {
			        return '<p><strong>' + data.name + '</strong> - ' + data.status + '</p>';
			    }
		  }
		});
	})
}