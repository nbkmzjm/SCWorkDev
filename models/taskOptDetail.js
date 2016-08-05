module.exports = function(sequelize, DataTypes) {

	return sequelize.define('taskOptDetail', {
    	id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        taskDescription: {
            type: DataTypes.STRING, 
            allowNull: false
      	},
        checked:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        } 

	}, { timestamps: false})

};      