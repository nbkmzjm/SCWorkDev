module.exports = function(sequelize, DataTypes) {

	return sequelize.define('userGroups', {
		userId: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		groupId: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: 'ACTIVE',
			allowNull: false

		}



	}, { timestamps: false})

};