function tagManagerTabClick(){
	$('#TagManager').html('')
	//TAG Filter
	var divTagFilter = document.createElement('div')
	
	
	divTagFilter.style.clear = 'both'
	divTagFilter.className = 'form-group col-sm-12'

		// DIV contain label for VIEW FILTER
		var labelViewFormat = document.createElement('label')
		labelViewFormat.className = 'col-sm-1'
		labelViewFormat.innerHTML = 'View Format '
		divTagFilter.appendChild(labelViewFormat)


		// DIV contain selections for VIEW FILTER
		var divViewFormat = document.createElement('div')
		divViewFormat.className = 'col-sm-2'

			//List option from the Array 
			var selectViewFormat = document.createElement('select')
			selectViewFormat.className = 'form-control'
				var optionList = ['Panel', 'List']
				optionList.forEach(function(item){
					var optionDB = document.createElement('option')
					optionDB.value = item
					optionDB.innerHTML = item
					selectViewFormat.appendChild(optionDB)
				})

			
			divViewFormat.appendChild(selectViewFormat)
		divTagFilter.appendChild(divViewFormat)

		// DIV contain label for Post Size
		var postSizeLable = document.createElement('label')
		postSizeLable.className = 'col-sm-1'
		postSizeLable.innerHTML = 'Post Size:'
		divTagFilter.appendChild(postSizeLable)

		// DIV contain selections for Post Size
		var divPostSize = document.createElement('div')
		divPostSize.className = 'col-sm-2'

			//List option from the Array 
			var postSizeOpt = document.createElement('select')
			postSizeOpt.className = 'form-control'
			postSizeOpt.name = 'postSize'
				var optionListSize = ['Medium','Small','Large']

				optionListSize.forEach(function(item, i){
					var optionSize = document.createElement('option')
					optionSize.value = item
					optionSize.innerHTML = item
					postSizeOpt.appendChild(optionSize)
				})
			
			divPostSize.appendChild(postSizeOpt)
		divTagFilter.appendChild(divPostSize)
	$('#TagManager').append(divTagFilter)

	var divTagFilter = document.createElement('div')
	divTagFilter.id = 'divTagFilter'
	
		var divTHContainer = document.createElement('div')
		divTHContainer.className = 'typeahead__container'
			divTHContainer.style.maxWidth = '500px'
			var divTHField = document.createElement('div')
			divTHField.className = 'typeahead__field'
				spanTH = document.createElement('span')
				spanTH.className = 'typeahead__query'
	
					var input = document.createElement('input')
					
					input.className ='js-typeahead-tagPost form-control'
					input.id = 'tagPost'
					input.placeholder = 'Search Tag'
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
	$('#TagManager').append(divTagFilter)

	$.typeahead({
	    input: '.js-typeahead-tagPost',
	    minLength:0, maxItem: 50, offset: false, order: "acs",
	   
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
	    dropdownFilter:[{
	    	key:'type',
	    	template: '<strong>{{type}}</strong>',
			all: 'ALL'
	    }],
	    source: {
            tagSave:{
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
	            $('#divPostContainer').remove()
	            var divPostContainer = document.createElement('div')
					divPostContainer.id = 'divPostContainer'
					divPostContainer.style ='text-align: center;'
					$('#TagManager').append(divPostContainer)
				console.log(divPostContainer)
	            getPostDB({
	            	tagName:item.tagName, 
	            	tagType:item.type,
	            	tagCategory:item.category,
	            	postSize:postSizeOpt.value,
	            	viewFormat:selectViewFormat.value
	            })
	            $('#tagPost').blur();

	 
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

	






	// 	var divTagView = document.createElement('div')

	// 	divTagFilter.appendChild(divTagView)

	// $('#divPostContainer').append(divTagFilter)

}