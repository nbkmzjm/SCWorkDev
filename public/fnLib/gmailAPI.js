function gmailAPI(){
	$('#AdminMail').html('')
	var divMailContainer = document.createElement('div')

	var tableMail = document.createElement('table')
	tableMail.className = 'table table-sm'
	tableMail.id = 'tblMail'
		var theadMail= document.createElement('thead')
			var trHeadMail = document.createElement('tr')
				var headerMail = ['From','Preview', 'Recieved']
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
				var tbodyMail = document.createElement('tbody')
					var trMail = document.createElement('tr')
						

						var headers = message.payload.headers
						headers.forEach(function(header){
							if(header.name === "From"){
								var tdFrom = document.createElement('td')
								tdFrom.innerHTML = header.value
								trMail.appendChild(tdFrom)
							}
						})
						headers.forEach(function(header){
							if (header.name === "Subject"){
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

						// var tdSnippet = document.createElement('td')
						// tdSnippet.innerHTML = message.snippet
						// trMail.appendChild(tdSnippet)
						
					tbodyMail.appendChild(trMail)
				tableMail.appendChild(tbodyMail)
			})
		})
		
	})
}


