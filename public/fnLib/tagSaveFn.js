function tagManagerTabClick(){
	$('#TagManager').html('')
	//TAG Filter

	var divTagFilter = document.createElement('div')
		var divTHContainer = document.createElement('div')
		divTHContainer.className = 'typeahead__container'
			divTHContainer.style.maxWidth = '500px'
			var divTHField = document.createElement('div')
			divTHField.className = 'typeahead__field'
				spanTH = document.createElement('span')
				spanTH.className = 'typeahead__query'
	
					var input = document.createElement('input')
					
					input.className ='js-typeahead-tagPost'
					
					//- input.setAttribute('href','#');
					//- input.setAttribute('data-toggle','popover');
					//- input.setAttribute('data-trigger','hover');
					//- input.setAttribute('data-placement','auto');
					//- input.style.fontWeight = 'bold'
					//- input.setAttribute('title', 'Selected User');
					
					//popover selected users when hovering over the input search
					//- document.addEventListener('mousemove', function(){
					//- 	input.setAttribute('data-content', JSON.stringify(userSelected, null, 4).replace(/"/g,"").replace("[","").replace("]",""));
					//- 	$('[data-toggle="popover"]').popover({html:true})
						
					//- })
					spanTH.appendChild(input)
				divTHField.appendChild(spanTH)
			divTHContainer.appendChild(divTHField)
		divTagFilter.appendChild(divTHContainer)
	$('#TagManager').append(divTHContainer)

	$.typeahead({
	    input: '.js-typeahead-tagPost',
	    minLength:0, maxItem: 30, offset: false, order: "acs",
	    template:"{{tagName}} <small style='color:#999;'>{{type}}</small>",
	    searchOnFocus: true,
	    source: {
            tagSave:{
            	display:['tagName','type'],
	           	ajax: {
	           		type:'POST',
	                url: '/notif/getTagSave'
	            }
	        }
	    },
	    callback: {
	        onInit: function (node) {
	            console.log('Typeahead Initiated on ' + node.selector);
	        },
	        onNavigateAfter: function (node, lis, a, item, query, event) {
	            if (~[38,40].indexOf(event.keyCode)) {
	                var resultList = node.closest("form").find("ul.typeahead__list"),
	                    activeLi = lis.filter("li.active"),
	                    offsetTop = activeLi[0] && activeLi[0].offsetTop - (resultList.height() / 2) || 0;
	 
	                resultList.scrollTop(offsetTop);
	            }
	 
	        },
	        onClickAfter: function (node, a, item, event) {
	 
	            event.preventDefault();

	            getPostDB({tagName:item.tagName, tagType:item.type})
	 
	        },
	        onResult: function (node, query, result, resultCount) {
	            if (query === "") return;
	 
	            var text = "";
	            if (result.length > 0 && result.length < resultCount) {
	                text = "Showing <strong>" + result.length + "</strong> of <strong>" + resultCount + '</strong> elements matching "' + query + '"';
	            } else if (result.length > 0) {
	                text = 'Showing <strong>' + result.length + '</strong> elements matching "' + query + '"';
	            } else {
	                text = 'No results matching "' + query + '"';
	            }
	            $('#result-container').html(text);
	 
	        },
	        onMouseEnter: function (node, a, item, event) {
	 
	            if (item.group === "country") {
	                $(a).append('<span class="flag-chart flag-' + item.display.replace(' ', '-').toLowerCase() + '"></span>')
	            }
	 
	        },
	        onMouseLeave: function (node, a, item, event) {
	 
	            $(a).find('.flag-chart').remove();
	 
	        }

	    }
	});

	






		var divTagView = document.createElement('div')

		divTagFilter.appendChild(divTagView)

	$('#TagManager').append(divTagFilter)

}