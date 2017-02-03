module.exports = function(sequelize, DataTypes) {

	return sequelize.define('endpoints', {
    	id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
       
        endpoint: {
            type: DataTypes.STRING(999), 
            allowNull: false,
            unique:true

      	}


	}, { timestamps: false})

};   