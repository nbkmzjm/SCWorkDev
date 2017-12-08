function gmailAPI(){
	$('#AdminMail').html('')
	var divMailContainer = document.createElement('div')

	var tableMail = document.createElement('table')
	tableMail.className = 'table table-sm'
	tableMail.id = 'tblMail'
		var theadMail= document.createElement('thead')
			var trHeadMail = document.createElement('tr')
				var headerMail = ['From','Preview', 'Recieved', 'Attachment']
				headerMail.forEach(function (item) {
					var th = document.createElement('th')
					th.setAttribute('scope', 'col')
					th.innerHTML = item
					theadMail.appendChild(th)
				})
				
			theadMail.appendChild(trHeadMail)
		tableMail.appendChild(theadMail)

	divMailContainer.appendChild(tableMail)


	$('#AdminMail').append(divMailContainer)
	
	console.log('listing messages')
	$.post('/notif/getEmailList',{

	}).done(function(Rdata){
		console.log(Rdata)
		if(!!Rdata.messages){

		
			var messageIds = Rdata.messages
			messageIds.forEach(function(messageId){
				$.post('/notif/getEmailMessage',{
					id:messageId.id
				}).done(function(message){

					console.log(message)
					var mailSubject = ''
					var mailCC = ''
					var mailTo = ''
					var mailFrom = ''
					var tbodyMail = document.createElement('tbody')
						var trMail = document.createElement('tr')
							

							var headers = message.payload.headers
							headers.forEach(function(header){
								if(header.name === "From"){
									mailFrom = header.value
									var tdFrom = document.createElement('td')
									tdFrom.innerHTML = header.value
									trMail.appendChild(tdFrom)
								}
							})
							headers.forEach(function(header){
									
								if (header.name === "Subject"){
									mailSubject = header.value
									var tdSub = document.createElement('td')
									tdSub.innerHTML = '<b>'+header.value + '</b> -  ' + message.snippet 
									trMail.appendChild(tdSub)
								}
							})
							headers.forEach(function(header){
								if (header.name === "Date"){
									var tdDate = document.createElement('td')
									if(moment(header.value).isSame(moment(), 'day')){
										tdDate.innerHTML = moment(header.value).format('h:mm A')
									}else{
										tdDate.innerHTML = moment(header.value).format('MMM, DD')
									}
									
									trMail.appendChild(tdDate)
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

							if(message.labelIds.indexOf('UNREAD')!== -1) {
								var tdAttach = document.createElement('td')
								tdAttach.innerHTML = 'x'
								trMail.appendChild(tdAttach)


							}
							var parts = message.payload.parts
							if (parts !== undefined){
								parts.forEach(function(part){
									if(part.filename && part.filename.length > 0){
										var attachId = part.body.attachmentId
										var mimeType = part.mimeType
										console.log(part.filename)
										console.log(message.id)
										//Scan for Email Attachement from new mail
										$.post('/notif/getEmailAttachment',{
											attachId:attachId,
											messageId:message.id
										}).done(function(attachment){
											// console.log(attachment)
											// var decodedAttach = b64toBlob(attachment)
											// console.log(decodedAttach)
											// console.log(Base64.decode(attachment.data))

											//Decode email attchment
											var decodedAttachment = base64URLtoBlob(attachment.data, mimeType)
											decodedAttachment.fileName = part.filename
											console.log(mailSubject)
											var userEmail = mailCC + mailTo + mailFrom

											var regExp = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
											var emailArr = userEmail.match(regExp)
											emailArr = emailArr.filter( function( item, index, inputArray ) {
										           return inputArray.indexOf(item) == index;
										    });
											console.log(decodedAttachment)

											//Trash mail after getting the attachment decoded
											$.post('/notif/trashEmail',{
												messageId:message.id
											}).done(function(changed){

											})
											
											mailAttachmentConversion(decodedAttachment, emailArr, messageId)
										})


									}
								})
							}

						
							
						tbodyMail.appendChild(trMail)
					tableMail.appendChild(tbodyMail)
				})
			})
		}
		
	})
}

function mailAttachmentConversion(decodedAttachment, emailList, messageId){
	var signFileType = decodedAttachment.type
	var signFileName

	var orgFileName = decodedAttachment.fileName
	var fileExtension = orgFileName.substring(orgFileName.lastIndexOf('.'))
	var video = ['.m4v', '.mov', '.mp4', '.MKV', '.AVI', '.VOB', '.MPG', '.TiVo', '.FLV']
	var fileNameNoSpace = orgFileName.replace(/ /g,"_")
	var parts = fileNameNoSpace.split(".");
    if (parts[1]===undefined){
        signFileName = fileNameNoSpace;
    }else if (signFileType.indexOf('image')!== -1){
    	signFileName = parts.slice(0,-1).join('') + moment().format("MMDDHHmmss") +".jpeg"
    }else if(video.indexOf(fileExtension)!==-1){
    	signFileName = parts.slice(0,-1).join('') + moment().format("MMDDHHmmss") +".mp4"
    }else{
        signFileName = parts.slice(0,-1).join('') + moment().format("MMDDHHmmss") + "." 
        + parts.slice(-1)
    }
    console.log('signFileName:'+signFileName)
    
	//Send attachment to AWS for siging
	$.post('/sign-s3', {
		fileName:signFileName,
		fileType:signFileType
	}).then(function(returnData){
		console.log(returnData)


		const xhr = new XMLHttpRequest();
		xhr.open('PUT', returnData.url);
		console.log('decodedAttachment:')
		console.log(decodedAttachment)
		
	    
		xhr.onreadystatechange = function(){

		if(xhr.readyState === 4){
		  	if(xhr.status === 200){
			    console.log('uploaded file')
			    if(signFileType.indexOf('msword')!==-1||signFileType.indexOf('wordprocessingml')!==-1||
			    	signFileType.indexOf('ms-excel')!==-1||signFileType.indexOf('spreadsheetml')!==-1||
			    	signFileType.indexOf('ms-powerpoint')!==-1||signFileType.indexOf('presentationml')!==-1){
			    	var returnURLs = '<p><iframe src="https://view.officeapps.live.com/op/embed.aspx?src='+returnData.url
			    	+'"></iframe><a href="'+returnData.url+'" >'+signFileName+'</a></p><br>'
			    }else if(signFileType.indexOf('pdf')!==-1){
			   		returnURLs = '<p><iframe src="https://docs.google.com/gview?url='+returnData.url
			   		+'&embedded=true"></iframe><a href="'+returnData.url+'" >'+signFileName+'</a></p><br>'
			   		
			   	}else if(signFileType.indexOf('video')!==-1){
			   		var returnURLs = '<p><video controls><source src="'+returnData.url+'"> </video></p>'
			    }else if(signFileType.indexOf('image')!==-1){
			    	var returnURLs = '<p><img src="'+returnData.url+'"/><a href="'+returnData.url+'" >'+signFileName+'</a></p><br>'
			    }else{
			    	var returnURLs = '<p><a href="'+returnData.url+'" >'+signFileName+'</a></p><br>'
			    }



			    $.post('/notif/postAttchmentToDB', {
					emailList:emailList,
					attachUrl:returnURLs
				}).then(function(){

				})
			    console.log('returnURLs:'+ returnURLs)
			   
		  	}else{
		    	alert('Could not upload file.');
		  	}
		}
		};
		xhr.send(decodedAttachment);
	})

}

function base64URLtoBlob(data, type) {
	var base64 = (data).replace(/_/g, '/'); //Replace this characters 
		base64 = base64.replace(/-/g, '+');

    var byteString = atob(base64.replace(/\s/g, ''));

	// Convert that text into a byte array.
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
	    ia[i] = byteString.charCodeAt(i);
	}
    return new Blob([ia], { type: type});
}

// function b64toBlob(b64Data, contentType, sliceSize) {
//   contentType = contentType || '';
//   sliceSize = sliceSize || 512;

//   var byteCharacters = atob(b64Data);
//   var byteArrays = [];

//   for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
//     var slice = byteCharacters.slice(offset, offset + sliceSize);

//     var byteNumbers = new Array(slice.length);
//     for (var i = 0; i < slice.length; i++) {
//       byteNumbers[i] = slice.charCodeAt(i);
//     }

//     var byteArray = new Uint8Array(byteNumbers);

//     byteArrays.push(byteArray);
//   }

//   var blob = new Blob(byteArrays, {type: contentType});
//   return blob;
// }


