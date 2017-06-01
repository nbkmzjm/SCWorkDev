module.exports = function(sequelize, DataTypes) {

	return sequelize.define('tagSave', {
    	id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        mainPostId: {
            type: DataTypes.INTEGER, 
            allowNull: false
      	},
        tagName:{
            type: DataTypes.STRING
        },
        type:{
            type: DataTypes.STRING
        },
        userId:{
            type: DataTypes.INTEGER
        }

	})

};