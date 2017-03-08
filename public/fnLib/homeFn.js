function calendarPick(){


			// <ul class="pager">
  	// 			<li><a href="#">Previous</a></li>
			//   	<li><a href="#">Next</a></li>
			// </ul>

	var calenderPick = $('#calendarPick');
	//- calenderPick.html("");

	
	
	var ul = document.createElement('ul')
	ul.className = 'pager'	


		var MBackward = document.createElement('li');
				var a = document.createElement('a')
				// a.href = "#"
				
				MBackward.appendChild(a)
					var span = document.createElement('span');
					span.className = 'glyphicon glyphicon-step-backward'
				a.appendChild(span)
				a.appendChild(document.createTextNode('Month'))
			MBackward.addEventListener('click', function(){
				$('#eventActionTable').length>0 ? 
				$('#eventActionTable').remove():'';

				var dateM7 = moment(dateCalender.value,'MM-DD-YYYY');
				dateM7.subtract(30, 'days');
				dateCalender.value = dateM7.format('MM-DD-YYYY')
				$.getJSON('/ajaxUser', {clickedData:true}).done(mainSC);

			})
		ul.appendChild(MBackward)

		var dateBackward = document.createElement('li');
				var a = document.createElement('a')
				// a.href = "#"
				
				dateBackward.appendChild(a)
					var span = document.createElement('span');
					span.className = 'glyphicon glyphicon-step-backward'
				a.appendChild(span)
				a.appendChild(document.createTextNode('Week'))
			dateBackward.addEventListener('click', function(){
				$('#eventActionTable').length>0 ? 
				$('#eventActionTable').remove():'';

			var dateM7 = moment(dateCalender.value,'MM-DD-YYYY');
			dateM7.subtract(7, 'days');
			dateCalender.value = dateM7.format('MM-DD-YYYY')
			$.getJSON('/ajaxUser', {clickedData:true}).done(mainSC);

			})
		ul.appendChild(dateBackward)


		var li = document.createElement('li');
			var a = document.createElement('a')
				// a.href = "#"
					var dateCalender = document.createElement('input');
					dateCalender.id = 'calendar';
					dateCalender.setAttribute('readonly', true)
					// dateCalender.type = 'hidden'
					dateCalender.style.textAlign = 'center'
					dateCalender.style.fontWeight = 'bold'
					dateCalender.style.width = '125px'
					dateCalender.style.fontSize = '120%'
					dateCalender.style.border = '2px transparent'
					dateCalender.value = moment().format('MM-DD-YYYY')
				a.appendChild(dateCalender)
			li.appendChild(a)
			var span = document.createElement('span');
			span.className = 'glyphicon glyphicon-calendar'
			li.appendChild(span)
		
			li.addEventListener('click', function(){
				// $("#calendar").blur()
				$('#eventActionTable').length>0 ? 
				$('#eventActionTable').remove():'';
				$("#calendar").datepicker({
					// beforeShow: function(){
					// 	// alert('blco')
					// 	$("#calendar").blur()
					// },
					onSelect: function(){
						$.getJSON('/ajaxUser').done(mainSC);
					}
					
				});

				dateCalender.focus()

			})
			
		ul.appendChild(li)

		var home = document.createElement('li');
				var a = document.createElement('a')
				// a.href = "#"
				home.appendChild(a)
					var span = document.createElement('span');
					// span.className = 'glyphicon glyphicon-select'
					span.appendChild(document.createTextNode('TODAY'))
				a.appendChild(span)
			home.addEventListener('click', function(){
				$('#eventActionTable').length>0 ? 
				$('#eventActionTable').remove():'';
				window.location.reload()
			})
		ul.appendChild(home)
			
		var refesh = document.createElement('li');
				var a = document.createElement('a')
				a.appendChild(document.createTextNode('SELECT'))
				// a.href = "#"
				refesh.appendChild(a)
					var span = document.createElement('span');

					span.className = 'glyphicon glyphicon-bookmark'
				a.appendChild(span)
			refesh.addEventListener('click', function(){
			$('#eventActionTable').length>0 ? 
			$('#eventActionTable').remove():'';
			document.getElementById('SELECT').checked = true
				activeOptionText('SELECT')
			$("#ulCheckedMemo").remove()

			var date = moment(dateCalender.value,'MM-DD-YYYY');
			
			dateCalender.value = date.format('MM-DD-YYYY')
			$.getJSON('/ajaxUser', {clickedData:true}).done(mainSC);

			})
		ul.appendChild(refesh)

		var dateForward = document.createElement('li');
				var a = document.createElement('a')
				// a.href = "#"
				a.appendChild(document.createTextNode('Week'))
				dateForward.appendChild(a)
					var span = document.createElement('span');
					span.className = 'glyphicon glyphicon-step-forward'
				a.appendChild(span)
			dateForward.addEventListener('click', function(){
			$('#eventActionTable').length>0 ? 
			$('#eventActionTable').remove():'';
			var dateM7 = moment(dateCalender.value,'MM-DD-YYYY');
			dateM7.add(7, 'days');
			dateCalender.value = dateM7.format('MM-DD-YYYY')
			$.getJSON('/ajaxUser', {clickedData:true}).done(mainSC);

			})
		ul.appendChild(dateForward)


		var MForward = document.createElement('li');
				var a = document.createElement('a')
				// a.href = "#"
				a.appendChild(document.createTextNode('Month'))
				MForward.appendChild(a)
					var span = document.createElement('span');
					span.className = 'glyphicon glyphicon-step-forward'
				a.appendChild(span)
				
			MForward.addEventListener('click', function(){
				$('#eventActionTable').length>0 ? 
				$('#eventActionTable').remove():'';

				var dateM7 = moment(dateCalender.value,'MM-DD-YYYY');
				dateM7.add(30, 'days');
				dateCalender.value = dateM7.format('MM-DD-YYYY')
				$.getJSON('/ajaxUser', {clickedData:true}).done(mainSC);

			})
			ul.appendChild(MForward)



		// var dateForward = document.createElement('span');
		// 	dateForward.id = 'dateForward';
		// 	dateForward.className = 'glyphicon glyphicon-step-forward'
		// 	dateForward.addEventListener('click', function(){

			
		// 	var dateP7 = new Date(dateCalender.value);
		// 	dateP7.setDate(dateP7.getDate()+7);
		// 	dateCalender.value = dateP7.toLocaleDateString();
		// 	$.getJSON('/ajaxUser', {clickedData:true}).done(mainSC);

		// 	})

	calenderPick.append(ul)
	// calenderPick.append(dateCalender)
	// calenderPick.append(dateForward)

	
}

