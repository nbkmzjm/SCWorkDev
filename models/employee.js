module.exports = function(sequelize, DataTypes) {

	var user = sequelize.define('employee', {
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},

		email: {
			type: DataTypes.STRING,
			allowNull: false
			
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				len: [5, 100]	
			}
		},


		title: {
			type: DataTypes.STRING,
			defaultValue: false
		},
		
	})
}