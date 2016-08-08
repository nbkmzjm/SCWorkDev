module.exports = function(sequelize, DataTypes) {

	return sequelize.define('assignTracerDetail', {
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
		Description: {
			type: DataTypes.STRING,
			validate: {
				len: [1, 255]	
			}
			
		},

		Value: {
			type: DataTypes.STRING,
			
			
		},
		Comments: {
			type: DataTypes.STRING,
			
			
		},
		Admin Note: {
			type: DataTypes.STRING,
			
			
		},
		CompletedBy:{
			type: DataTypes.STRING,
		}
		



	})

};