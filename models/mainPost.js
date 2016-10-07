module.exports = function(sequelize, DataTypes) {

	return sequelize.define('mainPost', {
    	id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        postText: {
            type: DataTypes.STRING, 
            allowNull: false
      	},
        postTo:{
            type: DataTypes.STRING
        },
        type:{
            type: DataTypes.STRING
        }

	})

};   