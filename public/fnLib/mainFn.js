function getSunday(d){

			var d = new Date(d);
			var diff = d.getDate() - d.getDay();
			
			return new Date(d.setDate(diff));

		}

Date.prototype.toFullDate = function(){
		var d = {
			month:this.getMonth(), 
			date:this.getDate(),
			year:this.getFullYear()
				}
		if (this.getMonth()<10){d.month = '0' + (this.getMonth()+1)}
		if (this.getDate() <10){d.date = '0' + this.getDate()}
		d.year
		return (d.month +'/'+d.date+'/'+d.year)
	}
Date.prototype.toTracerDate = function(){
		var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
		var d = {
			month:month[this.getMonth()-1], 
			date:this.getDate(),
			year:this.getFullYear(),
			hour:this.getHours(),
			min:this.getMinutes(),
			sec:this.getSeconds()
		}
		return (d.month +' '+d.date+' @ '+ d.hour + ':'+d.min+':'+d.sec)
	}

Date.prototype.toShortDate = function(){
		var day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
		var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
		var d = {
			day:day[this.getDay()],
			month:month[this.getMonth()], 
			date:this.getDate(),
			year:this.getFullYear(),
			hour:this.getHours(),
			min:this.getMinutes(),
			sec:this.getSeconds()
		}
		return (d.day+'<br>'+d.month +'&nbsp'+d.date+', '+d.year)
	};
moment.fn.FullDate = function () {
	return "xxxx"
}

moment.updateLocale('en', {
    calendar : {
        lastDay : '[Yesterday @] LT',
        sameDay : '[Today @] LT',
        nextDay : '[Tomorrow @] LT',
        lastWeek : '[Last] dddd [@] LT',
        nextWeek : 'dddd [@] LT',
        sameElse : 'MMMM D [@] LT'
    }
});

moment.updateLocale('en', {
    timeIdPostImage : {
        lastDay : '[Yesterday @] LT',
        sameDay : '[Today @] LT',
        nextDay : '[Tomorrow @] LT',
        lastWeek : '[Last] dddd [@] LT',
        nextWeek : 'dddd [@] LT',
        sameElse : 'MMMM D [@] LT'
    }
});

function ValidateEmail(email) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
  {
    return (true)
  }
    return (email)
}


function closeRedIcon(divToRemove, parentDiv){
	var span = document.createElement('span')
	span.innerHTML = '';
	span.style.color = 'red'
	span.style.float = 'right'
	span.className = "glyphicon glyphicon-remove-circle"
	span.id = 'delGly';
	//- click the 'x' to remove from list
	span.addEventListener('click', function(){
		divToRemove.remove()
		
		
	});
	parentDiv.appendChild(span)
}

function mineTypeRef(fileExt){

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
		htm :'text/html',
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
		mpkg	:'application/vnd/apple.installer+xml',
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
		pptx:'application/vndopenxmlformats-officedocumentpresentationmlpresentation',
		rar	:'application/x-rar-compressed',
		rtf	:'application/rtf',
		sh	:'application/x-sh',
		svg	:'image/svg+xml',
		swf	:'application/x-shockwave-flash',
		tar	:'application/x-tar',
		tif :'image/tiff',
		tiff:'image/tiff',
		ts	:'application/typescript',
		ttf	:'font/ttf',
		vsd	:'application/vndvisio',
		wav	:'audio/x-wav',
		weba:'audio/webm',
		webm:'video/webm',
		webp:'image/webp',
		woff:'font/woff',
		woff2:'font/woff2',
		xhtml:'application/xhtml+xml',
		xls	:'application/vndms-excel',
		xlsx:'application/vndopenxmlformats-officedocumentspreadsheetmlsheet',
		xml:'application/xml',
		xul:'application/vndmozillaxul+xml',
		zip:'application/zip',
		'3gp':	'video/3gpp',
		'3g2':	'video/3gpp2',
		'7z':	'application/x-7z-compressed'

	}

	return mimeTypeRef(fileExt)

}