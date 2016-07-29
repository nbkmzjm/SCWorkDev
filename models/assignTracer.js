module.exports = function(sequelize, DataTypes) {

	return sequelize.define('assignTracer', {
		// PTODate: {
		// 	type: DataTypes.DATE,
		// 	allowNull: false
			
		// },
		// user: {
		// 	type: DataTypes.INTEGER,
		// 	allowNull: false,
		// 	validate:{
		// 		isDate:true
		// 	}
			
		// },
		Note: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [1, 25]	
			}
			
		},
		Memo: {
			type: DataTypes.STRING,
			allowNull: true,
			
			
		}
		,
		Read:{
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		type:{
	        type:DataTypes.STRING,
	        defaultValue: 'SCHEDULE',
	        allowNull: false
	    }
		



	})

};

