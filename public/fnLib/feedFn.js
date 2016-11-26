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