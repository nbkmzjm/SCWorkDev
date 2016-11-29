module.exports = function(sequelize, DataTypes) {

	return sequelize.define('comment', {
		// PTODate: {
		// 	type: DataTypes.DATE,
		// 	allowNull: false
			
		// },
		reaction: {
			type: DataTypes.STRING,
			allowNull: false			
			
		},
		comment: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [0, 999]	
			}
			
		},
		commentUser: {
			type: DataTypes.INTEGER,
			allowNull: false
			
		}



	})

};