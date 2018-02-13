// Async function

var array = [1,2,3,4]
function delay(){
	return new Promise(function(resolve){
		setTimeout(resolve,3000)
	})
}

async function processArray(array){
	
	for(const item of array){
		console.log('waiting...')
		await delay()
		console.log(item)

	}

}

//- var Excel = new ActiveXObject("Excel.Application");
//- var ExcelSheet = new ActiveXObject("Excel.Sheet"); 
//-      Excel.Visible = true;
//-      Excel.Workbooks.Open("https://scworkdevx.s3.amazonaws.com/05261512479450CompensationProrationModelingTool.xlsx");