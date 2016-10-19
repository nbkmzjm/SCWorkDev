module.exports = function(sequelize, DataTypes) {

	return sequelize.define('group', {
    	id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING, 
            allowNull: false
      	},
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: 'active'
            
        },
        groupBLUserId:{
            type: DataTypes.INTEGER
        }

	}, { timestamps: false})

};   