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
			allowNull: false,
			validate: {
				len: [1, 99]	
			}
			
		},

		Value: {
			type: DataTypes.STRING,
			defaultValue: '',
			validate: {
				len: [0, 99]	
			}
			
		},
		Comments: {
			type: DataTypes.STRING,
			defaultValue: '',
			validate: {
				len: [0, 255]	
			}
			
		},
		
		CompletedBy:{
			type: DataTypes.STRING,
			defaultValue: '0',
			validate: {
				len: [0, 25]	
			}
		}
		



	})

};