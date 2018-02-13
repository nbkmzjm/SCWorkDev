



function myMCEini(selector){
	tinymce.init({
	    selector: selector,
	    //- statusbar: false,
        setup: function (editor) {
            editor.on('change', function () {
                editor.save();
                var editorContent = editor.getContent()
                if(editorContent != ''){
                	console.log('not black')
                	$("#btnPost").prop("disabled",false)
                }else{
                	$("#btnPost").prop("disabled",true)
                }

            });
            
        },
	    theme: "modern",
	   
	    //- paste_as_text: false,
	    paste_data_images: true,
	    paste_enable_default_filters: false,
	    //- plugins:[
	    //- 	'paste'
	    //- ]
	    plugins: [
	      "advlist autolink lists link image charmap print preview hr anchor pagebreak",
	      "searchreplace wordcount visualblocks visualchars code fullscreen",
	      "insertdatetime media nonbreaking save table contextmenu directionality",
	      "emoticons template textcolor paste colorpicker textpattern"
	    ],
	    theme_advanced_buttons3_add : "emotions",
	    table_default_styles: {
		    fontWeight: 'bold',
		    borderTop: '1px solid black'
		},
	    toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
	    toolbar2: "print preview media | forecolor backcolor emoticons",
	     theme_advanced_buttons3_add : "tablecontrols",
        table_styles : "Header 1=header1;Header 2=header2;Header 3=header3",
        
       
	    file_picker_callback: function(callback, value, meta) {
			if (meta.filetype == 'image') {
				$('#upload').trigger('click');
				$('#upload').on('change', function() {
				    var file = this.files[0];
				    var reader = new FileReader();
				    reader.onload = function(e) {
					    callback(e.target.result, {
					       alt: ''
					    });
				 	};
				  	reader.readAsDataURL(file);
				});
			}
	    },
	    templates: [{
	        title: 'Test template 1',
	        content: 'Test 1'
	    }, {
	        title: 'Test template 2',
	        content: 'Test 2'
	    }]
	});
}

