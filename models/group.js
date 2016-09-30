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
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
            
        }

	}, { timestamps: false})

};   