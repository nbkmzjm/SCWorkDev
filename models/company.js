module.exports = function(sequelize, DataTypes) {

	return sequelize.define('company', {
    	id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING, 
            allowNull: false
      	},
        address: {
            type: DataTypes.STRING
            
        }

	}, { timestamps: false})

};  