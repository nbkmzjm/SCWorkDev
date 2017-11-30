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
								
							if (header.name === "CC"){
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
									console.log(part)
									console.log(message.id)
									$.post('/notif/getEmailAttachment',{
										attachId:attachId,
										messageId:message.id
									}).done(function(attachment){
										// console.log(attachment)
										// var decodedAttach = b64toBlob(attachment)
										// console.log(decodedAttach)
										// console.log(Base64.decode(attachment.data))
										var decodedAttachment = base64URLtoBlob(attachment.data, mimeType)
										decodedAttachment.fileName = part.filename
										console.log(mailSubject)
										var userEmail = mailCC + mailTo + mailFrom

										var regExp = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
										var emailArr = userEmail.match(regExp)
										emailArr = emailArr.filter( function( item, index, inputArray ) {
									           return inputArray.indexOf(item) == index;
									    });
										console.log(emailArr)
										mailAttachmentConversion(decodedAttachment, emailArr)
									})


								}
							})
						}

					
						
					tbodyMail.appendChild(trMail)
				tableMail.appendChild(tbodyMail)
			})
		})
		
	})
}

function mailAttachmentConversion(decodedAttachment, emailList){

	$.post('/notif/scanEmailAttach', {
		emailList:emailList,
		attachUrl:decodedAttachment.fileName
	}).then(function(){

	})
	// $.post('/sign-s3', {
	// 	fileName:decodedAttachment.fileName,
	// 	fileType:decodedAttachment.type
	// }).then(function(returnData){
	// 	console.log(returnData)


		// const xhr = new XMLHttpRequest();
		// xhr.open('PUT', returnData.url);
		// console.log('decodedAttachment:')
		// console.log(decodedAttachment)
		// xhr.onreadystatechange = function(){

		// if(xhr.readyState === 4){
		//   	if(xhr.status === 200){
		// 	    console.log('uploaded file')

			   
		//   	}else{
		//     	alert('Could not upload file.');
		//   	}
		// }
		// };
		// xhr.send(decodedAttachment);
	// })

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


