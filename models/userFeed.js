module.exports = function(sequelize, DataTypes) {

	return sequelize.define('userFeed', {
    	id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        mainPostId: {
            type: DataTypes.INTEGER, 
            allowNull: false
      	},
        receivedUserId:{
            type: DataTypes.INTEGER
        },
        status:{
            type: DataTypes.STRING
        },
        notification:{
            type: DataTypes.STRING
        }  

	})

};