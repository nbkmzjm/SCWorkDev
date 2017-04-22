module.exports = function(sequelize, DataTypes) {

	return sequelize.define('taskOption', {
		// PTODate: {
		// 	type: DataTypes.DATE,
		// 	allowNull: false
			
		// },
		
		description: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 20]	
			}
			
		},
		category: {
			type: DataTypes.STRING,
			
			validate: {
				len: [0, 20]	
			}
			
		},
		departmentId:{
			type: DataTypes.INTEGER,
	        defaultValue:1
	    }

	}, { timestamps: false})

};