function postDB(option){
	if(option===undefined){
		var option = {}
	}

	var postTo = option.postTo||undefined
	var postToValue = option.postToValue||undefined
	var postText = option.postText||undefined
	var filter = option.filter||undefined
	var userArray = option.userArray||undefined
	var shareOriginalUserId = option.shareOriginalUserId||undefined

	console.log('postText'+postText)
	var userArrayString = JSON.stringify(userArray,4, null)
	if(postToValue !== "ALL"){
	var postToValue = JSON.stringify(postToValue,4, null)
	}
	
	$.post('/notif/post',{
		postTo:postTo,
		postToValue:postToValue,
		shareOriginalUserId:shareOriginalUserId,
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
	var postSize = option.postSize||'Medium'
	var byMe = option.byMe||false
	var byOther = option.byOther||false
	var viewOnly = option.viewOnly||false
	var postId = option.postId||false
	var tagName = option.tagName||false
	var tagCategory = option.tagCategory||false
	var tagType = option.tagType||false
	var hideDownload = option.hideDownload||false
	var hideImage = option.hideImage||false
	var hideVideo = option.hideVideo||false
	var hidePreview = option.hidePreview||false
	var sDate = option.sDate||moment(new Date()).subtract(365, 'days').format('MM-DD-YYYY')
	var eDate = option.eDate||moment(new Date()).add(3,'days').format('MM-DD-YYYY')
	var viewFormat = option.viewFormat||'Panel'
	console.log('xxxViewOption:'+ viewOption)
	console.log('viewFormat:'+ viewFormat)

	
	
	
	var loadNumber = 0
	//Initial feeds
		getFeed()
		console.log('initial feeds')


	//Active scrolling: loading main post as users scrolling
	

	var listId = []

	if (postSize === "List"){
		loadNumber = 12

		var tableFeed = document.createElement('table')
			tableFeed.className = 'table table-sm'
			tableFeed.id = 'tblFeed'
				var theadFeed = document.createElement('thead')
					var trHeadFeed = document.createElement('tr')

						var headerFeed = ['Preview','Document','Option','Posted', 'Date']
						headerFeed.forEach(function (item) {
							

							if(item === 'Option'){

								var tdOptMenu = document.createElement('td')
								tdOptMenu.id = 'thSticky'

								//Post option menue
								var postOpt = document.createElement('span')
								
								postOpt.id = 'postOptAll'
								postOpt.style.display = 'None'
								postOpt.style.color = '#2196F3'
								postOpt.className = 'glyphicon glyphicon-collapse-down'
								postOpt.onclick = function(){
									var thisPostDiv = this.parentNode.parentNode
									
									// console.log(event.clientY)
									
									var divTitleCoords = divPostContainer.getBoundingClientRect()
									var postOptCoords = this.getBoundingClientRect()

									// console.log(postOptCoords)
									// console.log(divTitleCoords)

									$('#postOptContainer').length>0?$('#postOptContainer').remove():''
									var postOptContainer = document.createElement('div')
									postOptContainer.style.top = postOptCoords.bottom - divTitleCoords.top+ 200 +'px'
									postOptContainer.style.left = postOptCoords.left - divTitleCoords.left + 'px'
									postOptContainer.className = 'popUpContainer'
									postOptContainer.id = 'postOptContainer'

										closeRedIcon(postOptContainer,postOptContainer)
										var postOptContainerUl = document.createElement('ul')
											postOptContainerUl.setAttribute('style', 'list-style:none;padding:5px 10px 5px 10px;')
											
											var optList = ['Hide', 'Save', 'Unsave']
											optList.forEach(function(option){
												var postOptContainerLi = document.createElement('li')
													var a = document.createElement('a')
													a.href='#'
													a.innerHTML = option
													a.onclick = function(){
														event.preventDefault()
														listId = listId.filter( function( item, index, inputArray ) {
													           return inputArray.indexOf(item) == index;
													    });
														postOptClick(this.innerHTML, postOptCoords.bottom - divTitleCoords.top+ 340 +'px',
														 postOptCoords.left - divTitleCoords.left + 'px', tdOptMenu, listId)
													}
													postOptContainerLi.appendChild(a)
												postOptContainerUl.appendChild(postOptContainerLi)
											})
										postOptContainer.appendChild(postOptContainerUl)
									tdOptMenu.appendChild(postOptContainer)
								}
								tdOptMenu.appendChild(postOpt)
							trHeadFeed.appendChild(tdOptMenu)

							}else if (item ==='Preview'){

								var th = document.createElement('th')
								th.setAttribute('scope', 'col')
								th.id = 'th'+item
								

								var thPreviewText = document.createElement('span')
								thPreviewText.id = 'thPreviewText'
								thPreviewText.innerHTML = 'Preview'
								th.appendChild(thPreviewText)

								var cboxLabel = document.createElement('label')
									cboxLabel.className = 'cboxLabel'
									var cboxInput = document.createElement('input')
									cboxInput.type = 'checkbox'
									cboxInput.name = post.id
									cboxInput.addEventListener('click', function(){
										var checkBoxList = this.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName("input")
										if(this.checked=== true){
											
											var cboxCount = 0
											for (var i=0; i<checkBoxList.length; i++) {       
									           if (checkBoxList[i].type == "checkbox"){
									           		checkBoxList[i].checked = true
									              	cboxCount++;
									           }
											}

											if(cboxCount!==0){
												thPreviewText.innerHTML = (cboxCount-1)+' of '+ (checkBoxList.length-1)
												$('#thPreviewText').css('color', '#2196F3')
	    										$('#postOptAll').show()
	    									}


											if(this.checked === true){
												//Add checkbox name to Array when check
												listId.push(post.id)
											}else{
												//Otherwise remove from Array
												var itemIndex = listId.indexOf(post.id)
												listId.splice(itemIndex, 1)

											}

										}else{
											$('#postOptAll').hide()
											thPreviewText.innerHTML = "Preview"
											$('#thPreviewText').css('color', 'black')
											for (var i=0; i<checkBoxList.length; i++) {       
									           if (checkBoxList[i].type == "checkbox"){
									           		checkBoxList[i].checked = false
									           }
											}
										}

										
									})
									cboxLabel.appendChild(cboxInput)

									var checkmark = document.createElement('span')
									checkmark.className = 'checkmark'
									cboxLabel.appendChild(checkmark)
									th.appendChild(cboxLabel)


								trHeadFeed.appendChild(th)

								

							}else{
								var th = document.createElement('th')
								th.setAttribute('scope', 'col')
								th.id = 'th'+item
								th.innerHTML = item
								trHeadFeed.appendChild(th)
							}


						})

						
					theadFeed.appendChild(trHeadFeed)
				tableFeed.appendChild(theadFeed)

		divPostContainer.appendChild(tableFeed)	
		
	}else{
		loadNumber = 5
	}

	

	//determind when scroll to the bottom
	window.onscroll = function(event){
		//Adding to checkbox total when loading more item
		var checkBoxList = document.getElementById('tblFeed').getElementsByTagName('input')
		var cboxCount = 0
		for (var i=0; i<checkBoxList.length; i++) {       
           if (checkBoxList[i].type == "checkbox" && checkBoxList[i].checked == true){
              	cboxCount++;
           }
		}
		$('#thPreviewText').text(cboxCount+' of '+ (checkBoxList.length-1))


		console.log('xxx:'+ viewFormat)
		var wrap = document.getElementById('divPostContainer')
		var containHeight = wrap.offsetHeight //height of loaded contain
		var yOffset = window.pageYOffset  //how much scrolled to the top
		var windowHt = window.innerHeight // height of visible contain
		var y = yOffset + windowHt

		if(postSize === 'List'){
			console.log('xxxx')
			if(y >= containHeight){
				//load more feeds when at bottom of the page
				getFeed()
				loadNumber = loadNumber + 12
			}
		}else{
			if(y >= containHeight ){
				//load more feeds when at bottom of the page
				getFeed()
				console.log('next feeds')
				loadNumber = loadNumber + 5
			}
		}
		
	}

	function getFeed(){
		
		console.log('loadNumber:'+loadNumber)
		// console.log('eDate:'+ eDate)
		// console.log('viewOption'+ viewOption)
		if (postSize === 'List'){
				

				var tbodyFeed = document.createElement('tbody')
					$.post('/notif/getFeed',{
						loadNumber:loadNumber,
						limit:12,
						viewOption:viewOption,
						viewOnly:viewOnly,
						byMe:byMe,
						byOther:byOther,
						postId:postId,
						tagName: tagName,
						tagType:tagType,
						tagCategory:tagCategory,
						sDate:sDate,
						eDate:eDate
					}).done(function(Rdata){
						console.log('llllllllllllll')
						console.log(Rdata)
						Rdata.posts.forEach(function(post, i){

							var tempDiv = document.createElement('div')
							tempDiv.id = 'tempDiv'
							tempDiv.innerHTML = post.postText
							divPostContainer.appendChild(tempDiv)
							
							$("#tempDiv").each(function(){
								
								var tdNameItem 
								$(this).find('a').each(function(){
									var ahref = this.parentNode.firstChild
									console.log(ahref)
									var trBodyFeed = document.createElement('tr')
										var tdPostId = document.createElement('td')

											

											var span = document.createElement('span')
											span.className = "glyphicon glyphicon-eye-open"
											span.style.fontSize = "20px"
											span.addEventListener('click', divPreview)
											span.addEventListener('mouseenter', divPreview)

											function divPreview(){
												console.log(this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id)
												$('#divPreview').remove()
												var divPreview = document.createElement('div')
												divPreview.id = 'divPreview'

												//gradually appear
												divPreview.style.opacity= 0;
												if(ahref.nodeName === 'IMG'){
														var imgPreview = document.createElement('img')
														imgPreview.setAttribute("style","max-width:100%;max-height:100%")
														imgPreview.src = ahref.src
														divPreview.appendChild(imgPreview)
													}else if (ahref.nodeName === 'IFRAME'){
														divPreview.setAttribute("style","width:75%;height:75%")
														var iframPreview = document.createElement('iframe')
														iframPreview.setAttribute("style","width:100%;height:100%")
														iframPreview.src = ahref.src

														divPreview.appendChild(iframPreview)
													}
												
												divPreview.style.top = '150px'
													
												var a = 0 
												var myInv = setInterval(function(){
														a = a + 0.1
														divPreview.style.opacity= a;
														a>1?clearInterval(myInv):""
													
												}, 50)

													var xclose = document.createElement('span')
													xclose.style.position = 'absolute'
													xclose.style.right = '-13px'
													xclose.style.top = '-25px'
													xclose.style.fontSize = "25px"
													xclose.style.color = '#078282'
													xclose.className = "glyphicon glyphicon-remove"
													xclose.addEventListener('click', function(){
														divPreview.remove()
													})
													divPreview.appendChild(xclose)
												
												if(this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id === 'Feed'){
													$('#Feed').append(divPreview)
												}else{
													$('#TagManager').append(divPreview)	
												}
												
												


											}
											tdPostId.appendChild(span)


											var spaninfo = document.createElement('span')
											spaninfo.className = "glyphicon glyphicon-info-sign"
											spaninfo.style.fontSize = "20px"
											spaninfo.style.paddingLeft = '5px'

											spaninfo.addEventListener('click', function(){
												document.location = ("/notif?postId="+ post.id)
											})
											tdPostId.appendChild(spaninfo)

											var cboxLabel = document.createElement('label')
												cboxLabel.className = 'cboxLabel'
												var cboxInput = document.createElement('input')
												cboxInput.type = 'checkbox'
												cboxInput.name = post.id
												cboxInput.addEventListener('click', function(){
													var checkBoxList = this.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName("input")
													var cboxCount = 0
													for (var i=0; i<checkBoxList.length; i++) {       
											           if (checkBoxList[i].type == "checkbox" && checkBoxList[i].checked == true){
											              	cboxCount++;
											           }
	        										}

	        										if(cboxCount==0){
										           		$('#thPreviewText').text("Preview")
        												$('#thPreviewText').css('color', 'black')
        												$('#postOptAll').hide()

										           }else{
	        											$('#thPreviewText').text(cboxCount+' of '+ (checkBoxList.length-1) )
		        										$('#thPreviewText').css('color', '#2196F3')
		        										$('#postOptAll').show()
		        									}


													if(this.checked === true){
														//Add checkbox name to Array when check
														listId.push(post.id)
													}else{
														//Otherwise remove from Array
														var itemIndex = listId.indexOf(post.id)
														listId.splice(itemIndex, 1)

													}

													
												})
												cboxLabel.appendChild(cboxInput)

												var checkmark = document.createElement('span')
												checkmark.className = 'checkmark'
												cboxLabel.appendChild(checkmark)
											tdPostId.appendChild(cboxLabel)




											var checkBox = document.createElement('input')
											checkBox.type = 'checkbox'
											checkBox.style.fontSize ='20px'
											checkBox.value = 'value'

											checkBox.name = post.id
											checkBox.addEventListener('click', function(){
												var checkBoxList = this.parentNode.parentNode.parentNode.parentNode.getElementsByTagName("input")
												var cboxCount = 0
												for (var i=0; i<checkBoxList.length; i++) {       
										           if (checkBoxList[i].type == "checkbox" && checkBoxList[i].checked == true){
										              cboxCount++;
										              
										           }

        										}
        										console.log(cboxCount)
        										$('#thPreview').text('Selected: '+cboxCount)
        										$('#thPreview').css('color', 'red')
												if(this.checked === true){
													listId.push(post.id)
												}else{
													var itemIndex = listId.indexOf(post.id)
													listId.splice(itemIndex, 1)

												}

												
											})
											// tdPostId.appendChild(checkBox)
										
										trBodyFeed.appendChild(tdPostId)

										var tdName = document.createElement('td')
										// tdName.id = "tdName"+ i
										tdName.appendChild(this)

										trBodyFeed.appendChild(tdName)

										var tdOptMenu = document.createElement('td')
											//Post option menue
											var postOpt = document.createElement('span')
											postOpt.id = 'postOpt'
											postOpt.className = 'glyphicon glyphicon-collapse-down'
											postOpt.onclick = function(){
											var thisPostDiv = this.parentNode.parentNode
												
												// console.log(event.clientY)
												
												var divTitleCoords = divPostContainer.getBoundingClientRect()
												var postOptCoords = this.getBoundingClientRect()

												// console.log(postOptCoords)
												// console.log(divTitleCoords)

												$('#postOptContainer').length>0?$('#postOptContainer').remove():''
												var postOptContainer = document.createElement('div')
												postOptContainer.style.top = postOptCoords.bottom - divTitleCoords.top+ 200 +'px'
												postOptContainer.style.left = postOptCoords.left - divTitleCoords.left + 'px'
												postOptContainer.className = 'popUpContainer'
												postOptContainer.id = 'postOptContainer'

													closeRedIcon(postOptContainer,postOptContainer)
													var postOptContainerUl = document.createElement('ul')
														postOptContainerUl.setAttribute('style', 'list-style:none;padding:5px 10px 5px 10px;')
														
														var optList = ['Hide', 'Share', 'Email', 'Save', 'Unsave']
														optList.forEach(function(option){
															var postOptContainerLi = document.createElement('li')
																var a = document.createElement('a')
																a.href='#'
																a.innerHTML = option
																a.onclick = function(){
																	event.preventDefault()
																	postOptClick(this.innerHTML, postOptCoords.bottom - divTitleCoords.top+ 340 +'px',
																	 postOptCoords.left - divTitleCoords.left + 'px', tdPostedBy, post.id)
																}
																postOptContainerLi.appendChild(a)
															postOptContainerUl.appendChild(postOptContainerLi)
														})
													postOptContainer.appendChild(postOptContainerUl)
												tdPostedBy.appendChild(postOptContainer)
												

														

											}
											tdOptMenu.appendChild(postOpt)

										trBodyFeed.appendChild(tdOptMenu)

										var tdPostedBy = document.createElement('td')
										tdPostedBy.innerHTML = post.user.fullName
											
										trBodyFeed.appendChild(tdPostedBy)

										var tdPostDate = document.createElement('td')
										tdPostDate.innerHTML = moment(post.createdAt).format("MMM Do, YYYY")
										trBodyFeed.appendChild(tdPostDate)
									
									tbodyFeed.appendChild(trBodyFeed)
								})

								
							})

							$("#tempDiv").remove()
							
						})

						tableFeed.appendChild(tbodyFeed)
					})
				
				


		
		}else{
			$.post('/notif/getFeed',{
				loadNumber:loadNumber,
				limit:5,
				viewOption:viewOption,
				viewOnly:viewOnly,
				byMe:byMe,
				byOther:byOther,
				postId:postId,
				tagName: tagName,
				tagType:tagType,
				tagCategory:tagCategory,
				sDate:sDate,
				eDate:eDate

			}).done(function(Rdata){
				console.log('pppppppppp')
				console.log(Rdata)

				// var textInPost = function(){
				// 	var result = false;
				// 	var pTags = [].slice.call(document.getElementById('divBody'+i).getElementsByTagName('p'))
				// 	pTags.forEach(function(pTag, u){
				// 		console.log(pTag)
				// 		if(pTag.firstChild.nodeName!=='IMG'&&pTag.firstChild.nodeName!=='IFRAME'){
				// 			result =  true
				// 		}
				// 	})
				// 	return result
				// }
				
				Rdata.posts.forEach(function(post, i){
					var tempDivPostPanel = document.createElement('div')
						tempDivPostPanel.id = 'tempDivPostPanel'
						tempDivPostPanel.innerHTML = post.postText
						divPostContainer.appendChild(tempDivPostPanel)

					var divPostPanel = document.createElement('div')
					
					divPostPanel.className = 'panel panel-success'
					divPostPanel.classList.add('postPanel')
					postSize==='Small'?divPostPanel.style.maxWidth = '300px':""
					postSize==='Medium'?divPostPanel.style.maxWidth = '410px':""
					postSize==='Large'?divPostPanel.style.maxWidth = '600px':""

					var divBody = document.createElement('div')
						divBody.className = 'panel-body'
						divBody.id = 'divBody'+ i
					divPostPanel.appendChild(divBody)

					$("#tempDivPostPanel").find('p').each(function(){
						var p = this
						console.log(p.firstChild)
						if(p.firstChild.nodeName === 'IMG' ){

						

							var img = p.firstChild
							img.setAttribute("style","max-width:120px;max-height:120px")
							img.setAttribute('class','imageThumb')
							// img.classList.add('floating-image')
							img.addEventListener('click', function(){
								var myModal = document.getElementById('myModal')
								myModal.style.display = 'block'
									var aModal = document.createElement('a')
									// aModal.style.color = 'white'
									aModal.href = this.src
									aModal.className = 'aModal'
									// a.download = true
									aModal.innerHTML = 'Full Size'
								myModal.insertBefore(aModal, myModal.firstChild)
								document.getElementById('iframeModal').style.display = 'none'
								document.getElementById('imgModal').style.display = 'block'
								document.getElementById('imgModal').setAttribute('style','max-width:100%;max-height:100%;')
								document.getElementById('imgModal').src = this.src
							})

							divBody.appendChild(img)
						}else if(p.firstChild.nodeName === 'IFRAME'){

							var pIframe = p
							pIframe.className = 'embed-responsive embed-responsive-4by3'
							pIframe.setAttribute('style','clear:both')
							if(hidePreview === true){
								pIframe.setAttribute('style','display:none')
							}
							var jqIframe = $(pIframe).first()
							
							jQuery(document).ready(function($){
								jqIframe.iframeTracker({
									blurCallback: function(){
										
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
							divBody.appendChild(pIframe)

						}else if (p.firstChild.nodeName === 'VIDEO'){
							p.className = 'embed-responsive embed-responsive-4by3'
							divBody.appendChild(p)
						}else{
							divBody.appendChild(p)
						}
						tempDivPostPanel.remove()
					})
		

							
							

						divPostPanel.appendChild(divBody)

						getComment()
						function getComment(){
						
							$.post('/notif/getCommentCount',{
								mainPostId:post.id
							}).done(function(Rdata){
								$('#divTitle'+ post.id).remove()
								var emojCount = Rdata.emojCount
								var divTitle = document.createElement('div')
								divTitle.className = 'panel-heading'

								divTitle.classList.add('postPanel')
								divTitle.id = 'divTitle'+post.id

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
									// comment.addEventListener('click', function(){
									// 	spanBtnText.innerHTML == 'Comments'?spanBtnText.innerHTML = 'Collapse':spanBtnText.innerHTML= 'Comments'
									// })

									comment.addEventListener('mouseenter', function(){
										spanBtnText.innerHTML= 'Comments'
										$.post('/notif/getComment',{
											mainPostId:post.id
										}).done(function(Rdata1){
											// console.log(Rdata1)
											// $('#comment'+ post.id).length>0?$('#comment'+ post.id).remove():""
											$('#comment'+ post.id).remove()
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
															// console.log(replyPost.value)
															// console.log(post.id)
															$.post('/notif/replyPost',{
																mainPostId:post.id,
																comment:replyPost.value
															}).done(function(commentx){
																// if(!!Rdata){
																
																// 	divTitle.parentNode.removeChild(divTitle)
																// 	alert('done')
																// 	// var divComment = document.createElement('div')
																// 	// divComment.innerHTML = Rdata.comment.comment
																	
																// 	// divCommentContainer.insertBefore(divComment, divCommentPost)
																// }
																
															})
															getComment()
														}) 
														span.appendChild(btn)
													divCommentPost.appendChild(span)
												divCommentContainer.appendChild(divCommentPost)
											}
											divTitle.appendChild(divCommentContainer)
										})
									})

									divTitle.appendChild(comment)


								  	//Post option menue
									var postOpt = document.createElement('span')
									postOpt.id = 'postOpt'
									postOpt.className = 'glyphicon glyphicon-collapse-down'
									postOpt.onclick = function(){
									var thisPostDiv = this.parentNode.parentNode
										
										// console.log(event.clientY)
										
										var divTitleCoords = divTitle.getBoundingClientRect()
										var postOptCoords = this.getBoundingClientRect()

										// console.log(postOptCoords)
										// console.log(divTitleCoords)
										$('#postOptContainer').length>0?$('#postOptContainer').remove():''
										var postOptContainer = document.createElement('div')
										postOptContainer.style.top = postOptCoords.bottom - divTitleCoords.top +'px'
										postOptContainer.style.left = postOptCoords.left - divTitleCoords.left + 'px'
										postOptContainer.className = 'popUpContainer'
										postOptContainer.id = 'postOptContainer'
											// var span = document.createElement('span')
											// span.innerHTML = '';
											// span.style.color = 'red'
											// span.style.float = 'right'
											// span.className = "glyphicon glyphicon-remove-circle"
											// span.id = 'delGly';
											// //- click the 'x' to remove from list
											// span.addEventListener('click', function(){
											// 	$('#postOptContainer').remove()
												
												
											// });
											// postOptContainer.appendChild(span)
											closeRedIcon(postOptContainer,postOptContainer)
											

											var postOptContainerUl = document.createElement('ul')
												postOptContainerUl.setAttribute('style', 'list-style:none;padding:5px 10px 5px 10px;')
												
												var optList = ['Hide', 'Share', 'Email', 'Save', 'Unsave']
												optList.forEach(function(option){
													var postOptContainerLi = document.createElement('li')
														var a = document.createElement('a')
														a.href='#'
														a.innerHTML = option
														a.onclick = function(){
															event.preventDefault()
															postOptClick(this.innerHTML, postOptCoords, divTitleCoords, divTitle, post.id)
														}
														postOptContainerLi.appendChild(a)
													postOptContainerUl.appendChild(postOptContainerLi)
												})
											postOptContainer.appendChild(postOptContainerUl)
										divTitle.appendChild(postOptContainer)
									}
									divTitle.appendChild(postOpt)

									

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
									
									//Selection of Emoj for user to click on
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
													// console.log(spanEmojDock.className)
													$.post('/notif/addPostEmoj',{
														mainPostId:post.id,
														commentEmoj:spanEmojDock.className
													}).done(function(Rdata){
														// console.log(Rdata)
														divTitle.parentNode.removeChild(divTitle)
														getComment()
														alert('done')
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
									
								divPostPanel.appendChild(divTitle)
							})
						}	

					divPostContainer.appendChild(divPostPanel)

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

				})

			})
		}
	}
	return true
}

function postOptClick(option, verticalPos, horizontalPos, parentDiv, postIds){
	if(option === "Save"){
		
		// console.log(divTitleCoords)
		var saveToContainer = document.createElement('div')
		saveToContainer.style.top = verticalPos
		saveToContainer.style.left = horizontalPos
		saveToContainer.style.width = '300px'
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
						input.placeholder = 'Search Tag to Save'
						
						spanTH.appendChild(input)
					divTHField.appendChild(spanTH)
				divTHContainer.appendChild(divTHField)
			saveToContainer.appendChild(divTHContainer)
			
		parentDiv.appendChild(saveToContainer)


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
		    },
		    
		    source: {
		    	// newTag:{
		    	// 	display:['tagName','type'],
		    	// 	data:[
		    	// 		{tagName:'New Tag',type:'personal'},
	      //       		{tagName:'New Tag',type:'department'}
	      //       	]
		    	// },
	            tagSave:{
	            	
		           	ajax: {
		            	type:'POST',
		                url: '/notif/getTagSave'
		                
		            }
		        }
		    },
		    callback: {
		        
		        onClickAfter: function (node, a, item, event) {
		    //     	event.preventDefault();
		    //     	console.log(event.target)
		 			// console.log(node)
		    //         console.log(a)
		    //         console.log(item)
		    //         console.log(event)

			            

					$.post('/notif/postTagSave',{
						mainPostIds:postIds,
						type:item.type,
						tagName:item.tagName,
						category:item.category
					}).done(function(){
						$('#result-container').text('');
					})
		 
		        },
		        onResult: function (node, query, result, resultCount) {
		            if (query === "") return;
		            $('#addTag').html("")
		            // console.log(query.length)
		            // console.log($('#addTagBtn'))
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
			 						// console.log('adding'+ addTagCategory.value)
			 							$.post('/notif/postTagSave',{
										mainPostIds:postIds,
										category:addTagCategory.value.toUpperCase(),
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
		                text = 'Showing <strong>' + result.length + '</strong> tags matching "' + query + '"';
		            } else {
		                text = 'No results matching "' + query + '"';
		            }
		            $('#result-container').html(text);
		 
		        }
		    }
		});
	}else if(option==='Unsave'){

		var saveToContainer = document.createElement('div')
		saveToContainer.style.top = verticalPos
		saveToContainer.style.left = horizontalPos
		saveToContainer.className = 'popUpContainer'
		saveToContainer.style.width = '300px'
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
						input.placeholder = 'Search and click tag to unsave'
						
						spanTH.appendChild(input)
					divTHField.appendChild(spanTH)
				divTHContainer.appendChild(divTHField)
			saveToContainer.appendChild(divTHContainer)
			
		parentDiv.appendChild(saveToContainer)

		
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
		    },
		    
		    source: {
		    	// newTag:{
		    	// 	display:['tagName','type'],
		    	// 	data:[
		    	// 		{tagName:'New Tag',type:'personal'},
	      //       		{tagName:'New Tag',type:'department'}
	      //       	]
		    	// },
	            tagSave:{
	            	
		           	ajax: {
		            	type:'POST',
		                url: '/notif/getTagToUnsave',
		                data:{
		                	postIds:postIds
		                }
		                
		            }
		        }
		    },
		    callback: {
		        
		        onClickAfter: function (node, a, item, event) {
		        	event.preventDefault();
		    //     	console.log(event.target)
		 			// console.log(node)
		    //         console.log(a)
		    //         console.log(item)
		    //         console.log(event)

			            

					$.post('/notif/unsaveTag',{
						mainPostIds:postIds,
						type:item.type,
						tagName:item.tagName,
						category:item.category
					}).done(function(){
						$('#result-container').text('');
					})
		 
		        },
		        onResult: function (node, query, result, resultCount) {
		            

		            var text = "";
		            if (result.length > 0 && result.length < resultCount) {
		                text = "Showing <strong>" + result.length + "</strong> of <strong>" + resultCount + '</strong> elements matching "' + query + '"';
		            } else if (result.length > 0) {
		                text = 'Showing <strong>' + result.length + '</strong> elements matching "' + query + '"';
		            } else {
		                text = 'This post has not been saved';
		            }
		            $('#result-container').html(text);
		 
		        }
		    }
		});
	}else if(option==='Hide'){

		$.post('/notif/hidePost',{
			mainPostIds:postIds
		}).done(function(hidden){
			location.reload()
			// thisPostDiv.remove()
		})
	}else if(option==='Share'){
		document.location = ("/notif?postId="+ postId + "&command=share")

	}else if(option === 'Email'){
		console.log(parentDiv.parentNode.childNodes[1])
		var emailWindow = document.createElement('div')
		emailWindow.id = 'emailWindow'
		emailWindow.style.top = '150px'
			closeRedIcon(emailWindow, emailWindow)

			var mailRecipient = document.createElement('input')
			mailRecipient.style.width = '500px'
			mailRecipient.placeholder = 'Enter comma seperated emails'
			emailWindow.appendChild(mailRecipient)

			var btnSendMail = document.createElement('input')
			btnSendMail.type = 'button'
			btnSendMail.value = 'SEND'
			btnSendMail.addEventListener('click',function(){
				
				var stringMailRec = mailRecipient.value.replace(/\s+/g, '')
				var arrayMailRec = stringMailRec.split(',')
				var emailValid = true
				arrayMailRec.forEach(function(item){
					if(ValidateEmail(item)!==true){
						alert('Please verify this email address:  '+ ValidateEmail(item))
						emailValid = false
					}
				})

				if (emailValid){
					var attachmentExist = false
					$(parentDiv.parentNode.firstChild).find('img').each(function(){
						attachmentExist = true
						var s3ImageLink = $(this).attr('src')
						getS3File(s3ImageLink)
					})

					$(parentDiv.parentNode.firstChild).find('a').each(function(){
						attachmentExist = true
		 	
						var s3fileLink = $(this).attr('href')
						getS3File(s3fileLink)
						
					})

					$(parentDiv.parentNode.firstChild).find('source').each(function(){
						attachmentExist = true
		 	
						var s3VideoLink = $(this).attr('src')
						getS3File(s3VideoLink)
						
					})

					$(parentDiv.parentNode.childNodes[1]).find('img').each(function(){
						attachmentExist = true
						var s3ImageLink = $(this).attr('src')
						getS3File(s3ImageLink)
					})

					$(parentDiv.parentNode.childNodes[1]).find('a').each(function(){
						attachmentExist = true
		 	
						var s3fileLink = $(this).attr('href')
						getS3File(s3fileLink)
						
					})

					$(parentDiv.parentNode.childNodes[1]).find('source').each(function(){
						attachmentExist = true
		 	
						var s3VideoLink = $(this).attr('src')
						getS3File(s3VideoLink)
						
					})
					function getS3File(s3Link){

					
						const xhr = new XMLHttpRequest();
						xhr.open('GET', s3Link, true);
						xhr.responseType = 'arraybuffer'
						// xhr.withCredentials = true
						xhr.onreadystatechange = function(res){
							if(xhr.readyState === 4){
							  	if(xhr.status === 200){
								    console.log(xhr.response)
								    console.log(xhr)
								    var fileExt = xhr.responseURL.slice(xhr.responseURL.lastIndexOf('.')+1)
									  	var mimeTypeRef ={
									  		aac	:'audio/aac',
											abw	:'application/x-abiword',
											arc	:'application/octet-stream',
											avi	:'video/x-msvideo',
											azw	:'application/vndamazonebook',
											bin	:'application/octet-stream',
											aac	:'audio/aac',
											abw	:'application/x-abiword',
											arc	:'application/octet-stream',
											avi	:'video/x-msvideo',
											azw	:'application/vndamazonebook',
											bin	:'application/octet-stream',
											bz	:'application/x-bzip',
											bz2	:'application/x-bzip2',
											csh	:'application/x-csh',
											css	:'text/css',
											csv	:'text/csv',
											doc	:'application/msword',
											docx:'application/vndopenxmlformats-officedocumentwordprocessingmldocument',
											eot	:'application/vndms-fontobject',
											epub:'application/epub+zip',
											gif	:'image/gif',
											htm:'text/html',
											html:'text/html',
											ico	:'image/x-icon',
											ics	:'text/calendar',
											jar	:'application/java-archive',
											jpeg:'image/jpeg',
											jpg	:'image/jpeg',
											js	:'application/javascript',
											json	:'application/json',
											mid:'audio/midi',
											midi	:'audio/midi',
											mpeg	:'video/mpeg',
											mpkg	:',application/vnd/apple.installer+xml',
											mp4:'application/mp4',
											odp	:'application/vndoasisopendocumentpresentation',
											ods	:'application/vndoasisopendocumentspreadsheet',
											odt	:'application/vndoasisopendocumenttext',
											oga	:'audio/ogg',
											ogv	:'video/ogg',
											ogx	:'application/ogg',
											otf	:'font/otf',
											png	:'image/png',
											pdf	:'application/pdf',
											ppt	:'application/vndms-powerpoint',
											pptx	:'application/vndopenxmlformats-officedocumentpresentationmlpresentation',
											rar	:'application/x-rar-compressed',
											rtf	:'application/rtf',
											sh	:'application/x-sh',
											svg	:'image/svg+xml',
											swf	:'application/x-shockwave-flash',
											tar	:'application/x-tar',
											tif:'image/tiff',
											tiff	:'image/tiff',
											ts	:'application/typescript',
											ttf	:'font/ttf',
											vsd	:'application/vndvisio',
											wav	:'audio/x-wav',
											weba	:'audio/webm',
											webm	:'video/webm',
											webp	:'image/webp',
											woff	:'font/woff',
											woff2	:'font/woff2',
											xhtml	:'application/xhtml+xml',
											xls	:'application/vndms-excel',
											xlsx:	'application/vndopenxmlformats-officedocumentspreadsheetmlsheet',
											xml:	'application/xml',
											xul:	'application/vndmozillaxul+xml',
											zip:	'application/zip',
											'3gp':	'video/3gpp',
											'3g2':	'video/3gpp2',
											'7z':	'application/x-7z-compressed'

									  	}
									  	console.log(fileExt)
									  	console.log(mimeTypeRef[fileExt])
								    var mimeType = mimeTypeRef[fileExt]
								    var fileName = xhr.responseURL.slice(xhr.responseURL.lastIndexOf('/')+1)
								    var blob = new Blob([xhr.response], {type:mimeType});
								    var fd = new FormData()
								    fd.append('file', blob, fileName)
								    fd.append('mailRecipient', stringMailRec)
								    
								    $.ajax({
								    	url: '/notif/emailAttachmentFile',
								    	type: 'POST',
								    	data:fd,
								    	contentType: false,
								    	processData: false,
								    	success: function(data){
								    		if(data.labelIds[0]=='SENT'){
								    			var p = document.createElement('p')
								    			p.innerHTML = 'EMAIL SENT'
								    			p.style.color = 'red'
								    			emailWindow.appendChild(p)
								    			setTimeout(function(){
													$('#emailWindow').fadeOut()
													emailWindow.remove()
												}, 3000)
								    			
								    		}
								    		
								    	}, 
								    	error: function(){
								    		var p = document.createElement('p')
								    			p.innerHTML = 'Email can not be sent. Please try again and/or contact Admin'
								    			p.style.color = 'red'
								    			emailWindow.appendChild(p)
								    			setTimeout(function(){
													$('#emailWindow').fadeOut()
													emailWindow.remove()
												}, 3000)

								    	}

								    // 	function sendEmailConfirm(){
								    // 		var p = document.createElement('p')
								    // 			p.innerHTML = 'Email can not be sent. Please try again and/or contact Admin'
								    // 			p.style.color = 'red'
								    // 			emailWindow.appendChild(p)
								    // 			setTimeout(function(){
												// 	$('#emailWindow').fadeOut()
												// 	emailWindow.remove()
												// }, 2000)

								    // 	}

								    })





								   
								    // console.log(blob)
								 //    var reader = new window.FileReader();
									// reader.readAsDataURL(blob); 
									// reader.onloadend = function() {
							  //           base64data = reader.result.split('base64,')[1];                
									  


									//     var boundary = "foo_bar_baz";
									//     var mailTo = stringMailRec
									//     var mailSubject = 'Attachment(s) from wkopro.com'
									//     var fileName = xhr.responseURL.slice(xhr.responseURL.lastIndexOf('/')+1)
									//     var mailBody =  $('#curUserName').text() + ' from wkopro.com web application sent you an attachment.'
									// 	var content = [
									// 		'Content-Type: multipart/mixed; boundary="foo_bar_baz"\r\n',
									// 		'MIME-Version: 1.0\r\n',
									// 		// 'From: ngokhanhthien@yahoo.com\r\n',
									// 		'To: '+ mailTo + '\r\n',
									// 		'Subject: ' + mailSubject + '\r\n\r\n',

									// 		'--foo_bar_baz\r\n',
									// 		'Content-Type: text/plain; charset="UTF-8"\r\n',
									// 		'MIME-Version: 1.0\r\n',
									// 		'Content-Transfer-Encoding: 7bit\r\n\r\n',

									// 		mailBody + '\r\n\r\n',

									// 		'--foo_bar_baz\r\n',
									// 		'Content-Type: '+ mimeType +'\r\n',
									// 		'MIME-Version: 1.0\r\n',
									// 		'Content-Transfer-Encoding: base64\r\n',
									// 		'Content-Disposition: attachment; filename='+ fileName+ '\r\n\r\n',

									// 		base64data, '\r\n\r\n',

									// 		'--foo_bar_baz--'
								 //   		].join('');
										  
									// 	var sendRequest = gapi.client.gmail.users.messages.send({
									// 	    'userId': 'me',
									// 	    'resource': {
									// 	      'raw': window.btoa(content).replace(/\+/g, '-').replace(/\//g, '_')
									// 	    }
									// 	});

									// 	sendRequest.execute(function(send){
									// 		console.log(send)
									// 	});
									// }
									

								}
							}

						}
						xhr.onload = function(item){
							console.log(item)
						}
						xhr.onerror = function(err){
							console.log(err)
							var p = document.createElement('p')
			    			p.innerHTML = 'Unable to compose file for email. Please contact Admin'
			    			p.style.color = 'red'
			    			emailWindow.appendChild(p)
			    			setTimeout(function(){
								$('#emailWindow').fadeOut()
								emailWindow.remove()
							}, 3000)
						}
						xhr.send()
					}
					console.log(attachmentExist)
					if(!attachmentExist){
						var p = document.createElement('p')
			    			p.innerHTML= 'There is no attachment in post to email'
			    			p.style.color = 'red'
			    			emailWindow.appendChild(p)
			    			setTimeout(function(){
								$('#emailWindow').fadeOut()
								emailWindow.remove()
							}, 3000)
					}
				}

			})

			emailWindow.appendChild(btnSendMail)

		$('#Feed').append(emailWindow)

		// var span = document.createElement('span')
		// span.innerHTML = '';
		// span.style.color = 'red'
		// span.style.float = 'right'
		// span.className = "glyphicon glyphicon-remove-circle"
		// span.id = 'delGly';
		// //- click the 'x' to remove from list
		// span.addEventListener('click', function(){
		// 	emailWindow.remove()
			
			
		// });
		// parentDiv.appendChild(span)

		

	}

	//click event control diapprearing of the popup menu
	window.onclick = function(){
		console.log(event.target.id)
		if(event.target.id == 'postOpt'){
			
		} else if(event.target.innerHTML == 'Save'
			||event.target.type=='search'
			||event.target.id == 'addTagBtn'
			||event.target.id=='addTagCategory'
			||event.target.id=='addTagCategoryBtn'
		){

		} else if(event.target.innerHTML == 'Unsave'){

		}else{
			$('#saveToContainer').remove()
			$('#postOptContainer').remove()
		}
		
	}
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
			 	// console.log(result)
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

var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
