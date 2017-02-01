module.exports = function(sequelize, DataTypes) {

	return sequelize.define('endpoint', {
    	id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        endpoint: {
            type: DataTypes.STRING, 
            allowNull: false,
            unique:true

      	}

	}, { timestamps: false})

};   