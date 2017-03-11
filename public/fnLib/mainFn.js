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