function activeOptionText(x){
		var span = document.createElement('span')
		span.className = 'glyphicon glyphicon-edit'
		span.innerHTML = x
		span.style.backgroundColor = 'yellow'
		var optionText = document.getElementById('optionTextS')
		optionText.replaceChild(span, optionText.childNodes[1])
		

		var span1 = document.createElement('span')
		span1.className = 'glyphicon glyphicon-edit'
		span1.innerHTML = x
		span1.style.backgroundColor = 'yellow'
		var optionText1 = document.getElementById('optionTextL')
		optionText1.replaceChild(span1, optionText1.childNodes[1])

}

		
		
function noteColor(assignNote, element){
	if (assignNote.indexOf('PTO-A')!==-1){
		element.style.color = 'green'
	}else if(assignNote.indexOf('PTO-R')!==-1){
		element.style.color = '#ED9907'
	}else if(assignNote.indexOf('OFF')!==-1){
		element.style.color = '#9FAAA3'
	}else{
		element.style.color = 'blue'
	}
}

var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}

function clearEvent(sDate, eDate){
	$.post('clearEvent',{
		sDate:sDate,
		eDate:eDate
	})

}

function dateSCSubmit(memo, type, userId, dateSC, taskSC, td, detailListArr){

	
	$.post('/dateSC', {
		postdata:{
			userId: userId, 
			dateSC:dateSC, 
			taskSC:taskSC, 
			memo:memo,
			type:type,
			detailListArr:detailListArr
		}
	}).done(function(pData){
		if(!!pData.Note){
			td.innerHTML=pData.Note;
			td.style.backgroundColor = 'yellow'
		} 
	});
}


function scOverview (parentDiv){
	var divSCOverview = document.createElement('div')
	divSCOverview.id = 'divSCOverview'
	divSCOverview.style.top = event.clientY-185+'px'

		var p = document.createElement('p')
		p.innerHTML = this.innerHTML
		divSCOverview.appendChild(p)
	divSCOverview.addEventListener('dblclick', function(){
		this.remove()
	})
	divSCOverview.addEventListener('mouseenter', function(){
		this.style.zIndex = '0'
	})
	divSCOverview.addEventListener('mousedown', function(){
		
		this.style.position = 'absolute'
		var self = this
		document.onmousemove = function(event){
			self.style.left = event.pageX-80+'px'
			self.style.top = event.pageY-215+'px'
		}

		this.onmouseup = function() {
			self.style.zIndex = '1'
			console.log(self)
			document.onmousemove = null
		}
	})
	parentDiv.append(divSCOverview)
	

}