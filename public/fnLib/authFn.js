function roleList(letterIndex){

	var roleList = {}

	roleList.A = ['Administrator']
	roleList.B = ['Administrator', 'Superuser']
	roleList.C = ['Administrator', 'Superuser', 'User']

	return roleList[letterIndex]
}

function titleList(letterIndex){
	var titleList = {}
	titleList.A = ['Administrator']
	titleList.B = ['Administrator', 'Manager', 'Supervisor']
	titleList.C = ['Administrator', 'Manager', 'Supervisor','Pharmacist']
	titleList.D = ['Admin', 'Superuser', 'User']

	return titleList[letterIndex]
}


function getGreaterRole (role){

	var roleArray = [
		'Administrator',
		'Superuser',
		'User'
	]

	var index = roleArray.indexOf(role)
	var result = []
	for (var i=0; i<index; i++){
		result.push(roleArray[i])
	}

	return result


}

function getLesserRole (role){

	var roleArray = [
		'Administrator',
		'Superuser',
		'User'
	]

	var index = roleArray.indexOf(role)
	var result = []
	for (var i=roleArray.length-1; i>=index; i--){
		result.push(roleArray[i])
	}

	return result


}
